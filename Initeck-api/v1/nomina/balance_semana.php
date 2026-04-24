<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';
require_once '../utils/shift_utils_v2.php';

$database = new Database();
$db = $database->getConnection();

$empleado_id = $_GET['empleado_id'] ?? null;
$fecha_inicio = $_GET['fecha_inicio'] ?? null;
$fecha_fin    = $_GET['fecha_fin']    ?? null;

if (!$empleado_id || !$fecha_inicio || !$fecha_fin) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Parámetros incompletos: empleado_id, fecha_inicio, fecha_fin."]);
    exit();
}

try {
    // --- AUTO-MIGRACIÓN: Asegurar que las tablas y columnas existan ---
    $db->exec("CREATE TABLE IF NOT EXISTS nomina_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        empleado_id INT NOT NULL,
        tipo VARCHAR(20) DEFAULT 'nomina',
        periodo VARCHAR(100),
        periodo_inicio DATE,
        periodo_fin DATE,
        ingresos_brutos DECIMAL(10,2),
        propinas DECIMAL(10,2),
        gastos_chofer DECIMAL(10,2),
        utilidad_total DECIMAL(10,2),
        total_pago DECIMAL(10,2),
        diferencia DECIMAL(10,2),
        deuda_anterior DECIMAL(10,2),
        recibo_id VARCHAR(50),
        firma_admin VARCHAR(255),
        firma_admin_at DATETIME,
        fecha_emision DATETIME
    )");

    // Asegurar que columnas específicas existan (para bases de datos ya creadas sin ellas)
    $columnsToCheck = [
        'tipo'           => "VARCHAR(20) NOT NULL DEFAULT 'nomina' AFTER empleado_id",
        'periodo_inicio' => "DATE NULL AFTER periodo",
        'periodo_fin'    => "DATE NULL AFTER periodo_inicio",
        'diferencia'     => "DECIMAL(10,2) NULL DEFAULT 0 AFTER total_pago",
        'deuda_anterior' => "DECIMAL(10,2) NULL DEFAULT 0 AFTER diferencia"
    ];

    foreach ($columnsToCheck as $col => $definition) {
        $check = $db->query("SHOW COLUMNS FROM nomina_tickets LIKE '$col'")->fetchAll();
        if (empty($check)) {
            $db->exec("ALTER TABLE nomina_tickets ADD COLUMN $col $definition");
        }
    }

    $filter = getOperationalDayFilter($fecha_inicio, $fecha_fin, 'l');

    $sql = "SELECT
                COALESCE(SUM(l.monto_efectivo), 0)  AS total_ingresos,
                COALESCE(SUM(l.propinas), 0)         AS total_propinas,
                COALESCE(SUM(l.gastos_total), 0)     AS total_gastos,
                COALESCE(SUM(l.neto_entregado), 0)   AS total_neto,
                COUNT(*)                             AS total_jornadas
            FROM liquidaciones l
            WHERE l.empleado_id = :empleado_id
              AND " . $filter['where'];

    $stmt = $db->prepare($sql);
    $stmt->bindParam(':empleado_id', $empleado_id, PDO::PARAM_INT);
    foreach ($filter['params'] as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    // Restar lo ya recibido en cortes previos que cubran este mismo periodo
    $sqlCubierto = "SELECT COALESCE(SUM(total_pago), 0) AS ya_recibido
                    FROM nomina_tickets
                    WHERE empleado_id   = :empleado_id
                      AND tipo          = 'corte_caja'
                      AND periodo_inicio IS NOT NULL
                      AND periodo_inicio <= :fecha_fin
                      AND periodo_fin   >= :fecha_inicio";
    $stmtC = $db->prepare($sqlCubierto);
    $stmtC->bindParam(':empleado_id', $empleado_id, PDO::PARAM_INT);
    $stmtC->bindValue(':fecha_inicio', $fecha_inicio);
    $stmtC->bindValue(':fecha_fin',    $fecha_fin);
    $stmtC->execute();
    $yaRecibido = floatval($stmtC->fetch(PDO::FETCH_ASSOC)['ya_recibido'] ?? 0);

    $total_ingresos_ajustado = max(0, floatval($row['total_ingresos']) - $yaRecibido);

    echo json_encode([
        "status" => "success",
        "data"   => [
            "total_ingresos"  => $total_ingresos_ajustado,
            "total_propinas"  => floatval($row['total_propinas']),
            "total_gastos"    => floatval($row['total_gastos']),
            "total_neto"      => floatval($row['total_neto']),
            "total_jornadas"  => intval($row['total_jornadas']),
            "ya_recibido"     => $yaRecibido
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
} catch (Error $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Fatal Error: " . $e->getMessage()]);
}
?>
