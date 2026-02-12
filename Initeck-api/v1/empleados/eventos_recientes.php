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

    $query = "
        (SELECT 
            l.id, u.usuario, l.hora, l.fecha, 'liquidación' as tipo,
            CONCAT('📥 Liquidación: $', l.monto_efectivo) as `desc`
          FROM liquidaciones l
          JOIN usuarios u ON l.empleado_id = u.empleado_id
          WHERE l.monto_efectivo > 0 AND l.fecha = :fecha1)
        
        UNION ALL
        
        (SELECT 
            l.id, u.usuario, l.hora, l.fecha, 'gasto' as tipo,
            CONCAT('💸 Gastos Reportados: $', l.gastos_total) as `desc`
          FROM liquidaciones l
          JOIN usuarios u ON l.empleado_id = u.empleado_id
          WHERE l.gastos_total > 0 AND l.fecha = :fecha2)
          
        ORDER BY hora DESC";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':fecha1', $fecha);
    $stmt->bindParam(':fecha2', $fecha);
    $stmt->execute();
    $eventos = $stmt->fetchAll();

    echo json_encode(["status" => "success", "data" => $eventos]);
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>