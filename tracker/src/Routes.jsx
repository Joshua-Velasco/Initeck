import React from 'react';
import { useRoutes, Navigate } from 'react-router-dom';

// Importación de Páginas
import Inicio from './pages/Inicio.jsx';
import Autos from './pages/Autos.jsx';
import Empleados from './pages/Empleados.jsx';
import Viajes from './pages/Viajes.jsx';         // Vista Admin
import ViajesEmpleado from './pages/ViajesEmpleado.jsx'; // Vista Operador
import Balance from './pages/Balance.jsx';

/**
 * Componente de Protección de Rutas
 * Si el usuario no tiene el rol necesario, lo regresa al inicio.
 */
const ProtectedRoute = ({ children, user, allowedRoles }) => {
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = ({ user }) => {
  let routes = useRoutes([
    // --- RUTA PÚBLICA / INICIO ---
    { path: "/", element: <Inicio /> },

    // --- RUTAS EXCLUSIVAS PARA ADMINISTRADOR ---
    { 
      path: "/autos", 
      element: (
        <ProtectedRoute user={user} allowedRoles={['admin']}>
          <Autos />
        </ProtectedRoute>
      ) 
    },
    { 
      path: "/empleados", 
      element: (
        <ProtectedRoute user={user} allowedRoles={['admin']}>
          <Empleados />
        </ProtectedRoute>
      ) 
    },
    { 
      path: "/balance", 
      element: (
        <ProtectedRoute user={user} allowedRoles={['admin']}>
          <Balance />
        </ProtectedRoute>
      ) 
    },
    { 
      path: "/viajes", 
      element: (
        <ProtectedRoute user={user} allowedRoles={['admin']}>
          <Viajes />
        </ProtectedRoute>
      ) 
    },

    // --- RUTAS EXCLUSIVAS PARA EMPLEADOS (OPERADORES) ---
    { 
      path: "/viajes-empleado", 
      element: (
        <ProtectedRoute user={user} allowedRoles={['empleado']}>
          <ViajesEmpleado />
        </ProtectedRoute>
      ) 
    },

    // --- REDIRECCIÓN POR DEFECTO ---
    // Si la ruta no existe, manda al inicio
    { path: "*", element: <Navigate to="/" replace /> }
  ]);

  return routes;
};

export default AppRoutes;