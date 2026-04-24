<?php
// IniAdmin API — Dashboard Stats
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Total employees
    $stmt_total = $db->query("SELECT COUNT(*) as total FROM empleados WHERE estado != 'Eliminado'");
    $total = $stmt_total->fetch()['total'];

    // Active employees
    $stmt_activos = $db->query("SELECT COUNT(*) as total FROM empleados WHERE estado = 'Activo'");
    $activos = $stmt_activos->fetch()['total'];

    // Inactive employees
    $inactivos = $total - $activos;

    // Distribution by role
    $stmt_roles = $db->query("
        SELECT COALESCE(u.rol, e.rol, 'employee') as rol, COUNT(*) as cantidad
        FROM empleados e
        LEFT JOIN usuarios u ON e.id = u.empleado_id
        WHERE e.estado != 'Eliminado'
        GROUP BY COALESCE(u.rol, e.rol, 'employee')
        ORDER BY cantidad DESC
    ");
    $roles = $stmt_roles->fetchAll(PDO::FETCH_ASSOC);

    // Recent registrations (last 5)
    $stmt_recientes = $db->query("
        SELECT e.id, e.nombre_completo, e.estado, e.fecha_ingreso, u.usuario, u.rol
        FROM empleados e
        LEFT JOIN usuarios u ON e.id = u.empleado_id
        WHERE e.estado != 'Eliminado'
        ORDER BY e.id DESC
        LIMIT 5
    ");
    $recientes = $stmt_recientes->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => [
            "total" => (int) $total,
            "activos" => (int) $activos,
            "inactivos" => (int) $inactivos,
            "roles" => $roles,
            "recientes" => $recientes
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
