<?php
// cli_analyze.php
// Mock SERVER variables for CLI
if (php_sapi_name() === 'cli') {
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['HTTP_ORIGIN'] = 'http://localhost';
}
require_once dirname(__DIR__) . '/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "--- ANALYSIS START ---\n";
    
    // 1. Check Column Type
    echo "[Checking Schema]\n";
    $stmt = $db->query("SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'rol'");
    $type = $stmt->fetchColumn();
    echo "usuarios.rol type: " . $type . "\n";

    $stmt = $db->query("SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'empleados' AND COLUMN_NAME = 'rol'");
    $type2 = $stmt->fetchColumn();
    echo "empleados.rol type: " . $type2 . "\n";

    // 2. Check Users
    echo "\n[Checking Users]\n";
    $stmt = $db->query("SELECT id, usuario, rol FROM usuarios");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($users as $u) {
        echo "ID: {$u['id']} | User: {$u['usuario']} | Rol: '{$u['rol']}'\n";
    }

    echo "--- ANALYSIS END ---\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
