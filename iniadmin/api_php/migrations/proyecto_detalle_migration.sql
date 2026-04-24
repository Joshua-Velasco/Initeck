-- ══════════════════════════════════════════════════
-- Proyecto Detalle — Migration
-- Tables: proyecto_actividades, proyecto_clientes, proyecto_documentos
-- Alter: proyectos.encargado_id
-- ══════════════════════════════════════════════════

-- 1. Add encargado_id to proyectos
ALTER TABLE proyectos ADD COLUMN IF NOT EXISTS encargado_id INT NULL AFTER estado;

-- 2. Timeline / Cronograma de actividades
CREATE TABLE IF NOT EXISTS proyecto_actividades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    estado ENUM('pendiente','en_progreso','completada','cancelada') DEFAULT 'pendiente',
    responsable_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_proyecto (proyecto_id),
    KEY idx_responsable (responsable_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Cliente del proyecto
CREATE TABLE IF NOT EXISTS proyecto_clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    empresa VARCHAR(200),
    email VARCHAR(150),
    telefono VARCHAR(30),
    direccion TEXT,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_proyecto (proyecto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Documentos / Papelería importante
CREATE TABLE IF NOT EXISTS proyecto_documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    tipo ENUM('contrato','presupuesto','factura','plano','otro') DEFAULT 'otro',
    archivo VARCHAR(500) NOT NULL,
    tamanio INT DEFAULT 0,
    subido_por INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_proyecto (proyecto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
