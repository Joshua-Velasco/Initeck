<?php
require_once 'db_config.php';

set_exception_handler(function($e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
    exit();
});

// Allow multipart form data (no Content-Type override from db_config for OPTIONS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ensure missing columns exist and types are correct
$colCheck = $conn->query("SHOW COLUMNS FROM safar_persona");
$colMap = [];
foreach ($colCheck->fetchAll(PDO::FETCH_ASSOC) as $col) {
    // Normalizar a lowercase para evitar problemas de casing en el chequeo
    $fieldKey = isset($col['Field']) ? $col['Field'] : (isset($col['field']) ? $col['field'] : '');
    if ($fieldKey) $colMap[strtolower($fieldKey)] = $col['Type'];
}

$addColumns = [
    "urlfoto"      => "ALTER TABLE safar_persona ADD COLUMN UrlFoto VARCHAR(500) NOT NULL DEFAULT ''",
    "calle"        => "ALTER TABLE safar_persona ADD COLUMN Calle VARCHAR(200) NOT NULL DEFAULT ''",
    "numexterior"  => "ALTER TABLE safar_persona ADD COLUMN NumExterior VARCHAR(20) NOT NULL DEFAULT ''",
    "colonia"      => "ALTER TABLE safar_persona ADD COLUMN Colonia VARCHAR(100) NOT NULL DEFAULT ''",
    "ciudad"       => "ALTER TABLE safar_persona ADD COLUMN Ciudad VARCHAR(100) NOT NULL DEFAULT ''",
    "estado"       => "ALTER TABLE safar_persona ADD COLUMN Estado VARCHAR(100) NOT NULL DEFAULT ''",
    "codigopostal" => "ALTER TABLE safar_persona ADD COLUMN CodigoPostal VARCHAR(10) NOT NULL DEFAULT ''",
    "latitud"      => "ALTER TABLE safar_persona ADD COLUMN Latitud DECIMAL(11,8) NULL",
    "longitud"     => "ALTER TABLE safar_persona ADD COLUMN Longitud DECIMAL(11,8) NULL",
];
foreach ($addColumns as $colLower => $sql) {
    if (!isset($colMap[$colLower])) {
        $conn->exec($sql);
    }
}

// Expand Telefono if it is still varchar(10)
if (isset($colMap['telefono']) && strtolower($colMap['telefono']) === 'varchar(10)') {
    $conn->exec("ALTER TABLE safar_persona MODIFY COLUMN Telefono VARCHAR(20) NOT NULL DEFAULT ''");
}

// Read POST fields
$codigoUsuario = isset($_POST['codigoUsuario']) ? trim($_POST['codigoUsuario']) : '';
$telefono      = isset($_POST['telefono'])      ? trim($_POST['telefono'])      : '';
$calle         = isset($_POST['calle'])         ? trim($_POST['calle'])         : '';
$numExterior   = isset($_POST['numExterior'])   ? trim($_POST['numExterior'])   : '';
$colonia       = isset($_POST['colonia'])       ? trim($_POST['colonia'])       : '';
$ciudad        = isset($_POST['ciudad'])        ? trim($_POST['ciudad'])        : '';
$estado        = isset($_POST['estado'])        ? trim($_POST['estado'])        : '';
$codigoPostal  = isset($_POST['codigoPostal'])  ? trim($_POST['codigoPostal'])  : '';
$latitud       = isset($_POST['latitud'])       ? trim($_POST['latitud'])       : null;
$longitud      = isset($_POST['longitud'])      ? trim($_POST['longitud'])      : null;

// Validations
if (!$codigoUsuario) {
    echo json_encode(["success" => false, "message" => "Usuario no identificado."]);
    exit();
}
if (!$telefono || !$calle || !$colonia || !$ciudad || !$estado || !$codigoPostal) {
    echo json_encode(["success" => false, "message" => "Todos los campos son obligatorios."]);
    exit();
}
if (!preg_match('/^\d{5}$/', $codigoPostal)) {
    echo json_encode(["success" => false, "message" => "El código postal debe tener 5 dígitos."]);
    exit();
}

// Get CodigoPersona
$stmt = $conn->prepare("SELECT CodigoPersona FROM safar_usuario WHERE CodigoUsuario = :cod LIMIT 1");
$stmt->execute([':cod' => $codigoUsuario]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$row) {
    echo json_encode(["success" => false, "message" => "Usuario no encontrado."]);
    exit();
}
$codigoPersona = $row['CodigoPersona'];

// Handle file uploads
$uploadDir = __DIR__ . '/uploads/perfiles/';

function saveUploadedFile($fileKey, $uploadDir, $prefix) {
    if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
        return null; // No file or error — caller decides if required
    }
    $file = $_FILES[$fileKey];
    $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    if (!in_array($mime, $allowed)) {
        return false; // Invalid type
    }
    if ($file['size'] > 8 * 1024 * 1024) {
        return false; // > 8MB
    }
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = $prefix . '_' . uniqid() . '.' . strtolower($ext);
    $dest = $uploadDir . $filename;
    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        return false;
    }
    return 'uploads/perfiles/' . $filename;
}

$urlFoto = saveUploadedFile('foto', $uploadDir, 'foto');
if ($urlFoto === false) {
    echo json_encode(["success" => false, "message" => "La foto de perfil no es válida (máx 8MB, formatos: JPG, PNG, WEBP)."]);
    exit();
}

$urlIne = saveUploadedFile('fotoIne', $uploadDir, 'ine');
if ($urlIne === false) {
    echo json_encode(["success" => false, "message" => "La foto del INE no es válida (máx 8MB, formatos: JPG, PNG, WEBP)."]);
    exit();
}

// Check if this is initial setup (fotos required) or an update (fotos optional)
// We check if the user already has UrlINE saved — if yes, fotos are optional
$checkExisting = $conn->prepare("SELECT UrlFoto, UrlINE FROM safar_persona WHERE CodigoPersona = :cp LIMIT 1");
$checkExisting->execute([':cp' => $codigoPersona]);
$existing = $checkExisting->fetch(PDO::FETCH_ASSOC);
$isUpdate = !empty($existing['UrlINE']);

if (!$isUpdate) {
    // Initial setup: photos are required
    if (!$urlFoto) {
        echo json_encode(["success" => false, "message" => "La foto de perfil es obligatoria."]);
        exit();
    }
    if (!$urlIne) {
        echo json_encode(["success" => false, "message" => "La foto del INE es obligatoria."]);
        exit();
    }
}

// Fall back to existing paths if no new file was uploaded
if (!$urlFoto) $urlFoto = $existing['UrlFoto'] ?? '';
if (!$urlIne)  $urlIne  = $existing['UrlINE']  ?? '';

if (!$existing) {
    // Si no existe el registro en safar_persona, lo creamos primero
    $ins = $conn->prepare("INSERT INTO safar_persona (CodigoPersona, NombrePersona) SELECT :cp, NombrePersona FROM safar_usuario WHERE CodigoPersona = :cp LIMIT 1");
    $ins->execute([':cp' => $codigoPersona]);
}

// Build update query
$sql = "UPDATE safar_persona SET
    Telefono     = :tel,
    UrlFoto      = :foto,
    UrlINE       = :ine,
    Calle        = :calle,
    NumExterior  = :numExt,
    Colonia      = :colonia,
    Ciudad       = :ciudad,
    Estado       = :estado,
    CodigoPostal = :cp,
    Latitud      = :lat,
    Longitud     = :lon
WHERE CodigoPersona = :codPer";

try {
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':tel'    => $telefono,
        ':foto'   => $urlFoto,
        ':ine'    => $urlIne,
        ':calle'  => $calle,
        ':numExt' => $numExterior,
        ':colonia'=> $colonia,
        ':ciudad' => $ciudad,
        ':estado' => $estado,
        ':cp'     => $codigoPostal,
        ':lat'    => $latitud,
        ':lon'    => $longitud,
        ':codPer' => $codigoPersona,
    ]);
    echo json_encode(["success" => true, "message" => "Perfil completado correctamente."]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error al guardar: " . $e->getMessage()]);
}
?>
