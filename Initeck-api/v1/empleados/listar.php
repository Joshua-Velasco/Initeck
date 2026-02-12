<?php
// Headers CORS son manejados por Apache en .htaccess

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Unimos las dos tablas para obtener la información completa
    $query = "SELECT 
                e.id, 
                e.nombre_completo, 
                e.telefono, 
                e.estado, 
                e.fecha_ingreso,
                e.vehiculo_id,
                e.horario_entrada,
                e.horario_salida,
                v.unidad_nombre,
                u.usuario, 
                u.rol
              FROM empleados e
              LEFT JOIN usuarios u ON e.id = u.empleado_id
              LEFT JOIN vehiculos v ON e.vehiculo_id = v.id
              WHERE e.estado != 'Eliminado'
              ORDER BY e.nombre_completo ASC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $empleados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Escanear archivos para cada empleado
    $upload_dir = "uploads/";
    $documentos_tipos = ['foto_ine', 'foto_curp', 'foto_rfc', 'foto_licencia'];
    
    foreach ($empleados as &$emp) {
        if (!empty($emp['usuario'])) {
            $user_clean = preg_replace('/[^A-Za-z0-9_\-]/', '_', $emp['usuario']);
            
            foreach ($documentos_tipos as $tipo) {
                // Buscamos cualquier extensión (jpg, png, pdf, etc) que coincida con el patrón
                $pattern = $upload_dir . $user_clean . "_" . $tipo . ".*";
                $files = glob($pattern);
                
                if ($files && count($files) > 0) {
                    // Tomamos el primer archivo encontrado (el nombre físico con su extensión)
                    $emp[$tipo] = basename($files[0]);
                } else {
                    $emp[$tipo] = null;
                }
            }
        }
    }

    echo json_encode($empleados);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>