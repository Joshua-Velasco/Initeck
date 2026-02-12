<?php
// Initeck-api/v1/taller/update_status.php
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

if (!isset($data->id) || !isset($data->estado)) {
    echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
    exit;
}

$sql = "UPDATE vehiculos SET estado = ? WHERE id = ?";
$stmt = $db->prepare($sql);

if ($stmt->execute([$data->estado, $data->id])) {
    echo json_encode(["status" => "success", "message" => "Estado actualizado"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error al actualizar"]);
}
?>