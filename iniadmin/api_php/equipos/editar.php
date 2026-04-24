<?php
require_once '../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    $input = json_decode(file_get_contents("php://input"), true);
    if(!$input) $input = $_POST;

    $id = $input['id'] ?? null;
    $nombre = $input['nombre'] ?? '';
    
    if (empty($id) || empty($nombre)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "ID y nombre son requeridos"]);
        exit;
    }

    $conn->beginTransaction();

    $query = "UPDATE equipos SET 
              nombre = :nombre, 
              descripcion = :descripcion, 
              encargado_id = :encargado_id, 
              color = :color 
              WHERE id = :id";
    $stmt = $conn->prepare($query);
    
    $stmt->bindValue(':id', $id);
    $stmt->bindValue(':nombre', $nombre);
    $stmt->bindValue(':descripcion', $input['descripcion'] ?? null);
    
    $enc_id = !empty($input['encargado_id']) ? $input['encargado_id'] : null;
    $stmt->bindValue(':encargado_id', $enc_id);
    $stmt->bindValue(':color', $input['color'] ?? '#0891b2');
    
    $stmt->execute();

    // Actualizar miembros. 
    // 1. Quitar equipo_id de los empleados que antes estaban pero ahora no. (Limpiar todo primero)
    $cleanQuery = "UPDATE empleados SET equipo_id = NULL WHERE equipo_id = ?";
    $cleanStmt = $conn->prepare($cleanQuery);
    $cleanStmt->execute([$id]);

    // 2. Insertar los nuevos. 
    if (isset($input['miembros']) && is_array($input['miembros']) && count($input['miembros']) > 0) {
        $updateQuery = "UPDATE empleados SET equipo_id = ? WHERE id = ?";
        $updStmt = $conn->prepare($updateQuery);
        foreach ($input['miembros'] as $empId) {
            $updStmt->execute([$id, $empId]);
        }
    }

    $conn->commit();

    echo json_encode(["status" => "success", "message" => "Equipo actualizado"]);
} catch (PDOException $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
