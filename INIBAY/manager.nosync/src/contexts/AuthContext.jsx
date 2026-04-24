import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

import { API_URL } from '../config';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('inibay_token') !== null;
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('inibay_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (username, password) => {
    let rawText = '';
    let responseStatus = 0;
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      responseStatus = response.status;
      rawText = await response.text();
      
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        return { 
          success: false, 
          error: `Error del servidor (Código ${responseStatus}). La respuesta no es un JSON válido.`,
          debugInfo: `URL: ${API_URL}/api/auth/login\n\nRespuesta:\n${rawText}` 
        };
      }
      
      if (response.ok && data.success) {
        setIsAuthenticated(true);
        setUser(data.user);
        localStorage.setItem('inibay_token', data.token);
        localStorage.setItem('inibay_user', JSON.stringify(data.user));
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.error || 'Credenciales incorrectas o error de servidor',
          debugInfo: `URL: ${API_URL}/api/auth/login\n\nJSON:\n${JSON.stringify(data, null, 2)}`
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Error de red al intentar conectar con el servidor.',
        debugInfo: `URL intentada: ${API_URL}/api/auth/login\n\nError: ${error.message}` 
      };
    }
  };

  const register = async (username, password, admin_code) => {
    let rawText = '';
    let responseStatus = 0;
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, admin_code })
      });
      
      responseStatus = response.status;
      rawText = await response.text();
      
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        return { 
          success: false, 
          error: `Error al registrar (Código ${responseStatus}). Respuesta inválida del servidor.`,
          debugInfo: `URL: ${API_URL}/api/auth/register\n\nRespuesta:\n${rawText}` 
        };
      }
      
      if (response.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        return { 
          success: false, 
          error: data.error || 'Error en el registro',
          debugInfo: JSON.stringify(data, null, 2)
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Error de red al procesar el registro.',
        debugInfo: `URL intentada: ${API_URL}/api/auth/register\n\nError: ${error.message}` 
      };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('inibay_token');
    localStorage.removeItem('inibay_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
