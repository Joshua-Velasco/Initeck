<?php
if (php_sapi_name() === 'cli') {
    $_SERVER['HTTP_ORIGIN'] = 'http://localhost';
    $_SERVER['REMOTE_ADDR'] = '127.0.0.1';
    $_SERVER['HTTP_HOST'] = 'localhost';
    $_SERVER['REQUEST_METHOD'] = 'GET';
}

require_once 'config/database.php';
require_once 'v1/empleados/utils/shift_utils.php';

echo "Timezone actual: " . date_default_timezone_get() . "\n";
echo "Hora actual: " . date('Y-m-d H:i:s') . "\n\n";

// Usamos el ID de empleado que teníamos (pero lo hardcodeamos para rapidez si no tenemos DB access clean, 
// pero mejor usar query real para demostrar integracion)
$database = new Database();
$pdo = $database->getConnection();
$stmt = $pdo->query("SELECT id, nombre_completo, horario_entrada FROM empleados WHERE estado = 'Activo' AND horario_entrada IS NOT NULL LIMIT 1");
$empleado = $stmt->fetch(PDO::FETCH_ASSOC);

function testTime($pdo, $empId, $mockTimeStr) {
    $entrada = '04:00:00'; 
    $mockTime = strtotime($mockTimeStr);
    $horaActual = date('H:i:s', $mockTime);
    $fechaActual = date('Y-m-d', $mockTime);
    
    $resultado = $fechaActual;
    
    // Logic replication from stored file to see if it Matches what code does
    if ($horaActual < $entrada) {
        $resultado = date('Y-m-d', strtotime('-1 day', $mockTime));
    }
    
    echo "Simulación: Si son las [$mockTimeStr] (Hora: $horaActual) y Turno inicia $entrada:\n";
    echo " -> Fecha Calendario: $fechaActual\n";
    echo " -> Fecha Lógica (Guardada): $resultado\n";
    echo "------------------------------------------------\n";
}

testTime($pdo, $empleado['id'], '2026-01-23 01:00:00');
?>
