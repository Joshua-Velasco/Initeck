<?php
$_SERVER['REMOTE_ADDR'] = '127.0.0.1';
$_SERVER['HTTP_HOST'] = 'localhost';
require_once 'c:/xampp/htdocs/Inimovil/Initeck-api/config/database.php';
$db = (new Database())->getConnection();

// Eliminar todos los registros de rastreo para empezar de cero con datos reales
$count = $db->exec("DELETE FROM rastreo_tiempo_real");

echo json_encode([
    "status" => "success",
    "message" => "Se han eliminado $count registros de rastreo (datos de prueba limpios)."
], JSON_PRETTY_PRINT);
