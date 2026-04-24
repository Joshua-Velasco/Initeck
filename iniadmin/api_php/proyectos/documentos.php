<?php
// IniAdmin API — Upload/Delete Documentos del Proyecto
require_once '../config/database.php';
$db = (new Database())->getConnection();
header('Content-Type: application/json');

$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Handle DELETE action via JSON
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' || 
    ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete') ||
    ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($_FILES))) {
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['action']) && $data['action'] === 'delete' && !empty($data['id'])) {
        try {
            // Get filename before deleting
            $stmt = $db->prepare("SELECT archivo FROM proyecto_documentos WHERE id = ?");
            $stmt->execute([$data['id']]);
            $doc = $stmt->fetch();
            
            if ($doc && file_exists($uploadDir . $doc['archivo'])) {
                unlink($uploadDir . $doc['archivo']);
            }
            
            $stmt = $db->prepare("DELETE FROM proyecto_documentos WHERE id = ?");
            $stmt->execute([$data['id']]);
            echo json_encode(["status" => "success", "message" => "Documento eliminado"]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit;
    }
}

// Handle UPLOAD via multipart form
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_FILES['archivo'])) {
    $proyectoId = intval($_POST['proyecto_id'] ?? 0);
    $nombre = $_POST['nombre'] ?? $_FILES['archivo']['name'];
    $tipo = $_POST['tipo'] ?? 'otro';
    $subidoPor = !empty($_POST['subido_por']) ? intval($_POST['subido_por']) : null;

    if (!$proyectoId) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "proyecto_id es requerido"]);
        exit;
    }

    $file = $_FILES['archivo'];
    $maxSize = 10 * 1024 * 1024; // 10MB

    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Error en la carga del archivo"]);
        exit;
    }

    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "El archivo excede el límite de 10MB"]);
        exit;
    }

    try {
        // Generate unique filename
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $safeFilename = 'proj_' . $proyectoId . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        
        if (!move_uploaded_file($file['tmp_name'], $uploadDir . $safeFilename)) {
            throw new Exception("No se pudo guardar el archivo");
        }

        $stmt = $db->prepare("
            INSERT INTO proyecto_documentos (proyecto_id, nombre, tipo, archivo, tamanio, subido_por)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $proyectoId,
            $nombre,
            $tipo,
            $safeFilename,
            $file['size'],
            $subidoPor
        ]);

        echo json_encode([
            "status" => "success", 
            "message" => "Documento subido correctamente",
            "id" => $db->lastInsertId(),
            "archivo" => $safeFilename
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($_FILES)) {
    // Already handled above for delete
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "No se proporcionó archivo"]);
}
?>
