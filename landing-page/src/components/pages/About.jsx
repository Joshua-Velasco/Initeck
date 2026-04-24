import { useState, useEffect } from 'react';
import { AboutSection } from '../home/AboutSection';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export function About() {
  useScrollReveal();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fullValues = [
    { title: 'Innovación Tecnológica', icon: '🚀', desc: 'Lideramos la implementación de soluciones de última generación para anticipar los retos del futuro digital.' },
    { title: 'Integridad Profesional', icon: '🤝', desc: 'Actuamos con transparencia y ética, construyendo relaciones de confianza a largo plazo con nuestros socios.' },
    { title: 'Compromiso de Calidad', icon: '⭐', desc: 'Cada proyecto es una obra maestra de ingeniería, garantizando el máximo rendimiento y estabilidad.' },
    { title: 'Soporte Especializado', icon: '🛠️', desc: 'Nuestro equipo de expertos certificados está disponible 24/7 para asegurar la operatividad total.' },
    { title: 'Seguridad de Datos', icon: '🔒', desc: 'Protegemos los activos más valiosos de su empresa con protocolos de seguridad de nivel bancario.' },
    { title: 'Escalabilidad', icon: '📈', desc: 'Diseñamos infraestructuras que crecen al ritmo de su negocio, sin limitaciones técnicas.' }
  ];

  return (
    <div style={{ background: 'black', color: 'white', overflow: 'hidden' }}>
      <AboutSection />

      {/* Mission & Vision Section */}
      <section style={{ padding: isMobile ? '6rem 0' : '10rem 0', position: 'relative', overflow: 'hidden' }}>
        <div className="animate-blob" style={{ position: 'absolute', bottom: '-20%', left: '-15%', width: isMobile ? '100%' : '1200px', height: isMobile ? '100%' : '1200px', background: 'radial-gradient(circle, #7f1d1d 0%, transparent 75%)', filter: 'blur(150px)', opacity: 0.3 }}></div>
        <div className="animate-blob" style={{ position: 'absolute', top: '-10%', right: '-10%', width: isMobile ? '100%' : '1000px', height: isMobile ? '100%' : '1000px', background: 'radial-gradient(circle, #dc2626 0%, transparent 75%)', filter: 'blur(150px)', opacity: 0.2 }}></div>
        
        <div className="container" style={{ position: 'relative', zIndex: 1, padding: isMobile ? '0 1.5rem' : '0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))', gap: isMobile ? '2rem' : '4rem' }}>
            <div className="glass reveal" style={{ padding: isMobile ? '2rem' : '4rem', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, transparent, var(--primary), transparent)', opacity: 0.3 }}></div>
              <div style={{ marginBottom: '1.5rem', display: 'inline-block', padding: '0.8rem', background: 'rgba(159, 18, 57, 0.1)', borderRadius: '16px' }}>
                <span style={{ fontSize: '1.8rem' }}>🎯</span>
              </div>
              <h2 style={{ fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: '900', marginBottom: '1.5rem', fontFamily: 'var(--heading)', lineHeight: 1.2 }}>Nuestra Misión</h2>
              <p style={{ fontSize: isMobile ? '1.05rem' : '1.2rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                Empoderar a las organizaciones a través de infraestructuras tecnológicas de alto rendimiento, 
                garantizando que la conectividad y la seguridad sean los motores de su crecimiento y éxito comercial.
              </p>
            </div>
            
            <div className="glass reveal" style={{ padding: isMobile ? '2rem' : '4rem', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, transparent, var(--secondary), transparent)', opacity: 0.3 }}></div>
              <div style={{ marginBottom: '1.5rem', display: 'inline-block', padding: '0.8rem', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '16px' }}>
                <span style={{ fontSize: '1.8rem' }}>👁️‍🗨️</span>
              </div>
              <h2 style={{ fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: '900', marginBottom: '1.5rem', fontFamily: 'var(--heading)', lineHeight: 1.2 }}>Nuestra Visión</h2>
              <p style={{ fontSize: isMobile ? '1.05rem' : '1.2rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                Ser el referente líder en soluciones de TI y telecomunicaciones en la región, 
                siendo reconocidos por nuestra innovación constante, excelencia técnica y el profundo impacto positivo en el ecosistema digital empresarial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section style={{ padding: isMobile ? '6rem 0' : '10rem 0', background: 'rgba(255,255,255,0.01)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120%', height: '120%', background: 'radial-gradient(circle, rgba(220, 38, 38, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1, padding: isMobile ? '0 1.5rem' : '0' }}>
          <div style={{ textAlign: isMobile ? 'left' : 'center', marginBottom: isMobile ? '4rem' : '6rem' }}>
            <h2 className="gradient-text" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1rem', lineHeight: 1.1 }}>Valores que <br className={isMobile ? 'block' : 'hidden'} /> nos Impulsan</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? '1.1rem' : '1.2rem' }}>Los pilares que fundamentan nuestra excelencia profesional.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: isMobile ? '1.5rem' : '2.5rem' }}>
            {fullValues.map((v, i) => (
              <div key={i} className="glass reveal" style={{ padding: isMobile ? '2rem' : '3.3rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.03)', transition: 'all 0.3s ease' }}>
                <div style={{ fontSize: isMobile ? '2rem' : '2.5rem', marginBottom: '1.2rem' }}>{v.icon}</div>
                <h3 style={{ fontSize: isMobile ? '1.2rem' : '1.4rem', fontWeight: '800', marginBottom: '0.8rem' }}>{v.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Excellence Banner */}
      <section style={{ padding: isMobile ? '4rem 0' : '12rem 0', position: 'relative', overflow: 'hidden', background: '#000' }}>
        <div className="container" style={{ position: 'relative', textAlign: 'center', padding: isMobile ? '0 1rem' : '0' }}>
          <div className="glass reveal" style={{ padding: isMobile ? '3rem 1.5rem' : '6rem', borderRadius: isMobile ? '40px' : '60px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 style={{ fontSize: isMobile ? '2rem' : 'clamp(3rem, 6vw, 4.5rem)', fontWeight: '900', marginBottom: '1.5rem', fontFamily: 'var(--heading)', lineHeight: 1.1 }}>
              Infraestructura que <br className={isMobile ? 'block' : 'hidden'} /> <span style={{ color: 'var(--primary)' }}>Resiste el Tiempo.</span>
            </h2>
            <p style={{ fontSize: isMobile ? '1.1rem' : '1.4rem', color: 'var(--text-muted)', maxWidth: '900px', margin: '0 auto 3rem', lineHeight: '1.7' }}>
              Combinamos décadas de experiencia técnica con las herramientas más avanzadas para crear sistemas que simplemente funcionan.
            </p>
            <button 
              className="btn btn-primary" 
              onClick={() => onViewChange('contact')}
              style={{ fontSize: isMobile ? '1rem' : '1.1rem', padding: isMobile ? '1rem 2rem' : '1.2rem 3.5rem', borderRadius: '100px', width: isMobile ? '100%' : 'auto' }}
            >
              Hablemos de su Proyecto
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
