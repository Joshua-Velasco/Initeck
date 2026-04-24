import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ROLE_ROUTES, ROLE_DEFAULT_ROUTE } from './constants/roles';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Empleados from './pages/Empleados';
import Tareas from './pages/Tareas';
import Calendario from './pages/Calendario';
import Proyectos from './pages/Proyectos';
import ProyectoDetalle from './pages/ProyectoDetalle';
import ReportingHub from './pages/ReportingHub';
import Login from './pages/Login';
import './App.css';

/* ── Guard: verifica rol antes de mostrar la ruta ── */
function ProtectedRoute({ path, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const allowed = ROLE_ROUTES[user.rol] ?? [];
  if (!allowed.includes(path)) {
    return <Navigate to={ROLE_DEFAULT_ROUTE[user.rol] ?? '/'} replace />;
  }
  return children;
}

/* ── Layout del panel cuando el usuario está autenticado ── */
function PanelLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-content">
        <Header onMenuToggle={() => setSidebarOpen(p => !p)} />
        <div className="page-content">
          <Routes>
            <Route path="/"
              element={<ProtectedRoute path="/"><Dashboard /></ProtectedRoute>}
            />
            <Route path="/empleados"
              element={<ProtectedRoute path="/empleados"><Empleados /></ProtectedRoute>}
            />
            <Route path="/tareas"
              element={<ProtectedRoute path="/tareas"><Tareas /></ProtectedRoute>}
            />
            <Route path="/calendario"
              element={<ProtectedRoute path="/calendario"><Calendario /></ProtectedRoute>}
            />
            <Route path="/proyectos"
              element={<ProtectedRoute path="/proyectos"><Proyectos /></ProtectedRoute>}
            />
            <Route path="/proyectos/:id"
              element={<ProtectedRoute path="/proyectos"><ProyectoDetalle /></ProtectedRoute>}
            />
            <Route path="/reportes"
              element={<ProtectedRoute path="/reportes"><ReportingHub /></ProtectedRoute>}
            />
            {/* Cualquier ruta no encontrada → redirige al default del rol */}
            <Route path="*" element={<DefaultRedirect />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function DefaultRedirect() {
  const { user } = useAuth();
  return <Navigate to={ROLE_DEFAULT_ROUTE[user?.rol] ?? '/'} replace />;
}

/* ── Punto de decisión: login o panel ── */
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user
          ? <Navigate to={ROLE_DEFAULT_ROUTE[user.rol] ?? '/'} replace />
          : <Login />}
      />
      <Route
        path="/*"
        element={user ? <PanelLayout /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
