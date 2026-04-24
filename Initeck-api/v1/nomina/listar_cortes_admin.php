<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { http_response_code(200); exit(); }

require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$empleado_id  = $_GET['empleado_id']  ?? null;
$fecha_inicio = $_GET['fecha_inicio'] ?? null;
$fecha_fin    = $_GET['fecha_fin']    ?? null;

try {
    $where  = ["t.tipo = 'corte_caja'"];
    $params = [];

    if ($empleado_id) {
        $where[]  = "t.empleado_id = :empleado_id";
        $params[':empleado_id'] = $empleado_id;
    }
    if ($fecha_inicio) {
        $where[]  = "DATE(t.fecha_emision) >= :fi";
        $params[':fi'] = $fecha_inicio;
    }
    if ($fecha_fin) {
        $where[]  = "DATE(t.fecha_emision) <= :ff";
        $params[':ff'] = $fecha_fin;
    }

    $whereSQL = implode(' AND ', $where);

    $sql = "SELECT
                t.*,
                e.nombre_completo AS empleado_nombre,
                e.rol             AS empleado_rol,
                e.foto_perfil     AS empleado_foto,
                v.unidad_nombre   AS vehiculo_nombre,
                v.placas          AS vehiculo_placas
            FROM nomina_tickets t
            INNER JOIN empleados e ON t.empleado_id = e.id
            LEFT JOIN vehiculos v  ON e.vehiculo_id = v.id
            WHERE $whereSQL
            ORDER BY t.fecha_emision DESC";

    $stmt = $db->prepare($sql);
    foreach ($params as $k => $v) $stmt->bindValue($k, $v);
    $stmt->execute();

    $cortes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Resumen global
    $totalDeuda    = 0;
    $totalCortes   = count($cortes);
    $pendientesFirma = 0;
    foreach ($cortes as $c) {
        $totalDeuda += floatval($c['diferencia'] ?? 0);
        if (!$c['firmado_at']) $pendientesFirma++;
    }

    echo json_encode([
        "status" => "success",
        "data"   => $cortes,
        "resumen" => [
            "total_cortes"      => $totalCortes,
            "deuda_acumulada"   => round($totalDeuda, 2),
            "pendientes_firma"  => $pendientesFirma
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
