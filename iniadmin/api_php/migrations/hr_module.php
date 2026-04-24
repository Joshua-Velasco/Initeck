<?php
/**
 * IniAdmin — Migración: Módulo RH
 * Crea las tablas para habilidades, ficha médica e historial de desempeño.
 * Ejecutar UNA sola vez desde localhost.
 */

$isLocal = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'])
    || strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false;

if (!$isLocal) {
    http_response_code(403);
    echo json_encode(['error' => 'Solo disponible en entorno local']);
    exit;
}

require_once '../config/database.php';
$db = (new Database())->getConnection();
header('Content-Type: application/json');

$results = [];

// ── Tabla: empleado_habilidades ──
try {
    $db->exec("
        CREATE TABLE IF NOT EXISTS empleado_habilidades (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            empleado_id INT NOT NULL,
            nombre      VARCHAR(100) NOT NULL,
            nivel       ENUM('basico','intermedio','avanzado','experto') DEFAULT 'intermedio',
            categoria   VARCHAR(80) DEFAULT '',
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $results['empleado_habilidades'] = 'OK';
} catch (Exception $e) {
    $results['empleado_habilidades'] = 'ERROR: ' . $e->getMessage();
}

// ── Tabla: empleado_ficha_medica ──
try {
    $db->exec("
        CREATE TABLE IF NOT EXISTS empleado_ficha_medica (
            id                     INT AUTO_INCREMENT PRIMARY KEY,
            empleado_id            INT NOT NULL UNIQUE,
            tipo_sangre            VARCHAR(5) DEFAULT '',
            alergias               TEXT DEFAULT '',
            condiciones_cronicas   TEXT DEFAULT '',
            medicamentos           TEXT DEFAULT '',
            contacto_nombre        VARCHAR(150) DEFAULT '',
            contacto_telefono      VARCHAR(20) DEFAULT '',
            contacto_parentesco    VARCHAR(80) DEFAULT '',
            seguro_medico          VARCHAR(150) DEFAULT '',
            numero_poliza          VARCHAR(80) DEFAULT '',
            updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $results['empleado_ficha_medica'] = 'OK';
} catch (Exception $e) {
    $results['empleado_ficha_medica'] = 'ERROR: ' . $e->getMessage();
}

// ── Tabla: empleado_historial ──
try {
    $db->exec("
        CREATE TABLE IF NOT EXISTS empleado_historial (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            empleado_id INT NOT NULL,
            tipo        ENUM('retardo','mejora','acierto','proyecto','vacacion') NOT NULL,
            titulo      VARCHAR(200) NOT NULL,
            descripcion TEXT DEFAULT '',
            fecha       DATE,
            fecha_fin   DATE,
            estado      VARCHAR(50) DEFAULT 'activo',
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $results['empleado_historial'] = 'OK';
} catch (Exception $e) {
    $results['empleado_historial'] = 'ERROR: ' . $e->getMessage();
}

echo json_encode([
    'status'  => 'done',
    'message' => 'Migración RH completada',
    'tables'  => $results,
]);
?>
