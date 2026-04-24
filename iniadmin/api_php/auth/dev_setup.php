<?php
/**
 * IniAdmin — Dev Setup Utility
 * Solo funciona en entorno LOCAL. Úsalo para crear o resetear contraseñas.
 * NUNCA subir a producción.
 */

require_once '../config/database.php';

// Bloquear acceso en producción
$isLocal = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'])
    || strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false;

if (!$isLocal) {
    http_response_code(403);
    echo json_encode(['error' => 'Solo disponible en entorno local']);
    exit;
}

$database = new Database();
$db = $database->getConnection();

// ── GET: Listar usuarios disponibles ──────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->query("
        SELECT u.id, u.usuario, u.rol, e.nombre_completo, e.estado
        FROM usuarios u
        JOIN empleados e ON e.id = u.empleado_id
        ORDER BY u.rol, u.usuario
    ");
    $users = $stmt->fetchAll();
    echo json_encode([
        'status'  => 'ok',
        'info'    => 'Usa POST con {usuario, new_password} para resetear una contraseña',
        'usuarios' => $users
    ]);
    exit;
}

// ── POST: Resetear contraseña ─────────────────────────────
$data     = json_decode(file_get_contents('php://input'), true);
$usuario  = trim($data['usuario']      ?? '');
$newPass  = trim($data['new_password'] ?? '');

if (!$usuario || !$newPass || strlen($newPass) < 4) {
    http_response_code(400);
    echo json_encode(['error' => 'Se requiere usuario y new_password (mínimo 4 caracteres)']);
    exit;
}

$stmt = $db->prepare("SELECT id FROM usuarios WHERE usuario = :u");
$stmt->execute([':u' => $usuario]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => "Usuario '$usuario' no encontrado"]);
    exit;
}

$hash = password_hash($newPass, PASSWORD_BCRYPT);
$upd  = $db->prepare("UPDATE usuarios SET password = :p WHERE usuario = :u");
$upd->execute([':p' => $hash, ':u' => $usuario]);

echo json_encode([
    'status'  => 'success',
    'message' => "Contraseña actualizada para '$usuario'. Ya puedes hacer login.",
    'hash_preview' => substr($hash, 0, 20) . '...'
]);
?>
