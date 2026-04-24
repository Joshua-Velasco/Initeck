# IniAdmin

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Apache-XAMPP-FB7A24?style=for-the-badge&logo=apache&logoColor=white"/>
</p>

**IniAdmin** es la interfaz administrativa complementaria del ecosistema Initeck. Provee herramientas de gestión y visualización para operaciones internas específicas que requieren un acceso separado del panel de administración principal.

---

## 📁 Estructura del Proyecto

```
iniadmin/
├── src/                # Código fuente React
├── dist/               # Build de producción
├── node_modules/
└── README.md
```

---

## ✨ Funcionalidades

| Módulo | Descripción |
|---|---|
| 🔧 **Herramientas Admin** | Utilidades administrativas para operaciones internas |
| 📊 **Visualización** | Vistas de datos operativos específicos |
| 🔐 **Acceso Controlado** | Panel separado con autenticación propia |

---

## 🛠️ Tech Stack

| Tecnología | Uso |
|---|---|
| **React** | Framework de UI |
| **Vite** | Bundler y servidor de desarrollo |
| **Vanilla CSS** | Estilos del panel |

---

## ⚙️ Instalación y Desarrollo

```bash
cd iniadmin
npm install
npm run dev       # Servidor de desarrollo → http://localhost:5173
npm run build     # Build de producción → dist/
```

---

## 🌍 Variables de Entorno

Crea `.env` en la raíz:

```env
VITE_API_URL=https://tu-servidor.com/initeck-flota/Initeck-api
```

---

## 🚀 Despliegue

1. Ejecuta `npm run build`
2. Sube el contenido de `dist/` al servidor web
3. Asegúrate de que Apache tenga `mod_rewrite` habilitado si usas SPA routing

---

## 🔗 Proyectos Relacionados

- **[Initeck API](../Initeck-api/)** — API principal del ecosistema
- **[Admin Dashboard](../admin-page/)** — Panel principal de administración
- **[INIBAY](../INIBAY/)** — Plataforma de gestión de contratos y pagos

---

<p align="center">Parte del ecosistema <strong>Initeck Fleet Management</strong></p>
