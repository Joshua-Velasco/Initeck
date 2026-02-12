<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, x-usuario-id");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Si no viene fecha, usamos la de hoy
$fechaBusqueda = $data['fecha'] ?? date("Y-m-d");

try {
    // 1. Obtener las liquidaciones del día
    $sql = "SELECT * FROM liquidaciones WHERE fecha = :fec ORDER BY hora DESC";
    $stmt = $db->prepare($sql);
    $stmt->execute([':fec' => $fechaBusqueda]);
    $liquidaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $gastos_detallados = [];

    // 2. Procesar datos para limpiar Base64 y extraer gastos extras
    foreach ($liquidaciones as &$liq) {
        
        // --- LIMPIEZA DE FIRMA ---
        if (!empty($liq['firma_path'])) {
            // Eliminamos espacios y saltos de línea que rompen el Base64 en el navegador
            $liq['firma_path'] = str_replace(["\r", "\n", " "], '', $liq['firma_path']);
        }

        // --- PROCESAMIENTO DE GASTOS ---
        $detalles = json_decode($liq['detalles_gastos'], true);
        
        if (is_array($detalles)) {
            foreach ($detalles as &$g) {
                // Limpiar la foto del ticket si existe
                if (isset($g['foto'])) {
                    $g['foto'] = str_replace(["\r", "\n", " "], '', $g['foto']);
                }

                // Si el gasto tiene monto, lo agregamos al resumen global de la derecha
                if (!empty($g['monto']) && floatval($g['monto']) > 0) {
                    $gastos_detallados[] = [
                        'id' => uniqid(),
                        'op_id' => $liq['empleado_id'],
                        'concepto' => !empty($g['concepto']) ? $g['concepto'] : "Gasto Extra",
                        'monto' => floatval($g['monto']),
                        'descripcion' => !empty($g['descripcion']) ? $g['descripcion'] : "",
                        'empleado' => $liq['empleado_nombre'] ?? "Operador #" . $liq['empleado_id']
                    ];
                }
            }
            // Guardamos los detalles limpios de vuelta en el objeto para el frontend
            $liq['detalles_gastos'] = json_encode($detalles);
        }
    }

    // 3. Respuesta JSON
    // JSON_UNESCAPED_SLASHES evita que el base64 se llene de barras invertidas \\\\
    echo json_encode([
        "status" => "success",
        "viajes" => $liquidaciones, 
        "gastos_detallados" => $gastos_detallados 
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Error al obtener balance: " . $e->getMessage()
    ]);
}
?>