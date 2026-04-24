-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 06-04-2026 a las 13:46:15
-- Versión del servidor: 11.4.10-MariaDB-cll-lve-log
-- Versión de PHP: 8.4.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `initeckc_streaming`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `no_cliente` varchar(50) DEFAULT NULL,
  `nombre` varchar(150) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id`, `no_cliente`, `nombre`, `telefono`) VALUES
(1, 'ELITE10001', 'ROCIO GALLEGOS', '656 135 5355'),
(2, 'ELITE10002', 'JOSE FABRIKO', '656 743 4655'),
(3, 'ELITE10003', 'HERMANO JHONNY', ''),
(4, 'ELITE10004', 'SARAI GUIJARRO', '657 214 3546'),
(5, 'ELITE10005', 'HERMANO EDGARDO', ''),
(6, 'ELITE10006', 'HERMANO EDGARDO', ''),
(7, 'ELITE10007', 'LUIS LARES', '656 328 4885'),
(8, 'ELITE10008', 'EL VECINO FOTOPRIN', '656 299 9450'),
(9, 'ELITE10009', 'Saúl Guadalupe Carrasco González', '(656) 591-6667'),
(10, 'ELITE10010', 'CONTRERAS VALADEZ', '656 586 2108'),
(11, 'ELITE10011', 'OMAR BARRIENTOS SECO', '656 310-3525'),
(12, 'ELITE10012', 'CONTRERAS VALADEZ', '656 586 2108'),
(13, 'ELITE10013', 'MAYRA', '656 306 0225'),
(14, 'ELITE10014', 'CARLOS PAYAN', '656 101 8157'),
(15, 'ELITE10015', 'IVETH AVITIA RIVERA', '656 129 3225'),
(16, 'ELITE10016', 'ARTURO LEAL', '656 269 4243'),
(17, 'ELITE10017', 'PROFE CETIS', '656 202 2381'),
(18, 'ELITE10018', 'DANIEL NERI', '656 375 2422'),
(19, 'ELITE10019', 'EL VECINO FOTOPRINT E IVAN GAZ PRO', ''),
(20, 'ELITE10020', 'EDGAR NERI', '656 441 5202'),
(21, 'ELITE10021', 'JESUS AVITIA', '1 915 843 7113'),
(22, 'ELITE10022', 'ROCIO SECO', '656 144 1986'),
(23, 'ELITE10023', 'KARLA BUSTAMANTES', '656 769 1586'),
(24, 'ELITE10024', 'BRENDA YANET TREJO', '656 834 1855'),
(25, 'ELITE10025', 'VILLAREAL', '656 670 8181'),
(26, 'ELITE10026', 'ARTURO LEAL', '656 202 2381'),
(27, 'ELITE10027', 'CONTRERAS VALADEZ', '656 586 2108'),
(28, 'ELITE10028', 'DANIEL NERI', '656 375 2422'),
(29, 'ELITE10029', 'CLAUDIA CARRANZA', '656 285 8777'),
(30, 'FUTURE10001', 'RAMON CARRERA', '1 915 407 6023'),
(31, 'FUTURE10002', 'RAMON CARRERA', '1 915 407 6023'),
(32, 'FUTURE10003', 'RAMON CARRERA', '1 915 407 6023'),
(33, 'FUTURE10004', 'RAMON CARRERA', '1 915 407 6023'),
(34, 'FUTURE10005', 'ADRIAN OVALLE (ramon carrera)', '1 915 407 6023'),
(35, 'FUTURE10006', 'DANIEL NERI', '656 375 2422'),
(36, 'FUTURE10007', 'SANDRA CHAVEZ (ramon carrera)', '1 915 407 6023'),
(37, 'FUTURE10008', 'LORENZO DOMINGUEZ(ramon carrera)', '1 915 407 6023'),
(38, 'FUTURE10009', 'DANIEL NERI', '656 375 2422'),
(39, 'FUTURE10010', 'GERRY (Ramon Carrera)', '1 915 407 6023'),
(46, 'TESTPOST1', 'POST TEST', NULL),
(47, 'FUTURE10011', '(RAMON CARRERA)', ''),
(48, 'ELITE10030', 'FLOCELA LOYA', '656 582 6695'),
(49, 'ELITE10031', 'FLOCELA LOYA', '656 582 6695');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `id` int(11) NOT NULL,
  `part_number` varchar(50) NOT NULL,
  `categoria` varchar(20) NOT NULL,
  `estado` varchar(20) NOT NULL,
  `fecha_ingreso` date NOT NULL,
  `detalles` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagos`
--

CREATE TABLE `pagos` (
  `id` int(11) NOT NULL,
  `suscripcion_id` int(11) DEFAULT NULL,
  `mes` int(11) DEFAULT NULL,
  `anio` int(11) DEFAULT NULL,
  `pagado` tinyint(1) DEFAULT NULL,
  `fecha_pago` date DEFAULT NULL COMMENT 'Fecha real del cobro',
  `monto` decimal(10,2) DEFAULT NULL COMMENT 'Monto real cobrado',
  `nota` varchar(255) DEFAULT NULL COMMENT 'Observación opcional'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pagos`
--

INSERT INTO `pagos` (`id`, `suscripcion_id`, `mes`, `anio`, `pagado`, `fecha_pago`, `monto`, `nota`) VALUES
(7, 1, 3, 2026, 1, '2026-03-31', 250.00, NULL),
(8, 11, 3, 2026, 1, '2026-03-31', 250.00, NULL),
(9, 30, 3, 2026, 1, '2026-03-31', 220.00, NULL),
(10, 31, 3, 2026, 1, '2026-03-31', 220.00, NULL),
(11, 32, 3, 2026, 1, '2026-03-31', 220.00, NULL),
(12, 33, 3, 2026, 1, '2026-03-31', 220.00, NULL),
(13, 35, 3, 2026, 1, '2026-03-31', 250.00, NULL),
(14, 38, 3, 2026, 1, '2026-03-31', 250.00, NULL),
(15, 28, 3, 2026, 1, '2026-03-31', 250.00, NULL),
(16, 18, 3, 2026, 1, '2026-03-31', 250.00, NULL),
(17, 20, 3, 2026, 1, '2026-03-31', 250.00, NULL),
(18, 8, 3, 2026, 1, '2026-03-31', 250.00, NULL),
(19, 19, 3, 2026, 1, '2026-03-31', 250.00, NULL),
(20, 17, 4, 2026, 1, '2026-04-01', 250.00, NULL),
(21, 29, 4, 2026, 1, '2026-04-03', 250.00, NULL),
(22, 7, 4, 2026, 1, '2026-04-03', 250.00, NULL),
(23, 26, 4, 2026, 1, '2026-04-06', 250.00, NULL),
(24, 16, 4, 2026, 1, '2026-04-06', 250.00, NULL),
(25, 28, 4, 2026, 1, '2026-04-06', 250.00, NULL),
(26, 20, 4, 2026, 1, '2026-04-06', 250.00, NULL),
(27, 18, 4, 2026, 1, '2026-04-06', 250.00, NULL),
(28, 13, 4, 2026, 1, '2026-04-06', 250.00, NULL),
(29, 36, 4, 2026, 1, '2026-04-06', 220.00, NULL),
(30, 8, 4, 2026, 1, '2026-04-06', 250.00, NULL),
(31, 19, 4, 2026, 1, '2026-04-06', 250.00, NULL),
(32, 11, 4, 2026, 1, '2026-04-06', 250.00, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios_tv`
--

CREATE TABLE `servicios_tv` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `icono` varchar(50) DEFAULT 'Tv',
  `costo_default` decimal(10,2) DEFAULT 250.00,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `servicios_tv`
--

INSERT INTO `servicios_tv` (`id`, `nombre`, `slug`, `icono`, `costo_default`, `fecha_creacion`) VALUES
(1, 'Elite TV', 'ELITE', 'Tv', 250.00, '2026-03-13 17:44:44'),
(2, 'Future TV', 'FUTURE', 'MonitorPlay', 220.00, '2026-03-13 17:44:44'),
(3, 'Inibay Plus', 'PLUS', 'Tv', 200.00, '2026-03-13 17:44:44');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `suscripciones`
--

CREATE TABLE `suscripciones` (
  `id` int(11) NOT NULL,
  `cliente_id` int(11) DEFAULT NULL,
  `tipo_servicio` varchar(50) NOT NULL DEFAULT 'ELITE',
  `estatus` tinyint(1) DEFAULT NULL,
  `demo` tinyint(1) DEFAULT NULL,
  `equipo_1` varchar(50) DEFAULT NULL,
  `tv_1` tinyint(1) DEFAULT NULL,
  `equipo_2` varchar(50) DEFAULT NULL,
  `tv_2` tinyint(1) DEFAULT NULL,
  `detalles` text DEFAULT NULL,
  `fecha_activacion` date DEFAULT NULL,
  `meses_activos` int(11) DEFAULT NULL,
  `fecha_renovacion` date DEFAULT NULL,
  `costo` decimal(10,2) DEFAULT NULL,
  `vip` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `suscripciones`
--

INSERT INTO `suscripciones` (`id`, `cliente_id`, `tipo_servicio`, `estatus`, `demo`, `equipo_1`, `tv_1`, `equipo_2`, `tv_2`, `detalles`, `fecha_activacion`, `meses_activos`, `fecha_renovacion`, `costo`, `vip`) VALUES
(1, 1, 'ELITE', 1, 0, 'FIRE STICK', 1, '', 0, '', '2026-03-27', 1, '2026-05-01', 250.00, 0),
(2, 2, 'ELITE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, '', '2026-03-12', 1, '2026-04-12', 250.00, 0),
(3, 3, 'ELITE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, '', '2026-03-03', 1, '2026-04-03', 250.00, 1),
(4, 4, 'ELITE', 1, 0, 'ROKU', 1, 'ROKU', 1, '', '2026-03-15', 1, '2026-04-15', 250.00, 0),
(5, 5, 'ELITE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, '', '2026-03-03', 1, '2026-04-03', 250.00, 1),
(6, 6, 'ELITE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, '', '2026-03-03', 1, '2026-04-03', 250.00, 1),
(7, 7, 'ELITE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, '', '2026-03-16', 1, '2026-05-03', 250.00, 1),
(8, 8, 'ELITE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, '', '2026-02-15', 1, '2026-06-01', 250.00, 1),
(9, 9, 'ELITE', 0, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, '', '2026-02-03', 1, '2026-03-03', 250.00, 0),
(10, 10, 'ELITE', 1, 0, 'FIRE STICK', 1, 'ROKU', 1, '', '2026-03-03', 1, '2026-04-03', 250.00, 0),
(11, 11, 'ELITE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 0, '', '2026-03-21', 1, '2026-06-01', 250.00, 1),
(12, 12, 'ELITE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, '', '2026-03-03', 1, '2026-04-03', 250.00, 0),
(13, 13, 'ELITE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 0, '', '2026-03-02', 1, '2026-05-06', 250.00, 1),
(14, 14, 'ELITE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 0, '', '2026-03-15', 1, '2026-04-15', 250.00, 0),
(15, 15, 'ELITE', 1, 0, 'FIRE STICK', 1, 'ROKU', 1, '', '2026-03-03', 3, '2026-06-03', 250.00, 0),
(16, 16, 'ELITE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, '', '2026-03-01', 1, '2026-05-06', 250.00, 1),
(17, 17, 'ELITE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, '', '2026-03-01', 1, '2026-05-02', 250.00, 1),
(18, 18, 'ELITE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, '', '2026-03-01', 1, '2026-06-02', 250.00, 1),
(19, 19, 'ELITE', 1, 0, 'FIRE STICK', 1, 'ANDROID', 1, '', '2026-03-01', 1, '2026-06-02', 250.00, 1),
(20, 20, 'ELITE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, '', '2026-03-01', 1, '2026-06-02', 250.00, 1),
(21, 21, 'ELITE', 1, 0, 'FIRE STICK', 1, '', 0, '', '2026-03-20', 1, '2026-04-20', 250.00, 0),
(22, 22, 'ELITE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, '', '2026-03-27', 1, '2026-04-27', 250.00, 1),
(23, 23, 'ELITE', 1, 0, 'FIRE STICK', 1, '', 0, '', '2026-02-03', 1, '2026-03-03', 250.00, 1),
(24, 24, 'ELITE', 1, 0, 'FIRE STICK', 1, 'ROKU', 1, '', '2026-03-18', 1, '2026-04-18', 250.00, 0),
(25, 25, 'ELITE', 1, 0, 'FIRE STICK', 1, '', 0, '', '2026-03-18', 1, '2026-04-18', 250.00, 0),
(26, 26, 'ELITE', 1, 0, 'FIRE STICK', 1, '', 0, '', '2026-03-01', 1, '2026-05-06', 250.00, 1),
(27, 27, 'ELITE', 1, 0, 'FIRE STICK', 1, 'ROKU', 1, '', '2026-03-26', 1, '2026-04-26', 250.00, 0),
(28, 28, 'ELITE', 1, 0, 'FIRE STICK', 1, '', 0, '', '2026-03-21', 1, '2026-06-21', 250.00, 1),
(29, 29, 'ELITE', 1, 0, 'ROKU', 1, 'ROKU', 1, '', '2026-03-01', 1, '2026-05-03', 250.00, 0),
(30, 30, 'FUTURE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, '', '2026-03-16', 1, '2026-05-16', 220.00, 1),
(31, 31, 'FUTURE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, '', '2026-03-05', 1, '2026-05-05', 220.00, 1),
(32, 32, 'FUTURE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, '', '2026-03-05', 1, '2026-05-05', 220.00, 1),
(33, 33, 'FUTURE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, '', '2026-03-05', 1, '2026-05-05', 220.00, 1),
(34, 34, 'FUTURE', 0, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, 'vence hasta el 3  de marzo', '2025-12-03', 3, '2026-03-03', 220.00, 0),
(35, 35, 'FUTURE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, '', '2026-03-01', 1, '2026-05-01', 250.00, 1),
(36, 36, 'FUTURE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, '', '2026-03-03', 1, '2026-05-06', 220.00, 0),
(37, 37, 'FUTURE', 0, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, '', '2025-11-15', 1, '2025-12-15', 220.00, 0),
(38, 38, 'FUTURE', 1, 0, 'FIRE STICK', 0, '', 0, '', '2026-03-01', 1, '2026-05-01', 250.00, 1),
(39, 39, 'FUTURE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 1, '', '2026-01-21', 4, '2026-05-21', 0.00, 0),
(41, 47, 'FUTURE', 1, 0, '', 1, '', 0, '', '2026-03-06', 1, '2026-03-06', 220.00, 0),
(42, 48, 'ELITE', 1, 0, 'FIRE STICK', 1, 'FIRE STICK', 0, '', '2026-03-13', 1, '2026-03-13', 250.00, 1),
(43, 49, 'ELITE', 1, 0, 'FIRE STICK', 1, '', 0, '', '2026-03-13', 1, '2026-03-13', 250.00, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_admin`
--

CREATE TABLE `usuarios_admin` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios_admin`
--

INSERT INTO `usuarios_admin` (`id`, `username`, `password_hash`) VALUES
(1, 'josh', '$2y$10$gdKBTqakmKI3xN0GBaM2j.Qf8yMle4dlobl8bPIU7DUJPORJfm7CS'),
(2, 'joshua', '$2y$10$xb/Y9.ejDeBmzRawj8bGfubuDAifY8.7Kq61MVBnKZTjygAkN5pC.'),
(3, 'Diego ', '$2y$10$E6.4NiyuSe0Mg84Wqqy8Xuon.lJXXxAxNsNscQtIRuGWq9a0zb8aK'),
(4, 'Luis', '$2y$10$KTpBdMMuh/UyTiUii7e3e.kdq4CWtcAnu8Ru4Yh2Q5KhmK2DdbkR2'),
(5, 'JulianG', '$2y$10$vgznPSJljc7NLFYCMXbNdue7tMx5bcvxMM3gTUp5u/i96IzDHx1Nu'),
(6, 'jun2', '$2y$10$w89EyOmu3vbX9na8Oi8aV.WK05pfKlVjbBmMzdYAFI3xA0b32/fHu');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `no_cliente` (`no_cliente`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `suscripcion_id` (`suscripcion_id`),
  ADD KEY `idx_mes_anio` (`mes`,`anio`),
  ADD KEY `idx_sub_mes_anio` (`suscripcion_id`,`mes`,`anio`);

--
-- Indices de la tabla `servicios_tv`
--
ALTER TABLE `servicios_tv`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indices de la tabla `suscripciones`
--
ALTER TABLE `suscripciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cliente_id` (`cliente_id`),
  ADD KEY `idx_estatus` (`estatus`),
  ADD KEY `idx_tipo_estatus` (`tipo_servicio`,`estatus`);

--
-- Indices de la tabla `usuarios_admin`
--
ALTER TABLE `usuarios_admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pagos`
--
ALTER TABLE `pagos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de la tabla `servicios_tv`
--
ALTER TABLE `servicios_tv`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `suscripciones`
--
ALTER TABLE `suscripciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT de la tabla `usuarios_admin`
--
ALTER TABLE `usuarios_admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`suscripcion_id`) REFERENCES `suscripciones` (`id`);

--
-- Filtros para la tabla `suscripciones`
--
ALTER TABLE `suscripciones`
  ADD CONSTRAINT `suscripciones_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
