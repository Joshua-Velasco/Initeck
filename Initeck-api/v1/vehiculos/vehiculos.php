<?php
// Headers CORS son manejados por Apache en .htaccess

// Manejar la petición "preflight" de los navegadores
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once '../../config/database.php';

// 2. Inicializar la conexión usando tu clase Database (PDO)
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo json_encode(["status" => "error", "message" => "Conexión fallida a la base de datos."]);
    exit;
}

$metodo = $_SERVER['REQUEST_METHOD'];

// --- MÉTODO GET: CONSULTA ---
if ($metodo == 'GET') {
    try {
        $sql = "SELECT * FROM vehiculos ORDER BY unidad_nombre ASC";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $vehiculos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($vehiculos);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

// --- MÉTODO POST: ACCIONES (REGISTRAR, EDITAR, ELIMINAR) ---
if ($metodo == 'POST') {
    $accion = $_POST['accion'] ?? '';
    $upload_dir = "uploads/";
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    // Función auxiliar para subir archivos
    $subirArchivo = function ($file_input) use ($upload_dir) {
        if (isset($_FILES[$file_input]) && $_FILES[$file_input]['error'] === UPLOAD_ERR_OK) {
            $ext = pathinfo($_FILES[$file_input]['name'], PATHINFO_EXTENSION);
            $nombre = time() . "_" . uniqid() . "." . $ext;
            if (move_uploaded_file($_FILES[$file_input]['tmp_name'], $upload_dir . $nombre)) {
                return $nombre;
            }
        }
        return null;
    };

    // --- ACCIÓN: REGISTRAR VEHÍCULO ---
    if ($accion == 'registrar_vehiculo') {
        try {
            $foto_p = $subirArchivo('foto_placas');
            $foto_e = $subirArchivo('foto_ecologico');
            $foto_c = $subirArchivo('foto_circulacion');

            // Procesar galería JSON
            $fotos_galeria = [];
            if (isset($_FILES['unit_photos']) && is_array($_FILES['unit_photos']['name'])) {
                foreach ($_FILES['unit_photos']['name'] as $k => $name) {
                    $tmp_name = $_FILES['unit_photos']['tmp_name'][$k];
                    $ext = pathinfo($name, PATHINFO_EXTENSION);
                    $n_gal = "unit_" . time() . "_" . uniqid() . "." . $ext;
                    if (move_uploaded_file($tmp_name, $upload_dir . $n_gal)) {
                        $fotos_galeria[] = $n_gal;
                    }
                }
            }

            $sql = "INSERT INTO vehiculos (
                unidad_nombre, tipo_unidad, placas, numero_serie, modelo, kilometraje_actual, estado,
                costo_seguro_anual, costo_placas_anual, costo_ecologico_anual, costo_gasolina_anual,
                costo_aceite_anual, costo_tuneup_anual, costo_lavado_anual, costo_llantas_anual, costo_frenos_anual, costo_frenos_monto, costo_frenos_periodo, costo_servicio_general_anual,
                fecha_pago_seguro, fecha_pago_placas, fecha_pago_ecologico, fecha_proximo_mantenimiento,
                foto_placas, foto_ecologico, foto_circulacion, fotos_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmt = $db->prepare($sql);
            $params = [
                $_POST['unidad_nombre'],
                $_POST['tipo_unidad'],
                $_POST['placas'],
                $_POST['numero_serie'],
                $_POST['modelo'],
                $_POST['kilometraje_actual'],
                $_POST['estado'],
                $_POST['costo_seguro_anual'],
                $_POST['costo_placas_anual'],
                $_POST['costo_ecologico_anual'],
                $_POST['costo_gasolina_anual'],
                $_POST['costo_aceite_anual'],
                $_POST['costo_tuneup_anual'],
                $_POST['costo_lavado_anual'],
                $_POST['costo_llantas_anual'],
                $_POST['costo_frenos_anual'] ?? 0,
                $_POST['costo_frenos_monto'] ?? 0,
                $_POST['costo_frenos_periodo'] ?? 'anual',
                $_POST['costo_servicio_general_anual'] ?? 0,
                $_POST['fecha_pago_seguro'],
                $_POST['fecha_pago_placas'],
                $_POST['fecha_pago_ecologico'],
                $_POST['fecha_proximo_mantenimiento'],
                $foto_p,
                $foto_e,
                $foto_c,
                json_encode($fotos_galeria)
            ];

            if ($stmt->execute($params)) {
                echo json_encode(["status" => "success", "id" => $db->lastInsertId()]);
            }
        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    // --- ACCIÓN: EDITAR VEHÍCULO ---
    elseif ($accion == 'editar_vehiculo') {
        try {
            $id = intval($_POST['id']);
            $sql = "UPDATE vehiculos SET 
                    unidad_nombre = ?, tipo_unidad = ?, placas = ?, numero_serie = ?, modelo = ?, 
                    kilometraje_actual = ?, estado = ?, 
                    costo_seguro_anual = ?, costo_placas_anual = ?, costo_ecologico_anual = ?,
                    costo_gasolina_anual = ?, costo_aceite_anual = ?, costo_tuneup_anual = ?,
                    costo_lavado_anual = ?, costo_llantas_anual = ?, costo_frenos_anual = ?, costo_frenos_monto = ?, costo_frenos_periodo = ?, costo_servicio_general_anual = ?,
                    fecha_pago_seguro = ?, fecha_pago_placas = ?, 
                    fecha_pago_ecologico = ?, fecha_proximo_mantenimiento = ?
                    WHERE id = ?";

            $stmt = $db->prepare($sql);
            $params = [
                $_POST['unidad_nombre'],
                $_POST['tipo_unidad'],
                $_POST['placas'],
                $_POST['numero_serie'],
                $_POST['modelo'],
                $_POST['kilometraje_actual'],
                $_POST['estado'],
                $_POST['costo_seguro_anual'],
                $_POST['costo_placas_anual'],
                $_POST['costo_ecologico_anual'],
                $_POST['costo_gasolina_anual'],
                $_POST['costo_aceite_anual'],
                $_POST['costo_tuneup_anual'],
                $_POST['costo_lavado_anual'],
                $_POST['costo_llantas_anual'],
                $_POST['costo_frenos_anual'] ?? 0,
                $_POST['costo_frenos_monto'] ?? 0,
                $_POST['costo_frenos_periodo'] ?? 'anual',
                $_POST['costo_servicio_general_anual'] ?? 0,
                $_POST['fecha_pago_seguro'],
                $_POST['fecha_pago_placas'],
                $_POST['fecha_pago_ecologico'],
                $_POST['fecha_proximo_mantenimiento'],
                $id
            ];

            if ($stmt->execute($params)) {
                echo json_encode(["status" => "success", "message" => "Vehículo actualizado"]);
            }
        } catch (Exception $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }

    // --- ACCIÓN: ELIMINAR VEHÍCULO ---
    elseif ($accion == 'eliminar_vehiculo') {
        $id = intval($_POST['id']);
        $stmt = $db->prepare("DELETE FROM vehiculos WHERE id = ?");
        if ($stmt->execute([$id])) {
            echo json_encode(["status" => "success"]);
        }
    }
}
?>