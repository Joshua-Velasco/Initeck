<?php
require_once '../../config/database.php';

// Configurar CORS
$allowed_origins = ['http://localhost:5173', 'https://admin.initeck.com.mx'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit;
}

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->id) || !isset($data->estado)) {
        throw new Exception("Datos incompletos");
    }

    $database = new Database();
    $db = $database->getConnection();

    $query = "UPDATE inspecciones_vehiculos SET estado_reporte = ? WHERE id = ?";
    $stmt = $db->prepare($query);

    if ($stmt->execute([$data->estado, $data->id])) {
        echo json_encode(["status" => "success", "message" => "Estado actualizado"]);
    } else {
        throw new Exception("No se pudo actualizar el estado");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>