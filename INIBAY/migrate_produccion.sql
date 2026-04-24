-- ============================================================
--  INIBAY — MIGRACIÓN COMPLETA PARA PRODUCCIÓN
--  Base de datos: initeckc_streaming (hospedando.mx)
--  Ejecutar en phpMyAdmin → pestaña "SQL"
--  Seguro para ejecutar más de una vez (IF NOT EXISTS / IF EXISTS)
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1. TABLA servicios_tv  (puede no existir en producción)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `servicios_tv` (
  `id`             int(11)         NOT NULL AUTO_INCREMENT,
  `nombre`         varchar(100)    NOT NULL,
  `slug`           varchar(50)     NOT NULL,
  `icono`          varchar(50)     DEFAULT 'Tv',
  `costo_default`  decimal(10,2)   DEFAULT 250.00,
  `fecha_creacion` timestamp       NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Servicios base (INSERT IGNORE para no duplicar si ya existen)
INSERT IGNORE INTO `servicios_tv` (`id`, `nombre`, `slug`, `icono`, `costo_default`) VALUES
(1, 'Elite TV',     'ELITE',  'Tv',          250.00),
(2, 'Future TV',    'FUTURE', 'MonitorPlay',  220.00),
(3, 'Inibay Plus',  'PLUS',   'Tv',           200.00);

-- ------------------------------------------------------------
-- 2. TABLA inventario  (puede no existir en producción)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inventario` (
  `id`           int(11)      NOT NULL AUTO_INCREMENT,
  `part_number`  varchar(50)  NOT NULL,
  `categoria`    varchar(20)  NOT NULL,
  `estado`       varchar(20)  NOT NULL DEFAULT 'nuevo',
  `fecha_ingreso` date        NOT NULL,
  `detalles`     text         DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ------------------------------------------------------------
-- 3. TABLA suscripciones — columnas y tipo faltantes
-- ------------------------------------------------------------

-- 3a. Cambiar tipo_servicio de ENUM a VARCHAR para soportar
--     servicios futuros más allá de ELITE/FUTURE
ALTER TABLE `suscripciones`
  MODIFY `tipo_servicio` varchar(50) NOT NULL DEFAULT 'ELITE';

-- 3b. Columna vip (clientes vitalicios con fecha de cobro pero sin corte)
ALTER TABLE `suscripciones`
  ADD COLUMN IF NOT EXISTS `vip` tinyint(1) NOT NULL DEFAULT 0 AFTER `costo`;

-- ------------------------------------------------------------
-- 4. TABLA pagos — columnas de tracking real de cobros
-- ------------------------------------------------------------

-- 4a. Fecha real en que se realizó el cobro
ALTER TABLE `pagos`
  ADD COLUMN IF NOT EXISTS `fecha_pago` date DEFAULT NULL
    COMMENT 'Fecha real del cobro'
  AFTER `pagado`;

-- 4b. Monto cobrado (puede diferir del costo base del servicio)
ALTER TABLE `pagos`
  ADD COLUMN IF NOT EXISTS `monto` decimal(10,2) DEFAULT NULL
    COMMENT 'Monto real cobrado'
  AFTER `fecha_pago`;

-- 4c. Nota libre del cobro
ALTER TABLE `pagos`
  ADD COLUMN IF NOT EXISTS `nota` varchar(255) DEFAULT NULL
    COMMENT 'Observación opcional'
  AFTER `monto`;

-- 4d. Rellenar fecha_pago y monto en registros existentes que no tengan valor
--     Usa el 1er día del mes del pago como fecha y el costo del servicio como monto
UPDATE `pagos` p
  JOIN `suscripciones` s ON p.suscripcion_id = s.id
SET
  p.fecha_pago = CONCAT(p.anio, '-', LPAD(p.mes, 2, '0'), '-01'),
  p.monto      = s.costo
WHERE p.pagado = 1
  AND p.fecha_pago IS NULL;

-- ------------------------------------------------------------
-- 5. ÍNDICES para consultas rápidas
-- ------------------------------------------------------------

-- Índice en pagos(mes, anio) — evita full scan en cobros del mes
ALTER TABLE `pagos`
  ADD INDEX IF NOT EXISTS `idx_mes_anio` (`mes`, `anio`);

-- Índice en pagos(suscripcion_id, mes, anio) — para check de pago duplicado
ALTER TABLE `pagos`
  ADD INDEX IF NOT EXISTS `idx_sub_mes_anio` (`suscripcion_id`, `mes`, `anio`);

-- Índice en suscripciones(estatus) — para filtros activos/inactivos
ALTER TABLE `suscripciones`
  ADD INDEX IF NOT EXISTS `idx_estatus` (`estatus`);

-- Índice en suscripciones(tipo_servicio, estatus)
ALTER TABLE `suscripciones`
  ADD INDEX IF NOT EXISTS `idx_tipo_estatus` (`tipo_servicio`, `estatus`);

-- ------------------------------------------------------------
-- 6. CORRECCIÓN DE DATOS — suscripciones sin fecha_renovacion
--    (26 registros con NULL — el sistema no puede calcular su estado)
--    Se estima fecha_renovacion = fecha_activacion + meses_activos
-- ------------------------------------------------------------
UPDATE `suscripciones`
SET `fecha_renovacion` = DATE_ADD(`fecha_activacion`, INTERVAL `meses_activos` MONTH)
WHERE `fecha_renovacion` IS NULL
  AND `fecha_activacion` IS NOT NULL
  AND `meses_activos` IS NOT NULL
  AND `meses_activos` > 0;

-- ------------------------------------------------------------
-- 7. VERIFICACIÓN FINAL — muestra resumen de la BD después
--    de la migración (solo informativo)
-- ------------------------------------------------------------
SELECT 'clientes'     AS tabla, COUNT(*) AS registros FROM `clientes`
UNION ALL
SELECT 'suscripciones',          COUNT(*) FROM `suscripciones`
UNION ALL
SELECT 'suscripciones activas',  COUNT(*) FROM `suscripciones` WHERE estatus = 1
UNION ALL
SELECT 'suscripciones inactivas',COUNT(*) FROM `suscripciones` WHERE estatus = 0
UNION ALL
SELECT 'suscripciones vip',      COUNT(*) FROM `suscripciones` WHERE vip = 1
UNION ALL
SELECT 'pagos',                  COUNT(*) FROM `pagos`
UNION ALL
SELECT 'pagos sin monto',        COUNT(*) FROM `pagos` WHERE monto IS NULL AND pagado = 1
UNION ALL
SELECT 'servicios_tv',           COUNT(*) FROM `servicios_tv`
UNION ALL
SELECT 'inventario',             COUNT(*) FROM `inventario`
UNION ALL
SELECT 'usuarios_admin',         COUNT(*) FROM `usuarios_admin`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
--  FIN DE MIGRACIÓN
--  Si el SELECT final muestra valores coherentes, todo OK.
--  "pagos sin monto" debería ser 0.
-- ============================================================
