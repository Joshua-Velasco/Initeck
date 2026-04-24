-- Migration to add Inventory table
CREATE TABLE IF NOT EXISTS `inventario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `part_number` varchar(50) NOT NULL,
  `categoria` varchar(20) NOT NULL,
  `estado` varchar(20) NOT NULL,
  `fecha_ingreso` date NOT NULL,
  `detalles` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
