<?php
// Headers CORS son manejados por Apache en .htaccess

// Manejar la petición "preflight" de los navegadores
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once '../../config/database.php';
$db = (new Database())->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Usamos alias más claros: vj = viajes, emp = empleados, vh = vehiculos
        $query = "SELECT 
                    vj.*, 
                    emp.nombre_completo AS nombre_empleado, 
                    vh.unidad_nombre 
                  FROM viajes vj
                  INNER JOIN empleados emp ON vj.empleado_id = emp.id
                  INNER JOIN vehiculos vh ON vj.vehiculo_id = vh.id
                  ORDER BY vj.fecha_viaje DESC";
        
        try {
            $stmt = $db->prepare($query);
            $stmt->execute();
            $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($resultados);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;

    case 'POST':
        try {
            $db->beginTransaction();

            $emp_id = $_POST['empleado_id'];
            $veh_id = $_POST['vehiculo_id'];
            $km = $_POST['kilometros_recorridos'];
            $monto = $_POST['monto_total'];
            $propina = $_POST['propina'] ?? 0;

            // 1. Insertar el viaje
            $sql = "INSERT INTO viajes (empleado_id, vehiculo_id, origen, destino, kilometros_recorridos, monto_total, propina, metodo_pago, notas) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $db->prepare($sql)->execute([
                $emp_id, $veh_id, $_POST['origen'], $_POST['destino'], $km, $monto, $propina, $_POST['metodo_pago'], $_POST['notas']
            ]);

            // 2. ACTUALIZAR EMPLEADO (Sumar ganancias y KM)
            $sqlEmp = "UPDATE empleados SET 
                       total_viajes = total_viajes + ?, 
                       total_propinas = total_propinas + ?, 
                       total_km = total_km + ? 
                       WHERE id = ?";
            $db->prepare($sqlEmp)->execute([$monto, $propina, $km, $emp_id]);

            // 3. ACTUALIZAR VEHÍCULO (Sumar KM)
            $sqlVeh = "UPDATE vehiculos SET kilometraje = kilometraje + ? WHERE id = ?";
            $db->prepare($sqlVeh)->execute([$km, $veh_id]);

            $db->commit();
            echo json_encode(["status" => "success"]);
        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
        break;
}
?>