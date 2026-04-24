<?php
// IniAdmin API — Listar Proyectos con su personal asignado
require_once '../config/database.php';
$db = (new Database())->getConnection();
header('Content-Type: application/json');

try {
    // 1. Obtener proyectos
    $stmt = $db->query("SELECT * FROM proyectos ORDER BY created_at DESC");
    $proyectos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Para cada proyecto, obtener el personal asignado
    foreach ($proyectos as &$proyecto) {
        $stmtStaff = $db->prepare("
            SELECT 
                p.empleado_id, 
                p.rol as rol_en_proyecto, 
                TRIM(e.nombre_completo) as nombre_completo,
                u.usuario,
                eq.nombre as equipo_nombre
            FROM proyecto_personal p
            JOIN empleados e ON p.empleado_id = e.id
            LEFT JOIN usuarios u ON e.id = u.empleado_id
            LEFT JOIN equipos eq ON e.equipo_id = eq.id
            WHERE p.proyecto_id = ?
        ");
        $stmtStaff->execute([$proyecto['id']]);
        $proyecto['personal'] = $stmtStaff->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode($proyectos);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
