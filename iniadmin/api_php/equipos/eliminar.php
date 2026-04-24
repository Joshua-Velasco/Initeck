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
        echo json_encode(["status" => "error", "message" => "El ID es requerido"]);
        exit;
    }

    $conn->beginTransaction();

    // 1. Quitar la asociación en empleados
    $stmtEmp = $conn->prepare("UPDATE empleados SET equipo_id = NULL WHERE equipo_id = ?");
    $stmtEmp->execute([$id]);

    // 2. Quitar la asociación en tareas (opcionalmente podemos dejar la tarea libre o simplemente no borrar las tareas sino sólo desvincularlas)
    $stmtTar = $conn->prepare("UPDATE tareas SET equipo_id = NULL WHERE equipo_id = ?");
    $stmtTar->execute([$id]);

    // 3. Borrar el equipo
    $query = "DELETE FROM equipos WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$id]);

    $conn->commit();

    echo json_encode(["status" => "success", "message" => "Equipo eliminado exitosamente"]);
} catch (PDOException $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
