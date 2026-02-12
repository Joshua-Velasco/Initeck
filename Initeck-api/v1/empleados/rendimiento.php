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


$id = $_GET['id'] ?? null;
$periodo = $_GET['periodo'] ?? 'dia';

// Soporte para rangos
$fechaInicio = $_GET['fecha_inicio'] ?? date('Y-m-d');
$fechaFin = $_GET['fecha_fin'] ?? date('Y-m-d');
// Fallback retrocompatible
if (isset($_GET['fecha'])) {
    $fechaInicio = $_GET['fecha'];
    $fechaFin = $_GET['fecha'];
}

if (!$id) {
    echo json_encode(["status" => "error", "message" => "ID no proporcionado"]);
    exit();
}

try {
    // Definimos las columnas comunes para agregación
    $cols_agregadas = "
        SUM(monto_efectivo) as total_efectivo,
        SUM(propinas) as total_propinas,
        SUM(gastos_total) as total_gastos,
        (SUM(monto_efectivo) - SUM(gastos_total)) as neto,
        SUM(viajes) as total_viajes
    ";

    switch ($periodo) {
        case 'semana':
            // Lógica legacy (opcional, pero la mantenemos)
             $query = "SELECT 
                        fecha, 
                        $cols_agregadas
                      FROM liquidaciones 
                      WHERE empleado_id = :id 
                      GROUP BY fecha 
                      ORDER BY fecha DESC LIMIT 7";
            break;
        case 'mes':
             $query = "SELECT 
                        DATE_FORMAT(fecha, '%Y-%m') as mes, 
                        $cols_agregadas
                      FROM liquidaciones 
                      WHERE empleado_id = :id 
                      GROUP BY mes 
                      ORDER BY mes DESC LIMIT 6";
            break;
        case 'dia':
        default:
            // Lógica para Rango (si inicio != fin) o Día (si inicio == fin)
            // Si es un rango, agrupamos por fecha para mostrar evolución diaria
            if ($fechaInicio !== $fechaFin) {
                $query = "SELECT 
                            fecha, 
                            $cols_agregadas
                          FROM liquidaciones 
                          WHERE empleado_id = :id 
                          AND fecha BETWEEN :inicio AND :fin
                          GROUP BY fecha
                          ORDER BY fecha ASC";
            } else {
                // Lógica de un solo día (detalle por registro/hora si se quiere, 
                // pero el gráfico parece esperar array de puntos. 
                // El código original para 'dia' devolvía registros individuales por hora).
                $query = "SELECT 
                            hora as fecha, 
                            monto_efectivo as total_efectivo,
                            COALESCE(propinas, 0) as total_propinas,
                            gastos_total as total_gastos,
                            (monto_efectivo - gastos_total) as neto,
                            viajes as total_viajes 
                          FROM liquidaciones 
                          WHERE empleado_id = :id 
                          AND fecha = :inicio
                          ORDER BY hora ASC";
            }
            break;
    }

    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    
    // Bindings condicionales
    if ($periodo === 'dia' || $periodo === 'default') {
        if ($fechaInicio !== $fechaFin) {
            $stmt->bindParam(':inicio', $fechaInicio);
            $stmt->bindParam(':fin', $fechaFin); 
        } else {
            $stmt->bindParam(':inicio', $fechaInicio);
        }
    }
    
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Si ordenamos DESC en SQL para obtener los últimos registros,
    // debemos invertir el array final para mostrarlo cronológicamente (antiguo -> nuevo)
    if ($periodo !== 'dia') {
        $data = array_reverse($data);
    }

    $procesados = array_map(function($item) {
        $item["total_efectivo"] = (float)$item['total_efectivo'];
        $item["total_propinas"] = (float)$item['total_propinas'];
        $item["total_gastos"] = (float)$item['total_gastos'];
        $item["neto"] = (float)$item['neto'];
        $item["total_viajes"] = (int)$item['total_viajes'];
        return $item;
    }, $data);

    echo json_encode($procesados);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}