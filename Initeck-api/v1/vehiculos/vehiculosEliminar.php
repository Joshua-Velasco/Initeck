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

if ($_SERVER['REQUEST_METHOD'] == 'POST' && ($_POST['accion'] ?? '') == 'eliminar_vehiculo') {
    try {
        $id = $_POST['id'] ?? null;
        
        if (!$id) {
            throw new Exception("ID de vehículo no proporcionado.");
        }

        // 1. Obtener información de archivos antes de borrar el registro
        $sqlCheck = "SELECT fotos_json, foto_placas, foto_ecologico, foto_circulacion FROM vehiculos WHERE id = ?";
        $stmtCheck = $db->prepare($sqlCheck);
        $stmtCheck->execute([$id]);
        $vehiculo = $stmtCheck->fetch(PDO::FETCH_ASSOC);
        
        if (!$vehiculo) {
            throw new Exception("Vehículo no encontrado en la base de datos.");
        }

        $upload_dir = "uploads/";

        // 2. Eliminar fotos de la galería (JSON)
        if (!empty($vehiculo['fotos_json'])) {
            $fotos = json_decode($vehiculo['fotos_json'], true);
            if (is_array($fotos)) {
                foreach ($fotos as $foto) {
                    $ruta_foto = $upload_dir . $foto;
                    if (!empty($foto) && file_exists($ruta_foto)) {
                        @unlink($ruta_foto);
                    }
                }
            }
        }

        // 3. Eliminar archivos de documentos individuales
        $documentos = ['foto_placas', 'foto_ecologico', 'foto_circulacion'];
        foreach ($documentos as $doc) {
            if (!empty($vehiculo[$doc])) {
                $ruta_doc = $upload_dir . $vehiculo[$doc];
                if (file_exists($ruta_doc)) {
                    @unlink($ruta_doc);
                }
            }
        }

        // 4. Eliminar el registro de la base de datos
        // Nota: Si tienes tablas relacionadas (como mantenimientos) con llaves foráneas, 
        // asegúrate de que tengan ON DELETE CASCADE o borra los mantenimientos primero.
        $sqlDelete = "DELETE FROM vehiculos WHERE id = ?";
        $stmtDelete = $db->prepare($sqlDelete);
        
        if ($stmtDelete->execute([$id])) {
            echo json_encode([
                "status" => "success", 
                "message" => "Vehículo y sus archivos asociados han sido eliminados."
            ]);
        } else {
            $error = $stmtDelete->errorInfo();
            throw new Exception("Error al eliminar el registro: " . $error[2]);
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "status" => "error", 
            "message" => $e->getMessage()
        ]);
    }
} else {
    http_response_code(400);
    echo json_encode([
        "status" => "error", 
        "message" => "Solicitud no válida o método incorrecto."
    ]);
}
?>