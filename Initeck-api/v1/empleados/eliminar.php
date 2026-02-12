<?php
// Headers CORS son manejados por Apache en .htaccess

// Manejar la petición "preflight" de los navegadores
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$id = $_GET['id'] ?? null;

if ($id) {
    // Soft Delete: Cambiamos el estado a 'Eliminado' para mantener historial
    $query = "UPDATE empleados SET estado = 'Eliminado' WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":id", $id);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Eliminado"]);
    } else {
        echo json_encode(["status" => "error", "message" => "No se pudo eliminar"]);
    }
}
?>