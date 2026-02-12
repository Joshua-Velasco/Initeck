<?php
require_once '../../config/database.php';

echo "<h1>Actualización de Esquema Vehículos</h1>";

try {
    // Force 'tracker' (local) config for CLI/Setup
    $database = new Database('tracker');
    $db = $database->getConnection();

    $columns = [
        "costo_seguro_monto DECIMAL(10,2) DEFAULT 0",
        "costo_seguro_periodo VARCHAR(20) DEFAULT 'anual'",
        "costo_seguro_anual DECIMAL(10,2) DEFAULT 0",
        "costo_deducible_seguro_monto DECIMAL(10,2) DEFAULT 0",
        "costo_deducible_seguro_periodo VARCHAR(20) DEFAULT 'anual'",
        "costo_deducible_seguro_anual DECIMAL(10,2) DEFAULT 0",
        "costo_gasolina_monto DECIMAL(10,2) DEFAULT 0",
        "costo_gasolina_periodo VARCHAR(20) DEFAULT 'anual'",
        "costo_gasolina_anual DECIMAL(10,2) DEFAULT 0",
        "costo_aceite_monto DECIMAL(10,2) DEFAULT 0",
        "costo_aceite_periodo VARCHAR(20) DEFAULT 'anual'",
        "costo_aceite_anual DECIMAL(10,2) DEFAULT 0",
        "costo_ecologico_monto DECIMAL(10,2) DEFAULT 0",
        "costo_ecologico_periodo VARCHAR(20) DEFAULT 'anual'",
        "costo_ecologico_anual DECIMAL(10,2) DEFAULT 0",
        "costo_placas_monto DECIMAL(10,2) DEFAULT 0",
        "costo_placas_periodo VARCHAR(20) DEFAULT 'anual'",
        "costo_placas_anual DECIMAL(10,2) DEFAULT 0",
        "costo_servicio_general_monto DECIMAL(10,2) DEFAULT 0",
        "costo_servicio_general_periodo VARCHAR(20) DEFAULT 'anual'",
        "costo_servicio_general_anual DECIMAL(10,2) DEFAULT 0",
        "costo_llantas_monto DECIMAL(10,2) DEFAULT 0",
        "costo_llantas_periodo VARCHAR(20) DEFAULT 'anual'",
        "costo_llantas_anual DECIMAL(10,2) DEFAULT 0",
        "costo_tuneup_monto DECIMAL(10,2) DEFAULT 0",
        "costo_tuneup_periodo VARCHAR(20) DEFAULT 'anual'",
        "costo_tuneup_anual DECIMAL(10,2) DEFAULT 0",
        "costo_frenos_monto DECIMAL(10,2) DEFAULT 0",
        "costo_frenos_periodo VARCHAR(20) DEFAULT 'anual'",
        "costo_frenos_anual DECIMAL(10,2) DEFAULT 0",
        "costo_lavado_monto DECIMAL(10,2) DEFAULT 0",
        "costo_lavado_periodo VARCHAR(20) DEFAULT 'anual'",
        "costo_lavado_anual DECIMAL(10,2) DEFAULT 0",
        "unidad_medida VARCHAR(20) DEFAULT 'km'",
        "rendimiento_gasolina DECIMAL(10,2) DEFAULT 0",
        "fecha_pago_seguro DATE",
        "fecha_pago_placas DATE",
        "fecha_pago_ecologico DATE",
        "fecha_proximo_mantenimiento DATE",
        "motor VARCHAR(100)",
        "tipo_aceite VARCHAR(100)",
        "filtro_aire VARCHAR(100)",
        "tipo_frenos VARCHAR(100)",
        "bujias VARCHAR(100)"
    ];

    foreach ($columns as $col) {
        try {
            // Extract column name for display
            $parts = explode(' ', $col);
            $colName = $parts[0];

            $sql = "ALTER TABLE vehiculos ADD COLUMN $col";
            $db->exec($sql);
            echo "<p style='color: green;'>Columna <strong>$colName</strong> agregada.</p>";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate column') !== false) {
                // Ignore
            } else {
                echo "<p style='color: red;'>Error agregando $colName: " . $e->getMessage() . "</p>";
            }
        }
    }

    echo "<hr><p>Proceso finalizado.</p>";

} catch (PDOException $e) {
    echo "Error General: " . $e->getMessage();
}
?>