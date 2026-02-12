<?php
require_once '../../config/database.php';

$database = new Database();
$conn = $database->getConnection();

echo "<h1>Debug Liquidaciones</h1>";
echo "<p>Server Date: " . date('Y-m-d H:i:s') . "</p>";

try {
    $stmt = $conn->query("SELECT id, empleado_id, monto_efectivo, gastos_total, fecha, hora FROM liquidaciones ORDER BY id DESC LIMIT 10");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1'><tr><th>ID</th><th>Monto</th><th>Gastos</th><th>Fecha</th><th>Hora</th></tr>";
    foreach($rows as $row) {
        echo "<tr>";
        echo "<td>{$row['id']}</td>";
        echo "<td>{$row['monto_efectivo']}</td>";
        echo "<td>{$row['gastos_total']}</td>";
        echo "<td>{$row['fecha']}</td>";
        echo "<td>{$row['hora']}</td>";
        echo "</tr>";
    }
    echo "</table>";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
