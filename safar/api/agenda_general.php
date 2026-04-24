<?php
require_once 'db_config.php';

try {
    // All upcoming trips ordered by date, with assignment info
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
            ds.IdDestino,
            rp.GeoJSON_Ruta,
            -- Cliente
            COALESCE(e_cli.nombre_completo, u_cli.usuario) AS NombreCliente,
            -- Chofer asignado (si hay)
            dca.CodigoUsuarioChofer,
            e_chofer.nombre_completo AS NombreChofer,
            v_chofer.unidad_nombre AS UnidadChofer
        FROM safar_ordenservicio os
        LEFT JOIN safar_destinoservicio ds
            ON os.IdOrdenServicio = ds.IdOrdenServicio AND ds.Secuencia = 1
        LEFT JOIN safar_rutapropuesta rp
            ON os.IdOrdenServicio = rp.IdOrdenServicio AND rp.EsRutaUsuario = 1
        LEFT JOIN usuarios u_cli
            ON os.CodigoUsuarioCliente = u_cli.usuario
        LEFT JOIN empleados e_cli
            ON u_cli.empleado_id = e_cli.id
        LEFT JOIN safar_destinochoferasignado dca
            ON ds.IdDestino = dca.IdDestino
        LEFT JOIN usuarios u_chofer
            ON dca.CodigoUsuarioChofer = u_chofer.usuario
        LEFT JOIN empleados e_chofer
            ON u_chofer.empleado_id = e_chofer.id
        LEFT JOIN vehiculos v_chofer
            ON e_chofer.vehiculo_id = v_chofer.id
        WHERE os.CodigoEstatus NOT IN ('CANCELADO', 'COMPLETADO')
        ORDER BY 
            (os.FechaProgramadaInicio >= CURDATE()) DESC,
            CASE WHEN os.FechaProgramadaInicio >= CURDATE() THEN os.FechaProgramadaInicio END ASC,
            os.FechaProgramadaInicio DESC
    ";

    $stmt = $conn->prepare($query);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Decode GeoJSON and group by order
    $trips = [];
    foreach ($rows as $row) {
        $id = $row['IdOrdenServicio'];
        if (!isset($trips[$id])) {
            if (!empty($row['GeoJSON_Ruta'])) {
                $decoded = json_decode($row['GeoJSON_Ruta']);
                $row['GeoJSON_Ruta'] = $decoded ?: null;
            }
            $trips[$id] = $row;
        }
    }

    // Total registered Safar drivers
    $totalStmt = $conn->query("SELECT COUNT(*) AS total FROM empleados WHERE vehiculo_id IS NOT NULL");
    $totalDrivers = (int)($totalStmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 1);

    echo json_encode([
        "success" => true,
        "trips" => array_values($trips),
        "total_drivers" => $totalDrivers
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
