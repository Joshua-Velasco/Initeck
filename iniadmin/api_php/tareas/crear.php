<?php
require_once '../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // Obtener campos (usamos json_decode de php input si es axios/fetch json payload, o $_POST si es form_data)
    $input = json_decode(file_get_contents("php://input"), true);
    if(!$input) $input = $_POST;

    $titulo = $input['titulo'] ?? '';
    if (empty($titulo)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "El título es requerido"]);
        exit;
    }

    $query = "INSERT INTO tareas (
        titulo, descripcion, empleado_id, equipo_id, asignado_por, 
        fecha_inicio, fecha_fin, hora_inicio, hora_fin, 
        estado, prioridad, departamento, materiales, 
        responsabilidades, color, notas
    ) VALUES (
        :titulo, :descripcion, :empleado_id, :equipo_id, :asignado_por,  
        :fecha_inicio, :fecha_fin, :hora_inicio, :hora_fin, 
        :estado, :prioridad, :departamento, :materiales, 
        :responsabilidades, :color, :notas
    )";

    $stmt = $conn->prepare($query);
    
    // Binding
    $stmt->bindValue(':titulo', $titulo);
    $stmt->bindValue(':descripcion', $input['descripcion'] ?? null);
    
    $emp_id = !empty($input['empleado_id']) ? $input['empleado_id'] : null;
    $stmt->bindValue(':empleado_id', $emp_id);
    
    $eq_id = !empty($input['equipo_id']) ? $input['equipo_id'] : null;
    $stmt->bindValue(':equipo_id', $eq_id);
    
    $asig_por = !empty($input['asignado_por']) ? $input['asignado_por'] : null;
    $stmt->bindValue(':asignado_por', $asig_por);
    
    $f_inicio = !empty($input['fecha_inicio']) ? $input['fecha_inicio'] : null;
    $stmt->bindValue(':fecha_inicio', $f_inicio);
    
    $f_fin = !empty($input['fecha_fin']) ? $input['fecha_fin'] : null;
    $stmt->bindValue(':fecha_fin', $f_fin);
    
    $h_ini = !empty($input['hora_inicio']) ? $input['hora_inicio'] : null;
    $stmt->bindValue(':hora_inicio', $h_ini);
    
    $h_fin = !empty($input['hora_fin']) ? $input['hora_fin'] : null;
    $stmt->bindValue(':hora_fin', $h_fin);
    
    $stmt->bindValue(':estado', $input['estado'] ?? 'pendiente');
    $stmt->bindValue(':prioridad', $input['prioridad'] ?? 'media');
    $stmt->bindValue(':departamento', $input['departamento'] ?? 'campo');
    
    // Convertir array de materiales a JSON o guardarlo como texto
    $materiales = isset($input['materiales']) ? (is_array($input['materiales']) ? json_encode($input['materiales']) : $input['materiales']) : null;
    $stmt->bindValue(':materiales', $materiales);
    
    $stmt->bindValue(':responsabilidades', $input['responsabilidades'] ?? null);
    $stmt->bindValue(':color', $input['color'] ?? '#b91c1c');
    $stmt->bindValue(':notas', $input['notas'] ?? null);

    $stmt->execute();

    echo json_encode([
        "status" => "success", 
        "message" => "Tarea creada exitosamente",
        "id" => $conn->lastInsertId()
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
