<?php
// IniAdmin API — Crear Reporte de Desempeño
require_once '../config/database.php';
$db = (new Database())->getConnection();
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['supervisor_id']) && !empty($data['empleado_id']) && !empty($data['proyecto_id'])) {
    try {
        $stmt = $db->prepare("
            INSERT INTO reportes_desempeno (proyecto_id, supervisor_id, empleado_id, fecha_reporte, avances, puntos_mejora, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['proyecto_id'],
            $data['supervisor_id'],
            $data['empleado_id'],
            !empty($data['fecha_reporte']) ? $data['fecha_reporte'] : date('Y-m-d'),
            $data['avances'] ?? '',
            $data['puntos_mejora'] ?? '',
            $data['estado'] ?? 'pendiente'
        ]);

        echo json_encode([
            "status" => "success", 
            "message" => "Reporte enviado correctamente", 
            "id" => $db->lastInsertId()
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "supervisor_id, empleado_id and proyecto_id are required"]);
}
?>
