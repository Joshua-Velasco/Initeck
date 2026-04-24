<?php
require_once '../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    $input = json_decode(file_get_contents("php://input"), true);
    if(!$input) $input = $_POST;

    $empleado_id = $input['empleado_id'] ?? null;
    $equipo_id = isset($input['equipo_id']) ? $input['equipo_id'] : null;

    if (empty($empleado_id)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "El ID del empleado es requerido"]);
        exit;
    }

    $query = "UPDATE empleados SET equipo_id = :equipo_id WHERE id = :id";
    $stmt = $conn->prepare($query);
    $stmt->bindValue(':id', $empleado_id);
    $stmt->bindValue(':equipo_id', empty($equipo_id) ? null : $equipo_id);
    $stmt->execute();

    echo json_encode(["status" => "success", "message" => "Empleado actualizado"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
