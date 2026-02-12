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
$db = $database->getConnection(); // Aquí es donde se crea la variable $db que faltaba

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->empleado_id)) {
    try {
        // Verificamos que la conexión se haya establecido
        if (!$db) {
            throw new Exception("No se pudo establecer la conexión con la base de datos.");
        }

        $query = "INSERT INTO alertas_sos (
                    empleado_id, 
                    vehiculo_id, 
                    latitud, 
                    longitud, 
                    fecha_hora, 
                    estatus, 
                    leido
                  ) VALUES (
                    :emp, 
                    :veh, 
                    :lat, 
                    :lng, 
                    NOW(), 
                    'ACTIVA', 
                    0
                  )";
        
        $stmt = $db->prepare($query);

        // Extraemos valores a variables simples
        $emp_id = $data->empleado_id;
        $veh_id = isset($data->vehiculo_id) ? $data->vehiculo_id : null;
        $lat    = isset($data->lat) ? $data->lat : null;
        $lng    = isset($data->lng) ? $data->lng : null;

        $stmt->bindValue(':emp', $emp_id);
        $stmt->bindValue(':veh', $veh_id);
        $stmt->bindValue(':lat', $lat);
        $stmt->bindValue(':lng', $lng);

        if($stmt->execute()) {
            echo json_encode([
                "status" => "success", 
                "message" => "Alerta registrada correctamente",
                "id_alerta" => $db->lastInsertId()
            ]);
        } else {
            $errorInfo = $stmt->errorInfo();
            throw new Exception("Error SQL: " . $errorInfo[2]);
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "status" => "error", 
            "message" => $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Falta empleado_id"]);
}
?>