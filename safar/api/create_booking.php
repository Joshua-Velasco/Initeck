<?php
require_once 'db_config.php';

// Decode JSON input
$json = file_get_contents("php://input");
file_put_contents('debug.log', "Booking payload received: $json\n", FILE_APPEND);
$data = json_decode($json);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Datos inválidos."]);
    exit();
}

try {
    $conn->beginTransaction();

    $fechas = isset($data->fechasProgramadas) ? $data->fechasProgramadas : [$data->fecha];
    $numTrips = count($fechas);
    
    $montoBaseUnitario = (float)$data->precioPorViaje;
    $esBulk = (isset($data->esPagoBulk) && $data->esPagoBulk);
    
    // Correctly calculate unit price
    $montoUnitario = $esBulk 
        ? ((float)$data->montoTotal / $numTrips) 
        : $montoBaseUnitario;
    
    $codigoDescuento = $esBulk ? 'SEMANAL_10' : 'NINGUNO';
    
    $foliosOccurred = [];
    $groupId = ($numTrips > 1) ? "GRP-" . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8)) : null;

    foreach ($fechas as $index => $fecha) {
        // Generate unique folio for each trip
        $folio = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8));
        $foliosOccurred[] = $folio;

        // Determine payment status for this specific trip
        $statusStr = 'Pendiente';
        if ($data->metodoPago === 'STRIPE' && !empty($data->stripePaymentIntentId)) {
            if ($esBulk) {
                // Bulk payment: all trips are paid
                $statusStr = 'Pagado';
            } else {
                // Per-trip payment: only the first trip is paid now
                $statusStr = ($index === 0) ? 'Pagado' : 'Pendiente';
            }
        }

        // 1. Create order
        $query = "INSERT INTO safar_ordenservicio
                  (CodigoUsuarioCliente, Folio, CodigoGrupo, FechaProgramadaInicio, MontoBase, CodigoDescuento, MontoFinal, MontoDeposito,
                   MetodoPago, EstatusPago, StripePaymentIntentId, Distancia, TiempoEstimado, CodigoEstatus)
                  VALUES
                  (:user, :folio, :groupId, :fecha, :base, :desc, :monto, :deposito, :metodo, :status, :stripeId, :dist, :tiempo, 'PENDIENTE')";

        $stmt = $conn->prepare($query);
        $stmt->execute([
            ':user' => $data->codigoUsuario,
            ':folio' => $folio,
            ':groupId' => $groupId,
            ':fecha' => $fecha,
            ':base' => $montoBaseUnitario,
            ':desc' => $codigoDescuento,
            ':monto' => $montoUnitario,
            ':deposito' => isset($data->montoDeposito) ? (float)$data->montoDeposito : 0.00,
            ':metodo' => $data->metodoPago,
            ':status' => $statusStr,
            ':stripeId' => $data->stripePaymentIntentId ? $data->stripePaymentIntentId : null,
            ':dist' => isset($data->distancia) ? $data->distancia : null,
            ':tiempo' => isset($data->tiempoEstimado) ? $data->tiempoEstimado : null
        ]);

        $idOrden = $conn->lastInsertId();

        // 2. Insert Trayecto (Destino)
        // Required Columns: IdOrdenServicio, Secuencia, DireccionOrigen, LatitudOrigen, LongitudOrigen, 
        // DireccionDestino, LatitudDestino, LongitudDestino, FechaInicioReal, FechaFinReal, CodigoEstatus
        $queryDestino = "INSERT INTO safar_destinoservicio 
                         (IdOrdenServicio, Secuencia, DireccionOrigen, LatitudOrigen, LongitudOrigen, 
                          DireccionDestino, LatitudDestino, LongitudDestino, 
                          FechaInicioReal, FechaFinReal, CodigoEstatus) 
                         VALUES 
                         (:idOrden, 1, :origen, :latO, :lngO, :destino, :latD, :lngD, 
                          '0000-00-00 00:00:00', '0000-00-00 00:00:00', 'PENDIENTE')";
        
        $stmtD = $conn->prepare($queryDestino);
        $stmtD->execute([
            ':idOrden' => $idOrden,
            ':origen' => $data->origen,
            ':latO' => $data->latO ?: '0',
            ':lngO' => $data->lngO ?: '0',
            ':destino' => $data->destino,
            ':latD' => $data->latD ?: '0',
            ':lngD' => $data->lngD ?: '0'
        ]);

        $idDestino = $conn->lastInsertId();

        // 3. Insert Route Geometry
        if (isset($data->routeGeoJSON)) {
            $queryRuta = "INSERT INTO safar_rutapropuesta (IdOrdenServicio, GeoJSON_Ruta, EsRutaUsuario) VALUES (:id, :geo, 1)";
            $stmtR = $conn->prepare($queryRuta);
            $stmtR->execute([
                ':id' => $idOrden,
                ':geo' => json_encode($data->routeGeoJSON)
            ]);
        }

        // 4. Assign Driver (if selected)
        if (!empty($data->codigoChofer)) {
            // Using CodigoUsuarioChofer as required by dca table
            $queryAsig = "INSERT INTO safar_destinochoferasignado (IdDestino, CodigoUsuarioChofer, FechaAsignacion, FechaFinAsignacion) 
                          VALUES (:idD, :codC, NOW(), '0000-00-00 00:00:00')";
            $stmtA = $conn->prepare($queryAsig);
            $stmtA->execute([':idD' => $idDestino, ':codC' => $data->codigoChofer]);
        }
    }

    $conn->commit();
    
    $finalFolio = count($foliosOccurred) > 1 ? "GRUPO-" . $foliosOccurred[0] : $foliosOccurred[0];

    echo json_encode([
        "success" => true, 
        "folio" => $finalFolio,
        "message" => "Agendado exitosamente: " . count($foliosOccurred) . " viaje(s)."
    ]);

} catch (PDOException $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    echo json_encode(["success" => false, "message" => "Error de BD: " . $e->getMessage()]);
}
?>
