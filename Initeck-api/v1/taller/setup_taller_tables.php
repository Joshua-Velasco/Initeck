<?php
// Initeck-api/v1/taller/setup_taller_tables.php
// Script para crear tablas del módulo Taller

require_once '../../config/database.php';

echo "<h1>Configuración de Tablas Taller</h1>";

try {
    // Force 'tracker' (local) config for CLI/Setup
    $database = new Database('tracker');
    $db = $database->getConnection();

    // 1. Tabla alertas_vehiculo
    $sqlAlertas = "CREATE TABLE IF NOT EXISTS alertas_vehiculo (
        id INT AUTO_INCREMENT PRIMARY KEY,
        unidad_id INT NOT NULL,
        titulo VARCHAR(100) NOT NULL,
        fecha DATE NOT NULL,
        dias_anticipacion INT DEFAULT 3,
        estado ENUM('Pendiente', 'Completada', 'Vencida') DEFAULT 'Pendiente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (unidad_id),
        FOREIGN KEY (unidad_id) REFERENCES vehiculos(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $db->exec($sqlAlertas);
    echo "<p style='color: green;'>Tabla <strong>alertas_vehiculo</strong> verificada/creada.</p>";

    // 2. Tabla inventario_taller
    $sqlInventario = "CREATE TABLE IF NOT EXISTS inventario_taller (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        descripcion VARCHAR(255),
        cantidad INT DEFAULT 1,
        estado ENUM('Bueno', 'Regular', 'Malo', 'Reparación') DEFAULT 'Bueno',
        foto_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $db->exec($sqlInventario);
    echo "<p style='color: green;'>Tabla <strong>inventario_taller</strong> verificada/creada.</p>";

    // 2.1 Update inspecciones_vehiculos (Add status)
    try {
        $sqlAlter = "ALTER TABLE inspecciones_vehiculos ADD COLUMN estado_reporte ENUM('Pendiente', 'Completado') DEFAULT 'Pendiente'";
        $db->exec($sqlAlter);
        echo "<p style='color: green;'>Columna <strong>estado_reporte</strong> agregada a inspecciones_vehiculos.</p>";
    } catch (PDOException $e) {
        // Ignore if column exists
        if (strpos($e->getMessage(), 'Duplicate column') === false) {
            // echo "<p style='color: orange;'>Nota: " . $e->getMessage() . "</p>";
        }
    }

    // 3. Tabla vehiculos_notas (Post-its)
    $sqlNotas = "CREATE TABLE IF NOT EXISTS vehiculos_notas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehiculo_id INT NOT NULL DEFAULT 0,
        nota TEXT NOT NULL,
        color VARCHAR(20) DEFAULT 'yellow',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (vehiculo_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";

    $db->exec($sqlNotas);
    echo "<p style='color: green;'>Tabla <strong>vehiculos_notas</strong> verificada/creada.</p>";

    // 4. Verificar columnas de equipamiento en vehiculos (Solo info, ya deberían existir)
    // Se asume que existen: llanta_refaccion, gato, cruzeta, cables_corriente. 
    // Si quisieramos agregar más, sería aquí.

    echo "<hr><p>Tablas listas.</p>";

} catch (PDOException $e) {
    echo "Error de Base de Datos: " . $e->getMessage();
}
?>