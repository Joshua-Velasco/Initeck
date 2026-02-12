<?php
// Headers CORS son manejados por Apache en .htaccess

// Manejar la petición "preflight" de los navegadores
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once '../../config/database.php';
$database = new Database();
$db = $database->getConnection();

// Cambiamos $data por $_POST porque React envía FormData
if (!empty($_POST['id'])) {
    try {
        $db->beginTransaction();
        $id = $_POST['id'];

        // 1. Actualizar Tabla Empleados
        $q1 = "UPDATE empleados SET 
                nombre_completo = :nom, 
                telefono = :tel, 
                estado = :est, 
                rol = :rol 
               WHERE id = :id";
        
        $stmt1 = $db->prepare($q1);
        $stmt1->execute([
            ':nom' => $_POST['nombre_completo'],
            ':tel' => $_POST['telefono'] ?? null,
            ':est' => $_POST['estado'],
            ':rol' => $_POST['rol'],
            ':id'  => $id
        ]);

        // 2. Actualizar Tabla Usuarios
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

        // 3. Gestión de Archivos (Misma lógica: Guardar en carpeta local)
        $upload_dir = "../uploads/"; // Ajusta esta ruta a tu carpeta v1/uploads/
        if (!file_exists($upload_dir)) { mkdir($upload_dir, 0777, true); }

        $documentos = ['foto_ine', 'foto_curp', 'foto_rfc', 'foto_licencia'];
        $usuario_clean = preg_replace('/[^A-Za-z0-9_\-]/', '_', $_POST['usuario']);

        foreach ($documentos as $doc) {
            if (isset($_FILES[$doc]) && $_FILES[$doc]['error'] === UPLOAD_ERR_OK) {
                $ext = pathinfo($_FILES[$doc]['name'], PATHINFO_EXTENSION);
                // Si se sube una nueva, se sobrescribe la anterior gracias al nombre fijo
                $file_name = $usuario_clean . "_" . $doc . "." . $ext;
                move_uploaded_file($_FILES[$doc]['tmp_name'], $upload_dir . $file_name);
            }
        }

        $db->commit();
        echo json_encode(["status" => "success", "message" => "Registro actualizado correctamente"]);

    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Error al actualizar: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "ID de empleado no proporcionado"]);
}
?>