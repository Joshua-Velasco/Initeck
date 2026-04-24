<?php
// Run the proyecto_detalle migration
require_once '../config/database.php';
$db = (new Database())->getConnection();

$sqlFile = __DIR__ . '/proyecto_detalle_migration.sql';
$sql = file_get_contents($sqlFile);

// Split by semicolons and execute each statement
$statements = array_filter(array_map('trim', explode(';', $sql)));

$results = [];
foreach ($statements as $stmt) {
    if (empty($stmt) || strpos($stmt, '--') === 0) continue;
    try {
        $db->exec($stmt);
        $results[] = "✅ OK: " . substr($stmt, 0, 60) . "...";
    } catch (Exception $e) {
        $results[] = "⚠️ " . $e->getMessage() . " — " . substr($stmt, 0, 60) . "...";
    }
}

header('Content-Type: text/plain');
echo implode("\n", $results);
?>
