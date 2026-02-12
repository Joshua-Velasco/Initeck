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
$upload_dir = "uploads/";

if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Función para documentos únicos (placas, circulación, etc.)
function subirArchivoEdicion($file_input, $folder, $actual_value)
{
    // Si no se envió el archivo (UPLOAD_ERR_NO_FILE), retornamos el valor actual (sin cambios)
    if (!isset($_FILES[$file_input]) || $_FILES[$file_input]['error'] === UPLOAD_ERR_NO_FILE) {
        return $actual_value;
    }

    // Verificar otros errores de subida
    if ($_FILES[$file_input]['error'] !== UPLOAD_ERR_OK) {
        $errors = [
            UPLOAD_ERR_INI_SIZE => "El archivo excede el tamaño máximo permitido por el servidor (upload_max_filesize).",
            UPLOAD_ERR_FORM_SIZE => "El archivo excede el tamaño máximo permitido por el formulario.",
            UPLOAD_ERR_PARTIAL => "El archivo se subió solo parcialmente.",
            UPLOAD_ERR_NO_TMP_DIR => "Falta la carpeta temporal.",
            UPLOAD_ERR_CANT_WRITE => "No se pudo escribir el archivo en el disco.",
            UPLOAD_ERR_EXTENSION => "Una extensión de PHP detuvo la subida de archivos."
        ];
        $errorCode = $_FILES[$file_input]['error'];
        $msg = isset($errors[$errorCode]) ? $errors[$errorCode] : "Error desconocido al subir archivo ($errorCode).";
        throw new Exception("Error en $file_input: $msg");
    }

    // Si todo está bien, procedemos a mover el archivo
    $ext = pathinfo($_FILES[$file_input]['name'], PATHINFO_EXTENSION);
    $nombre = time() . "_doc_" . uniqid() . "." . $ext;

    if (move_uploaded_file($_FILES[$file_input]['tmp_name'], $folder . $nombre)) {
        // Borrar el archivo anterior si existe para ahorrar espacio
        if (!empty($actual_value) && file_exists($folder . $actual_value)) {
            @unlink($folder . $actual_value);
        }
        return $nombre;
    } else {
        throw new Exception("Error al mover el archivo subido a la carpeta de destino. Verifique permisos.");
    }
}

if ($_SERVER['REQUEST_METHOD'] == 'POST' && ($_POST['accion'] ?? '') == 'editar_vehiculo') {
    try {
        $id = $_POST['id'] ?? null;
        if (!$id)
            throw new Exception("ID de vehículo no proporcionado.");

        // Obtener datos actuales para conservar archivos si no se suben nuevos
        $sqlCheck = "SELECT foto_placas, foto_ecologico, foto_circulacion, fotos_json FROM vehiculos WHERE id = ?";
        $stmtCheck = $db->prepare($sqlCheck);
        $stmtCheck->execute([$id]);
        $currentData = $stmtCheck->fetch(PDO::FETCH_ASSOC);

        if (!$currentData)
            throw new Exception("Vehículo no encontrado.");

        // 1. Procesar Documentos Únicos
        $foto_placas = $currentData['foto_placas'];
        if (isset($_POST['eliminar_foto_placas']) && $_POST['eliminar_foto_placas'] === 'true') {
            if (!empty($foto_placas) && file_exists($upload_dir . $foto_placas)) {
                @unlink($upload_dir . $foto_placas);
            }
            $foto_placas = null;
        } else {
            $foto_placas = subirArchivoEdicion('foto_placas', $upload_dir, $foto_placas);
        }

        $foto_ecologico = $currentData['foto_ecologico'];
        if (isset($_POST['eliminar_foto_ecologico']) && $_POST['eliminar_foto_ecologico'] === 'true') {
            if (!empty($foto_ecologico) && file_exists($upload_dir . $foto_ecologico)) {
                @unlink($upload_dir . $foto_ecologico);
            }
            $foto_ecologico = null;
        } else {
            $foto_ecologico = subirArchivoEdicion('foto_ecologico', $upload_dir, $foto_ecologico);
        }

        $foto_circulacion = $currentData['foto_circulacion'];
        if (isset($_POST['eliminar_foto_circulacion']) && $_POST['eliminar_foto_circulacion'] === 'true') {
            if (!empty($foto_circulacion) && file_exists($upload_dir . $foto_circulacion)) {
                @unlink($upload_dir . $foto_circulacion);
            }
            $foto_circulacion = null;
        } else {
            $foto_circulacion = subirArchivoEdicion('foto_circulacion', $upload_dir, $foto_circulacion);
        }

        // 2. Procesar Galería de fotos
        $galeria_final = json_decode($_POST['fotos_restantes'] ?? '[]', true);
        $fotos_eliminar = json_decode($_POST['fotos_eliminar'] ?? '[]', true);

        foreach ($fotos_eliminar as $file_name) {
            $path = $upload_dir . $file_name;
            if (!empty($file_name) && file_exists($path)) {
                @unlink($path);
            }
        }

        if (isset($_FILES['unit_photos']) && is_array($_FILES['unit_photos']['name'])) {
            foreach ($_FILES['unit_photos']['name'] as $key => $name) {
                if ($_FILES['unit_photos']['error'][$key] === UPLOAD_ERR_OK) {
                    $ext = pathinfo($name, PATHINFO_EXTENSION);
                    $nombre_nuevo = "unit_" . time() . "_" . uniqid() . "." . $ext;
                    if (move_uploaded_file($_FILES['unit_photos']['tmp_name'][$key], $upload_dir . $nombre_nuevo)) {
                        $galeria_final[] = $nombre_nuevo;
                    }
                }
            }
        }
        $fotos_json_final = json_encode(array_values($galeria_final));

        // 3. SQL Update - Sincronizado con la nueva tabla
        $sql = "UPDATE vehiculos SET 
                unidad_nombre = :nom, tipo_unidad = :tip, estado = :est, modelo_anio = :mod_a, modelo = :mod, placas = :pla,
                motor_tipo = :mot_t, cilindraje = :cil, aceite_tipo = :ace_t, filtro_aceite = :fil_a, anticongelante_tipo = :ant, 
                bujias_tipo = :buj_t, llantas_medida = :lla, focos_tipo = :foc,
                llanta_refaccion = :l_ref, cables_corriente = :c_cor, gato = :gato, cruzeta = :cru,
                
                costo_seguro_monto = :c_seg_m, costo_seguro_periodo = :c_seg_p, costo_seguro_anual = :c_seg_a,
                costo_deducible_seguro_monto = :c_ded_m, costo_deducible_seguro_periodo = :c_ded_p, costo_deducible_seguro_anual = :c_ded_a,
                costo_gasolina_monto = :c_gas_m, costo_gasolina_periodo = :c_gas_p, costo_gasolina_anual = :c_gas_a,
                costo_aceite_monto = :c_ace_m, costo_aceite_periodo = :c_ace_p, costo_aceite_anual = :c_ace_a,
                costo_ecologico_monto = :c_eco_m, costo_ecologico_periodo = :c_eco_p, costo_ecologico_anual = :c_eco_a,
                costo_placas_monto = :c_pla_m, costo_placas_periodo = :c_pla_p, costo_placas_anual = :c_pla_a,
                costo_servicio_general_monto = :c_ser_m, costo_servicio_general_periodo = :c_ser_p, costo_servicio_general_anual = :c_ser_a,
                costo_llantas_monto = :c_lla_m, costo_llantas_periodo = :c_lla_p, costo_llantas_anual = :c_lla_a,
                costo_tuneup_monto = :c_tun_m, costo_tuneup_periodo = :c_tun_p, costo_tuneup_anual = :c_tun_a,
                costo_frenos_monto = :c_fre_m, costo_frenos_periodo = :c_fre_p, costo_frenos_anual = :c_fre_a,
                costo_lavado_monto = :c_lav_m, costo_lavado_periodo = :c_lav_p, costo_lavado_anual = :c_lav_a,

                kilometraje_actual = :km, unidad_medida = :umed, rendimiento_gasolina = :ren,
                fecha_pago_seguro = :f_seg, fecha_pago_placas = :f_pla, fecha_pago_ecologico = :f_eco, fecha_proximo_mantenimiento = :f_man,
                foto_placas = :img_p, foto_ecologico = :img_e, foto_circulacion = :img_c, fotos_json = :img_j,
                motor = :mot, tipo_aceite = :t_ace, filtro_aire = :f_air, tipo_frenos = :t_fre, bujias = :buj,
                numero_serie = :vin
                WHERE id = :id";

        $stmt = $db->prepare($sql);
        $fixEnum = function ($val) {
            return (in_array($val, ['true', 'SÍ', '1', true], true)) ? 'SÍ' : 'NO';
        };

        $params = [
            ':id' => $id,
            ':nom' => $_POST['unidad_nombre'] ?? '',
            ':tip' => $_POST['tipo_unidad'] ?? 'Nacional',
            ':est' => $_POST['estado'] ?? 'Activo',
            ':mod_a' => $_POST['modelo_anio'] ?? null,
            ':mod' => $_POST['modelo'] ?? '',
            ':pla' => $_POST['placas'] ?? '',
            ':vin' => $_POST['numero_serie'] ?? '',
            ':mot_t' => $_POST['motor_tipo'] ?? '',
            ':cil' => $_POST['cilindraje'] ?? '',
            ':ace_t' => $_POST['aceite_tipo'] ?? '',
            ':fil_a' => $_POST['filtro_aceite'] ?? '',
            ':ant' => $_POST['anticongelante_tipo'] ?? '',
            ':buj_t' => $_POST['bujias_tipo'] ?? '',
            ':lla' => $_POST['llantas_medida'] ?? '',
            ':foc' => $_POST['focos_tipo'] ?? '',
            ':l_ref' => $fixEnum($_POST['llanta_refaccion'] ?? 'NO'),
            ':c_cor' => $fixEnum($_POST['cables_corriente'] ?? 'NO'),
            ':gato' => $fixEnum($_POST['gato'] ?? 'NO'),
            ':cru' => $fixEnum($_POST['cruzeta'] ?? 'NO'),
            // Nuevos campos de Montos, Periodos y ANUALES
            ':c_seg_m' => (float) ($_POST['costo_seguro_monto'] ?? 0),
            ':c_seg_p' => $_POST['costo_seguro_periodo'] ?? 'anual',
            ':c_seg_a' => (float) ($_POST['costo_seguro_anual'] ?? 0),

            ':c_ded_m' => (float) ($_POST['costo_deducible_seguro_monto'] ?? 0),
            ':c_ded_p' => $_POST['costo_deducible_seguro_periodo'] ?? 'anual',
            ':c_ded_a' => (float) ($_POST['costo_deducible_seguro_anual'] ?? 0),

            ':c_gas_m' => (float) ($_POST['costo_gasolina_monto'] ?? 0),
            ':c_gas_p' => $_POST['costo_gasolina_periodo'] ?? 'anual',
            ':c_gas_a' => (float) ($_POST['costo_gasolina_anual'] ?? 0),

            ':c_ace_m' => (float) ($_POST['costo_aceite_monto'] ?? 0),
            ':c_ace_p' => $_POST['costo_aceite_periodo'] ?? 'anual',
            ':c_ace_a' => (float) ($_POST['costo_aceite_anual'] ?? 0),

            ':c_eco_m' => (float) ($_POST['costo_ecologico_monto'] ?? 0),
            ':c_eco_p' => $_POST['costo_ecologico_periodo'] ?? 'anual',
            ':c_eco_a' => (float) ($_POST['costo_ecologico_anual'] ?? 0),

            ':c_pla_m' => (float) ($_POST['costo_placas_monto'] ?? 0),
            ':c_pla_p' => $_POST['costo_placas_periodo'] ?? 'anual',
            ':c_pla_a' => (float) ($_POST['costo_placas_anual'] ?? 0),

            ':c_ser_m' => (float) ($_POST['costo_servicio_general_monto'] ?? 0),
            ':c_ser_p' => $_POST['costo_servicio_general_periodo'] ?? 'anual',
            ':c_ser_a' => (float) ($_POST['costo_servicio_general_anual'] ?? 0),

            ':c_lla_m' => (float) ($_POST['costo_llantas_monto'] ?? 0),
            ':c_lla_p' => $_POST['costo_llantas_periodo'] ?? 'anual',
            ':c_lla_a' => (float) ($_POST['costo_llantas_anual'] ?? 0),

            ':c_tun_m' => (float) ($_POST['costo_tuneup_monto'] ?? 0),
            ':c_tun_p' => $_POST['costo_tuneup_periodo'] ?? 'anual',
            ':c_tun_a' => (float) ($_POST['costo_tuneup_anual'] ?? 0),

            ':c_fre_m' => (float) ($_POST['costo_frenos_monto'] ?? 0),
            ':c_fre_p' => $_POST['costo_frenos_periodo'] ?? 'anual',
            ':c_fre_a' => (float) ($_POST['costo_frenos_anual'] ?? 0),

            ':c_lav_m' => (float) ($_POST['costo_lavado_monto'] ?? 0),
            ':c_lav_p' => $_POST['costo_lavado_periodo'] ?? 'anual',
            ':c_lav_a' => (float) ($_POST['costo_lavado_anual'] ?? 0),

            // Kilometraje y Fechas
            ':km' => (int) ($_POST['kilometraje_actual'] ?? 0),
            ':umed' => $_POST['unidad_medida'] ?? 'km',
            ':ren' => (float) ($_POST['rendimiento_gasolina'] ?? 0),
            ':f_seg' => !empty($_POST['fecha_pago_seguro']) ? $_POST['fecha_pago_seguro'] : null,
            ':f_pla' => !empty($_POST['fecha_pago_placas']) ? $_POST['fecha_pago_placas'] : null,
            ':f_eco' => !empty($_POST['fecha_pago_ecologico']) ? $_POST['fecha_pago_ecologico'] : null,
            ':f_man' => !empty($_POST['fecha_proximo_mantenimiento']) ? $_POST['fecha_proximo_mantenimiento'] : null,
            ':img_p' => $foto_placas,
            ':img_e' => $foto_ecologico,
            ':img_c' => $foto_circulacion,
            ':img_j' => $fotos_json_final,
            // Campos adicionales al final del DESCRIBE
            ':mot' => $_POST['motor'] ?? '',
            ':t_ace' => $_POST['tipo_aceite'] ?? '',
            ':f_air' => $_POST['filtro_aire'] ?? '',
            ':t_fre' => $_POST['tipo_frenos'] ?? '',
            ':buj' => $_POST['bujias'] ?? ''
        ];

        if ($stmt->execute($params)) {
            echo json_encode(["status" => "success", "message" => "Unidad actualizada correctamente"]);
        } else {
            throw new Exception("Error al ejecutar la actualización en la base de datos.");
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>