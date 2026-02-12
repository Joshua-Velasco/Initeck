<?php
// Mock $_SERVER for CLI
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REMOTE_ADDR'] = '127.0.0.1';
$_SERVER['HTTP_HOST'] = 'localhost';

require_once 'config/database.php';

echo "List Tables...\n";
$db = new Database();
$conn = $db->getConnection();
$stmt = $conn->query("SHOW TABLES");
$tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
print_r($tables);
?>
