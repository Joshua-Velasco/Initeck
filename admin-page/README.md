# Initeck Admin Dashboard

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Apache-XAMPP-FB7A24?style=for-the-badge&logo=apache&logoColor=white"/>
</p>

**Initeck Admin Dashboard** es el panel de administración web utilizado por los managers y personal administrativo para supervisar la flota, aprobar gastos de conductores, gestionar usuarios y generar reportes financieros.

---

## 📁 Estructura del Proyecto

```
admin-page/
├── dist/               # Build de producción (desplegado en servidor)
│   ├── index.html
│   ├── .htaccess       # Configuración Apache para SPA routing
│   └── assets/         # JS, CSS e imágenes bundleadas
├── node_modules/
└── README.md
```

---

## ✨ Funcionalidades

| Módulo | Descripción |
|---|---|
| 📊 **Dashboard General** | Vista panorámica del estado de la flota |
| ✅ **Aprobación de Gastos** | Revisar y aprobar recibos de conductores |
| 👥 **Gestión de Usuarios** | Administrar cuentas de empleados y managers |
| 📋 **Reportes Financieros** | Generar reportes de pagos, gastos y deducciones |
| 🚗 **Monitoreo de Viajes** | Ver historial y estado de viajes |
| 🔧 **Mantenimiento** | Gestionar solicitudes de mantenimiento vehicular |

---

## 🛠️ Tech Stack

| Tecnología | Uso |
|---|---|
| **React** | Framework de UI |
| **Vite** | Bundler y servidor de desarrollo |
| **Vanilla CSS** | Estilos del dashboard |
| **Apache** | Servidor web de producción |

---

## ⚙️ Instalación y Desarrollo

### Prerrequisitos

- **Node.js** 18+ y **npm**

### Instalar dependencias

```bash
cd admin-page
npm install
```

### Servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

### Build de producción

```bash
npm run build
```

Los archivos en `dist/` se despliegan directamente en Apache. El `.htaccess` incluido configura el SPA routing.

---

## 🌍 Variables de Entorno

Crea `.env` en la raíz:

```env
VITE_API_URL=https://tu-servidor.com/initeck-flota/Initeck-api
VITE_SAFAR_API_URL=https://tu-servidor.com/initeck-flota/safar/api
```

---

## 🚀 Despliegue

1. Ejecuta `npm run build`
2. Sube el contenido de `dist/` a tu servidor web
3. Asegúrate de que Apache tenga `mod_rewrite` habilitado
4. El `.htaccess` incluido maneja el routing de la SPA automáticamente

---

## 🔗 Proyectos Relacionados

- **[Initeck API](../Initeck-api/)** — API que provee los datos al dashboard
- **[Safar](../safar/)** — Plataforma de gestión de conductores
- **[Tracker App](../tracker/)** — App móvil que genera los datos

---

<p align="center">Parte del ecosistema <strong>Initeck Fleet Management</strong></p>
