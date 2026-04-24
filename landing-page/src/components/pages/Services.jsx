import { useState, useEffect } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export function Services() {
  useScrollReveal();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const allServices = [
    { 
      title: 'Desarrollo de Software', 
      icon: '💻', 
      desc: 'Páginas y aplicaciones web, apps móviles/escritorio y gestión avanzada de bases de datos.', 
      span: 'col-span-2 row-span-2',
      img: '/services/software_dev.png'
    },
    { 
      title: 'Cableado Estructurado', 
      icon: '🔌', 
      desc: 'Administración de red, instalación de segmentos (VLAN y VoIP), red inalámbrica y monitoreo de flujo.', 
      span: 'col-span-2',
      img: '/services/cabling.png'
    },
    { 
      title: 'Telefonía VoIP', 
      icon: '📞', 
      desc: 'Desvío de llamadas, correo de voz, conferencias electrónicas y llamadas internacionales.',
      img: '/services/voip.png'
    },
    { 
      title: 'Control de Acceso', 
      icon: '🛡️', 
      desc: 'Detectores de metal, chapas magnéticas, biométricos y gestión vehicular inteligente.',
      img: '/services/access.png'
    },
    { 
      title: 'Videovigilancia', 
      icon: '📹', 
      desc: 'Cámaras de alta definición, grabación digital y monitoreo profesional en tiempo real.', 
      span: 'row-span-2',
      img: '/services/surveillance.png'
    },
    { 
      title: 'Domótica', 
      icon: '🏠', 
      desc: 'Asistencias virtuales, control por voz, iluminación y climatización inteligente.', 
      span: 'col-span-2',
      img: '/services/domotics.png'
    },
    { 
      title: 'Soporte Técnico', 
      icon: '🛠️', 
      desc: 'Mantenimiento preventivo/correctivo y soporte de servidores.',
      img: '/services/support.png'
    },
    { 
      title: 'Venta de Hardware', 
      icon: '🖥️', 
      desc: 'Distribución de servidores y equipos de red.',
      img: '/services/hardware.png'
    },
    { 
      title: 'Venta de Software', 
      icon: '💿', 
      desc: 'Licenciamiento corporativo y herramientas de productividad.',
      img: '/services/software_sales.png'
    }
  ];

  return (
    <div style={{ 
      background: 'black', 
      color: 'white', 
      minHeight: '100vh', 
      paddingTop: isMobile ? '100px' : '140px', 
      paddingBottom: '100px', 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      {/* Cinematic Background Image with Red Overlay */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundImage: 'url("/services/bg_tech.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.1,
        zIndex: 0,
        filter: 'grayscale(1) brightness(0.5)'
      }}></div>
      
      {/* Primary Red Atmosphere */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(127, 29, 29, 0.15) 50%, rgba(0,0,0,0.95) 100%)',
        zIndex: 0
      }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1, padding: isMobile ? '0 1.5rem' : '0' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: isMobile ? '3rem' : '5rem' }}>
          <h1 className="gradient-text" style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', marginBottom: '1rem', lineHeight: 1.1 }}>
            Ecosistema <br />
            <span>Smart</span>
          </h1>
          <p style={{ fontSize: isMobile ? '1.1rem' : '1.2rem', color: 'rgba(255,255,255,0.6)', maxWidth: '700px', margin: '0 auto', fontWeight: '500' }}>
            Soluciones integrales que fusionan hardware avanzado y software de última generación.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', 
          gap: isMobile ? '1rem' : '1.5rem',
          gridAutoRows: isMobile ? 'minmax(240px, auto)' : 'minmax(280px, auto)'
        }}>
          {allServices.map((s, i) => (
            <div key={i} className={`glass reveal ${s.span || ''}`} style={{ 
              borderRadius: isMobile ? '24px' : '32px', 
              border: '1px solid rgba(255,255,255,0.05)', 
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(40px)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gridColumn: isMobile ? 'span 1' : (s.span?.includes('col-span-2') ? 'span 2' : 'span 1'),
              gridRow: isMobile ? 'span 1' : (s.span?.includes('row-span-2') ? 'span 2' : 'span 1')
            }} 
            onMouseEnter={e => {
              if (isMobile) return;
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.01)';
              e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.5)';
              e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.8), 0 0 20px rgba(220, 38, 38, 0.1)';
            }} 
            onMouseLeave={e => {
              if (isMobile) return;
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              {/* Card Image Background with Gradient Protector */}
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                zIndex: 0,
                backgroundImage: `url("${s.img}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.4,
                transition: 'opacity 0.4s ease'
              }}></div>
              
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.95) 100%)',
                zIndex: 1
              }}></div>

              <div style={{ padding: isMobile ? '1.5rem' : '2.5rem', position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: isMobile ? '2.2rem' : '3rem', marginBottom: '1rem', opacity: 0.9 }}>{s.icon}</div>
                <h3 style={{ 
                  fontSize: isMobile ? '1.4rem' : (s.span?.includes('span-2') ? '2rem' : '1.4rem'), 
                  fontWeight: '900', 
                  marginBottom: '0.8rem',
                  fontFamily: 'var(--heading)',
                  color: 'white',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}>{s.title}</h3>
                <p style={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  lineHeight: '1.5', 
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
