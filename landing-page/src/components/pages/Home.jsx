import { useScrollReveal } from '../../hooks/useScrollReveal';
import { ServiceCard } from '../shared/ServiceCard';
import { PartnersTicker } from '../layout/PartnersTicker';

// New Modular Components
import { Hero } from '../home/Hero';
import { IniteckSection } from '../home/IniteckSection';
import { QuoteSection } from '../home/QuoteSection';

export function Home({ onViewChange, services, onQuoteRequest }) {
  useScrollReveal();

  return (
    <div style={{ background: 'black', color: 'white', overflow: 'hidden' }}>
      <div className="section-blend">
        <Hero />
      </div>

      <div className="section-blend" style={{ marginTop: '-8rem' }}>
        <IniteckSection 
          initeck={services.initeck} 
          onViewChange={onViewChange} 
        />
      </div>

      <div className="section-blend" style={{ marginTop: '-8rem' }}>
        <QuoteSection 
          onViewChange={onViewChange} 
          onQuoteRequest={onQuoteRequest}
        />
      </div>

      {/* Other Services Grid Section */}
      <div className="section-blend" style={{ marginTop: '-8rem' }}>
        <section id="servicios" style={{ padding: '22rem 0', background: '#000000' }}>
          <div className="container">
            <div className="reveal" style={{ textAlign: 'center', marginBottom: '7rem' }}>
              <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.8rem)', marginBottom: '1.5rem', fontWeight: '900' }}>Explora Más Productos</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>Especialistas en transformar tu entorno digital con calidad y excelencia.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
              {Object.values(services)
                .filter(s => s && s.id !== 'initeck')
                .map(s => (
                  <ServiceCard key={s.id} {...s} onViewChange={onViewChange} />
                ))}
            </div>
          </div>
        </section>
      </div>

      <div style={{ marginTop: '-2rem', position: 'relative', zIndex: 20 }}>
        <PartnersTicker />
      </div>
    </div>
  );
}
