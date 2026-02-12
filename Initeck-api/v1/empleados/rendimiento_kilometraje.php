<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/database.php';

$empleado_id = isset($_GET['empleado_id']) ? intval($_GET['empleado_id']) : 0;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 7;

if ($empleado_id <= 0) {
    echo json_encode(["status" => "error", "message" => "ID de empleado no válido"]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Obtenemos los últimos N registros de inspección que tengan odómetro final
    // Normalizamos el recorrido: si la unidad está en millas (mi), multiplicamos por 1.60934
    $query = "SELECT iv.fecha, iv.odometro_inicio, iv.odometro_final, v.unidad_medida,
                     ROUND(CASE 
                        WHEN v.unidad_medida = 'mi' THEN (iv.odometro_final - iv.odometro_inicio) * 1.60934
                        ELSE (iv.odometro_final - iv.odometro_inicio)
                     END, 2) as recorrido
              FROM inspecciones_vehiculos iv
              JOIN vehiculos v ON iv.vehiculo_id = v.id
              WHERE iv.empleado_id = :emp_id 
              AND iv.odometro_final IS NOT NULL 
              AND iv.odometro_final > iv.odometro_inicio
              ORDER BY iv.fecha DESC, iv.id DESC
              LIMIT :limit";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':emp_id', $empleado_id, PDO::PARAM_INT);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();

    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Invertimos para que el gráfico vaya de pasado a presente (izquierda a derecha)
    echo json_encode(["status" => "success", "data" => array_reverse($data)]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
