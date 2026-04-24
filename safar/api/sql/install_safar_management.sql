-- Script de instalación completo para el sistema de gestión Safar mejorado
-- Ejecutar este script en la base de datos initeckc_tracker

-- =============================================
-- 1. TABLA DE COBROS DE EFECTIVO
-- =============================================
CREATE TABLE IF NOT EXISTS `safar_cobros_efectivo` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_orden_servicio` INT NOT NULL,
  `codigo_chofer` VARCHAR(50) NOT NULL,
  `monto_cobrado` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `monto_esperado` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `metodo_pago_orig` VARCHAR(50) NOT NULL,
  `fecha_cobro` DATETIME NOT NULL,
  `incidencia` ENUM('NINGUNA', 'PAGADO_PREVIAMENTE', 'CLIENTE_NO_PAGO', 'CLIENTE_RECHAZO', 'MONTO_INCORRECTO', 'OTRO') DEFAULT 'NINGUNA',
  `observaciones` TEXT NULL,
  `registrado_por` VARCHAR(50) NULL,
  `fecha_registro` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_chofer_fecha (`codigo_chofer`, `fecha_cobro`),
  INDEX idx_orden (`id_orden_servicio`),
  INDEX idx_fecha (`fecha_cobro`),
  INDEX idx_incidencia (`incidencia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. TABLA DE CAPACIDAD DE CHOFERES (opcional, para config)
-- =============================================
CREATE TABLE IF NOT EXISTS `safar_chofer_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `codigo_chofer` VARCHAR(50) NOT NULL UNIQUE,
  `max_viajes_simultaneos` INT NOT NULL DEFAULT 3,
  `ventana_minutos` INT NOT NULL DEFAULT 90,
  `activo` TINYINT(1) DEFAULT 1,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_chofer (`codigo_chofer`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar config por defecto para todos los choferes existentes
INSERT IGNORE INTO `safar_chofer_config` (`codigo_chofer`, `max_viajes_simultaneos`, `ventana_minutos`)
SELECT DISTINCT dca.CodigoUsuarioChofer, 3, 90
FROM safar_DestinoChoferAsignado dca
WHERE dca.CodigoUsuarioChofer IS NOT NULL
ON DUPLICATE KEY UPDATE max_viajes_simultaneos = max_viajes_simultaneos;

-- =============================================
-- 3. VERIFICAR ESTRUCTURA DE TABLAS EXISTENTES
-- =============================================
-- La tabla safar_OrdenServicio debe tener:
-- IdOrdenServicio, Folio, FechaProgramadaInicio, MontoBase, MontoFinal, MontoDeposito
-- MetodoPago, EstatusPago, CodigoEstatus, Distancia, TiempoEstimado

-- La tabla safar_DestinoChoferAsignado debe tener:
-- IdDestino, CodigoUsuarioChofer, FechaAsignacion, FechaFinAsignacion

-- =============================================
-- 4. INDICES ADICIONALES PARA RENDIMIENTO
-- =============================================
-- Agregar índices si no existen en tablas existentes
ALTER TABLE `safar_OrdenServicio` ADD INDEX IF NOT EXISTS `idx_estatus_fecha` (`CodigoEstatus`, `FechaProgramadaInicio`);
ALTER TABLE `safar_DestinoChoferAsignado` ADD INDEX IF NOT EXISTS `idx_chofer_fecha` (`CodigoUsuarioChofer`, `FechaAsignacion`);

-- Mensaje de confirmación
SELECT 'Instalación completada. Tablas creadas y configuraciones aplicadas.' AS mensaje;
