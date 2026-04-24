<?php
require_once '../../config/database.php';
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configurar CORS
$allowed_origins = ['http://localhost:5173', 'https://admin.initeck.com.mx'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Content-Type: application/json; charset=UTF-8");

try {
    $database = new Database();
    $db = $database->getConnection();

    // Obtener los últimos 50 comentarios (Inspecciones + Mensajes en Ruta)
    $sql = "(SELECT 
                i.id, 
                i.fecha, 
                v.unidad_nombre, 
                v.placas,
                e.nombre_completo AS operador,
                '' AS operador_apellido,
                i.comentarios_inicio, 
                i.comentarios_final,
                i.estado_reporte,
                'inspeccion' as tipo
            FROM inspecciones_vehiculos i
            JOIN vehiculos v ON i.vehiculo_id = v.id
            JOIN empleados e ON i.empleado_id = e.id
            WHERE (i.comentarios_inicio IS NOT NULL AND i.comentarios_inicio != '') 
               OR (i.comentarios_final IS NOT NULL AND i.comentarios_final != ''))
            
            UNION ALL

            (SELECT 
                m.id,
                m.fecha,
                v.unidad_nombre,
                v.placas,
                e.nombre_completo AS operador,
                '' AS operador_apellido,
                m.mensaje AS comentarios_inicio,
                NULL AS comentarios_final,
                m.estado_reporte,
                'ruta' as tipo
            FROM taller_mensajes_operativos m
            JOIN vehiculos v ON m.vehiculo_id = v.id
            JOIN empleados e ON m.empleado_id = e.id)

            ORDER BY fecha DESC, id DESC
            LIMIT 50";

    $stmt = $db->prepare($sql);
    $stmt->execute();
    $comentarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($comentarios);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
