<?php
require_once 'db_config.php';

if (!isset($_GET['codigoChofer'])) {
    echo json_encode(["success" => false, "message" => "codigoChofer requerido."]);
    exit();
}

$codigoChofer = $_GET['codigoChofer'];

try {
    $query = "
        SELECT
            os.IdOrdenServicio,
            os.Folio,
            os.FechaProgramadaInicio,
            os.MontoBase,
            os.MontoFinal,
            os.MontoDeposito,
            os.MetodoPago,
            os.EstatusPago,
            os.CodigoEstatus,
            os.Distancia,
            os.TiempoEstimado,
            ds.DireccionOrigen,
            ds.DireccionDestino,
            ds.LatitudOrigen,
            ds.LongitudOrigen,
            ds.LatitudDestino,
            ds.LongitudDestino,
            rp.GeoJSON_Ruta,
            -- Datos del cliente
            COALESCE(safar_p.NombrePersona, e_cli.nombre_completo, u_cli.usuario, os.CodigoUsuarioCliente) AS NombreCliente,
            os.CodigoUsuarioCliente,
            COALESCE(safar_p.Telefono, e_cli.telefono) AS TelefonoCliente,
            safar_p.UrlFoto AS FotoCliente
        FROM safar_destinochoferasignado dca
        JOIN safar_destinoservicio ds ON dca.IdDestino = ds.IdDestino
        JOIN safar_ordenservicio os ON ds.IdOrdenServicio = os.IdOrdenServicio
        LEFT JOIN safar_rutapropuesta rp
            ON os.IdOrdenServicio = rp.IdOrdenServicio AND rp.EsRutaUsuario = 1
        LEFT JOIN usuarios u_cli
            ON os.CodigoUsuarioCliente = u_cli.usuario
        LEFT JOIN empleados e_cli
            ON u_cli.empleado_id = e_cli.id
        LEFT JOIN safar_usuario safar_u
            ON os.CodigoUsuarioCliente = safar_u.CodigoUsuario
        LEFT JOIN safar_persona safar_p
            ON safar_u.CodigoPersona = safar_p.CodigoPersona
        WHERE dca.CodigoUsuarioChofer = :codigoChofer
        ORDER BY os.FechaProgramadaInicio DESC
    ";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':codigoChofer', $codigoChofer);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $trips = [];
    foreach ($rows as $row) {
        if (!empty($row['GeoJSON_Ruta'])) {
            $decoded = json_decode($row['GeoJSON_Ruta']);
            $row['GeoJSON_Ruta'] = $decoded ?: null;
        }

        // Calcular efectivo pendiente
        $total    = (float)($row['MontoFinal'] ?? 0);
        $deposito = (float)($row['MontoDeposito'] ?? 0);
        $metodo   = strtoupper($row['MetodoPago'] ?? '');

        if ($metodo === 'EFECTIVO_DEPOSITO') {
            $row['EfectivoPendiente'] = $total - $deposito;
        } elseif ($metodo === 'EFECTIVO') {
            $row['EfectivoPendiente'] = $total;
        } else {
            $row['EfectivoPendiente'] = 0;
        }

        $trips[] = $row;
    }

    echo json_encode(["success" => true, "trips" => $trips]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "DB error: " . $e->getMessage()]);
}
?>
