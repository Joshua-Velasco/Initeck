<?php
/**
 * registrar_cobro_efectivo.php
 * 
 * Registra el cobro de efectivo de un viaje Safar completado.
 * El chofer debe confirmar cuánto cobró antes de poder aceptar otro viaje.
 * 
 * POST body (JSON):
 *   - IdOrdenServicio (int, requerido)
 *   - CodigoChofer (string, requerido)
 *   - MontoCobrado (float, requerido)
 *   - Incidencia (string, opcional): 'NINGUNA', 'PAGADO_PREVIAMENTE', 'CLIENTE_NO_PAGO', 'CLIENTE_RECHAZO', 'MONTO_INCORRECTO', 'OTRO'
 *   - Observaciones (string, opcional)
 * 
 * Response:
 *   { success: true/false, message: "...", cobro_id: 123 }
 */

require_once 'db_config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Datos inválidos."]);
    exit();
}

$idOrden = $data['IdOrdenServicio'] ?? null;
$codigoChofer = $data['CodigoChofer'] ?? null;
$montoCobrado = $data['MontoCobrado'] ?? null;

if (!$idOrden || !$codigoChofer || $montoCobrado === null) {
    echo json_encode(["success" => false, "message" => "Datos incompletos: IdOrdenServicio, CodigoChofer y MontoCobrado son requeridos."]);
    exit();
}

$montoCobrado = floatval($montoCobrado);
$incidencia = $data['Incidencia'] ?? 'NINGUNA';
$observaciones = $data['Observaciones'] ?? '';

// Lista válida de incidencias
$incidencias_validas = ['NINGUNA', 'PAGADO_PREVIAMENTE', 'CLIENTE_NO_PAGO', 'CLIENTE_RECHAZO', 'MONTO_INCORRECTO', 'OTRO'];
if (!in_array($incidencia, $incidencias_validas)) {
    $incidencia = 'NINGUNA';
}

try {
    $conn->beginTransaction();

    // 1. Obtener datos de la orden
    $stmt = $conn->prepare("
        SELECT
            os.IdOrdenServicio,
            os.MontoFinal,
            os.MontoDeposito,
            os.MetodoPago,
            os.CodigoEstatus,
            os.CodigoUsuarioCliente
        FROM safar_ordenservicio os
        WHERE os.IdOrdenServicio = :id
    ");
    $stmt->bindParam(':id', $idOrden);
    $stmt->execute();
    $orden = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$orden) {
        $conn->rollBack();
        echo json_encode(["success" => false, "message" => "Viaje no encontrado."]);
        exit();
    }

    // 2. Verificar que el viaje esté completado o en proceso de completarse
    if (!in_array($orden['CodigoEstatus'], ['COMPLETADO', 'SOLICITAR_PAGO', 'INICIADO'])) {
        $conn->rollBack();
        echo json_encode(["success" => false, "message" => "El viaje no está en estado de completarse."]);
        exit();
    }

    // 3. Verificar que ya no se haya registrado un cobro para este viaje
    $checkStmt = $conn->prepare("
        SELECT id FROM safar_cobros_efectivo 
        WHERE id_orden_servicio = :id AND codigo_chofer = :chofer
        LIMIT 1
    ");
    $checkStmt->bindParam(':id', $idOrden);
    $checkStmt->bindParam(':chofer', $codigoChofer);
    $checkStmt->execute();
    if ($checkStmt->fetch()) {
        $conn->rollBack();
        echo json_encode(["success" => false, "message" => "Ya se registró un cobro para este viaje."]);
        exit();
    }

    // 4. Calcular monto esperado según método de pago
    $montoFinal = floatval($orden['MontoFinal']);
    $montoDeposito = floatval($orden['MontoDeposito']);
    $metodoPago = strtoupper($orden['MetodoPago'] ?? '');

    if ($metodoPago === 'EFECTIVO_DEPOSITO') {
        $montoEsperado = $montoFinal - $montoDeposito;
    } elseif ($metodoPago === 'EFECTIVO') {
        $montoEsperado = $montoFinal;
    } else {
        // Stripe: no se espera cobro, pero se registra si el chofer reporta algo
        $montoEsperado = 0;
    }

    // 5. Registrar el cobro
    $fechaCobro = date('Y-m-d H:i:s');
    $insertStmt = $conn->prepare("
        INSERT INTO safar_cobros_efectivo (
            id_orden_servicio,
            codigo_chofer,
            monto_cobrado,
            monto_esperado,
            metodo_pago_orig,
            fecha_cobro,
            incidencia,
            observaciones,
            registrado_por
        ) VALUES (
            :idOrden,
            :codigoChofer,
            :montoCobrado,
            :montoEsperado,
            :metodoPago,
            :fechaCobro,
            :incidencia,
            :observaciones,
            :codigoChofer
        )
    ");

    $insertStmt->bindParam(':idOrden', $idOrden);
    $insertStmt->bindParam(':codigoChofer', $codigoChofer);
    $insertStmt->bindParam(':montoCobrado', $montoCobrado);
    $insertStmt->bindParam(':montoEsperado', $montoEsperado);
    $insertStmt->bindParam(':metodoPago', $metodoPago);
    $insertStmt->bindParam(':fechaCobro', $fechaCobro);
    $insertStmt->bindParam(':incidencia', $incidencia);
    $insertStmt->bindParam(':observaciones', $observaciones);
    $insertStmt->execute();

    $cobroId = $conn->lastInsertId();

    // 6. Actualizar estatus de pago de la orden si aplica
    if ($montoCobrado >= $montoEsperado && $montoEsperado > 0) {
        $updatePago = $conn->prepare("
            UPDATE safar_ordenservicio
            SET EstatusPago = 'PAGADO'
            WHERE IdOrdenServicio = :id
        ");
        $updatePago->bindParam(':id', $idOrden);
        $updatePago->execute();
    }

    $conn->commit();

    // Respuesta con resumen
    $diff = $montoCobrado - $montoEsperado;
    $mensajeExtra = '';
    if (abs($diff) > 0.01 && $montoEsperado > 0) {
        $mensajeExtra = $diff > 0 
            ? " (Cobró $" . number_format($diff, 2) . " de más)" 
            : " (Faltaron $" . number_format(abs($diff), 2) . ")";
    }

    echo json_encode([
        "success" => true,
        "message" => "Cobro registrado correctamente." . $mensajeExtra,
        "cobro_id" => $cobroId,
        "monto_esperado" => $montoEsperado,
        "monto_cobrado" => $montoCobrado,
        "diferencia" => round($diff, 2)
    ]);

} catch (PDOException $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    echo json_encode(["success" => false, "message" => "Error de base de datos: " . $e->getMessage()]);
}
?>
