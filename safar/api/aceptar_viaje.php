<?php
require_once 'db_config.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->codigoChofer) || !isset($data->idDestino)) {
    echo json_encode(["success" => false, "message" => "Datos incompletos."]);
    exit();
}

$codigoChofer = $data->codigoChofer;
$idDestino    = (int)$data->idDestino;

try {
    $conn->beginTransaction();

    // 1. Get the trip's scheduled time
    $timeStmt = $conn->prepare("
        SELECT os.FechaProgramadaInicio, os.IdOrdenServicio
        FROM safar_destinoservicio ds
        JOIN safar_ordenservicio os ON ds.IdOrdenServicio = os.IdOrdenServicio
        WHERE ds.IdDestino = :idDestino
        LIMIT 1
    ");
    $timeStmt->bindParam(':idDestino', $idDestino);
    $timeStmt->execute();
    $tripInfo = $timeStmt->fetch(PDO::FETCH_ASSOC);

    if (!$tripInfo) {
        $conn->rollBack();
        echo json_encode(["success" => false, "message" => "Viaje no encontrado."]);
        exit();
    }

    $fechaViaje = $tripInfo['FechaProgramadaInicio'];

    // 2. Check if THIS driver already has a trip within 1 hour of this slot
    $driverConflictStmt = $conn->prepare("
        SELECT COUNT(*) AS cnt
        FROM safar_destinochoferasignado dca
        JOIN safar_destinoservicio ds ON dca.IdDestino = ds.IdDestino
        JOIN safar_ordenservicio os ON ds.IdOrdenServicio = os.IdOrdenServicio
        WHERE dca.CodigoUsuarioChofer = :chofer
        AND ABS(TIMESTAMPDIFF(MINUTE, os.FechaProgramadaInicio, :fecha)) < 60
        AND os.CodigoEstatus NOT IN ('CANCELADO', 'COMPLETADO')
    ");
    $driverConflictStmt->bindParam(':chofer', $codigoChofer);
    $driverConflictStmt->bindParam(':fecha', $fechaViaje);
    $driverConflictStmt->execute();
    $driverConflict = (int)$driverConflictStmt->fetch(PDO::FETCH_ASSOC)['cnt'];

    if ($driverConflict > 0) {
        $conn->rollBack();
        echo json_encode(["success" => false, "message" => "Ya tienes un viaje asignado en ese horario."]);
        exit();
    }

    // 3. Check capacity: count all assigned trips in same slot vs total drivers
    $capacityStmt = $conn->prepare("
        SELECT COUNT(DISTINCT dca.CodigoUsuarioChofer) AS asignados
        FROM safar_destinochoferasignado dca
        JOIN safar_destinoservicio ds ON dca.IdDestino = ds.IdDestino
        JOIN safar_ordenservicio os ON ds.IdOrdenServicio = os.IdOrdenServicio
        WHERE ABS(TIMESTAMPDIFF(MINUTE, os.FechaProgramadaInicio, :fecha)) < 60
        AND os.CodigoEstatus NOT IN ('CANCELADO', 'COMPLETADO')
    ");
    $capacityStmt->bindParam(':fecha', $fechaViaje);
    $capacityStmt->execute();
    $asignados = (int)$capacityStmt->fetch(PDO::FETCH_ASSOC)['asignados'];

    $totalStmt = $conn->query("SELECT COUNT(*) AS total FROM empleados WHERE vehiculo_id IS NOT NULL");
    $totalDrivers = (int)$totalStmt->fetch(PDO::FETCH_ASSOC)['total'];

    if ($asignados >= $totalDrivers) {
        $conn->rollBack();
        echo json_encode(["success" => false, "message" => "No hay choferes disponibles en ese horario. Capacidad máxima alcanzada."]);
        exit();
    }

    // 4. Remove any previous assignment for this destino (if driver is re-assigning)
    $delStmt = $conn->prepare("DELETE FROM safar_destinochoferasignado WHERE IdDestino = :idDestino");
    $delStmt->bindParam(':idDestino', $idDestino);
    $delStmt->execute();

    // 5. Insert new assignment
    $insStmt = $conn->prepare("
        INSERT INTO safar_destinochoferasignado (IdDestino, CodigoUsuarioChofer, FechaAsignacion, FechaFinAsignacion)
        VALUES (:idDestino, :chofer, NOW(), '0000-00-00 00:00:00')
    ");
    $insStmt->bindParam(':idDestino', $idDestino);
    $insStmt->bindParam(':chofer', $codigoChofer);
    $insStmt->execute();

    $conn->commit();
    echo json_encode(["success" => true, "message" => "Viaje aceptado correctamente."]);

} catch (PDOException $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    echo json_encode(["success" => false, "message" => "DB error: " . $e->getMessage()]);
}
?>
