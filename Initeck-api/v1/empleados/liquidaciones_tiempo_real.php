<?php
// Headers CORS son manejados por Apache en .htaccess

// Manejar la petición "preflight" de los navegadores
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once '../../config/database.php';

$database = new Database();
$conn = $database->getConnection();

try {
    $fecha = isset($_GET['fecha']) ? $_GET['fecha'] : date('Y-m-d');

    $query = "SELECT 
                l.id, e.nombre_completo as empleado, l.monto_efectivo as monto, l.hora, l.viajes, l.propinas
              FROM liquidaciones l
              JOIN empleados e ON l.empleado_id = e.id
              WHERE l.fecha = :fecha 
              AND (l.monto_efectivo > 0 OR l.propinas > 0)
              AND e.estado != 'Eliminado'
              ORDER BY l.hora DESC";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':fecha', $fecha);
    $stmt->execute();
    $liquidaciones = $stmt->fetchAll();

    echo json_encode(["status" => "success", "data" => $liquidaciones]);
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>