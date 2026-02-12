-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for osx10.10 (x86_64)
--
-- Host: 127.0.0.1    Database: tracker
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
-- Table structure for table `alertas_sos`
--

DROP TABLE IF EXISTS `alertas_sos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alertas_sos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `empleado_id` int(11) NOT NULL,
  `vehiculo_id` int(11) DEFAULT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `fecha_hora` datetime DEFAULT current_timestamp(),
  `estatus` enum('ACTIVA','ATENDIDA','ARCHIVADA') DEFAULT 'ACTIVA',
  `leido` tinyint(1) DEFAULT 0,
  `notas_admin` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_empleado` (`empleado_id`),
  KEY `idx_fecha` (`fecha_hora`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `alertas_vehiculo`
--

DROP TABLE IF EXISTS `alertas_vehiculo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alertas_vehiculo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unidad_id` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `fecha` date NOT NULL,
  `dias_anticipacion` int(11) DEFAULT 3,
  `estado` enum('Pendiente','Completada','Vencida') DEFAULT 'Pendiente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `unidad_id` (`unidad_id`),
  CONSTRAINT `alertas_vehiculo_ibfk_1` FOREIGN KEY (`unidad_id`) REFERENCES `vehiculos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `empleados`
--

DROP TABLE IF EXISTS `empleados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `empleados` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vehiculo_id` int(11) DEFAULT NULL,
  `nombre_completo` varchar(150) NOT NULL,
  `puesto` varchar(50) DEFAULT NULL,
  `fecha_ingreso` timestamp NOT NULL DEFAULT current_timestamp(),
  `telefono` varchar(20) DEFAULT NULL,
  `unidad_id` int(11) DEFAULT NULL,
  `correo_personal` varchar(100) DEFAULT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `foto_ine` varchar(255) DEFAULT NULL,
  `foto_licencia` varchar(255) DEFAULT NULL,
  `rol` varchar(50) NOT NULL DEFAULT 'employee',
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `horario_entrada` time DEFAULT NULL,
  `horario_salida` time DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_empleado_vehiculo` (`vehiculo_id`),
  CONSTRAINT `fk_empleado_vehiculo` FOREIGN KEY (`vehiculo_id`) REFERENCES `vehiculos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `eventos_vehiculos`
--

DROP TABLE IF EXISTS `eventos_vehiculos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `eventos_vehiculos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vehiculo_id` int(11) DEFAULT NULL,
  `titulo` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_evento` date DEFAULT NULL,
  `tipo_evento` enum('Pago','Mantenimiento','Tramite','Otro') DEFAULT NULL,
  `completado` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `vehiculo_id` (`vehiculo_id`),
  CONSTRAINT `eventos_vehiculos_ibfk_1` FOREIGN KEY (`vehiculo_id`) REFERENCES `vehiculos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gastos`
--

DROP TABLE IF EXISTS `gastos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gastos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `concepto` varchar(100) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `categoria` enum('Combustible','Mantenimiento','Otros') DEFAULT 'Otros',
  `empleado_nombre` varchar(100) DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `empleado_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `gps_historial`
--

DROP TABLE IF EXISTS `gps_historial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gps_historial` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `empleado_id` int(11) NOT NULL,
  `vehiculo_id` int(11) NOT NULL,
  `latitud` decimal(10,8) NOT NULL,
  `longitud` decimal(11,8) NOT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inspecciones_vehiculos`
--

DROP TABLE IF EXISTS `inspecciones_vehiculos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inspecciones_vehiculos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `empleado_id` int(11) NOT NULL,
  `vehiculo_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `odometro_inicio` int(11) NOT NULL,
  `odometro_final` int(11) DEFAULT NULL,
  `gasolina` int(3) NOT NULL CHECK (`gasolina` >= 0 and `gasolina` <= 100),
  `gasolina_final` int(3) DEFAULT NULL,
  `limpieza_interior` tinyint(1) DEFAULT 1,
  `limpieza_exterior` tinyint(1) DEFAULT 1,
  `luces_funcionan` tinyint(1) DEFAULT 1,
  `comentarios` text DEFAULT NULL,
  `firma_url` varchar(255) DEFAULT NULL,
  `foto_tablero` varchar(255) DEFAULT NULL,
  `foto_frente` varchar(255) DEFAULT NULL,
  `foto_atras` varchar(255) DEFAULT NULL,
  `foto_izquierdo` varchar(255) DEFAULT NULL,
  `foto_derecho` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `comentarios_inicio` text DEFAULT NULL,
  `comentarios_final` text DEFAULT NULL,
  `estado_reporte` enum('Pendiente','Completado') DEFAULT 'Pendiente',
  PRIMARY KEY (`id`),
  KEY `idx_empleado` (`empleado_id`),
  KEY `idx_vehiculo` (`vehiculo_id`),
  CONSTRAINT `inspecciones_vehiculos_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inventario_taller`
--

DROP TABLE IF EXISTS `inventario_taller`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventario_taller` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `cantidad` int(11) DEFAULT 1,
  `estado` enum('Bueno','Regular','Malo','Reparación') DEFAULT 'Bueno',
  `foto_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `liquidaciones`
--

DROP TABLE IF EXISTS `liquidaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `liquidaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `empleado_id` int(11) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `hora` time DEFAULT NULL,
  `viajes` int(11) DEFAULT NULL,
  `monto_efectivo` decimal(10,2) DEFAULT NULL,
  `propinas` decimal(10,2) DEFAULT NULL,
  `gastos_total` decimal(10,2) DEFAULT NULL,
  `neto_entregado` decimal(10,2) DEFAULT NULL,
  `firma_path` varchar(255) DEFAULT NULL,
  `detalles_gastos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`detalles_gastos`)),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=335 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mantenimientos`
--

DROP TABLE IF EXISTS `mantenimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mantenimientos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unidad_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `costo_total` decimal(10,2) DEFAULT 0.00,
  `presupuesto` decimal(10,2) DEFAULT 0.00,
  `kilometraje_al_momento` int(11) DEFAULT NULL,
  `manual_url` varchar(500) DEFAULT NULL,
  `evidencia_foto` varchar(255) DEFAULT NULL,
  `firma_empleado` varchar(255) DEFAULT NULL,
  `firma_mecanico` varchar(255) DEFAULT NULL,
  `responsable` varchar(100) DEFAULT NULL,
  `estado` varchar(50) DEFAULT 'Completado',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `monitor_sesiones`
--

DROP TABLE IF EXISTS `monitor_sesiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `monitor_sesiones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `duracion_horas` decimal(5,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pagos`
--

DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pagos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `empleado_id` int(11) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `tipo_pago` varchar(100) DEFAULT NULL,
  `fecha` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rastreo_tiempo_real`
--

DROP TABLE IF EXISTS `rastreo_tiempo_real`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rastreo_tiempo_real` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `empleado_id` int(11) NOT NULL,
  `vehiculo_id` int(11) NOT NULL,
  `latitud` decimal(10,8) NOT NULL,
  `longitud` decimal(11,8) NOT NULL,
  `velocidad` decimal(5,2) DEFAULT 0.00,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `empleado_id` (`empleado_id`),
  KEY `timestamp` (`timestamp`),
  KEY `vehiculo_id` (`vehiculo_id`),
  CONSTRAINT `rastreo_tiempo_real_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rastreo_tiempo_real_ibfk_2` FOREIGN KEY (`vehiculo_id`) REFERENCES `vehiculos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28594 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `empleado_id` int(11) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `rol` varchar(50) NOT NULL DEFAULT 'employee',
  `requiere_cambio` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario` (`usuario`),
  KEY `empleado_id` (`empleado_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehiculos`
--

DROP TABLE IF EXISTS `vehiculos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vehiculos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unidad_nombre` varchar(100) NOT NULL,
  `tipo_unidad` enum('Nacional','Fronterizo','Importado') DEFAULT 'Nacional',
  `imagen_url` varchar(255) DEFAULT 'default_car.jpg',
  `estado` enum('Activo','En Taller','Mantenimiento','Baja','Fuera de Servicio') DEFAULT 'Activo',
  `modelo_anio` int(4) DEFAULT NULL,
  `modelo` varchar(100) DEFAULT NULL,
  `placas` varchar(20) DEFAULT NULL,
  `numero_serie` varchar(17) DEFAULT NULL,
  `motor_tipo` varchar(50) DEFAULT NULL,
  `cilindraje` varchar(20) DEFAULT NULL,
  `aceite_tipo` varchar(50) DEFAULT NULL,
  `filtro_aceite` varchar(50) DEFAULT NULL,
  `anticongelante_tipo` varchar(50) DEFAULT NULL,
  `bujias_tipo` varchar(50) DEFAULT NULL,
  `llantas_medida` varchar(50) DEFAULT NULL,
  `focos_tipo` varchar(50) DEFAULT NULL,
  `llanta_refaccion` enum('SÍ','NO') DEFAULT 'NO',
  `cables_corriente` enum('SÍ','NO') DEFAULT 'NO',
  `gato` enum('SÍ','NO') DEFAULT 'NO',
  `cruzeta` enum('SÍ','NO') DEFAULT 'NO',
  `costo_seguro_anual` decimal(12,2) DEFAULT 0.00,
  `costo_gasolina_anual` decimal(12,2) DEFAULT 0.00,
  `costo_aceite_anual` decimal(12,2) DEFAULT 0.00,
  `costo_llantas_anual` decimal(12,2) DEFAULT 0.00,
  `costo_tuneup_anual` decimal(10,2) DEFAULT 0.00,
  `costo_lavado_anual` decimal(10,2) DEFAULT 0.00,
  `costo_servicio_general_anual` decimal(10,2) DEFAULT 0.00,
  `costo_placas_anual` decimal(12,2) DEFAULT 0.00,
  `costo_ecologico_anual` decimal(12,2) DEFAULT 0.00,
  `costo_deducible_seguro_anual` decimal(10,2) DEFAULT 0.00,
  `costo_seguro_monto` decimal(12,2) DEFAULT 0.00,
  `costo_seguro_periodo` enum('anual','semestral','cuatrimestral','mensual','semanal') DEFAULT 'anual',
  `costo_deducible_seguro_monto` decimal(12,2) DEFAULT 0.00,
  `costo_deducible_seguro_periodo` enum('anual','semestral','cuatrimestral','mensual','semanal') DEFAULT 'anual',
  `costo_gasolina_monto` decimal(12,2) DEFAULT 0.00,
  `costo_gasolina_periodo` enum('anual','semestral','cuatrimestral','mensual','semanal') DEFAULT 'anual',
  `costo_aceite_monto` decimal(12,2) DEFAULT 0.00,
  `costo_aceite_periodo` enum('anual','semestral','cuatrimestral','mensual','semanal') DEFAULT 'anual',
  `costo_ecologico_monto` decimal(12,2) DEFAULT 0.00,
  `costo_ecologico_periodo` enum('anual','semestral','cuatrimestral','mensual','semanal') DEFAULT 'anual',
  `costo_placas_monto` decimal(12,2) DEFAULT 0.00,
  `costo_placas_periodo` enum('anual','semestral','cuatrimestral','mensual','semanal') DEFAULT 'anual',
  `costo_servicio_general_monto` decimal(12,2) DEFAULT 0.00,
  `costo_servicio_general_periodo` enum('anual','semestral','cuatrimestral','mensual','semanal') DEFAULT 'anual',
  `costo_llantas_monto` decimal(12,2) DEFAULT 0.00,
  `costo_llantas_periodo` enum('anual','semestral','cuatrimestral','mensual','semanal') DEFAULT 'anual',
  `costo_tuneup_monto` decimal(12,2) DEFAULT 0.00,
  `costo_tuneup_periodo` enum('anual','semestral','cuatrimestral','mensual','semanal') DEFAULT 'anual',
  `costo_lavado_monto` decimal(12,2) DEFAULT 0.00,
  `costo_lavado_periodo` enum('anual','semestral','cuatrimestral','mensual','semanal') DEFAULT 'anual',
  `nivel_gasolina` tinyint(4) DEFAULT 0,
  `kilometraje_actual` int(11) DEFAULT 0,
  `manual_url` text DEFAULT NULL,
  `unidad_medida` enum('km','mi') DEFAULT 'km',
  `rendimiento_gasolina` decimal(10,2) DEFAULT 0.00,
  `fecha_pago_seguro` date DEFAULT NULL,
  `fecha_pago_placas` date DEFAULT NULL,
  `fecha_pago_ecologico` date DEFAULT NULL,
  `fecha_proximo_mantenimiento` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `seguro_listo` tinyint(1) DEFAULT 0,
  `revalidacion_listo` tinyint(1) DEFAULT 0,
  `ecologico_listo` tinyint(1) DEFAULT 0,
  `servicio_listo` tinyint(1) DEFAULT 0,
  `foto_placas` varchar(255) DEFAULT NULL,
  `foto_ecologico` varchar(255) DEFAULT NULL,
  `foto_circulacion` varchar(255) DEFAULT NULL,
  `fotos_json` text DEFAULT NULL,
  `motor` varchar(100) DEFAULT NULL,
  `tipo_aceite` varchar(100) DEFAULT NULL,
  `filtro_aire` varchar(100) DEFAULT NULL,
  `tipo_frenos` varchar(100) DEFAULT NULL,
  `bujias` varchar(100) DEFAULT NULL,
  `costo_frenos_monto` decimal(10,2) DEFAULT 0.00,
  `costo_frenos_periodo` varchar(20) DEFAULT 'anual',
  `costo_frenos_anual` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  UNIQUE KEY `placas` (`placas`),
  UNIQUE KEY `numero_serie` (`numero_serie`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehiculos_manuales`
--

DROP TABLE IF EXISTS `vehiculos_manuales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vehiculos_manuales` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unidad_id` int(11) NOT NULL,
  `manual_url` text NOT NULL,
  `manual_nombre` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_unidad_id` (`unidad_id`),
  CONSTRAINT `vehiculos_manuales_ibfk_1` FOREIGN KEY (`unidad_id`) REFERENCES `vehiculos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehiculos_notas`
--

DROP TABLE IF EXISTS `vehiculos_notas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vehiculos_notas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vehiculo_id` int(11) NOT NULL DEFAULT 0,
  `nota` text NOT NULL,
  `color` varchar(20) DEFAULT 'yellow',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `vehiculo_id` (`vehiculo_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `viajes`
--

DROP TABLE IF EXISTS `viajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `viajes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `empleado_id` int(11) NOT NULL,
  `unidad_id` int(11) DEFAULT NULL,
  `fecha` date NOT NULL,
  `destino` text DEFAULT NULL,
  `estado` enum('Pendiente','En Ruta','Finalizado') DEFAULT 'Pendiente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-05 12:26:37
