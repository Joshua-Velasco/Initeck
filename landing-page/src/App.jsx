import { useState, useEffect } from 'react';
import './index.css';

// --- Layout Components ---
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// --- Page Components ---
import { Home } from './components/pages/Home';
import { About } from './components/pages/About';
import { Services } from './components/pages/Services';
import { ServicePage } from './components/pages/ServicePage';
import { Contact } from './components/pages/Contact';

export default function App() {
  const [view, setView] = useState('home');
  const [quoteData, setQuoteData] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const handleQuoteRedirect = (data) => {
    setQuoteData(data);
    setView('contact');
  };

  const services = {
    tecnobyte: {
      id: 'tecnobyte', tag: 'Internet Residencial', name: 'Tecnobyte',
      tagline: 'Internet de la más alta calidad',
      description: 'Internet residencial por antena (aéreo) con la mejor cobertura de la zona. Conexión estable, sin límites de descarga y con atención al cliente 24/7.',
      cardDesc: 'Internet residencial de alta velocidad con cobertura total y soporte 24/7.',
      image: '/tecno.png',
      facebook: 'https://www.facebook.com/TecknobyteTech',
      features: ['Internet por Antena (Aéreo)', 'Sin límites de descarga', 'Atención al cliente 24/7', 'Instalación rápida'],
      plans: [
        { speed: '30 Megas', price: '$458 MXN' },
        { speed: '50 Megas', price: '$649 MXN' },
        { speed: '80 Megas', price: '$789 MXN' },
        { speed: '100 Megas', price: '$949 MXN' },
      ],
      installFee: '$950 MXN',
      phone: '656-526-6370',
      price: '$458 MXN', cta: 'Contratar Ahora', accent: '#3b82f6', theme: 'blue', imgScale: 1.5
    },
    initeck: {
      id: 'initeck', tag: null, name: 'Initeck',
      tagline: 'Liderando la Transformación Digital.',
      description: 'Proveemos soluciones tecnológicas integrales diseñadas para que su empresa esté siempre conectada y equipada con la última tecnología del mercado, desde infraestructura de red robusta hasta software profesional a medida.',
      image: '/software.png', 
      facebook: 'https://www.facebook.com/IniteckTechnology',
      phone: '656-279-7977',
      features: [
        { title: 'Software a medida especializado', desc: 'Soluciones de código robustas diseñadas para las necesidades críticas de su negocio.' },
        { title: 'Mantenimiento de sites e instalación', desc: 'Cuidado preventivo y correctivo de infraestructuras críticas para asegurar uptime total.' },
        { title: 'Redes empresariales estructural', desc: 'Conectividad de alto rendimiento con cableado certificado y topologías resilientes.' },
        { title: 'Configuración de equipos y sites', desc: 'Puesta a punto profesional de servidores, terminales y nodos de red corporativos.' },
        { title: 'Servicio técnico experto', desc: 'Soporte especializado inmediato para resolver cualquier incidencia tecnológica crítica.' },
        { title: 'Reparación de hardware', desc: 'Diagnóstico y reparación de equipos con componentes originales y garantía técnica.' },
        { title: 'Control de accesos', desc: 'Sistemas inteligentes de gestión de identidad para la seguridad de su planta u oficina.' },
        { title: 'Videovigilancia inteligente', desc: 'Cámaras IP de alta definición con monitoreo remoto y analítica avanzada.' }
      ],
      price: null, cta: 'Agendar Consulta', accent: '#9f1239', theme: 'white'
    },
    InibyteTv: {
      id: 'InibyteTv', tag: 'Digital Streaming', name: 'InibyteTv',
      tagline: 'Contrata todas las series y películas.',
      description: 'Acceso total a todas las series y películas. 100% funcional con entrega inmediata, para 2 dispositivos y con hasta 9 plataformas en una sola suscripción.',
      cardDesc: 'Acceso total a tus series y películas favoritas en un solo lugar.',
      image: '/Inibyte.png',
      facebook: 'https://www.facebook.com/profile.php?id=61582547274890',
      features: ['Todas las series y películas', '100% Funcional', 'Entrega inmediata', 'Para 2 dispositivos', 'Hasta 9 plataformas en una', 'Sin contratos de permanencia'],
      phone: '656-868-5224',
      price: '$249 MXN', cta: 'Empezar ahora', accent: '#22c55e', theme: 'green', imgScale: 1.5,
      imgFilter: 'hue-rotate(120deg) saturate(1.8) brightness(1.1) contrast(1.1)'
    },
    targetin: {
      id: 'targetin', tag: 'Digital Identity', name: 'Target.In',
      tagline: 'Tu presencia profesional en un toque.',
      description: 'El ecosistema definitivo de networking corporativo. Una pieza maestra en metal con tecnología NFC que transfiere tu perfil, catálogos y redes al instante. Eleva el estatus de tu marca y olvida el papel para siempre. Una tarjeta digital inteligente que revoluciona tu presentación y potencia tu visibilidad en interacciones 1:1.',
      cardDesc: 'Revoluciona tu networking con nuestra tarjeta digital inteligente NFC.',
      image: '/targetInImg.png',
      facebook: null,
      instagram: 'https://www.instagram.com/target.in25?igsh=OXltODYxamgwZ3Bk',
      phone: '656-279-7977',
      features: ['Tecnología NFC Inteligente', 'Información en Tiempo Real', 'Compatibilidad Universal', 'Actualizaciones Constantes'],
      price: null, 
      externalLink: 'https://targetin.mx/index.html',
      cta: 'Obtener mi Tarjeta', accent: '#fcc419', theme: 'gold'
    }
  };

  return (
    <>
      <Navbar onViewChange={setView} currentView={view} />
      <main>
        {view === 'home' && <Home onViewChange={setView} services={services} onQuoteRequest={handleQuoteRedirect} />}
        {view === 'about' && <About />}
        {view === 'services' && <Services />}
        {services[view] && <ServicePage {...services[view]} onViewChange={setView} />}
        {view === 'contact' && <Contact initialData={quoteData} />}
      </main>
      <Footer onViewChange={setView} />
    </>
  );
}
