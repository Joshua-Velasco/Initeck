import React, { useState } from 'react';
import './Navbar.css';

const Navbar = ({ activeView, setActiveView, authUser, setAuthUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setAuthUser(null);
    setActiveView('home');
    setShowLogoutConfirm(false);
    setIsOpen(false);
  };

  const navItems = authUser ? [] : [
    { id: 'home', label: 'INICIO' },
    { id: 'experience', label: 'EXPERIENCIA' },
  ];

  return (
    <div className="navbar-wrapper">
      <nav className="navbar">
        {/* Brand/Logo */}
        <div 
          onClick={() => { if (!authUser) { setActiveView('home'); setIsOpen(false); } }}
          className="navbar-brand"
          style={{ cursor: authUser ? 'default' : 'pointer' }}
        >
          <img 
            src="/Safar.png" 
            alt="Logo" 
            style={{ height: '24px', width: 'auto' }} 
          />
        </div>
        
        {/* Desktop Navigation (Centered) */}
        <div className="nav-links-desktop">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`nav-link ${activeView === item.id ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="navbar-actions">
          {authUser ? (
            <>
              <button 
                className="navbar-vip-btn dashboard-nav-btn" 
                onClick={() => setActiveView('dashboard')}
              >
                MI PANEL
              </button>
              <button 
                className="logout-icon-btn"
                onClick={() => setShowLogoutConfirm(true)}
                title="Cerrar Sesión"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </>
          ) : (
            <>
              <button 
                className="navbar-vip-btn login-nav-btn" 
                onClick={() => setActiveView('signin')}
              >
                INICIAR SESIÓN
              </button>
              <button 
                className="navbar-vip-btn" 
                onClick={() => setActiveView('login')}
              >
                CONTACTO
              </button>
            </>
          )}
        </div>
        
        {/* Mobile Toggle Button */}
        <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
          <div className="menu-toggle-line" style={{ width: '22px', marginBottom: '5px', transform: isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }}></div>
          <div className="menu-toggle-line" style={{ width: isOpen ? '22px' : '14px', marginLeft: isOpen ? '0' : '8px', transform: isOpen ? 'rotate(-45deg) translate(1px, -1px)' : 'none' }}></div>
        </button>
      </nav>

      {/* Mobile Dropdown (Outside the pill to prevent clipping) */}
      <div className={`mobile-dropdown ${isOpen ? 'open' : ''}`}>
        {navItems.map(item => (
          <a
            key={item.id}
            href="#"
            className={`mobile-nav-link ${activeView === item.id ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveView(item.id);
              setIsOpen(false);
            }}
          >
            {item.label}
          </a>
        ))}
        {authUser ? (
          <>
            <button 
              className="mobile-vip-btn"
              onClick={() => {
                setActiveView('dashboard');
                setIsOpen(false);
              }}
              style={{ marginBottom: '10px', background: 'transparent', border: '1px solid var(--color-secondary)', color: 'var(--color-secondary)' }}
            >
              MI PANEL
            </button>
            <button 
              className="mobile-vip-btn logout-mobile-btn"
              onClick={() => setShowLogoutConfirm(true)}
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <span style={{ marginRight: '10px' }}>🚪</span> CERRAR SESIÓN
            </button>
          </>
        ) : (
          <>
            <button 
              className="mobile-vip-btn"
              onClick={() => {
                setActiveView('signin');
                setIsOpen(false);
              }}
              style={{ marginBottom: '10px', background: 'transparent', border: '1px solid var(--color-secondary)', color: 'var(--color-secondary)' }}
            >
              INICIAR SESIÓN
            </button>
            <button 
              className="mobile-vip-btn"
              onClick={() => {
                setActiveView('login');
                setIsOpen(false);
              }}
            >
              CONTACTO
            </button>
          </>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="logout-modal-overlay">
          <div className="logout-modal-content">
            <h3>¿Cerrar Sesión Elite?</h3>
            <p>¿Estás seguro que deseas salir de tu panel actual?</p>
            <div className="logout-modal-actions">
              <button className="confirm-logout-btn" onClick={handleLogout}>SÍ, SALIR</button>
              <button className="cancel-logout-btn" onClick={() => setShowLogoutConfirm(false)}>CANCELAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
