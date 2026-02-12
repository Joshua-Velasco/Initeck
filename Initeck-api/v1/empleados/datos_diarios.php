<?php
// Headers CORS son manejados por Apache en .htaccess

// Manejar la petición "preflight" de los navegadores
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once '../../config/database.php';
$database = new Database();
$db = $database->getConnection();


// Captura de datos segura
$empleado_id = isset($_GET['empleado_id']) ? intval($_GET['empleado_id']) : 0;

// Soporte para rangos o fecha única (retrocompatibilidad)
if (isset($_GET['fecha_inicio']) && isset($_GET['fecha_fin'])) {
    $fechaInicio = $_GET['fecha_inicio'];
    $fechaFin = $_GET['fecha_fin'];
} elseif (isset($_GET['fecha'])) {
    // Si solo mandan "fecha", el rango es ese día -> ese día
    $fechaInicio = $_GET['fecha'];
    $fechaFin = $_GET['fecha'];
} else {
    // Default: Hoy
    $fechaInicio = date('Y-m-d');
    $fechaFin = date('Y-m-d');
}

if ($empleado_id <= 0) {
    echo json_encode([
        "status" => "error",
        "total_viajes" => 0,
        "total_gastos" => 0,
        "total_ingresos" => 0,
        "neto" => 0,
        "mensaje" => "ID de empleado inválido"
    ]);
    exit();
}

try {
    /**
     * Usamos COALESCE para evitar valores NULL si no hay registros ese día.
     * Sumamos monto_efectivo + propinas para obtener el ingreso bruto real.
     */
    $query = "SELECT 
                CAST(COALESCE(SUM(viajes), 0) AS UNSIGNED) as total_viajes, 
                COALESCE(SUM(gastos_total), 0) as total_gastos, 
                COALESCE(SUM(monto_efectivo), 0) as total_efectivo,
                COALESCE(SUM(propinas), 0) as total_propinas,
                COALESCE(SUM(monto_efectivo + COALESCE(propinas, 0)), 0) as total_ingresos,
                COALESCE(SUM(monto_efectivo) - SUM(gastos_total), 0) as neto
              FROM liquidaciones 
              WHERE empleado_id = :emp_id 
              AND fecha BETWEEN :inicio AND :fin";

    $stmt = $db->prepare($query);
    $stmt->execute([
        ':emp_id' => $empleado_id,
        ':inicio' => $fechaInicio,
        ':fin' => $fechaFin
    ]);

    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

    // Consulta secundaria: Transferencias (Depósitos) por fecha de inicio de semana
    $queryTrans = "SELECT COALESCE(SUM(monto), 0) as total_depositos 
                   FROM nomina_transferencias 
                   WHERE empleado_id = :emp_id 
                   AND fecha_inicio_semana BETWEEN :inicio AND :fin";
    $stmtTrans = $db->prepare($queryTrans);
    $stmtTrans->execute([
        ':emp_id' => $empleado_id,
        ':inicio' => $fechaInicio,
        ':fin' => $fechaFin
    ]);
    $resTrans = $stmtTrans->fetch(PDO::FETCH_ASSOC);
    $totalDepositos = (float) $resTrans['total_depositos'];

    // Respuesta limpia para el componente React
    echo json_encode([
        "status" => "success",
        "total_viajes" => (int) $resultado['total_viajes'],
        "total_gastos" => (float) $resultado['total_gastos'],
        "total_ingresos" => (float) $resultado['total_ingresos'],
        "total_depositos" => $totalDepositos, // NUEVO CAMPO
        "total_efectivo" => (float) $resultado['total_efectivo'],
        "total_propinas" => (float) $resultado['total_propinas'],
        "neto" => (float) $resultado['neto'],
        "debug" => [
            "id" => $empleado_id,
            "rango" => ["inicio" => $fechaInicio, "fin" => $fechaFin]
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "mensaje" => "Error en la base de datos",
        "detalle" => $e->getMessage()
    ]);
}