<?php
// IniAdmin API — Asignar Encargado del Proyecto
require_once '../config/database.php';
$db = (new Database())->getConnection();
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['proyecto_id'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "proyecto_id es requerido"]);
    exit;
}

try {
    $stmt = $db->prepare("UPDATE proyectos SET encargado_id = ? WHERE id = ?");
    $stmt->execute([
        !empty($data['encargado_id']) ? intval($data['encargado_id']) : null,
        intval($data['proyecto_id'])
    ]);

    echo json_encode(["status" => "success", "message" => "Encargado actualizado"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
