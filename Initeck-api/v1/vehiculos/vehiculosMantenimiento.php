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

if (!$db) {
    ob_clean();
    echo json_encode(["status" => "error", "message" => "Error de conexión centralizada"]);
    exit;
}

$metodo = $_SERVER['REQUEST_METHOD'];

// --- MÉTODO GET: Listar Mantenimientos ---
if ($metodo === 'GET') {
    try {
        $sql = "SELECT m.*, v.unidad_nombre, v.placas, v.unidad_medida
                FROM mantenimientos m
                LEFT JOIN vehiculos v ON m.unidad_id = v.id";

        $params = [];
        $where  = [];

        if (isset($_GET['vehiculo_id']) || isset($_GET['unidad_id'])) {
            $vid = intval($_GET['vehiculo_id'] ?? $_GET['unidad_id']);
            $where[]  = "m.unidad_id = ?";
            $params[] = $vid;
        }
        if (isset($_GET['responsable'])) {
            $where[]  = "m.responsable LIKE ?";
            $params[] = "%" . $_GET['responsable'] . "%";
        }
        if (!empty($where)) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }

        $sql .= " ORDER BY m.fecha DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        ob_clean();
        echo json_encode($data);
    } catch (PDOException $e) {
        ob_clean();
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}

// --- MÉTODO POST: Insertar / Guardar ---
if ($metodo === 'POST') {
    $accion = $_POST['accion'] ?? '';

    // ACCIÓN: Guardar URL del Manual
    if ($accion === 'guardar_url_manual') {
        $u_id = isset($_POST['unidad_id']) ? intval($_POST['unidad_id']) : 0;
        $url = $_POST['manual_url'] ?? '';

        $stmt = $db->prepare("UPDATE vehiculos SET manual_url = ? WHERE id = ?");
        $res = $stmt->execute([$url, $u_id]);

        ob_clean();
        echo json_encode(["status" => $res ? "success" : "error"]);
        exit;
    }

    // ACCIÓN: Registro de Mantenimiento
    else {
        $unidad_id = $_POST['unidad_id'] ?? null;
        $tipo = $_POST['tipo'] ?? '';
        $descripcion = $_POST['descripcion'] ?? '';
        $costo = $_POST['costo_total'] ?? 0;
        $presupuesto = $_POST['presupuesto'] ?? 0;
        $km = $_POST['kilometraje_al_momento'] ?? 0;
        $responsable = $_POST['responsable'] ?? 'Sin asignar';
        $estado = $_POST['estado'] ?? 'Completado';
        $fecha = $_POST['fecha'] ?? date('Y-m-d');
        $categoria_presupuesto = $_POST['categoria_presupuesto'] ?? null;

        $upload_dir = __DIR__ . "/uploads/";
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }

        // LOG: Debug file uploads
        error_log("=== MANTENIMIENTO UPLOAD DEBUG ===");
        error_log("FILES received: " . json_encode(array_keys($_FILES)));

        $evidencia_nombre = "";
        if (isset($_FILES['evidencia_foto'])) {
            error_log("Evidencia foto - Error: " . $_FILES['evidencia_foto']['error'] . ", Size: " . $_FILES['evidencia_foto']['size'] . ", Name: " . $_FILES['evidencia_foto']['name']);

            if ($_FILES['evidencia_foto']['error'] === UPLOAD_ERR_OK) {
                $ext = pathinfo($_FILES['evidencia_foto']['name'], PATHINFO_EXTENSION);
                $evidencia_nombre = "evid_" . time() . "_" . uniqid() . "." . $ext;
                $moved = move_uploaded_file($_FILES['evidencia_foto']['tmp_name'], $upload_dir . $evidencia_nombre);
                error_log("Evidencia moved: " . ($moved ? 'YES' : 'NO') . " to " . $upload_dir . $evidencia_nombre);

                if ($moved) {
                    $filesize = filesize($upload_dir . $evidencia_nombre);
                    error_log("Evidencia file size after save: " . $filesize . " bytes");
                }
            }
        }

        $firma_nombre = "";
        if (isset($_FILES['firma_empleado'])) {
            error_log("Firma empleado - Error: " . $_FILES['firma_empleado']['error'] . ", Size: " . $_FILES['firma_empleado']['size'] . ", Name: " . $_FILES['firma_empleado']['name']);

            if ($_FILES['firma_empleado']['error'] === UPLOAD_ERR_OK) {
                $firma_nombre = "firma_" . time() . "_" . uniqid() . ".png";
                $moved = move_uploaded_file($_FILES['firma_empleado']['tmp_name'], $upload_dir . $firma_nombre);
                error_log("Firma moved: " . ($moved ? 'YES' : 'NO') . " to " . $upload_dir . $firma_nombre);

                if ($moved) {
                    $filesize = filesize($upload_dir . $firma_nombre);
                    error_log("Firma file size after save: " . $filesize . " bytes");
                }
            }
        }
        error_log("=== END UPLOAD DEBUG ===");

        try {
            $db->beginTransaction();

            $sql = "INSERT INTO mantenimientos 
                    (unidad_id, tipo, descripcion, costo_total, presupuesto, kilometraje_al_momento, responsable, estado, fecha, evidencia_foto, firma_empleado, categoria_presupuesto) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmt = $db->prepare($sql);
            $stmt->execute([
                $unidad_id,
                $tipo,
                $descripcion,
                $costo,
                $presupuesto,
                $km,
                $responsable,
                $estado,
                $fecha,
                $evidencia_nombre,
                $firma_nombre,
                $categoria_presupuesto
            ]);

            // Actualizar el kilometraje del vehículo automáticamente
            $stmtUpdate = $db->prepare("UPDATE vehiculos SET kilometraje_actual = ? WHERE id = ?");
            $stmtUpdate->execute([$km, $unidad_id]);

            $db->commit();
            ob_clean();
            echo json_encode(["status" => "success"]);
        } catch (Exception $e) {
            $db->rollBack();
            ob_clean();
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        exit;
    }
}

// --- MÉTODO DELETE ---
if ($metodo === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

    if ($id > 0) {
        try {
            // 1. Obtener nombres de archivos para borrar del servidor
            $stmtFile = $db->prepare("SELECT evidencia_foto, firma_empleado FROM mantenimientos WHERE id = ?");
            $stmtFile->execute([$id]);
            $archivos = $stmtFile->fetch(PDO::FETCH_ASSOC);

            // 2. Eliminar registro
            $stmtDel = $db->prepare("DELETE FROM mantenimientos WHERE id = ?");
            if ($stmtDel->execute([$id])) {
                $upload_dir = __DIR__ . "/uploads/";
                if ($archivos) {
                    if (!empty($archivos['evidencia_foto']) && file_exists($upload_dir . $archivos['evidencia_foto'])) {
                        @unlink($upload_dir . $archivos['evidencia_foto']);
                    }
                    if (!empty($archivos['firma_empleado']) && file_exists($upload_dir . $archivos['firma_empleado'])) {
                        @unlink($upload_dir . $archivos['firma_empleado']);
                    }
                }
                ob_clean();
                echo json_encode(["status" => "success", "message" => "Eliminado correctamente"]);
            }
        } catch (PDOException $e) {
            ob_clean();
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    }
    exit;
}
?>