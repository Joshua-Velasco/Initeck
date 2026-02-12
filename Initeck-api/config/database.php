<?php
// Headers CORS con detección de origen dinámica
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT, PATCH");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Usuario-ID, x-usuario-id, x-token");


if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
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

    public function __construct($database_type = null)
    {
        // DEBUG: Mostrar información del entorno
        error_log("=== DATABASE CONSTRUCTOR ===");
        error_log("REMOTE_ADDR: " . $_SERVER['REMOTE_ADDR']);
        error_log("HTTP_HOST: " . ($_SERVER['HTTP_HOST'] ?? 'No definido'));

        // Lista de indicadores de que estamos en LOCAL
        $whitelist = array('127.0.0.1', '::1', 'localhost');

        // Obtener dirección IP del cliente
        $client_ip = $_SERVER['REMOTE_ADDR'];

        // Obtener host del servidor (si está disponible)
        $server_host = $_SERVER['HTTP_HOST'] ?? '';

        // Determinar si estamos en entorno local
        $isLocal = in_array($client_ip, $whitelist) ||
            in_array($server_host, $whitelist) ||
            strpos($server_host, 'localhost') !== false ||
            strpos($server_host, '127.0.0.1') !== false ||
            // Detectar cualquier IP de red local (RFC1918)
            // 192.168.x.x
            strpos($server_host, '192.168.') === 0 ||
            // 10.x.x.x
            strpos($server_host, '10.') === 0 ||
            // 172.16.x.x - 172.31.x.x (Simplificado a 172.)
            strpos($server_host, '172.') === 0;

        error_log("Cliente IP: $client_ip");
        error_log("Servidor Host: $server_host");
        error_log("¿Entorno local?: " . ($isLocal ? 'SÍ' : 'NO'));

        // Permitir selección explícita de base de datos
        if ($database_type === 'tracker') {
            $this->host = "127.0.0.1";  // Usar IP para mejor compatibilidad
            $this->db_name = "tracker";
            $this->username = "root";
            $this->password = "";
            error_log("Configuración explícita: tracker LOCAL");
        } elseif ($database_type === 'initeckc_tracker') {
            $this->host = "localhost";
            $this->db_name = "initeckc_tracker";
            $this->username = "initeckc_adminIniteck";
            $this->password = "iEiWA$&UdU704k5b";
            error_log("Configuración explícita: initeckc_tracker REMOTO");
        } else {
            // Configuración automática basada en entorno
            if ($isLocal) {
                // --- CONFIGURACIÓN LOCAL (XAMPP / WAMP) ---
                $this->host = "127.0.0.1";  // Usar IP en lugar de localhost
                $this->db_name = "tracker";
                $this->username = "root";
                $this->password = "";           // Cadena vacía, NO null
                error_log("Config automática: LOCAL - root@127.0.0.1");
            } else {
                // --- CONFIGURACIÓN PRODUCCIÓN (INFINITYFREE) ---
                $this->host = "localhost";
                $this->db_name = "initeckc_tracker";
                $this->username = "initeckc_adminIniteck";
                $this->password = "iEiWA$&UdU704k5b";
                error_log("Config automática: REMOTO");
            }
        }

        // DEBUG: Mostrar configuración final
        error_log("Config final:");
        error_log("  Host: {$this->host}");
        error_log("  DB: {$this->db_name}");
        error_log("  User: {$this->username}");
        error_log("  Pass: '" . $this->password . "' (length: " . strlen($this->password) . ")");
    }

    public function getConnection()
    {
        $this->conn = null;

        // DEBUG adicional
        error_log("=== INTENTANDO CONEXIÓN ===");
        error_log("Conectando a: mysql:host={$this->host};dbname={$this->db_name}");
        error_log("Usuario: {$this->username}");

        try {
            // DSN con soporte para UTF8 (evita problemas con acentos y la Ñ)
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";

            // Configuración de opciones de PDO
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_TIMEOUT => 5, // Timeout de 5 segundos
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);

            error_log("✅ CONEXIÓN EXITOSA a {$this->db_name}");

        } catch (PDOException $e) {
            // Mensaje de error más detallado
            $error_msg = "Fallo de conexión BD: " . $e->getMessage();
            error_log("❌ " . $error_msg);
            error_log("DSN usado: mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4");
            error_log("Usuario: {$this->username}");

            // Verificar si existe la clase Logger para evitar errores de clase no encontrada
            if (class_exists('Logger')) {
                Logger::log("ERROR", $error_msg);
            }

            // Enviar error en formato JSON con información útil
            http_response_code(500);
            $response = [
                "status" => "error",
                "message" => "Error de conexión a la base de datos",
                "details" => [
                    "environment" => ($this->host == "127.0.0.1" ? "Local" : "Remoto"),
                    "database" => $this->db_name,
                    "host" => $this->host,
                    "error_code" => $e->getCode(),
                    "error_message" => $e->getMessage()
                ],
                "debug" => [
                    "client_ip" => $_SERVER['REMOTE_ADDR'] ?? 'Unknown',
                    "server_host" => $_SERVER['HTTP_HOST'] ?? 'Unknown'
                ]
            ];

            // Solo mostrar detalles de error en entorno local
            if ($this->host == "127.0.0.1") {
                $response["debug"]["dsn"] = $dsn ?? 'Not set';
                $response["debug"]["username"] = $this->username;
            }

            echo json_encode($response);
            exit;
        }
        return $this->conn;
    }

    public function getDatabaseInfo()
    {
        return [
            'host' => $this->host,
            'database' => $this->db_name,
            'username' => $this->username,
            'environment' => ($this->host == "127.0.0.1" ? "Local" : "Remote")
        ];
    }

    public function testConnection()
    {
        try {
            $conn = $this->getConnection();

            // Verificar que podemos ejecutar una consulta simple
            $stmt = $conn->query("SELECT 1 as connection_test");
            $result = $stmt->fetch();

            return [
                'status' => 'success',
                'message' => 'Conexión exitosa a la base de datos',
                'database' => $this->db_name,
                'host' => $this->host,
                'test_query' => $result['connection_test'] === 1 ? 'OK' : 'Failed'
            ];
        } catch (PDOException $e) {
            return [
                'status' => 'error',
                'message' => 'Error de conexión: ' . $e->getMessage(),
                'database' => $this->db_name,
                'host' => $this->host,
                'error_code' => $e->getCode()
            ];
        }
    }

    /**
     * Método para crear la base de datos si no existe (solo para desarrollo local)
     */
    public function createDatabaseIfNotExists()
    {
        if ($this->host !== "127.0.0.1" && $this->host !== "localhost") {
            return ['status' => 'error', 'message' => 'Esta función solo está disponible en entorno local'];
        }

        try {
            // Conectar sin especificar base de datos
            $tempConn = new PDO(
                "mysql:host=" . $this->host . ";charset=utf8mb4",
                $this->username,
                $this->password,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );

            // Crear base de datos si no existe
            $sql = "CREATE DATABASE IF NOT EXISTS `{$this->db_name}` 
                    CHARACTER SET utf8mb4 
                    COLLATE utf8mb4_unicode_ci";

            $tempConn->exec($sql);

            return [
                'status' => 'success',
                'message' => "Base de datos '{$this->db_name}' creada o ya existía",
                'database' => $this->db_name
            ];

        } catch (PDOException $e) {
            return [
                'status' => 'error',
                'message' => 'Error al crear base de datos: ' . $e->getMessage(),
                'database' => $this->db_name
            ];
        }
    }
}

// Función de prueba rápida (descomentar para usar)
function testDatabaseConnection()
{
    $db = new Database();
    $result = $db->testConnection();
    echo "<pre>";
    print_r($result);
    echo "</pre>";
}

// testDatabaseConnection(); // Descomentar para probar
?>