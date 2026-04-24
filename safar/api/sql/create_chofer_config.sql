-- Crear tabla safar_chofer_config si no existe
-- Esta tabla controla la capacidad máxima de viajes simultáneos por chofer

CREATE TABLE IF NOT EXISTS `safar_chofer_config` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `codigo_chofer` VARCHAR(50) NOT NULL UNIQUE,
  `max_viajes_simultaneos` INT NOT NULL DEFAULT 3,
  `ventana_minutos` INT NOT NULL DEFAULT 90,
  `activo` TINYINT(1) DEFAULT 1,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_chofer (`codigo_chofer`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insertar configuración por defecto para todos los choferes existentes
-- (solo si no existen ya)
INSERT IGNORE INTO `safar_chofer_config` (`codigo_chofer`, `max_viajes_simultaneos`, `ventana_minutos`)
SELECT DISTINCT 
  COALESCE(u.usuario, CONCAT('emp_', e.id)),
  3,
  90
FROM empleados e
LEFT JOIN usuarios u ON e.id = u.empleado_id
WHERE e.rol IN ('admin', 'employee', 'operator', 'chofer', 'conductor', 'driver', 'campo')
  AND e.vehiculo_id IS NOT NULL
ON DUPLICATE KEY UPDATE max_viajes_simultaneos = max_viajes_simultaneos;

-- Verificar que la tabla existe
SELECT 'Tabla safar_chofer_config creada/verificada correctamente' AS mensaje;
