<?php
// IniAdmin API — Crear Empleado
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
$database = new Database();
$db = $database->getConnection();

if (!empty($_POST['nombre_completo']) && !empty($_POST['usuario'])) {
    try {
        $db->beginTransaction();

        // 1. Insert into empleados
        $q1 = "INSERT INTO empleados (nombre_completo, telefono, rol, estado, fecha_ingreso) 
               VALUES (:nombre, :tel, :rol, :estado, :fecha)";
        
        $stmt1 = $db->prepare($q1);
        $stmt1->execute([
            ':nombre' => $_POST['nombre_completo'],
            ':tel'    => $_POST['telefono'] ?? null,
            ':rol'    => $_POST['rol'] ?? 'employee',
            ':estado' => $_POST['estado'] ?? 'Activo',
            ':fecha'  => $_POST['fecha_ingreso'] ?? date('Y-m-d')
        ]);
        
        $new_id = $db->lastInsertId();

        // 2. Insert into usuarios
        $q2 = "INSERT INTO usuarios (empleado_id, usuario, password, rol) 
               VALUES (:emp_id, :user, :pass, :rol)";
        
        $stmt2 = $db->prepare($q2);
        $stmt2->execute([
            ':emp_id' => $new_id,
            ':user'   => $_POST['usuario'],
            ':pass'   => password_hash($_POST['password'], PASSWORD_BCRYPT),
            ':rol'    => $_POST['rol'] ?? 'employee'
        ]);

        // 3. File uploads
        $upload_dir = "uploads/"; 
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        $documentos = ['foto_perfil', 'foto_ine', 'foto_curp', 'foto_rfc', 'foto_licencia'];
        $usuario_clean = preg_replace('/[^A-Za-z0-9_\-]/', '_', $_POST['usuario']);

        foreach ($documentos as $doc) {
            if (isset($_FILES[$doc]) && $_FILES[$doc]['error'] === UPLOAD_ERR_OK) {
                $ext = pathinfo($_FILES[$doc]['name'], PATHINFO_EXTENSION);
                $file_name = $usuario_clean . "_" . $doc . "." . $ext;
                $target_path = $upload_dir . $file_name;
                move_uploaded_file($_FILES[$doc]['tmp_name'], $target_path);
            }
        }

        // 4. Divisions
        if (!empty($_POST['division_ids'])) {
            $divIds = json_decode($_POST['division_ids'], true);
            if (is_array($divIds)) {
                $stmtDiv = $db->prepare("INSERT INTO empleado_divisiones (empleado_id, division_id) VALUES (?, ?)");
                foreach ($divIds as $divId) {
                    $stmtDiv->execute([$new_id, $divId]);
                }
            }
        }

        $db->commit();
        echo json_encode(["status" => "success", "message" => "Empleado creado correctamente"]);

    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Faltan campos obligatorios"]);
}
?>
