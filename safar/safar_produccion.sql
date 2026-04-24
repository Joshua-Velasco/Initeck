-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for osx10.10 (x86_64)
--
-- Host: localhost    Database: initeckc_tracker
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `safar_asignacionvehiculo`
--

DROP TABLE IF EXISTS `safar_asignacionvehiculo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_asignacionvehiculo` (
  `IdAsignacionV` int(11) NOT NULL AUTO_INCREMENT,
  `CodigoEmpleado` varchar(10) NOT NULL,
  `CodigoVehiculo` varchar(10) NOT NULL,
  `FechaTurno` date NOT NULL,
  PRIMARY KEY (`IdAsignacionV`),
  KEY `FK_Asignacion_Empleado` (`CodigoEmpleado`),
  KEY `FK_Asignacion_Vehiculo` (`CodigoVehiculo`),
  CONSTRAINT `FK_Asignacion_Empleado` FOREIGN KEY (`CodigoEmpleado`) REFERENCES `safar_empleado` (`CodigoEmpleado`),
  CONSTRAINT `FK_Asignacion_Vehiculo` FOREIGN KEY (`CodigoVehiculo`) REFERENCES `safar_catvehiculo` (`CodigoVehiculo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_asignacionvehiculo`
--

LOCK TABLES `safar_asignacionvehiculo` WRITE;
/*!40000 ALTER TABLE `safar_asignacionvehiculo` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_asignacionvehiculo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_bitacoralimpieza`
--

DROP TABLE IF EXISTS `safar_bitacoralimpieza`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_bitacoralimpieza` (
  `IdLimpieza` int(11) NOT NULL AUTO_INCREMENT,
  `CodigoVehiculo` varchar(10) NOT NULL,
  `CodigoUsuarioLim` varchar(10) NOT NULL,
  `FechaHora` datetime NOT NULL DEFAULT current_timestamp(),
  `ChecklistAprobado` tinyint(1) NOT NULL,
  `Observaciones` text DEFAULT NULL,
  `UrlFotoEvidencia` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`IdLimpieza`),
  KEY `FK_Limpieza_Vehiculo` (`CodigoVehiculo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_bitacoralimpieza`
--

LOCK TABLES `safar_bitacoralimpieza` WRITE;
/*!40000 ALTER TABLE `safar_bitacoralimpieza` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_bitacoralimpieza` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_catcuenta`
--

DROP TABLE IF EXISTS `safar_catcuenta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_catcuenta` (
  `IdCuenta` int(11) NOT NULL AUTO_INCREMENT,
  `CodigoCuenta` varchar(10) NOT NULL,
  `NombreCuenta` varchar(100) NOT NULL,
  `NumeroTarjeta` varchar(50) NOT NULL,
  `CLABE` varchar(20) NOT NULL,
  `Banco` varchar(100) NOT NULL,
  `Descripcion` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`CodigoCuenta`),
  UNIQUE KEY `IdCuenta` (`IdCuenta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_catcuenta`
--

LOCK TABLES `safar_catcuenta` WRITE;
/*!40000 ALTER TABLE `safar_catcuenta` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_catcuenta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_catdescuento`
--

DROP TABLE IF EXISTS `safar_catdescuento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_catdescuento` (
  `IdDescuento` int(11) NOT NULL AUTO_INCREMENT,
  `CodigoDescuento` varchar(10) NOT NULL,
  `TipoDescuento` varchar(10) NOT NULL,
  `Monto` decimal(37,8) NOT NULL,
  `Activo` tinyint(1) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`CodigoDescuento`),
  UNIQUE KEY `IdDescuento` (`IdDescuento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_catdescuento`
--

LOCK TABLES `safar_catdescuento` WRITE;
/*!40000 ALTER TABLE `safar_catdescuento` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_catdescuento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_catdireccion`
--

DROP TABLE IF EXISTS `safar_catdireccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_catdireccion` (
  `IdDireccion` int(11) NOT NULL AUTO_INCREMENT,
  `CodigoCliente` varchar(10) NOT NULL,
  `Direccion` varchar(250) NOT NULL,
  `Latitud` varchar(100) NOT NULL,
  `Longitud` varchar(100) NOT NULL,
  `UrlDireccion` varchar(250) DEFAULT NULL,
  `Activo` tinyint(1) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`IdDireccion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_catdireccion`
--

LOCK TABLES `safar_catdireccion` WRITE;
/*!40000 ALTER TABLE `safar_catdireccion` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_catdireccion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_catestatus`
--

DROP TABLE IF EXISTS `safar_catestatus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_catestatus` (
  `IdEstatus` int(11) NOT NULL AUTO_INCREMENT,
  `CodigoEstatus` varchar(10) NOT NULL,
  `NombreEstatus` varchar(20) NOT NULL,
  `Activo` tinyint(1) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`CodigoEstatus`),
  UNIQUE KEY `IdEstatus` (`IdEstatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_catestatus`
--

LOCK TABLES `safar_catestatus` WRITE;
/*!40000 ALTER TABLE `safar_catestatus` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_catestatus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_catrol`
--

DROP TABLE IF EXISTS `safar_catrol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_catrol` (
  `IdRol` int(11) NOT NULL AUTO_INCREMENT,
  `CodigoRol` varchar(10) NOT NULL,
  `NombreRol` varchar(100) NOT NULL,
  `Activo` tinyint(1) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`CodigoRol`),
  UNIQUE KEY `IdRol` (`IdRol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_catrol`
--

LOCK TABLES `safar_catrol` WRITE;
/*!40000 ALTER TABLE `safar_catrol` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_catrol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_catsuscripcion`
--

DROP TABLE IF EXISTS `safar_catsuscripcion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_catsuscripcion` (
  `IdSuscripcion` int(11) NOT NULL AUTO_INCREMENT,
  `CodigoSuscripcion` varchar(10) NOT NULL,
  `Nombre` varchar(50) NOT NULL,
  `CostoFijo` decimal(12,2) NOT NULL,
  `Periodicidad` varchar(20) NOT NULL,
  `StripePriceId` varchar(255) DEFAULT NULL,
  `Activo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`IdSuscripcion`),
  UNIQUE KEY `CodigoSuscripcion` (`CodigoSuscripcion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_catsuscripcion`
--

LOCK TABLES `safar_catsuscripcion` WRITE;
/*!40000 ALTER TABLE `safar_catsuscripcion` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_catsuscripcion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_cattiposervicio`
--

DROP TABLE IF EXISTS `safar_cattiposervicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_cattiposervicio` (
  `IdTipoServicio` int(11) NOT NULL AUTO_INCREMENT,
  `CodigoTipoServicio` varchar(10) NOT NULL,
  `TipoServicio` varchar(100) NOT NULL,
  `Descripcion` varchar(100) DEFAULT NULL,
  `Activo` tinyint(1) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`CodigoTipoServicio`),
  UNIQUE KEY `IdTipoServicio` (`IdTipoServicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_cattiposervicio`
--

LOCK TABLES `safar_cattiposervicio` WRITE;
/*!40000 ALTER TABLE `safar_cattiposervicio` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_cattiposervicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_catvehiculo`
--

DROP TABLE IF EXISTS `safar_catvehiculo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_catvehiculo` (
  `IdVehiculo` int(11) NOT NULL AUTO_INCREMENT,
  `CodigoVehiculo` varchar(10) NOT NULL,
  `TipoVehiculo` varchar(50) NOT NULL,
  `CapacidadCargaKg` decimal(10,2) NOT NULL,
  `VolumenM3` decimal(10,2) NOT NULL,
  `Modelo` varchar(100) DEFAULT NULL,
  `Activo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`IdVehiculo`),
  UNIQUE KEY `CodigoVehiculo` (`CodigoVehiculo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_catvehiculo`
--

LOCK TABLES `safar_catvehiculo` WRITE;
/*!40000 ALTER TABLE `safar_catvehiculo` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_catvehiculo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_cliente`
--

DROP TABLE IF EXISTS `safar_cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_cliente` (
  `IdCliente` int(11) NOT NULL AUTO_INCREMENT,
  `CodigoCliente` varchar(10) NOT NULL,
  `CodigoUsuario` varchar(10) NOT NULL,
  `Descripcion` varchar(100) DEFAULT NULL,
  `Activo` tinyint(1) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`CodigoCliente`),
  UNIQUE KEY `IdCliente` (`IdCliente`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_cliente`
--

LOCK TABLES `safar_cliente` WRITE;
/*!40000 ALTER TABLE `safar_cliente` DISABLE KEYS */;
INSERT INTO `safar_cliente` VALUES (1,'CLI-TEST','USR-TEST','Cliente de prueba',1,'2026-03-24 09:50:27');
/*!40000 ALTER TABLE `safar_cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_destinochoferasignado`
--

DROP TABLE IF EXISTS `safar_destinochoferasignado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_destinochoferasignado` (
  `IdAsignacion` int(11) NOT NULL AUTO_INCREMENT,
  `CodigoUsuarioChofer` varchar(10) NOT NULL,
  `IdDestino` int(11) NOT NULL,
  `FechaAsignacion` datetime NOT NULL,
  `FechaFinAsignacion` datetime NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`IdAsignacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_destinochoferasignado`
--

LOCK TABLES `safar_destinochoferasignado` WRITE;
/*!40000 ALTER TABLE `safar_destinochoferasignado` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_destinochoferasignado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_destinoservicio`
--

DROP TABLE IF EXISTS `safar_destinoservicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_destinoservicio` (
  `IdDestino` int(11) NOT NULL AUTO_INCREMENT,
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
  `CodigoEstatus` varchar(10) NOT NULL,
  PRIMARY KEY (`IdDestino`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_destinoservicio`
--

LOCK TABLES `safar_destinoservicio` WRITE;
/*!40000 ALTER TABLE `safar_destinoservicio` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_destinoservicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_detalleentrega`
--

DROP TABLE IF EXISTS `safar_detalleentrega`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_detalleentrega` (
  `IdDetalleEntrega` int(11) NOT NULL AUTO_INCREMENT,
  `Descripcion` varchar(100) NOT NULL,
  `PesoKg` decimal(37,8) NOT NULL,
  `TamanioCm` varchar(20) NOT NULL,
  `DireccionEntrega` varchar(250) NOT NULL,
  `FechaEntrega` datetime NOT NULL,
  `CodigoEstatus` varchar(10) NOT NULL,
  PRIMARY KEY (`IdDetalleEntrega`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_detalleentrega`
--

LOCK TABLES `safar_detalleentrega` WRITE;
/*!40000 ALTER TABLE `safar_detalleentrega` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_detalleentrega` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_empleado`
--

DROP TABLE IF EXISTS `safar_empleado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_empleado` (
  `IdEmpleado` int(11) NOT NULL AUTO_INCREMENT,
  `CodigoEmpleado` varchar(10) NOT NULL,
  `CodigoUsuario` varchar(10) NOT NULL,
  `CURP` varchar(18) NOT NULL,
  `NumeroINE` varchar(10) NOT NULL,
  `Direccion` varchar(250) NOT NULL,
  `RFC` varchar(15) NOT NULL,
  `UrlLicencia` varchar(250) NOT NULL,
  `Activo` tinyint(1) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `CurrentH3Index` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`CodigoEmpleado`),
  UNIQUE KEY `IdEmpleado` (`IdEmpleado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_empleado`
--

LOCK TABLES `safar_empleado` WRITE;
/*!40000 ALTER TABLE `safar_empleado` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_empleado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_favoritochofer`
--

DROP TABLE IF EXISTS `safar_favoritochofer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_favoritochofer` (
  `IdFavorito` int(11) NOT NULL AUTO_INCREMENT,
  `CodigoUsuarioCli` varchar(10) NOT NULL,
  `CodigoUsuarioCho` varchar(10) NOT NULL,
  PRIMARY KEY (`IdFavorito`),
  KEY `FK_Fav_Cliente` (`CodigoUsuarioCli`),
  KEY `FK_Fav_Chofer` (`CodigoUsuarioCho`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_favoritochofer`
--

LOCK TABLES `safar_favoritochofer` WRITE;
/*!40000 ALTER TABLE `safar_favoritochofer` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_favoritochofer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_grupo`
--

DROP TABLE IF EXISTS `safar_grupo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_grupo` (
  `IdGrupo` int(11) NOT NULL AUTO_INCREMENT,
  `CodigoGrupo` varchar(10) NOT NULL,
  `NombreGrupo` varchar(100) NOT NULL,
  `Descripcion` varchar(10) DEFAULT NULL,
  `Activo` tinyint(1) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`CodigoGrupo`),
  UNIQUE KEY `IdGrupo` (`IdGrupo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_grupo`
--

LOCK TABLES `safar_grupo` WRITE;
/*!40000 ALTER TABLE `safar_grupo` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_grupo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_gruporol`
--

DROP TABLE IF EXISTS `safar_gruporol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_gruporol` (
  `IdGrupoRol` int(11) NOT NULL AUTO_INCREMENT,
  `CodigoGrupo` varchar(10) NOT NULL,
  `CodigoRol` varchar(10) NOT NULL,
  PRIMARY KEY (`IdGrupoRol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_gruporol`
--

LOCK TABLES `safar_gruporol` WRITE;
/*!40000 ALTER TABLE `safar_gruporol` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_gruporol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_grupousuario`
--

DROP TABLE IF EXISTS `safar_grupousuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_grupousuario` (
  `IdGrupoUsuario` int(11) NOT NULL AUTO_INCREMENT,
  `CodigoGrupo` varchar(10) NOT NULL,
  `CodigoUsuario` varchar(10) NOT NULL,
  PRIMARY KEY (`IdGrupoUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_grupousuario`
--

LOCK TABLES `safar_grupousuario` WRITE;
/*!40000 ALTER TABLE `safar_grupousuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_grupousuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_ordenservicio`
--

DROP TABLE IF EXISTS `safar_ordenservicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_ordenservicio` (
  `IdOrdenServicio` int(11) NOT NULL AUTO_INCREMENT,
  `Folio` varchar(10) NOT NULL,
  `CodigoUsuarioCliente` varchar(10) NOT NULL,
  `FechaProgramadaInicio` datetime NOT NULL,
  `FechaProgramadaFin` datetime DEFAULT NULL,
  `CodigoEstatus` varchar(10) DEFAULT NULL,
  `CodigoTipoServicio` varchar(10) DEFAULT NULL,
  `MontoBase` decimal(37,8) NOT NULL,
  `CodigoDescuento` varchar(10) NOT NULL,
  `MontoFinal` decimal(37,8) NOT NULL,
  `Descripcion` varchar(100) DEFAULT NULL,
  `Observaciones` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`IdOrdenServicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_ordenservicio`
--

LOCK TABLES `safar_ordenservicio` WRITE;
/*!40000 ALTER TABLE `safar_ordenservicio` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_ordenservicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_pagoservicio`
--

DROP TABLE IF EXISTS `safar_pagoservicio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_pagoservicio` (
  `IdPago` int(11) NOT NULL AUTO_INCREMENT,
  `IdOrdenServicio` int(11) NOT NULL,
  `MontoPagado` decimal(37,8) NOT NULL,
  `UrlComprobante` varchar(250) DEFAULT NULL,
  `FechaPago` datetime NOT NULL,
  `CodigoCuenta` varchar(10) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `StripePaymentIntentId` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`IdPago`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_pagoservicio`
--

LOCK TABLES `safar_pagoservicio` WRITE;
/*!40000 ALTER TABLE `safar_pagoservicio` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_pagoservicio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_persona`
--

DROP TABLE IF EXISTS `safar_persona`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_persona` (
  `IdPersona` int(11) NOT NULL AUTO_INCREMENT,
  `CodigoPersona` varchar(10) NOT NULL,
  `NombrePersona` varchar(100) NOT NULL,
  `Correo` varchar(250) NOT NULL,
  `Telefono` varchar(10) NOT NULL,
  `UrlINE` varchar(250) NOT NULL,
  `Activo` tinyint(1) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`CodigoPersona`),
  UNIQUE KEY `IdPersona` (`IdPersona`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_persona`
--

LOCK TABLES `safar_persona` WRITE;
/*!40000 ALTER TABLE `safar_persona` DISABLE KEYS */;
INSERT INTO `safar_persona` VALUES (1,'PER-TEST','Joshua Velasco','joshvela2022@gmail.com','5555555555','',1,'2026-03-24 09:50:26');
/*!40000 ALTER TABLE `safar_persona` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_rutapropuesta`
--

DROP TABLE IF EXISTS `safar_rutapropuesta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_rutapropuesta` (
  `IdRuta` int(11) NOT NULL AUTO_INCREMENT,
  `IdOrdenServicio` int(11) NOT NULL,
  `GeoJSON_Ruta` longtext NOT NULL,
  `EsRutaUsuario` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`IdRuta`),
  KEY `FK_Ruta_Orden` (`IdOrdenServicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_rutapropuesta`
--

LOCK TABLES `safar_rutapropuesta` WRITE;
/*!40000 ALTER TABLE `safar_rutapropuesta` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_rutapropuesta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_usuario`
--

DROP TABLE IF EXISTS `safar_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_usuario` (
  `IdUsuario` int(11) NOT NULL AUTO_INCREMENT,
  `CodigoUsuario` varchar(10) NOT NULL,
  `NombreUsuario` varchar(100) NOT NULL,
  `Contraseña` varchar(80) NOT NULL,
  `CodigoPersona` varchar(10) NOT NULL,
  `Activo` tinyint(1) NOT NULL,
  `FechaCreacion` datetime NOT NULL DEFAULT current_timestamp(),
  `StripeCustomerId` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`CodigoUsuario`),
  UNIQUE KEY `IdUsuario` (`IdUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_usuario`
--

LOCK TABLES `safar_usuario` WRITE;
/*!40000 ALTER TABLE `safar_usuario` DISABLE KEYS */;
INSERT INTO `safar_usuario` VALUES (1,'USR-TEST','Joshua Velasco','123456','PER-TEST',1,'2026-03-24 09:50:27',NULL);
/*!40000 ALTER TABLE `safar_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `safar_usuariosuscripcion`
--

DROP TABLE IF EXISTS `safar_usuariosuscripcion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `safar_usuariosuscripcion` (
  `IdUsuarioSuscripcion` int(11) NOT NULL AUTO_INCREMENT,
  `CodigoUsuario` varchar(10) NOT NULL,
  `CodigoSuscripcion` varchar(10) NOT NULL,
  `FechaInicio` datetime NOT NULL,
  `FechaFin` datetime NOT NULL,
  `StripeSubscriptionId` varchar(255) DEFAULT NULL,
  `EstatusPago` varchar(20) NOT NULL,
  PRIMARY KEY (`IdUsuarioSuscripcion`),
  KEY `FK_Suscripcion_Usuario` (`CodigoUsuario`),
  KEY `FK_Suscripcion_Catalogo` (`CodigoSuscripcion`),
  CONSTRAINT `FK_Suscripcion_Catalogo` FOREIGN KEY (`CodigoSuscripcion`) REFERENCES `safar_catsuscripcion` (`CodigoSuscripcion`),
  CONSTRAINT `FK_Suscripcion_Usuario` FOREIGN KEY (`CodigoUsuario`) REFERENCES `safar_usuario` (`CodigoUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `safar_usuariosuscripcion`
--

LOCK TABLES `safar_usuariosuscripcion` WRITE;
/*!40000 ALTER TABLE `safar_usuariosuscripcion` DISABLE KEYS */;
/*!40000 ALTER TABLE `safar_usuariosuscripcion` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-24 10:20:11
