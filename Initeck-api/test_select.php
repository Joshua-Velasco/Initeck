<?php
require_once 'config/database.php';
$database = new Database();
$db = $database->getConnection();

try {
    $stmt = $db->query("SELECT horario_entrada, horario_salida FROM empleados LIMIT 1");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(["status" => "success", "data" => $row]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
