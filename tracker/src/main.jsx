import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Bootstrap CSS (primero para que tus estilos puedan sobreescribir)
import 'bootstrap/dist/css/bootstrap.min.css';

// Tus estilos personalizados (después de Bootstrap)
import './index.css'
import './App.css'
import './components/Autos/estilos/EstiloVehiculos.css'
import './components/Autos/estilos/ModalAgregar.css'
import './components/Autos/estilos/ModalEdicion.css'
import './components/Autos/estilos/EstiloMantenimiento.css'

// Bootstrap JS (al final)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import App from './App.jsx'

import { AuthProvider } from './modules/auth/AuthProvider.jsx';
import { TrackingProvider } from './modules/tracking/TrackingProvider.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <TrackingProvider>
          <App />
        </TrackingProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)

// Registrar Service Worker con path correcto
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // import.meta.env.BASE_URL ya trae '/' o '/uber/', así que solo concatenamos 'sw.js'
    // PERO ojo, si BASE_URL es '/', queda '/sw.js'. Si es '/uber/', queda '/uber/sw.js'
    // Aseguramos que no haya doble slash si fuera necesario, pero Vite suele manejar bien BASE_URL
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    
    navigator.serviceWorker.register(swUrl)
      .then(reg => console.log('✅ SW registrado en:', swUrl, reg))
      .catch(err => console.error('❌ SW falla al registrar:', swUrl, err));
  });
}