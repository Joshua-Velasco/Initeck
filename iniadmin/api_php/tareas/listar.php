<?php
require_once '../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    $whereClause = "";
    $params = [];
    $conditions = [];

    // Filtros opcionales
    if (isset($_GET['departamento']) && $_GET['departamento'] !== 'all') {
        $conditions[] = "t.departamento = :departamento";
        $params[':departamento'] = $_GET['departamento'];
    }
    
    if (isset($_GET['estado']) && $_GET['estado'] !== 'all') {
        $conditions[] = "t.estado = :estado";
        $params[':estado'] = $_GET['estado'];
    }
    
    if (isset($_GET['empleado_id']) && !empty($_GET['empleado_id'])) {
        $conditions[] = "t.empleado_id = :empleado_id";
        $params[':empleado_id'] = $_GET['empleado_id'];
    }

    if (count($conditions) > 0) {
        $whereClause = "WHERE " . implode(" AND ", $conditions);
    }

    $query = "
        SELECT 
            t.id, t.titulo, t.descripcion, t.empleado_id, t.equipo_id, t.asignado_por, 
            t.fecha_inicio, t.fecha_fin, t.hora_inicio, t.hora_fin, 
            t.estado, t.prioridad, t.departamento, t.materiales, 
            t.responsabilidades, t.color, t.notas, t.created_at,
            e.nombre_completo as empleado_nombre, e.foto_perfil as empleado_foto,
            eq.nombre as equipo_nombre, eq.color as equipo_color
        FROM tareas t
        LEFT JOIN empleados e ON t.empleado_id = e.id
        LEFT JOIN equipos eq ON t.equipo_id = eq.id
        $whereClause
        ORDER BY t.created_at DESC
    ";

    $stmt = $conn->prepare($query);
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->execute();
    
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($result);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
