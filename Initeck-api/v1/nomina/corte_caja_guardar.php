<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';
require_once '../utils/firma_utils.php';

$UPLOADS_DIR = dirname(__DIR__) . '/uploads';

$database = new Database();
$db = $database->getConnection();

// Leer campos desde multipart/form-data ($_POST + $_FILES)
$empleado_id          = intval($_POST['empleado_id']          ?? 0);
$admin_id             = intval($_POST['admin_id']             ?? 0);
$periodo_inicio       = trim($_POST['periodo_inicio']         ?? '');
$periodo_fin          = trim($_POST['periodo_fin']            ?? '');
$periodo_label        = trim($_POST['periodo_label']          ?? ($periodo_inicio . ' a ' . $periodo_fin));
$total_registrado_app = floatval($_POST['total_registrado_app'] ?? 0);
$total_recibido       = floatval($_POST['total_recibido']       ?? 0);
$total_ingresos       = floatval($_POST['total_ingresos']       ?? 0);
$total_propinas       = floatval($_POST['total_propinas']       ?? 0);
$total_gastos         = floatval($_POST['total_gastos']         ?? 0);

if (empty($empleado_id) || empty($periodo_inicio) || empty($periodo_fin)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Datos incompletos. Se requiere: empleado_id, periodo_inicio, periodo_fin."]);
    exit();
}

try {
    // Auto-migración: agregar columnas si no existen
    $colCheck = $db->query("SHOW COLUMNS FROM nomina_tickets LIKE 'tipo'")->fetchAll();
    if (empty($colCheck)) {
        $db->exec("ALTER TABLE nomina_tickets ADD COLUMN tipo VARCHAR(20) NOT NULL DEFAULT 'nomina' AFTER empleado_id");
    }
    $colCheck2 = $db->query("SHOW COLUMNS FROM nomina_tickets LIKE 'diferencia'")->fetchAll();
    if (empty($colCheck2)) {
        $db->exec("ALTER TABLE nomina_tickets ADD COLUMN diferencia DECIMAL(10,2) NULL DEFAULT 0 AFTER total_pago");
    }
    $colCheck3 = $db->query("SHOW COLUMNS FROM nomina_tickets LIKE 'deuda_anterior'")->fetchAll();
    if (empty($colCheck3)) {
        $db->exec("ALTER TABLE nomina_tickets ADD COLUMN deuda_anterior DECIMAL(10,2) NULL DEFAULT 0 AFTER diferencia");
    }
    $colCheck4 = $db->query("SHOW COLUMNS FROM nomina_tickets LIKE 'periodo_inicio'")->fetchAll();
    if (empty($colCheck4)) {
        $db->exec("ALTER TABLE nomina_tickets ADD COLUMN periodo_inicio DATE NULL AFTER deuda_anterior");
        $db->exec("ALTER TABLE nomina_tickets ADD COLUMN periodo_fin DATE NULL AFTER periodo_inicio");
    }

    // Calcular deuda anterior acumulada
    $sqlDeuda = "SELECT COALESCE(SUM(diferencia), 0) AS deuda_acumulada
                 FROM nomina_tickets
                 WHERE empleado_id = :empleado_id
                   AND tipo = 'corte_caja'";
    $stmtDeuda = $db->prepare($sqlDeuda);
    $stmtDeuda->bindParam(':empleado_id', $empleado_id, PDO::PARAM_INT);
    $stmtDeuda->execute();
    $deudaRow       = $stmtDeuda->fetch(PDO::FETCH_ASSOC);
    $deuda_anterior = floatval($deudaRow['deuda_acumulada']);

    $diferencia  = round($total_registrado_app - $total_recibido, 2);
    $deuda_total = round($deuda_anterior + $diferencia, 2);

    // Guardar firma del admin como archivo desde $_FILES
    $firma_admin_path = null;
    $firma_admin_at   = null;

    if (!empty($_FILES['firma_admin']) && $_FILES['firma_admin']['error'] === UPLOAD_ERR_OK) {
        $firmaResult = guardarFirmaArchivoFromUpload(
            $_FILES['firma_admin'],
            'admin_corte',
            $empleado_id,
            $UPLOADS_DIR
        );
        if (!$firmaResult['ok']) {
            http_response_code(422);
            echo json_encode(["status" => "error", "message" => "Error al guardar firma del admin: " . $firmaResult['error']]);
            exit();
        }
        $firma_admin_path = $firmaResult['path'];
        $firma_admin_at   = date('Y-m-d H:i:s');
    }

    // Insertar corte de caja
    $query = "INSERT INTO nomina_tickets SET
                empleado_id          = :empleado_id,
                tipo                 = 'corte_caja',
                periodo              = :periodo,
                periodo_inicio       = :periodo_inicio,
                periodo_fin          = :periodo_fin,
                ingresos_brutos      = :ingresos_brutos,
                propinas             = :propinas,
                gastos_chofer        = :gastos_chofer,
                gastos_mantenimiento = 0,
                gastos_taller        = 0,
                depositos            = 0,
                bonos_extras         = 0,
                recibo_id            = '',
                utilidad_total       = :utilidad_total,
                total_pago           = :total_pago,
                diferencia           = :diferencia,
                deuda_anterior       = :deuda_anterior,
                firma_admin          = :firma_admin,
                firma_admin_at       = :firma_admin_at,
                fecha_emision        = NOW()";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':empleado_id',    $empleado_id,          PDO::PARAM_INT);
    $stmt->bindParam(':periodo',        $periodo_label);
    $stmt->bindParam(':periodo_inicio', $periodo_inicio);
    $stmt->bindParam(':periodo_fin',    $periodo_fin);
    $stmt->bindParam(':ingresos_brutos',$total_ingresos);
    $stmt->bindParam(':propinas',       $total_propinas);
    $stmt->bindParam(':gastos_chofer',  $total_gastos);
    $stmt->bindParam(':utilidad_total', $total_registrado_app);
    $stmt->bindParam(':total_pago',     $total_recibido);
    $stmt->bindParam(':diferencia',     $diferencia);
    $stmt->bindParam(':deuda_anterior', $deuda_anterior);
    $stmt->bindParam(':firma_admin',    $firma_admin_path);
    $stmt->bindParam(':firma_admin_at', $firma_admin_at);

    if ($stmt->execute()) {
        $ticket_id = $db->lastInsertId();
        http_response_code(201);
        echo json_encode([
            "status"         => "success",
            "message"        => "Corte de caja guardado. El empleado debe firmar el ticket.",
            "id"             => $ticket_id,
            "deuda_anterior" => $deuda_anterior,
            "diferencia"     => $diferencia,
            "deuda_total"    => $deuda_total
        ]);
    } else {
        http_response_code(503);
        echo json_encode(["status" => "error", "message" => "No se pudo guardar el corte de caja."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
