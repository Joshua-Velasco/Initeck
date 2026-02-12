<?php
// Initeck-api/v1/taller/equipamiento.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->unidad_id)) {
    echo json_encode(["status" => "error", "message" => "ID de unidad requerido"]);
    exit;
}

// Campos permitidos para actualizar
$allowed = ['llanta_refaccion', 'gato', 'cruzeta', 'cables_corriente'];
$updates = [];
$params = [];

foreach ($data as $key => $value) {
    if (in_array($key, $allowed)) {
        // Asegurar formato enum 'SÍ'/'NO'
        $val = ($value === true || $value === 'SÍ' || $value === 1 || $value === 'true') ? 'SÍ' : 'NO';
        $updates[] = "$key = ?";
        $params[] = $val;
    }
}

if (empty($updates)) {
    echo json_encode(["status" => "success", "message" => "Nada que actualizar"]);
    exit;
}

$params[] = $data->unidad_id;
$sql = "UPDATE vehiculos SET " . implode(", ", $updates) . " WHERE id = ?";

try {
    $stmt = $db->prepare($sql);
    if ($stmt->execute($params)) {
        echo json_encode(["status" => "success", "message" => "Equipamiento actualizado"]);
    } else {
        echo json_encode(["status" => "error"]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>