<?php
/**
 * agenda_con_capacidad.php
 * 
 * Obtiene la agenda general de viajes con indicador de carga por chofer.
 * Muestra visualmente qué chofer está saturado en cada franja horaria.
 * 
 * GET params:
 *   - dias (int, opcional): Cuántos días hacia adelante (default: 7)
 *   - ventana_minutos (int, opcional): Ventana para considerar "simultáneo" (default: 90)
 * 
 * Response:
 *   {
 *     success: true,
 *     trips: [ ... ],
 *     choferes: [ { codigo_chofer, nombre, unidad, max_viajes, activo } ],
 *     capacidad: { 
 *       "2024-04-15 14:00": { 
 *         "chofer_1": { viajes: 2, max: 3, saturado: false },
 *         "chofer_2": { viajes: 3, max: 3, saturado: true }
 *       }
 *     }
 *   }
 */

require_once 'db_config.php';

$dias = isset($_GET['dias']) ? (int)$_GET['dias'] : 7;
$ventanaMinutos = isset($_GET['ventana_minutos']) ? (int)$_GET['ventana_minutos'] : 90;

// Fecha límite
$fechaLimite = new DateTime();
$fechaLimite->modify("+{$dias} days");
$fechaLimiteStr = $fechaLimite->format('Y-m-d H:i:s');
$fechaAhora = date('Y-m-d H:i:s');

try {
    // 1. Obtener todos los choferes registrados con sus config
    // Detectamos choferes por: tienen vehículo asignado O su rol indica que son conductores
    $choferesStmt = $conn->query("
        SELECT 
            e.id AS empleado_id,
            e.nombre_completo,
            e.telefono,
            COALESCE(u.usuario, CONCAT('emp_', e.id)) AS codigo_chofer,
            v.unidad_nombre,
            v.placas,
            COALESCE(cc.max_viajes_simultaneos, 3) AS max_viajes,
            COALESCE(cc.ventana_minutos, 90) AS ventana_minutos,
            COALESCE(cc.activo, 1) AS activo
        FROM empleados e
        LEFT JOIN usuarios u ON e.id = u.empleado_id
        LEFT JOIN vehiculos v ON e.vehiculo_id = v.id
        LEFT JOIN safar_chofer_config cc ON COALESCE(u.usuario, CONCAT('emp_', e.id)) COLLATE utf8mb4_general_ci = cc.codigo_chofer COLLATE utf8mb4_general_ci
        WHERE e.rol IN ('admin', 'employee', 'operator', 'chofer', 'conductor', 'driver', 'campo')
          AND e.vehiculo_id IS NOT NULL
        ORDER BY e.nombre_completo
    ");
    $choferes = $choferesStmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Obtener todos los viajes próximos con asignación
    $tripsStmt = $conn->prepare("
        SELECT
            os.IdOrdenServicio,
            os.Folio,
            os.FechaProgramadaInicio,
            os.MontoBase,
            os.MontoFinal,
            os.MontoDeposito,
            os.MetodoPago,
            os.EstatusPago,
            os.CodigoEstatus,
            os.Distancia,
            os.TiempoEstimado,
            ds.DireccionOrigen,
            ds.DireccionDestino,
            ds.LatitudOrigen,
            ds.LongitudOrigen,
            ds.LatitudDestino,
            ds.LongitudDestino,
            ds.IdDestino,
            rp.GeoJSON_Ruta,
            COALESCE(e_cli.nombre_completo, u_cli.usuario) AS NombreCliente,
            dca.CodigoUsuarioChofer,
            e_chofer.nombre_completo AS NombreChofer,
            v_chofer.unidad_nombre AS UnidadChofer
        FROM safar_ordenservicio os
        LEFT JOIN safar_destinoservicio ds
            ON os.IdOrdenServicio = ds.IdOrdenServicio AND ds.Secuencia = 1
        LEFT JOIN safar_rutapropuesta rp
            ON os.IdOrdenServicio = rp.IdOrdenServicio AND rp.EsRutaUsuario = 1
        LEFT JOIN usuarios u_cli
            ON os.CodigoUsuarioCliente = u_cli.usuario
        LEFT JOIN empleados e_cli
            ON u_cli.empleado_id = e_cli.id
        LEFT JOIN safar_destinochoferasignado dca
            ON ds.IdDestino = dca.IdDestino
        LEFT JOIN usuarios u_chofer
            ON dca.CodigoUsuarioChofer = u_chofer.usuario
        LEFT JOIN empleados e_chofer
            ON u_chofer.empleado_id = e_chofer.id
        LEFT JOIN vehiculos v_chofer
            ON e_chofer.vehiculo_id = v_chofer.id
        WHERE os.CodigoEstatus NOT IN ('CANCELADO', 'COMPLETADO')
          AND os.FechaProgramadaInicio >= :ahora
          AND os.FechaProgramadaInicio <= :limite
        ORDER BY os.FechaProgramadaInicio ASC
    ");
    $tripsStmt->bindParam(':ahora', $fechaAhora);
    $tripsStmt->bindParam(':limite', $fechaLimiteStr);
    $tripsStmt->execute();
    $trips = $tripsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Decode GeoJSON
    foreach ($trips as &$trip) {
        if (!empty($trip['GeoJSON_Ruta'])) {
            $decoded = json_decode($trip['GeoJSON_Ruta']);
            $trip['GeoJSON_Ruta'] = $decoded ?: null;
        }
    }
    unset($trip);

    // 3. Calcular capacidad por chofer por franja horaria
    $capacidad = [];
    
    // Agrupar viajes por chofer y fecha
    $viajesPorChofer = [];
    foreach ($trips as $trip) {
        $chofer = $trip['CodigoUsuarioChofer'];
        if ($chofer) {
            $fecha = $trip['FechaProgramadaInicio'];
            if (!isset($viajesPorChofer[$chofer])) {
                $viajesPorChofer[$chofer] = [];
            }
            $viajesPorChofer[$chofer][] = $fecha;
        }
    }

    // Para cada viaje, calcular cuántos tiene cada chofer en la ventana
    foreach ($trips as $trip) {
        $fechaViaje = $trip['FechaProgramadaInicio'];
        $fechaKey = date('Y-m-d H:i', strtotime($fechaViaje));
        
        if (!isset($capacidad[$fechaKey])) {
            $capacidad[$fechaKey] = [];
        }

        foreach ($choferes as $chofer) {
            $codigoChofer = $chofer['codigo_chofer'];
            if (!isset($capacidad[$fechaKey][$codigoChofer])) {
                // Contar viajes de este chofer en la ventana de tiempo
                $viajesEnVentana = 0;
                if (isset($viajesPorChofer[$codigoChofer])) {
                    foreach ($viajesPorChofer[$codigoChofer] as $otraFecha) {
                        $diff = abs(strtotime($otraFecha) - strtotime($fechaViaje));
                        $diffMinutos = $diff / 60;
                        if ($diffMinutos <= $ventanaMinutos) {
                            $viajesEnVentana++;
                        }
                    }
                }
                
                $capacidad[$fechaKey][$codigoChofer] = [
                    'viajes' => $viajesEnVentana,
                    'max' => (int)$chofer['max_viajes'],
                    'saturado' => $viajesEnVentana >= (int)$chofer['max_viajes'],
                    'nombre' => $chofer['nombre_completo'],
                    'unidad' => $chofer['unidad_nombre']
                ];
            }
        }
    }

    echo json_encode([
        "success" => true,
        "trips" => $trips,
        "choferes" => $choferes,
        "capacidad" => $capacidad,
        "total_choferes" => count($choferes),
        "total_viajes" => count($trips),
        "ventana_minutos" => $ventanaMinutos
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error de base de datos: " . $e->getMessage()]);
}
?>
