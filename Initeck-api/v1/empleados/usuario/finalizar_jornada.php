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

// $json = file_get_contents('php://input');
// $data = json_decode($json, true);

// CAMBIO: Usar $_POST para soportar FormData y evitar bloqueos WAF (403)
$empleado_id = $_POST['operador_id'] ?? null;
$vehiculo_id = $_POST['vehiculo_id'] ?? null;
$odo_final = intval($_POST['odometro_final'] ?? 0);
$gas_final = intval($_POST['gasolina_final'] ?? 0);
$comentarios = $_POST['comentarios'] ?? null;

try {
    $database = new Database();
    $db = $database->getConnection();
    $db->beginTransaction();

    // 1. OBTENER RESUMEN FINANCIERO
    $sqlSum = "SELECT 
                (IFNULL(SUM(monto_efectivo), 0) + IFNULL(SUM(propinas), 0)) as suma_ingresos, 
                IFNULL(SUM(gastos_total), 0) as suma_gastos 
               FROM liquidaciones 
               WHERE empleado_id = ? AND fecha = CURDATE()";

    $stmtSum = $db->prepare($sqlSum);
    $stmtSum->execute([$empleado_id]);
    $res = $stmtSum->fetch();

    $ingresos = (float) ($res['suma_ingresos'] ?? 0);
    $gastos = (float) ($res['suma_gastos'] ?? 0);

    // En tu finalizar_jornada.php, dentro del try-catch:

    // 1. Actualizas la tabla de inspecciones (el registro de hoy)
    // 1. Actualizas la tabla de inspecciones (BUSCAMOS LA ABIERTA, sin depender de CURDATE estricto)
    $sqlIns = "UPDATE inspecciones_vehiculos SET 
                odometro_final = ?, 
                gasolina_final = ?,
                comentarios_final = ?
            WHERE empleado_id = ? AND vehiculo_id = ? AND odometro_final IS NULL 
            ORDER BY id DESC LIMIT 1";

    $stmtUpd = $db->prepare($sqlIns);
    $stmtUpd->execute([$odo_final, $gas_final, $comentarios, $empleado_id, $vehiculo_id]);
    $affected = $stmtUpd->rowCount();

    // LOG DE DEPURACION
    file_put_contents("debug_finalize.log", date('Y-m-d H:i:s') . " - Emp: $empleado_id, Veh: $vehiculo_id. Filas afectadas: $affected\n", FILE_APPEND);

    if ($affected === 0) {
        // Si no actualizó nada, averigüemos por qué
        $check = $db->query("SELECT id, odometro_final FROM inspecciones_vehiculos WHERE empleado_id=$empleado_id AND vehiculo_id=$vehiculo_id ORDER BY id DESC LIMIT 1")->fetch(PDO::FETCH_ASSOC);
        file_put_contents("debug_finalize.log", "   -> Check DB: " . json_encode($check) . "\n", FILE_APPEND);
    }

    // 2. CLAVE: Actualizas la tabla de vehiculos para que el cambio sea global
    $sqlVeh = "UPDATE vehiculos SET 
                kilometraje_actual = ?, 
                nivel_gasolina = ? 
            WHERE id = ?";
    $db->prepare($sqlVeh)->execute([$odo_final, $gas_final, $vehiculo_id]);

    $db->commit();

    echo json_encode([
        "status" => "success",
        "resumen" => [
            "ingresos" => $ingresos,
            "gastos" => $gastos,
            "total" => $ingresos - $gastos
        ]
    ]);

} catch (Exception $e) {
    if (isset($db))
        $db->rollBack();
    echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
}