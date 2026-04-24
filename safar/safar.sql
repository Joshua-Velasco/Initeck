-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 02-03-2026 a las 16:52:38
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `safar`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `AsignacionVehiculo`
--

CREATE TABLE `AsignacionVehiculo` (
  `IdAsignacionV` int(11) NOT NULL,
  `CodigoEmpleado` varchar(50) NOT NULL,
  `CodigoVehiculo` varchar(50) NOT NULL,
  `FechaTurno` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `BitacoraLimpieza`
--

CREATE TABLE `BitacoraLimpieza` (
  `IdLimpieza` int(11) NOT NULL,
  `CodigoVehiculo` varchar(50) NOT NULL,
  `CodigoUsuarioLim` varchar(50) NOT NULL,
  `FechaHora` datetime NOT NULL DEFAULT current_timestamp(),
  `ChecklistAprobado` tinyint(1) NOT NULL,
  `Observaciones` text DEFAULT NULL,
  `UrlFotoEvidencia` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `CatCuenta`
--

CREATE TABLE `CatCuenta` (
  `IdCuenta` int(11) NOT NULL,
  `CodigoCuenta` varchar(50) NOT NULL,
  `NombreCuenta` varchar(100) NOT NULL,
  `NumeroTarjeta` varchar(50) NOT NULL,
  `CLABE` varchar(20) NOT NULL,
  `Banco` varchar(100) NOT NULL,
  `Descripcion` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `CatDescuento`
--

CREATE TABLE `CatDescuento` (
  `IdDescuento` int(11) NOT NULL,
  `CodigoDescuento` varchar(50) NOT NULL,
  `TipoDescuento` varchar(50) NOT NULL,
  `Monto` decimal(37,8) NOT NULL,
  `Activo` tinyint(1) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `CatDireccion`
--

CREATE TABLE `CatDireccion` (
  `IdDireccion` int(11) NOT NULL,
  `CodigoCliente` varchar(50) NOT NULL,
  `Direccion` varchar(250) NOT NULL,
  `Latitud` varchar(100) NOT NULL,
  `Longitud` varchar(100) NOT NULL,
  `UrlDireccion` varchar(250) DEFAULT NULL,
  `Activo` tinyint(1) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `CatEstatus`
--

CREATE TABLE `CatEstatus` (
  `IdEstatus` int(11) NOT NULL,
  `CodigoEstatus` varchar(50) NOT NULL,
  `NombreEstatus` varchar(20) NOT NULL,
  `Activo` tinyint(1) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `CatRol`
--

CREATE TABLE `CatRol` (
  `IdRol` int(11) NOT NULL,
  `CodigoRol` varchar(50) NOT NULL,
  `NombreRol` varchar(100) NOT NULL,
  `Activo` tinyint(1) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `CatSuscripcion`
--

CREATE TABLE `CatSuscripcion` (
  `IdSuscripcion` int(11) NOT NULL,
  `CodigoSuscripcion` varchar(50) NOT NULL,
  `Nombre` varchar(50) NOT NULL,
  `CostoFijo` decimal(12,2) NOT NULL,
  `Periodicidad` varchar(20) NOT NULL,
  `StripePriceId` varchar(255) DEFAULT NULL,
  `Activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `CatTipoServicio`
--

CREATE TABLE `CatTipoServicio` (
  `IdTipoServicio` int(11) NOT NULL,
  `CodigoTipoServicio` varchar(50) NOT NULL,
  `TipoServicio` varchar(100) NOT NULL,
  `Descripcion` varchar(100) DEFAULT NULL,
  `Activo` tinyint(1) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `CatVehiculo`
--

CREATE TABLE `CatVehiculo` (
  `IdVehiculo` int(11) NOT NULL,
  `CodigoVehiculo` varchar(50) NOT NULL,
  `TipoVehiculo` varchar(50) NOT NULL,
  `CapacidadCargaKg` decimal(10,2) NOT NULL,
  `VolumenM3` decimal(10,2) NOT NULL,
  `Modelo` varchar(100) DEFAULT NULL,
  `Activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Cliente`
--

CREATE TABLE `Cliente` (
  `IdCliente` int(11) NOT NULL,
  `CodigoCliente` varchar(50) NOT NULL,
  `CodigoUsuario` varchar(50) NOT NULL,
  `Descripcion` varchar(100) DEFAULT NULL,
  `Activo` tinyint(1) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `DestinoChoferAsignado`
--

CREATE TABLE `DestinoChoferAsignado` (
  `IdAsignacion` int(11) NOT NULL,
  `CodigoUsuarioChofer` varchar(50) NOT NULL,
  `IdDestino` int(11) NOT NULL,
  `FechaAsignacion` datetime NOT NULL,
  `FechaFinAsignacion` datetime NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `DestinoServicio`
--

CREATE TABLE `DestinoServicio` (
  `IdDestino` int(11) NOT NULL,
  `IdOrdenServicio` int(11) NOT NULL,
  `Secuencia` int(11) NOT NULL,
  `DireccionOrigen` varchar(250) NOT NULL,
  `LatitudOrigen` varchar(100) NOT NULL,
  `LongitudOrigen` varchar(100) NOT NULL,
  `DireccionDestino` varchar(250) NOT NULL,
  `LatitudDestino` varchar(100) NOT NULL,
  `LongitudDestino` varchar(100) NOT NULL,
  `FechaInicioReal` datetime NOT NULL,
  `FechaFinReal` datetime NOT NULL,
  `CodigoEstatus` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `DetalleEntrega`
--

CREATE TABLE `DetalleEntrega` (
  `IdDetalleEntrega` int(11) NOT NULL,
  `Descripcion` varchar(100) NOT NULL,
  `PesoKg` decimal(37,8) NOT NULL,
  `TamanioCm` varchar(20) NOT NULL,
  `DireccionEntrega` varchar(250) NOT NULL,
  `FechaEntrega` datetime NOT NULL,
  `CodigoEstatus` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Empleado`
--

CREATE TABLE `Empleado` (
  `IdEmpleado` int(11) NOT NULL,
  `CodigoEmpleado` varchar(50) NOT NULL,
  `CodigoUsuario` varchar(50) NOT NULL,
  `CURP` varchar(18) NOT NULL,
  `NumeroINE` varchar(50) NOT NULL,
  `Direccion` varchar(250) NOT NULL,
  `RFC` varchar(15) NOT NULL,
  `UrlLicencia` varchar(250) NOT NULL,
  `Activo` tinyint(1) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `CurrentH3Index` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `FavoritoChofer`
--

CREATE TABLE `FavoritoChofer` (
  `IdFavorito` int(11) NOT NULL,
  `CodigoUsuarioCli` varchar(50) NOT NULL,
  `CodigoUsuarioCho` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Grupo`
--

CREATE TABLE `Grupo` (
  `IdGrupo` int(11) NOT NULL,
  `CodigoGrupo` varchar(50) NOT NULL,
  `NombreGrupo` varchar(100) NOT NULL,
  `Descripcion` varchar(50) DEFAULT NULL,
  `Activo` tinyint(1) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `GrupoRol`
--

CREATE TABLE `GrupoRol` (
  `IdGrupoRol` int(11) NOT NULL,
  `CodigoGrupo` varchar(50) NOT NULL,
  `CodigoRol` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `GrupoUsuario`
--

CREATE TABLE `GrupoUsuario` (
  `IdGrupoUsuario` int(11) NOT NULL,
  `CodigoGrupo` varchar(50) NOT NULL,
  `CodigoUsuario` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `OrdenServicio`
--

CREATE TABLE `OrdenServicio` (
  `IdOrdenServicio` int(11) NOT NULL,
  `Folio` varchar(50) NOT NULL,
  `CodigoUsuarioCliente` varchar(50) NOT NULL,
  `FechaProgramadaInicio` datetime NOT NULL,
  `FechaProgramadaFin` datetime DEFAULT NULL,
  `CodigoEstatus` varchar(50) DEFAULT NULL,
  `CodigoTipoServicio` varchar(50) DEFAULT NULL,
  `MontoBase` decimal(37,8) NOT NULL,
  `CodigoDescuento` varchar(50) NOT NULL,
  `MontoFinal` decimal(37,8) NOT NULL,
  `Descripcion` varchar(100) DEFAULT NULL,
  `Observaciones` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `PagoServicio`
--

CREATE TABLE `PagoServicio` (
  `IdPago` int(11) NOT NULL,
  `IdOrdenServicio` int(11) NOT NULL,
  `MontoPagado` decimal(37,8) NOT NULL,
  `UrlComprobante` varchar(250) DEFAULT NULL,
  `FechaPago` datetime NOT NULL,
  `CodigoCuenta` varchar(50) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `StripePaymentIntentId` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Persona`
--

CREATE TABLE `Persona` (
  `IdPersona` int(11) NOT NULL,
  `CodigoPersona` varchar(50) NOT NULL,
  `NombrePersona` varchar(100) NOT NULL,
  `Correo` varchar(250) NOT NULL,
  `Telefono` varchar(50) NOT NULL,
  `UrlINE` varchar(250) NOT NULL,
  `Activo` tinyint(1) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `RutaPropuesta`
--

CREATE TABLE `RutaPropuesta` (
  `IdRuta` int(11) NOT NULL,
  `IdOrdenServicio` int(11) NOT NULL,
  `GeoJSON_Ruta` longtext NOT NULL,
  `EsRutaUsuario` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Usuario`
--

CREATE TABLE `Usuario` (
  `IdUsuario` int(11) NOT NULL,
  `CodigoUsuario` varchar(50) NOT NULL,
  `NombreUsuario` varchar(100) NOT NULL,
  `Contraseña` varchar(80) NOT NULL,
  `CodigoPersona` varchar(50) NOT NULL,
  `Activo` tinyint(1) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `StripeCustomerId` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `UsuarioSuscripcion`
--

CREATE TABLE `UsuarioSuscripcion` (
  `IdUsuarioSuscripcion` int(11) NOT NULL,
  `CodigoUsuario` varchar(50) NOT NULL,
  `CodigoSuscripcion` varchar(50) NOT NULL,
  `FechaInicio` datetime NOT NULL,
  `FechaFin` datetime NOT NULL,
  `StripeSubscriptionId` varchar(255) DEFAULT NULL,
  `EstatusPago` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `AsignacionVehiculo`
--
ALTER TABLE `AsignacionVehiculo`
  ADD PRIMARY KEY (`IdAsignacionV`),
  ADD KEY `FK_Asignacion_Empleado` (`CodigoEmpleado`),
  ADD KEY `FK_Asignacion_Vehiculo` (`CodigoVehiculo`);

--
-- Indices de la tabla `BitacoraLimpieza`
--
ALTER TABLE `BitacoraLimpieza`
  ADD PRIMARY KEY (`IdLimpieza`),
  ADD KEY `FK_Limpieza_Vehiculo` (`CodigoVehiculo`);

--
-- Indices de la tabla `CatCuenta`
--
ALTER TABLE `CatCuenta`
  ADD PRIMARY KEY (`CodigoCuenta`),
  ADD UNIQUE KEY `IdCuenta` (`IdCuenta`);

--
-- Indices de la tabla `CatDescuento`
--
ALTER TABLE `CatDescuento`
  ADD PRIMARY KEY (`CodigoDescuento`),
  ADD UNIQUE KEY `IdDescuento` (`IdDescuento`);

--
-- Indices de la tabla `CatDireccion`
--
ALTER TABLE `CatDireccion`
  ADD PRIMARY KEY (`IdDireccion`);

--
-- Indices de la tabla `CatEstatus`
--
ALTER TABLE `CatEstatus`
  ADD PRIMARY KEY (`CodigoEstatus`),
  ADD UNIQUE KEY `IdEstatus` (`IdEstatus`);

--
-- Indices de la tabla `CatRol`
--
ALTER TABLE `CatRol`
  ADD PRIMARY KEY (`CodigoRol`),
  ADD UNIQUE KEY `IdRol` (`IdRol`);

--
-- Indices de la tabla `CatSuscripcion`
--
ALTER TABLE `CatSuscripcion`
  ADD PRIMARY KEY (`IdSuscripcion`),
  ADD UNIQUE KEY `CodigoSuscripcion` (`CodigoSuscripcion`);

--
-- Indices de la tabla `CatTipoServicio`
--
ALTER TABLE `CatTipoServicio`
  ADD PRIMARY KEY (`CodigoTipoServicio`),
  ADD UNIQUE KEY `IdTipoServicio` (`IdTipoServicio`);

--
-- Indices de la tabla `CatVehiculo`
--
ALTER TABLE `CatVehiculo`
  ADD PRIMARY KEY (`IdVehiculo`),
  ADD UNIQUE KEY `CodigoVehiculo` (`CodigoVehiculo`);

--
-- Indices de la tabla `Cliente`
--
ALTER TABLE `Cliente`
  ADD PRIMARY KEY (`CodigoCliente`),
  ADD UNIQUE KEY `IdCliente` (`IdCliente`);

--
-- Indices de la tabla `DestinoChoferAsignado`
--
ALTER TABLE `DestinoChoferAsignado`
  ADD PRIMARY KEY (`IdAsignacion`);

--
-- Indices de la tabla `DestinoServicio`
--
ALTER TABLE `DestinoServicio`
  ADD PRIMARY KEY (`IdDestino`);

--
-- Indices de la tabla `DetalleEntrega`
--
ALTER TABLE `DetalleEntrega`
  ADD PRIMARY KEY (`IdDetalleEntrega`);

--
-- Indices de la tabla `Empleado`
--
ALTER TABLE `Empleado`
  ADD PRIMARY KEY (`CodigoEmpleado`),
  ADD UNIQUE KEY `IdEmpleado` (`IdEmpleado`);

--
-- Indices de la tabla `FavoritoChofer`
--
ALTER TABLE `FavoritoChofer`
  ADD PRIMARY KEY (`IdFavorito`),
  ADD KEY `FK_Fav_Cliente` (`CodigoUsuarioCli`),
  ADD KEY `FK_Fav_Chofer` (`CodigoUsuarioCho`);

--
-- Indices de la tabla `Grupo`
--
ALTER TABLE `Grupo`
  ADD PRIMARY KEY (`CodigoGrupo`),
  ADD UNIQUE KEY `IdGrupo` (`IdGrupo`);

--
-- Indices de la tabla `GrupoRol`
--
ALTER TABLE `GrupoRol`
  ADD PRIMARY KEY (`IdGrupoRol`);

--
-- Indices de la tabla `GrupoUsuario`
--
ALTER TABLE `GrupoUsuario`
  ADD PRIMARY KEY (`IdGrupoUsuario`);

--
-- Indices de la tabla `OrdenServicio`
--
ALTER TABLE `OrdenServicio`
  ADD PRIMARY KEY (`IdOrdenServicio`);

--
-- Indices de la tabla `PagoServicio`
--
ALTER TABLE `PagoServicio`
  ADD PRIMARY KEY (`IdPago`);

--
-- Indices de la tabla `Persona`
--
ALTER TABLE `Persona`
  ADD PRIMARY KEY (`CodigoPersona`),
  ADD UNIQUE KEY `IdPersona` (`IdPersona`);

--
-- Indices de la tabla `RutaPropuesta`
--
ALTER TABLE `RutaPropuesta`
  ADD PRIMARY KEY (`IdRuta`),
  ADD KEY `FK_Ruta_Orden` (`IdOrdenServicio`);

--
-- Indices de la tabla `Usuario`
--
ALTER TABLE `Usuario`
  ADD PRIMARY KEY (`CodigoUsuario`),
  ADD UNIQUE KEY `IdUsuario` (`IdUsuario`);

--
-- Indices de la tabla `UsuarioSuscripcion`
--
ALTER TABLE `UsuarioSuscripcion`
  ADD PRIMARY KEY (`IdUsuarioSuscripcion`),
  ADD KEY `FK_Suscripcion_Usuario` (`CodigoUsuario`),
  ADD KEY `FK_Suscripcion_Catalogo` (`CodigoSuscripcion`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `AsignacionVehiculo`
--
ALTER TABLE `AsignacionVehiculo`
  MODIFY `IdAsignacionV` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `BitacoraLimpieza`
--
ALTER TABLE `BitacoraLimpieza`
  MODIFY `IdLimpieza` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `CatCuenta`
--
ALTER TABLE `CatCuenta`
  MODIFY `IdCuenta` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `CatDescuento`
--
ALTER TABLE `CatDescuento`
  MODIFY `IdDescuento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `CatDireccion`
--
ALTER TABLE `CatDireccion`
  MODIFY `IdDireccion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `CatEstatus`
--
ALTER TABLE `CatEstatus`
  MODIFY `IdEstatus` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `CatRol`
--
ALTER TABLE `CatRol`
  MODIFY `IdRol` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `CatSuscripcion`
--
ALTER TABLE `CatSuscripcion`
  MODIFY `IdSuscripcion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `CatTipoServicio`
--
ALTER TABLE `CatTipoServicio`
  MODIFY `IdTipoServicio` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `CatVehiculo`
--
ALTER TABLE `CatVehiculo`
  MODIFY `IdVehiculo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Cliente`
--
ALTER TABLE `Cliente`
  MODIFY `IdCliente` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `DestinoChoferAsignado`
--
ALTER TABLE `DestinoChoferAsignado`
  MODIFY `IdAsignacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `DestinoServicio`
--
ALTER TABLE `DestinoServicio`
  MODIFY `IdDestino` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `DetalleEntrega`
--
ALTER TABLE `DetalleEntrega`
  MODIFY `IdDetalleEntrega` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Empleado`
--
ALTER TABLE `Empleado`
  MODIFY `IdEmpleado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `FavoritoChofer`
--
ALTER TABLE `FavoritoChofer`
  MODIFY `IdFavorito` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Grupo`
--
ALTER TABLE `Grupo`
  MODIFY `IdGrupo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `GrupoRol`
--
ALTER TABLE `GrupoRol`
  MODIFY `IdGrupoRol` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `GrupoUsuario`
--
ALTER TABLE `GrupoUsuario`
  MODIFY `IdGrupoUsuario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `OrdenServicio`
--
ALTER TABLE `OrdenServicio`
  MODIFY `IdOrdenServicio` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `PagoServicio`
--
ALTER TABLE `PagoServicio`
  MODIFY `IdPago` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Persona`
--
ALTER TABLE `Persona`
  MODIFY `IdPersona` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `RutaPropuesta`
--
ALTER TABLE `RutaPropuesta`
  MODIFY `IdRuta` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `Usuario`
--
ALTER TABLE `Usuario`
  MODIFY `IdUsuario` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `UsuarioSuscripcion`
--
ALTER TABLE `UsuarioSuscripcion`
  MODIFY `IdUsuarioSuscripcion` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `AsignacionVehiculo`
--
ALTER TABLE `AsignacionVehiculo`
  ADD CONSTRAINT `FK_Asignacion_Empleado` FOREIGN KEY (`CodigoEmpleado`) REFERENCES `Empleado` (`CodigoEmpleado`),
  ADD CONSTRAINT `FK_Asignacion_Vehiculo` FOREIGN KEY (`CodigoVehiculo`) REFERENCES `CatVehiculo` (`CodigoVehiculo`);

--
-- Filtros para la tabla `UsuarioSuscripcion`
--
ALTER TABLE `UsuarioSuscripcion`
  ADD CONSTRAINT `FK_Suscripcion_Catalogo` FOREIGN KEY (`CodigoSuscripcion`) REFERENCES `CatSuscripcion` (`CodigoSuscripcion`),
  ADD CONSTRAINT `FK_Suscripcion_Usuario` FOREIGN KEY (`CodigoUsuario`) REFERENCES `Usuario` (`CodigoUsuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
