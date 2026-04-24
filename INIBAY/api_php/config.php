<?php
// Headers CORS con lista blanca de orígenes permitidos
$allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5000",
    "http://localhost:5001",
    "http://localhost",
    "https://streaming.initeck.com.mx"
];

if (isset($_SERVER['HTTP_ORIGIN'])) {
    if (in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    } else {
        // Opción: permitir dinámicamente si no quieres ser estricto en local
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    }
} else {
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT, PATCH");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept");

// Manejo de peticiones preflight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT, PATCH");

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    http_response_code(200);
    exit();
}

// Establecer Zona Horaria para todo el sistema (Ciudad Juárez / El Paso)
date_default_timezone_set('America/Denver');

class Database
{
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct()
    {
        // Lista de indicadores de que estamos en LOCAL
        $whitelist = array('127.0.0.1', '::1', 'localhost');
        $client_ip = $_SERVER['REMOTE_ADDR'];
        $server_host = $_SERVER['HTTP_HOST'] ?? '';

        // Determinar si estamos en entorno local
        $isLocal = in_array($client_ip, $whitelist) ||
            in_array($server_host, $whitelist) ||
            strpos($server_host, 'localhost') !== false ||
            strpos($server_host, '127.0.0.1') !== false ||
            strpos($server_host, '192.168.') === 0 ||
            strpos($server_host, '10.') === 0 ||
            strpos($server_host, '172.') === 0;

        if ($isLocal) {
            // --- CONFIGURACIÓN LOCAL (XAMPP / WAMP / MAC) ---
            $this->host = "127.0.0.1";
            $this->db_name = "inibay_tvs"; // Base local
            $this->username = "root";
            $this->password = "";
        } else {
            // --- CONFIGURACIÓN PRODUCCIÓN (HOSPEDANDO.MX) ---
            $this->host = "localhost";
            $this->db_name = "initeckc_streaming"; // Base producción
            $this->username = "initeckc_adminIniteck"; // Usuario de producción
            $this->password = "iEiWA$&UdU704k5b";  // Contraseña de producción
        }
    }

    public function getConnection()
    {
        $this->conn = null;
        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_TIMEOUT => 5,
            ];
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            $response = [
                "error" => "Error de conexión a la base de datos",
                "details" => $e->getMessage()
            ];
            echo json_encode($response);
            exit;
        }
        return $this->conn;
    }
}
?>