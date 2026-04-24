<?php
// IniAdmin API — Empleados: Ficha Médica
require_once '../config/database.php';
$db = (new Database())->getConnection();
header('Content-Type: application/json');

$method     = $_SERVER['REQUEST_METHOD'];
$empleadoId = (int)($_GET['empleado_id'] ?? 0);

if ($method === 'GET') {
    if (!$empleadoId) { echo json_encode(null); exit; }
    $stmt = $db->prepare("SELECT * FROM empleado_ficha_medica WHERE empleado_id = ?");
    $stmt->execute([$empleadoId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($row ?: null);
    exit;
}

if ($method === 'POST') {
    $data  = json_decode(file_get_contents('php://input'), true);
    $empId = (int)($data['empleado_id'] ?? 0);

    if (!$empId) {
        http_response_code(400);
        echo json_encode(['error' => 'empleado_id requerido']);
        exit;
    }

    $fields = [
        'tipo_sangre', 'alergias', 'condiciones_cronicas', 'medicamentos',
        'contacto_nombre', 'contacto_telefono', 'contacto_parentesco',
        'seguro_medico', 'numero_poliza'
    ];
    $values = [];
    foreach ($fields as $f) $values[$f] = trim($data[$f] ?? '');

    $stmt = $db->prepare("
        INSERT INTO empleado_ficha_medica
            (empleado_id, tipo_sangre, alergias, condiciones_cronicas, medicamentos,
             contacto_nombre, contacto_telefono, contacto_parentesco, seguro_medico, numero_poliza)
        VALUES
            (:eid, :ts, :al, :cc, :med, :cn, :ct, :cp, :sm, :np)
        ON DUPLICATE KEY UPDATE
            tipo_sangre          = VALUES(tipo_sangre),
            alergias             = VALUES(alergias),
            condiciones_cronicas = VALUES(condiciones_cronicas),
            medicamentos         = VALUES(medicamentos),
            contacto_nombre      = VALUES(contacto_nombre),
            contacto_telefono    = VALUES(contacto_telefono),
            contacto_parentesco  = VALUES(contacto_parentesco),
            seguro_medico        = VALUES(seguro_medico),
            numero_poliza        = VALUES(numero_poliza)
    ");
    $stmt->execute([
        ':eid' => $empId,
        ':ts'  => $values['tipo_sangre'],
        ':al'  => $values['alergias'],
        ':cc'  => $values['condiciones_cronicas'],
        ':med' => $values['medicamentos'],
        ':cn'  => $values['contacto_nombre'],
        ':ct'  => $values['contacto_telefono'],
        ':cp'  => $values['contacto_parentesco'],
        ':sm'  => $values['seguro_medico'],
        ':np'  => $values['numero_poliza'],
    ]);

    echo json_encode(['status' => 'saved']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Método no permitido']);
?>
