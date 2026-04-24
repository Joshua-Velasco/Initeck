import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Settings, Shield,
  ChevronRight, ListTodo, Calendar as CalendarIcon,
  Briefcase, ClipboardCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_ROUTES, ROLE_LABELS } from '../constants/roles';
import { EMPLEADOS_UPLOADS_URL } from '../config';

const ALL_NAV_ITEMS = [
  {
    section: 'Principal',
    items: [
      { path: '/',          label: 'Dashboard',   icon: LayoutDashboard },
      { path: '/empleados', label: 'Empleados',   icon: Users },
      { path: '/proyectos', label: 'Proyectos',   icon: Briefcase },
    ]
  },
  {
    section: 'Gestión',
    items: [
      { path: '/tareas',     label: 'Tareas',      icon: ListTodo },
      { path: '/calendario', label: 'Calendario',  icon: CalendarIcon },
      { path: '/reportes',   label: 'Reportes',    icon: ClipboardCheck },
    ]
  },
  {
    section: 'Sistema',
    items: [
      { path: '/configuracion', label: 'Configuración', icon: Settings },
    ]
  }
];

export default function Sidebar({ isOpen, onClose }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user }  = useAuth();

  const allowedRoutes = ROLE_ROUTES[user?.rol] ?? [];

  // Filtrar nav según el rol del usuario
  const navItems = ALL_NAV_ITEMS
    .map(section => ({
      ...section,
      items: section.items.filter(item => allowedRoutes.includes(item.path))
    }))
    .filter(section => section.items.length > 0);

  const handleNavigate = (path) => {
    navigate(path);
    onClose?.();
  };

  // Avatar: inicial del nombre o foto
  const initial = user?.nombre_completo?.[0]?.toUpperCase() ?? 'U';
  const fotoUrl = user?.foto_perfil
    ? `${EMPLEADOS_UPLOADS_URL}${user.foto_perfil}`
    : null;

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Shield size={20} color="white" strokeWidth={2.5} />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">PROCESOS INTERNOS</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(section => (
            <div key={section.section}>
              <div className="sidebar-section-label">{section.section}</div>
              {section.items.map(item => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                const Icon = item.icon;

                return (
                  <button
                    key={item.path}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavigate(item.path)}
                  >
                    <Icon size={18} className="sidebar-link-icon" />
                    <span>{item.label}</span>
                    {isActive && (
                      <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer — usuario real */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar" style={{
              background: fotoUrl ? 'transparent' : 'linear-gradient(135deg, var(--red-500), var(--red-800))',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
              {fotoUrl
                ? <img src={fotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initial}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">
                {user?.nombre_completo ?? 'Usuario'}
              </span>
              <span className="sidebar-user-role">
                {ROLE_LABELS[user?.rol] ?? user?.rol ?? ''}
              </span>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}
