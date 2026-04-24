export function Hero() {
  return (
    <section id="hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '18rem 2rem 28rem', overflow: 'hidden' }}>
      {/* Background Video */}
      <video 
        autoPlay 
        muted 
        loop 
        playsInline 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
      >
        <source src="/Intro.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay for Contrast */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.9) 100%)', zIndex: 1 }}></div>

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 className="gradient-text" style={{ 
          fontSize: 'clamp(4rem, 12vw, 11rem)', 
          marginBottom: '2rem', 
          animation: 'fadeInUp 1s ease-out forwards',
          textAlign: 'center'
        }}>
          Potencia tu Mundo<br />Con Tecnología.
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '4rem', lineHeight: '1.8', animation: 'fadeInUp 1.4s ease-out forwards' }}>
          Explora nuestros servicios especializados. Cada uno diseñado con la más alta calidad y tecnología de vanguardia.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', animation: 'fadeInUp 1.6s ease-out forwards' }}>
          <a href="#initeck-section" className="btn-primary" style={{ background: 'white', color: 'black', padding: '1.1rem 3rem', borderRadius: '99px', fontWeight: '800', textDecoration: 'none' }}>Conocer más</a>
        </div>
      </div>
    </section>
  );
}
