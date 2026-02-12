import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="hero-container" style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '0 2rem',
      background: 'radial-gradient(circle at 50% 50%, #1e1e1e 0%, var(--color-bg) 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Glows */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: '300px',
        height: '300px',
        background: 'var(--color-blue)',
        filter: 'blur(150px)',
        opacity: 0.2,
        borderRadius: '50%'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '20%',
        width: '300px',
        height: '300px',
        background: 'var(--color-purple)',
        filter: 'blur(150px)',
        opacity: 0.2,
        borderRadius: '50%'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 style={{ 
          fontSize: '1rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.2rem', 
          color: 'var(--color-text-muted)',
          marginBottom: '1rem'
        }}>
          Portal Administrativo
        </h2>
        
        <h1 className="hero-title" style={{ 
          fontSize: '4rem', 
          background: 'linear-gradient(to right, #fff, #a3a3a3)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '2rem',
          maxWidth: '800px',
          lineHeight: 1.1
        }}>
          Orden, Organización, Planeación y <br />
          <span style={{ color: 'var(--color-blue)', WebkitTextFillColor: 'var(--color-blue)' }}>Trabajo en Conjunto</span>
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--color-text-muted)',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: 1.6
        }}>
          Dedicado a mejorar la estructura y los procesos de la empresa.
        </p>
      </motion.div>
    </section>
  );
};

export default Hero;
