<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$empleado_id = isset($_GET['empleado_id']) ? $_GET['empleado_id'] : null;

try {
    $query = "SELECT r.*, e.nombre_completo as empleado_nombre 
              FROM nomina_recibos_caja r
              LEFT JOIN empleados e ON r.empleado_id = e.id";
    if ($empleado_id) {
        $query .= " WHERE r.empleado_id = :empleado_id";
    }
    $query .= " ORDER BY r.fecha DESC";

    $stmt = $db->prepare($query);
    if ($empleado_id) {
        $stmt->bindParam(":empleado_id", $empleado_id);
    }
    $stmt->execute();

    $recibos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(array("status" => "success", "data" => $recibos));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("status" => "error", "message" => $e->getMessage()));
}
?>
