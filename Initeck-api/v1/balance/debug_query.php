<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $fi = date('Y-m-d');
    $ff = date('Y-m-d');

    $sql = "SELECT 
                l.empleado_id,
                e.nombre_completo as empleado_nombre,
                e.rol as empleado_rol,
                v.unidad_nombre as vehiculo_asignado,
                SUM(l.viajes) as total_viajes,
                SUM(l.monto_efectivo + COALESCE(l.propinas, 0)) as total_ingresos,
                SUM(l.gastos_total) as gastos_operativos_chofer,
                SUM(l.neto_entregado) as neto_entregado,
                GROUP_CONCAT(DISTINCT l.vehiculo_id) as vehiculos_ids
             FROM liquidaciones l
             LEFT JOIN empleados e ON l.empleado_id = e.id
             LEFT JOIN vehiculos v ON e.vehiculo_id = v.id
             WHERE l.fecha BETWEEN :fi AND :ff
             GROUP BY l.empleado_id";

    $stmt = $db->prepare($sql);
    $stmt->execute([':fi' => $fi, ':ff' => $ff]);
    echo "Query executed successfully";

} catch (Exception $e) {
    echo "SQL Error: " . $e->getMessage();
}
?>