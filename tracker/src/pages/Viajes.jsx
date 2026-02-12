import { useEffect, useState } from 'react';
import ViajesWeb from './ViajesWeb';
import ViajesMobile from './ViajesMobile';

export default function Viajes({ user }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isMobile ? <ViajesMobile user={user} /> : <ViajesWeb user={user} />;
}