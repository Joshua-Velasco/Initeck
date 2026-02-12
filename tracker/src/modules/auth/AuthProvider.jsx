import React, { createContext, useContext, useState, useEffect } from "react";
import { authFetch } from "../../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        const now = Date.now();
        const loginTime = parsedUser.loginTimestamp || 0;
        // 24 horas en milisegundos
        const SESSION_DURATION = 24 * 60 * 60 * 1000;

        // Si no tiene timestamp (sesión antigua) o ya expiró -> Forzar logout
        if (!parsedUser.loginTimestamp || now - loginTime > SESSION_DURATION) {
            console.warn("Sesión expirada o inválida al iniciar");
            localStorage.removeItem("user");
            return null;
        }
        return parsedUser;
      }
      return null;
    } catch (error) {
      console.error("Error al recuperar sesión:", error);
      return null;
    }
  });

  const login = (userData) => {
    // Agregamos timestamp del momento de login
    const userWithTimestamp = {
        ...userData,
        loginTimestamp: Date.now()
    };
    setUser(userWithTimestamp);
    localStorage.setItem("user", JSON.stringify(userWithTimestamp));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // --- MANTENIMIENTO DE SESIÓN ACTIVA ---
  useEffect(() => {
    if (!user?.usuario_id) return;

    const HEARTBEAT_INTERVAL = 10 * 60 * 1000;
    const SESSION_CHECK_INTERVAL = 60 * 1000;
    const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 horas

    let heartbeatInterval = null;
    let sessionCheckInterval = null;

    const sendHeartbeat = async () => {
      if (!user || !user.usuario_id) return;

      try {
        const response = await authFetch("session_keepalive", {
          method: "POST",
          body: JSON.stringify({
            usuario_id: user.usuario_id,
          }),
        });
        const data = await response.json();
        console.log("Respuesta servidor (Heartbeat):", data);
      } catch (error) {
        console.error("Error en heartbeat:", error);
      }
    };

    const checkSessionStatus = async () => {
      // 1. Verificación Local de Tiempo
      const now = Date.now();
      const loginTime = user.loginTimestamp || 0;
      
      if (now - loginTime > SESSION_DURATION) {
          console.warn("Sesión expirada localmente (24h)");
          logout();
          return; // No hace falta consultar al servidor si ya expiró localmente
      }

      // 2. Verificación con Servidor
      try {
        const response = await authFetch("check_session", {
          method: "GET",
          headers: {
            "X-Usuario-ID": user.usuario_id,
          },
        });

        if (!response.ok) {
          if (response.status === 401) logout();
        } else {
          const data = await response.json();
          if (data.status === "expired") {
            console.warn("Sesión expirada");
            logout();
          }
        }
      } catch (error) {
        console.warn("Error verificando estado de sesión:", error);
      }
    };

    heartbeatInterval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
    sessionCheckInterval = setInterval(checkSessionStatus, SESSION_CHECK_INTERVAL);

    // Enviar primer heartbeat inmediato
    sendHeartbeat();

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (sessionCheckInterval) clearInterval(sessionCheckInterval);
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
