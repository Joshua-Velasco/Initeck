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

try {
    $database = new Database();
    $db = $database->getConnection();

    // Obtener parámetros del body (JSON)
    $input = json_decode(file_get_contents("php://input"), true);
    $user_id = $input['user_id'] ?? null;
    $role_id = $input['role_id'] ?? null;

    // Fechas para filtrar (Opcionales, si no vienen se toma Todo el Historial o un default)
    // Se espera formato YYYY-MM-DD
    $start_date = $input['start_date'] ?? null;
    $end_date = $input['end_date'] ?? null;

    // Clausula WHERE para fechas (reutilizable)
    // Nota: liquidaciones tiene 'fecha', mantenimientos tiene 'fecha'
    $where_fecha_liq = "";
    $where_fecha_insp = "";
    $where_fecha_mant = "";
    $params_fecha = [];

    if ($start_date && $end_date) {
        $where_fecha_liq = " WHERE fecha BETWEEN :start_date AND :end_date ";
        $where_fecha_insp = " AND fecha BETWEEN :start_date AND :end_date "; // Se usa en queries que ya tienen WHERE
        $where_fecha_mant = " WHERE fecha BETWEEN :start_date AND :end_date ";

        $params_fecha[':start_date'] = $start_date;
        $params_fecha[':end_date'] = $end_date;
    }

    // 1. MÉTRICAS GLOBALES (Filtradas por fecha)
    // Ingresos, Propinas y Gastos
    $sql_metrics = "SELECT 
        COALESCE(SUM(monto_efectivo), 0) as ingresos,
        COALESCE(SUM(propinas), 0) as propinas,
        COALESCE(SUM(gastos_total), 0) as gastos
        FROM liquidaciones
        $where_fecha_liq";

    $q_metrics = $db->prepare($sql_metrics);
    if ($start_date && $end_date) {
        $q_metrics->bindParam(':start_date', $start_date);
        $q_metrics->bindParam(':end_date', $end_date);
    }
    $q_metrics->execute();
    $metrics = $q_metrics->fetch(PDO::FETCH_ASSOC);

    // Depósitos (Transferencias)
    $where_fecha_trans = "";
    if ($start_date && $end_date) {
        $where_fecha_trans = " WHERE DATE(fecha_ejecucion) BETWEEN :start_date AND :end_date ";
    }
    $sql_depositos = "SELECT COALESCE(SUM(monto), 0) as total FROM nomina_transferencias $where_fecha_trans";
    $q_depositos = $db->prepare($sql_depositos);
    if ($start_date && $end_date) {
        $q_depositos->bindParam(':start_date', $start_date);
        $q_depositos->bindParam(':end_date', $end_date);
    }
    $q_depositos->execute();
    $dep_data = $q_depositos->fetch(PDO::FETCH_ASSOC);
    $metrics['depositos'] = (float) $dep_data['total'];

    // Calcular Neto (Efectivo - Gastos + Depósitos)
    $metrics['neto'] = $metrics['ingresos'] - $metrics['gastos'] + $metrics['depositos'];

    // Kilómetros (De inspecciones_vehiculos)
    // Conversión automática: Si el vehículo está en millas (unidad_medida = 'mi'), convertimos a KM (* 1.60934)
    $sql_km = "SELECT COALESCE(SUM(
                CASE 
                    WHEN v.unidad_medida = 'mi' THEN (iv.odometro_final - iv.odometro_inicio) * 1.60934
                    ELSE (iv.odometro_final - iv.odometro_inicio)
                END
               ), 0) as km 
               FROM inspecciones_vehiculos iv
               JOIN vehiculos v ON iv.vehiculo_id = v.id
               WHERE iv.odometro_final > iv.odometro_inicio
               $where_fecha_insp";

    $q_km = $db->prepare($sql_km);
    if ($start_date && $end_date) {
        $q_km->bindParam(':start_date', $start_date);
        $q_km->bindParam(':end_date', $end_date);
    }
    $q_km->execute();
    $km_data = $q_km->fetch(PDO::FETCH_ASSOC);
    $metrics['km'] = round($km_data['km'], 2);

    // Empleados Online (600s = 10 min threshold) - ESTO ES TIEMPO REAL, NO FILTRA POR FECHA
    $q_online = $db->query("SELECT COUNT(DISTINCT empleado_id) as online_count 
                           FROM rastreo_tiempo_real 
                           WHERE TIMESTAMPDIFF(SECOND, timestamp, NOW()) <= 600");
    $online = $q_online->fetch(PDO::FETCH_ASSOC);
    $metrics['empleados_online'] = $online['online_count'];

    // 2. PARETO (Ingresos por Unidad - Filtrado por fecha)
    // Como liquidaciones no tiene vehiculo_id directamente, unimos con inspecciones_vehiculos
    $sql_pareto = "SELECT 
        v.unidad_nombre as name, 
        COALESCE(SUM(l.monto_efectivo), 0) as ingresos 
        FROM vehiculos v 
        LEFT JOIN inspecciones_vehiculos iv ON v.id = iv.vehiculo_id
        LEFT JOIN liquidaciones l ON iv.empleado_id = l.empleado_id AND iv.fecha = l.fecha
        WHERE 1=1 ";

    // Aplicamos filtro de fecha a la tabla Liquidaciones (l.fecha)
    if ($start_date && $end_date) {
        $sql_pareto .= " AND l.fecha BETWEEN :start_date AND :end_date ";
    }

    $sql_pareto .= " GROUP BY v.id ORDER BY ingresos DESC";

    $q_pareto = $db->prepare($sql_pareto);
    if ($start_date && $end_date) {
        $q_pareto->bindParam(':start_date', $start_date);
        $q_pareto->bindParam(':end_date', $end_date);
    }
    $q_pareto->execute();
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

    echo json_encode([
        "status" => "success",
        "metrics" => $metrics,
        "pareto" => $pareto,
        "servicios_proximos" => array_values($agenda),
        "bitacora_taller" => $bitacora_taller
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
