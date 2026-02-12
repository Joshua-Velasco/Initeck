<?php
/**
 * SIMULADOR DE MOVIMIENTO GPS - INITECK PREMIUM
 */

header('Content-Type: application/json');
require_once '../../config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();

    $query = "SELECT id, vehiculo_id FROM empleados WHERE vehiculo_id IS NOT NULL AND estado != 'Eliminado'";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $empleados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $updates = 0;
    foreach ($empleados as $emp) {
        $lastPosQuery = "SELECT latitud, longitud FROM rastreo_tiempo_real WHERE empleado_id = ? ORDER BY id DESC LIMIT 1";
        $stmtLast = $conn->prepare($lastPosQuery);
        $stmtLast->execute([$emp['id']]);
        $lastPos = $stmtLast->fetch(PDO::FETCH_ASSOC);

        $baseLat = 31.7333;
        $baseLng = -106.4833;

        $lat = $lastPos ? $lastPos['latitud'] : $baseLat + (mt_rand(-50, 50) / 1000);
        $lng = $lastPos ? $lastPos['longitud'] : $baseLng + (mt_rand(-50, 50) / 1000);

        $newLat = $lat + (mt_rand(-8, 8) / 10000);
        $newLng = $lng + (mt_rand(-8, 8) / 10000);
        $vel = mt_rand(20, 55); 

        $insert = "INSERT INTO rastreo_tiempo_real (empleado_id, vehiculo_id, latitud, longitud, velocidad) VALUES (?, ?, ?, ?, ?)";
        if ($conn->prepare($insert)->execute([$emp['id'], $emp['vehiculo_id'], $newLat, $newLng, $vel])) {
            $updates++;
        }
    }
    echo json_encode(["status" => "success", "updates" => $updates]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
