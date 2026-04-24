<?php
require_once '../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Consultamos los equipos y para cada uno obtenemos los datos del encargado
    // y la cantidad de miembros que tienen en la tabla empleados
    $query = "
        SELECT 
            eq.id, eq.nombre, eq.descripcion, eq.encargado_id, eq.color, eq.created_at,
            e.nombre_completo as encargado_nombre,
            e.foto_perfil as encargado_foto,
            (SELECT COUNT(*) FROM empleados m WHERE m.equipo_id = eq.id AND m.estado = 'Activo') as miembros_count
        FROM equipos eq
        LEFT JOIN empleados e ON eq.encargado_id = e.id
        ORDER BY eq.nombre ASC
    ";

    $stmt = $conn->prepare($query);
    $stmt->execute();
    
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Opcional: Para cada equipo podríamos traer la lista de miembros para que el frontend los reciba pre-cargados
    foreach ($result as &$equipo) {
        $miembrosQuery = "SELECT id, nombre_completo, rol, foto_perfil FROM empleados WHERE equipo_id = ? AND estado = 'Activo' ORDER BY nombre_completo ASC";
        $mStmt = $conn->prepare($miembrosQuery);
        $mStmt->execute([$equipo['id']]);
        $equipo['miembros'] = $mStmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo json_encode($result);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
