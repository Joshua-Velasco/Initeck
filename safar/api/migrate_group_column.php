<?php
// Header suppression for CLI
$host = '127.0.0.1';
$db_name = 'initeckc_tracker';
$username = 'root';
$password = '';
try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Check if column exists first to avoid error on retry
    $check = $conn->query("SHOW COLUMNS FROM safar_ordenservicio LIKE 'CodigoGrupo'");
    if ($check->rowCount() == 0) {
        $conn->exec("ALTER TABLE safar_ordenservicio ADD COLUMN CodigoGrupo VARCHAR(50) DEFAULT NULL AFTER Folio");
        echo "Column 'CodigoGrupo' added successfully to safar_ordenservicio.";
    } else {
        echo "Column 'CodigoGrupo' already exists.";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
