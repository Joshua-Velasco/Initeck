<?php
/**
 * firma_utils.php
 * Utilidad para guardar firmas digitales como archivos PNG.
 * Evita guardar base64 directamente en BD (falla en cPanel por max_allowed_packet / post_max_size).
 */

/**
 * Guarda una firma en base64 como archivo PNG en uploads/firmas/.
 *
 * @param string      $base64   Cadena base64 (con o sin prefijo data:image/...)
 * @param string      $prefix   Prefijo para el nombre del archivo (ej: 'admin', 'emp')
 * @param int|string  $ref_id   ID de referencia (empleado_id o ticket_id)
 * @param string      $base_dir Ruta absoluta al directorio raíz de uploads
 *
 * @return array ['ok' => bool, 'path' => string relativo, 'error' => string]
 */
function guardarFirmaArchivo(string $base64, string $prefix, $ref_id, string $base_dir): array
{
    // 1. Validar que venga algo
    if (empty(trim($base64))) {
        return ['ok' => false, 'path' => null, 'error' => 'Firma vacía.'];
    }

    // 2. Limpiar prefijo data URI si existe
    if (str_contains($base64, ',')) {
        $base64 = explode(',', $base64, 2)[1];
    }

    // 3. Eliminar espacios/saltos que cPanel a veces inyecta
    $base64 = preg_replace('/\s+/', '', $base64);

    // 4. Decodificar
    $decoded = base64_decode($base64, true);
    if ($decoded === false) {
        return ['ok' => false, 'path' => null, 'error' => 'Base64 inválido.'];
    }

    // 5. Validar tamaño (máx 400 KB)
    $size = strlen($decoded);
    if ($size < 100) {
        return ['ok' => false, 'path' => null, 'error' => 'Firma demasiado pequeña (probable imagen vacía).'];
    }
    if ($size > 409600) { // 400 KB
        return ['ok' => false, 'path' => null, 'error' => "Firma demasiado grande ({$size} bytes). Máx 400 KB."];
    }

    // 6. Validar magic bytes PNG (\x89PNG) o JPEG (\xff\xd8)
    $magic = substr($decoded, 0, 4);
    $isPng  = (substr($decoded, 0, 4) === "\x89PNG");
    $isJpeg = (substr($decoded, 0, 2) === "\xff\xd8");
    if (!$isPng && !$isJpeg) {
        return ['ok' => false, 'path' => null, 'error' => 'El archivo no es una imagen PNG/JPEG válida.'];
    }
    $ext = $isPng ? 'png' : 'jpg';

    // 7. Crear directorio si no existe
    $firmasDir = rtrim($base_dir, '/') . '/firmas';
    if (!is_dir($firmasDir)) {
        if (!mkdir($firmasDir, 0755, true)) {
            return ['ok' => false, 'path' => null, 'error' => "No se pudo crear el directorio de firmas: {$firmasDir}"];
        }
    }

    // 8. Nombre único
    $filename = "firma_{$prefix}_{$ref_id}_" . time() . ".{$ext}";
    $fullPath = $firmasDir . '/' . $filename;

    // 9. Guardar archivo
    $bytes = file_put_contents($fullPath, $decoded);
    if ($bytes === false) {
        return ['ok' => false, 'path' => null, 'error' => "No se pudo escribir el archivo: {$fullPath}. Verifica permisos del directorio."];
    }

    // 10. Retornar ruta relativa para guardar en BD
    return ['ok' => true, 'path' => "firmas/{$filename}", 'error' => null];
}

/**
 * Guarda una firma recibida como $_FILES (multipart/form-data) en uploads/firmas/.
 * Alternativa a guardarFirmaArchivo() cuando el cliente envía el archivo como Blob
 * para evitar que ModSecurity bloquee base64 en el body JSON.
 *
 * @param array       $fileEntry  Entrada de $_FILES (ej: $_FILES['firma_admin'])
 * @param string      $prefix     Prefijo para el nombre del archivo
 * @param int|string  $ref_id     ID de referencia
 * @param string      $base_dir   Ruta absoluta al directorio raíz de uploads
 *
 * @return array ['ok' => bool, 'path' => string relativo, 'error' => string]
 */
function guardarFirmaArchivoFromUpload(array $fileEntry, string $prefix, $ref_id, string $base_dir): array
{
    if ($fileEntry['error'] !== UPLOAD_ERR_OK) {
        return ['ok' => false, 'path' => null, 'error' => 'Error en la subida del archivo: código ' . $fileEntry['error']];
    }

    $size = $fileEntry['size'];
    if ($size < 100) {
        return ['ok' => false, 'path' => null, 'error' => 'Firma demasiado pequeña (probable imagen vacía).'];
    }
    if ($size > 409600) {
        return ['ok' => false, 'path' => null, 'error' => "Firma demasiado grande ({$size} bytes). Máx 400 KB."];
    }

    // Validar magic bytes
    $fh      = fopen($fileEntry['tmp_name'], 'rb');
    $magic   = fread($fh, 4);
    fclose($fh);
    $isPng  = (substr($magic, 0, 4) === "\x89PNG");
    $isJpeg = (substr($magic, 0, 2) === "\xff\xd8");
    if (!$isPng && !$isJpeg) {
        return ['ok' => false, 'path' => null, 'error' => 'El archivo no es una imagen PNG/JPEG válida.'];
    }
    $ext = $isPng ? 'png' : 'jpg';

    $firmasDir = rtrim($base_dir, '/') . '/firmas';
    if (!is_dir($firmasDir)) {
        if (!mkdir($firmasDir, 0755, true)) {
            return ['ok' => false, 'path' => null, 'error' => "No se pudo crear el directorio de firmas: {$firmasDir}"];
        }
    }

    $filename = "firma_{$prefix}_{$ref_id}_" . time() . ".{$ext}";
    $fullPath = $firmasDir . '/' . $filename;

    if (!move_uploaded_file($fileEntry['tmp_name'], $fullPath)) {
        return ['ok' => false, 'path' => null, 'error' => "No se pudo mover el archivo a: {$fullPath}"];
    }

    return ['ok' => true, 'path' => "firmas/{$filename}", 'error' => null];
}
?>
