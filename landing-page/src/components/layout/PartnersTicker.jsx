export const PartnersTicker = () => {
  const partners = [
    "TechGlobal", "Astra Systems", "Quantum Soluciones", "Nexo Industrial", 
    "Vanguard IT", "Global Connect", "Skyline Corp", "Helix Software",
    "Prisma Dynamics", "Orbit Tech", "Synapse Data", "Titan Engineering"
  ];

  return (
    <section style={{ padding: '4rem 0', background: 'black', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Empresas que confían en nosotros</p>
      </div>
      <div className="ticker-container">
        <div className="ticker-content" style={{ display: 'flex', gap: '5rem', alignItems: 'center' }}>
          {[...partners, ...partners].map((name, i) => (
            <div key={i} style={{ 
              fontSize: '1.5rem', 
              fontWeight: '900', 
              color: '#ffffff', 
              fontFamily: 'var(--heading)',
              transition: 'all 0.4s',
              cursor: 'default',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={e => {e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.transform = 'scale(1.1)';}}
            onMouseLeave={e => {e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.transform = 'scale(1)';}}>
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
