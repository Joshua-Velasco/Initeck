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

    // Obtener datos del cuerpo de la petición (JSON)
    $input = file_get_contents("php://input");
    file_put_contents(__DIR__ . "/gps_log.txt", date('Y-m-d H:i:s') . " - Request: " . $input . "\n", FILE_APPEND);
    $data = json_decode($input);

    if (isset($data->empleado_id) && isset($data->latitud) && isset($data->longitud)) {
        
        // 1. Obtener el vehiculo_id actual del empleado
        $stmtV = $conn->prepare("SELECT vehiculo_id FROM empleados WHERE id = ?");
        $stmtV->execute([$data->empleado_id]);
        $emp = $stmtV->fetch(PDO::FETCH_ASSOC);
        $vehiculo_id = $emp ? $emp['vehiculo_id'] : null;

        // 2. Insertar nueva posición
        $query = "INSERT INTO rastreo_tiempo_real (empleado_id, vehiculo_id, latitud, longitud, velocidad) 
                  VALUES (:emp_id, :veh_id, :lat, :lng, :vel)";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":emp_id", $data->empleado_id);
        $stmt->bindParam(":veh_id", $vehiculo_id);
        $stmt->bindParam(":lat", $data->latitud);
        $stmt->bindParam(":lng", $data->longitud);
        $stmt->bindParam(":vel", $data->velocidad);

        if($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Ubicación actualizada"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
    }
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>