<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

try {
    $database = new Database();
    $pdo = $database->getConnection();
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error de base de datos']);
    exit;
}

// ── Migración automática: añadir vehiculo_id a liquidaciones si no existe ──
try {
    $cols = $pdo->query("SHOW COLUMNS FROM liquidaciones LIKE 'vehiculo_id'")->fetchAll();
    if (empty($cols)) {
        $pdo->exec("ALTER TABLE liquidaciones ADD COLUMN vehiculo_id INT NULL DEFAULT NULL AFTER empleado_id");
    }
} catch (PDOException $e) { /* ignorar */ }

$fechaInicio = $_GET['fecha_inicio'] ?? date('Y-01-01');
$fechaFin    = $_GET['fecha_fin']    ?? date('Y-12-31');

try {
    // ── 1. Empleados que tienen registros de gasolina en el período ──────────
    $stmtEmps = $pdo->prepare("
        SELECT DISTINCT
            e.id            AS empleado_id,
            e.nombre_completo AS empleado_nombre,
            e.vehiculo_id   AS vehiculo_actual_id,
            v_act.unidad_nombre AS vehiculo_actual_nombre,
            v_act.modelo    AS vehiculo_actual_modelo
        FROM liquidaciones l
        JOIN empleados  e     ON e.id = l.empleado_id
        LEFT JOIN vehiculos v_act ON v_act.id = e.vehiculo_id
        WHERE l.fecha BETWEEN :fi AND :ff
          AND l.detalles_gastos IS NOT NULL
          AND l.detalles_gastos NOT IN ('[]','','null')
        ORDER BY e.nombre_completo
    ");
    $stmtEmps->execute([':fi' => $fechaInicio, ':ff' => $fechaFin]);
    $empleados = $stmtEmps->fetchAll(PDO::FETCH_ASSOC);

    // ── 2. Para cada empleado, obtener sus registros de gasolina ─────────────
    $resultado      = [];
    $globalTotal    = 0;
    $globalRegistros = 0;

    foreach ($empleados as $emp) {
        $empId             = $emp['empleado_id'];
        $vehiculoActualId  = $emp['vehiculo_actual_id'];

        // Obtener todas las liquidaciones del empleado con gastos de combustible
        $stmtLiqs = $pdo->prepare("
            SELECT l.id, l.fecha, l.hora, l.detalles_gastos,
                   COALESCE(l.vehiculo_id, :veh_fallback) AS vehiculo_id,
                   v.unidad_nombre AS vehiculo_nombre,
                   v.modelo        AS vehiculo_modelo
            FROM liquidaciones l
            LEFT JOIN vehiculos v ON v.id = COALESCE(l.vehiculo_id, :veh_fallback2)
            WHERE l.empleado_id = :emp_id
              AND l.fecha BETWEEN :fi AND :ff
              AND l.detalles_gastos IS NOT NULL
              AND l.detalles_gastos NOT IN ('[]','','null')
            ORDER BY l.fecha ASC, l.hora ASC
        ");
        $stmtLiqs->execute([
            ':veh_fallback'  => $vehiculoActualId,
            ':veh_fallback2' => $vehiculoActualId,
            ':emp_id'        => $empId,
            ':fi'            => $fechaInicio,
            ':ff'            => $fechaFin,
        ]);
        $liquidaciones = $stmtLiqs->fetchAll(PDO::FETCH_ASSOC);

        // ── Agrupar por vehículo ─────────────────────────────────────────────
        $porVehiculo = []; // vehiculo_id => [ info, entradas[] ]

        foreach ($liquidaciones as $liq) {
            $detalles = json_decode($liq['detalles_gastos'], true);
            if (!is_array($detalles)) continue;

            foreach ($detalles as $gasto) {
                $tipo = strtolower($gasto['tipo'] ?? '');
                if ($tipo !== 'combustible' && $tipo !== 'gasolina') continue;

                $monto    = floatval($gasto['monto']    ?? 0);
                $odometro = floatval($gasto['odometro'] ?? 0);
                $vehId    = $liq['vehiculo_id'] ?: 0;

                if (!isset($porVehiculo[$vehId])) {
                    $porVehiculo[$vehId] = [
                        'vehiculo_id'      => $vehId,
                        'vehiculo_nombre'  => $liq['vehiculo_nombre'] ?? 'Sin unidad',
                        'vehiculo_modelo'  => $liq['vehiculo_modelo'] ?? '',
                        'es_vehiculo_actual' => ((int)$vehId === (int)$vehiculoActualId),
                        'entradas'         => [],
                        'total'            => 0,
                    ];
                }

                $porVehiculo[$vehId]['total'] += $monto;
                $porVehiculo[$vehId]['entradas'][] = [
                    'liq_id'   => $liq['id'],
                    'fecha'    => $liq['fecha'],
                    'hora'     => $liq['hora'],
                    'monto'    => $monto,
                    'odometro' => $odometro,
                ];
            }
        }

        if (empty($porVehiculo)) continue;

        // ── Calcular estadísticas por vehículo y construir resultado ─────────
        foreach ($porVehiculo as $vehId => $vehData) {
            $entradas = $vehData['entradas'];
            $totalVehiculo = $vehData['total'];

            // Eficiencia por intervalos
            $intervalos  = [];
            $kmTotales   = 0;
            $costoEfTotal = 0;

            for ($i = 1; $i < count($entradas); $i++) {
                $odoActual   = $entradas[$i]['odometro'];
                $odoAnterior = $entradas[$i - 1]['odometro'];
                $km = ($odoActual > 0 && $odoAnterior > 0 && $odoActual > $odoAnterior)
                    ? $odoActual - $odoAnterior : 0;

                if ($km > 0 && $km < 2000) {
                    $eficiencia  = $km / $entradas[$i]['monto'];
                    $intervalos[] = [
                        'fecha'      => $entradas[$i]['fecha'],
                        'km'         => $km,
                        'monto'      => $entradas[$i]['monto'],
                        'eficiencia' => round($eficiencia, 4),
                    ];
                    $kmTotales    += $km;
                    $costoEfTotal += $entradas[$i]['monto'];
                }
            }

            $eficienciaPromedio = $costoEfTotal > 0 ? $kmTotales / $costoEfTotal : null;

            $status = 'sin_datos';
            if ($eficienciaPromedio !== null) {
                if ($eficienciaPromedio >= 0.32) $status = 'bueno';
                elseif ($eficienciaPromedio >= 0.20) $status = 'regular';
                else $status = 'malo';
            }

            // Gasto mensual agrupado
            $porMes = [];
            foreach ($entradas as $e) {
                $mes = substr($e['fecha'], 0, 7);
                $porMes[$mes] = ($porMes[$mes] ?? 0) + $e['monto'];
            }
            ksort($porMes);
            $gastoMensual = [];
            foreach ($porMes as $mes => $total) {
                $gastoMensual[] = ['mes' => $mes, 'total' => round($total, 2)];
            }

            $globalTotal     += $totalVehiculo;
            $globalRegistros += count($entradas);

            $resultado[] = [
                'vehiculo_id'          => $vehId,
                'vehiculo_nombre'      => $vehData['vehiculo_nombre'],
                'vehiculo_modelo'      => $vehData['vehiculo_modelo'],
                'empleado_id'          => $empId,
                'empleado_nombre'      => $emp['empleado_nombre'],
                'es_vehiculo_actual'   => $vehData['es_vehiculo_actual'],
                'vehiculo_actual_id'   => $vehiculoActualId,
                'vehiculo_actual_nombre' => $emp['vehiculo_actual_nombre'],
                'total_gastado'        => round($totalVehiculo, 2),
                'cantidad_registros'   => count($entradas),
                'km_totales'           => round($kmTotales, 1),
                'eficiencia_promedio'  => $eficienciaPromedio !== null ? round($eficienciaPromedio, 4) : null,
                'eficiencia_status'    => $status,
                'gasto_mensual'        => $gastoMensual,
                'entradas'             => array_reverse($entradas),
                'intervalos'           => $intervalos,
            ];
        }
    }

    echo json_encode([
        'status'          => 'success',
        'fecha_inicio'    => $fechaInicio,
        'fecha_fin'       => $fechaFin,
        'total_global'    => round($globalTotal, 2),
        'total_registros' => $globalRegistros,
        'total_vehiculos' => count($resultado),
        'vehiculos'       => $resultado,
    ]);

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
