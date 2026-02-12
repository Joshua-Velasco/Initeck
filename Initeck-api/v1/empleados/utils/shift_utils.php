<?php
/**
 * Determina la fecha lógica de operación basada en el horario asignado del empleado.
 * Útil para turnos nocturnos que cruzan la medianoche.
 * 
 * @param PDO $pdo Conexión a base de datos
 * @param int $empleado_id ID del empleado
 * @return string Fecha en formato Y-m-d
 */
function getLogicalDate($pdo, $empleado_id) {
    try {
        $stmt = $pdo->prepare("SELECT horario_entrada, horario_salida FROM empleados WHERE id = ?");
        $stmt->execute([$empleado_id]);
        $horario = $stmt->fetch(PDO::FETCH_ASSOC);

        $defaultDate = date('Y-m-d');
        
        if (!$horario || !$horario['horario_entrada']) {
            return $defaultDate;
        }

        $entrada = $horario['horario_entrada'];
        $horaActual = date('H:i:s');

        // Lógica de Turno Nocturno/Madrugada
        // Si la hora actual es menor a la hora de entrada, asumimos que 
        // pertenece a la jornada que inició el día anterior.
        // Ejemplo: Entrada 20:00. Hora actual 02:00. 02:00 < 20:00 -> Es día anterior.
        // Ejemplo: Entrada 08:00. Hora actual 10:00. 10:00 < 08:00 -> Falso. Es hoy.
        if ($horaActual < $entrada) {
            return date('Y-m-d', strtotime('-1 day'));
        }

        return $defaultDate;

    } catch (Exception $e) {
        return date('Y-m-d');
    }
}
?>
