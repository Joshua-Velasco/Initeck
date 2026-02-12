<?php
$_SERVER['REMOTE_ADDR'] = '127.0.0.1';
$_SERVER['HTTP_HOST'] = 'localhost';
require_once 'c:/xampp/htdocs/Inimovil/Initeck-api/config/database.php';
$db = (new Database())->getConnection();

$res = $db->query("SELECT r.*, e.nombre_completo 
                   FROM rastreo_tiempo_real r 
                   JOIN empleados e ON r.empleado_id = e.id 
                   ORDER BY r.timestamp DESC LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($res, JSON_PRETTY_PRINT);
