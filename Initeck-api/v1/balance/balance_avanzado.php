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
$database = new Database();
$db = $database->getConnection();

// Parameters
$periodo = $_GET['periodo'] ?? 'dia'; // dia, semana, mes, anio, custom
$fechaInicio = $_GET['fecha_inicio'] ?? date('Y-m-d');
$fechaFin = $_GET['fecha_fin'] ?? date('Y-m-d');

// Determine date range based on period ONLY if not provided
if (!isset($_GET['fecha_inicio']) || !isset($_GET['fecha_fin'])) {
    if ($periodo === 'semana') {
        $fechaInicio = date('Y-m-d', strtotime('monday this week'));
        $fechaFin = date('Y-m-d', strtotime('sunday this week'));
    } elseif ($periodo === 'mes') {
        $fechaInicio = date('Y-m-01');
        $fechaFin = date('Y-m-t');
    } elseif ($periodo === 'anio') {
        $fechaInicio = date('Y-01-01');
        $fechaFin = date('Y-12-31');
    }
}

// Helper function to calculate proportional cost based on period
function calcularCostoPeriodo($costoAnual, $periodo)
{
    $costo = floatval($costoAnual);
    switch ($periodo) {
        case 'dia':
            return $costo / 365;
        case 'semana':
            return $costo / 52;
        case 'mes':
            return $costo / 12;
        case 'anio':
        default:
            return $costo;
    }
}

try {
    // Unified Filters
    $filterLiqAgg = getOperationalDayFilter($fechaInicio, $fechaFin, 'l');
    $filterLiqDet = getOperationalDayFilter($fechaInicio, $fechaFin, 'l');
    $filterLiqGlobal = getOperationalDayFilter($fechaInicio, $fechaFin, 'l');

    // 1. Employee profitability (Grouped by Employee)

    // We fetch SUMs of liquidaciones and we need to subtract vehicle maintenance costs.
    // Since we now have 'vehiculo_id' in liquidaciones, we can theoretically match it.
    // However, maintenance is per vehicle, not per employee directly.
    // LOGIC: For each employee, we see which vehicles they drove (via liquidaciones.vehiculo_id)
    // and we attribute the maintenance cost of those vehicles during that period.

    // Step 1.1: Standard Financials (Aggregated)
    $sqlLiquidaciones = "SELECT
                            l.empleado_id,
                            e.nombre_completo as empleado_nombre,
                            e.rol as empleado_rol,
                            e.foto_perfil as foto_perfil,
                            COALESCE(v_asig.unidad_nombre, v_viaje.unidad_nombre) as vehiculo_asignado,
                            SUM(l.viajes) as total_viajes,
                            SUM(l.monto_efectivo) as total_ingresos,
                            SUM(l.monto_efectivo) as total_efectivo,
                            SUM(COALESCE(l.propinas, 0)) as total_propinas,
                            SUM(COALESCE(l.otros_viajes, 0)) as total_otros_viajes,
                            SUM(l.gastos_total) as gastos_operativos_chofer,
                            SUM(l.neto_entregado) as neto_entregado,
                            COALESCE(e.vehiculo_id,
                                (SELECT vi.unidad_id FROM viajes vi
                                 WHERE vi.empleado_id = l.empleado_id
                                 AND vi.unidad_id IS NOT NULL
                                 ORDER BY vi.fecha DESC LIMIT 1)
                            ) as current_vehiculo_id
                         FROM liquidaciones l
                         LEFT JOIN empleados e ON l.empleado_id = e.id
                         LEFT JOIN vehiculos v_asig ON e.vehiculo_id = v_asig.id
                         LEFT JOIN viajes vi_last ON vi_last.empleado_id = l.empleado_id AND vi_last.id = (
                             SELECT MAX(vi2.id) FROM viajes vi2 WHERE vi2.empleado_id = l.empleado_id AND vi2.unidad_id IS NOT NULL
                         )
                         LEFT JOIN vehiculos v_viaje ON vi_last.unidad_id = v_viaje.id
                         WHERE " . $filterLiqAgg['where'] . "
                         GROUP BY l.empleado_id";

    $stmtLiq = $db->prepare($sqlLiquidaciones);
    $stmtLiq->execute($filterLiqAgg['params']);
    $empleadosStats = $stmtLiq->fetchAll(PDO::FETCH_ASSOC);

    // Step 1.1b: Detailed Liquidations (History)
    $filterLiqDet = getOperationalDayFilter($fechaInicio, $fechaFin, 'l');
    $sqlLiqDetalles = "SELECT 
                        l.id,
                        l.empleado_id,
                        l.fecha,
                        l.hora,
                        l.viajes,
                        l.monto_efectivo,
                        COALESCE(l.propinas, 0) as propinas,
                        COALESCE(l.otros_viajes, 0) as otros_viajes,
                        l.gastos_total,
                        l.neto_entregado,
                        l.firma_path,
                        l.detalles_gastos
                       FROM liquidaciones l
                       WHERE " . $filterLiqDet['where'] . "
                       ORDER BY l.fecha DESC, l.hora DESC";
    $stmtLiqDet = $db->prepare($sqlLiqDetalles);
    $stmtLiqDet->execute($filterLiqDet['params']);
    $allLiqs = $stmtLiqDet->fetchAll(PDO::FETCH_ASSOC);

    // Group liquidations by Employee ID
    $liquidacionesPorEmpleado = [];
    foreach ($allLiqs as $liq) {
        $eid = $liq['empleado_id'];
        $liquidacionesPorEmpleado[$eid][] = $liq;
    }

    // Step 1.2: Maintenance Costs per Vehicle in range (DETAILED)
    $sqlMant = "SELECT * FROM mantenimientos WHERE fecha >= :fi AND fecha < :ff ORDER BY fecha ASC";
    $stmtMant = $db->prepare($sqlMant);
    $stmtMant->execute([':fi' => $fechaInicio, ':ff' => $fechaFin]);
    $allMants = $stmtMant->fetchAll(PDO::FETCH_ASSOC);

    // Group maintenance by Unit ID
    $mantenimientosPorUnidad = [];
    foreach ($allMants as $m) {
        $uid = $m['unidad_id'];
        if (!isset($mantenimientosPorUnidad[$uid])) {
            $mantenimientosPorUnidad[$uid] = ['total' => 0, 'items' => []];
        }
        $mantenimientosPorUnidad[$uid]['total'] += $m['costo_total'];
        $mantenimientosPorUnidad[$uid]['items'][] = $m;
    }

    // Step 1.3: Merge Data
    foreach ($empleadosStats as &$emp) {
        $costoMantenimientoAtribuido = 0;
        $listaMantenimientos = [];

        // Use the currently assigned vehicle ID since we lack per-trip vehicle ID
        $vid = $emp['current_vehiculo_id'] ?? null;

        if ($vid && isset($mantenimientosPorUnidad[$vid])) {
            $costoMantenimientoAtribuido = $mantenimientosPorUnidad[$vid]['total'];
            $listaMantenimientos = $mantenimientosPorUnidad[$vid]['items'];
        }


        $emp['detalles_mantenimiento'] = $listaMantenimientos;
        $emp['detalles_ingresos'] = $liquidacionesPorEmpleado[$emp['empleado_id']] ?? [];

        // Step 1.2b: Received Cash (nomina_recibos_caja) per employee in range
        $sqlRecibido = "SELECT COALESCE(SUM(monto), 0) as total_recibido 
                         FROM nomina_recibos_caja 
                         WHERE empleado_id = :eid 
                         AND fecha BETWEEN :fi AND :ff";
        $stmtRec = $db->prepare($sqlRecibido);
        $stmtRec->execute([
            ':eid' => $emp['empleado_id'],
            ':fi' => $fechaInicio . ' 00:00:00',
            ':ff' => $fechaFin . ' 23:59:59'
        ]);
        $resRec = $stmtRec->fetch(PDO::FETCH_ASSOC);
        $emp['total_recibido_caja'] = (float) ($resRec['total_recibido'] ?? 0);

        // Step 1.2c: Deposits per employee in range (labels align with Monday-Monday in DB)
        $fechaInicioLabel = date('Y-m-d', strtotime($fechaInicio . ' -1 day'));
        $fechaFinLabel = date('Y-m-d', strtotime($fechaFin . ' -1 day'));

        $sqlDepositos = "SELECT COALESCE(SUM(monto), 0) as total_depositos 
                         FROM nomina_transferencias 
                         WHERE empleado_id = :eid 
                         AND fecha_inicio_semana >= :fi AND fecha_inicio_semana < :ff";
        $stmtDep = $db->prepare($sqlDepositos);
        $stmtDep->execute([
            ':eid' => $emp['empleado_id'],
            ':fi' => $fechaInicioLabel,
            ':ff' => $fechaFinLabel
        ]);
        $resDep = $stmtDep->fetch(PDO::FETCH_ASSOC);
        $emp['total_depositos'] = (float) ($resDep['total_depositos'] ?? 0);

        // Step 1.2b: Calculate Mileage from Inspections (inspecciones_vehiculos)
        // We sum (odometro_final - odometro_inicio) for inspections in the period for this employee.
        // We also normalize to Km if unit is 'mi'.
        $sqlMileage = "SELECT 
                        SUM(
                            CASE 
                                WHEN v.unidad_medida = 'mi' THEN (iv.odometro_final - iv.odometro_inicio) * 1.60934
                                ELSE (iv.odometro_final - iv.odometro_inicio)
                            END
                        ) as distancia_km
                       FROM inspecciones_vehiculos iv
                       JOIN vehiculos v ON iv.vehiculo_id = v.id
                       WHERE iv.empleado_id = :eid 
                       AND iv.fecha BETWEEN :fi AND :ff
                       AND iv.odometro_final > iv.odometro_inicio";
        $stmtMileage = $db->prepare($sqlMileage);
        $stmtMileage->execute([':eid' => $emp['empleado_id'], ':fi' => $fechaInicio, ':ff' => $fechaFin]);
        $mileageData = $stmtMileage->fetch(PDO::FETCH_ASSOC);

        $distanciaKm = floatval($mileageData['distancia_km'] ?? 0);
        $emp['distancia_recorrida_km'] = $distanciaKm;

        // Calculate Yield (Ingresos / Km)
        $emp['rendimiento_km'] = ($distanciaKm > 0) ? ($emp['total_ingresos'] / $distanciaKm) : 0;

        // Calculate vehicle operating costs for this period
        $costoOperativoVehiculo = 0;
        $detallesCostosOperativos = [];
        if ($vid) {
            // Fetch vehicle costs
            $sqlVehCostos = "SELECT 
                costo_seguro_anual, costo_gasolina_anual, costo_aceite_anual,
                costo_llantas_anual, costo_tuneup_anual, costo_lavado_anual,
                costo_servicio_general_anual, costo_placas_anual, costo_ecologico_anual,
                costo_deducible_seguro_anual
            FROM vehiculos WHERE id = :vid";
            $stmtVehCostos = $db->prepare($sqlVehCostos);
            $stmtVehCostos->execute([':vid' => $vid]);
            $vehiculoCostos = $stmtVehCostos->fetch(PDO::FETCH_ASSOC);

            if ($vehiculoCostos) {
                $costosLabels = [
                    'costo_seguro_anual' => 'Seguro',
                    'costo_deducible_seguro_anual' => 'Deducible Seguro',
                    // 'costo_gasolina_anual' => 'Gasolina', // EXCLUIDO: Se calcula con tickets reales
                    'costo_aceite_anual' => 'Aceite',
                    'costo_llantas_anual' => 'Llantas',
                    'costo_tuneup_anual' => 'Tune-up/Afinación',
                    'costo_lavado_anual' => 'Lavado',
                    'costo_servicio_general_anual' => 'Servicio General',
                    'costo_placas_anual' => 'Placas',
                    'costo_ecologico_anual' => 'Verificación Ecológica'
                ];

                $periodoTexto = [
                    'dia' => 'diario',
                    'semana' => 'semanal',
                    'mes' => 'mensual',
                    'anio' => 'anual'
                ];

                foreach ($vehiculoCostos as $campo => $costoAnual) {
                    if ($campo === 'costo_gasolina_anual')
                        continue; // EXCLUIDO REALMENTE
                    $costo = floatval($costoAnual);
                    if ($costo > 0) {
                        $costoPeriodo = calcularCostoPeriodo($costo, $periodo);
                        $costoOperativoVehiculo += $costoPeriodo;
                        $detallesCostosOperativos[] = [
                            'tipo' => $costosLabels[$campo] ?? $campo,
                            'descripcion' => 'Costo ' . ($periodoTexto[$periodo] ?? $periodo) . ' (Anual: $' . number_format($costo, 2) . ')',
                            'costo_total' => $costoPeriodo,
                            'costo_anual' => $costo,
                            'fecha' => date('Y-m-d'),
                            'es_costo_fijo' => true
                        ];
                    }
                }
            }
        }

        $emp['costo_mantenimiento_vehiculo'] = $costoMantenimientoAtribuido + $costoOperativoVehiculo;
        $emp['costo_operativo_vehiculo'] = $costoOperativoVehiculo;
        $emp['detalles_costos_operativos'] = $detallesCostosOperativos;
        $emp['utilidad_real'] = $emp['total_ingresos'] - $emp['gastos_operativos_chofer'] - ($costoMantenimientoAtribuido + $costoOperativoVehiculo);
    }
    unset($emp); // BREAK REFERENCE to avoid overwriting last element in next loop

    // Step 1.4 moved to after Step 1.5 to avoid duplicates

    // Populate $vehiculosAsignados BEFORE Step 1.4 to correctly skip already assigned vehicles
    $vehiculosAsignados = [];
    foreach ($empleadosStats as $emp) {
        if ($emp['current_vehiculo_id']) {
            $vehiculosAsignados[] = (int) $emp['current_vehiculo_id'];
        }
    }

    // Get all vehicles with maintenance in this period (as integers)
    $vehiculosConMantenimiento = array_map('intval', array_keys($mantenimientosPorUnidad));

    // Step 1.4: Add vehicles with maintenance but NO driver assigned
    foreach ($vehiculosConMantenimiento as $vid) {
        if (in_array($vid, $vehiculosAsignados, true)) {
            continue; // Skip - this vehicle is already shown under an employee
        }

        // Get vehicle info
        $sqlVeh = "SELECT id, unidad_nombre FROM vehiculos WHERE id = :vid";
        $stmtVeh = $db->prepare($sqlVeh);
        $stmtVeh->execute([':vid' => $vid]);
        $vehiculo = $stmtVeh->fetch(PDO::FETCH_ASSOC);

        if ($vehiculo) {
            // Calculate vehicle operating costs for this period
            $sqlVehCostos = "SELECT 
                costo_seguro_anual, costo_gasolina_anual, costo_aceite_anual,
                costo_llantas_anual, costo_tuneup_anual, costo_lavado_anual,
                costo_servicio_general_anual, costo_placas_anual, costo_ecologico_anual,
                costo_deducible_seguro_anual
            FROM vehiculos WHERE id = :vid";
            $stmtVehCostos = $db->prepare($sqlVehCostos);
            $stmtVehCostos->execute([':vid' => $vid]);
            $vehiculoCostos = $stmtVehCostos->fetch(PDO::FETCH_ASSOC);

            $costoOperativoVehiculo = 0;
            $detallesCostosOperativos = [];
            if ($vehiculoCostos) {
                $costosLabels = [
                    'costo_seguro_anual' => 'Seguro',
                    'costo_deducible_seguro_anual' => 'Deducible Seguro',
                    // 'costo_gasolina_anual' => 'Gasolina', // EXCLUIDO: Se calcula con tickets reales
                    'costo_aceite_anual' => 'Aceite',
                    'costo_llantas_anual' => 'Llantas',
                    'costo_tuneup_anual' => 'Tune-up/Afinación',
                    'costo_lavado_anual' => 'Lavado',
                    'costo_servicio_general_anual' => 'Servicio General',
                    'costo_placas_anual' => 'Placas',
                    'costo_ecologico_anual' => 'Verificación Ecológica'
                ];

                $periodoTexto = [
                    'dia' => 'diario',
                    'semana' => 'semanal',
                    'mes' => 'mensual',
                    'anio' => 'anual'
                ];

                foreach ($vehiculoCostos as $campo => $costoAnual) {
                    if ($campo === 'costo_gasolina_anual')
                        continue; // EXCLUIDO REALMENTE
                    $costo = floatval($costoAnual);
                    if ($costo > 0) {
                        $costoPeriodo = calcularCostoPeriodo($costo, $periodo);
                        $costoOperativoVehiculo += $costoPeriodo;
                        $detallesCostosOperativos[] = [
                            'tipo' => $costosLabels[$campo] ?? $campo,
                            'descripcion' => 'Costo ' . ($periodoTexto[$periodo] ?? $periodo) . ' (Anual: $' . number_format($costo, 2) . ')',
                            'costo_total' => $costoPeriodo,
                            'costo_anual' => $costo,
                            'fecha' => date('Y-m-d'),
                            'es_costo_fijo' => true
                        ];
                    }
                }
            }

            $empleadosStats[] = [
                'empleado_id' => null,
                'empleado_nombre' => 'Sin Chofer Asignado',
                'empleado_rol' => null,
                'vehiculo_asignado' => $vehiculo['unidad_nombre'],
                'total_viajes' => 0,
                'total_ingresos' => 0,
                'total_efectivo' => 0,
                'total_propinas' => 0,
                'gastos_operativos_chofer' => 0,
                'neto_entregado' => 0,
                'current_vehiculo_id' => $vid,
                'costo_mantenimiento_vehiculo' => $mantenimientosPorUnidad[$vid]['total'] + $costoOperativoVehiculo,
                'costo_operativo_vehiculo' => $costoOperativoVehiculo,
                'detalles_costos_operativos' => $detallesCostosOperativos,
                'utilidad_real' => -($mantenimientosPorUnidad[$vid]['total'] + $costoOperativoVehiculo),
                'detalles_mantenimiento' => $mantenimientosPorUnidad[$vid]['items'],
                'detalles_ingresos' => [],
                'distancia_recorrida_km' => 0,
                'rendimiento_km' => 0
            ];

            // Add to assigned list to avoid duplicates in Step 1.5 if logic changes
            $vehiculosAsignados[] = $vid;
        }
    }

    // Step 1.5: Add employees who have NO liquidations but ARE active (and potentially have vehicle costs)
    // Update logic to verify against $vehiculosAsignados for costs
    $empleadosConLiquidaciones = array_map(function ($emp) {
        return (int) $emp['empleado_id'];
    }, $empleadosStats);

    // Get all active employees
    $sqlTodosEmpleados = "SELECT e.id, e.nombre_completo, e.rol, e.vehiculo_id, e.foto_perfil, v.unidad_nombre
                          FROM empleados e
                          LEFT JOIN vehiculos v ON e.vehiculo_id = v.id
                          WHERE e.estado = 'Activo'";
    $stmtTodos = $db->query($sqlTodosEmpleados);
    $todosEmpleados = $stmtTodos->fetchAll(PDO::FETCH_ASSOC);

    foreach ($todosEmpleados as $empleado) {
        $eid = (int) $empleado['id'];

        // Skip if already in stats (has liquidations)
        if (in_array($eid, $empleadosConLiquidaciones)) {
            continue;
        }

        // Also skip if already added in this loop (prevent duplicates)
        $yaAgregado = false;
        foreach ($empleadosStats as $emp) {
            if ((int) $emp['empleado_id'] === $eid) {
                $yaAgregado = true;
                break;
            }
        }
        if ($yaAgregado) {
            continue;
        }

        // Calculate operating costs for their assigned vehicle
        $vid = $empleado['vehiculo_id'] ? (int) $empleado['vehiculo_id'] : null;
        $costoOperativoVehiculo = 0;
        $detallesCostosOperativos = [];

        if ($vid) {
            // Fetch vehicle costs
            $sqlVehCostos = "SELECT 
                costo_seguro_anual, costo_gasolina_anual, costo_aceite_anual,
                costo_llantas_anual, costo_tuneup_anual, costo_lavado_anual,
                costo_servicio_general_anual, costo_placas_anual, costo_ecologico_anual,
                costo_deducible_seguro_anual
            FROM vehiculos WHERE id = :vid";
            $stmtVehCostos = $db->prepare($sqlVehCostos);
            $stmtVehCostos->execute([':vid' => $vid]);
            $vehiculoCostos = $stmtVehCostos->fetch(PDO::FETCH_ASSOC);

            if ($vehiculoCostos) {
                $costosLabels = [
                    'costo_seguro_anual' => 'Seguro',
                    'costo_deducible_seguro_anual' => 'Deducible Seguro',
                    // 'costo_gasolina_anual' => 'Gasolina', // EXCLUIDO
                    'costo_aceite_anual' => 'Aceite',
                    'costo_llantas_anual' => 'Llantas',
                    'costo_tuneup_anual' => 'Tune-up/Afinación',
                    'costo_lavado_anual' => 'Lavado',
                    'costo_servicio_general_anual' => 'Servicio General',
                    'costo_placas_anual' => 'Placas',
                    'costo_ecologico_anual' => 'Verificación Ecológica'
                ];

                $periodoTexto = [
                    'dia' => 'diario',
                    'semana' => 'semanal',
                    'mes' => 'mensual',
                    'anio' => 'anual'
                ];

                foreach ($vehiculoCostos as $campo => $costoAnual) {
                    if ($campo === 'costo_gasolina_anual')
                        continue; // EXCLUIDO
                    $costo = floatval($costoAnual);
                    if ($costo > 0) {
                        $costoPeriodo = calcularCostoPeriodo($costo, $periodo);
                        $costoOperativoVehiculo += $costoPeriodo;
                        $detallesCostosOperativos[] = [
                            'tipo' => $costosLabels[$campo] ?? $campo,
                            'descripcion' => 'Costo ' . ($periodoTexto[$periodo] ?? $periodo) . ' (Anual: $' . number_format($costo, 2) . ')',
                            'costo_total' => $costoPeriodo,
                            'costo_anual' => $costo,
                            'fecha' => date('Y-m-d'),
                            'es_costo_fijo' => true
                        ];
                    }
                }
            }
        }

        // Get maintenance for their vehicle if any
        $costoMantenimiento = 0;
        $detallesMantenimiento = [];
        if ($vid && isset($mantenimientosPorUnidad[$vid])) {
            $costoMantenimiento = $mantenimientosPorUnidad[$vid]['total'];
            $detallesMantenimiento = $mantenimientosPorUnidad[$vid]['items'];
        }

        // Add employee to stats with zero income
        $empleadosStats[] = [
            'empleado_id' => $eid,
            'empleado_nombre' => $empleado['nombre_completo'],
            'empleado_rol' => $empleado['rol'],
            'foto_perfil' => $empleado['foto_perfil'] ?? null,
            'vehiculo_asignado' => $empleado['unidad_nombre'],
            'total_viajes' => 0,
            'total_ingresos' => 0,
            'total_efectivo' => 0,
            'total_propinas' => 0,
            'gastos_operativos_chofer' => 0,
            'neto_entregado' => 0,
            'current_vehiculo_id' => $vid,
            'costo_mantenimiento_vehiculo' => $costoMantenimiento + $costoOperativoVehiculo,
            'costo_operativo_vehiculo' => $costoOperativoVehiculo,
            'detalles_costos_operativos' => $detallesCostosOperativos,
            'utilidad_real' => -($costoMantenimiento + $costoOperativoVehiculo),
            'detalles_mantenimiento' => $detallesMantenimiento,
            'detalles_ingresos' => [],
            'distancia_recorrida_km' => 0,
            'rendimiento_km' => 0,
            'total_recibido_caja' => (float) ($db->query("SELECT COALESCE(SUM(monto), 0) FROM nomina_recibos_caja WHERE empleado_id = " . ($eid ?: 0) . " AND fecha BETWEEN '$fechaInicio 00:00:00' AND '$fechaFin 23:59:59'")->fetchColumn() ?: 0),
            'total_depositos' => (float) ($db->query("SELECT COALESCE(SUM(monto), 0) FROM nomina_transferencias WHERE empleado_id = " . ($eid ?: 0) . " AND fecha_inicio_semana >= '$fechaInicioLabel' AND fecha_inicio_semana < '$fechaFinLabel'")->fetchColumn() ?: 0)
        ];
    }

    // 2. Global Totals (Calculated DIRECTLY from liquidaciones to match Dashboard logic and ensure no rows are missed)
    $sqlGlobalLiq = "SELECT 
                        COALESCE(SUM(l.monto_efectivo), 0) as total_ingresos,
                        COALESCE(SUM(COALESCE(l.propinas, 0)), 0) as total_propinas,
                        COALESCE(SUM(COALESCE(l.otros_viajes, 0)), 0) as total_otros_viajes,
                        COALESCE(SUM(l.gastos_total), 0) as total_gastos
                      FROM liquidaciones l
                      WHERE " . $filterLiqGlobal['where'] . "";
    $stmtGlobal = $db->prepare($sqlGlobalLiq);
    $stmtGlobal->execute($filterLiqGlobal['params']);

    $globalLiq = $stmtGlobal->fetch(PDO::FETCH_ASSOC);

    $totalIngresos     = (float) $globalLiq['total_ingresos'];
    $totalPropinas     = (float) $globalLiq['total_propinas'];
    $totalOtrosViajes  = (float) $globalLiq['total_otros_viajes'];
    $totalGastosChofer = (float) $globalLiq['total_gastos'];

    // 3. Global Fixed Costs (Calculate DIRECTLY from ALL vehicles to ensure concordance and avoid double counting or omissions)
    $sqlTotalFixed = "SELECT 
        SUM(costo_seguro_anual + costo_deducible_seguro_anual + 
            costo_aceite_anual + costo_llantas_anual + costo_tuneup_anual + 
            costo_lavado_anual + costo_servicio_general_anual + costo_placas_anual + 
            costo_ecologico_anual) as total_anual
        FROM vehiculos";
    $stmtFixed = $db->query($sqlTotalFixed);
    $rowFixed = $stmtFixed->fetch(PDO::FETCH_ASSOC);
    $totalAnualFlota = floatval($rowFixed['total_anual']);
    $totalCostoOperativoFlota = calcularCostoPeriodo($totalAnualFlota, $periodo);

    // Step 1.6: Add IDLE vehicles (No driver, No maintenance, No activity) to the list so the sum matches the user's manual check
    // We get ALL vehicles and check if they are already in $empleadosStats (either by 'current_vehiculo_id' or assigned to 'vehiculo_asignado')
    $vehiculosEnReporte = [];
    foreach ($empleadosStats as $emp) {
        if ($emp['current_vehiculo_id'])
            $vehiculosEnReporte[] = (int) $emp['current_vehiculo_id'];
    }

    $sqlAllVehs = "SELECT * FROM vehiculos";
    $stmtAllVehs = $db->query($sqlAllVehs);
    while ($veh = $stmtAllVehs->fetch(PDO::FETCH_ASSOC)) {
        $vid = (int) $veh['id'];
        if (in_array($vid, $vehiculosEnReporte))
            continue;

        // Calculate costs for this idle vehicle
        $costoOperativoVehiculo = 0;
        $detallesCostosOperativos = [];

        $costosLabels = [
            'costo_seguro_anual' => 'Seguro',
            'costo_deducible_seguro_anual' => 'Deducible Seguro',
            // 'costo_gasolina_anual' => 'Gasolina', // EXCLUIDO
            'costo_aceite_anual' => 'Aceite',
            'costo_llantas_anual' => 'Llantas',
            'costo_tuneup_anual' => 'Tune-up/Afinación',
            'costo_lavado_anual' => 'Lavado',
            'costo_servicio_general_anual' => 'Servicio General',
            'costo_placas_anual' => 'Placas',
            'costo_ecologico_anual' => 'Verificación Ecológica'
        ];
        $periodoTexto = [
            'dia' => 'diario',
            'semana' => 'semanal',
            'mes' => 'mensual',
            'anio' => 'anual'
        ];

        foreach ($costosLabels as $campo => $label) {
            if ($campo === 'costo_gasolina_anual')
                continue; // EXCLUIDO
            $costo = floatval($veh[$campo] ?? 0);
            if ($costo > 0) {
                $costoPeriodo = calcularCostoPeriodo($costo, $periodo);
                $costoOperativoVehiculo += $costoPeriodo;
                $detallesCostosOperativos[] = [
                    'tipo' => $label,
                    'descripcion' => 'Costo ' . ($periodoTexto[$periodo] ?? $periodo) . ' (Anual: $' . number_format($costo, 2) . ')',
                    'costo_total' => $costoPeriodo,
                    'costo_anual' => $costo,
                    'fecha' => date('Y-m-d'),
                    'es_costo_fijo' => true
                ];
            }
        }

        if ($costoOperativoVehiculo > 0) {
            $empleadosStats[] = [
                'empleado_id' => null,
                'empleado_nombre' => 'Vehículo Inactivo (' . $veh['unidad_nombre'] . ')',
                'empleado_rol' => null,
                'vehiculo_asignado' => $veh['unidad_nombre'],
                'total_viajes' => 0,
                'total_ingresos' => 0,
                'total_efectivo' => 0,
                'total_propinas' => 0,
                'gastos_operativos_chofer' => 0,
                'neto_entregado' => 0,
                'current_vehiculo_id' => $vid,
                'costo_mantenimiento_vehiculo' => $costoOperativoVehiculo,
                'costo_operativo_vehiculo' => $costoOperativoVehiculo,
                'detalles_costos_operativos' => $detallesCostosOperativos,
                'utilidad_real' => -($costoOperativoVehiculo),
                'detalles_mantenimiento' => [],
                'detalles_ingresos' => [],
                'distancia_recorrida_km' => 0,
                'rendimiento_km' => 0
            ];
        }
    }

    // Sum all maintenance in range regardless of driver assignment
    $totalMantenimiento = array_sum(array_column($allMants, 'costo_total'));

    // Note: gastos_mantenimiento_flota now combines Repairs + Prorated Fixed Costs for the Global View
    // Or we keep them separate. Let's combine them for "Mantenimiento Flota" card or create a new logic?
    // The previous logic for "Mantenimiento Flota" was ONLY Repairs.
    // The "Utilidad Neta" should definitely subtract Fixed Costs.

    $balanceGlobal = [
        'ingresos_brutos' => $totalIngresos, // Caja (Efectivo)
        'total_propinas' => $totalPropinas,
        'total_otros_viajes' => $totalOtrosViajes,
        'gastos_operativos_chofer' => $totalGastosChofer,
        'gastos_mantenimiento_flota' => $totalMantenimiento,
        'gastos_fijos_flota' => $totalCostoOperativoFlota,
        'utilidad_neta_total' => $totalIngresos - $totalGastosChofer - $totalMantenimiento - $totalCostoOperativoFlota
    ];

    echo json_encode([
        'status' => 'success',
        'rango' => ['inicio' => $fechaInicio, 'fin' => $fechaFin],
        'global' => $balanceGlobal,
        'empleados' => $empleadosStats
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>