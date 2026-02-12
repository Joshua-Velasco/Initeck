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

// Directorio relativo al script PHP
$upload_dir = "uploads/";
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

function subirArchivo($file_input, $folder)
{
    if (isset($_FILES[$file_input]) && $_FILES[$file_input]['error'] === UPLOAD_ERR_OK) {
        $ext = strtolower(pathinfo($_FILES[$file_input]['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'pdf'];
        if (!in_array($ext, $allowed))
            return null;

        $nombre = time() . "_" . bin2hex(random_bytes(4)) . "." . $ext;
        if (move_uploaded_file($_FILES[$file_input]['tmp_name'], $folder . $nombre)) {
            return $nombre;
        }
    }
    return null;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST' && ($_POST['accion'] ?? '') == 'registrar_vehiculo') {
    try {
        $foto_placas = subirArchivo('foto_placas', $upload_dir);
        $foto_ecologico = subirArchivo('foto_ecologico', $upload_dir);
        $foto_circulacion = subirArchivo('foto_circulacion', $upload_dir);

        $fotos_unidad = [];
        foreach ($_FILES as $key => $file) {
            if (strpos($key, 'foto_unidad_') === 0 && $file['error'] === UPLOAD_ERR_OK) {
                $nom = subirArchivo($key, $upload_dir);
                if ($nom)
                    $fotos_unidad[] = $nom;
            }
        }

        $sql = "INSERT INTO vehiculos (
            unidad_nombre, tipo_unidad, estado, modelo_anio, modelo, placas, numero_serie,
            motor_tipo, cilindraje, aceite_tipo, filtro_aceite, anticongelante_tipo, bujias_tipo, llantas_medida, focos_tipo,
            llanta_refaccion, cables_corriente, gato, cruzeta,
            costo_seguro_monto, costo_seguro_periodo, costo_seguro_anual,
            costo_deducible_seguro_monto, costo_deducible_seguro_periodo, costo_deducible_seguro_anual,
            costo_gasolina_monto, costo_gasolina_periodo, costo_gasolina_anual,
            costo_aceite_monto, costo_aceite_periodo, costo_aceite_anual,
            costo_ecologico_monto, costo_ecologico_periodo, costo_ecologico_anual,
            costo_placas_monto, costo_placas_periodo, costo_placas_anual,
            costo_servicio_general_monto, costo_servicio_general_periodo, costo_servicio_general_anual,
            costo_llantas_monto, costo_llantas_periodo, costo_llantas_anual,
            costo_tuneup_monto, costo_tuneup_periodo, costo_tuneup_anual,
            costo_frenos_monto, costo_frenos_periodo, costo_frenos_anual,
            costo_lavado_monto, costo_lavado_periodo, costo_lavado_anual,
            kilometraje_actual, unidad_medida, rendimiento_gasolina,
            fecha_pago_seguro, fecha_pago_placas, fecha_pago_ecologico, fecha_proximo_mantenimiento,
            foto_placas, foto_ecologico, foto_circulacion, fotos_json,
            motor, tipo_aceite, filtro_aire, tipo_frenos, bujias
        ) VALUES (
            :nom, :tip, :est, :mod_a, :mod, :pla, :vin,
            :mot_t, :cil, :ace_t, :fil_a, :ant, :buj_t, :lla, :foc,
            :l_ref, :c_cor, :gato, :cru,
            :c_seg_m, :c_seg_p, :c_seg_a,
            :c_ded_m, :c_ded_p, :c_ded_a,
            :c_gas_m, :c_gas_p, :c_gas_a,
            :c_ace_m, :c_ace_p, :c_ace_a,
            :c_eco_m, :c_eco_p, :c_eco_a,
            :c_pla_m, :c_pla_p, :c_pla_a,
            :c_ser_m, :c_ser_p, :c_ser_a,
            :c_lla_m, :c_lla_p, :c_lla_a,
            :c_tun_m, :c_tun_p, :c_tun_a,
            :c_fre_m, :c_fre_p, :c_fre_a,
            :c_lav_m, :c_lav_p, :c_lav_a,
            :km, :umed, :ren,
            :f_seg, :f_pla, :f_eco, :f_man,
            :img_p, :img_e, :img_c, :img_j,
            :mot, :t_ace, :f_air, :t_fre, :buj
        )";

        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':nom' => $_POST['unidad_nombre'],
            ':tip' => $_POST['tipo_unidad'] ?? 'Nacional',
            ':est' => $_POST['estado'] ?? 'Activo',
            ':mod_a' => $_POST['modelo_anio'] ?: null,
            ':mod' => $_POST['modelo'] ?? '',
            ':pla' => $_POST['placas'] ?? '',
            ':vin' => strtoupper($_POST['numero_serie'] ?? ''),
            ':mot_t' => $_POST['motor_tipo'] ?? '',
            ':cil' => $_POST['cilindraje'] ?? '',
            ':ace_t' => $_POST['aceite_tipo'] ?? '',
            ':fil_a' => $_POST['filtro_aceite'] ?? '',
            ':ant' => $_POST['anticongelante_tipo'] ?? '',
            ':buj_t' => $_POST['bujias_tipo'] ?? '',
            ':lla' => $_POST['llantas_medida'] ?? '',
            ':foc' => $_POST['focos_tipo'] ?? '',
            ':l_ref' => ($_POST['llanta_refaccion'] == 'SÍ' || $_POST['llanta_refaccion'] == 'true') ? 'SÍ' : 'NO',
            ':c_cor' => ($_POST['cables_corriente'] == 'SÍ' || $_POST['cables_corriente'] == 'true') ? 'SÍ' : 'NO',
            ':gato' => ($_POST['gato'] == 'SÍ' || $_POST['gato'] == 'true') ? 'SÍ' : 'NO',
            ':cru' => ($_POST['cruzeta'] == 'SÍ' || $_POST['cruzeta'] == 'true') ? 'SÍ' : 'NO',

            ':c_seg_m' => (float) $_POST['costo_seguro_monto'],
            ':c_seg_p' => $_POST['costo_seguro_periodo'],
            ':c_seg_a' => (float) ($_POST['costo_seguro_anual'] ?? 0),

            ':c_ded_m' => (float) $_POST['costo_deducible_seguro_monto'],
            ':c_ded_p' => $_POST['costo_deducible_seguro_periodo'],
            ':c_ded_a' => (float) ($_POST['costo_deducible_seguro_anual'] ?? 0),

            ':c_gas_m' => (float) $_POST['costo_gasolina_monto'],
            ':c_gas_p' => $_POST['costo_gasolina_periodo'],
            ':c_gas_a' => (float) ($_POST['costo_gasolina_anual'] ?? 0),

            ':c_ace_m' => (float) $_POST['costo_aceite_monto'],
            ':c_ace_p' => $_POST['costo_aceite_periodo'],
            ':c_ace_a' => (float) ($_POST['costo_aceite_anual'] ?? 0),

            ':c_eco_m' => (float) $_POST['costo_ecologico_monto'],
            ':c_eco_p' => $_POST['costo_ecologico_periodo'],
            ':c_eco_a' => (float) ($_POST['costo_ecologico_anual'] ?? 0),

            ':c_pla_m' => (float) $_POST['costo_placas_monto'],
            ':c_pla_p' => $_POST['costo_placas_periodo'],
            ':c_pla_a' => (float) ($_POST['costo_placas_anual'] ?? 0),

            ':c_ser_m' => (float) $_POST['costo_servicio_general_monto'],
            ':c_ser_p' => $_POST['costo_servicio_general_periodo'],
            ':c_ser_a' => (float) ($_POST['costo_servicio_general_anual'] ?? 0),

            ':c_lla_m' => (float) $_POST['costo_llantas_monto'],
            ':c_lla_p' => $_POST['costo_llantas_periodo'],
            ':c_lla_a' => (float) ($_POST['costo_llantas_anual'] ?? 0),

            ':c_tun_m' => (float) $_POST['costo_tuneup_monto'],
            ':c_tun_p' => $_POST['costo_tuneup_periodo'],
            ':c_tun_a' => (float) ($_POST['costo_tuneup_anual'] ?? 0),

            ':c_fre_m' => (float) ($_POST['costo_frenos_monto'] ?? 0),
            ':c_fre_p' => $_POST['costo_frenos_periodo'] ?? 'anual',
            ':c_fre_a' => (float) ($_POST['costo_frenos_anual'] ?? 0),

            ':c_lav_m' => (float) $_POST['costo_lavado_monto'],
            ':c_lav_p' => $_POST['costo_lavado_periodo'],
            ':c_lav_a' => (float) ($_POST['costo_lavado_anual'] ?? 0),

            ':km' => (int) $_POST['kilometraje_actual'],
            ':umed' => $_POST['unidad_medida'],
            ':ren' => (float) $_POST['rendimiento_gasolina'],
            ':f_seg' => $_POST['fecha_pago_seguro'] ?: null,
            ':f_pla' => $_POST['fecha_pago_placas'] ?: null,
            ':f_eco' => $_POST['fecha_pago_ecologico'] ?: null,
            ':f_man' => $_POST['fecha_proximo_mantenimiento'] ?: null,
            ':img_p' => $foto_placas,
            ':img_e' => $foto_ecologico,
            ':img_c' => $foto_circulacion,
            ':img_j' => json_encode($fotos_unidad),
            ':mot' => $_POST['motor'] ?? '',
            ':t_ace' => $_POST['tipo_aceite'] ?? '',
            ':f_air' => $_POST['filtro_aire'] ?? '',
            ':t_fre' => $_POST['tipo_frenos'] ?? '',
            ':buj' => $_POST['bujias'] ?? ''
        ]);

        echo json_encode(["status" => "success", "id" => $db->lastInsertId()]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}