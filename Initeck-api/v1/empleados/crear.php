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

if (!empty($_POST['nombre_completo']) && !empty($_POST['usuario'])) {
    try {
        $db->beginTransaction();

        // 1. INSERTAR EN TABLA EMPLEADOS (Solo datos de texto)
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

        // 2. INSERTAR EN TABLA USUARIOS
        $q2 = "INSERT INTO usuarios (empleado_id, usuario, password, rol) 
               VALUES (:emp_id, :user, :pass, :rol)";
        
        $stmt2 = $db->prepare($q2);
        $stmt2->execute([
            ':emp_id' => $new_id,
            ':user'   => $_POST['usuario'],
            ':pass'   => password_hash($_POST['password'], PASSWORD_BCRYPT),
            ':rol'    => $_POST['rol'] ?? 'employee'
        ]);

        // 3. GESTIÓN DE ARCHIVOS (Guardar físicamente en carpeta)
        // Definimos la ruta: Initeck-api/v1/uploads/
        $upload_dir = "uploads/"; 
        
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        $documentos = ['foto_ine', 'foto_curp', 'foto_rfc', 'foto_licencia'];
        $usuario_clean = preg_replace('/[^A-Za-z0-9_\-]/', '_', $_POST['usuario']); // Limpiar nombre de usuario

        foreach ($documentos as $doc) {
            if (isset($_FILES[$doc]) && $_FILES[$doc]['error'] === UPLOAD_ERR_OK) {
                $ext = pathinfo($_FILES[$doc]['name'], PATHINFO_EXTENSION);
                
                // Nombre del archivo: usuario_tipo.ext (ej: juan_perez_foto_ine.jpg)
                $file_name = $usuario_clean . "_" . $doc . "." . $ext;
                $target_path = $upload_dir . $file_name;
                
                // Mover archivo (si ya existe uno, se sobrescribirá)
                move_uploaded_file($_FILES[$doc]['tmp_name'], $target_path);
            }
        }

        $db->commit();
        echo json_encode(["status" => "success", "message" => "Empleado creado y fotos guardadas localmente"]);

    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Error interno: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Faltan campos obligatorios"]);
}
?>