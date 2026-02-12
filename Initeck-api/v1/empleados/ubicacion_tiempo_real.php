<?php
// Headers CORS son manejados por Apache en .htaccess

// Manejar la petición "preflight" de los navegadores
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once '../../config/database.php';

try {
    // 1. Instanciar la clase Database
    $database = new Database();
    
    // 2. Obtener la conexión a través del método getConnection()
    $conn = $database->getConnection();

    // 3. Ahora $conn ya no es null y tiene la conexión PDO
    $query = "SELECT 
                e.id, 
                e.nombre_completo, 
                u.usuario,
                v.unidad_nombre as vehiculo_nombre,
                v.kilometraje_actual as km_dia,
                r.latitud, 
                r.longitud, 
                r.velocidad,
                r.timestamp as ultima_actividad,
                TIMESTAMPDIFF(SECOND, r.timestamp, NOW()) as tiempo_inactividad,
                COALESCE((SELECT SUM(monto_efectivo) FROM liquidaciones WHERE empleado_id = e.id AND fecha = CURDATE()), 0) as monto_dia
              FROM empleados e
              INNER JOIN usuarios u ON e.id = u.empleado_id
              LEFT JOIN vehiculos v ON e.vehiculo_id = v.id
              LEFT JOIN (
                  SELECT t1.* FROM rastreo_tiempo_real t1
                  WHERE t1.id = (SELECT MAX(t2.id) FROM rastreo_tiempo_real t2 WHERE t2.empleado_id = t1.empleado_id)
              ) r ON e.id = r.empleado_id
              WHERE e.estado != 'Eliminado'";

    $stmt = $conn->prepare($query);
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $data]);
} catch(PDOException $e) {
    // Es importante devolver un código de error si algo falla
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>