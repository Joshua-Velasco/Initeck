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

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../../config/database.php';

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    $id = $_GET['vehiculo_id'] ?? null;
    
    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Falta ID de vehículo']);
        exit;
    }

    // Cambiamos 'odometro' por 'kilometraje_actual' que es el nombre real en tu tabla
    $stmt = $pdo->prepare("SELECT kilometraje_actual FROM vehiculos WHERE id = ?");
    $stmt->execute([$id]);
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success', 
        // Si el resultado existe, usamos la columna correcta
        'odometro' => $resultado ? (int)$resultado['kilometraje_actual'] : 0
    ]);

} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}