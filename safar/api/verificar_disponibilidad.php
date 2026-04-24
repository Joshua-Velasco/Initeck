<?php
/**
 * verificar_disponibilidad.php
 * 
 * Verifica disponibilidad de choferes para una fecha/hora específica.
 * El cliente puede ver qué choferes están disponibles y su carga actual.
 * 
 * GET params:
 *   - fecha (requerido): 'YYYY-MM-DD HH:MM:SS' o 'YYYY-MM-DD'
 *   - ventana_minutos (opcional): Ventana para considerar "simultáneo" (default: 90)
 * 
 * Response:
 *   {
 *     success: true,
 *     fecha: '2024-04-15 15:00:00',
 *     total_choferes: 5,
 *     choferes: [
 *       {
 *         codigo_chofer: 'chofer_001',
 *         nombre: 'Juan Pérez',
 *         unidad: 'MAZDA 3 [ABC-123]',
 *         viajes_en_ventana: 2,
 *         max_viajes: 3,
 *         disponible: true,
 *         porcentaje_carga: 67
 *       },
 *       ...
 *     ],
 *     recomendacion: 'chofer_002' // chofer con menor carga
 *   }
 */

ob_start(); // captura cualquier warning/notice de PHP para no corromper JSON
require_once 'db_config.php';

if (!isset($_GET['fecha'])) {
    echo json_encode(["success" => false, "message" => "Parámetro 'fecha' requerido (formato: YYYY-MM-DD HH:MM:SS o YYYY-MM-DD)."]);
    exit();
}

$fechaInput = $_GET['fecha'];
$ventanaMinutos = isset($_GET['ventana_minutos']) ? (int)$_GET['ventana_minutos'] : 90;

// Normalizar fecha
if (strlen($fechaInput) == 10) {
    // Solo fecha, agregar hora actual o 00:00:00
    $fechaCompleta = $fechaInput . ' 12:00:00';
} else {
    $fechaCompleta = $fechaInput;
}

$fechaDatetime = new DateTime($fechaCompleta);
$fechaStr = $fechaDatetime->format('Y-m-d H:i:s');

// Calcular ventana
$fechaInicio = clone $fechaDatetime;
$fechaInicio->modify("-" . ($ventanaMinutos / 2) . " minutes");
$fechaFin = clone $fechaDatetime;
$fechaFin->modify("+" . ($ventanaMinutos / 2) . " minutes");

$fechaInicioStr = $fechaInicio->format('Y-m-d H:i:s');
$fechaFinStr = $fechaFin->format('Y-m-d H:i:s');

try {
    // 1. Obtener todos los choferes disponibles
    $choferesStmt = $conn->query("
        SELECT 
            e.id AS empleado_id,
            e.nombre_completo,
            u.usuario AS codigo_chofer,
            v.unidad_nombre,
            v.placas,
            COALESCE(cc.max_viajes_simultaneos, 1) AS max_viajes
        FROM empleados e
        LEFT JOIN usuarios u ON e.id = u.empleado_id
        LEFT JOIN vehiculos v ON e.vehiculo_id = v.id
        LEFT JOIN safar_chofer_config cc ON COALESCE(u.usuario, CONCAT('emp_', e.id)) COLLATE utf8mb4_general_ci = cc.codigo_chofer COLLATE utf8mb4_general_ci
        WHERE e.rol IN ('admin', 'employee', 'operator', 'chofer', 'conductor', 'driver', 'campo')
          AND e.vehiculo_id IS NOT NULL
        ORDER BY e.nombre_completo
    ");
    $choferes = $choferesStmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Para cada chofer, contar viajes en la ventana de tiempo
    $resultado = [];
    $choferMenosCargado = null;
    $menorCarga = 999;

    foreach ($choferes as $chofer) {
        $codigoChofer = $chofer['codigo_chofer'];

        // Contar viajes activos en la ventana
        $countStmt = $conn->prepare("
            SELECT COUNT(*) AS total
            FROM safar_destinochoferasignado dca
            JOIN safar_destinoservicio ds ON dca.IdDestino = ds.IdDestino
            JOIN safar_ordenservicio os ON ds.IdOrdenServicio = os.IdOrdenServicio
            WHERE dca.CodigoUsuarioChofer = :chofer
              AND os.FechaProgramadaInicio BETWEEN :inicio AND :fin
              AND os.CodigoEstatus NOT IN ('CANCELADO', 'COMPLETADO')
        ");
        $countStmt->bindParam(':chofer', $codigoChofer);
        $countStmt->bindParam(':inicio', $fechaInicioStr);
        $countStmt->bindParam(':fin', $fechaFinStr);
        $countStmt->execute();
        $viajesEnVentana = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['total'];

        $maxViajes = (int)$chofer['max_viajes'];
        $disponible = $viajesEnVentana < $maxViajes;
        $porcentajeCarga = $maxViajes > 0 ? round(($viajesEnVentana / $maxViajes) * 100) : 100;

        $choferData = [
            'codigo_chofer' => $codigoChofer,
            'nombre' => $chofer['nombre_completo'],
            'unidad' => $chofer['unidad_nombre'] ? $chofer['unidad_nombre'] . (isset($chofer['placas']) ? ' [' . $chofer['placas'] . ']' : '') : 'Sin unidad',
            'viajes_en_ventana' => $viajesEnVentana,
            'max_viajes' => $maxViajes,
            'slots_disponibles' => max(0, $maxViajes - $viajesEnVentana),
            'disponible' => $disponible,
            'porcentaje_carga' => $porcentajeCarga
        ];

        $resultado[] = $choferData;

        // Encontrar chofer con menor carga (que esté disponible)
        if ($disponible && $viajesEnVentana < $menorCarga) {
            $menorCarga = $viajesEnVentana;
            $choferMenosCargado = $codigoChofer;
        }
    }

    ob_clean();
    echo json_encode([
        "success" => true,
        "fecha" => $fechaStr,
        "ventana_minutos" => $ventanaMinutos,
        "total_choferes" => count($resultado),
        "choferes" => $resultado,
        "recomendacion" => $choferMenosCargado
    ]);

} catch (PDOException $e) {
    ob_clean();
    echo json_encode(["success" => false, "message" => "Error de base de datos: " . $e->getMessage()]);
} catch (Exception $e) {
    ob_clean();
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>
