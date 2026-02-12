<?php
$_SERVER['REMOTE_ADDR'] = '127.0.0.1';
$_SERVER['HTTP_HOST'] = 'localhost';
require_once 'c:/xampp/htdocs/Inimovil/Initeck-api/config/database.php';
$db = (new Database())->getConnection();
$roles = $db->query("SELECT DISTINCT rol FROM usuarios")->fetchAll(PDO::FETCH_COLUMN);
echo json_encode($roles);
