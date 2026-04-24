<?php
// IniAdmin API — Listar Reportes de Desempeño
require_once '../config/database.php';
$db = (new Database())->getConnection();
header('Content-Type: application/json');

$supervisor_id = (int)($_GET['supervisor_id'] ?? 0);
$empleado_id   = (int)($_GET['empleado_id']   ?? 0);
$proyecto_id   = (int)($_GET['proyecto_id']   ?? 0);

try {
    $sql = "SELECT 
                r.*, 
                TRIM(e.nombre_completo) as empleado_nombre,
                TRIM(s.nombre_completo) as supervisor_nombre,
                p.nombre as proyecto_nombre
            FROM reportes_desempeno r
            JOIN empleados e ON r.empleado_id = e.id
            JOIN empleados s ON r.supervisor_id = s.id
            JOIN proyectos p ON r.proyecto_id = p.id
            WHERE 1=1";
    $params = [];

    if ($supervisor_id) { $sql .= " AND r.supervisor_id = ?"; $params[] = $supervisor_id; }
    if ($empleado_id)   { $sql .= " AND r.empleado_id = ?";   $params[] = $empleado_id; }
    if ($proyecto_id)   { $sql .= " AND r.proyecto_id = ?";   $params[] = $proyecto_id; }

    $sql .= " ORDER BY r.fecha_reporte DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
