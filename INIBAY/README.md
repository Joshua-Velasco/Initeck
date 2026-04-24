# INIBAY

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
</p>

**INIBAY** es la plataforma de gestión de contratos y pagos del ecosistema Initeck. Provee a los managers un dashboard para administrar contratos de empleados, registrar pagos mensuales, gestionar adelantos y visualizar el estado financiero de cada conductor de la flota.

---

## 📁 Estructura del Proyecto

```
INIBAY/
├── api/                  # Backend REST API (Node.js)
│   ├── server.js         # Servidor principal de la API
│   ├── import_csv.js     # Importación de datos desde CSV
│   ├── reset_locks.js    # Script de mantenimiento de bloqueos
│   └── package.json
├── api_php/              # Backend alternativo en PHP
│   ├── index.php         # Punto de entrada de la API PHP
│   ├── config.php        # Configuración de la base de datos
│   └── migrate_pagos.sql # Migraciones de base de datos
├── manager/              # Frontend del panel (React + Vite)
├── manager.nosync/       # Backup de desarrollo (no sincronizado con iCloud)
└── README.md
```

---

## ✨ Funcionalidades

| Módulo | Descripción |
|---|---|
| 📑 **Gestión de Contratos** | Administrar contratos vigentes de cada empleado |
| 💳 **Registro de Pagos** | Marcar meses como pagados y llevar historial |
| 💰 **Adelantos** | Registrar y descontar adelantos de pago |
| 📊 **Dashboard Financiero** | Resumen del estado financiero por conductor |
| 👥 **Empleados** | Visualización de conductores activos e inactivos |
| 📥 **Importación CSV** | Carga masiva de datos desde archivos CSV |

---

## 🛠️ Tech Stack

| Tecnología | Uso |
|---|---|
| **React + Vite** | Frontend del manager dashboard |
| **Node.js** | API REST principal |
| **PHP 8.x** | API REST alternativa |
| **MySQL** | Base de datos relacional |

---

## ⚙️ Instalación y Desarrollo

### Frontend (Manager Dashboard)

```bash
cd INIBAY/manager
npm install
npm run dev
```

### Backend Node.js

```bash
cd INIBAY/api
npm install
node server.js
```

### Backend PHP

Configura `api_php/config.php` con tus credenciales de base de datos e importa las migraciones:

```bash
mysql -u root -p inibay_db < api_php/migrate_pagos.sql
```

---

## 🌍 Variables de Entorno (API Node.js)

Crea `api/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=tu_contraseña
DB_NAME=inibay_db
PORT=3001
```

---

## 🔗 Proyectos Relacionados

- **[Initeck API](../Initeck-api/)** — API principal del ecosistema
- **[Admin Dashboard](../admin-page/)** — Panel de administración general
- **[Tracker App](../tracker/)** — App móvil de conductores

---

## 📝 Notas

- `manager.nosync/` es un backup que **no se sincroniza** con iCloud para evitar conflictos.
- `manager_corrupted/` es un backup de recuperación y **no debe usarse en producción**.
- Pagos en verde = meses cubiertos por contrato o pagados manualmente.

---

<p align="center">Parte del ecosistema <strong>Initeck Fleet Management</strong></p>
