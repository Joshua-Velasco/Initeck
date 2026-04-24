import { useState, useEffect } from 'react';
import { 
  CodeIcon, ToolsIcon, NetworkIcon, SettingsIcon, 
  SupportIcon, CpuIcon, LockIcon, CameraIcon 
} from '../shared/Icons';

export function IniteckSection({ initeck, onViewChange }) {
  if (!initeck) return null;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cardWidth = isMobile ? 260 : 320; 
  const gap = isMobile ? 20 : 40;

  // Custom icons mapping based on index
  const getIcon = (index, color, size) => {
    const iconProps = { color, size };
    switch(index) {
      case 0: return <CodeIcon {...iconProps} />;
      case 1: return <ToolsIcon {...iconProps} />;
      case 2: return <NetworkIcon {...iconProps} />;
      case 3: return <SettingsIcon {...iconProps} />;
      case 4: return <SupportIcon {...iconProps} />;
      case 5: return <CpuIcon {...iconProps} />;
      case 6: return <LockIcon {...iconProps} />;
      case 7: return <CameraIcon {...iconProps} />;
      default: return null;
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % initeck.features.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [initeck.features.length]);

  return (
    <section id="initeck-section" style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: isMobile ? '8rem 0' : '22rem 0',
      overflow: 'hidden',
      background: 'radial-gradient(circle at center, #300202 0%, #000000 100%)'
    }}>
      {/* Background Decor */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', width: isMobile ? '150px' : '300px', height: isMobile ? '150px' : '300px', background: initeck.accent, filter: 'blur(100px)', opacity: 0.1 }}></div>
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: isMobile ? '150px' : '300px', height: isMobile ? '150px' : '300px', background: initeck.accent, filter: 'blur(100px)', opacity: 0.1 }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '1200px', width: '100%', padding: isMobile ? '0 1.5rem' : '0' }}>
        <div className="reveal">
          <h2 style={{ 
            fontFamily: 'var(--accent-font)', 
            fontSize: 'clamp(2.5rem, 10vw, 6.5rem)', 
            fontWeight: '300', 
            lineHeight: isMobile ? '1.1' : '0.9', 
            marginBottom: '1.5rem',
            color: 'white',
            letterSpacing: '-0.04em'
          }}>
            Liderando la <br />
            <span>Era Digital.</span>
          </h2>

          {initeck.description && (
            <p style={{ 
              color: 'rgba(255,255,255,0.8)', 
              fontSize: isMobile ? '1rem' : '1.15rem', 
              lineHeight: '1.6', 
              maxWidth: '850px', 
              margin: '0 auto 4rem auto', 
              fontWeight: '400'
            }}>
              {initeck.description}
            </p>
          )}
        </div>

        {/* Carousel Container */}
        <div className="reveal" style={{ width: '100%', position: 'relative', height: isMobile ? '360px' : '460px', overflow: 'visible' }}>
          <div style={{ 
            position: 'absolute',
            left: '50%',
            display: 'flex', 
            gap: `${gap}px`, 
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: `translateX(calc(-${activeIndex * (cardWidth + gap)}px - ${cardWidth / 2}px))`,
            width: 'max-content'
          }}>
            {initeck.features.map((feature, index) => {
              const isActive = index === activeIndex;
              return (
                <div 
                  key={index} 
                  onClick={() => setActiveIndex(index)}
                  style={{ 
                    width: `${cardWidth}px`, 
                    height: isMobile ? '260px' : '320px', 
                    background: isActive ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', 
                    border: isActive ? `1px solid ${initeck.accent}90` : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '24px',
                    padding: isMobile ? '2rem 1.5rem' : '3rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    opacity: isActive ? 1 : 0.2,
                    transform: isActive ? 'scale(1.05)' : 'scale(0.85)',
                    boxShadow: isActive ? `0 20px 80px ${initeck.accent}30` : 'none',
                    backdropFilter: 'blur(16px)',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  <div style={{ width: isMobile ? '48px' : '64px', height: isMobile ? '48px' : '64px', background: `${initeck.accent}20`, border: `1px solid ${initeck.accent}50`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? '1.2rem' : '2rem' }}>
                    {getIcon(index, initeck.accent, isMobile ? 24 : 32)}
                  </div>
                  <h4 style={{ color: 'white', fontSize: isMobile ? '0.95rem' : '1.2rem', fontWeight: '800', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.3' }}>
                    {feature.title}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>

        {/* Indicators */}
        <div className="reveal" style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginTop: isMobile ? '2rem' : '4rem' }}>
          {initeck.features.map((_, i) => (
            <div 
              key={i} 
              onClick={() => setActiveIndex(i)}
              style={{ 
                width: i === activeIndex ? (isMobile ? '30px' : '40px') : (isMobile ? '8px' : '10px'), 
                height: '4px', 
                background: i === activeIndex ? initeck.accent : 'rgba(255,255,255,0.2)', 
                borderRadius: '2px', 
                transition: 'all 0.4s ease',
                cursor: 'pointer'
              }} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}
