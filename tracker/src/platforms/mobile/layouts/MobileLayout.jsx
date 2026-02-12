import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Truck, Map, User, Menu, LogOut, Users, DollarSign, UserCog } from 'lucide-react';
import { useAuth } from '../../../modules/auth/AuthProvider';

const MobileLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const handleLogoutRequest = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };
  
  // Custom Bottom Tab Bar
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Mobile Header - Glassmorphism */}
      <nav 
        className="navbar navbar-dark sticky-top shadow-sm"
        style={{
          backgroundColor: 'rgba(15, 15, 15, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottomLeftRadius: '15px',
          borderBottomRightRadius: '15px',
          paddingTop: 'max(env(safe-area-inset-top), 25px)', // Fixed: Prevent clipping status bar
          paddingBottom: '10px',
          zIndex: 1040
        }}
      >
        <div className="container-fluid d-flex justify-content-between align-items-center px-3">
          <div className="d-flex align-items-center gap-2">
             <div className="bg-white rounded-circle p-1 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                <User size={18} className="text-dark" />
             </div>
             <div>
               <div className="fw-bold text-white lh-1" style={{ fontSize: '0.9rem' }}>{user?.nombre?.split(' ')[0]}</div>
               <div className="text-white-50 lh-1" style={{ fontSize: '0.9rem' }}>{user?.rol}</div>
             </div>
          </div>
          <button onClick={handleLogoutRequest} className="btn btn-link text-white-50 p-0">
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow-1 pb-5 mb-5 overflow-auto px-2 pt-3 d-flex flex-column">
        {children}
      </main>

      {/* Bottom Navigation Bar - Floating Style */}
      <nav 
         className="fixed-bottom" 
         style={{ 
            paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
            paddingLeft: '0.25rem',
            paddingRight: '0.25rem',
            marginBottom: '0.5rem',
            zIndex: 1050
         }}
      >
        <div 
          className="d-flex justify-content-between align-items-center py-2 px-1 bg-white shadow-lg"
          style={{
             borderRadius: '25px',
             border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <NavLink to="/" className={({ isActive }) => `text-decoration-none d-flex flex-column align-items-center transition-all ${isActive ? 'text-primary' : 'text-muted'}`} style={{ minWidth: '40px', flex: 1 }}>
            {({ isActive }) => (
              <>
                <Home size={isActive ? 22 : 18} strokeWidth={isActive ? 2.5 : 2} />
                <span style={{ fontSize: '8px', marginTop: '2px', fontWeight: isActive ? 'bold' : 'normal' }}>Inicio</span>
              </>
            )}
          </NavLink>
          
          <NavLink to="/autos" className={({ isActive }) => `text-decoration-none d-flex flex-column align-items-center transition-all ${isActive ? 'text-primary' : 'text-muted'}`} style={{ minWidth: '40px', flex: 1 }}>
             {({ isActive }) => (
              <>
                <Truck size={isActive ? 22 : 18} strokeWidth={isActive ? 2.5 : 2} />
                <span style={{ fontSize: '8px', marginTop: '2px', fontWeight: isActive ? 'bold' : 'normal' }}>Autos</span>
              </>
            )}
          </NavLink>

          {/* Botón Central Destacado (Map) */}
          <NavLink to="/viajes" className={({ isActive }) => `text-decoration-none d-flex justify-content-center align-items-center rounded-circle shadow-sm ${isActive ? 'bg-primary text-white' : 'bg-light text-muted'}`}
            style={{ width: '48px', height: '48px', marginTop: '-20px', border: '4px solid #fff' }}
          >
             <Map size={24} />
          </NavLink>

          <NavLink to="/empleados" className={({ isActive }) => `text-decoration-none d-flex flex-column align-items-center transition-all ${isActive ? 'text-primary' : 'text-muted'}`} style={{ minWidth: '40px', flex: 1 }}>
             {({ isActive }) => (
               <>
                 <UserCog size={isActive ? 22 : 18} strokeWidth={isActive ? 2.5 : 2} />
                 <span style={{ fontSize: '8px', marginTop: '2px', fontWeight: isActive ? 'bold' : 'normal' }}>Equipo</span>
               </>
             )}
          </NavLink>

          <NavLink to="/viajes-empleado" className={({ isActive }) => `text-decoration-none d-flex flex-column align-items-center transition-all ${isActive ? 'text-primary' : 'text-muted'}`} style={{ minWidth: '40px', flex: 1 }}>
             {({ isActive }) => (
               <>
                 <Users size={isActive ? 22 : 18} strokeWidth={isActive ? 2.5 : 2} />
                 <span style={{ fontSize: '8px', marginTop: '2px', fontWeight: isActive ? 'bold' : 'normal' }}>Regs</span>
               </>
             )}
          </NavLink>

          <NavLink to="/balance" className={({ isActive }) => `text-decoration-none d-flex flex-column align-items-center transition-all ${isActive ? 'text-primary' : 'text-muted'}`} style={{ minWidth: '40px', flex: 1 }}>
             {({ isActive }) => (
               <>
                 <DollarSign size={isActive ? 22 : 18} strokeWidth={isActive ? 2.5 : 2} />
                 <span style={{ fontSize: '8px', marginTop: '2px', fontWeight: isActive ? 'bold' : 'normal' }}>$</span>
               </>
             )}
          </NavLink>
        </div>
      </nav>

      {/* Logout Modal - Mobile Optimized */}
      {showLogoutModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-4 shadow-lg mx-3" style={{ maxWidth: '340px', width: '100%' }}>
            <div className="p-4 text-center">
              <div className="mb-3">
                <LogOut size={48} className="text-danger" />
              </div>
              <h5 className="fw-bold mb-2">¿Cerrar Sesión?</h5>
              <p className="text-muted small mb-4">¿Estás seguro que deseas salir?</p>
              <div className="d-flex gap-2">
                <button className="btn btn-light flex-grow-1 rounded-pill py-2" onClick={() => setShowLogoutModal(false)}>
                  Cancelar
                </button>
                <button className="btn btn-danger flex-grow-1 rounded-pill py-2" onClick={confirmLogout}>
                  Salir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileLayout;
