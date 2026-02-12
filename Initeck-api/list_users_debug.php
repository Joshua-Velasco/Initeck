<?php
$_SERVER['REMOTE_ADDR'] = '127.0.0.1';
$_SERVER['HTTP_HOST'] = 'localhost';
require_once 'c:/xampp/htdocs/Inimovil/Initeck-api/config/database.php';
$db = (new Database())->getConnection();
$users = $db->query("SELECT u.id as usuario_id, u.usuario, u.rol, e.id as empleado_id, e.nombre_completo 
                     FROM usuarios u 
                     JOIN empleados e ON u.empleado_id = e.id")->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($users, JSON_PRETTY_PRINT);
