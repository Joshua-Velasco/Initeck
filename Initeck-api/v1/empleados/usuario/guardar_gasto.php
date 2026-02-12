<?php
require_once '../../../config/database.php';

// Detectar el entorno y configurar CORS dinámicamente
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $database = new Database();
    $pdo = $database->getConnection();
} catch (PDOException $e) {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => 'Error de conexión a la DB']);
    exit;
}

/**
 * Función robusta para guardar archivos (Multipart)
 */
function saveUploadedFile($fileKey, $path, $namePrefix)
{
    if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    $tmp_name = $_FILES[$fileKey]['tmp_name'];
    $ext = pathinfo($_FILES[$fileKey]['name'], PATHINFO_EXTENSION);
    if (!$ext)
        $ext = "png";
    $filename = $namePrefix . "_" . uniqid() . "." . $ext;

    if (move_uploaded_file($tmp_name, $path . $filename)) {
        return $filename;
    }
    return null;
}

// Obtener Datos de $_POST
$input = $_POST;

if (!$input || !isset($input['empleado_id'])) {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => 'Datos incompletos o inválidos']);
    exit;
}

try {
    $pdo->beginTransaction();

    $upload_dir = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . "uploads" . DIRECTORY_SEPARATOR;
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    // 1. Guardar Firma
    $firmaArchivo = saveUploadedFile('firma', $upload_dir, 'firma_liq');

    // 2. Procesar Gastos
    $totalGastos = 0;
    $gastosFinales = [];
    $rawGastos = $input['gastos'] ?? '[]';
    $listaGastos = is_string($rawGastos) ? json_decode($rawGastos, true) : $rawGastos;

    if (is_array($listaGastos)) {
        foreach ($listaGastos as $g) {
            $monto = floatval($g['monto'] ?? 0);
            $totalGastos += $monto;

            // Buscar archivos
            $nombreTicket = saveUploadedFile('ticket', $upload_dir, 'ticket');
            $nombreTablero = saveUploadedFile('tab_gasto', $upload_dir, 'tab_liq');

            $gastosFinales[] = [
                'tipo' => $g['tipo'] ?? 'Otros',
                'monto' => $monto,
                'odometro' => floatval($g['odometro'] ?? 0),
                'foto_ticket' => $nombreTicket,
                'foto_tablero' => $nombreTablero
            ];
        }
    }

    $empleado_id = intval($input['empleado_id']);
    $viajes = intval($input['viajes'] ?? 0);
    $monto_efectivo = floatval($input['monto_efectivo'] ?? 0);
    $propinas = floatval($input['propinas'] ?? 0);

    $neto_entregado = ($monto_efectivo + $propinas) - $totalGastos;
    $detalles_json = json_encode($gastosFinales);


    // Calcular fecha lógica basada en el turno del empleado
    require_once dirname(__DIR__) . '/utils/shift_utils.php';
    $fechaLogica = getLogicalDate($pdo, $empleado_id);

    // Obtener vehiculo_id asignado al empleado
    $stmtVehiculo = $pdo->prepare("SELECT vehiculo_id FROM empleados WHERE id = ?");
    $stmtVehiculo->execute([$empleado_id]);
    $vehiculo_row = $stmtVehiculo->fetch(PDO::FETCH_ASSOC);
    $vehiculo_id = $vehiculo_row['vehiculo_id'] ?? null;

    $sql = "INSERT INTO liquidaciones 
            (empleado_id, vehiculo_id, fecha, hora, viajes, monto_efectivo, propinas, gastos_total, neto_entregado, firma_path, detalles_gastos) 
            VALUES (?, ?, ?, CURTIME(), ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $empleado_id,
        $vehiculo_id,
        $fechaLogica,
        $viajes,
        $monto_efectivo,
        $propinas,
        $totalGastos,
        $neto_entregado,
        $firmaArchivo,
        $detalles_json
    ]);

    $pdo->commit();

    ob_clean();
    echo json_encode([
        'status' => 'success',
        'message' => 'Liquidación y evidencias guardadas correctamente'
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction())
        $pdo->rollBack();
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}