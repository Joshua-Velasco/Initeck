<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Consulta para el resumen operativo del día actual
    $query = "SELECT 
                COALESCE(SUM(monto_efectivo + COALESCE(propinas, 0)), 0) as total_ventas,
                COALESCE(SUM(gastos_total), 0) as total_gastos,
                COALESCE(SUM(neto_entregado), 0) as balance_neto
              FROM liquidaciones 
              WHERE fecha = CURDATE()";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $resumen = $stmt->fetch(PDO::FETCH_ASSOC);

    // También podemos contar cuántas unidades han iniciado jornada hoy
    $query_unidades = "SELECT COUNT(DISTINCT vehiculo_id) as unidades_hoy 
                       FROM inspecciones_vehiculos 
                       WHERE fecha = CURDATE()";
    $stmt_unidades = $db->prepare($query_unidades);
    $stmt_unidades->execute();
    $unidades = $stmt_unidades->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => [
            "ventas" => (float)$resumen['total_ventas'],
            "gastos" => (float)$resumen['total_gastos'],
            "balance" => (float)$resumen['balance_neto'],
            "unidades_activas" => (int)$unidades['unidades_hoy']
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error", 
        "message" => "Error en la base de datos",
        "detalle" => $e->getMessage()
    ]);
}
