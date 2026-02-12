<?php
require_once 'config/database.php';
$database = new Database();
$db = $database->getConnection();

$q = $db->query("DESCRIBE empleados");
$columns = $q->fetchAll(PDO::FETCH_COLUMN);
echo json_encode($columns);
?>
