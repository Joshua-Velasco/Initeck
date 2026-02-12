<?php
require_once 'config/database.php';
require_once 'config/database.php';
$database = new Database('tracker');
$db = $database->getConnection();

try {
    $db->exec("ALTER TABLE empleados ADD COLUMN horario_entrada TIME DEFAULT NULL");
    echo "Column horario_entrada added successfully.\n";
} catch (PDOException $e) {
    echo "Column horario_entrada might already exist or error: " . $e->getMessage() . "\n";
}

try {
    $db->exec("ALTER TABLE empleados ADD COLUMN horario_salida TIME DEFAULT NULL");
    echo "Column horario_salida added successfully.\n";
} catch (PDOException $e) {
    echo "Column horario_salida might already exist or error: " . $e->getMessage() . "\n";
}
?>
