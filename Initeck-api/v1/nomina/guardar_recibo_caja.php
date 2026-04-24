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

// Soporte multipart/form-data Y application/json
$isJson = strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false;

if ($isJson) {
    $raw  = json_decode(file_get_contents("php://input"));
    $empleado_id = $raw->empleado_id ?? null;
    $monto       = $raw->monto       ?? null;
    $admin_id    = $raw->admin_id    ?? null;
} else {
    $empleado_id = $_POST['empleado_id'] ?? null;
    $monto       = $_POST['monto']       ?? null;
    $admin_id    = $_POST['admin_id']    ?? null;
}

if (!empty($empleado_id) && !empty($monto)) {
    try {
        $upload_dir = "../uploads/firmas/";
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }

        $firma_url = null;

        // Firma como archivo (multipart)
        if (!empty($_FILES['firma']['tmp_name'])) {
            $ext       = pathinfo($_FILES['firma']['name'], PATHINFO_EXTENSION) ?: 'png';
            $firma_name = "firma_recibo_" . $empleado_id . "_" . time() . "." . $ext;
            move_uploaded_file($_FILES['firma']['tmp_name'], $upload_dir . $firma_name);
            $firma_url = "firmas/" . $firma_name;
        }
        // Firma como base64 (fallback)
        elseif ($isJson && !empty($raw->firma_base64)) {
            $parts   = explode(',', $raw->firma_base64);
            $content = base64_decode($parts[1] ?? $parts[0]);
            $firma_name = "firma_recibo_" . $empleado_id . "_" . time() . ".png";
            file_put_contents($upload_dir . $firma_name, $content);
            $firma_url = "firmas/" . $firma_name;
        }

        $comprobante_url = null;
        if (!empty($_FILES['comprobante']['tmp_name'])) {
            $comp_dir = "../uploads/recibos/";
            if (!is_dir($comp_dir)) mkdir($comp_dir, 0755, true);
            $ext_c    = pathinfo($_FILES['comprobante']['name'], PATHINFO_EXTENSION) ?: 'pdf';
            $comp_name = "recibo_" . $empleado_id . "_" . time() . "." . $ext_c;
            move_uploaded_file($_FILES['comprobante']['tmp_name'], $comp_dir . $comp_name);
            $comprobante_url = "recibos/" . $comp_name;
        }

        $query = "INSERT INTO nomina_recibos_caja SET
                    empleado_id = :empleado_id,
                    monto = :monto,
                    firma_url = :firma_url,
                    comprobante_url = :comprobante_url,
                    admin_id = :admin_id,
                    fecha = NOW()";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":empleado_id",     $empleado_id);
        $stmt->bindParam(":monto",           $monto);
        $stmt->bindParam(":firma_url",       $firma_url);
        $stmt->bindParam(":comprobante_url", $comprobante_url);
        $stmt->bindParam(":admin_id",        $admin_id);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["status" => "success", "message" => "Recibo guardado correctamente.", "id" => $db->lastInsertId()]);
        } else {
            http_response_code(503);
            echo json_encode(["status" => "error", "message" => "No se pudo guardar el recibo."]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Datos incompletos."]);
}
?>
