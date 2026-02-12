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

$database = new Database();
$pdo = $database->getConnection();

try {
    // Intentar leer de URL (?empleado_id=1) o de JSON BODY
    $input = json_decode(file_get_contents('php://input'), true);
    $emp_id = isset($_GET['empleado_id']) ? intval($_GET['empleado_id']) : 
              (isset($input['empleado_id']) ? intval($input['empleado_id']) : 0);

    if ($emp_id <= 0) {
        throw new Exception("ID de empleado no recibido o no es válido.");
    }

    // SQL utilizando los nombres reales de tus tablas (según tu DESCRIBE)
    $sql_v = "SELECT v.id, v.unidad_nombre, v.placas, v.kilometraje_actual, v.nivel_gasolina 
              FROM empleados e 
              INNER JOIN vehiculos v ON e.vehiculo_id = v.id 
              WHERE e.id = ?";
    
    $stmt_v = $pdo->prepare($sql_v);
    $stmt_v->execute([$emp_id]);
    $vehiculo = $stmt_v->fetch(PDO::FETCH_ASSOC);

    if (!$vehiculo) {
        throw new Exception("El empleado no tiene unidad asignada en el sistema.");
    }

    // Verificar si ya inspeccionó (tiene una inspección abierta)
    $sql_ins = "SELECT id FROM inspecciones_vehiculos 
                WHERE empleado_id = ? AND vehiculo_id = ? 
                AND odometro_final IS NULL
                ORDER BY id DESC
                LIMIT 1";
    
    $stmt_ins = $pdo->prepare($sql_ins);
    $stmt_ins->execute([$emp_id, $vehiculo['id']]);
    $ya_inspeccionado = $stmt_ins->fetch();

    ob_clean();
    echo json_encode([
        "status" => "success",
        "vehiculo" => $vehiculo,
        "inspeccionado_hoy" => $ya_inspeccionado ? true : false
    ]);

} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        "status" => "error", 
        "message" => $e->getMessage()
    ]);
}