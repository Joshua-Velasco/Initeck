import React from 'react';
import './Booking.css';

const Booking = ({ revealRef }) => {
  const drivers = [
    { name: 'ÁNGEL', phone: '526567696979' },
  ];

  const openWhatsApp = (name, phone) => {
    const message = encodeURIComponent(`Hola, me gustaría agendar un servicio privado de SAFAR.`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <section id="reservar" className="booking">
      {/* Decorative Golden Blur */}
      <div className="booking-gold-blur"></div>

      <div className="booking-wrapper">
        <div ref={revealRef} className="reveal booking-content">
          <span className="booking-kicker">Concierge Privado</span>
          <h2 className="booking-title">Conexión <br/> <span className="shimmer-text">Inmediata</span></h2>
          <p className="booking-desc">
            En SAFAR, la exclusividad no admite esperas. Nuestro sistema de atención directa le conecta al instante con su equipo certificado.
          </p>
          <div className="booking-features">
            <div className="feature-item">
              <span className="feature-kicker">DISPONIBILIDAD TOTAL</span>
              <span className="feature-desc">Respuesta inmediata y personalizada las 24 horas del día.</span>
            </div>
            <div className="feature-item">
              <span className="feature-kicker">PROTOCOLO DE PRIVACIDAD</span>
              <span className="feature-desc">Atención directa bajo los más estrictos estándares de discreción.</span>
            </div>
          </div>
        </div>
        
        <div ref={revealRef} className="reveal booking-card-container">
          <div 
            onClick={() => openWhatsApp(drivers[0].name, drivers[0].phone)}
            className="hover-lift booking-card"
          >
            {/* Glossy Overlay */}
            <div className="card-gloss"></div>

            <div className="card-icon-wrapper">
              <div className="icon-bg">
                <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </div>
            </div>
            
            <h4 className="card-title">CONTACTO</h4>
            
            <div className="card-divider"></div>
            
            <span className="card-cta">INICIAR CHAT PRIVADO</span>
            
            <p className="card-note">ATENCIÓN PRIORITARIA EN MENOS DE 5 MIN</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Booking;
