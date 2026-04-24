<?php
date_default_timezone_set('America/Mexico_City');
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$hostname = $_SERVER['HTTP_HOST'];
$isLocal = ($hostname === 'localhost' || $hostname === '127.0.0.1' || strpos($hostname, '192.168.') === 0);

if ($isLocal) {
    $host = 'localhost';
    $db_name = 'initeckc_tracker';
    $username = 'root';
    $password = ''; // Default XAMPP password is empty
} else {
    $host = 'localhost';
    $db_name = 'initeckc_tracker';
    $username = 'initeckc_adminIniteck';
    $password = 'iEiWA$&UdU704k5b';
}

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->exec("set names utf8mb4");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $exception) {
    echo json_encode(["error" => "Connection error: " . $exception->getMessage()]);
    exit();
}
?>