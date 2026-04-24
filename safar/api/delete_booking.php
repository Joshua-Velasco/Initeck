<?php
require_once 'db_config.php';

// Decode JSON input
$json = file_get_contents("php://input");
$data = json_decode($json);

if (!isset($data->idOrden)) {
    echo json_encode(["success" => false, "message" => "ID de orden requerido."]);
    exit();
}

$idInitial = $data->idOrden;

try {
    $conn->beginTransaction();

    // 1. Identify all orders in the same group (if any) 
    // to perform bulk deletion of recurring trips
    $stmtGroup = $conn->prepare("SELECT CodigoGrupo FROM safar_ordenservicio WHERE IdOrdenServicio = :id");
    $stmtGroup->execute([':id' => $idInitial]);
    $groupId = $stmtGroup->fetchColumn();

    $idsToDelete = [$idInitial];
    if ($groupId) {
        $stmtAll = $conn->prepare("SELECT IdOrdenServicio FROM safar_ordenservicio WHERE CodigoGrupo = :grp");
        $stmtAll->execute([':grp' => $groupId]);
        $idsToDelete = $stmtAll->fetchAll(PDO::FETCH_COLUMN);
    }

    if (empty($idsToDelete)) {
        throw new Exception("No se encontró la reserva o el grupo relacionado.");
    }

    $orderPlaceholders = implode(',', array_fill(0, count($idsToDelete), '?'));

    // 2. Get ALL multi-trip destination IDs to clean up assignments
    $stmtDestinos = $conn->prepare("SELECT IdDestino FROM safar_destinoservicio WHERE IdOrdenServicio IN ($orderPlaceholders)");
    $stmtDestinos->execute($idsToDelete);
    $destinos = $stmtDestinos->fetchAll(PDO::FETCH_COLUMN);

    if (!empty($destinos)) {
        $destPlaceholders = implode(',', array_fill(0, count($destinos), '?'));
        // 3. Delete driver assignments for the whole group
        $stmtDCA = $conn->prepare("DELETE FROM safar_destinochoferasignado WHERE IdDestino IN ($destPlaceholders)");
        $stmtDCA->execute($destinos);
    }

    // 4. Delete related trayectos (destinos) for the whole group
    $stmtDS = $conn->prepare("DELETE FROM safar_destinoservicio WHERE IdOrdenServicio IN ($orderPlaceholders)");
    $stmtDS->execute($idsToDelete);

    // 5. Delete proposed routes for the whole group
    $stmtRP = $conn->prepare("DELETE FROM safar_rutapropuesta WHERE IdOrdenServicio IN ($orderPlaceholders)");
    $stmtRP->execute($idsToDelete);

    // 6. Delete payments for the whole group
    $stmtPago = $conn->prepare("DELETE FROM safar_pagoservicio WHERE IdOrdenServicio IN ($orderPlaceholders)");
    $stmtPago->execute($idsToDelete);

    // 7. Finally delete the orders themselves
    $stmtOS = $conn->prepare("DELETE FROM safar_ordenservicio WHERE IdOrdenServicio IN ($orderPlaceholders)");
    $stmtOS->execute($idsToDelete);

    $conn->commit();
    
    $msg = count($idsToDelete) > 1 
        ? "Se han eliminado correctamente las " . count($idsToDelete) . " reservas del grupo recurrente." 
        : "Reserva eliminada exitosamente.";

    echo json_encode(["success" => true, "message" => $msg]);

} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    echo json_encode(["success" => false, "message" => "Error crítico al eliminar grupo: " . $e->getMessage()]);
}
?>
