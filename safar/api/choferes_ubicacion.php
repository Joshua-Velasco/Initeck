<?php
require_once 'db_config.php';

try {
    // Active drivers = last GPS ping within 15 minutes
    $query = "
        SELECT
            e.id AS empleado_id,
            e.nombre_completo,
            v.unidad_nombre,
            v.placas,
            u.usuario,
            r.latitud,
            r.longitud,
            r.velocidad,
            r.timestamp AS ultima_actualizacion
        FROM rastreo_tiempo_real r
        JOIN (
            SELECT empleado_id, MAX(timestamp) AS max_ts
            FROM rastreo_tiempo_real
            WHERE TIMESTAMPDIFF(MINUTE, timestamp, NOW()) <= 15
            GROUP BY empleado_id
        ) latest ON r.empleado_id = latest.empleado_id AND r.timestamp = latest.max_ts
        JOIN empleados e ON r.empleado_id = e.id
        LEFT JOIN vehiculos v ON e.vehiculo_id = v.id
        LEFT JOIN usuarios u ON u.empleado_id = e.id
        WHERE r.latitud IS NOT NULL AND r.latitud != 0
    ";

    $stmt = $conn->prepare($query);
    $stmt->execute();
    $drivers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Total registered drivers (for capacity calculation)
    $totalStmt = $conn->query("SELECT COUNT(*) AS total FROM empleados WHERE vehiculo_id IS NOT NULL");
    $total = (int)($totalStmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

    echo json_encode([
        "success" => true,
        "drivers" => $drivers,
        "total_drivers" => $total
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
