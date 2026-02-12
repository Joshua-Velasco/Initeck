import React, { useState, useEffect } from "react";
import { BrowserRouter, HashRouter } from "react-router-dom";
import AppRoutes from "./Routes.jsx";
import Login from "./pages/Login.jsx";
import "./App.css";

import WebLayout from "./platforms/web/layouts/WebLayout.jsx";
import MobileLayout from "./platforms/mobile/layouts/MobileLayout.jsx";

import { useAuth } from "./modules/auth/AuthProvider.jsx";
import { DateProvider } from "./modules/shell/DateProvider.jsx";
import { useWakeLock } from "./hooks/useWakeLock.js";

function App() {
  const { requestWakeLock, releaseWakeLock } = useWakeLock();
  const { user, login } = useAuth(); // Removed logout/showLogoutModal from here as they moved to layouts

  // Activar Wake Lock si el usuario tiene rol operativo
  useEffect(() => {
    const rolesOperativos = [
      "employee",
      "operator",
      "cleaning",
      "admin",
      "development",
    ];
    if (user?.rol && rolesOperativos.includes(user.rol)) {
      requestWakeLock();
    }
    return () => releaseWakeLock();
  }, [user?.rol, requestWakeLock, releaseWakeLock]);

  const handleLogin = (userData) => {
    login(userData);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  // Importar dinámicamente el plugin solo si es necesario
  const isCapacitor = import.meta.env.VITE_IS_CAPACITOR === "true";

  const Router = isCapacitor ? HashRouter : BrowserRouter;
  // Determine basename dynamically:
  // - Capacitor: no basename (HashRouter or handled by file protocol)
  // - Web Prod (Server): "/uber"
  // - Web Dev/Local: "/"
  const isLocal = window.location.hostname === "localhost" || window.location.hostname.includes("127.0.0.1");
  const basename = !isCapacitor && import.meta.env.PROD && !isLocal ? "/uber/" : "/";
  const routerProps = isCapacitor ? {} : { basename };

  const Layout = isCapacitor ? MobileLayout : WebLayout;

  return (
    <Router {...routerProps}>
      <DateProvider>
        <Layout>
          <AppRoutes user={user} />
        </Layout>
      </DateProvider>
    </Router>
  );
}

export default App;
