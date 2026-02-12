<?php
// Headers CORS son manejados por Apache en .htaccess

require_once '../config/cors.php';

require_once '../config/database.php';

// 3. Recibir el ID (React lo envía por Header o GET)
$usuario_id = $_GET['usuario_id'] ?? null;

// Si no está en GET (nuevo método de React usa Headers)
if (!$usuario_id) {
    $headers = getallheaders();
    $usuario_id = $headers['X-Usuario-ID'] ?? $_SERVER['HTTP_X_USUARIO_ID'] ?? null;
}

if (!$usuario_id) {
    // Esto es lo que te salía antes. Ahora buscamos en Headers también.
    echo json_encode(["status" => "expired", "message" => "Falta ID (Header o GET)"]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT id FROM usuarios WHERE id = :id LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $usuario_id);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        echo json_encode(["status" => "active"]);
    } else {
        echo json_encode(["status" => "expired"]);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}