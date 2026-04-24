<?php
// IniAdmin API — Crear Proyecto
require_once '../config/database.php';
$db = (new Database())->getConnection();
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['nombre'])) {
    try {
        $stmt = $db->prepare("
            INSERT INTO proyectos (nombre, descripcion, fecha_inicio, fecha_fin, estado)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['nombre'],
            $data['descripcion'] ?? null,
            !empty($data['fecha_inicio']) ? $data['fecha_inicio'] : null,
            !empty($data['fecha_fin']) ? $data['fecha_fin'] : null,
            $data['estado'] ?? 'activo'
        ]);

        echo json_encode([
            "status" => "success", 
            "message" => "Proyecto creado correctamente", 
            "id" => $db->lastInsertId()
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Nombre is required"]);
}
?>
