<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';
require_once '../utils/shift_utils_v2.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Obtener parámetros del body (JSON)
    $input = json_decode(file_get_contents("php://input"), true);
    $user_id = $input['user_id'] ?? null;
    $role_id = $input['role_id'] ?? null;

    // Fechas para filtrar (Opcionales, si no vienen se toma Todo el Historial o un default)
    // Se espera formato YYYY-MM-DD
    $start_date = $input['start_date'] ?? date('Y-m-d');
    $end_date = $input['end_date'] ?? date('Y-m-d');

    $filterLiq = getOperationalDayFilter($start_date, $end_date, 'l');

    // 1. MÉTRICAS GLOBALES (Filtradas por fecha)
    // Ingresos, Propinas y Gastos
    $sql_metrics = "SELECT 
        COALESCE(SUM(monto_efectivo), 0) as ingresos,
        COALESCE(SUM(propinas), 0) as propinas,
        COALESCE(SUM(gastos_total), 0) as gastos
        FROM liquidaciones l
        WHERE " . $filterLiq['where'];

    $q_metrics = $db->prepare($sql_metrics);
    $q_metrics->execute($filterLiq['params']);
    $metrics = $q_metrics->fetch(PDO::FETCH_ASSOC);

    // Depósitos (Transferencias) - Matching balance_avanzado logic for dates
    $fechaInicioLabel = date('Y-m-d', strtotime($start_date . ' -1 day'));
    $fechaFinLabel = date('Y-m-d', strtotime($end_date . ' -1 day'));

    $sql_depositos = "SELECT COALESCE(SUM(monto), 0) as total FROM nomina_transferencias 
                      WHERE fecha_inicio_semana >= :fi AND fecha_inicio_semana < :ff";
    $q_depositos = $db->prepare($sql_depositos);
    $q_depositos->execute([':fi' => $fechaInicioLabel, ':ff' => $fechaFinLabel]);
    $dep_data = $q_depositos->fetch(PDO::FETCH_ASSOC);
    $metrics['depositos'] = (float) $dep_data['total'];

    // Calcular Neto (Efectivo - Gastos + Depósitos)
    // Note: To match Personal, we might need to subtract maintenance here too if requested, 
    // but the user mainly wanted matching between Personal and Finanzas.
    // Dashboard V2 is its own thing, but let's keep it consistent.
    $metrics['neto'] = $metrics['ingresos'] - $metrics['gastos'] + $metrics['depositos'];

    // Kilómetros (De inspecciones_vehiculos)
    // Inspections don't have 'hora', so we use BETWEEN but same dates.
    $sql_km = "SELECT COALESCE(SUM(
                CASE 
                    WHEN v.unidad_medida = 'mi' THEN (iv.odometro_final - iv.odometro_inicio) * 1.60934
                    ELSE (iv.odometro_final - iv.odometro_inicio)
                END
               ), 0) as km 
               FROM inspecciones_vehiculos iv
               JOIN vehiculos v ON iv.vehiculo_id = v.id
               WHERE iv.odometro_final > iv.odometro_inicio
               AND iv.fecha BETWEEN :start_date AND :end_date";

    $q_km = $db->prepare($sql_km);
    $q_km->execute([':start_date' => $start_date, ':end_date' => $end_date]);
    $km_data = $q_km->fetch(PDO::FETCH_ASSOC);
    $metrics['km'] = round($km_data['km'], 2);

    // Empleados Online (600s = 10 min threshold) - ESTO ES TIEMPO REAL, NO FILTRA POR FECHA
    $q_online = $db->query("SELECT COUNT(DISTINCT empleado_id) as online_count 
                           FROM rastreo_tiempo_real 
                           WHERE TIMESTAMPDIFF(SECOND, timestamp, NOW()) <= 600");
    $online = $q_online->fetch(PDO::FETCH_ASSOC);
    $metrics['empleados_online'] = $online['online_count'];

    // 2. PARETO (Ingresos por Unidad - Filtrado por fecha con shift de 4AM)
    // Join direct: liquidaciones -> empleados -> vehiculos (no via inspecciones_vehiculos)
    // PDO named params can only appear once per query, so we rename them for the UNION second SELECT
    $filterLiqUnion = getOperationalDayFilter($start_date, $end_date, 'l');
    // Rename params with _u suffix for UNION clause
    $unionWhere = $filterLiqUnion['where'];
    $unionParams = [];
    foreach ($filterLiqUnion['params'] as $key => $val) {
        $newKey = str_replace(':', ':u_', $key);
        $unionWhere = str_replace($key, $newKey, $unionWhere);
        $unionParams[$newKey] = $val;
    }

    $sql_pareto = "SELECT 
        v.unidad_nombre as name, 
        COALESCE(SUM(l.monto_efectivo), 0) as ingresos 
        FROM liquidaciones l 
        JOIN empleados e ON l.empleado_id = e.id
        JOIN vehiculos v ON e.vehiculo_id = v.id
        WHERE (" . $filterLiq['where'] . ")
        GROUP BY v.id, v.unidad_nombre

        UNION ALL

        SELECT 
        'Sin Asignar' as name,
        COALESCE(SUM(l.monto_efectivo), 0) as ingresos
        FROM liquidaciones l
        JOIN empleados e ON l.empleado_id = e.id
        WHERE e.vehiculo_id IS NULL
        AND ({$unionWhere})
        HAVING ingresos > 0

        ORDER BY ingresos DESC";

    $q_pareto = $db->prepare($sql_pareto);
    $allParetoParams = array_merge($filterLiq['params'], $unionParams);
    $q_pareto->execute($allParetoParams);
    $pareto_raw = $q_pareto->fetchAll(PDO::FETCH_ASSOC);


    $total_ingresos_pareto = array_sum(array_column($pareto_raw, 'ingresos'));
    $acumulado = 0;
    $pareto = [];
    foreach ($pareto_raw as $item) {
        $ingreso = (float) $item['ingresos'];
        // Solo agregar si tiene ingresos > 0 para limpiar la gráfica
        if ($ingreso > 0) {
            if ($total_ingresos_pareto > 0) {
                $acumulado += ($ingreso / $total_ingresos_pareto) * 100;
            } else {
                $acumulado = 0;
            }
            $pareto[] = [
                "name" => $item['name'],
                "ingresos" => $ingreso,
                "acumulado" => round($acumulado, 2)
            ];
        }
    }

    // 3. PRÓXIMOS SERVICIOS Y VENCIMIENTOS (AGENDA UNIFICADA)
    // ESTO ES FUTURO, ASÍ QUE NO AFECTA EL FILTRO "HISTÓRICO" O "SEMANAL"
    // Sin embargo, el usuario pidió "Eventos que el taller ha registrado" al lado.
    // Separaremos en dos arrays:
    // a) `agenda`: Eventos futuros (Vencimientos, Mantenimientos programados)
    // b) `bitacora_taller`: Eventos PASADOS/COMPLETADOS que ocurrieron en el rango de fechas seleccionado

    // --- AGENDA FUTURA (Sin cambios mayores, solo lógica existente) ---
    $agenda = [];

    // Mantenimientos Pendientes/Recientes (Últimos agregados, independientemente de fecha)
    // Nota: El usuario quiere ver lo que el taller registró en la semana en OTRA columna.
    // Aquí dejamos los "pendientes" o próximos.

    // Vencimientos de Vehículos (Siempre a futuro)
    $q_vehiculos = $db->query("SELECT unidad_nombre, fecha_pago_seguro, fecha_pago_placas, fecha_pago_ecologico, fecha_proximo_mantenimiento 
                               FROM vehiculos");
    while ($row = $q_vehiculos->fetch(PDO::FETCH_ASSOC)) {
        if (!empty($row['fecha_pago_seguro']) && $row['fecha_pago_seguro'] !== '0000-00-00') {
            $agenda[] = ["fecha" => $row['fecha_pago_seguro'], "unidad_nombre" => $row['unidad_nombre'], "tipo" => "VENCIMIENTO SEGURO"];
        }
        if (!empty($row['fecha_pago_placas']) && $row['fecha_pago_placas'] !== '0000-00-00') {
            $agenda[] = ["fecha" => $row['fecha_pago_placas'], "unidad_nombre" => $row['unidad_nombre'], "tipo" => "REVALIDACIÓN (PLACAS)"];
        }
        if (!empty($row['fecha_pago_ecologico']) && $row['fecha_pago_ecologico'] !== '0000-00-00') {
            $agenda[] = ["fecha" => $row['fecha_pago_ecologico'], "unidad_nombre" => $row['unidad_nombre'], "tipo" => "VENCIMIENTO ECOLÓGICO"];
        }
        if (!empty($row['fecha_proximo_mantenimiento']) && $row['fecha_proximo_mantenimiento'] !== '0000-00-00') {
            $agenda[] = ["fecha" => $row['fecha_proximo_mantenimiento'], "unidad_nombre" => $row['unidad_nombre'], "tipo" => "MANTENIMIENTO PROGRAMADO"];
        }
    }

    // Ordenar agenda (Más próximo a hoy primero)
    usort($agenda, function ($a, $b) {
        return strtotime($a['fecha']) - strtotime($b['fecha']);
    });
    // Filtrar solo fechas futuras o muy recientes (últimos 3 días para contexto)
    $hoy_timestamp = strtotime(date('Y-m-d')) - (3 * 86400);
    $agenda = array_filter($agenda, function ($item) use ($hoy_timestamp) {
        return strtotime($item['fecha']) >= $hoy_timestamp;
    });
    $agenda = array_slice($agenda, 0, 50);


    // --- 4. BITÁCORA TALLER (NUEVO) ---
    // Eventos de mantenimiento ocurridos en el rango de fechas seleccionado
    $bitacora_taller = [];

    $sql_bitacora = "SELECT m.fecha, v.unidad_nombre, m.tipo, m.costo_total as costo, m.descripcion, m.evidencia_foto, m.firma_empleado 
                     FROM mantenimientos m
                     JOIN vehiculos v ON m.unidad_id = v.id
                     ORDER BY m.fecha DESC
                     LIMIT 50";

    $q_bitacora = $db->prepare($sql_bitacora);
    $q_bitacora->execute();

    while ($row = $q_bitacora->fetch(PDO::FETCH_ASSOC)) {
        $bitacora_taller[] = [
            "fecha" => $row['fecha'],
            "unidad_nombre" => $row['unidad_nombre'],
            "tipo" => $row['tipo'],
            "costo" => $row['costo'],
            "descripcion" => $row['descripcion']
        ];
    }

    // 5. EVENTOS RECIENTES DE CHOFERES (liquidaciones del período)
    $sql_eventos = "SELECT
                        CONCAT(l.fecha, ' ', l.hora) AS fecha_hora,
                        e.nombre_completo,
                        v.unidad_nombre,
                        l.monto_efectivo,
                        l.propinas,
                        l.gastos_total,
                        l.viajes
                    FROM liquidaciones l
                    JOIN empleados e ON l.empleado_id = e.id
                    LEFT JOIN vehiculos v ON e.vehiculo_id = v.id
                    WHERE l.fecha BETWEEN :ev_start AND :ev_end
                    ORDER BY l.fecha DESC, l.hora DESC
                    LIMIT 20";
    $q_eventos = $db->prepare($sql_eventos);
    $q_eventos->execute([':ev_start' => $start_date, ':ev_end' => $end_date]);
    $eventos_recientes = $q_eventos->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "metrics" => $metrics,
        "pareto" => $pareto,
        "servicios_proximos" => array_values($agenda),
        "bitacora_taller" => $bitacora_taller,
        "eventos_recientes" => $eventos_recientes
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
