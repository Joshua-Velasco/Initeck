<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$upload_dir = '../uploads/';

// Asegurar que las subcarpetas existan
if (!is_dir($upload_dir . 'firmas/')) mkdir($upload_dir . 'firmas/', 0777, true);
if (!is_dir($upload_dir . 'tickets/')) mkdir($upload_dir . 'tickets/', 0777, true);

switch($method) {
    case 'GET':
        try {
            // Intentamos la consulta más simple posible primero para probar conexión
            // Si esto funciona, el problema es el JOIN con vehículos
            $query = "SELECT * FROM empleados ORDER BY nombre_completo ASC";
            
            $stmt = $db->prepare($query);
            $stmt->execute();
            $empleados = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode($empleados);
        } catch (PDOException $e) {
            // Esto nos dirá exactamente qué columna falta o qué está mal
            http_response_code(500);
            echo json_encode([
                "status" => "error", 
                "message" => "Error de BD: " . $e->getMessage()
            ]);
        }
        break;

    case 'POST':
        // DETECTAR SI ES UNA LIQUIDACIÓN (NUEVO) O UN REGISTRO DE EMPLEADO
        $action = $_POST['action'] ?? '';

        if ($action === 'registrar_liquidacion') {
            registrarLiquidacion($db, $upload_dir);
        } else {
            // Lógica original de Guardar/Editar Empleado
            guardarEmpleado($db, $upload_dir);
        }
        break;

    case 'DELETE':
        // Tu lógica original de borrar empleado...
        break;
}

/**
 * LÓGICA PARA REGISTRAR LA LIQUIDACIÓN DEL VIAJE
 */
function registrarLiquidacion($db, $upload_dir) {
    try {
        // 1. Procesar la firma (Base64 a Imagen)
        $firma_base64 = $_POST['firma'] ?? null;
        $firma_nombre = null;

        if ($firma_base64) {
            $firma_nombre = "FIRMA_" . time() . ".png";
            $data = explode(',', $firma_base64);
            file_put_contents($upload_dir . 'firmas/' . $firma_nombre, base64_decode($data[1]));
        }

        // 2. Insertar en la tabla liquidaciones
        $sql = "INSERT INTO liquidaciones 
                (empleado_id, fecha, hora, viajes, monto_efectivo, propinas, gastos_total, neto_entregado, firma_path, detalles_gastos) 
                VALUES (:emp_id, :fecha, :hora, :viajes, :monto, :prop, :gastos, :neto, :firma, :detalles)";
        
        $stmt = $db->prepare($sql);
        
        $stmt->bindValue(':emp_id', $_POST['empleado_id']);
        $stmt->bindValue(':fecha', date('Y-m-d'));
        $stmt->bindValue(':hora', date('H:i:s'));
        $stmt->bindValue(':viajes', $_POST['viajes']);
        $stmt->bindValue(':monto', $_POST['monto']);
        $stmt->bindValue(':prop', $_POST['propinas']);
        $stmt->bindValue(':gastos', $_POST['gastosTotal']);
        $stmt->bindValue(':neto', $_POST['neto']);
        $stmt->bindValue(':firma', $firma_nombre);
        // Guardamos los gastos adicionales como JSON
        $stmt->bindValue(':detalles', $_POST['detallesGastos']); 

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Liquidación registrada"]);
        }
    } catch (Exception $e) {
        enviarError($e->getMessage());
    }
}

/**
 * FUNCIÓN ORIGINAL DE EMPLEADOS (MODIFICADA)
 */
function guardarEmpleado($db, $upload_dir) {
    // Aquí va todo tu bloque de código de 'POST' que ya tenías 
    // (procesamiento de INE, Licencia e INSERT/UPDATE de empleados)
    // ... (Mantén tu código tal cual estaba para no perder funcionalidad)
}

function enviarError($msg) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $msg]);
    exit();
}

/**
 * Tu función subirArchivo() se mantiene igual
 */
function subirArchivo($file, $path) {
    if (!is_dir($path)) mkdir($path, 0777, true);
    $info = pathinfo($file['name']);
    $extension = strtolower($info['extension'] ?? '');
    $permitidas = ['jpg', 'jpeg', 'png', 'pdf'];
    if (!in_array($extension, $permitidas)) return null;
    $nuevoNombre = "DOC_" . time() . "_" . bin2hex(random_bytes(4)) . "." . $extension;
    return move_uploaded_file($file['tmp_name'], $path . $nuevoNombre) ? $nuevoNombre : null;
}
?>