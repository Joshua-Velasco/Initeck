<?php
// IniAdmin API — Detalle completo de un Proyecto
require_once '../config/database.php';
$db = (new Database())->getConnection();
header('Content-Type: application/json');

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if (!$id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ID de proyecto requerido"]);
    exit;
}

try {
    // 1. Proyecto base
    $stmt = $db->prepare("SELECT p.*, TRIM(e.nombre_completo) as encargado_nombre FROM proyectos p LEFT JOIN empleados e ON p.encargado_id = e.id WHERE p.id = ?");
    $stmt->execute([$id]);
    $proyecto = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$proyecto) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Proyecto no encontrado"]);
        exit;
    }

    // 2. Personal asignado
    $stmtStaff = $db->prepare("
        SELECT 
            pp.empleado_id, 
            pp.rol as rol_en_proyecto, 
            TRIM(e.nombre_completo) as nombre_completo,
            u.usuario,
            eq.nombre as equipo_nombre
        FROM proyecto_personal pp
        JOIN empleados e ON pp.empleado_id = e.id
        LEFT JOIN usuarios u ON e.id = u.empleado_id
        LEFT JOIN equipos eq ON e.equipo_id = eq.id
        WHERE pp.proyecto_id = ?
    ");
    $stmtStaff->execute([$id]);
    $proyecto['personal'] = $stmtStaff->fetchAll(PDO::FETCH_ASSOC);

    // 3. Actividades / Cronograma
    $stmtAct = $db->prepare("
        SELECT a.*, TRIM(e.nombre_completo) as responsable_nombre
        FROM proyecto_actividades a
        LEFT JOIN empleados e ON a.responsable_id = e.id
        WHERE a.proyecto_id = ?
        ORDER BY a.fecha_inicio ASC, a.created_at ASC
    ");
    $stmtAct->execute([$id]);
    $proyecto['actividades'] = $stmtAct->fetchAll(PDO::FETCH_ASSOC);

    // 4. Cliente
    $stmtCli = $db->prepare("SELECT * FROM proyecto_clientes WHERE proyecto_id = ?");
    $stmtCli->execute([$id]);
    $proyecto['cliente'] = $stmtCli->fetch(PDO::FETCH_ASSOC) ?: null;

    // 5. Documentos
    $stmtDoc = $db->prepare("
        SELECT d.*, TRIM(e.nombre_completo) as subido_por_nombre
        FROM proyecto_documentos d
        LEFT JOIN empleados e ON d.subido_por = e.id
        WHERE d.proyecto_id = ?
        ORDER BY d.created_at DESC
    ");
    $stmtDoc->execute([$id]);
    $proyecto['documentos'] = $stmtDoc->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($proyecto);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
