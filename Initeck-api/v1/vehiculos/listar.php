<?php
// Headers CORS son manejados por Apache en .htaccess

// Manejar la petición "preflight" de los navegadores
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Incluimos el empleado asignado para poder bloquear vehículos ocupados en el modal
    $query = "SELECT
                v.id,
                v.unidad_nombre,
                v.placas,
                v.modelo,
                v.estado,
                v.kilometraje_actual,
                v.unidad_medida,
                v.tipo_unidad,
                e.id             AS empleado_asignado_id,
                e.nombre_completo AS empleado_asignado_nombre
              FROM vehiculos v
              LEFT JOIN empleados e ON e.vehiculo_id = v.id
              ORDER BY v.unidad_nombre ASC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($data);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error de base de datos: " . $e->getMessage()]);
}
?>