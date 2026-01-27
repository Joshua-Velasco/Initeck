import React from 'react';
import { useRoutes, Navigate } from 'react-router-dom';

// Importación de Páginas
import Inicio from './pages/Inicio.jsx';
import Autos from './pages/Autos.jsx';
import Empleados from './pages/Empleados.jsx';
import Viajes from './pages/Viajes.jsx';
import ViajesEmpleado from './components/Empleados_User/ViajesEmpleado.jsx';
import Balance from './pages/Balance.jsx';
import Mantenimiento from './pages/Mantenimiento.jsx';
import Perfil from './pages/Perfil.jsx';
import MonitorFlota from './components/Empleados_Admin/MonitorFlota.jsx';

/**
 * Componente de Protección de Rutas
 */
const ProtectedRoute = ({ children, user, allowedRoles }) => {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.rol)) {
    // Redirección ESTRICTA por rol para evitar acceso no autorizado
    switch (user.rol) {
      case 'monitorista': return <Navigate to="/viajes" replace />;
      case 'taller': return <Navigate to="/mantenimiento" replace />;
      case 'operator': return <Navigate to="/historial" replace />;
      case 'employee':
      case 'cleaning': return <Navigate to="/viajes-empleado" replace />;
      default: return <Navigate to="/" replace />; // Admin/Dev fall back to Dashboard
    }
  }

  return children;
};

const AppRoutes = ({ user }) => {
  const routes = useRoutes([
    {
      path: "/",
      element: (
        <ProtectedRoute user={user} allowedRoles={['admin', 'development']}>
          <Inicio user={user} />
        </ProtectedRoute>
      )
    },

    {
      path: "/autos",
      element: (
        <ProtectedRoute user={user} allowedRoles={['admin', 'development']}>
          <Autos user={user} />
        </ProtectedRoute>
      )
    },
    {
      path: "/mantenimiento",
      element: (
        <ProtectedRoute user={user} allowedRoles={['admin', 'development', 'operator', 'taller']}>
          <Mantenimiento user={user} />
        </ProtectedRoute>
      )
    },
    {
      path: "/empleados",
      element: (
        <ProtectedRoute user={user} allowedRoles={['admin', 'development']}>
          <Empleados user={user} />
        </ProtectedRoute>
      )
    },
    {
      path: "/balance",
      element: (
        <ProtectedRoute user={user} allowedRoles={['admin']}>
          <Balance user={user} />
        </ProtectedRoute>
      )
    },
    {
      path: "/viajes",
      element: (
        <ProtectedRoute user={user} allowedRoles={['admin', 'development', 'monitorista']}>
          <Viajes user={user} />
        </ProtectedRoute>
      )
    },
    {
      path: "/monitor-flota",
      element: (
        <ProtectedRoute user={user} allowedRoles={['admin', 'development', 'monitorista']}>
          <MonitorFlota />
        </ProtectedRoute>
      )
    },
    // Redirección legacy para /viajes -> /monitor-flota si es monitorista
    {
      path: "/viajes",
      element: (
        <ProtectedRoute user={user} allowedRoles={['admin', 'development', 'monitorista']}>
          <Viajes user={user} />
        </ProtectedRoute>
      )
    },

    // --- RUTAS OPERATIVAS CORREGIDAS ---
    {
      path: "/viajes-empleado",
      element: (
        <ProtectedRoute user={user} allowedRoles={['employee', 'admin', 'development']}>
          {/* AQUÍ ESTABA EL ERROR: Faltaba pasar la prop user */}
          <ViajesEmpleado user={user} />
        </ProtectedRoute>
      )
    },
    {
      path: "/historial",
      element: (
        <ProtectedRoute user={user} allowedRoles={['employee', 'operator', 'admin', 'development', 'cleaning']}>
          {/* AQUÍ TAMBIÉN Faltaba pasar la prop user */}
          <ViajesEmpleado user={user} />
        </ProtectedRoute>
      )
    },
    {
      path: "/perfil",
      element: (
        <ProtectedRoute user={user} allowedRoles={['admin', 'operator', 'employee', 'cleaning', 'development']}>
          <Perfil user={user} />
        </ProtectedRoute>
      )
    },

    { path: "*", element: <Navigate to="/" replace /> }
  ]);

  return routes;
};

export default AppRoutes;