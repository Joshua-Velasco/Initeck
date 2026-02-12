<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/database.php';

$empleado_id = isset($_GET['empleado_id']) ? intval($_GET['empleado_id']) : 0;
$fecha = isset($_GET['fecha']) ? $_GET['fecha'] : date('Y-m-d');

if ($empleado_id <= 0) {
    echo json_encode(["status" => "error", "message" => "ID de empleado no válido"]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT i.*, v.unidad_nombre, v.placas, v.unidad_medida 
              FROM inspecciones_vehiculos i
              JOIN vehiculos v ON i.vehiculo_id = v.id
              WHERE i.empleado_id = :emp_id AND i.fecha = :fecha
              ORDER BY i.id DESC";

    $stmt = $db->prepare($query);
    $stmt->execute([':emp_id' => $empleado_id, ':fecha' => $fecha]);
    $inspecciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $inspecciones]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
