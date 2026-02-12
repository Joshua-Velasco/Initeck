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
    echo json_encode(['status' => 'error', 'message' => 'Error de base de datos']);
    exit;
}

/**
 * FUNCIÓN PARA GUARDAR IMÁGENES FÍSICAMENTE (Multipart)
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

// 2. Obtener Datos de $_POST (Multipart)
$input = $_POST;

if (!$input || !isset($input['empleado_id'])) {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => 'Datos inválidos']);
    exit;
}

try {
    $pdo->beginTransaction();

    // Ruta uploads
    $upload_dir = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . "uploads" . DIRECTORY_SEPARATOR;
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    // 3. Procesar Firma
    $nombreFirma = saveUploadedFile('firma', $upload_dir, 'firma_liq');

    // 4. Procesar Gastos (Vienen como JSON string en $_POST['gastos'])
    $totalGastos = 0;
    $gastosProcesados = [];
    $rawGastos = $input['gastos'] ?? '[]';
    $listaGastos = is_string($rawGastos) ? json_decode($rawGastos, true) : $rawGastos;

    if (is_array($listaGastos)) {
        foreach ($listaGastos as $g) {
            $monto = floatval($g['monto'] ?? 0);
            $totalGastos += $monto;

            // Buscar archivos en $_FILES para este gasto
            $fotoTicket = saveUploadedFile('ticket', $upload_dir, 'ticket');
            $fotoTablero = saveUploadedFile('tablero', $upload_dir, 'tab_gasto');

            $gastosProcesados[] = [
                'tipo' => $g['tipo'] ?? 'Otros',
                'monto' => $monto,
                'odometro' => floatval($g['odometro'] ?? 0),
                'foto_ticket' => $fotoTicket,
                'foto_tablero' => $fotoTablero
            ];
        }
    }

    // 5. Cálculos Finales
    $montoEfectivo = floatval($input['monto_efectivo'] ?? 0);
    $propinas = floatval($input['propinas'] ?? 0);
    $viajes = intval($input['viajes'] ?? 0);
    $netoEntregado = ($montoEfectivo + $propinas) - $totalGastos;
    $detallesJson = json_encode($gastosProcesados);


    // DETERMINAR FECHA CORRESPONDIENTE SEGÚN HORARIO (TURNO NOCTURNO)
    require_once dirname(__DIR__) . '/utils/shift_utils.php';
    $fechaRegistro = getLogicalDate($pdo, intval($input['empleado_id']));

    // 6. Insertar en DB (incluyendo vehiculo_id para asociar gastos)
    // 6. Insertar en DB (sin vehiculo_id ya que no existe en la tabla)
    $stmt = $pdo->prepare("
        INSERT INTO liquidaciones 
        (empleado_id, fecha, hora, viajes, monto_efectivo, propinas, gastos_total, neto_entregado, firma_path, detalles_gastos) 
        VALUES (?, ?, CURTIME(), ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        intval($input['empleado_id']),
        $fechaRegistro, // Usamos la fecha calculada
        $viajes,
        $montoEfectivo,
        $propinas,
        $totalGastos,
        $netoEntregado,
        $nombreFirma,
        $detallesJson
    ]);

    // 7. SI SE REPORTÓ NUEVO NIVEL DE GASOLINA, ACTUALIZAR VEHÍCULO
    if (isset($input['nuevo_nivel_gasolina']) && isset($input['vehiculo_id'])) {
        $stmtGas = $pdo->prepare("UPDATE vehiculos SET nivel_gasolina = ? WHERE id = ?");
        $stmtGas->execute([intval($input['nuevo_nivel_gasolina']), intval($input['vehiculo_id'])]);
    }

    $pdo->commit();

    ob_clean();
    echo json_encode([
        'status' => 'success',
        'message' => 'Liquidación guardada correctamente'
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction())
        $pdo->rollBack();
    ob_clean();
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ]);
}