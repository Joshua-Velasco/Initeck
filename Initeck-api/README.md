# Initeck API

<p align="center">
  <img src="https://img.shields.io/badge/PHP-8.x-777BB4?style=for-the-badge&logo=php&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Apache-XAMPP-FB7A24?style=for-the-badge&logo=apache&logoColor=white"/>
  <img src="https://img.shields.io/badge/REST-API-00C851?style=for-the-badge"/>
</p>

El **core backend REST API** del sistema de gestión de flota de Initeck. Construido con PHP puro, gestiona toda la lógica de negocio, autenticación de usuarios, operaciones de base de datos y sirve como fuente de verdad para todas las aplicaciones cliente (Tracker App, Admin Dashboard, Landing Page).

---

## 📁 Estructura del Proyecto

```
Initeck-api/
├── auth/               # Módulo de autenticación (login, tokens, sesiones)
│   └── uploads/        # Archivos subidos por usuarios (recibos, fotos)
├── v1/                 # Versión 1 de la API
│   ├── empleados/      # Endpoints de gestión de empleados
│   └── uploads/        # Uploads relacionados a endpoints v1
├── logs/               # Sistema de logging interno
│   └── logger.php      # Módulo de registro de eventos
└── README.md
```

---

## ✨ Funcionalidades

| Módulo | Descripción |
|---|---|
| 🔐 **Autenticación** | Login, logout y gestión de sesiones por empleado |
| 👥 **Empleados** | CRUD completo de conductores y operadores |
| 🚗 **Viajes** | Registro, inicio, pausa y cierre de viajes |
| 💸 **Gastos** | Captura y aprobación de recibos (gasolina, casetas, mantenimiento) |
| 🏎️ **Vehículos** | Bitácoras de mantenimiento y estado del vehículo |
| 📊 **Reportes** | Endpoints de ganancias, deducciones y pagos |
| 📁 **Uploads** | Manejo de archivos multimedia (comprobantes, fotos) |
| 📝 **Logs** | Registro centralizado de actividad del sistema |

---

## 🛠️ Requisitos

- **PHP** 8.x o superior
- **MySQL** / **MariaDB** 10.x+
- **Apache** con `mod_rewrite` habilitado (XAMPP recomendado)

---

## ⚙️ Configuración e Instalación

### 1. Ubicar el Proyecto

```
/Applications/XAMPP/xamppfiles/htdocs/initeck-flota/Initeck-api/
```

### 2. Configurar Base de Datos

Edita el archivo de configuración de base de datos (`config/database.php`):

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'tu_contraseña');
define('DB_NAME', 'initeck_db');
```

### 3. Importar Esquemas SQL

```bash
mysql -u root -p initeck_db < schema.sql
```

### 4. Permisos de Carpetas

```bash
chmod -R 755 auth/uploads/
chmod -R 755 v1/uploads/
```

---

## 🔌 Endpoints Principales

### Autenticación

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/auth/login` | Iniciar sesión de empleado |
| `POST` | `/auth/logout` | Cerrar sesión |

### Empleados

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/v1/empleados/` | Listar todos los empleados |
| `GET` | `/v1/empleados/{id}` | Obtener empleado por ID |
| `POST` | `/v1/empleados/` | Crear nuevo empleado |
| `PUT` | `/v1/empleados/{id}` | Actualizar empleado |

---

## 🔗 Proyectos Relacionados

Este API es consumido por:
- **[Tracker App](../tracker/)** — App móvil para conductores
- **[Admin Dashboard](../admin-page/)** — Panel administrativo para managers
- **[Landing Page](../landing-page/)** — Sitio web público de Initeck

---

## 📝 Notas de Desarrollo

- Todos los endpoints retornan JSON con `Content-Type: application/json`
- Las respuestas de error siguen el formato `{ "error": true, "message": "..." }`
- El sistema de logs registra actividad en `logs/` para depuración

---

<p align="center">Parte del ecosistema <strong>Initeck Fleet Management</strong></p>
