<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$empleado_id = $_GET['empleado_id'] ?? null;
$fecha_inicio = $_GET['fecha_inicio'] ?? null;
$fecha_fin = $_GET['fecha_fin'] ?? null;

try {
    if ($empleado_id) {
        $query = "SELECT t.*, e.nombre_completo as empleado_nombre 
                  FROM nomina_transferencias t
                  LEFT JOIN empleados e ON t.empleado_id = e.id
                  WHERE t.empleado_id = :empleado_id";

        if ($fecha_inicio && $fecha_fin) {
            $query .= " AND t.fecha_inicio_semana >= :inicio AND t.fecha_inicio_semana < :fin";
        }

        $query .= " ORDER BY t.fecha_inicio_semana DESC, t.fecha_ejecucion DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":empleado_id", $empleado_id);
    } else {
        $query = "SELECT t.*, e.nombre_completo as empleado_nombre 
                  FROM nomina_transferencias t
                  LEFT JOIN empleados e ON t.empleado_id = e.id
                  WHERE 1=1";

        if ($fecha_inicio && $fecha_fin) {
            $query .= " AND t.fecha_inicio_semana >= :inicio AND t.fecha_inicio_semana < :fin";
        }

        $query .= " ORDER BY t.fecha_inicio_semana DESC, t.fecha_ejecucion DESC LIMIT 100";
        $stmt = $db->prepare($query);
    }

    if ($fecha_inicio && $fecha_fin) {
        $inicioShifted = date('Y-m-d', strtotime($fecha_inicio . ' -1 day'));
        $finShifted = date('Y-m-d', strtotime($fecha_fin . ' -1 day'));
        $stmt->bindParam(":inicio", $inicioShifted);
        $stmt->bindParam(":fin", $finShifted);
    }

    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(array("status" => "success", "data" => $results));
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(array("status" => "error", "message" => $e->getMessage()));
}
?>