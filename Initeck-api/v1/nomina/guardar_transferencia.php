<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Para procesar multipart/form-data
$empleado_id = $_POST['empleado_id'] ?? null;
$monto = $_POST['monto'] ?? null;
$fecha_inicio = $_POST['fecha_inicio_semana'] ?? null;
$fecha_fin = $_POST['fecha_fin_semana'] ?? null;

if ($empleado_id && $monto && $fecha_inicio && $fecha_fin) {
    try {
        $firma_path = null;

        // Procesar Firma si existe
        if (isset($_FILES['firma']) && $_FILES['firma']['error'] == 0) {
            $target_dir = __DIR__ . "/../uploads/firmas_admin/";
            if (!file_exists($target_dir)) {
                if (!mkdir($target_dir, 0777, true)) {
                    error_log("No se pudo crear el directorio: " . $target_dir);
                }
            }
            $file_extension = pathinfo($_FILES["firma"]["name"], PATHINFO_EXTENSION);
            $file_name = "firma_transf_" . time() . "_" . uniqid() . "." . $file_extension;
            $target_file = $target_dir . $file_name;

            if (move_uploaded_file($_FILES["firma"]["tmp_name"], $target_file)) {
                $firma_path = "firmas_admin/" . $file_name;
            } else {
                error_log("Error al mover el archivo a: " . $target_file);
            }
        }

        $query = "INSERT INTO nomina_transferencias SET
                    empleado_id = :empleado_id,
                    monto = :monto,
                    fecha_inicio_semana = :fecha_inicio_semana,
                    fecha_fin_semana = :fecha_fin_semana,
                    firma_admin_path = :firma_admin_path,
                    fecha_ejecucion = NOW()";

        $stmt = $db->prepare($query);

        $stmt->bindParam(":empleado_id", $empleado_id);
        $stmt->bindParam(":monto", $monto);
        $stmt->bindParam(":fecha_inicio_semana", $fecha_inicio);
        $stmt->bindParam(":fecha_fin_semana", $fecha_fin);
        $stmt->bindParam(":firma_admin_path", $firma_path);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("status" => "success", "message" => "Transferencia guardada correctamente."));
        } else {
            http_response_code(503);
            echo json_encode(array("status" => "error", "message" => "No se pudo guardar la transferencia."));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(array("status" => "error", "message" => $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("status" => "error", "message" => "Datos incompletos."));
}
?>