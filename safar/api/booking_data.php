<?php
require_once 'db_config.php';

try {
    // Obtenemos los choferes activos que tienen un vehículo asignado
    $query = "SELECT 
                e.id AS empleado_id, 
                e.nombre_completo AS nombre, 
                v.unidad_nombre AS vehiculo,
                v.placas,
                v.id AS vehiculo_id,
                u.usuario AS codigo_chofer
              FROM empleados e
              JOIN usuarios u ON e.id = u.empleado_id
              JOIN vehiculos v ON e.vehiculo_id = v.id
              WHERE e.estado = 'Activo' 
              ORDER BY e.nombre_completo ASC";
    
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $drivers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "drivers" => $drivers]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error al obtener choferes: " . $e->getMessage()]);
}
?>
