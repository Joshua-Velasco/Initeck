<?php
require_once '../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    $input = json_decode(file_get_contents("php://input"), true);
    if(!$input) $input = $_POST;

    $id = $input['id'] ?? null;
    $estado = $input['estado'] ?? null;

    if (empty($id) || empty($estado)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "El ID de la tarea y el nuevo estado son requeridos"]);
        exit;
    }

    $query = "UPDATE tareas SET estado = :estado WHERE id = :id";
    $stmt = $conn->prepare($query);
    $stmt->bindValue(':id', $id);
    $stmt->bindValue(':estado', $estado);
    $stmt->execute();

    echo json_encode(["status" => "success", "message" => "Estado de la tarea actualizado"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
