import { useState, useEffect } from 'react';
import { CheckIcon } from '../shared/Icons';

export function QuoteSection({ onViewChange, onQuoteRequest }) {
  const [projectType, setProjectType] = useState('Software a medida especializado');
  const [customDescription, setCustomDescription] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = () => {
    let message = `Me interesa una cotización para el proyecto: ${projectType}.`;
    if (projectType === 'Otros' && customDescription) {
      message += `\nDescripción adicional: ${customDescription}`;
    }
    
    if (onQuoteRequest) {
      onQuoteRequest(message);
    } else {
      if (onViewChange) onViewChange('contact');
    }
  };

  return (
    <section style={{ padding: isMobile ? '6rem 0' : '22rem 0', background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)', overflow: 'hidden' }}>
      <div className="container" style={{ padding: isMobile ? '0 1.5rem' : '0' }}>
        <div className="reveal glass" style={{ 
          padding: isMobile ? '2.5rem' : '5rem', 
          borderRadius: isMobile ? '32px' : '40px', 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', 
          gap: isMobile ? '3rem' : '4rem', 
          alignItems: 'center' 
        }}>
          <div>
            <h2 style={{ fontSize: isMobile ? '2rem' : '3rem', marginBottom: '1.5rem', fontWeight: '900', lineHeight: 1.1 }}>
              Cotización <span style={{ color: 'var(--primary)' }}>Personalizada</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? '1rem' : '1.1rem', marginBottom: '2.5rem', lineHeight: '1.7' }}>
              Entendemos que cada empresa es única. Nuestro equipo de ingenieros analizará sus necesidades específicas para ofrecerle la solución tecnológica más eficiente y rentable.
            </p>
            <ul style={{ listStyle: 'none', display: 'grid', gap: '1.2rem' }}>
              {[
                'Análisis técnico exhaustivo',
                'Presupuesto escalable y modular',
                'Soporte post-implementación 24/7',
                'Garantía de rendimiento del 99.9%'
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: '600', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                  <CheckIcon color="var(--primary)" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: isMobile ? '1.5rem' : '3rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '700' }}>TIPO DE PROYECTO</label>
              <select 
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', cursor: 'pointer', outline: 'none', fontSize: '0.9rem' }}
              >
                <option style={{ background: '#111' }}>Software a medida especializado</option>
                <option style={{ background: '#111' }}>Mantenimiento de sites e instalación</option>
                <option style={{ background: '#111' }}>Redes empresariales estructural</option>
                <option style={{ background: '#111' }}>Configuración de equipos y sites</option>
                <option style={{ background: '#111' }}>Servicio técnico experto</option>
                <option style={{ background: '#111' }}>Reparación de hardware</option>
                <option style={{ background: '#111' }}>Control de accesos</option>
                <option style={{ background: '#111' }}>Videovigilancia inteligente</option>
                <option style={{ background: '#111' }}>Otros</option>
              </select>
            </div>

            {projectType === 'Otros' && (
              <div style={{ marginBottom: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '700' }}>DESCRIPCIÓN DEL SERVICIO</label>
                <textarea 
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Cuéntanos brevemente qué necesitas..."
                  style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', minHeight: '100px', outline: 'none', resize: 'vertical', fontSize: '0.9rem' }}
                />
              </div>
            )}
            <button 
              onClick={handleSubmit} 
              style={{ width: '100%', padding: '1.2rem', background: 'white', color: 'black', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s' }} 
              onMouseEnter={e => e.currentTarget.style.transform='scale(1.02)'} 
              onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
            >
              Solicitar Diagnóstico Gratuito
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
