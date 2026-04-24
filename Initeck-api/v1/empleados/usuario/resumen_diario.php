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

require_once('../../../config/database.php');
require_once('../utils/shift_utils.php');

$empleado_id = $_GET['empleado_id'] ?? null;

if (!$empleado_id) {
    echo json_encode(["status" => "error", "message" => "ID de empleado faltante"]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Obtener fecha lógica basada en el turno
    $fechaHoy = getLogicalDate($db, $empleado_id);

    // Separamos monto_efectivo, propinas y gastos
    $sql = "SELECT 
                IFNULL(SUM(monto_efectivo), 0) as ingresos, 
                IFNULL(SUM(propinas), 0) as propinas,
                IFNULL(SUM(gastos_total), 0) as gastos 
            FROM liquidaciones 
            WHERE empleado_id = ? AND fecha = ?";

    $stmt = $db->prepare($sql);
    $stmt->execute([$empleado_id, $fechaHoy]);
    $totales = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "ingresos" => (float) $totales['ingresos'],
        "propinas" => (float) $totales['propinas'],
        "gastos" => (float) $totales['gastos']
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error en el servidor: " . $e->getMessage()
    ]);
}