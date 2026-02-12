<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Add costo_frenos_anual if it doesnt exist
    $sql = "SHOW COLUMNS FROM vehiculos LIKE 'costo_frenos_anual'";
    $stmt = $db->prepare($sql);
    $stmt->execute();

    if ($stmt->rowCount() == 0) {
        $alterSql = "ALTER TABLE vehiculos ADD COLUMN costo_frenos_anual DECIMAL(10,2) DEFAULT 0.00 AFTER costo_tuneup_anual";
        $db->exec($alterSql);
        echo json_encode(["status" => "success", "message" => "Columna costo_frenos_anual agregada."]);
    }

    // Add costo_servicio_general_anual if it doesnt exist
    $sql2 = "SHOW COLUMNS FROM vehiculos LIKE 'costo_servicio_general_anual'";
    $stmt2 = $db->prepare($sql2);
    $stmt2->execute();

    if ($stmt2->rowCount() == 0) {
        $alterSql2 = "ALTER TABLE vehiculos ADD COLUMN costo_servicio_general_anual DECIMAL(10,2) DEFAULT 0.00 AFTER costo_frenos_anual";
        $db->exec($alterSql2);
        if (!isset($output['message']))
            $output['message'] = "";
        $output['message'] .= " Columna costo_servicio_general_anual agregada.";
    } else {
        if (!isset($output['message']))
            $output['message'] = "";
        $output['message'] .= " Columnas ya existen.";
    }

    echo json_encode(["status" => "success", "message" => $output['message']]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>