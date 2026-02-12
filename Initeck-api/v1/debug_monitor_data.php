<?php
// Mock environment variables for CLI execution
if (php_sapi_name() === 'cli') {
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['HTTP_ORIGIN'] = 'http://localhost';
}

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "--- Últimas Sesiones ---\n";
$stmt = $db->query("SELECT * FROM monitor_sesiones ORDER BY id DESC LIMIT 5");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
