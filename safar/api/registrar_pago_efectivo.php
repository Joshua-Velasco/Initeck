<?php
require_once 'db_config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['IdOrdenServicio'])) {
    echo json_encode(["success" => false, "message" => "IdOrdenServicio requerido."]);
    exit();
}

$id = $data['IdOrdenServicio'];

try {
    // Marcamos la orden como pagada
    $stmt = $conn->prepare("UPDATE safar_ordenservicio SET EstatusPago = 'PAGADO' WHERE IdOrdenServicio = ?");
    $stmt->execute([$id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => true, "message" => "Pago registrado como PAGADO."]);
    } else {
        echo json_encode(["success" => false, "message" => "No se encontró la orden o ya estaba pagada."]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
?>
