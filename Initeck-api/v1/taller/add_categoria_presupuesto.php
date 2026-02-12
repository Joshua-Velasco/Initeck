<?php
// Initeck-api/v1/taller/add_categoria_presupuesto.php
// Script para agregar columna categoria_presupuesto a la tabla mantenimientos

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Verificar si la columna ya existe
    $sql = "SHOW COLUMNS FROM mantenimientos LIKE 'categoria_presupuesto'";
    $stmt = $db->prepare($sql);
    $stmt->execute();

    if ($stmt->rowCount() == 0) {
        // Agregar columna categoria_presupuesto
        $alterSql = "ALTER TABLE mantenimientos 
                     ADD COLUMN categoria_presupuesto VARCHAR(50) NULL 
                     AFTER presupuesto";

        $db->exec($alterSql);

        echo json_encode([
            "status" => "success",
            "message" => "Columna categoria_presupuesto agregada exitosamente a la tabla mantenimientos"
        ]);
    } else {
        echo json_encode([
            "status" => "success",
            "message" => "La columna categoria_presupuesto ya existe"
        ]);
    }

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error al modificar la tabla: " . $e->getMessage()
    ]);
}
?>