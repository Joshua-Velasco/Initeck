<?php
// Headers CORS son manejados por database.php
require_once '../config/database.php'; 

// 1. INSTANCIAR LA CLASE Y OBTENER LA CONEXIÓN
// Puedes especificar la base de datos explícitamente si lo necesitas:
// $database = new Database('tracker');        // Forzar base de datos local
// $database = new Database('initeckc_tracker'); // Forzar base de datos de producción
$database = new Database(); // Usar configuración automática
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

// Obtener datos del cuerpo de la petición (JSON de React)
$json = file_get_contents('php://input');
$data = json_decode($json, true);

$usuario_input = trim($data['usuario'] ?? '');
$pass_input = $data['pass'] ?? '';

// Validación de entrada
if (empty($usuario_input) || empty($pass_input)) {
    echo json_encode(["status" => "error", "message" => "Usuario y contraseña son requeridos"]);
    exit;
}

try {
    /**
     * CORRECCIÓN CLAVE:
     * Unimos usuarios.empleado_id con empleados.id (que es la llave primaria en empleados).
     * Usamos LEFT JOIN para que si no hay perfil de empleado, el login no falle.
     */
    $sql = "SELECT 
                u.id AS user_id, 
                u.empleado_id, 
                u.usuario, 
                u.password, 
                u.rol, 
                u.requiere_cambio, 
                e.nombre_completo 
            FROM usuarios u 
            LEFT JOIN empleados e ON u.empleado_id = e.id 
            WHERE u.usuario = :usuario LIMIT 1";
            
    $stmt = $db->prepare($sql);
    $stmt->execute([':usuario' => $usuario_input]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Verificar si es cuenta nueva (password vacío) o verificar hash
        $es_primera_vez = empty($user['password']);
        $login_valido = false;

        if ($es_primera_vez) {
            $login_valido = true; 
        } else if (password_verify($pass_input, $user['password'])) {
            $login_valido = true;
        }

        if ($login_valido) {
            // Si el nombre es nulo por el JOIN, usamos el nombre de usuario como respaldo
            $nombre_mostrar = $user['nombre_completo'] ?? $user['usuario'];

            echo json_encode([
                "status" => "success",
                "requiere_cambio" => (bool)$user['requiere_cambio'] || $es_primera_vez,
                "user" => [
                    "id" => (int)$user['empleado_id'], // ID operativo (para buscar vehículos/unidades)
                    "nombre" => $nombre_mostrar,
                    "rol" => $user['rol'], // admin, operator, employee, cleaning, development
                    "usuario_id" => (int)$user['user_id'] // ID de la tabla usuarios
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Contraseña incorrecta"]);
        }
    } else {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "El usuario '$usuario_input' no existe"]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error interno del servidor"]);
}