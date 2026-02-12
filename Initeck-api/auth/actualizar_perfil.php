<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, x-usuario-id");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php'; 

// 1. INSTANCIAR LA CLASE Y OBTENER LA CONEXIÓN
$database = new Database();
$db = $database->getConnection(); // Aquí es donde se crea la variable $db que faltaba

$data = json_decode(file_get_contents("php://input"));
// Obtener datos de $_POST (porque $_FILES no viaja en php://input)
$empleado_id = $_POST['empleado_id'] ?? '';
$telefono = $_POST['telefono'] ?? '';
$correo = $_POST['correo'] ?? '';
$password_nueva = $_POST['password'] ?? '';

// Manejo de archivos
$upload_dir = "uploads/documentos/";
if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);

$fotos_sql = "";
$params = [':id' => $empleado_id, ':tel' => $telefono, ':correo' => $correo];

foreach (['foto_ine', 'foto_licencia'] as $campo) {
    if (isset($_FILES[$campo])) {
        $ext = pathinfo($_FILES[$campo]['name'], PATHINFO_EXTENSION);
        $nombre_archivo = $campo . "_" . $empleado_id . "_" . time() . "." . $ext;
        move_uploaded_file($_FILES[$campo]['tmp_name'], $upload_dir . $nombre_archivo);
        $fotos_sql .= ", $campo = :$campo";
        $params[":$campo"] = $nombre_archivo;
    }
}

try {
    // 1. Actualizar datos de empleado
    $sql_emp = "UPDATE empleados SET telefono = :tel, correo_personal = :correo $fotos_sql WHERE id = :id";
    $stmt = $db->prepare($sql_emp);
    $stmt->execute($params);

    // 2. Actualizar contraseña si se envió una
    if (!empty($password_nueva)) {
        $pass_hash = password_hash($password_nueva, PASSWORD_BCRYPT);
        $stmt_pass = $db->prepare("UPDATE usuarios SET password = ?, requiere_cambio = 0 WHERE empleado_id = ?");
        $stmt_pass->execute([$pass_hash, $empleado_id]);
    }

    echo json_encode(["status" => "success", "message" => "Perfil actualizado"]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}