import React, { useState, useEffect, useRef } from 'react';
import './Hero.css';

const Hero = ({ revealRef, setActiveView }) => {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log("Autoplay blocked or failed:", err);
      });
    }
  }, []);

  return (
    <section className="hero">
      {/* Background Poster (Legacy Image) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url(/thumbnail.cgi.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: 0
      }}></div>

      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/thumbnail.cgi.jpeg"
        onPlaying={() => setIsVideoReady(true)}
        className="hero-video"
        style={{ opacity: isVideoReady ? 1 : 0 }}
      >
        <source src="/SafarVideoPromo.mp4" type="video/mp4" />
      </video>
      
      {/* Cinematic Overlays */}
      <div className="hero-grain"></div>
      <div className="hero-vignette"></div>
      <div className="hero-silk">
        <div className="hero-silk-inner"></div>
      </div>
      <div className="hero-spotlight"></div>
      <div className="hero-gradient-overlay"></div>

      <div className="hero-content">
        <div ref={revealRef} className="reveal hero-inner-content">
          <div className="hero-text-wrapper">
            <h1 className="hero-title-small">
              <span className="shimmer-text">Private Transport</span>
            </h1>
            <h1 className="hero-title-large">
              <span className="shimmer-text">SAFAR</span>
            </h1>
            <p className="hero-subtitle">
              "Cada kilómetro es una promesa de discreción, seguridad y confort inigualable"
            </p>
          </div>
          <div className="hero-actions">
            <button className="hero-btn" onClick={() => setActiveView('login')}>
              <span>AGENDAR</span>
              <div className="btn-shine"></div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
