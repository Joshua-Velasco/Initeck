<?php
require_once 'config/database.php';
$database = new Database('tracker'); // Force local for test
$db = $database->getConnection();

// Mock POST data logic by calling the update logic directly or simulating request
// But since verify via HTTP is complex in CLI without curl to localhost, I will simply test the SQL execution logic here.

try {
    // 1. Get an employee ID
    $stmt = $db->query("SELECT id FROM empleados LIMIT 1");
    $emp = $stmt->fetch();
    $id = $emp['id'];

    if (!$id) die("No employees found");

    // 2. Update schedule
    $query = "UPDATE empleados SET horario_entrada = :entrada, horario_salida = :salida WHERE id = :id";
    $stmt = $db->prepare($query);
    $entrada = "09:00:00";
    $salida = "18:00:00";
    
    $stmt->bindParam(":entrada", $entrada);
    $stmt->bindParam(":salida", $salida);
    $stmt->bindParam(":id", $id);
    
    if ($stmt->execute()) {
        echo "Update successful for ID $id\n";
    } else {
        echo "Update failed\n";
    }

    // 3. Verify
    $check = $db->query("SELECT horario_entrada, horario_salida FROM empleados WHERE id = $id");
    print_r($check->fetch(PDO::FETCH_ASSOC));

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
