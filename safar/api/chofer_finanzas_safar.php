<?php
/**
 * chofer_finanzas_safar.php
 * 
 * Obtiene las finanzas de un chofer específicamente de viajes Safar.
 * Separado de Uber para control y reconciliación.
 * 
 * GET params:
 *   - codigoChofer (string, requerido)
 *   - periodo (string, opcional): 'hoy', 'semana', 'mes' (default: 'hoy')
 *   - fecha_inicio (string, opcional): 'YYYY-MM-DD' (sobreescribe periodo)
 *   - fecha_fin (string, opcional): 'YYYY-MM-DD'
 * 
 * Response:
 *   {
 *     success: true,
 *     periodo: { desde: '...', hasta: '...' },
 *     resumen: {
 *       total_viajes_completados: 10,
 *       total_cobrado_esperado: 1500.00,
 *       total_cobrado_real: 1480.00,
 *       diferencia: -20.00,
 *       cobrado_efectivo: 1480.00,
 *       pagado_stripe: 3200.00,
 *       incidencia_count: 2
 *     },
 *     viajes: [ ... ],
 *     cobros: [ ... ]
 *   }
 */

require_once 'db_config.php';

if (!isset($_GET['codigoChofer'])) {
    echo json_encode(["success" => false, "message" => "codigoChofer requerido."]);
    exit();
}

$codigoChofer = $_GET['codigoChofer'];
$periodo = $_GET['periodo'] ?? 'hoy';

// Determinar rango de fechas
$ahora = new DateTime();
$fechaInicio = clone $ahora;
$fechaFin = clone $ahora;

switch ($periodo) {
    case 'hoy':
        $fechaInicio->setTime(0, 0, 0);
        $fechaFin->setTime(23, 59, 59);
        break;
    case 'semana':
        $diaSemana = (int)$fechaInicio->format('N'); // 1=Lunes, 7=Domingo
        $fechaInicio->modify('-' . ($diaSemana - 1) . ' days');
        $fechaInicio->setTime(0, 0, 0);
        $fechaFin->setTime(23, 59, 59);
        break;
    case 'mes':
        $fechaInicio->modify('first day of this month');
        $fechaInicio->setTime(0, 0, 0);
        $fechaFin->setTime(23, 59, 59);
        break;
    default:
        $fechaInicio->setTime(0, 0, 0);
        $fechaFin->setTime(23, 59, 59);
}

// Sobreescribir con fechas explícitas si se proporcionan
if (!empty($_GET['fecha_inicio'])) {
    $fechaInicio = new DateTime($_GET['fecha_inicio'] . ' 00:00:00');
}
if (!empty($_GET['fecha_fin'])) {
    $fechaFin = new DateTime($_GET['fecha_fin'] . ' 23:59:59');
}

$fechaInicioStr = $fechaInicio->format('Y-m-d H:i:s');
$fechaFinStr = $fechaFin->format('Y-m-d H:i:s');

try {
    // 1. Resumen de viajes completados del chofer en el periodo
    $viajesStmt = $conn->prepare("
        SELECT 
            COUNT(*) AS total_viajes,
            COALESCE(SUM(
                CASE 
                    WHEN UPPER(os.MetodoPago) = 'EFECTIVO' THEN os.MontoFinal
                    WHEN UPPER(os.MetodoPago) = 'EFECTIVO_DEPOSITO' THEN (os.MontoFinal - os.MontoDeposito)
                    ELSE 0
                END
            ), 0) AS total_efectivo_esperado,
            COALESCE(SUM(
                CASE 
                    WHEN UPPER(os.MetodoPago) = 'STRIPE' THEN os.MontoFinal
                    WHEN UPPER(os.MetodoPago) = 'EFECTIVO_DEPOSITO' THEN os.MontoDeposito
                    ELSE 0
                END
            ), 0) AS total_pagado_stripe
        FROM safar_destinochoferasignado dca
        JOIN safar_destinoservicio ds ON dca.IdDestino = ds.IdDestino
        JOIN safar_ordenservicio os ON ds.IdOrdenServicio = os.IdOrdenServicio
        LEFT JOIN safar_cobros_efectivo ce
            ON os.IdOrdenServicio = ce.id_orden_servicio AND ce.codigo_chofer = :chofer
        WHERE dca.CodigoUsuarioChofer = :chofer
          AND os.CodigoEstatus = 'COMPLETADO'
          AND COALESCE(ce.fecha_cobro, os.FechaProgramadaInicio) BETWEEN :inicio AND :fin
    ");
    $viajesStmt->bindParam(':chofer', $codigoChofer);
    $viajesStmt->bindParam(':inicio', $fechaInicioStr);
    $viajesStmt->bindParam(':fin', $fechaFinStr);
    $viajesStmt->execute();
    $viajesResumen = $viajesStmt->fetch(PDO::FETCH_ASSOC);

    // 2. Resumen de cobros registrados
    $cobrosStmt = $conn->prepare("
        SELECT 
            COUNT(*) AS total_cobros,
            COALESCE(SUM(monto_cobrado), 0) AS total_cobrado_real,
            COALESCE(SUM(monto_esperado), 0) AS total_cobrado_esperado,
            COALESCE(SUM(monto_cobrado - monto_esperado), 0) AS diferencia,
            SUM(CASE WHEN incidencia != 'NINGUNA' THEN 1 ELSE 0 END) AS incidencia_count
        FROM safar_cobros_efectivo
        WHERE codigo_chofer = :chofer
          AND fecha_cobro BETWEEN :inicio AND :fin
    ");
    $cobrosStmt->bindParam(':chofer', $codigoChofer);
    $cobrosStmt->bindParam(':inicio', $fechaInicioStr);
    $cobrosStmt->bindParam(':fin', $fechaFinStr);
    $cobrosStmt->execute();
    $cobrosResumen = $cobrosStmt->fetch(PDO::FETCH_ASSOC);

    // 3. Lista de viajes con estado de cobro
    $viajesDetalleStmt = $conn->prepare("
        SELECT 
            os.IdOrdenServicio,
            os.Folio,
            os.FechaProgramadaInicio,
            os.MontoFinal,
            os.MontoDeposito,
            os.MetodoPago,
            os.EstatusPago,
            os.CodigoEstatus,
            os.Distancia,
            ds.DireccionOrigen,
            ds.DireccionDestino,
            COALESCE(ce.monto_cobrado, 0) AS monto_cobrado,
            COALESCE(ce.incidencia, 'PENDIENTE') AS estado_cobro,
            COALESCE(ce.fecha_cobro, NULL) AS fecha_cobro_real,
            CASE 
                WHEN UPPER(os.MetodoPago) = 'EFECTIVO' THEN os.MontoFinal
                WHEN UPPER(os.MetodoPago) = 'EFECTIVO_DEPOSITO' THEN (os.MontoFinal - os.MontoDeposito)
                ELSE 0
            END AS monto_esperado_cobro
        FROM safar_destinochoferasignado dca
        JOIN safar_destinoservicio ds ON dca.IdDestino = ds.IdDestino
        JOIN safar_ordenservicio os ON ds.IdOrdenServicio = os.IdOrdenServicio
        LEFT JOIN safar_cobros_efectivo ce 
            ON os.IdOrdenServicio = ce.id_orden_servicio AND ce.codigo_chofer = :chofer
        WHERE dca.CodigoUsuarioChofer = :chofer
          AND os.CodigoEstatus = 'COMPLETADO'
          AND COALESCE(ce.fecha_cobro, os.FechaProgramadaInicio) BETWEEN :inicio AND :fin
        ORDER BY COALESCE(ce.fecha_cobro, os.FechaProgramadaInicio) DESC
    ");
    $viajesDetalleStmt->bindParam(':chofer', $codigoChofer);
    $viajesDetalleStmt->bindParam(':inicio', $fechaInicioStr);
    $viajesDetalleStmt->bindParam(':fin', $fechaFinStr);
    $viajesDetalleStmt->execute();
    $viajesDetalle = $viajesDetalleStmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Viajes sin cobro registrado (alertas)
    $sinCobroStmt = $conn->prepare("
        SELECT 
            os.IdOrdenServicio,
            os.Folio,
            os.FechaProgramadaInicio,
            os.MontoFinal,
            os.MetodoPago,
            ds.DireccionOrigen,
            ds.DireccionDestino,
            CASE 
                WHEN UPPER(os.MetodoPago) = 'EFECTIVO' THEN os.MontoFinal
                WHEN UPPER(os.MetodoPago) = 'EFECTIVO_DEPOSITO' THEN (os.MontoFinal - os.MontoDeposito)
                ELSE 0
            END AS monto_pendiente
        FROM safar_destinochoferasignado dca
        JOIN safar_destinoservicio ds ON dca.IdDestino = ds.IdDestino
        JOIN safar_ordenservicio os ON ds.IdOrdenServicio = os.IdOrdenServicio
        LEFT JOIN safar_cobros_efectivo ce 
            ON os.IdOrdenServicio = ce.id_orden_servicio AND ce.codigo_chofer = :chofer
        WHERE dca.CodigoUsuarioChofer = :chofer
          AND os.CodigoEstatus = 'COMPLETADO'
          AND ce.id IS NULL
          AND UPPER(os.MetodoPago) IN ('EFECTIVO', 'EFECTIVO_DEPOSITO')
        ORDER BY os.FechaProgramadaInicio DESC
    ");
    $sinCobroStmt->bindParam(':chofer', $codigoChofer);
    $sinCobroStmt->execute();
    $sinCobro = $sinCobroStmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "periodo" => [
            "desde" => $fechaInicioStr,
            "hasta" => $fechaFinStr,
            "etiqueta" => $periodo
        ],
        "resumen" => [
            "total_viajes_completados" => (int)$viajesResumen['total_viajes'],
            "total_cobrado_esperado" => round(floatval($viajesResumen['total_efectivo_esperado']), 2),
            "total_cobrado_real" => round(floatval($cobrosResumen['total_cobrado_real']), 2),
            "diferencia" => round(floatval($cobrosResumen['diferencia']), 2),
            "cobrado_efectivo" => round(floatval($cobrosResumen['total_cobrado_real']), 2),
            "pagado_stripe" => round(floatval($viajesResumen['total_pagado_stripe']), 2),
            "incidencia_count" => (int)$cobrosResumen['incidencia_count'],
            "viajes_sin_cobro" => count($sinCobro)
        ],
        "viajes" => $viajesDetalle,
        "sin_cobro" => $sinCobro
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Error de base de datos: " . $e->getMessage()]);
}
?>
