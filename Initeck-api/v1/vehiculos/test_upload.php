<?php
// Initeck-api/v1/vehiculos/test_upload.php
// Script de diagnóstico para probar uploads de archivos

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$diagnostico = [
    'status' => 'success',
    'checks' => []
];

// 1. Verificar directorio de uploads
$upload_dir = __DIR__ . "/uploads/";
$diagnostico['checks']['upload_dir'] = [
    'path' => $upload_dir,
    'exists' => file_exists($upload_dir),
    'is_writable' => is_writable($upload_dir),
    'permissions' => file_exists($upload_dir) ? substr(sprintf('%o', fileperms($upload_dir)), -4) : 'N/A'
];

// 2. Verificar $_FILES
$diagnostico['checks']['files_received'] = [
    'count' => count($_FILES),
    'files' => []
];

foreach ($_FILES as $key => $file) {
    $diagnostico['checks']['files_received']['files'][$key] = [
        'name' => $file['name'],
        'type' => $file['type'],
        'size' => $file['size'],
        'error' => $file['error'],
        'error_message' => match ($file['error']) {
            UPLOAD_ERR_OK => 'No error',
            UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'PHP extension stopped the file upload',
            default => 'Unknown error'
        }
    ];
}

// 3. Verificar $_POST
$diagnostico['checks']['post_data'] = $_POST;

// 4. Intentar guardar archivos si se recibieron
if (!empty($_FILES)) {
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
        $diagnostico['checks']['upload_dir']['created'] = true;
    }

    $diagnostico['checks']['save_attempts'] = [];

    foreach ($_FILES as $key => $file) {
        if ($file['error'] === UPLOAD_ERR_OK) {
            $filename = "test_" . $key . "_" . time() . "_" . pathinfo($file['name'], PATHINFO_EXTENSION);
            $destination = $upload_dir . $filename;
            $saved = move_uploaded_file($file['tmp_name'], $destination);

            $diagnostico['checks']['save_attempts'][$key] = [
                'filename' => $filename,
                'destination' => $destination,
                'saved' => $saved,
                'file_exists_after_save' => file_exists($destination)
            ];
        }
    }
}

// 5. Listar archivos en uploads
if (file_exists($upload_dir)) {
    $files = array_diff(scandir($upload_dir), ['.', '..']);
    $diagnostico['checks']['existing_files'] = [
        'count' => count($files),
        'files' => array_values($files)
    ];
}

// 6. Configuración PHP
$diagnostico['checks']['php_config'] = [
    'upload_max_filesize' => ini_get('upload_max_filesize'),
    'post_max_size' => ini_get('post_max_size'),
    'max_file_uploads' => ini_get('max_file_uploads'),
    'file_uploads' => ini_get('file_uploads')
];

echo json_encode($diagnostico, JSON_PRETTY_PRINT);
?>