<?php
/**
 * Utility to provide unified date filtering logic based on the 04:00:00 operational day shift.
 */

/**
 * Returns the WHERE clause and parameters for filtering by operational day (04:00 AM shift).
 * 
 * @param string $fechaInicio Y-m-d
 * @param string $fechaFin Y-m-d
 * @param string $alias Table alias (e.g., 'l')
 * @return array ['where' => string, 'params' => array]
 */
function getOperationalDayFilter($fechaInicio, $fechaFin, $alias = 'l')
{
    // Siempre expandimos el rango al día siguiente del final 
    // para asegurar que el día 'fin' sea inclusivo hasta las 04:00 AM del día posterior.
    $fechaFin = date('Y-m-d', strtotime($fechaFin . ' +1 day'));

    $where = "({$alias}.fecha > :fi1 OR ({$alias}.fecha = :fi2 AND {$alias}.hora >= '04:00:00'))
              AND ({$alias}.fecha < :ff1 OR ({$alias}.fecha = :ff2 AND {$alias}.hora < '04:00:00'))";

    $params = [
        ':fi1' => $fechaInicio,
        ':fi2' => $fechaInicio,
        ':ff1' => $fechaFin,
        ':ff2' => $fechaFin
    ];

    return ['where' => $where, 'params' => $params];
}

/**
 * Specifically for queries that use BETWEEN for simplicity but need to be aligned 
 * if they don't have 'hora' column or when we want to keep it simple.
 * However, the 04:00 AM shift is the standard for this app.
 */
function getOperationalDayParams($fechaInicio, $fechaFin)
{
    return [
        ':fi1' => $fechaInicio,
        ':fi2' => $fechaInicio,
        ':ff1' => $fechaFin,
        ':ff2' => $fechaFin
    ];
}
?>