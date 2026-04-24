-- Migración: Agregar columnas de tracking real a tabla pagos
-- Ejecutar una sola vez en producción

ALTER TABLE pagos
  ADD COLUMN IF NOT EXISTS fecha_pago DATE NULL COMMENT 'Fecha real en que se realizó el cobro',
  ADD COLUMN IF NOT EXISTS monto DECIMAL(10,2) NULL COMMENT 'Monto cobrado (puede diferir del costo base)',
  ADD COLUMN IF NOT EXISTS nota VARCHAR(255) NULL COMMENT 'Observación opcional del cobro';

-- Rellenar fecha_pago y monto en registros existentes con valores por defecto
UPDATE pagos p
JOIN suscripciones s ON p.suscripcion_id = s.id
SET
  p.fecha_pago = CONCAT(p.anio, '-', LPAD(p.mes, 2, '0'), '-01'),
  p.monto = s.costo
WHERE p.fecha_pago IS NULL AND p.pagado = 1;

-- Eliminar duplicados antes de agregar restricción única
-- (conserva el registro con id más bajo de cada combinación duplicada)
DELETE p1 FROM pagos p1
INNER JOIN pagos p2
  ON p1.suscripcion_id = p2.suscripcion_id
 AND p1.mes  = p2.mes
 AND p1.anio = p2.anio
 AND p1.id > p2.id;

-- Restricción única: solo un pago registrado por suscripción/mes/año
ALTER TABLE pagos
  ADD UNIQUE KEY uq_pago_mes (suscripcion_id, mes, anio);
