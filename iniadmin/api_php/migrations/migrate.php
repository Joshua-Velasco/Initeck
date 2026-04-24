<?php
require_once __DIR__ . '/../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    // 1. Crear tabla tareas
    echo "1. Creando tabla 'tareas'...\n";
    $sqlTareas = "
    CREATE TABLE IF NOT EXISTS tareas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(200) NOT NULL,
        descripcion TEXT,
        empleado_id INT NULL,
        asignado_por INT NULL,
        fecha_inicio DATE NULL,
        fecha_fin DATE NULL,
        hora_inicio TIME NULL,
        hora_fin TIME NULL,
        estado ENUM('pendiente', 'en_progreso', 'completada', 'cancelada') DEFAULT 'pendiente',
        prioridad ENUM('baja', 'media', 'alta', 'urgente') DEFAULT 'media',
        departamento VARCHAR(50) NOT NULL,
        materiales TEXT NULL,
        responsabilidades TEXT NULL,
        color VARCHAR(20) DEFAULT '#b91c1c',
        notas TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_empleado_id (empleado_id),
        KEY idx_departamento (departamento),
        KEY idx_estado (estado),
        KEY idx_fecha_inicio (fecha_inicio)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $conn->exec($sqlTareas);
    echo "- Tabla 'tareas' lista.\n\n";

    // 2. Mapear roles en 'empleados'
    echo "2. Mapeando roles antiguos a nuevos roles en 'empleados'...\n";
    
    $updateMap = [
        'operator' => 'campo',
        'cleaning' => 'campo',
        'taller' => 'campo',
        'employee' => 'campo',
        'monitorista' => 'soporte',
        'development' => 'developer',
        'admin' => 'admin'
    ];
    
    $updatedCount = 0;
    foreach ($updateMap as $old => $new) {
        $stmt = $conn->prepare("UPDATE empleados SET rol = :new_role WHERE rol = :old_role");
        $stmt->bindParam(':new_role', $new);
        $stmt->bindParam(':old_role', $old);
        $stmt->execute();
        $updatedCount += $stmt->rowCount();
    }
    
    // Y actualizar todos los que estén vacíos o nulos o no mapeados por defecto a campo para seguridad (opcional, omitiré para no ensuciar datos raros)
    
    // Mapear también tabla 'usuarios' donde rol podría estar
    echo "- Roles de empleados mapeados ($updatedCount filas afectadas).\n\n";

    echo "3. Mapeando roles antiguos a nuevos roles en 'usuarios'...\n";
    $updatedUsrCount = 0;
    foreach ($updateMap as $old => $new) {
        // En Initeck-Tracker la tabla usuarios a veces tiene campo `rol_id` en vez de `rol`. Revisaré primero si existe columna `rol`.
        try {
            $stmt = $conn->prepare("UPDATE usuarios SET rol = :new_role WHERE rol = :old_role");
            $stmt->bindParam(':new_role', $new);
            $stmt->bindParam(':old_role', $old);
            $stmt->execute();
            $updatedUsrCount += $stmt->rowCount();
        } catch(PDOException $e) {
             // Ignorar si no hay tabla usuarios o no tiene columna rol
             echo "   (No se pudo actualizar usuarios: " . $e->getMessage() . ")\n";
        }
    }
    echo "- Roles de usuarios mapeados ($updatedUsrCount filas afectadas).\n\n";


    echo "Migración completada exitosamente.\n";

} catch (PDOException $e) {
    echo "ERROR DE BD: " . $e->getMessage() . "\n";
    exit(1);
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
?>
