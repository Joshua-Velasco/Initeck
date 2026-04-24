<?php
// IniAdmin API — Guardar/Actualizar Cliente del Proyecto
require_once '../config/database.php';
$db = (new Database())->getConnection();
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['proyecto_id']) || empty($data['nombre'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "proyecto_id y nombre son requeridos"]);
    exit;
}

try {
    // Upsert: si ya existe un cliente para este proyecto, actualizar; si no, insertar
    $check = $db->prepare("SELECT id FROM proyecto_clientes WHERE proyecto_id = ?");
    $check->execute([$data['proyecto_id']]);
    $existing = $check->fetch();

    if ($existing) {
        $stmt = $db->prepare("
            UPDATE proyecto_clientes 
            SET nombre = ?, empresa = ?, email = ?, telefono = ?, direccion = ?, notas = ?
            WHERE proyecto_id = ?
        ");
        $stmt->execute([
            $data['nombre'],
            $data['empresa'] ?? null,
            $data['email'] ?? null,
            $data['telefono'] ?? null,
            $data['direccion'] ?? null,
            $data['notas'] ?? null,
            $data['proyecto_id']
        ]);
        echo json_encode(["status" => "success", "message" => "Cliente actualizado"]);
    } else {
        $stmt = $db->prepare("
            INSERT INTO proyecto_clientes (proyecto_id, nombre, empresa, email, telefono, direccion, notas)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['proyecto_id'],
            $data['nombre'],
            $data['empresa'] ?? null,
            $data['email'] ?? null,
            $data['telefono'] ?? null,
            $data['direccion'] ?? null,
            $data['notas'] ?? null
        ]);
        echo json_encode(["status" => "success", "message" => "Cliente registrado", "id" => $db->lastInsertId()]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
