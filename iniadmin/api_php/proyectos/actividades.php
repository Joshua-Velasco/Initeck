<?php
// IniAdmin API — CRUD Actividades del Cronograma
require_once '../config/database.php';
$db = (new Database())->getConnection();
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? 'create';

try {
    switch ($action) {
        case 'create':
            if (empty($data['proyecto_id']) || empty($data['titulo'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "proyecto_id y titulo son requeridos"]);
                exit;
            }
            $stmt = $db->prepare("
                INSERT INTO proyecto_actividades (proyecto_id, titulo, descripcion, fecha_inicio, fecha_fin, estado, responsable_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $data['proyecto_id'],
                $data['titulo'],
                $data['descripcion'] ?? null,
                !empty($data['fecha_inicio']) ? $data['fecha_inicio'] : null,
                !empty($data['fecha_fin']) ? $data['fecha_fin'] : null,
                $data['estado'] ?? 'pendiente',
                !empty($data['responsable_id']) ? $data['responsable_id'] : null
            ]);
            echo json_encode(["status" => "success", "message" => "Actividad creada", "id" => $db->lastInsertId()]);
            break;

        case 'update':
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "ID de actividad requerido"]);
                exit;
            }
            $stmt = $db->prepare("
                UPDATE proyecto_actividades 
                SET titulo = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, estado = ?, responsable_id = ?
                WHERE id = ?
            ");
            $stmt->execute([
                $data['titulo'],
                $data['descripcion'] ?? null,
                !empty($data['fecha_inicio']) ? $data['fecha_inicio'] : null,
                !empty($data['fecha_fin']) ? $data['fecha_fin'] : null,
                $data['estado'] ?? 'pendiente',
                !empty($data['responsable_id']) ? $data['responsable_id'] : null,
                $data['id']
            ]);
            echo json_encode(["status" => "success", "message" => "Actividad actualizada"]);
            break;

        case 'delete':
            if (empty($data['id'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "ID de actividad requerido"]);
                exit;
            }
            $stmt = $db->prepare("DELETE FROM proyecto_actividades WHERE id = ?");
            $stmt->execute([$data['id']]);
            echo json_encode(["status" => "success", "message" => "Actividad eliminada"]);
            break;

        default:
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Acción no válida"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
