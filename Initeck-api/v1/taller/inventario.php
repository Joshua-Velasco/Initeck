<?php
// Initeck-api/v1/taller/inventario.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();
$upload_dir = __DIR__ . "/uploads/";

if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $stmt = $db->prepare("SELECT * FROM inventario_taller ORDER BY nombre ASC");
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($metodo === 'POST') {
    $accion = $_POST['accion'] ?? '';

    // Subir foto si existe
    $foto_url = null;
    if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION);
        $nombre = "tool_" . time() . "_" . uniqid() . "." . $ext;
        if (move_uploaded_file($_FILES['foto']['tmp_name'], $upload_dir . $nombre)) {
            $foto_url = $nombre;
        }
    }

    if ($accion === 'crear') {
        $sql = "INSERT INTO inventario_taller (nombre, descripcion, cantidad, estado, foto_url) VALUES (?, ?, ?, ?, ?)";
        $stmt = $db->prepare($sql);
        if (
            $stmt->execute([
                $_POST['nombre'],
                $_POST['descripcion'] ?? '',
                $_POST['cantidad'] ?? 1,
                $_POST['estado'] ?? 'Bueno',
                $foto_url
            ])
        ) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error"]);
        }
    } elseif ($accion === 'editar') {
        $id = $_POST['id'];

        // Si no hay nueva foto, mantener la anterior. Si hay, actualizar.
        $sql_foto = $foto_url ? ", foto_url = ?" : "";
        $sql = "UPDATE inventario_taller SET nombre = ?, descripcion = ?, cantidad = ?, estado = ? $sql_foto WHERE id = ?";

        $params = [
            $_POST['nombre'],
            $_POST['descripcion'],
            $_POST['cantidad'],
            $_POST['estado']
        ];
        if ($foto_url)
            $params[] = $foto_url;
        $params[] = $id;

        $stmt = $db->prepare($sql);
        if ($stmt->execute($params)) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error"]);
        }
    }
    exit;
}

if ($metodo === 'DELETE') {
    $id = $_GET['id'] ?? 0;
    // Obtener foto para borrar
    $stmt = $db->prepare("SELECT foto_url FROM inventario_taller WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($db->prepare("DELETE FROM inventario_taller WHERE id = ?")->execute([$id])) {
        if ($row && $row['foto_url'] && file_exists($upload_dir . $row['foto_url'])) {
            @unlink($upload_dir . $row['foto_url']);
        }
        echo json_encode(["status" => "success"]);
    }
    exit;
}
?>