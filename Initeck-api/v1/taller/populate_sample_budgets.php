<?php
// Initeck-api/v1/taller/populate_sample_budgets.php
// Script para poblar presupuestos de ejemplo en vehículos que no tienen valores

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Presupuestos de ejemplo por categoría (valores anuales en MXN)
    $defaultBudgets = [
        'costo_aceite_anual' => 3000.00,
        'costo_tuneup_anual' => 2500.00,
        'costo_lavado_anual' => 1200.00,
        'costo_llantas_anual' => 8000.00,
        'costo_frenos_anual' => 4000.00,
        'costo_servicio_general_anual' => 10000.00
    ];

    // Actualizar vehículos que tienen valores NULL o 0
    $updated = 0;

    foreach ($defaultBudgets as $column => $value) {
        $sql = "UPDATE vehiculos 
                SET $column = ? 
                WHERE $column IS NULL OR $column = 0";

        $stmt = $db->prepare($sql);
        $stmt->execute([$value]);
        $updated += $stmt->rowCount();
    }

    // Obtener resumen de vehículos actualizados
    $sql = "SELECT 
                id, 
                unidad_nombre,
                costo_aceite_anual,
                costo_tuneup_anual,
                costo_lavado_anual,
                costo_llantas_anual,
                costo_frenos_anual,
                costo_servicio_general_anual
            FROM vehiculos";

    $stmt = $db->prepare($sql);
    $stmt->execute();
    $vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'message' => "Se actualizaron $updated registros con presupuestos de ejemplo",
        'default_budgets' => $defaultBudgets,
        'vehicles' => $vehicles
    ], JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>