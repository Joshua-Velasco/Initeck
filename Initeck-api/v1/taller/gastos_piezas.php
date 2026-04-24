<?php
// Headers CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    ob_clean();
    echo json_encode(["status" => "error", "message" => "Error de conexión centralizada"]);
    exit;
}

$metodo = $_SERVER['REQUEST_METHOD'];

// --- MÉTODO GET: Listar Gastos de Piezas ---
if ($metodo === 'GET') {
    try {
        $unidadId = $_GET['unidad_id'] ?? $_GET['vehiculo_id'] ?? null;
        if ($unidadId !== null) {
            $sql  = "SELECT * FROM taller_gastos_piezas WHERE unidad_id = ? ORDER BY fecha DESC, creado_en DESC";
            $stmt = $db->prepare($sql);
            $stmt->execute([intval($unidadId)]);
        } else {
            $sql  = "SELECT * FROM taller_gastos_piezas ORDER BY fecha DESC, creado_en DESC";
            $stmt = $db->query($sql);
        }
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        ob_clean();
        echo json_encode($data);
    } catch (PDOException $e) {
        ob_clean();
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

// --- MÉTODO POST: Insertar / Guardar Gasto de Pieza ---
if ($metodo === 'POST') {
    $fecha = $_POST['fecha'] ?? date('Y-m-d');
    $tipo = $_POST['tipo'] ?? 'Otro';
    $descripcion = $_POST['descripcion'] ?? '';
    $costo_total = $_POST['costo_total'] ?? 0;
    $cantidad = $_POST['cantidad'] ?? 1;
    $proveedor = $_POST['proveedor'] ?? '';
    $unidad_id = $_POST['unidad_id'] ?? $_POST['vehiculo_id'] ?? null;
    
    // Preparar directorio de uploads
    $upload_dir = __DIR__ . "/uploads/";
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    $evidencia_nombre = "";
    $foto_field = isset($_FILES['evidencia_foto']) ? 'evidencia_foto' : (isset($_FILES['foto']) ? 'foto' : null);
    
    if ($foto_field && $_FILES[$foto_field]['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES[$foto_field]['name'], PATHINFO_EXTENSION);
        if(empty($ext)) $ext = "jpg"; // fallback
        $evidencia_nombre = "pieza_" . time() . "_" . uniqid() . "." . $ext;
        move_uploaded_file($_FILES[$foto_field]['tmp_name'], $upload_dir . $evidencia_nombre);
    }

    try {
        $sql = "INSERT INTO taller_gastos_piezas 
                (fecha, tipo, descripcion, costo_total, cantidad, proveedor, evidencia_foto, unidad_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $db->prepare($sql);
        $stmt->execute([
            $fecha,
            $tipo,
            $descripcion,
            $costo_total,
            $cantidad,
            $proveedor,
            $evidencia_nombre,
            $unidad_id
        ]);

        ob_clean();
        echo json_encode(["status" => "success", "id" => $db->lastInsertId()]);
    } catch (PDOException $e) {
        ob_clean();
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

// --- MÉTODO DELETE ---
if ($metodo === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

    if ($id > 0) {
        try {
            // 1. Obtener nombre de archivo para borrar del servidor
            $stmtFile = $db->prepare("SELECT evidencia_foto FROM taller_gastos_piezas WHERE id = ?");
            $stmtFile->execute([$id]);
            $archivo = $stmtFile->fetchColumn();

            // 2. Eliminar registro
            $stmtDel = $db->prepare("DELETE FROM taller_gastos_piezas WHERE id = ?");
            if ($stmtDel->execute([$id])) {
                $upload_dir = __DIR__ . "/uploads/";
                if (!empty($archivo) && file_exists($upload_dir . $archivo)) {
                    @unlink($upload_dir . $archivo);
                }
                ob_clean();
                echo json_encode(["status" => "success", "message" => "Eliminado correctamente"]);
            }
        } catch (PDOException $e) {
            ob_clean();
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
    exit;
}
?>
