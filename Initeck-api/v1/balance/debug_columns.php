<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Check columns for 'mantenimientos'
    $stmt = $db->query("DESCRIBE mantenimientos");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "<h1>Columnas de Empleados</h1>";
    echo "<pre>";
    print_r($columns);
    echo "</pre>";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>