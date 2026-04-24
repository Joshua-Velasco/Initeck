<?php
// ══════════════════════════════════════════════════
// IniAdmin — Database Configuration
// Connects to 'initeckc_tracker' MySQL database
// ══════════════════════════════════════════════════

// CORS Headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT, PATCH");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Timezone
date_default_timezone_set('America/Mexico_City');

class Database
{
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct()
    {
        // Detect environment
        $whitelist = array('127.0.0.1', '::1', 'localhost');
        $client_ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '127.0.0.1';
        $server_host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost';

        $isClI = php_sapi_name() === 'cli';
        
        $isLocal = $isClI || in_array($client_ip, $whitelist) ||
            in_array($server_host, $whitelist) ||
            strpos($server_host, 'localhost') !== false ||
            strpos($server_host, '127.0.0.1') !== false ||
            strpos($server_host, '192.168.') === 0 ||
            strpos($server_host, '10.') === 0 ||
            strpos($server_host, '172.') === 0;

        if ($isLocal) {
            // LOCAL (XAMPP)
            $this->host = "127.0.0.1";
            $this->db_name = "initeckc_tracker";
            $this->username = "root";
            $this->password = "";
        } else {
            // PRODUCTION
            $this->host = "localhost";
            $this->db_name = "initeckc_tracker";
            $this->username = "initeckc_adminIniteck";
            $this->password = 'iEiWA$&UdU704k5b';
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
            echo json_encode([
                "status" => "error",
                "message" => "Error de conexión a la base de datos",
                "error" => $e->getMessage()
            ]);
            exit;
        }
        return $this->conn;
    }
}
?>
