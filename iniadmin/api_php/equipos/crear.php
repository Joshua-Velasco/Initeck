<?php
require_once '../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    $input = json_decode(file_get_contents("php://input"), true);
    if(!$input) $input = $_POST;

    $nombre = $input['nombre'] ?? '';
    if (empty($nombre)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "El nombre del equipo es requerido"]);
        exit;
    }

    $conn->beginTransaction();

    $query = "INSERT INTO equipos (nombre, descripcion, encargado_id, color) VALUES (:nombre, :descripcion, :encargado_id, :color)";
    $stmt = $conn->prepare($query);
    
    $stmt->bindValue(':nombre', $nombre);
    $stmt->bindValue(':descripcion', $input['descripcion'] ?? null);
    
    $enc_id = !empty($input['encargado_id']) ? $input['encargado_id'] : null;
    $stmt->bindValue(':encargado_id', $enc_id);
    $stmt->bindValue(':color', $input['color'] ?? '#0891b2');
    
    $stmt->execute();
    $newTeamId = $conn->lastInsertId();

    // Si se enviaron miembros iniciales en un array de IDs, asignarlos
    if (isset($input['miembros']) && is_array($input['miembros']) && count($input['miembros']) > 0) {
        $updateQuery = "UPDATE empleados SET equipo_id = ? WHERE id = ?";
        $updStmt = $conn->prepare($updateQuery);
        foreach ($input['miembros'] as $empId) {
            $updStmt->execute([$newTeamId, $empId]);
        }
    }

    $conn->commit();

    echo json_encode([
        "status" => "success", 
        "message" => "Equipo creado exitosamente",
        "id" => $newTeamId
    ]);
} catch (PDOException $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
