<?php
// IniAdmin API — Login
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

$usuario  = trim($data['usuario']  ?? '');
$password = trim($data['password'] ?? '');

if (!$usuario || !$password) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Usuario y contraseña son requeridos']);
    exit;
}

try {
    $stmt = $db->prepare("
        SELECT
            u.id,
            u.empleado_id,
            u.usuario,
            u.password,
            u.rol,
            e.nombre_completo,
            e.foto_perfil,
            e.estado
        FROM usuarios u
        INNER JOIN empleados e ON e.id = u.empleado_id
        WHERE u.usuario = :usuario
        LIMIT 1
    ");
    $stmt->execute([':usuario' => $usuario]);
    $user = $stmt->fetch();

    // Usuario no existe
    if (!$user) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Usuario o contraseña incorrectos']);
        exit;
    }

    // Contraseña incorrecta
    if (!password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Usuario o contraseña incorrectos']);
        exit;
    }

    // Cuenta inactiva
    if ($user['estado'] !== 'Activo') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Tu cuenta está inactiva. Contacta al administrador.']);
        exit;
    }

    // Construir nombre de archivo de foto de perfil
    // (puede ser columna DB o detectado por el archivo en sistema)
    $fotoPerfilFile = $user['foto_perfil'];
    if (!$fotoPerfilFile) {
        $userClean = preg_replace('/[^A-Za-z0-9_\-]/', '_', $user['usuario']);
        $uploadDir = __DIR__ . '/../empleados/uploads/';
        $found = glob($uploadDir . $userClean . '_foto_perfil.*');
        if ($found) {
            $fotoPerfilFile = basename($found[0]);
        }
    }

    echo json_encode([
        'status' => 'success',
        'user'   => [
            'id'              => (int) $user['id'],
            'empleado_id'     => (int) $user['empleado_id'],
            'usuario'         => $user['usuario'],
            'nombre_completo' => $user['nombre_completo'],
            'rol'             => $user['rol'],
            'foto_perfil'     => $fotoPerfilFile,
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Error interno: ' . $e->getMessage()]);
}
?>
