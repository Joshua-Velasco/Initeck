<?php
require_once 'db_config.php';

if (!isset($_GET['codigoUsuario'])) {
    echo json_encode(["success" => false, "message" => "CodigoUsuario requerido."]);
    exit();
}

$codigoUsuario = $_GET['codigoUsuario'];
$response = ["success" => true, "plan" => null, "trips" => []];
                                  
function getDistanceKM($lat1, $lon1, $lat2, $lon2) {
    if (!$lat1 || !$lon1 || !$lat2 || !$lon2 || ($lat1 == 0 && $lon1 == 0)) return 0;
    $theta = (float)$lon1 - (float)$lon2;
    $dist = sin(deg2rad((float)$lat1)) * sin(deg2rad((float)$lat2)) + cos(deg2rad((float)$lat1)) * cos(deg2rad((float)$lat2)) * cos(deg2rad($theta));
    $dist = min(1, max(-1, $dist)); // Clamp for acos
    $dist = acos($dist);
    $dist = rad2deg($dist);
    $miles = $dist * 60 * 1.1515;
    $km = $miles * 1.609344;
    // Apply a road factor (approx 1.25x direct distance for city driving)
    return $km * 1.25;
}

try {
    // 1. Fetch User Plan
    $planQuery = "SELECT cs.Nombre, cs.CostoFijo, cs.Periodicidad 
                  FROM safar_usuariosuscripcion us
                  JOIN safar_catsuscripcion cs ON us.CodigoSuscripcion = cs.CodigoSuscripcion
                  WHERE us.CodigoUsuario = :codigoUsuario 
                  AND us.EstatusPago IN ('ACTIVO', 'PAGADO', 'activo', 'pagado', 'paid') 
                  ORDER BY us.IdUsuarioSuscripcion DESC LIMIT 1";
                  
    $planStmt = $conn->prepare($planQuery);
    $planStmt->bindParam(':codigoUsuario', $codigoUsuario);
    $planStmt->execute();
    $plan = $planStmt->fetch(PDO::FETCH_ASSOC);
    
    if ($plan) {
        $response['plan'] = $plan;
    } else {
        $response['plan'] = ["Nombre" => "Ninguno", "CostoFijo" => 0, "Periodicidad" => "N/A"];
    }

    // 2. Fetch User Trips (Agenda)
    // We join OrdenServicio, RutaPropuesta for GeoJSON, DestinoChoferAsignado -> Empleado for Driver,
    // AsignacionVehiculo -> CatVehiculo for Unit/Plates.
    $tripsQuery = "SELECT 
                    os.IdOrdenServicio,
                    os.Folio,
                    os.FechaProgramadaInicio,
                    os.MontoBase,
                    os.CodigoDescuento,
                    os.MontoFinal,
                    os.CodigoEstatus AS EstatusOrden,
                    rp.GeoJSON_Ruta,
                    e_chofer.nombre_completo AS Chofer,
                    v_chofer.unidad_nombre AS Unidad,
                    NULL AS TipoVehiculo,
                    v_chofer.placas AS Placas,
                    v_chofer.imagen_url AS ImagenVehiculo,
                    os.MetodoPago,
                    os.EstatusPago,
                    os.MontoDeposito,
                    os.Distancia,
                    os.TiempoEstimado,
                    ds.DireccionOrigen,
                    ds.DireccionDestino,
                    ds.LatitudOrigen,
                    ds.LongitudOrigen,
                    ds.LatitudDestino,
                    ds.LongitudDestino
                  FROM safar_ordenservicio os
                  LEFT JOIN safar_rutapropuesta rp ON os.IdOrdenServicio = rp.IdOrdenServicio AND rp.EsRutaUsuario = 1
                  -- Get Destino, then Chofer
                  LEFT JOIN safar_destinoservicio ds ON os.IdOrdenServicio = ds.IdOrdenServicio AND ds.Secuencia = 1
                  LEFT JOIN safar_destinochoferasignado dca ON ds.IdDestino = dca.IdDestino
                  -- Get Tracker Driver and Vehicle details
                  LEFT JOIN usuarios u_chofer ON dca.CodigoUsuarioChofer = u_chofer.usuario
                  LEFT JOIN empleados e_chofer ON u_chofer.empleado_id = e_chofer.id
                  LEFT JOIN vehiculos v_chofer ON e_chofer.vehiculo_id = v_chofer.id
                  WHERE os.CodigoUsuarioCliente = :codigoUsuario
                  ORDER BY os.FechaProgramadaInicio DESC";
                  
    $tripsStmt = $conn->prepare($tripsQuery);
    $tripsStmt->bindParam(':codigoUsuario', $codigoUsuario);
    $tripsStmt->execute();
    $trips = $tripsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Because there could be multiple routes or destinations, let's group by IdOrdenServicio
    // Wait, let's just use the main result. If multiple rows exist for same order (due to multiple assignments), we group.
    $uniqueTrips = [];
    foreach ($trips as $trip) {
        if (!isset($uniqueTrips[$trip['IdOrdenServicio']])) {
            $uniqueTrips[$trip['IdOrdenServicio']] = $trip;
            // Decode JSON for route if exists
            if (!empty($trip['GeoJSON_Ruta'])) {
                $decoded = json_decode($trip['GeoJSON_Ruta']);
                $uniqueTrips[$trip['IdOrdenServicio']]['GeoJSON_Ruta'] = $decoded ? $decoded : null;
                // 3. Distance & Time logic with robust fallback
                $dist_db = !empty($trip['Distancia']) ? $trip['Distancia'] : "";
                $time_db = !empty($trip['TiempoEstimado']) ? $trip['TiempoEstimado'] : "";
                
                // If DB is empty or has old mock values, calculate based on coordinates
                if ($dist_db === "" || $dist_db === "12.5 km") {
                    $d_km = getDistanceKM($trip['LatitudOrigen'], $trip['LongitudOrigen'], $trip['LatitudDestino'], $trip['LongitudDestino']);
                    if ($d_km > 0) {
                        $uniqueTrips[$trip['IdOrdenServicio']]['Distancia'] = number_format($d_km, 1) . " km";
                        // Estimate time (avg 30km/h = 2 min/km)
                        if ($time_db === "" || $time_db === "45 - 60 min") {
                            $min_est = ceil($d_km * 1.8); // 1.8 min/km approx 33km/h
                            $uniqueTrips[$trip['IdOrdenServicio']]['TiempoEstimado'] = max(5, $min_est) . " - " . (max(5, $min_est) + 5) . " min";
                        }
                    } else {
                        $uniqueTrips[$trip['IdOrdenServicio']]['Distancia'] = !empty($dist_db) ? $dist_db : "N/D";
                        $uniqueTrips[$trip['IdOrdenServicio']]['TiempoEstimado'] = !empty($time_db) ? $time_db : "Por calcular";
                    }
                } else {
                    $uniqueTrips[$trip['IdOrdenServicio']]['Distancia'] = $dist_db;
                    $uniqueTrips[$trip['IdOrdenServicio']]['TiempoEstimado'] = $time_db;
                }
            } else {
                $uniqueTrips[$trip['IdOrdenServicio']]['TiempoEstimado'] = "Por calcular";
                $uniqueTrips[$trip['IdOrdenServicio']]['Distancia'] = "N/A";
            }
        }
    }
    
    $response['trips'] = array_values($uniqueTrips);
    echo json_encode($response);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
