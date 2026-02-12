<?php
// Headers CORS (Ajustar según .htaccess o necesidades de producción)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->empleado_id) &&
    !empty($data->periodo) &&
    isset($data->utilidad_total) &&
    isset($data->total_pago)
) {
    try {
        $query = "INSERT INTO nomina_tickets SET
                    empleado_id = :empleado_id,
                    periodo = :periodo,
                    ingresos_brutos = :ingresos_brutos,
                    gastos_chofer = :gastos_chofer,
                    gastos_mantenimiento = :gastos_mantenimiento,
                    gastos_taller = :gastos_taller,
                    depositos = :depositos,
                    utilidad_total = :utilidad_total,
                    bonos_extras = :bonos_extras,
                    propinas = :propinas,
                    total_pago = :total_pago,
                    recibo_id = :recibo_id,
                    fecha_emision = NOW()";

        $stmt = $db->prepare($query);

        $stmt->bindParam(":empleado_id", $data->empleado_id);
        $stmt->bindParam(":periodo", $data->periodo);
        $stmt->bindParam(":ingresos_brutos", $data->ingresos_brutos);
        $stmt->bindParam(":gastos_chofer", $data->gastos_chofer);
        $stmt->bindParam(":gastos_mantenimiento", $data->gastos_mantenimiento);
        $stmt->bindParam(":gastos_taller", $data->gastos_taller);
        $stmt->bindParam(":depositos", $data->depositos);
        $stmt->bindParam(":utilidad_total", $data->utilidad_total);
        $stmt->bindParam(":bonos_extras", $data->bonos_extras);
        $stmt->bindParam(":propinas", $data->propinas);
        $stmt->bindParam(":total_pago", $data->total_pago);
        $stmt->bindParam(":recibo_id", $data->recibo_id);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("status" => "success", "message" => "Ticket guardado correctamente.", "id" => $db->lastInsertId()));
        } else {
            http_response_code(503);
            echo json_encode(array("status" => "error", "message" => "No se pudo guardar el ticket."));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("status" => "error", "message" => $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("status" => "error", "message" => "Datos incompletos."));
}
?>