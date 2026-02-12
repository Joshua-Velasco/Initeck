<?php
// setup_new_roles.php
// Script para crear usuarios iniciales de Monitorista y Taller
// Ejecutar una sola vez accediendo a este archivo desde el navegador

require_once '../config/database.php';

echo "<h1>Configuración de Nuevos Roles</h1>";

try {
    $database = new Database();
    $db = $database->getConnection();

    // 1. Usuarios a crear
    $nuevos_usuarios = [
        [
            'usuario' => 'monitor_flota',
            'password' => 'monitor123', // Contraseña provisional
            'rol' => 'monitorista',
            'nombre' => 'Monitor de Flota Real'
        ],
        [
            'usuario' => 'taller_user',
            'password' => 'taller123', // Contraseña provisional
            'rol' => 'taller',
            'nombre' => 'Encargado de Taller'
        ]
    ];

    foreach ($nuevos_usuarios as $user_data) {
        // Verificar si existe
        $check = $db->prepare("SELECT id FROM usuarios WHERE usuario = ?");
        $check->execute([$user_data['usuario']]);
        
        if ($check->rowCount() > 0) {
            echo "<p style='color: orange;'>El usuario <strong>{$user_data['usuario']}</strong> ya existe. Saltando...</p>";
        } else {
            // Hash password
            $hashed_password = password_hash($user_data['password'], PASSWORD_DEFAULT);
            
            // Insertar
            // Nota: Insertamos NULL en empleado_id porque son usuarios de sistema, no necesariamente empleados operativos con viajes
            $sql = "INSERT INTO usuarios (usuario, password, rol, empleado_id, requiere_cambio) VALUES (?, ?, ?, NULL, 1)";
            $stmt = $db->prepare($sql);
            
            if ($stmt->execute([$user_data['usuario'], $hashed_password, $user_data['rol']])) {
                echo "<p style='color: green;'>Usuario <strong>{$user_data['usuario']}</strong> creado exitosamente (Rol: {$user_data['rol']}).</p>";
            } else {
                echo "<p style='color: red;'>Error al crear {$user_data['usuario']}.</p>";
            }
        }
    }

    echo "<hr><p>Proceso completado. Intente iniciar sesión con los nuevos usuarios.</p>";
    echo "<p>Nota: La contraseña temporal pide cambio al primer inicio (si 'requiere_cambio' está activo).</p>";

} catch (PDOException $e) {
    echo "Error de Base de Datos: " . $e->getMessage();
}
?>
