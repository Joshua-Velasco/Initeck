<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (
    !isset($data->empleado_id) || 
    !isset($data->horario_entrada) || 
    !isset($data->horario_salida)
) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "UPDATE empleados SET horario_entrada = :entrada, horario_salida = :salida WHERE id = :id";
    $stmt = $db->prepare($query);

    $entrada = $data->horario_entrada === "" ? null : $data->horario_entrada;
    $salida = $data->horario_salida === "" ? null : $data->horario_salida;

    $stmt->bindParam(":entrada", $entrada);
    $stmt->bindParam(":salida", $salida);
    $stmt->bindParam(":id", $data->empleado_id);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Horario actualizado correctamente"]);
    } else {
        echo json_encode(["status" => "error", "message" => "No se pudo actualizar el horario"]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error de base de datos: " . $e->getMessage()]);
}
?>
