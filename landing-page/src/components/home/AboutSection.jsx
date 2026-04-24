import { useState, useEffect } from 'react';

export function AboutSection() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const values = [
    { title: 'Innovación Constante', desc: 'Implementamos las últimas tecnologías para mantener a nuestros clientes a la vanguardia del mercado.' },
    { title: 'Alto Impacto', desc: 'Nuestras soluciones generan resultados tangibles y escalables en la productividad empresarial.' },
    { title: 'Excelencia Técnica', desc: 'Contamos con un equipo de ingenieros certificados dedicados a la calidad total en cada proyecto.' }
  ];

  return (
    <section id="about" style={{ padding: isMobile ? '6rem 0' : '9rem 0 10rem', background: 'var(--background)', position: 'relative', overflow: 'hidden' }}>
      {/* Background Decor */}
      <div className="animate-blob" style={{ position: 'absolute', top: '-15%', right: '10%', width: isMobile ? '100%' : '1000px', height: isMobile ? '100%' : '1000px', background: 'radial-gradient(circle, #7f1d1d 0%, transparent 75%)', filter: 'blur(100px)', opacity: 0.5, zIndex: 0 }}></div>
      <div className="animate-blob" style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: isMobile ? '100%' : '1200px', height: isMobile ? '100%' : '1200px', background: 'radial-gradient(circle, #450a0a 0%, transparent 75%)', filter: 'blur(150px)', opacity: 0.6, zIndex: 0 }}></div>
      
      <div className="container" style={{ padding: isMobile ? '0 1.5rem' : '0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '4rem' : '8rem', alignItems: 'center' }}>
          <div className="reveal">
            <h2 className="gradient-text" style={{ fontSize: 'clamp(2.5rem, 8vw, 5.5rem)', marginBottom: '2rem', lineHeight: 1.1 }}>
              Innovación que <br />
              <span style={{ color: 'var(--primary)', fontFamily: 'var(--heading)', fontWeight: '900' }}>Define el Futuro.</span>
            </h2>
            <p style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '3rem' }}>
              En Initeck Technology, no solo instalamos equipos; diseñamos el ecosistema digital que impulsa a las empresas modernas. Transformamos la conectividad y la seguridad en activos estratégicos.
            </p>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {values.map((v, i) => (
                <div key={i} className="glass" style={{ padding: isMobile ? '1.5rem' : '2rem', borderRadius: '24px', borderLeft: '4px solid var(--primary)' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.4rem' }}>{v.title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal" style={{ position: 'relative' }}>
            <div style={{ position: 'relative', borderRadius: '32px', overflow: 'hidden', height: isMobile ? '450px' : '700px', border: '1px solid var(--border-color)' }}>
              <img 
                src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop" 
                alt="Innovation" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--background) 0%, transparent 100%)' }}></div>
              <div style={{ position: 'absolute', bottom: isMobile ? '1.5rem' : '4rem', left: isMobile ? '1.5rem' : '4rem', right: isMobile ? '1.5rem' : '4rem' }}>
                <div className="glass" style={{ padding: isMobile ? '1.5rem' : '3rem', borderRadius: '24px' }}>
                  <h3 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', marginBottom: '0.8rem', fontWeight: '900' }}>Sobre Nosotros</h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: isMobile ? '0.95rem' : '1.1rem', lineHeight: '1.6' }}>
                    Socio estratégico definitivo en infraestructuras críticas y desarrollo especializado para el sector empresarial.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Floating Stats */}
            <div className="glass animate-float-slow" style={{ 
              position: 'absolute', 
              top: isMobile ? '-1.5rem' : '10%', 
              right: isMobile ? '1rem' : '-3rem', 
              padding: isMobile ? '1rem 1.5rem' : '1.5rem 2.5rem', 
              borderRadius: '20px', 
              zIndex: 10,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              <span style={{ display: 'block', fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: '900', color: 'var(--primary)', lineHeight: 1 }}>+10 Años</span>
              <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}>DE EXPERIENCIA</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
