import { useState, useEffect } from 'react';

export const Navbar = ({ onViewChange, currentView }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);
  
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const handleNavClick = (id) => {
    onViewChange(id);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const otherItems = [
    { id: 'tecnobyte', label: 'Tecnobyte' },
    { id: 'InibyteTv', label: 'InibyteTv' },
    { id: 'targetin', label: 'Target.In' }
  ];

  const buttonStyle = (isActive) => ({
    background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent', 
    color: isActive ? 'white' : 'rgba(255,255,255,0.6)', 
    border: 'none', 
    cursor: 'pointer', 
    padding: '0.45rem 1.1rem', 
    borderRadius: '99px', 
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
    fontSize: '0.85rem', 
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    position: 'relative',
    whiteSpace: 'nowrap'
  });

  const mobileLinkStyle = (isActive) => ({
    background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'none',
    border: 'none',
    color: isActive ? 'white' : 'rgba(255, 255, 255, 0.6)',
    fontSize: '1.8rem',
    fontWeight: '900',
    padding: '1.2rem 2rem',
    cursor: 'pointer',
    width: '90%',
    textAlign: 'center',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    fontFamily: 'var(--accent-font)',
    borderRadius: '16px',
    position: 'relative',
    transform: isActive ? 'scale(1.05)' : 'scale(1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem'
  });

  return (
    <>
      <div style={{ position: 'fixed', top: isMobile ? '1rem' : '1.5rem', left: 0, width: '100%', zIndex: 1000, display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
        <nav style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: isMobile ? '0.5rem 1rem' : '0.6rem 1.4rem', 
          background: 'rgba(15, 15, 15, 0.7)', 
          backdropFilter: 'blur(40px) saturate(180%)', 
          border: '1px solid rgba(255, 255, 255, 0.12)', 
          borderRadius: '99px', 
          gap: isMobile ? '0.2rem' : '0.5rem', 
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
          boxShadow: scrolled ? '0 20px 50px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)' : '0 4px 20px rgba(0,0,0,0.3)' 
        }}>
          {/* Logo */}
          <div onClick={() => handleNavClick('home')} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.4rem 0.8rem', position: 'relative' }}>
            <img src="/IniteckLogo.png" alt="Initeck Logo" style={{ height: isMobile ? '24px' : '28px', width: 'auto' }} />
          </div>

          {!isMobile ? (
            /* Desktop Navigation */
            <>
              <div style={{ display: 'flex', gap: '0.2rem' }}>
                <button onClick={() => handleNavClick('about')} style={buttonStyle(currentView === 'about')}>
                  Quiénes Somos
                  {currentView === 'about' && (
                    <div style={{ position: 'absolute', bottom: '-4px', left: '20%', right: '20%', height: '2px', background: 'var(--primary)', borderRadius: '2px', boxShadow: '0 0 10px var(--primary)' }}></div>
                  )}
                </button>
                
                <button onClick={() => handleNavClick('services')} style={buttonStyle(currentView === 'services')}>
                  Servicios
                  {currentView === 'services' && (
                    <div style={{ position: 'absolute', bottom: '-4px', left: '20%', right: '20%', height: '2px', background: 'var(--primary)', borderRadius: '2px', boxShadow: '0 0 10px var(--primary)' }}></div>
                  )}
                </button>

                <div className="nav-dropdown">
                  <button style={buttonStyle(otherItems.some(i => i.id === currentView))}>
                    Otros 
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ opacity: 0.5 }}>
                      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className="nav-dropdown-content">
                    {otherItems.map(item => (
                      <button 
                        key={item.id} 
                        className="nav-dropdown-item" 
                        onClick={() => handleNavClick(item.id)}
                        style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: currentView === item.id ? 'var(--primary)' : 'white' }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleNavClick('contact')} 
                style={{ 
                  background: 'var(--primary)', 
                  color: 'white', 
                  border: 'none', 
                  padding: '0.6rem 1.4rem', 
                  borderRadius: '99px', 
                  cursor: 'pointer', 
                  fontSize: '0.85rem', 
                  fontWeight: '800', 
                  marginLeft: '0.5rem',
                  boxShadow: currentView === 'contact' ? '0 0 25px var(--primary)' : '0 4px 15px rgba(220, 38, 38, 0.3)',
                  outline: currentView === 'contact' ? '2px solid rgba(255,255,255,0.4)' : 'none',
                  outlineOffset: '2px',
                  transition: 'all 0.3s ease'
                }}
              >
                Contáctanos
              </button>
            </>
          ) : (
            /* Mobile Navigation Toggle */
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'white', 
                padding: '0.4rem 1rem', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{ 
                width: '24px', 
                height: '18px', 
                position: 'relative', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between' 
              }}>
                <span style={{ width: '100%', height: '2px', background: 'white', transition: 'all 0.3s ease', transform: menuOpen ? 'translateY(8px) rotate(45deg)' : 'none' }} />
                <span style={{ width: '100%', height: '2px', background: 'white', transition: 'all 0.3s ease', opacity: menuOpen ? 0 : 1 }} />
                <span style={{ width: '100%', height: '2px', background: 'white', transition: 'all 0.3s ease', transform: menuOpen ? 'translateY(-8px) rotate(-45deg)' : 'none' }} />
              </div>
            </button>
          )}
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobile && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100vh', 
          background: 'rgba(0, 0, 0, 0.6)', 
          backdropFilter: 'blur(40px) saturate(150%)',
          zIndex: 999, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: menuOpen ? 'translateY(0)' : 'translateY(-100%)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'all' : 'none'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%', alignItems: 'center' }}>
            <button onClick={() => handleNavClick('home')} style={mobileLinkStyle(currentView === 'home')}>Inicio</button>
            <button onClick={() => handleNavClick('about')} style={mobileLinkStyle(currentView === 'about')}>Nosotros</button>
            <button onClick={() => handleNavClick('services')} style={mobileLinkStyle(currentView === 'services')}>Servicios</button>
            {otherItems.map(item => (
              <button key={item.id} onClick={() => handleNavClick(item.id)} style={mobileLinkStyle(currentView === item.id)}>{item.label}</button>
            ))}
            <button 
              onClick={() => handleNavClick('contact')} 
              style={{ 
                ...mobileLinkStyle(currentView === 'contact'), 
                color: 'var(--primary)',
                marginTop: '1.5rem',
                border: '1px solid rgba(220, 38, 38, 0.2)',
                background: currentView === 'contact' ? 'rgba(220, 38, 38, 0.1)' : 'transparent'
              }}
            >
              Contactar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
