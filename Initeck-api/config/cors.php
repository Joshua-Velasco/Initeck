<?php
/**
 * Configuración centralizada de CORS (Cross-Origin Resource Sharing)
 * Este archivo debe ser incluido al inicio de los scripts PHP que necesitan acceso desde el frontend.
 */

// Definir orígenes permitidos
$allowed_origins = [
    'http://localhost:5173', // Vite Frontend
    'http://localhost:3000', // Posible puerto alternativo
    'http://127.0.0.1:5173',
    'capacitor://localhost', // iOS Capacitor
    'http://localhost',       // Android Capacitor
    'https://admin.initeck.com.mx' // Production Root
];

// Obtener el origen de la solicitud
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Verificar si el origen está permitido
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Fallback por defecto para desarrollo local si no coincide (opcional)
    header("Access-Control-Allow-Origin: http://localhost:5173");
}

// Headers permitidos
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Usuario-ID, x-usuario-id");
header("Access-Control-Max-Age: 86400"); // Cache preflight por 24 horas

// Si es una solicitud OPTIONS, terminar aquí
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header("Access-Control-Allow-Origin: http://localhost:5173");
    }
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Usuario-ID, x-usuario-id");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
    http_response_code(200);
    exit();
}
?>