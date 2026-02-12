<?php
$_SERVER['REMOTE_ADDR'] = '127.0.0.1';
$_SERVER['HTTP_HOST'] = 'localhost';
require_once 'c:/xampp/htdocs/Inimovil/Initeck-api/config/database.php';
$db = (new Database())->getConnection();

$php_time = date('Y-m-d H:i:s');
$mysql_time = $db->query("SELECT NOW()")->fetchColumn();

echo json_encode([
    'php_time' => $php_time,
    'mysql_time' => $mysql_time,
    'diff' => strtotime($php_time) - strtotime($mysql_time)
], JSON_PRETTY_PRINT);
