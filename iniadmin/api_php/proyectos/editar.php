<?php
// IniAdmin API — Editar Proyecto
require_once '../config/database.php';
$db = (new Database())->getConnection();
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['id']) && !empty($data['nombre'])) {
    try {
        $stmt = $db->prepare("
            UPDATE proyectos 
            SET nombre = ?, 
                descripcion = ?, 
                fecha_inicio = ?, 
                fecha_fin = ?, 
                estado = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $data['nombre'],
            $data['descripcion'] ?? null,
            !empty($data['fecha_inicio']) ? $data['fecha_inicio'] : null,
            !empty($data['fecha_fin']) ? $data['fecha_fin'] : null,
            $data['estado'] ?? 'activo',
            $data['id']
        ]);

        echo json_encode(["status" => "success", "message" => "Proyecto actualizado correctamente"]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ID and Nombre are required"]);
}
?>
