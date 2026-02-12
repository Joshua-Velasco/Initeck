<?php
// Script temporal para simular movimiento de un empleado
// Uso: http://localhost/Inimovil/Initeck-api/simulate_movement.php?id=1&lat=31.7&lng=-106.4

require_once 'config/database.php';

$ids_param = $_GET['ids'] ?? ($_GET['id'] ?? '1');
$ids = explode(',', $ids_param);

$lat_base = $_GET['lat'] ?? 31.7333;
$lng_base = $_GET['lng'] ?? -106.4833;

echo "<h1>Simulación de Movimiento</h1>";
echo "<p>Hora: " . date('Y-m-d H:i:s') . "</p><hr>";

try {
    $database = new Database();
    $conn = $database->getConnection();

    foreach ($ids as $empleado_id) {
        $empleado_id = trim($empleado_id);
        if (empty($empleado_id)) continue;

        $my_lat = $lat_base + (rand(-100, 100) / 10000);
        $my_lng = $lng_base + (rand(-100, 100) / 10000);
        $speed = $_GET['speed'] ?? rand(0, 80); // Velocidad aleatoria o manual

        // 1. Verificar empleado y vehículo
        $stmt = $conn->prepare("SELECT nombre_completo, vehiculo_id FROM empleados WHERE id = ?");
        $stmt->execute([$empleado_id]);
        $emp = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$emp) {
            echo "<p style='color:red'>Empleado ID $empleado_id no encontrado.</p>";
            continue;
        }
        
        if (!$emp['vehiculo_id']) {
             echo "<p style='color:orange'>Empleado {$emp['nombre_completo']} (ID $empleado_id) no tiene vehículo asignado. Saltando.</p>";
             continue;
        }

        // 2. Insertar ubicación
        $query = "INSERT INTO rastreo_tiempo_real (empleado_id, vehiculo_id, latitud, longitud, velocidad, timestamp) VALUES (?, ?, ?, ?, ?, NOW())";
        $stmt = $conn->prepare($query);
        $stmt->execute([$empleado_id, $emp['vehiculo_id'], $my_lat, $my_lng, $speed]);

        echo "<p style='color:green'>✔ <strong>{$emp['nombre_completo']}</strong> movido a ($my_lat, $my_lng) a {$speed} km/h</p>";
    }
    
    echo "<hr><button onclick='window.location.reload()'>Mover Todos de Nuevo</button>";

} catch (PDOException $e) {
    die("Error: " . $e->getMessage());
}
?>
