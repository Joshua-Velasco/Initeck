-- =========================================================
-- MIGRACIÓN: Soporte para Corte de Caja en nomina_tickets
-- Ejecutar en la base de datos initeckc_tracker
-- Fecha: 2026-04-08
-- =========================================================

-- Agregar campo 'tipo' para distinguir entre 'nomina' y 'corte_caja'
ALTER TABLE nomina_tickets
  ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) NOT NULL DEFAULT 'nomina' AFTER empleado_id;

-- Agregar campo 'diferencia' (total_registrado_app - total_recibido, positivo = deuda)
ALTER TABLE nomina_tickets
  ADD COLUMN IF NOT EXISTS diferencia DECIMAL(10,2) NULL DEFAULT 0 AFTER total_pago;

-- Agregar campo 'deuda_anterior' (deuda acumulada de períodos previos)
ALTER TABLE nomina_tickets
  ADD COLUMN IF NOT EXISTS deuda_anterior DECIMAL(10,2) NULL DEFAULT 0 AFTER diferencia;

-- Índice para consultas de cortes por tipo y empleado
ALTER TABLE nomina_tickets
  ADD INDEX IF NOT EXISTS idx_tipo_empleado (tipo, empleado_id);

-- Verificar resultado
DESCRIBE nomina_tickets;
