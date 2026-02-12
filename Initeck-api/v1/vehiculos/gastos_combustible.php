<?php
require_once '../../config/database.php';

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $database = new Database();
    $pdo = $database->getConnection();
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error de base de datos']);
    exit;
}

$vehiculo_id = isset($_GET['vehiculo_id']) ? intval($_GET['vehiculo_id']) : 0;

if (!$vehiculo_id) {
    echo json_encode(['status' => 'error', 'message' => 'vehiculo_id requerido']);
    exit;
}

try {
    // Obtener el empleado asignado al vehículo
    $stmtEmp = $pdo->prepare("SELECT id FROM empleados WHERE vehiculo_id = ?");
    $stmtEmp->execute([$vehiculo_id]);
    $empleado = $stmtEmp->fetch(PDO::FETCH_ASSOC);
    $empleadoAsignado = $empleado['id'] ?? null;

    if (!$empleadoAsignado) {
        echo json_encode([
            'status' => 'success',
            'vehiculo_id' => $vehiculo_id,
            'empleado_asignado' => null,
            'mensaje' => 'No hay empleado asignado a este vehiculo',
            'total_gastado' => 0,
            'cantidad_registros' => 0,
            'gastos' => []
        ]);
        exit;
    }

    // Buscar liquidaciones del empleado asignado
    $sql = "
        SELECT 
            l.id,
            l.fecha,
            l.hora,
            l.empleado_id,
            l.detalles_gastos,
            e.nombre_completo as empleado_nombre
        FROM liquidaciones l
        LEFT JOIN empleados e ON l.empleado_id = e.id
        WHERE l.empleado_id = ?
          AND l.detalles_gastos IS NOT NULL
          AND l.detalles_gastos != '[]'
          AND l.detalles_gastos != ''
        ORDER BY l.fecha DESC, l.hora DESC
        LIMIT 100
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$empleadoAsignado]);
    $liquidaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Procesar y extraer solo gastos de combustible
    $gastosCombustible = [];
    $totalGastado = 0;

    foreach ($liquidaciones as $liq) {
        $detalles = json_decode($liq['detalles_gastos'], true);
        if (!is_array($detalles))
            continue;

        foreach ($detalles as $gasto) {
            $tipo = strtolower($gasto['tipo'] ?? '');
            if ($tipo === 'combustible' || $tipo === 'gasolina') {
                $monto = floatval($gasto['monto'] ?? 0);
                $totalGastado += $monto;

                $gastosCombustible[] = [
                    'id' => $liq['id'],
                    'fecha' => $liq['fecha'],
                    'hora' => $liq['hora'],
                    'monto' => $monto,
                    'odometro' => floatval($gasto['odometro'] ?? 0),
                    'empleado_id' => $liq['empleado_id'],
                    'empleado_nombre' => $liq['empleado_nombre']
                ];
            }
        }
    }

    echo json_encode([
        'status' => 'success',
        'vehiculo_id' => $vehiculo_id,
        'empleado_asignado' => $empleadoAsignado,
        'total_liquidaciones' => count($liquidaciones),
        'total_gastado' => $totalGastado,
        'cantidad_registros' => count($gastosCombustible),
        'gastos' => $gastosCombustible
    ]);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
