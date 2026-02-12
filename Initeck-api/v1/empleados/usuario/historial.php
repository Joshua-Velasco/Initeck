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

try {
    $database = new Database();
    $conn = $database->getConnection();


    $empleado_id = $_GET['empleado_id'] ?? null;
    
    // Soporte para rangos o fecha única
    if (isset($_GET['fecha_inicio']) && isset($_GET['fecha_fin'])) {
        $fechaInicio = $_GET['fecha_inicio'];
        $fechaFin = $_GET['fecha_fin'];
    } elseif (isset($_GET['fecha'])) {
        $fechaInicio = $_GET['fecha'];
        $fechaFin = $_GET['fecha'];
    } else {
        $fechaInicio = date('Y-m-d');
        $fechaFin = date('Y-m-d');
    }

    if (!$empleado_id) {
        echo json_encode(["status" => "error", "message" => "ID de empleado requerido"]);
        exit;
    }

    $query = "SELECT id, fecha, hora, viajes, monto_efectivo, propinas, 
                     gastos_total, neto_entregado, detalles_gastos, firma_path
              FROM liquidaciones 
              WHERE empleado_id = :emp_id 
              AND fecha BETWEEN :inicio AND :fin
              ORDER BY fecha DESC, hora DESC";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':emp_id', $empleado_id);
    $stmt->bindParam(':inicio', $fechaInicio);
    $stmt->bindParam(':fin', $fechaFin);
    $stmt->execute();

    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($resultados as &$fila) {
        // Procesar detalles_gastos (JSON a Array)
        if ($fila['detalles_gastos']) {
            $detalles = json_decode($fila['detalles_gastos'], true);
            if (is_array($detalles)) {
                $fila['detalles_gastos'] = $detalles;
            }
        }
    }

    echo json_encode([
        "status" => "success",
        "data" => $resultados
    ]);

} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
}
?>