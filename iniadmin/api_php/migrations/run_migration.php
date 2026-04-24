<?php
require_once __DIR__ . '/../config/database.php';

header("Content-Type: text/plain");

try {
    $db = new Database();
    $conn = $db->getConnection();

    $sql = file_get_contents(__DIR__ . '/schema_up.sql');
    
    // Ejecutar múltiples statements
    $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, 0); // para evitar algunos warnings con múltiples queries
    
    // execute them
    foreach(explode(';', $sql) as $statement) {
        $statement = trim($statement);
        if(!empty($statement)) {
            $conn->exec($statement);
            echo "SUCCESS: " . substr($statement, 0, 50) . "...\n";
        }
    }
    
    echo "\nAll migrations executed successfully.\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    http_response_code(500);
}
