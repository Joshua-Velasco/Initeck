<?php

if (php_sapi_name() === 'cli') {
    $_SERVER['HTTP_ORIGIN'] = 'http://localhost';
    $_SERVER['REMOTE_ADDR'] = '127.0.0.1';
    $_SERVER['HTTP_HOST'] = 'localhost';
    $_SERVER['REQUEST_METHOD'] = 'GET';
}

require_once 'config/database.php';
require_once 'v1/empleados/utils/shift_utils.php';

$database = new Database();
$pdo = $database->getConnection();

echo "Timezone actual: " . date_default_timezone_get() . "\n";
echo "Hora actual: " . date('Y-m-d H:i:s') . "\n\n";

// Seleccionar primer empleado activo con horario
$stmt = $pdo->query("SELECT id, nombre_completo, horario_entrada, horario_salida FROM empleados WHERE estado = 'Activo' AND horario_entrada IS NOT NULL AND horario_entrada != '' LIMIT 1");
$empleado = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$empleado) {
    echo "No se encontró empleado activo con horario.\n";
    exit;
}

echo "Empleado de prueba: " . $empleado['nombre_completo'] . "\n";
echo "Horario Entrada: " . $empleado['horario_entrada'] . "\n";
echo "Horario Salida:  " . $empleado['horario_salida'] . "\n\n";

function testTime($pdo, $empId, $mockTimeStr) {
    // Mocking time involves hacking the utility or passing time as param.
    // Since getLogicalDate uses date(), we can't easily mock it without modifying the function to accept a timestamp 
    // or changing system time (impossible).
    // So for this test, let's copy the logic inline to verify it.
    
    $entrada = '04:00:00'; // Hardcoded from user example to test HIS theory
    $mockTime = strtotime($mockTimeStr);
    $horaActual = date('H:i:s', $mockTime);
    $fechaActual = date('Y-m-d', $mockTime);
    
    $resultado = $fechaActual;
    
    if ($horaActual < $entrada) {
        $resultado = date('Y-m-d', strtotime('-1 day', $mockTime));
    }
    
    echo "Simulación: Si son las [$mockTimeStr] (Hora: $horaActual) y Turno inicia $entrada:\n";
    echo " -> Fecha Calendario: $fechaActual\n";
    echo " -> Fecha Lógica (Guardada): $resultado\n";
    echo "------------------------------------------------\n";
}

// Escenarios del usuario
// "Turno inicia 4am dia 22. Termina 3:59am dia 23."
// "Liquidacion a la 1am (del dia 23...)"

// Test 1: 1 AM del día 23
testTime($pdo, $empleado['id'], '2026-01-23 01:00:00');

// Test 2: 3:59 AM del día 23
testTime($pdo, $empleado['id'], '2026-01-23 03:59:59');

// Test 3: 4:01 AM del día 23
testTime($pdo, $empleado['id'], '2026-01-23 04:01:00');

// Test 4: 11 PM del día 22
testTime($pdo, $empleado['id'], '2026-01-22 23:00:00');

?>
