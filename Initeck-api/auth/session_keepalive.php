<?php
require_once '../config/cors.php';

require_once '../config/database.php';

// Leer el JSON de React
$data = json_decode(file_get_contents("php://input"));

if ($data && !empty($data->usuario_id)) {
    try {
        $database = new Database();
        $db = $database->getConnection();

        // Query seguro
        $query = "UPDATE usuarios SET id = id WHERE id = :id"; 
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data->usuario_id);

        if ($stmt->execute()) {
            // --- LÓGICA DE MONITOREO ---
            // Solo para usuarios con rol 'monitorista'
            try {
                // 1. Verificar rol del usuario
                $stmtRol = $db->prepare("SELECT rol FROM usuarios WHERE id = :id");
                $stmtRol->execute([':id' => $data->usuario_id]);
                $userRole = $stmtRol->fetchColumn();

                if ($userRole === 'monitorista') {
                    $fechaHoy = date('Y-m-d');
                    
                    // 2. Buscar si ya tiene una sesión activa HOY que se haya actualizado hace poco (ej. < 20 min)
                    // Si la última actualización fue hace mucho, asumimos que es una NUEVA sesión (ej. turno tarde)
                    $stmtCheck = $db->prepare("
                        SELECT id, hora_inicio 
                        FROM monitor_sesiones 
                        WHERE usuario_id = :uid 
                        AND fecha = :fecha 
                        AND hora_fin >= DATE_SUB(NOW(), INTERVAL 20 MINUTE)
                        ORDER BY id DESC LIMIT 1
                    ");
                    $stmtCheck->execute([':uid' => $data->usuario_id, ':fecha' => $fechaHoy]);
                    $activeSession = $stmtCheck->fetch(PDO::FETCH_ASSOC);

                    if ($activeSession) {
                        // A) ACTUALIZAR sesión existente
                        $sessionId = $activeSession['id'];
                        // Calculamos la diferencia directamente en SQL para evitar problemas de zona horaria PHP vs MySQL
                        $stmtUpdate = $db->prepare("
                            UPDATE monitor_sesiones 
                            SET hora_fin = NOW(), 
                                duracion_horas = ROUND(TIMESTAMPDIFF(SECOND, hora_inicio, NOW()) / 3600, 2)
                            WHERE id = :sid
                        ");
                        $stmtUpdate->execute([':sid' => $sessionId]);

                    } else {
                        // B) CREAR nueva sesión (Primer login del día o regreso después de largo tiempo)
                        $stmtInsert = $db->prepare("
                            INSERT INTO monitor_sesiones (usuario_id, fecha, hora_inicio, hora_fin, duracion_horas) 
                            VALUES (:uid, :fecha, NOW(), NOW(), 0)
                        ");
                        $stmtInsert->execute([':uid' => $data->usuario_id, ':fecha' => $fechaHoy]);
                    }
                }
            } catch (Exception $e) {
                // Silencioso: No queremos romper el keepalive si falla el log de monitoreo
                error_log("Error en Monitor Tracking: " . $e->getMessage());
            }
            // ---------------------------

            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error", "message" => "No se pudo actualizar"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    // Si no llega el ID, respondemos algo para que Fetch no falle
    echo json_encode(["status" => "error", "message" => "ID no recibido en el body"]);
}