<?php
// Script para eliminar headers CORS de todos los archivos PHP
$files = [
    'auth/actualizar_password.php',
    'auth/actualizar_perfil.php', 
    'auth/login.php',
    'v1/balance/balance.php',
    'v1/dashboard/dashboard.php',
    'v1/empleados/asignar_unidad.php',
    'v1/empleados/crear.php',
    'v1/empleados/datos_diarios.php',
    'v1/empleados/editar.php',
    'v1/empleados/eliminar.php',
    'v1/empleados/empleados.php',
    'v1/empleados/eventos_recientes.php',
    'v1/empleados/liquidaciones_tiempo_real.php',
    'v1/empleados/rendimiento.php',
    'v1/empleados/simular_movimiento.php',
    'v1/empleados/ubicacion_tiempo_real.php',
    'v1/empleados/update_location.php',
    'v1/empleados/usuario/actualizar_gps.php',
    'v1/empleados/usuario/enviar_sos.php',
    'v1/empleados/usuario/finalizar_jornada.php',
    'v1/empleados/usuario/get_vehiculos.php',
    'v1/empleados/usuario/guardar_gasto.php',
    'v1/empleados/usuario/guardar_inspeccion.php',
    'v1/empleados/usuario/guardar_liquidacion.php',
    'v1/empleados/usuario/historial.php',
    'v1/empleados/usuario/obtener_odometro.php',
    'v1/empleados/usuario/resumen_diario.php',
    'v1/vehiculos/listar.php',
    'v1/vehiculos/vehiculos.php',
    'v1/vehiculos/vehiculosAnadir.php',
    'v1/vehiculos/vehiculosEliminar.php',
    'v1/vehiculos/vehiculosMantenimiento.php',
    'v1/vehiculos/vehiculosModificar.php',
    'v1/viajes/viajes.php'
];

foreach ($files as $file) {
    $filepath = __DIR__ . '/' . $file;
    if (file_exists($filepath)) {
        echo "Procesando: $file\n";
        $content = file_get_contents($filepath);
        
        // Reemplazar headers CORS con comentario
        $content = preg_replace('/^<\?php\s*\nheader\("Access-Control-Allow-Origin.*?\);?\n/m', "<?php\n// Headers CORS son manejados por Apache en .htaccess\n\nif (\$_SERVER['REQUEST_METHOD'] == 'OPTIONS') {\n    http_response_code(200);\n    exit();\n}\n\n", $content);
        
        // También eliminar otros headers CORS si existen
        $content = preg_replace('/^<\?php\s*\nheader\("Access-Control-Allow-Credentials.*?\);?\n/m', '', $content);
        $content = preg_replace('/^<\?php\s*\nheader\("Access-Control-Allow-Methods.*?\);?\n/m', '', $content);
        $content = preg_replace('/^<\?php\s*\nheader\("Access-Control-Allow-Headers.*?\);?\n/m', '', $content);
        $content = preg_replace('/^<\?php\s*\nheader\("Content-Type.*?\);?\n/m', '', $content);
        
        file_put_contents($filepath, $content);
        echo "Headers CORS eliminados de: $file\n";
    } else {
        echo "Archivo no encontrado: $file\n";
    }
}

echo "Proceso completado.\n";
