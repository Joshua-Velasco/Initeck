<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, x-usuario-id");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$usuario_id = $data['usuario_id'];
$nueva_pass = $data['password'];

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Encriptamos la nueva contraseña
    $hash = password_hash($nueva_pass, PASSWORD_BCRYPT);
    
    $sql = "UPDATE usuarios SET password = :pass, requiere_cambio = 0 WHERE id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute([':pass' => $hash, ':id' => $usuario_id]);

    echo json_encode(["status" => "success", "message" => "Contraseña actualizada"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}