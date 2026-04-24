CREATE TABLE IF NOT EXISTS tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    empleado_id INT NULL,
    asignado_por INT NULL,
    fecha_inicio DATE NULL,
    fecha_fin DATE NULL,
    hora_inicio TIME NULL,
    hora_fin TIME NULL,
    estado ENUM('pendiente', 'en_progreso', 'completada', 'cancelada') DEFAULT 'pendiente',
    prioridad ENUM('baja', 'media', 'alta', 'urgente') DEFAULT 'media',
    departamento VARCHAR(50) NOT NULL,
    materiales TEXT NULL,
    responsabilidades TEXT NULL,
    color VARCHAR(20) DEFAULT '#b91c1c',
    notas TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_empleado_id (empleado_id),
    KEY idx_departamento (departamento),
    KEY idx_estado (estado),
    KEY idx_fecha_inicio (fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS empleado_habilidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empleado_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    nivel ENUM('basico', 'intermedio', 'avanzado', 'experto') DEFAULT 'intermedio',
    categoria VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_empleado_id (empleado_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS empleado_ficha_medica (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empleado_id INT NOT NULL UNIQUE,
    tipo_sangre VARCHAR(10) NULL,
    alergias TEXT NULL,
    condiciones_cronicas TEXT NULL,
    medicamentos TEXT NULL,
    contacto_nombre VARCHAR(100) NULL,
    contacto_telefono VARCHAR(20) NULL,
    contacto_parentesco VARCHAR(50) NULL,
    seguro_medico VARCHAR(100) NULL,
    numero_poliza VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_empleado_id (empleado_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

UPDATE empleados SET rol = 'campo' WHERE rol IN ('operator', 'cleaning', 'taller', 'employee');
UPDATE empleados SET rol = 'soporte' WHERE rol = 'monitorista';
UPDATE empleados SET rol = 'developer' WHERE rol = 'development';
UPDATE empleados SET rol = 'admin' WHERE rol = 'admin';

UPDATE usuarios SET rol = 'campo' WHERE rol IN ('operator', 'cleaning', 'taller', 'employee');
UPDATE usuarios SET rol = 'soporte' WHERE rol = 'monitorista';
UPDATE usuarios SET rol = 'developer' WHERE rol = 'development';
UPDATE usuarios SET rol = 'admin' WHERE rol = 'admin';
