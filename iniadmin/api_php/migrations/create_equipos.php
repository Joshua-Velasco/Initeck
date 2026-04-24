<?php
require_once __DIR__ . '/../config/database.php';

header("Content-Type: text/plain");

try {
    $db = new Database();
    $conn = $db->getConnection();

    // 1. Crear tabla equipos
    echo "1. Creando tabla 'equipos'...\n";
    $sqlEquipos = "
    CREATE TABLE IF NOT EXISTS equipos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        descripcion TEXT NULL,
        encargado_id INT NULL,
        color VARCHAR(20) DEFAULT '#0891b2',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_encargado (encargado_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $conn->exec($sqlEquipos);
    echo "- Tabla 'equipos' lista.\n\n";

    // 2. Modificar tabla empleados para soportar equipo_id
    echo "2. Agregando 'equipo_id' a 'empleados'...\n";
    try {
        $conn->exec("ALTER TABLE empleados ADD COLUMN equipo_id INT NULL AFTER puesto");
        echo "- Columna 'equipo_id' agregada a 'empleados'.\n";
    } catch(PDOException $e) {
        // Ignorar si ya existe
        echo "- Nota: 'equipo_id' en 'empleados' posiblemente ya existe. (" . $e->getMessage() . ")\n";
    }

    try {
        $conn->exec("ALTER TABLE empleados ADD INDEX idx_equipo (equipo_id)");
    } catch(PDOException $e) {}

    // 3. Modificar tabla tareas para soportar equipo_id
    echo "\n3. Agregando 'equipo_id' a 'tareas'...\n";
    try {
        $conn->exec("ALTER TABLE tareas ADD COLUMN equipo_id INT NULL AFTER empleado_id");
        echo "- Columna 'equipo_id' agregada a 'tareas'.\n";
    } catch(PDOException $e) {
        // Ignorar si ya existe
        echo "- Nota: 'equipo_id' en 'tareas' posiblemente ya existe. (" . $e->getMessage() . ")\n";
    }

    try {
        $conn->exec("ALTER TABLE tareas ADD INDEX idx_equipo_tarea (equipo_id)");
    } catch(PDOException $e) {}

    echo "\n¡Migración de Equipos completada exitosamente!\n";

} catch (PDOException $e) {
    echo "ERROR DE BD: " . $e->getMessage() . "\n";
    http_response_code(500);
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    http_response_code(500);
}
?>
