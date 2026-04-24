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
    $documentos_tipos = ['foto_perfil', 'foto_ine', 'foto_curp', 'foto_rfc', 'foto_licencia'];

    foreach ($empleados as &$emp) {
        if (!empty($emp['usuario'])) {
            $user_clean = preg_replace('/[^A-Za-z0-9_\-]/', '_', $emp['usuario']);

            foreach ($documentos_tipos as $tipo) {
                // Use DB value as primary source; fall back to filesystem glob
                $dbValue = $emp[$tipo] ?? null; // foto_perfil column may exist in DB
                if ($dbValue && file_exists($upload_dir . $dbValue)) {
                    // DB value is valid — use it
                    continue;
                }

                // Fallback: scan filesystem
                $pattern = $upload_dir . $user_clean . "_" . $tipo . ".*";
                $files = glob($pattern);

                if ($files && count($files) > 0) {
                    $emp[$tipo] = basename($files[0]);
                    // Auto-heal: write filename back to DB so future queries have it
                    if ($tipo === 'foto_perfil' && !empty($emp['id'])) {
                        try {
                            $stmtHeal = $db->prepare("UPDATE empleados SET foto_perfil = :fp WHERE id = :id AND (foto_perfil IS NULL OR foto_perfil = '')");
                            $stmtHeal->execute([':fp' => $emp[$tipo], ':id' => $emp['id']]);
                        } catch (Exception $e) { /* column may not exist yet */ }
                    }
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