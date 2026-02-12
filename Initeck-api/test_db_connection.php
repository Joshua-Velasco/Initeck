<?php
// Mock $_SERVER for CLI
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REMOTE_ADDR'] = '127.0.0.1';
$_SERVER['HTTP_HOST'] = 'localhost';

require_once 'config/database.php';

echo "Testing Database Connection...\n";
$db = new Database();
$result = $db->testConnection();
echo "Result:\n";
print_r($result);
?>
