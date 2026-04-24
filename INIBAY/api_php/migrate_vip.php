<?php
// migrate_vip.php
// Self-contained migration script to avoid config.php CLI issues

$host = "127.0.0.1";
$db_name = "inibay_tvs";
$username = "root";
$password = "";

try {
    $dsn = "mysql:host=$host;dbname=$db_name;charset=utf8mb4";
    $conn = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    $sql = "ALTER TABLE suscripciones ADD COLUMN vip TINYINT(1) DEFAULT 0 AFTER costo";
    $conn->exec($sql);
    echo "Migration successful: Column 'vip' added to 'suscripciones' table.";
} catch (PDOException $e) {
    if ($e->getCode() == '42S21' || strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "Migration skipped: Column 'vip' already exists.";
    } else {
        echo "Migration failed: " . $e->getMessage();
    }
}
?>
