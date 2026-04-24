<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once '../../config/database.php';
require_once '../utils/firma_utils.php';

$UPLOADS_DIR = dirname(__DIR__) . '/uploads';

$database = new Database();
$db = $database->getConnection();

// Leer campos desde multipart/form-data ($_POST + $_FILES)
$ticket_id   = intval($_POST['ticket_id']   ?? 0);
$empleado_id = intval($_POST['empleado_id'] ?? 0);

if (!$ticket_id || !$empleado_id) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Datos incompletos. Se requiere: ticket_id, empleado_id."]);
    exit;
}

try {
    // Verificar que el ticket pertenece al empleado y no ha sido firmado
    $check = $db->prepare("SELECT id, firma_empleado FROM nomina_tickets WHERE id = :id AND empleado_id = :emp");
    $check->execute([':id' => $ticket_id, ':emp' => $empleado_id]);
    $ticket = $check->fetch(PDO::FETCH_ASSOC);

    if (!$ticket) {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Ticket no encontrado."]);
        exit;
    }

    if (!empty($ticket['firma_empleado'])) {
        echo json_encode(["status" => "error", "message" => "Este ticket ya fue firmado."]);
        exit;
    }

    // Guardar firma como archivo desde $_FILES (evita base64 en body → ModSecurity 403)
    if (empty($_FILES['firma_empleado']) || $_FILES['firma_empleado']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Firma no recibida o error en la subida."]);
        exit;
    }

    $firmaResult = guardarFirmaArchivoFromUpload(
        $_FILES['firma_empleado'],
        'emp',
        $ticket_id,
        $UPLOADS_DIR
    );

    if (!$firmaResult['ok']) {
        http_response_code(422);
        echo json_encode(["status" => "error", "message" => "Error al guardar firma: " . $firmaResult['error']]);
        exit;
    }

    $stmt = $db->prepare("UPDATE nomina_tickets SET firma_empleado = :firma, firmado_at = NOW() WHERE id = :id");
    $stmt->execute([':firma' => $firmaResult['path'], ':id' => $ticket_id]);

    echo json_encode([
        "status"  => "success",
        "message" => "Ticket firmado correctamente.",
        "firma"   => $firmaResult['path']
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
