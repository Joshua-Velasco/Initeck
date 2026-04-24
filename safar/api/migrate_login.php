<?php
require_once 'db_config.php';

try {
    echo "Iniciando migración...\n";

    // Add CorreoVerificado to safar_usuario (Default 0 para nuevos, 1 para existentes o podemos dejarlos como no verificados. Los pondremos como verificados los actuales para no afectarles)
    $conn->exec("ALTER TABLE safar_usuario ADD COLUMN CorreoVerificado TINYINT(1) DEFAULT 0;");
    echo "Columna CorreoVerificado añadida.\n";

    // Add CodigoOTP
    $conn->exec("ALTER TABLE safar_usuario ADD COLUMN CodigoOTP VARCHAR(255) NULL;");
    echo "Columna CodigoOTP añadida.\n";

    // Add ExpiracionOTP
    $conn->exec("ALTER TABLE safar_usuario ADD COLUMN ExpiracionOTP DATETIME NULL;");
    echo "Columna ExpiracionOTP añadida.\n";

    // Marcar como verificados los usuarios actuales para no romper sus accesos
    $conn->exec("UPDATE safar_usuario SET CorreoVerificado = 1;");
    echo "Usuarios actuales marcados como verificados.\n";

    echo "Migración completada con éxito.\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "Las columnas ya existen en la base de datos.\n";
    } else {
        echo "Error en migración: " . $e->getMessage() . "\n";
    }
}
?>
