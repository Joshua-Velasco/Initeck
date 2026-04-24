<?php
// Headers CORS son manejados por Apache en .htaccess

// Manejar la petición "preflight" de los navegadores
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->empleado_id) && !empty($data->vehiculo_id)) {
    try {
        $db->beginTransaction();

        // 1. Verificar que el vehículo no esté asignado a otro empleado
        $stmtCheck = $db->prepare(
            "SELECT id FROM empleados WHERE vehiculo_id = :v_id AND id != :e_id LIMIT 1"
        );
        $stmtCheck->bindValue(':v_id', $data->vehiculo_id);
        $stmtCheck->bindValue(':e_id', $data->empleado_id);
        $stmtCheck->execute();
        if ($stmtCheck->fetch()) {
            $db->rollBack();
            http_response_code(409);
            echo json_encode([
                "status"  => "error",
                "message" => "Esta unidad ya está asignada a otro empleado. Primero quítasela a ese empleado."
            ]);
            exit;
        }

        // 2. Asignamos la unidad al empleado seleccionado
        $query = "UPDATE empleados SET vehiculo_id = :v_id WHERE id = :e_id";
        $stmt = $db->prepare($query);
        $stmt->bindValue(':v_id', $data->vehiculo_id);
        $stmt->bindValue(':e_id', $data->empleado_id);

        if ($stmt->execute()) {
            // 3. RECUPERAR DATOS ACTUALIZADOS
            // Cambié 'v.nombre' por 'v.unidad_nombre' que es el que usas en el frontend
            $queryFetch = "SELECT e.*, v.unidad_nombre 
                           FROM empleados e 
                           LEFT JOIN vehiculos v ON e.vehiculo_id = v.id 
                           WHERE e.id = :e_id";
            
            $stmtFetch = $db->prepare($queryFetch);
            $stmtFetch->bindValue(':e_id', $data->empleado_id);
            $stmtFetch->execute();
            $empleadoActualizado = $stmtFetch->fetch(PDO::FETCH_ASSOC);

            $db->commit();
            
            echo json_encode([
                "status" => "success", 
                "message" => "Unidad asignada correctamente",
                "empleado" => $empleadoActualizado
            ]);
        } else {
            throw new Exception("Error al ejecutar la actualización");
        }

    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Error de BD: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Faltan datos (empleado_id o vehiculo_id)"]);
}