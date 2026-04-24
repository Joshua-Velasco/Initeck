<?php
// Headers CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    ob_clean();
    echo json_encode(["status" => "error", "message" => "Error de conexión centralizada"]);
    exit;
}

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'POST') {
    // Recibir datos JSON
    $input = json_decode(file_get_contents("php://input"), true);
    
    $empleado_id = $input['empleado_id'] ?? null;
    $vehiculo_id = $input['vehiculo_id'] ?? null;
    $mensaje = $input['mensaje'] ?? '';

    if (!$empleado_id || !$vehiculo_id || empty($mensaje)) {
        ob_clean();
        echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
        exit;
    }

    try {
        $sql = "INSERT INTO taller_mensajes_operativos (empleado_id, vehiculo_id, mensaje) VALUES (?, ?, ?)";
        $stmt = $db->prepare($sql);
        $res = $stmt->execute([$empleado_id, $vehiculo_id, $mensaje]);

        ob_clean();
        echo json_encode(["status" => $res ? "success" : "error"]);
    } catch (PDOException $e) {
        ob_clean();
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método no permitido"]);
}
?>
