<?php
require_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

echo "<h1>Esquema de Tabla Usuarios</h1>";
$stmt = $db->query("DESCRIBE usuarios");
$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "<pre>";
print_r($columns);
echo "</pre>";

echo "<h1>Contenido de Usuarios (Roles)</h1>";
$stmt = $db->query("SELECT id, usuario, rol FROM usuarios");
echo "<pre>";
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
echo "</pre>";

?>