import React, { createContext, useContext, useState, useCallback } from 'react';
import { BASE_API } from '../config';

const AuthContext = createContext(null);

const SESSION_KEY = 'iniadmin_session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (usuario, password) => {
    try {
      const res = await fetch(`${BASE_API}auth/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
        setUser(data.user);
        return { ok: true };
      }
      return { ok: false, message: data.message || 'Error al iniciar sesión' };
    } catch {
      return { ok: false, message: 'No se pudo conectar al servidor' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
