<?php
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->empleado_id)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Falta empleado_id"]);
    exit;
}

try {
    $stmt = $db->prepare("UPDATE empleados SET vehiculo_id = NULL WHERE id = :e_id");
    $stmt->bindValue(':e_id', intval($data->empleado_id), PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode(["status" => "success", "message" => "Unidad desasignada correctamente."]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
