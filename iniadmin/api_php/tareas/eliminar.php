<?php
require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'OPTIONS') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método no permitido"]);
    exit;
}

try {
    $db = new Database();
    $conn = $db->getConnection();

    $id = isset($_GET['id']) ? $_GET['id'] : null;

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "El ID de la tarea es requerido"]);
        exit;
    }

    $query = "DELETE FROM tareas WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$id]);

    echo json_encode(["status" => "success", "message" => "Tarea eliminada exitosamente"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
