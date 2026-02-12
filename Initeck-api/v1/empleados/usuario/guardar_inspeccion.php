<?php
require_once '../../../config/database.php';

// Detectar el entorno y configurar CORS dinámicamente
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $database = new Database();
    $pdo = $database->getConnection();

    // Ya no decodificamos JSON, usamos $_POST y $_FILES
    $input = $_POST;

    // DEBUG: Loguear lo que llega
    file_put_contents("debug_post.log", print_r($_POST, true) . "\n" . print_r($_FILES, true), FILE_APPEND);

    // Modificar ruta para apuntar a v1/uploads (subir 2 niveles desde empleados/usuario)
    $upload_dir = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . "uploads" . DIRECTORY_SEPARATOR;
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    // DETECCIÓN DE CARGA ÚTIL PERDIDA (POST vacío pero Content-Length > 0)
    if (empty($_POST) && empty($_FILES) && $_SERVER['CONTENT_LENGTH'] > 0) {
        throw new Exception("El servidor rechazó los datos. Posiblemente las imágenes exceden 'post_max_size' en php.ini.");
    }

    // Función actualizada para guardar Archivos subidos (Multipart)
    function saveUploadedFile($fileKey, $path, $namePrefix)
    {
        if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
            return null;
        }
        $tmp_name = $_FILES[$fileKey]['tmp_name'];
        // Generar nombre
        $ext = pathinfo($_FILES[$fileKey]['name'], PATHINFO_EXTENSION);
        if (!$ext)
            $ext = "png"; // fallback
        $filename = $namePrefix . "_" . uniqid() . "." . $ext;

        if (move_uploaded_file($tmp_name, $path . $filename)) {
            return $filename;
        }
        return null;
    }

    $emp_id = (int) ($input['empleado_id'] ?? 0);
    $veh_id = (int) ($input['id_vehiculo'] ?? 0);
    $odo = (int) ($input['odometro'] ?? 0);
    $gas = (int) ($input['gasolina'] ?? 0);

    // Guardar archivos usando la nueva lógica
    $f_firma = saveUploadedFile('firma', $upload_dir, "firma_e" . $emp_id);

    // Fotos de evidencia
    $f_tab = saveUploadedFile('tablero', $upload_dir, "tab_v" . $veh_id);
    $f_fre = saveUploadedFile('frente', $upload_dir, "fre_v" . $veh_id);
    $f_atr = saveUploadedFile('atras', $upload_dir, "atr_v" . $veh_id);
    $f_izq = saveUploadedFile('izquierdo', $upload_dir, "izq_v" . $veh_id);
    $f_der = saveUploadedFile('derecho', $upload_dir, "der_v" . $veh_id);

    $pdo->beginTransaction();

    // 1. Insertar en inspecciones_vehiculos
    $sql = "INSERT INTO inspecciones_vehiculos (
        empleado_id, vehiculo_id, fecha, odometro_inicio, gasolina, 
        firma_url, foto_tablero, foto_frente, foto_atras, foto_izquierdo, foto_derecho,
        comentarios_inicio
    ) VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $pdo->prepare($sql);
    $comentarios = $input['comentarios'] ?? null;
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$emp_id, $veh_id, $odo, $gas, $f_firma, $f_tab, $f_fre, $f_atr, $f_izq, $f_der, $comentarios]);

    // 2. ACTUALIZAR la tabla maestra de vehiculos
    // Importante: Aquí actualizamos el estado actual del coche
    $sql_update = "UPDATE vehiculos SET kilometraje_actual = ?, nivel_gasolina = ? WHERE id = ?";
    $pdo->prepare($sql_update)->execute([$odo, $gas, $veh_id]);

    $pdo->commit();
    ob_clean();
    echo json_encode(["status" => "success", "message" => "Gasolina actualizada a $gas%"]);

} catch (Exception $e) {
    if (isset($pdo))
        $pdo->rollBack();
    ob_clean();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}