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
    // Usamos los nombres exactos: unidad_nombre, placas, kilometraje_actual, etc.
    $query = "SELECT 
                id, 
                unidad_nombre, 
                placas, 
                modelo, 
                estado, 
                kilometraje_actual,
                unidad_medida,
                tipo_unidad
              FROM vehiculos 
              ORDER BY unidad_nombre ASC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($data);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Error de base de datos: " . $e->getMessage()]);
}
?>