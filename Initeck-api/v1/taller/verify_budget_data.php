<?php
// Initeck-api/v1/taller/verify_budget_data.php
// Script para verificar la estructura y datos de presupuesto

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $results = [
        'status' => 'success',
        'checks' => []
    ];

    // 1. Verificar que las columnas de presupuesto existen
    $budgetColumns = [
        'costo_aceite_anual',
        'costo_tuneup_anual',
        'costo_lavado_anual',
        'costo_llantas_anual',
        'costo_frenos_anual',
        'costo_servicio_general_anual'
    ];

    $results['checks']['columns'] = [];
    foreach ($budgetColumns as $column) {
        $sql = "SHOW COLUMNS FROM vehiculos LIKE ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$column]);
        $exists = $stmt->rowCount() > 0;

        $results['checks']['columns'][$column] = [
            'exists' => $exists,
            'status' => $exists ? '✅' : '❌'
        ];
    }

    // 2. Obtener datos de ejemplo de vehículos
    $sql = "SELECT 
                id, 
                unidad_nombre,
                costo_aceite_anual,
                costo_tuneup_anual,
                costo_lavado_anual,
                costo_llantas_anual,
                costo_frenos_anual,
                costo_servicio_general_anual
            FROM vehiculos 
            LIMIT 5";

    $stmt = $db->prepare($sql);
    $stmt->execute();
    $vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $results['checks']['sample_data'] = $vehicles;

    // 3. Estadísticas de valores NULL o 0
    $stats = [];
    foreach ($budgetColumns as $column) {
        $sql = "SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN $column IS NULL THEN 1 ELSE 0 END) as null_count,
                    SUM(CASE WHEN $column = 0 THEN 1 ELSE 0 END) as zero_count,
                    SUM(CASE WHEN $column > 0 THEN 1 ELSE 0 END) as has_value_count,
                    AVG($column) as average_value,
                    MAX($column) as max_value
                FROM vehiculos";

        $stmt = $db->prepare($sql);
        $stmt->execute();
        $stats[$column] = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    $results['checks']['statistics'] = $stats;

    // 4. Verificar si hay vehículos sin presupuesto asignado
    $sql = "SELECT COUNT(*) as count FROM vehiculos 
            WHERE (costo_aceite_anual IS NULL OR costo_aceite_anual = 0)
            AND (costo_frenos_anual IS NULL OR costo_frenos_anual = 0)
            AND (costo_llantas_anual IS NULL OR costo_llantas_anual = 0)
            AND (costo_servicio_general_anual IS NULL OR costo_servicio_general_anual = 0)";

    $stmt = $db->prepare($sql);
    $stmt->execute();
    $nobudget = $stmt->fetch(PDO::FETCH_ASSOC);

    $results['checks']['vehicles_without_budget'] = $nobudget['count'];

    echo json_encode($results, JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>