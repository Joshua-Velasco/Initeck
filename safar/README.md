# Safar

<p align="center">
  <img src="https://img.shields.io/badge/PHP-8.x-777BB4?style=for-the-badge&logo=php&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
  <img src="https://img.shields.io/badge/PHPMailer-EA4335?style=for-the-badge&logo=gmail&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
</p>

**Safar** es la plataforma de gestión de conductores y viajes de Initeck. Compuesta por un backend REST API en PHP y un frontend web en React, maneja registro de empleados, autenticación con Google OAuth, gestión de perfil, recuperación de contraseñas y comunicación por correo electrónico.

---

## 📁 Estructura del Proyecto

```
safar/
├── api/                  # Backend REST API (PHP)
│   ├── auth.php          # Autenticación: login, Google OAuth, recuperación
│   ├── db_config.php     # Configuración de conexión a base de datos
│   └── vendor/           # Dependencias PHP (PHPMailer via Composer)
└── safar-page/           # Frontend Web (React + Vite)
    ├── src/              # Código fuente React
    ├── dist/             # Build de producción
    └── public/
        └── .htaccess     # Configuración Apache + headers CORS/COOP
```

---

## ✨ Funcionalidades

| Módulo | Descripción |
|---|---|
| 🔐 **Autenticación** | Login tradicional y con Google OAuth |
| 📧 **Recuperación de Contraseña** | Correos vía PHPMailer (SMTP) |
| 👤 **Perfil de Empleado** | Edición de datos personales y documentos |
| 🗺️ **Búsqueda por CP** | Autocompletado de dirección por código postal |
| 📋 **Historial de Viajes** | Visualización de viajes del empleado |
| 🌐 **CORS / COOP** | Headers configurados para integración con Tracker y Admin |

---

## 🛠️ Requisitos

### Backend
- **PHP** 8.x, **MySQL**, **Composer**, **Apache** con `mod_rewrite`

### Frontend
- **Node.js** 18+, **npm**, **React 18**, **Vite**

---

## ⚙️ Instalación

### Backend

```bash
cd safar/api
composer install
```

Edita `api/db_config.php`:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'tu_contraseña');
define('DB_NAME', 'safar_db');
```

Configura SMTP en `api/auth.php`:

```php
$mail->Host     = 'smtp.gmail.com';
$mail->Username = 'tu_correo@gmail.com';
$mail->Password = 'tu_app_password';
$mail->Port     = 587;
```

### Frontend

```bash
cd safar/safar-page
npm install
```

Crea `.env` en `safar-page/`:

```env
VITE_API_URL=http://localhost/initeck-flota/safar/api
VITE_GOOGLE_CLIENT_ID=tu_google_client_id
```

```bash
npm run dev       # Desarrollo
npm run build     # Producción → safar-page/dist/
```

---

## 🔌 Endpoints del API

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth.php` | Login con usuario/contraseña |
| `POST` | `/api/auth.php?action=google` | Login con Google OAuth |
| `POST` | `/api/auth.php?action=recover` | Enviar correo de recuperación |
| `GET` | `/api/auth.php?action=perfil` | Obtener datos del perfil |
| `PUT` | `/api/auth.php?action=perfil` | Actualizar perfil del empleado |

---

## 📝 Notas Importantes

- El `.htaccess` en `public/` incluye headers `Cross-Origin-Opener-Policy` requeridos para que el popup de Google funcione correctamente.
- La API usa **PHPMailer** para envío de correos transaccionales.
- Asegúrate de habilitar `mod_rewrite` en Apache para el routing del frontend.

---

## 🔗 Proyectos Relacionados

- **[Tracker App](../tracker/)** — App móvil que consume los datos del empleado
- **[Initeck API](../Initeck-api/)** — API principal del ecosistema
- **[Admin Dashboard](../admin-page/)** — Dashboard de administración

---

<p align="center">Parte del ecosistema <strong>Initeck Fleet Management</strong></p>
