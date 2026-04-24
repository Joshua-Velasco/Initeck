# Initeck Tracker App

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=capacitor&logoColor=white"/>
  <img src="https://img.shields.io/badge/iOS-000000?style=for-the-badge&logo=apple&logoColor=white"/>
  <img src="https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white"/>
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white"/>
</p>

**Initeck Tracker** es la aplicación móvil principal del ecosistema Initeck, diseñada para conductores y operadores de flota. Permite registrar viajes en tiempo real, capturar recibos de gastos, gestionar el estado del vehículo y consultar el historial financiero. Construida con React + Vite y compilada para iOS y Android usando **Capacitor**, también funciona como **Progressive Web App (PWA)**.

---

## 📁 Estructura del Proyecto

```
tracker/
├── src/
│   ├── core/
│   │   └── hooks/          # Hooks personalizados de React
│   └── platforms/          # Código específico por plataforma
├── dist/                   # Build de producción (PWA)
│   ├── index.html
│   ├── sw.js               # Service Worker
│   ├── manifest.json       # Web App Manifest
│   ├── .htaccess           # SPA routing para Apache
│   └── assets/
├── android/                # Proyecto Android nativo (Capacitor)
├── ios/                    # Proyecto iOS nativo (Xcode/Capacitor)
└── README.md
```

---

## ✨ Funcionalidades

| Módulo | Descripción |
|---|---|
| 🚗 **Registro de Viajes** | Iniciar, pausar y cerrar viajes con seguimiento |
| 📸 **Captura de Recibos** | Fotografiar y subir comprobantes de gastos |
| 🏎️ **Estado del Vehículo** | Reportar condiciones y solicitar mantenimiento |
| 💰 **Dashboard Financiero** | Ver ganancias, deducciones y estado de pagos |
| 👤 **Perfil de Empleado** | Consultar y editar información personal |
| 📱 **PWA** | Instalable como app desde el navegador |
| 📲 **Nativo iOS/Android** | Compilación nativa con acceso a hardware |

---

## 🛠️ Tech Stack

| Tecnología | Uso |
|---|---|
| **React 18** | Framework de UI |
| **Vite** | Bundler y servidor de desarrollo |
| **Capacitor** | Puente para compilación nativa iOS/Android |
| **Custom Hooks** | Lógica reutilizable (autenticación, viajes) |
| **Vanilla CSS** | Estilos personalizados |
| **Service Worker** | Soporte offline y PWA |

---

## ⚙️ Instalación y Desarrollo

### Prerrequisitos

- **Node.js** 18+ y **npm**
- **Xcode** (para iOS) — Solo en macOS
- **Android Studio** (para Android)

### Instalar dependencias

```bash
cd tracker
npm install
```

### Servidor de desarrollo (Web)

```bash
npm run dev
```

---

## 📦 Build de Producción

```bash
npm run build
```

Los archivos en `dist/` se despliegan directamente en un servidor Apache. El `.htaccess` incluido configura el SPA routing.

---

## 📱 Compilación Nativa (iOS / Android)

```bash
# 1. Compilar el proyecto web
npm run build

# 2. Sincronizar con proyectos nativos
npx cap sync

# 3a. Abrir en Xcode (iOS)
npx cap open ios

# 3b. Abrir en Android Studio
npx cap open android
```

---

## 🌍 Variables de Entorno

```env
VITE_API_URL=https://tu-servidor.com/initeck-flota/Initeck-api
VITE_SAFAR_API_URL=https://tu-servidor.com/initeck-flota/safar/api
```

---

## 🔗 Proyectos Relacionados

- **[Initeck API](../Initeck-api/)** — API principal que provee datos de viajes y empleados
- **[Safar](../safar/)** — API de autenticación y perfil
- **[Admin Dashboard](../admin-page/)** — Los managers aprueban los gastos capturados aquí

---

<p align="center">Parte del ecosistema <strong>Initeck Fleet Management</strong></p>
