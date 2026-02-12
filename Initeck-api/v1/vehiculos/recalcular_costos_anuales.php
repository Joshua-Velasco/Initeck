<?php
/**
 * Script para recalcular y actualizar los costos anuales de todos los vehículos
 * basándose en los montos y períodos configurados
 */

require_once __DIR__ . '/../../config/database.php';

$database = new Database();
$db = $database->getConnection();

function calcularAnual($monto, $periodo)
{
    $num = floatval($monto);

    switch ($periodo) {
        case 'semanal':
            return $num * 52;
        case 'mensual':
            return $num * 12;
        case 'cuatrimestral':
            return $num * 3;
        case 'semestral':
            return $num * 2;
        case 'anual':
        default:
            return $num;
    }
}

try {
    // Obtener todos los vehículos
    $sql = "SELECT id, unidad_nombre,
            costo_seguro_monto, costo_seguro_periodo,
            costo_deducible_seguro_monto, costo_deducible_seguro_periodo,
            costo_gasolina_monto, costo_gasolina_periodo,
            costo_aceite_monto, costo_aceite_periodo,
            costo_ecologico_monto, costo_ecologico_periodo,
            costo_placas_monto, costo_placas_periodo,
            costo_servicio_general_monto, costo_servicio_general_periodo,
            costo_llantas_monto, costo_llantas_periodo,
            costo_tuneup_monto, costo_tuneup_periodo,
            costo_frenos_monto, costo_frenos_periodo,
            costo_lavado_monto, costo_lavado_periodo
    FROM vehiculos";

    $stmt = $db->query($sql);
    $vehiculos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $actualizados = 0;

    foreach ($vehiculos as $vehiculo) {
        $id = $vehiculo['id'];

        // Calcular todos los costos anuales
        $seguro_anual = calcularAnual($vehiculo['costo_seguro_monto'], $vehiculo['costo_seguro_periodo']);
        $deducible_anual = calcularAnual($vehiculo['costo_deducible_seguro_monto'], $vehiculo['costo_deducible_seguro_periodo']);
        $gasolina_anual = calcularAnual($vehiculo['costo_gasolina_monto'], $vehiculo['costo_gasolina_periodo']);
        $aceite_anual = calcularAnual($vehiculo['costo_aceite_monto'], $vehiculo['costo_aceite_periodo']);
        $ecologico_anual = calcularAnual($vehiculo['costo_ecologico_monto'], $vehiculo['costo_ecologico_periodo']);
        $placas_anual = calcularAnual($vehiculo['costo_placas_monto'], $vehiculo['costo_placas_periodo']);
        $servicio_anual = calcularAnual($vehiculo['costo_servicio_general_monto'], $vehiculo['costo_servicio_general_periodo']);
        $llantas_anual = calcularAnual($vehiculo['costo_llantas_monto'], $vehiculo['costo_llantas_periodo']);
        $tuneup_anual = calcularAnual($vehiculo['costo_tuneup_monto'], $vehiculo['costo_tuneup_periodo']);
        $frenos_anual = calcularAnual($vehiculo['costo_frenos_monto'], $vehiculo['costo_frenos_periodo']);
        $lavado_anual = calcularAnual($vehiculo['costo_lavado_monto'], $vehiculo['costo_lavado_periodo']);

        // Actualizar el vehículo
        $updateSql = "UPDATE vehiculos SET
            costo_seguro_anual = :seguro,
            costo_deducible_seguro_anual = :deducible,
            costo_gasolina_anual = :gasolina,
            costo_aceite_anual = :aceite,
            costo_ecologico_anual = :ecologico,
            costo_placas_anual = :placas,
            costo_servicio_general_anual = :servicio,
            costo_llantas_anual = :llantas,
            costo_tuneup_anual = :tuneup,
            costo_frenos_anual = :frenos,
            costo_lavado_anual = :lavado
        WHERE id = :id";

        $updateStmt = $db->prepare($updateSql);
        $updateStmt->execute([
            ':seguro' => $seguro_anual,
            ':deducible' => $deducible_anual,
            ':gasolina' => $gasolina_anual,
            ':aceite' => $aceite_anual,
            ':ecologico' => $ecologico_anual,
            ':placas' => $placas_anual,
            ':servicio' => $servicio_anual,
            ':llantas' => $llantas_anual,
            ':tuneup' => $tuneup_anual,
            ':frenos' => $frenos_anual,
            ':lavado' => $lavado_anual,
            ':id' => $id
        ]);

        $total_anual = $seguro_anual + $deducible_anual + $gasolina_anual + $aceite_anual +
            $ecologico_anual + $placas_anual + $servicio_anual + $llantas_anual +
            $tuneup_anual + $frenos_anual + $lavado_anual;

        if ($total_anual > 0) {
            echo "✅ {$vehiculo['unidad_nombre']}: $" . number_format($total_anual, 2) . " anuales\n";
            $actualizados++;
        }
    }

    echo "\n🎉 Se actualizaron {$actualizados} vehículos con costos configurados.\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
