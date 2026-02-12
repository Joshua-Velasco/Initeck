<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    echo json_encode(["status" => "error", "message" => "ID inválido"]);
    exit;
}

try {
    // 1. Obtener estadísticas generales (Hoy y Total Semana)
    $today = date('Y-m-d');
    $weekStart = date('Y-m-d', strtotime('-7 days'));

    // Horas hoy
    $stmtToday = $db->prepare("SELECT SUM(duracion_horas) as horas_hoy FROM monitor_sesiones WHERE usuario_id = ? AND fecha = ?");
    $stmtToday->execute([$id, $today]);
    $horasHoy = $stmtToday->fetch(PDO::FETCH_ASSOC)['horas_hoy'] ?? 0;

    // Horas semana
    $stmtWeek = $db->prepare("SELECT SUM(duracion_horas) as horas_semana FROM monitor_sesiones WHERE usuario_id = ? AND fecha >= ?");
    $stmtWeek->execute([$id, $weekStart]);
    $horasSemana = $stmtWeek->fetch(PDO::FETCH_ASSOC)['horas_semana'] ?? 0;
    
    // Promedio diario (últimos 7 días)
    $promedioDiario = $horasSemana / 7;

    // 2. Obtener datos para el gráfico (últimos 7 días)
    $stmtChart = $db->prepare("
        SELECT fecha, duracion_horas 
        FROM monitor_sesiones 
        WHERE usuario_id = ? AND fecha >= ? 
        ORDER BY fecha ASC
    ");
    $stmtChart->execute([$id, $weekStart]);
    $chartData = $stmtChart->fetchAll(PDO::FETCH_ASSOC);

    // Formatear datos para el gráfico (llenar días vacíos si es necesario)
    // Para simplificar, asumimos que el array viene bien, pero en prod deberíamos rellenar huecos.
    
    echo json_encode([
        "status" => "success",
        "data" => [
            "horas_hoy" => floatval($horasHoy),
            "horas_semana" => floatval($horasSemana),
            "promedio_diario" => round($promedioDiario, 1),
            "chart_data" => $chartData
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
