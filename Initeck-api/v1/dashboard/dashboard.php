<?php
// 1. Encabezados de respuesta (DEBEN IR AL PRINCIPIO)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, x-usuario-id");
header("Content-Type: application/json; charset=UTF-8");

// Manejo de peticiones preflight de CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Importaciones con rutas absolutas seguras
require_once '../../config/database.php';
require_once __DIR__ . '/../logs/logger.php';

$database = new Database();
$db = $database->getConnection();

// 3. Lectura de datos JSON
$data = json_decode(file_get_contents("php://input"));

// Si el JSON está vacío o mal formado, evitamos que el script falle
if(!$data || !isset($data->user_id) || !isset($data->role_id)) {
    Logger::log("SECURITY", "Intento de acceso al dashboard con datos incompletos.");
    http_response_code(400);
    echo json_encode(["error" => "Credenciales no proporcionadas"]);
    exit;
}

$userId = $data->user_id;
$role = $data->role_id; 
$response = [];

try {
    if($role == 1) { // ADMINISTRADOR
        Logger::log("INFO", "Admin (ID: $userId) consultó métricas globales.");
        
        // Usamos COALESCE para asegurar que devuelva 0 en lugar de null si no hay datos
        $q = $db->query("SELECT 
            COALESCE(SUM(ingreso_total), 0) as ingresos, 
            COALESCE(SUM(propinas), 0) as propinas, 
            COALESCE(SUM(km_recorridos), 0) as km 
            FROM viajes");
        $response['metrics'] = $q->fetch(PDO::FETCH_ASSOC);
        
        // Consulta para Pareto
        $qp = $db->query("SELECT 
            v.unidad_nombre as name, 
            COALESCE(SUM(t.ingreso_total), 0) as ingresos 
            FROM vehiculos v 
            LEFT JOIN viajes t ON v.id = t.vehiculo_id 
            GROUP BY v.id 
            ORDER BY ingresos DESC");
        $response['pareto'] = $qp->fetchAll(PDO::FETCH_ASSOC);
        
    } else { // EMPLEADO
        Logger::log("INFO", "Empleado (ID: $userId) consultó su rendimiento personal.");
        
        $stmt = $db->prepare("SELECT 
            COALESCE(SUM(ingreso_total), 0) as ingresos, 
            COALESCE(SUM(propinas), 0) as propinas, 
            COALESCE(SUM(km_recorridos), 0) as km 
            FROM viajes WHERE usuario_id = :uid");
        $stmt->bindParam(":uid", $userId);
        $stmt->execute();
        $response['metrics'] = $stmt->fetch(PDO::FETCH_ASSOC);
        $response['pareto'] = []; // El empleado no ve pareto, devolvemos array vacío
    }

    // 4. Salida final (Única salida de texto del script)
    echo json_encode($response);

} catch (Exception $e) {
    Logger::log("ERROR", "Error en dashboard para usuario $userId: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "error" => "Error interno del servidor",
        "details" => $e->getMessage()
    ]);
}
?>