<?php
// IniAdmin API — Eliminar Empleado (Soft Delete)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$id = $_GET['id'] ?? null;

if ($id) {
    // Soft Delete
    $query = "UPDATE empleados SET estado = 'Eliminado' WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $id);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Empleado eliminado"]);
    } else {
        echo json_encode(["status" => "error", "message" => "No se pudo eliminar"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ID no proporcionado"]);
}
?>
