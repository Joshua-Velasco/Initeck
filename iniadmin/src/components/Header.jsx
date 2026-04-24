import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, Sun, LogOut, Info, AlertCircle, Clock } from 'lucide-react';
import LogoutModal from './LogoutModal';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../constants/roles';
import { EMPLEADOS_UPLOADS_URL } from '../config';

const PAGE_TITLES = {
  '/':              { title: 'Dashboard',      breadcrumb: 'Inicio' },
  '/empleados':     { title: 'Empleados',      breadcrumb: 'Gestión de Personal' },
  '/tareas':        { title: 'Tareas',         breadcrumb: 'Tablero de Control' },
  '/calendario':    { title: 'Calendario',     breadcrumb: 'Agenda Operativa' },
  '/configuracion': { title: 'Configuración',  breadcrumb: 'Sistema' },
};

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Tarea Próxima',    desc: 'Mantenimiento en 2 horas',          icon: <Clock size={14} />,        color: 'var(--brand)' },
  { id: 2, title: 'Equipo Asignado',  desc: 'Equipo Alfa está en "Filtros"',     icon: <Info size={14} />,         color: 'var(--info)' },
  { id: 3, title: 'Alerta de Retraso',desc: 'Tarea "Limpieza" excedió tiempo',   icon: <AlertCircle size={14} />,  color: 'var(--danger)' },
];

export default function Header({ onMenuToggle }) {
  const { user, logout }       = useAuth();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location  = useLocation();
  const pageInfo  = PAGE_TITLES[location.pathname] ?? { title: 'IniAdmin', breadcrumb: '' };

  const fotoUrl = user?.foto_perfil
    ? `${EMPLEADOS_UPLOADS_URL}${user.foto_perfil}`
    : null;

  const initial = user?.nombre_completo?.[0]?.toUpperCase() ?? 'U';

  return (
    <>
      <header className="header">
        <div className="header-left">
          <button className="header-menu-btn" onClick={onMenuToggle}>
            <Menu size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Logo pill */}
            <div style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 60%, #000000 100%)',
              padding: '8px 18px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 20px rgba(220, 38, 38, 0.25)',
              display: 'flex', alignItems: 'center',
            }}>
              <span style={{ fontSize: 13, fontWeight: 950, color: 'white', letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                IniAdmin
              </span>
            </div>

            {/* Separador + título de página — solo visible en móvil */}
            <div className="header-page-info">
              <div style={{ width: 1, height: 24, background: 'var(--gray-200)' }} />
              <div>
                <div className="header-title" style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)' }}>
                  {pageInfo.title}
                </div>
                {pageInfo.breadcrumb && (
                  <div className="header-breadcrumb" style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>
                    {pageInfo.breadcrumb}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="header-right">

          {/* Notificaciones */}
          <div style={{ position: 'relative' }}>
            <button
              className="header-icon-btn"
              title="Notificaciones"
              onClick={() => setShowNotifications(p => !p)}
            >
              <Bell size={19} />
              <span className="notification-dot" />
            </button>

            {showNotifications && (
              <div className="animate-fade-in-scale" style={{
                position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                width: 320, background: 'white',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-xl), 0 0 0 1px rgba(0,0,0,0.04)',
                border: '1px solid var(--gray-200)',
                zIndex: 1000, overflow: 'hidden',
              }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>Notificaciones</h4>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand)', background: 'var(--red-50)', padding: '2px 8px', borderRadius: 4 }}>3 NUEVAS</span>
                </div>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {MOCK_NOTIFICATIONS.map(n => (
                    <div key={n.id} style={{
                      padding: '12px 16px', borderBottom: '1px solid var(--gray-50)',
                      cursor: 'pointer', transition: 'background 0.15s',
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'white', border: '1.5px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: n.color, flexShrink: 0 }}>
                        {n.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-800)' }}>{n.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-500)', lineHeight: 1.3, marginTop: 2 }}>{n.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px', textAlign: 'center', borderTop: '1px solid var(--gray-100)' }}>
                  <button style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    Ver todas las alertas
                  </button>
                </div>
              </div>
            )}
          </div>

          <button className="header-icon-btn" title="Tema">
            <Sun size={19} />
          </button>

          {/* Chip del usuario logueado — solo visible en móvil */}
          <div className="header-user-chip" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '5px 12px 5px 5px',
            background: 'var(--gray-50)',
            border: '1.5px solid var(--gray-200)',
            borderRadius: 'var(--radius-full)',
            cursor: 'default',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: fotoUrl ? 'transparent' : 'var(--gradient-brand)',
              border: '1.5px solid white',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}>
              {fotoUrl
                ? <img src={fotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initial}
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-800)', whiteSpace: 'nowrap', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.nombre_completo ?? 'Usuario'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--gray-400)', fontWeight: 500 }}>
                {ROLE_LABELS[user?.rol] ?? user?.rol ?? ''}
              </div>
            </div>
          </div>

          <div className="header-user-chip" style={{ width: 1, height: 24, background: 'var(--gray-200)', margin: '0 4px' }} />

          {/* Cerrar sesión */}
          <button
            className="header-logout-btn"
            title="Cerrar Sesión"
            onClick={() => setLogoutModalOpen(true)}
            style={{
              width: 38, height: 38,
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--gray-200)',
              background: 'white',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--gray-500)',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-xs)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red-200)'; e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = '#fff5f5'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.color = 'var(--gray-500)'; e.currentTarget.style.background = 'white'; }}
          >
            <LogOut size={17} />
          </button>

        </div>
      </header>

      {/* Cerrar notificaciones al clickear fuera */}
      {showNotifications && (
        <div
          onClick={() => setShowNotifications(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 999 }}
        />
      )}

      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={logout}
      />
    </>
  );
}
