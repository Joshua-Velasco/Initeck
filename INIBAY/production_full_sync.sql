-- ==========================================================
-- SCRIPT DE SINCRONIZACIÓN COMPLETA - INIBAY PRODUCCIÓN
-- ==========================================================
-- Este script soluciona el error 500 y activa todas las nuevas funciones.
-- Ejecuta este código en la pestaña "SQL" de phpMyAdmin en producción.

-- 1. Crear tabla de Usuarios Admin (Si no existe)
CREATE TABLE IF NOT EXISTS `usuarios_admin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Crear tabla de Servicios/Módulos
CREATE TABLE IF NOT EXISTS `servicios_tv` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `icono` varchar(50) DEFAULT 'Tv',
  `costo_default` decimal(10,2) DEFAULT 250.00,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Insertar datos iniciales de servicios (Esto corrige el Error 500)
INSERT IGNORE INTO `servicios_tv` (`id`, `nombre`, `slug`, `icono`, `costo_default`) VALUES
(1, 'Elite TV', 'ELITE', 'Tv', 250.00),
(2, 'Future TV', 'FUTURE', 'MonitorPlay', 220.00),
(3, 'Inibay Plus', 'PLUS', 'Tv', 200.00);

-- 4. Actualizar tabla 'suscripciones'
-- a) Cambiar tipo_servicio de ENUM a VARCHAR (para soportar nuevos módulos como PLUS)
ALTER TABLE `suscripciones` MODIFY `tipo_servicio` varchar(50) DEFAULT 'ELITE';

-- b) Agregar columna 'vip' (Si no existe)
-- Nota: Si sale error porque ya existe, puedes ignorarlo o comentar la línea.
ALTER TABLE `suscripciones` ADD COLUMN IF NOT EXISTS `vip` tinyint(1) DEFAULT 0 AFTER `costo`;

-- 5. Crear tabla de Inventario
CREATE TABLE IF NOT EXISTS `inventario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `part_number` varchar(50) NOT NULL,
  `categoria` varchar(20) NOT NULL,
  `estado` varchar(20) NOT NULL,
  `fecha_ingreso` date NOT NULL,
  `detalles` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
