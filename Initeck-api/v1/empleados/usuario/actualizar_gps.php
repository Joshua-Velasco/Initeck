<?php
// Detectar el entorno y configurar CORS dinámicamente
$allowed_origins = [
    'http://localhost:5173',
    'https://admin.initeck.com.mx'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, x-usuario-id");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../../config/database.php'; 

// 1. INSTANCIAR LA CLASE Y OBTENER LA CONEXIÓN
$database = new Database();
$conn = $database->getConnection();

// 4. Obtener los datos enviados por React
$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->empleado_id) &&
    !empty($data->vehiculo_id) &&
    isset($data->lat) &&
    isset($data->lng)
) {
    try {
        // 5. Insertar en la tabla de historial de GPS
        // Asumiendo que tu tabla se llama 'gps_historial'
        $query = "INSERT INTO gps_historial 
                  (empleado_id, vehiculo_id, latitud, longitud, fecha_registro) 
                  VALUES (:emp, :veh, :lat, :lng, NOW())";

        $stmt = $conn->prepare($query);

        $stmt->bindParam(':emp', $data->empleado_id);
        $stmt->bindParam(':veh', $data->vehiculo_id);
        $stmt->bindParam(':lat', $data->lat);
        $stmt->bindParam(':lng', $data->lng);

        if ($stmt->execute()) {
            // OPCIONAL: También puedes actualizar la ubicación actual en la tabla vehiculos
            $updateVehiculo = "UPDATE vehiculos SET 
                               ultima_latitud = :lat, 
                               ultima_longitud = :lng, 
                               ultima_actualizacion = NOW() 
                               WHERE id = :veh";
            $stmtUpdate = $conn->prepare($updateVehiculo);
            $stmtUpdate->bindParam(':lat', $data->lat);
            $stmtUpdate->bindParam(':lng', $data->lng);
            $stmtUpdate->bindParam(':veh', $data->vehiculo_id);
            $stmtUpdate->execute();

            echo json_encode(["status" => "success", "message" => "Ubicación actualizada"]);
        } else {
            echo json_encode(["status" => "error", "message" => "No se pudo guardar la ubicación"]);
        }
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
}
?>