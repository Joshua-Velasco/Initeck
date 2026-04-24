<?php
// IniAdmin API — Listar Divisiones
require_once '../config/database.php';
$db = (new Database())->getConnection();
header('Content-Type: application/json');

try {
    $stmt = $db->query("SELECT id, nombre, color, slug FROM divisiones ORDER BY nombre ASC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
