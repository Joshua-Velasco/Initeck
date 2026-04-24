import { useState } from 'react';
import { ArrowRight } from './Icons';

export const ServiceCard = ({ id, name, tag, tagline, description, cardDesc, image, accent, onViewChange, imgFilter = 'none' }) => {
  const [hovered, setHovered] = useState(false);
  const displayDesc = cardDesc || description;

  return (
    <div 
      onClick={() => onViewChange(id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="glass reveal" 
      style={{ 
        padding: '3rem 2.5rem 2.5rem', 
        borderRadius: '40px', 
        cursor: 'pointer', 
        transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
        overflow: 'hidden',
        position: 'relative',
        borderColor: hovered ? accent : 'rgba(255,255,255,0.08)',
        transform: hovered ? 'translateY(-10px)' : 'translateY(0)',
        boxShadow: hovered ? `0 20px 60px ${accent}25` : 'none',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '580px'
      }}
    >
      {/* Background Glow */}
      <div style={{ position: 'absolute', width: '150%', height: '150%', background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`, top: '-25%', right: '-25%', opacity: hovered ? 1 : 0, transition: 'opacity 0.5s', zIndex: 0 }}></div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ opacity: 0.5, fontSize: '0.7rem', fontWeight: '800', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{tag}</div>
        
        {/* Fixed height header area */}
        <div style={{ minHeight: '120px' }}>
          <h3 style={{ fontSize: '2.2rem', marginBottom: '0.8rem', lineHeight: '1.1' }}>{name}</h3>
          <p style={{ color: accent, fontWeight: '700', fontSize: '0.95rem', marginBottom: '1.2rem', minHeight: '1.2rem' }}>{tagline}</p>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem', flexGrow: 0, minHeight: '4.8rem', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {displayDesc}
        </p>
        
        {/* Card Asset Preview - Fixed Height & Centered */}
        <div style={{ height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 'auto 0 2rem', transition: 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)', transform: hovered ? 'scale(1.1) rotate(5deg)' : 'scale(1)' }}>
            <img src={image} alt={name} style={{ height: '100%', width: 'auto', maxWidth: '100%', objectFit: 'contain', filter: imgFilter }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '700', color: hovered ? 'white' : accent, transition: 'color 0.3s', marginTop: 'auto' }}>
          Explorar detalles <ArrowRight />
        </div>
      </div>
    </div>
  );
};
