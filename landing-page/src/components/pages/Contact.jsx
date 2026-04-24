import { useState, useEffect } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export const Contact = ({ initialData }) => {
    useScrollReveal();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                message: initialData
            }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEmailSubmit = () => {
        const subject = encodeURIComponent(`Nueva Cotización - ${formData.name}`);
        const body = encodeURIComponent(`Nombre: ${formData.name}\nCorreo: ${formData.email}\n\n${formData.message}`);
        window.location.href = `mailto:cotizaciones@initeck.mx?subject=${subject}&body=${body}`;
    };

    return (
        <section id="contacto" style={{ padding: '10rem 0', background: 'black', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '6rem', alignItems: 'flex-start' }}>
              <div className="reveal">
                <h2 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', lineHeight: '1', marginBottom: '2.5rem', fontWeight: '900' }}>Hablemos de tu<br /><span className="gradient-text">crecimiento.</span></h2>
                
                <div style={{ marginBottom: '4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '1rem', background: 'var(--primary)', borderRadius: '12px', display: 'flex' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700' }}>Llámanos</p>
                            <a href="tel:+526562797977" style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white', textDecoration: 'none' }}>+52 656 279 7977</a>
                        </div>
                    </div>
                </div>

                <div className="glass" style={{ padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontWeight: '800' }}>¿Necesitas soporte?</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>Nuestro equipo técnico está listo para ayudarte con cualquier incidencia.</p>
                    <a href="mailto:soporte@initeck.mx" style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.1rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        soporte@initeck.mx 
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                </div>
              </div>

              <div className="glass reveal" style={{ padding: '4rem', borderRadius: '48px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tu Nombre" 
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.2rem', color: 'white', width: '100%', boxSizing: 'border-box', outline: 'none' }} 
                />
                <input 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Correo Electrónico" 
                    type="email" 
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.2rem', color: 'white', width: '100%', boxSizing: 'border-box', outline: 'none' }} 
                />
                <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="¿En qué podemos ayudarte?" 
                    rows={6} 
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.2rem', color: 'white', width: '100%', boxSizing: 'border-box', resize: 'none', outline: 'none' }} 
                />
                <button 
                  onClick={handleEmailSubmit}
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '1.2rem', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 20px rgba(220, 38, 38, 0.2)', transition: 'all 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
                >
                    Enviar Cotización
                </button>
              </div>
            </div>
          </div>
        </section>
    );
};
