<?php
// IniAdmin API — Listar Empleados
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT 
                e.id, 
                TRIM(e.nombre_completo) as nombre_completo, 
                e.telefono, 
                e.estado, 
                e.fecha_ingreso,
                e.vehiculo_id,
                e.horario_entrada,
                e.horario_salida,
                e.equipo_id,
                eq.nombre as equipo_nombre,
                eq.color as equipo_color,
                v.unidad_nombre,
                u.usuario, 
                u.rol
              FROM empleados e
              LEFT JOIN usuarios u ON e.id = u.empleado_id
              LEFT JOIN vehiculos v ON e.vehiculo_id = v.id
              LEFT JOIN equipos eq ON e.equipo_id = eq.id
              WHERE e.estado != 'Eliminado'
              ORDER BY e.nombre_completo ASC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $empleados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Scan files for each employee
    $upload_dir = "uploads/";
    $documentos_tipos = ['foto_perfil', 'foto_ine', 'foto_curp', 'foto_rfc', 'foto_licencia'];
    
    foreach ($empleados as &$emp) {
        // Fetch divisions
        $stmtDiv = $db->prepare("
            SELECT d.id, d.nombre, d.color 
            FROM divisiones d
            JOIN empleado_divisiones ed ON d.id = ed.division_id
            WHERE ed.empleado_id = ?
        ");
        $stmtDiv->execute([$emp['id']]);
        $emp['divisiones'] = $stmtDiv->fetchAll(PDO::FETCH_ASSOC);

        if (!empty($emp['usuario'])) {
            $user_clean = preg_replace('/[^A-Za-z0-9_\-]/', '_', $emp['usuario']);
            
            foreach ($documentos_tipos as $tipo) {
                $pattern = $upload_dir . $user_clean . "_" . $tipo . ".*";
                $files = glob($pattern);
                
                if ($files && count($files) > 0) {
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
