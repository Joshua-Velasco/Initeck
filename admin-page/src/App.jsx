import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Mission from './components/Mission';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <Mission />
      
      <footer style={{ 
        textAlign: 'center', 
        padding: '2rem', 
        color: 'var(--color-text-muted)',
        borderTop: '1px solid #1f1f1f',
        background: '#0a0a0a'
      }}>
        <p>© {new Date().getFullYear()} Initeck. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default App;
