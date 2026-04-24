<?php
// IniAdmin API — Empleados: Habilidades
require_once '../config/database.php';
$db = (new Database())->getConnection();
header('Content-Type: application/json');

$method     = $_SERVER['REQUEST_METHOD'];
$empleadoId = (int)($_GET['empleado_id'] ?? 0);

if ($method === 'GET') {
    if (!$empleadoId) { echo json_encode([]); exit; }
    $stmt = $db->prepare("
        SELECT * FROM empleado_habilidades
        WHERE empleado_id = ?
        ORDER BY categoria, nombre
    ");
    $stmt->execute([$empleadoId]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($method === 'POST') {
    $data       = json_decode(file_get_contents('php://input'), true);
    $empId      = (int)($data['empleado_id'] ?? 0);
    $nombre     = trim($data['nombre']    ?? '');
    $nivel      = $data['nivel']          ?? 'intermedio';
    $categoria  = trim($data['categoria'] ?? '');

    if (!$empId || !$nombre) {
        http_response_code(400);
        echo json_encode(['error' => 'empleado_id y nombre son requeridos']);
        exit;
    }

    $niveles = ['basico','intermedio','avanzado','experto'];
    if (!in_array($nivel, $niveles)) $nivel = 'intermedio';

    $stmt = $db->prepare("
        INSERT INTO empleado_habilidades (empleado_id, nombre, nivel, categoria)
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([$empId, $nombre, $nivel, $categoria]);

    echo json_encode([
        'id'          => (int)$db->lastInsertId(),
        'empleado_id' => $empId,
        'nombre'      => $nombre,
        'nivel'       => $nivel,
        'categoria'   => $categoria,
    ]);
    exit;
}

if ($method === 'DELETE') {
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'id requerido']);
        exit;
    }
    $stmt = $db->prepare("DELETE FROM empleado_habilidades WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['deleted' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
?>
