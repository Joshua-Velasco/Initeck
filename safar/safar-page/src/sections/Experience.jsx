import React from 'react';
import { 
  IconShield, 
  IconStar, 
  IconSparkles, 
  IconClock, 
  IconTag, 
  IconSettings, 
  IconAward 
} from '../components/Icons';
import './Experience.css';

const Experience = ({ revealRef }) => {
  const items = [
    { 
      id: 3,
      image: '/experience_limpieza_1772644750846.png',
      location: 'Safar Elite • Higiene',
      title: 'LIMPIEZA', 
      likes: '2.5k',
      desc: 'Estándares rigurosos de limpieza en cada unidad.' 
    },
    { 
      id: 4,
      image: '/experience_puntualidad_1772644856126.png',
      location: 'Safar Elite • Precision',
      title: 'PUNTUALIDAD', 
      likes: '3.1k',
      desc: 'Valoramos su tiempo. Garantizamos precisión en cada uno de sus viajes.' 
    },
    { 
      id: 5,
      image: '/experience_tarifa_fija_1772644870303.png',
      location: 'Safar Elite • Transparencia',
      title: 'TARIFA FIJA', 
      likes: '1.8k',
      desc: 'Costo fijo desde su primer dia al momento de la reserva.' 
    },
    { 
      id: 6,
      image: '/experience_personalizacion_1772644887757.png',
      location: 'Safar Elite • Exclusividad',
      title: 'PERSONALIZACIÓN', 
      likes: '4.2k',
      desc: 'Nos adaptamos a sus preferencias para crear un viaje a su medida. Mantenemos el profesionalismo y la seguridad' 
    },
    { 
      id: 1,
      image: '/experience_seguridad_1772644703374.png',
      location: 'Safar Elite • Seguridad',
      title: 'SEGURIDAD', 
      likes: '1.2k',
      desc: 'Conductores certificados para su total tranquilidad.' 
    },
    { 
      id: 2,
      image: '/experience_comodidad_1772644731037.png',
      location: 'Safar Elite • Confort',
      title: 'COMODIDAD', 
      likes: '943',
      desc: 'Confort y un ambiente diseñado para un viaje placentero y relajante.' 
    }
  ];

  return (
    <section id="experiencia" className="experience">
      {/* Feed-like Grid */}
      <div className="experience-feed-grid">
        {items.map((item, idx) => (
          <div 
            key={item.id}
            ref={revealRef}
            className="reveal ig-post-wrapper" 
            style={{ transitionDelay: `${idx * 0.1}s` }}
          >
            <div className="ig-post gallery-item">
              {/* Post Image */}
              <div className="post-image-container">
                <img src={item.image} alt={item.title} className="post-image" />
              </div>

              {/* Minimalist Caption */}
              <div className="post-caption gallery-caption">
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Experience;
