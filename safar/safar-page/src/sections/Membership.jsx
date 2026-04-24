import React from 'react';
import './Membership.css';

const Membership = ({ revealRef }) => {
  return (
    <section className="membership">
      {/* Decorative background elements */}
      <div className="membership-bg-glow"></div>

      <div ref={revealRef} className="reveal membership-content">
        <span className="membership-kicker">Membresía VIP Elite</span>
        
        <h2 className="membership-title">
          PRÓXIMA<span className="shimmer-text">MENTE</span>
        </h2>

        <div className="membership-divider"></div>

        <p className="membership-desc">
          Un club exclusivo diseñado para quienes exigen lo extraordinario. Beneficios sin precedentes, flota personalizada y atención prioritaria global.
        </p>
      </div>
    </section>
  );
};

export default Membership;
