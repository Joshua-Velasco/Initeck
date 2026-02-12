<?php
// El API Gateway ahora depende de database.php (incluido indirectamente en los endpoints) 
// o maneja su propia lógica si no incluye database.php.
// Para seguridad, nos aseguramos de que database.php se incluya aquí para tener los headers CORS
require_once 'config/database.php';

// Obtener la ruta solicitada
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/Initeck-api', '', $path); // Remover el prefijo de la API

// Eliminar query string
$path = explode('?', $path)[0];

// Enrutamiento simple
switch ($path) {
    case '/auth/session_keepalive':
    case '/auth/session_keepalive.php':
        include_once 'auth/session_keepalive.php';
        break;
    case '/auth/check_session':
    case '/auth/check_session.php':
        include_once 'auth/check_session.php';
        break;
    case '/auth/login':
    case '/auth/login.php':
        include_once 'auth/login.php';
        break;
    case '/v1/vehiculos':
    case '/v1/vehiculos/vehiculos.php':
        include_once 'v1/vehiculos/vehiculos.php';
        break;
    case '/v1/vehiculos/listar':
    case '/v1/vehiculos/listar.php':
        include_once 'v1/vehiculos/listar.php';
        break;
    case '/v1/vehiculos/mantenimiento':
    case '/v1/vehiculos/vehiculosMantenimiento.php':
        include_once 'v1/vehiculos/vehiculosMantenimiento.php';
        break;
    case '/v1/empleados':
    case '/v1/empleados/empleados.php':
        include_once 'v1/empleados/empleados.php';
        break;
    case '/v1/empleados/listar':
    case '/v1/empleados/listar.php':
        include_once 'v1/empleados/listar.php';
        break;
    case '/v1/empleados/crear':
    case '/v1/empleados/crear.php':
        include_once 'v1/empleados/crear.php';
        break;
    case '/v1/empleados/editar':
    case '/v1/empleados/editar.php':
        include_once 'v1/empleados/editar.php';
        break;
    case '/v1/empleados/eliminar':
    case '/v1/empleados/eliminar.php':
        include_once 'v1/empleados/eliminar.php';
        break;
    case '/v1/viajes':
    case '/v1/viajes/viajes.php':
        include_once 'v1/viajes/viajes.php';
        break;
    case '/v1/balance':
    case '/v1/balance/balance.php':
        include_once 'v1/balance/balance.php';
        break;
    case '/v1/dashboard':
    case '/v1/dashboard/dashboard.php':
        include_once 'v1/dashboard/dashboard.php';
        break;
    default:
        // Intentar servir el archivo directamente si existe
        $file_path = __DIR__ . $path;
        if (file_exists($file_path) && is_file($file_path)) {
            include_once $file_path;
        } else {
            http_response_code(404);
            echo json_encode([
                "status" => "error",
                "message" => "Endpoint no encontrado: " . $path
            ]);
        }
        break;
}
?>
