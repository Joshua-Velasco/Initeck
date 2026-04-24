<?php
// Headers CORS son manejados por Apache en .htaccess

// Manejar la petición "preflight" de los navegadores
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once '../../config/database.php';
require_once '../utils/shift_utils_v2.php';

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
    // Get employee's assigned vehicle to calculate maintenance/fixed costs
    $sqlEmp = "SELECT vehiculo_id FROM empleados WHERE id = :id";
    $stmtEmp = $db->prepare($sqlEmp);
    $stmtEmp->execute([':id' => $empleado_id]);
    $empData = $stmtEmp->fetch(PDO::FETCH_ASSOC);
    $vehiculo_id = $empData['vehiculo_id'] ?? null;

    $filter = getOperationalDayFilter($fechaInicio, $fechaFin, 'l');

    /**
     * Usamos COALESCE para evitar valores NULL si no hay registros ese día.
     * Sumamos monto_efectivo + propinas para obtener el ingreso bruto real.
     */
    $query = "SELECT
                CAST(COALESCE(SUM(viajes), 0) AS UNSIGNED) as total_viajes,
                COALESCE(SUM(gastos_total), 0) as total_gastos,
                COALESCE(SUM(monto_efectivo), 0) as total_efectivo,
                COALESCE(SUM(propinas), 0) as total_propinas,
                COALESCE(SUM(COALESCE(otros_viajes, 0)), 0) as total_otros_viajes,
                COALESCE(SUM(monto_efectivo + COALESCE(propinas, 0)), 0) as total_ingresos
              FROM liquidaciones l
              WHERE empleado_id = :emp_id
              AND " . $filter['where'];

    $stmt = $db->prepare($query);
    $params = array_merge([':emp_id' => $empleado_id], $filter['params']);
    $stmt->execute($params);

    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

    // Maintenance costs for the vehicle in selected range
    $totalMantenimiento = 0;
    if ($vehiculo_id) {
        $sqlMant = "SELECT COALESCE(SUM(costo_total), 0) as total FROM mantenimientos 
                    WHERE unidad_id = :vid AND fecha BETWEEN :inicio AND :fin";
        $stmtMant = $db->prepare($sqlMant);
        $stmtMant->execute([':vid' => $vehiculo_id, ':inicio' => $fechaInicio, ':fin' => $fechaFin]);
        $resMant = $stmtMant->fetch(PDO::FETCH_ASSOC);
        $totalMantenimiento = (float) $resMant['total'];

        // Prorated fixed costs (matching balance_avanzado.php logic)
        $sqlVeh = "SELECT costo_seguro_anual, costo_aceite_anual, costo_llantas_anual, 
                          costo_tuneup_anual, costo_lavado_anual, costo_servicio_general_anual, 
                          costo_placas_anual, costo_ecologico_anual, costo_deducible_seguro_anual
                   FROM vehiculos WHERE id = :vid";
        $stmtVeh = $db->prepare($sqlVeh);
        $stmtVeh->execute([':vid' => $vehiculo_id]);
        $vehData = $stmtVeh->fetch(PDO::FETCH_ASSOC);

        if ($vehData) {
            $costoAnual = 0;
            foreach ($vehData as $costo) {
                $costoAnual += floatval($costo);
            }

            // Calculate proportional cost (assuming daily for simple range or custom)
            // To match balance_avanzado exactly, we'd need 'periodo', but here we can estimate based on days
            $datediff = (strtotime($fechaFin) - strtotime($fechaInicio)) / (60 * 60 * 24) + 1;
            $totalMantenimiento += ($costoAnual / 365) * $datediff;
        }
    }

    // Transferencias (Depósitos): busca registros cuya fecha_inicio_semana
    // caiga dentro del rango seleccionado. Sin desfase de días.
    $queryTrans = "SELECT COALESCE(SUM(monto), 0) as total_depositos
                   FROM nomina_transferencias
                   WHERE empleado_id = :emp_id
                   AND fecha_inicio_semana BETWEEN :fi AND :ff";
    $stmtTrans = $db->prepare($queryTrans);
    $stmtTrans->execute([
        ':emp_id' => $empleado_id,
        ':fi' => $fechaInicio,
        ':ff' => $fechaFin
    ]);
    $resTrans = $stmtTrans->fetch(PDO::FETCH_ASSOC);
    $totalDepositos = (float) $resTrans['total_depositos'];

    // Neto operacional: solo efectivo (caja), sin propinas.
    // Las propinas las retiene el chofer y no forman parte del neto del negocio.
    $netoHarmonized = (float) $resultado['total_efectivo'] - (float) $resultado['total_gastos'] - $totalMantenimiento;


    // Respuesta limpia para el componente React
    echo json_encode([
        "status" => "success",
        "total_viajes" => (int) $resultado['total_viajes'],
        "total_gastos" => (float) $resultado['total_gastos'],
        "total_ingresos" => (float) $resultado['total_ingresos'],
        "total_depositos" => $totalDepositos,
        "total_mantenimiento" => $totalMantenimiento, // NUEVO CAMPO
        "total_efectivo" => (float) $resultado['total_efectivo'],
        "total_propinas" => (float) $resultado['total_propinas'],
        "total_otros_viajes" => (float) $resultado['total_otros_viajes'],
        "neto" => $netoHarmonized,
        "debug" => [
            "id" => $empleado_id,
            "rango" => ["inicio" => $fechaInicio, "fin" => $fechaFin],
            "vehiculo_id" => $vehiculo_id
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