<?php
require_once 'config/database.php';
$database = new Database();
$db = $database->getConnection();

try {
    $stmt = $db->query("DESCRIBE empleados");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($columns, JSON_PRETTY_PRINT);
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
