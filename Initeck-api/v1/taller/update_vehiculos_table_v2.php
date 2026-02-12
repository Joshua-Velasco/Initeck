<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $queries = [
        "ALTER TABLE vehiculos ADD COLUMN costo_frenos_monto DECIMAL(10,2) DEFAULT 0.00 AFTER costo_frenos_anual",
        "ALTER TABLE vehiculos ADD COLUMN costo_frenos_periodo VARCHAR(20) DEFAULT 'anual' AFTER costo_frenos_monto"
    ];

    foreach ($queries as $sql) {
        try {
            $db->exec($sql);
        } catch (PDOException $e) {
            // Ignore if exists or error
        }
    }

    echo json_encode(["status" => "success", "message" => "Columnas costo_frenos agregadas."]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>