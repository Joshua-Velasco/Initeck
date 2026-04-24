<?php
// IniAdmin API — Editar Empleado
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

if (!empty($_POST['id'])) {
    try {
        $db->beginTransaction();
        $id = $_POST['id'];

        // 1. Update empleados
        $q1 = "UPDATE empleados SET
                nombre_completo = :nom,
                telefono = :tel,
                estado = :est,
                rol = :rol,
                fecha_ingreso = :fecha
               WHERE id = :id";

        $stmt1 = $db->prepare($q1);
        $stmt1->execute([
            ':nom'   => $_POST['nombre_completo'],
            ':tel'   => $_POST['telefono'] ?? null,
            ':est'   => $_POST['estado'],
            ':rol'   => $_POST['rol'],
            ':fecha' => $_POST['fecha_ingreso'] ?? date('Y-m-d'),
            ':id'    => $id
        ]);

        // 2. Update usuarios
        $q2 = "UPDATE usuarios SET usuario = :user, rol = :rol";
        if (!empty($_POST['password'])) { 
            $q2 .= ", password = :pass"; 
        }
        $q2 .= " WHERE empleado_id = :id";

        $stmt2 = $db->prepare($q2);
        $params2 = [
            ':user' => $_POST['usuario'], 
            ':rol'  => $_POST['rol'], 
            ':id'   => $id
        ];
        
        if (!empty($_POST['password'])) { 
            $params2[':pass'] = password_hash($_POST['password'], PASSWORD_BCRYPT); 
        }
        $stmt2->execute($params2);

        // 3. File uploads
        $upload_dir = "uploads/";
        if (!file_exists($upload_dir)) { mkdir($upload_dir, 0777, true); }

        $documentos = ['foto_perfil', 'foto_ine', 'foto_curp', 'foto_rfc', 'foto_licencia'];
        $usuario_clean = preg_replace('/[^A-Za-z0-9_\-]/', '_', $_POST['usuario']);

        foreach ($documentos as $doc) {
            if (isset($_FILES[$doc]) && $_FILES[$doc]['error'] === UPLOAD_ERR_OK) {
                $ext = pathinfo($_FILES[$doc]['name'], PATHINFO_EXTENSION);
                $file_name = $usuario_clean . "_" . $doc . "." . $ext;
                move_uploaded_file($_FILES[$doc]['tmp_name'], $upload_dir . $file_name);
            }
        }

        // 4. Sync Divisions
        $stmtDel = $db->prepare("DELETE FROM empleado_divisiones WHERE empleado_id = ?");
        $stmtDel->execute([$id]);

        if (!empty($_POST['division_ids'])) {
            $divIds = json_decode($_POST['division_ids'], true);
            if (is_array($divIds)) {
                $stmtDiv = $db->prepare("INSERT INTO empleado_divisiones (empleado_id, division_id) VALUES (?, ?)");
                foreach ($divIds as $divId) {
                    $stmtDiv->execute([$id, $divId]);
                }
            }
        }

        $db->commit();
        echo json_encode(["status" => "success", "message" => "Registro actualizado correctamente"]);

    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ID de empleado no proporcionado"]);
}
?>
