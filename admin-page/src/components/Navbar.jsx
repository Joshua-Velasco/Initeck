import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Car, Building2, Menu, X, Plane, Tv } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const links = [
    { name: 'Inicio', url: 'https://admin.initeck.com.mx/', icon: <LayoutGrid size={18} /> },
    { name: 'Uber Initeck', url: 'https://admin.initeck.com.mx/uber', icon: <Car size={18} /> },
    { name: 'Initeck', url: 'https://admin.initeck.com.mx/Initeck', icon: <Building2 size={18} /> },
    { name: 'Safar', url: 'https://safar.initeck.com.mx/', icon: <Plane size={18} /> },
    { name: 'Streaming', url: 'https://streaming.initeck.com.mx/', icon: <Tv size={18} /> },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '1rem 2rem',
        background: isOpen ? 'rgba(10, 10, 10, 0.95)' : 'rgba(10, 10, 10, 0.7)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#fff', letterSpacing: '-0.02em' }}>
          INITECK <span style={{ color: 'var(--color-blue)' }}>ADMIN</span>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsOpen(!isOpen)}
          style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Menu */}
        <div className="desktop-menu" style={{ display: 'flex', gap: '2rem' }}>
          {links.map((link) => (
            <a 
              key={link.name} 
              href={link.url}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                fontSize: '0.9rem',
                color: 'var(--color-text-muted)',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-text)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >
              {link.icon}
              {link.name}
            </a>
          ))}
        </div>
      </div>

      {/* Mobile Menu Content */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mobile-menu-content"
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem', paddingBottom: '1rem' }}
        >
          {links.map((link) => (
            <a 
              key={link.name} 
              href={link.url}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.8rem',
                fontSize: '1rem',
                color: '#fff',
                padding: '0.5rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              {link.icon}
              {link.name}
            </a>
          ))}
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
