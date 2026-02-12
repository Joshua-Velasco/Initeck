<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$empleado_id = isset($_GET['empleado_id']) ? $_GET['empleado_id'] : '';

if (!empty($empleado_id)) {
    try {
        $query = "SELECT * FROM nomina_tickets 
                  WHERE empleado_id = :empleado_id 
                  ORDER BY fecha_emision DESC";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":empleado_id", $empleado_id);
        $stmt->execute();

        $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(array("status" => "success", "data" => $tickets));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("status" => "error", "message" => $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("status" => "error", "message" => "ID de empleado no proporcionado."));
}
?>