# Initeck Flota - Inimovil 🚚

**Initeck Flota** is a comprehensive fleet management and tracking system designed for real-time monitoring, maintenance scheduling, and operational management. It consists of a robust PHP-based API and a modern React/Capacitor frontend for multi-platform support (Web, iOS, Android).

---

## 👾 Features

- **Real-time Tracking**: GPS monitoring for vehicles and employees.
- **Fleet Management**: CRUD operations for vehicles, drivers, and assignments.
- **Maintenance (Taller)**: Inventory management, equipment tracking, and service alerts.
- **Payroll (Nómina)**: Management of tickets, transfers, and liquidation processes.
- **Dynamic Dashboards**: Financial charts, operational summaries, and performance metrics using Chart.js and Recharts.
- **Multi-platform Utility**: Built with Capacitor for seamless execution on mobile devices and browsers.
- **Interactive Maps**: Integrated Leaflet/React-Leaflet for visual fleet monitoring.

---

## 📒 Process & Architecture

The project is organized as a monorepo:

- **`Initeck-api/`**: A PHP RESTful API that handles business logic, database interactions (MySQL), and authentication.
- **`tracker/`**: The frontend application built with React and Vite. It serves as the primary interface for both administrators and employees.
- **`apps/`**: Additional micro-modular apps or secondary interfaces.

Development focused on creating a scalable architecture that allows for independent module updates while maintaining a unified data source.

---

## 🚦 Running the Project

### 📡 API Setup

1. Ensure you have a PHP environment (like XAMPP/WAMP or a remote server).
2. Configure your database in `Initeck-api/config/database.php`.
3. Import the provided SQL schema: `initeckc_tracker (1).sql`.

### 📱 Tracker (Frontend) Setup

1. Navigate to the `tracker` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. For mobile development (Capacitor):
   ```bash
   npm run cap:sync
   npx cap open ios  # or android
   ```

---

## ⚠️ Security & Configuration

> [!IMPORTANT]
> The database configuration in `Initeck-api/config/database.php` contains environment-specific settings. Ensure you update the credentials and set up the `isLocal` detection logic according to your infrastructure. Never share sensitive production credentials in public repositories.

---

## 🌳 Branching Model

This project follows a professional branching strategy (inspired by GitFlow) to maintain production stability and organized development:

| Branch      | Purpose                                                                 |
| :---------- | :---------------------------------------------------------------------- |
| `main`      | **Production.** Holds the latest stable, production-ready code.         |
| `develop`   | **Development.** Integration branch for features and fixes.             |
| `feature/*` | **New Features.** Specific branches for individual tasks or components. |
| `release/*` | **Releases.** Preparation for moving code from `develop` to `main`.     |
| `hotfix/*`  | **Urgent Fixes.** Critical bug fixes for the code currently in `main`.  |

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons.
- **Mobile**: Capacitor 7.
- **Backend**: PHP 8.x, MySQL.
- **Maps & Charts**: Leaflet, Chart.js, Recharts.
- **Utilities**: SweetAlert2, Axios, React Router Dom.

---

Developed by [Joshua Velasco](https://github.com/Joshua-Velasco).

---

### 🙌 ¡Gracias por todo!

*"Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas."* — **Josué 1:9**
