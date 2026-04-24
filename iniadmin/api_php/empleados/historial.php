<?php
// IniAdmin API — Empleados: Historial (retardos, mejoras, aciertos, proyectos, vacaciones)
require_once '../config/database.php';
$db = (new Database())->getConnection();
header('Content-Type: application/json');

$method     = $_SERVER['REQUEST_METHOD'];
$empleadoId = (int)($_GET['empleado_id'] ?? 0);
$tipoFiltro = $_GET['tipo'] ?? null;

if ($method === 'GET') {
    if (!$empleadoId) { echo json_encode([]); exit; }

    $sql    = "SELECT * FROM empleado_historial WHERE empleado_id = ?";
    $params = [$empleadoId];

    $tiposPermitidos = ['retardo','mejora','acierto','proyecto','vacacion'];
    if ($tipoFiltro && in_array($tipoFiltro, $tiposPermitidos)) {
        $sql    .= " AND tipo = ?";
        $params[] = $tipoFiltro;
    }
    $sql .= " ORDER BY fecha DESC, created_at DESC";

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($method === 'POST') {
    $data       = json_decode(file_get_contents('php://input'), true);
    $empId      = (int)($data['empleado_id'] ?? 0);
    $tipo       = $data['tipo']        ?? '';
    $titulo     = trim($data['titulo'] ?? '');
    $descripcion = trim($data['descripcion'] ?? '');
    $fecha      = $data['fecha']       ?? null;
    $fechaFin   = $data['fecha_fin']   ?? null;
    $estado     = $data['estado']      ?? 'activo';

    $tiposPermitidos = ['retardo','mejora','acierto','proyecto','vacacion'];
    if (!$empId || !in_array($tipo, $tiposPermitidos) || !$titulo) {
        http_response_code(400);
        echo json_encode(['error' => 'empleado_id, tipo válido y titulo son requeridos']);
        exit;
    }

    $stmt = $db->prepare("
        INSERT INTO empleado_historial
            (empleado_id, tipo, titulo, descripcion, fecha, fecha_fin, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $empId, $tipo, $titulo, $descripcion,
        $fecha    ?: null,
        $fechaFin ?: null,
        $estado
    ]);

    echo json_encode([
        'id'          => (int)$db->lastInsertId(),
        'empleado_id' => $empId,
        'tipo'        => $tipo,
        'titulo'      => $titulo,
        'descripcion' => $descripcion,
        'fecha'       => $fecha,
        'fecha_fin'   => $fechaFin,
        'estado'      => $estado,
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
    $stmt = $db->prepare("DELETE FROM empleado_historial WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['deleted' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
?>
