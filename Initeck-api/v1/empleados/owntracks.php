<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Limit-D, X-Limit-U");
header("Content-Type: application/json; charset=UTF-8");

// Log simple para depuración inicial
$logFile = 'owntracks_debug.log';

// LOG START - Con bloqueo para evitar corrupción en concurrencia
file_put_contents($logFile, date('Y-m-d H:i:s') . " - Script Started\n", FILE_APPEND | LOCK_EX);

try {
    // Manejar preflight
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    // Asegurar que aceptamos POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        // Si no es POST, logueamos pero permitimos continuar si es GET (para pruebas)
        // Pero idealmente OwnTracks envía POST.
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Method: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);
    }


    if (!file_exists('../../config/database.php')) {
        throw new \Exception("Database config file not found at ../../config/database.php");
    }

    require_once '../../config/database.php';

    // 1. Obtener contenido
    $input = file_get_contents("php://input");
    
    // Si está vacío, no hacemos nada
    if (empty($input)) {
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Empty Input\n", FILE_APPEND);
        echo json_encode([]);
        exit();
    }

    // Decodificar JSON
    $data = json_decode($input);
    if (json_last_error() !== JSON_ERROR_NONE) {
         throw new \Exception("JSON Decode Error: " . json_last_error_msg());
    }

    // Logging detailed input
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - Input: " . $input . "\n", FILE_APPEND | LOCK_EX);

    // 2. Validar que sea un reporte de ubicación de OwnTracks
    if (isset($data->_type) && $data->_type === 'location') {
        
        $database = new Database();
        $conn = $database->getConnection();

        // 3. Obtener el ID del empleado
        $empleado_id = isset($_GET['empleado_id']) ? intval($_GET['empleado_id']) : null;
        
        if (!$empleado_id) {
             file_put_contents($logFile, date('Y-m-d H:i:s') . " - Missing empleado_id\n", FILE_APPEND);
        }

        if ($empleado_id) {
            // 4. Buscar el vehículo asignado
            $stmtV = $conn->prepare("SELECT vehiculo_id FROM empleados WHERE id = ?");
            $stmtV->execute([$empleado_id]);
            $emp = $stmtV->fetch(PDO::FETCH_ASSOC);
            $vehiculo_id = $emp ? $emp['vehiculo_id'] : null;

            // 5. Preparar datos de ubicación
            $lat = isset($data->lat) ? $data->lat : 0;
            $lon = isset($data->lon) ? $data->lon : 0;
            // Convertir de m/s a km/h (multiplicar por 3.6)
            // El usuario reportó que iba a 50km/h y marcaba 10 (lo que sugiere m/s: 13.8m/s = 50km/h)
            $vel = isset($data->vel) ? ($data->vel * 3.6) : 0;

            // 6. Insertar en la base de datos
            $query = "INSERT INTO rastreo_tiempo_real (empleado_id, vehiculo_id, latitud, longitud, velocidad) 
                      VALUES (:emp_id, :veh_id, :lat, :lng, :vel)";
            
            $stmt = $conn->prepare($query);
            $stmt->bindParam(":emp_id", $empleado_id);
            $stmt->bindParam(":veh_id", $vehiculo_id);
            $stmt->bindParam(":lat", $lat);
            $stmt->bindParam(":lng", $lon);
            $stmt->bindParam(":vel", $vel);

            if ($stmt->execute()) {
                file_put_contents($logFile, date('Y-m-d H:i:s') . " - Success Insert\n", FILE_APPEND);
                echo json_encode([]);
            } else {
                $errorInfo = $stmt->errorInfo();
                file_put_contents($logFile, date('Y-m-d H:i:s') . " - SQL Error: " . print_r($errorInfo, true) . "\n", FILE_APPEND);
                http_response_code(500);
                echo json_encode(["error" => "SQL Error"]);
            }
        }
    } else {
        file_put_contents($logFile, date('Y-m-d H:i:s') . " - Ingoring type: " . (isset($data->_type) ? $data->_type : 'none') . "\n", FILE_APPEND);
        echo json_encode([]);
    }

} catch (\Throwable $e) {
    // Log error
    file_put_contents($logFile, date('Y-m-d H:i:s') . " - FATAL Error: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
