<?php
require_once 'db_config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['IdOrdenServicio']) || !isset($data['NuevoEstatus'])) {
    echo json_encode(["success" => false, "message" => "Datos incompletos (IdOrdenServicio y NuevoEstatus requeridos)."]);
    exit();
}

$id = $data['IdOrdenServicio'];
$estatus = $data['NuevoEstatus'];

try {
    // 1. Intentar actualizar
    $stmt = $conn->prepare("UPDATE safar_ordenservicio SET CodigoEstatus = ? WHERE IdOrdenServicio = ?");
    $stmt->execute([$estatus, $id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => true, "message" => "Estatus actualizado a $estatus."]);
    } else {
        // 2. Si rowCount es 0, verificar si es porque ya tiene ese estatus o porque no existe
        $check = $conn->prepare("SELECT CodigoEstatus FROM safar_ordenservicio WHERE IdOrdenServicio = ?");
        $check->execute([$id]);
        $row = $check->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            if ($row['CodigoEstatus'] === $estatus) {
                echo json_encode(["success" => true, "message" => "El viaje ya se encuentra en estatus $estatus."]);
            } else {
                echo json_encode(["success" => false, "message" => "No se pudo actualizar el estatus."]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "No se encontró la orden con ID: $id"]);
        }
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error de base de datos: " . $e->getMessage()]);
}
?>
