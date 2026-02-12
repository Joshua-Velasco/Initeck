<?php
// fix_db_roles.php
// Script para corregir el tipo de dato de la columna 'rol' y reasignar roles.

// Mock SERVER variables for CLI
if (php_sapi_name() === 'cli') {
    $_SERVER['REQUEST_METHOD'] = 'GET';
    $_SERVER['HTTP_ORIGIN'] = 'http://localhost';
}

require_once '../config/database.php';

echo "<h1>Corrección de Roles en Base de Datos</h1>";

try {
    $database = new Database();
    $db = $database->getConnection();

    // 1. Modificar columna 'rol' en tabla 'usuarios' a VARCHAR(50)
    // Esto elimina la restricción ENUM que probablemente está causando que los nuevos roles se guarden como cadena vacía.
    echo "<h3>1. Modificando estructura de 'usuarios'...</h3>";
    try {
        $db->exec("ALTER TABLE usuarios MODIFY COLUMN rol VARCHAR(50) NOT NULL DEFAULT 'employee'");
        echo "<p style='color: green;'>✔ Tabla 'usuarios' modificada a VARCHAR(50).</p>";
    } catch (PDOException $e) {
        echo "<p style='color: orange;'>⚠ Aviso: " . $e->getMessage() . "</p>";
    }

    // 2. Modificar columna 'rol' en tabla 'empleados' a VARCHAR(50)
    echo "<h3>2. Modificando estructura de 'empleados'...</h3>";
    try {
        $db->exec("ALTER TABLE empleados MODIFY COLUMN rol VARCHAR(50) NOT NULL DEFAULT 'employee'");
        echo "<p style='color: green;'>✔ Tabla 'empleados' modificada a VARCHAR(50).</p>";
    } catch (PDOException $e) {
        echo "<p style='color: orange;'>⚠ Aviso: " . $e->getMessage() . "</p>";
    }

    // 3. Corregir los usuarios monitorista y taller que podrían haber quedado con rol vacío
    echo "<h3>3. Corrigiendo usuarios existentes...</h3>";
    
    $updates = [
        ['rol' => 'monitorista', 'usuario' => 'monitor_flota'],
        ['rol' => 'taller', 'usuario' => 'taller_user']
    ];

    foreach ($updates as $upd) {
        $stmt = $db->prepare("UPDATE usuarios SET rol = ? WHERE usuario = ?");
        $stmt->execute([$upd['rol'], $upd['usuario']]);
        if ($stmt->rowCount() > 0) {
            echo "<p style='color: green;'>✔ Usuario '{$upd['usuario']}' corregido a rol '{$upd['rol']}'.</p>";
        } else {
            echo "<p style='color: gray;'>- Usuario '{$upd['usuario']}' no requirió cambios o no existe.</p>";
        }
    }

    echo "<hr><h3>¡Listo! Intenta iniciar sesión nuevamente.</h3>";

} catch (PDOException $e) {
    echo "<h3 style='color: red;'>Error General: " . $e->getMessage() . "</h3>";
}
?>
