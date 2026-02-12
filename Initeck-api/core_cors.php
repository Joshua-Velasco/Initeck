<?php
// core_cors.php
// Manejador dedicado para solicitudes OPTIONS (CORS Preflight)

// Evitar cualquier salida de texto antes de los headers
ob_start();

// Configurar con origen dinámico o comodín
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Usuario-ID, x-usuario-id");
header("Access-Control-Max-Age: 86400"); // Cache 24 horas

// Limpiar buffer y salir con 200 OK
ob_end_clean();
http_response_code(200);
echo json_encode(["status" => "ok", "message" => "CORS Preflight OK"]);
exit();
?>
