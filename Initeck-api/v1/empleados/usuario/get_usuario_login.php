<?php
$allowed_origins = ['http://localhost:5173', 'http://localhost:5174', 'https://admin.initeck.com.mx'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, x-usuario-id");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once '../../../config/database.php';

$database = new Database();
$pdo = $database->getConnection();

$usuario_id = $_GET['usuario_id'] ?? null;
if (!$usuario_id) {
    echo json_encode(["success" => false, "usuario" => null]);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT usuario FROM usuarios WHERE id = :id LIMIT 1");
    $stmt->bindParam(':id', $usuario_id, PDO::PARAM_INT);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "usuario" => $row['usuario'] ?? null]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "usuario" => null]);
}
?>
