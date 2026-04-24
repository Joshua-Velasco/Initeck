<?php
require_once 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(["success" => false, "message" => "Método no permitido."]);
    exit();
}

$codigoUsuario = isset($_GET['codigoUsuario']) ? trim($_GET['codigoUsuario']) : '';
if (!$codigoUsuario) {
    echo json_encode(["success" => false, "message" => "Usuario requerido."]);
    exit();
}

$stmt = $conn->prepare("
    SELECT p.NombrePersona, p.Correo, p.Telefono, p.UrlFoto, p.UrlINE,
           p.Calle, p.NumExterior, p.Colonia, p.Ciudad, p.Estado, p.CodigoPostal,
           p.Latitud, p.Longitud
    FROM safar_usuario u
    LEFT JOIN safar_persona p ON u.CodigoPersona = p.CodigoPersona
    WHERE u.CodigoUsuario = :cod
    LIMIT 1
");
$stmt->execute([':cod' => $codigoUsuario]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    echo json_encode(["success" => false, "message" => "Perfil no encontrado."]);
    exit();
}

echo json_encode(["success" => true, "profile" => $row]);
?>
