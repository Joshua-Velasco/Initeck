<?php
// IniAdmin API — Asignar Personal a Proyecto
require_once '../config/database.php';
$db = (new Database())->getConnection();
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['proyecto_id']) && !empty($data['empleados'])) {
    try {
        $db->beginTransaction();

        // 1. Eliminar asignaciones actuales si es una sincronización completa
        if (isset($data['sync']) && $data['sync'] === true) {
            $stmtDel = $db->prepare("DELETE FROM proyecto_personal WHERE proyecto_id = ?");
            $stmtDel->execute([$data['proyecto_id']]);
        }

        // 2. Insertar nuevas asignaciones
        $stmtIns = $db->prepare("
            INSERT INTO proyecto_personal (proyecto_id, empleado_id, rol)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE rol = VALUES(rol)
        ");

        foreach ($data['empleados'] as $emp) {
            $stmtIns->execute([
                $data['proyecto_id'],
                $emp['empleado_id'],
                $emp['rol'] // enum('supervisor', 'empleado')
            ]);
        }

        $db->commit();
        echo json_encode(["status" => "success", "message" => "Asignaciones actualizadas"]);
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "proyecto_id and empleados array are required"]);
}
?>
