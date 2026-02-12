<?php
// Initeck-api/v1/taller/alertas.php
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

$metodo = $_SERVER['REQUEST_METHOD'];

// GET: Listar alertas (por unidad o todas)
if ($metodo === 'GET') {
    $unidad_id = isset($_GET['unidad_id']) ? intval($_GET['unidad_id']) : null;

    $sql = "SELECT a.*, v.unidad_nombre, v.placas 
            FROM alertas_vehiculo a
            JOIN vehiculos v ON a.unidad_id = v.id";

    $params = [];
    if ($unidad_id) {
        $sql .= " WHERE a.unidad_id = ?";
        $params[] = $unidad_id;
    }

    $sql .= " ORDER BY a.fecha ASC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// POST: Crear o Editar
if ($metodo === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    // Soporte para FormData si no es JSON raw
    if (!$data && !empty($_POST)) {
        $data = (object) $_POST;
    }

    if (!isset($data->accion)) {
        echo json_encode(["status" => "error", "message" => "Accion requerida"]);
        exit;
    }

    if ($data->accion === 'crear') {
        $sql = "INSERT INTO alertas_vehiculo (unidad_id, titulo, fecha, dias_anticipacion, estado) VALUES (?, ?, ?, ?, ?)";
        $stmt = $db->prepare($sql);
        if (
            $stmt->execute([
                $data->unidad_id,
                $data->titulo,
                $data->fecha,
                $data->dias_anticipacion ?? 3,
                'Pendiente'
            ])
        ) {
            echo json_encode(["status" => "success", "id" => $db->lastInsertId()]);
        } else {
            echo json_encode(["status" => "error", "message" => "Error al crear alerta"]);
        }
    } elseif ($data->accion === 'editar') {
        $sql = "UPDATE alertas_vehiculo SET titulo = ?, fecha = ?, dias_anticipacion = ?, estado = ? WHERE id = ?";
        $stmt = $db->prepare($sql);
        if (
            $stmt->execute([
                $data->titulo,
                $data->fecha,
                $data->dias_anticipacion,
                $data->estado,
                $data->id
            ])
        ) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Error al actualizar"]);
        }
    }
    exit;
}

// DELETE: Borrar
if ($metodo === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($stmt = $db->prepare("DELETE FROM alertas_vehiculo WHERE id = ?")) {
        $stmt->execute([$id]);
        echo json_encode(["status" => "success"]);
    }
    exit;
}
?>