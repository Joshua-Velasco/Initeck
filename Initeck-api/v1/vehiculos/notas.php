<?php
// Headers CORS handled by Apache/htaccess usually, but meaningful if needed
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $vehiculo_id = isset($_GET['vehiculo_id']) ? intval($_GET['vehiculo_id']) : 0;

        if ($vehiculo_id >= 0) {
            $query = "SELECT * FROM vehiculos_notas WHERE vehiculo_id = ? ORDER BY fecha_creacion DESC";
            $stmt = $db->prepare($query);
            $stmt->execute([$vehiculo_id]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } else {
            echo json_encode([]);
        }
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"));

        if (isset($data->vehiculo_id) && isset($data->nota)) {
            $query = "INSERT INTO vehiculos_notas (vehiculo_id, nota, color) VALUES (?, ?, ?)";
            $stmt = $db->prepare($query);
            $color = isset($data->color) ? $data->color : 'yellow';

            if ($stmt->execute([$data->vehiculo_id, $data->nota, $color])) {
                echo json_encode(["status" => "success", "id" => $db->lastInsertId()]);
            } else {
                echo json_encode(["status" => "error", "message" => "No se pudo guardar la nota"]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Datos incompletos"]);
        }
    } elseif ($method === 'DELETE') {
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

        if ($id > 0) {
            $query = "DELETE FROM vehiculos_notas WHERE id = ?";
            $stmt = $db->prepare($query);
            if ($stmt->execute([$id])) {
                echo json_encode(["status" => "success"]);
            } else {
                echo json_encode(["status" => "error"]);
            }
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error de base de datos: " . $e->getMessage()
    ]);
}
?>