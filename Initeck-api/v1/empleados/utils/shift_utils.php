<?php
/**
 * Determina la fecha lógica de operación basada en el horario asignado del empleado.
 * Solo aplica "día anterior" si se cumplen AMBAS condiciones:
 *   1. La hora actual es anterior a la hora de entrada del empleado.
 *   2. La hora actual es anterior a las 04:00 AM (umbral de seguridad de madrugada).
 * Esto evita que registros diurnos normales sean asignados al día previo.
 *
 * @param PDO $pdo Conexión a base de datos
 * @param int $empleado_id ID del empleado
 * @return string Fecha en formato Y-m-d
 */
function getLogicalDate($pdo, $empleado_id) {
    try {
        $stmt = $pdo->prepare("SELECT horario_entrada FROM empleados WHERE id = ?");
        $stmt->execute([$empleado_id]);
        $horario = $stmt->fetch(PDO::FETCH_ASSOC);

        $defaultDate = date('Y-m-d');

        if (!$horario || !$horario['horario_entrada']) {
            return $defaultDate;
        }

        // Convertir horas a segundos del día para comparación numérica exacta
        $partsActual  = explode(':', date('H:i:s'));
        $partsEntrada = explode(':', $horario['horario_entrada']);

        $segsActual  = (int)($partsActual[0]  ?? 0) * 3600 + (int)($partsActual[1]  ?? 0) * 60 + (int)($partsActual[2]  ?? 0);
        $segsEntrada = (int)($partsEntrada[0] ?? 0) * 3600 + (int)($partsEntrada[1] ?? 0) * 60 + (int)($partsEntrada[2] ?? 0);

        // Umbral de madrugada: 04:00 AM = 14400 segundos
        $umbralMadrugada = 4 * 3600;

        // Solo retroceder un día si estamos en plena madrugada (antes de las 04:00)
        // Y además antes de la hora de entrada del empleado.
        // Ejemplo de turno nocturno válido: entrada 20:00, hora actual 01:30 → retrocede.
        // Ejemplo de turno diurno: entrada 08:00, hora actual 10:30 → NO retrocede.
        if ($segsActual < $umbralMadrugada && $segsActual < $segsEntrada) {
            return date('Y-m-d', strtotime('-1 day'));
        }

        return $defaultDate;

    } catch (Exception $e) {
        return date('Y-m-d');
    }
}
?>
