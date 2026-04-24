import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Tv, MonitorPlay, Settings, LogOut, DollarSign, Package, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config';

const MainLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [services, setServices] = useState([]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    fetch(`${API_URL}/api/services`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setServices(data);
      })
      .catch(err => console.error('Error fetching services:', err));
  }, []);

  return (
    <div className="app-container">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <MonitorPlay size={28} color="var(--primary)" />
          INIBAY <span>Manager</span>
        </div>

        <nav style={{ flex: 1 }}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>

          {services.filter(s => s.slug).map(service => (
            <NavLink
              key={service.id}
              to={`/service/${service.slug?.toLowerCase()}`}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <Tv size={20} />
              {service.nombre}
            </NavLink>
          ))}

          <NavLink
            to="/finanzas"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <DollarSign size={20} />
            Finanzas
          </NavLink>

          <NavLink
            to="/inventario"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <Package size={20} />
            Inventario
          </NavLink>
        </nav>

        <nav style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <NavLink
            to="/configuracion"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <Settings size={20} />
            Configuración
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-wrapper">
        <header className="header glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen(prev => !prev)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="header-title">Resumen General</div>
          </div>
          <div className="header-actions">
            <button onClick={handleLogout} className="action-btn" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <section className="content-area">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default MainLayout;
