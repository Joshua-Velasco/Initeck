import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, Users, ShieldCheck } from 'lucide-react';

const Mission = () => {
  const cards = [
    {
      title: 'Estructura Sólida',
      desc: 'Base firme para el crecimiento sostenible de la empresa.',
      icon: <ShieldCheck size={32} color="var(--color-blue)" />,
      border: 'var(--color-blue)'
    },
    {
      title: 'Procesos Eficientes',
      desc: 'Optimización continua de flujos de trabajo.',
      icon: <TrendingUp size={32} color="var(--color-green)" />,
      border: 'var(--color-green)'
    },
    {
      title: 'Organización Total',
      desc: 'Control y seguimiento detallado de cada operación.',
      icon: <CheckCircle2 size={32} color="var(--color-purple)" />,
      border: 'var(--color-purple)'
    },
    {
      title: 'Trabajo en Equipo',
      desc: 'Sinergia colaborativa para alcanzar metas comunes.',
      icon: <Users size={32} color="var(--color-red)" />,
      border: 'var(--color-red)'
    }
  ];

  return (
    <section className="mission-section" style={{
      padding: '5rem 2rem',
      background: '#0f0f0f'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem' 
          }}
        >
          {cards.map((card, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              style={{
                background: '#1a1a1a',
                padding: '2rem',
                borderRadius: '12px',
                borderTop: `4px solid ${card.border}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ marginBottom: '1rem' }}>{card.icon}</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{card.title}</h3>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.5' }}>{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Mission;
