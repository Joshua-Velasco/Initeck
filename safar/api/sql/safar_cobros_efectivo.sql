-- Tabla para registrar cobros de efectivo en viajes Safar
-- Esta tabla permite reconciliar lo que el chofer cobró vs lo que el sistema dice que debía cobrar

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
