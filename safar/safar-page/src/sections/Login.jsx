import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import './Login.css';

// Fix for Leaflet default icons path
delete L.Icon.Default.prototype._getIconUrl;

const originIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Login = ({ revealRef, setActiveView }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    time: '',
    phone: '',
    addressOrigin: '',
    addressDestination: '',
    days: [] // New field for service days
  });
  const [locations, setLocations] = useState({
    origin: null,
    destination: null,
    distance: 0
  });

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({ origin: null, destination: null });

  // Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(2);
  };

  const toggleDay = (day) => {
    setFormData(prev => {
      const newDays = prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day];
      return { ...prev, days: newDays };
    });
  };

  // Helper for Reverse Geocoding using Nominatim
  const fetchAddress = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
        headers: { 'Accept-Language': 'es' }
      });
      const data = await response.json();
      return data.display_name || "Dirección no encontrada";
    } catch (err) {
      console.error("Geocoding error:", err);
      return "Error al obtener dirección";
    }
  };

  // Initializing Leaflet manually to avoid Hook issues in MapContainer
  useEffect(() => {
    let timer;
    if (showForm && mapRef.current && !mapInstance.current) {
      // Ensure container is empty before init
      mapRef.current.innerHTML = '';
      
      timer = setTimeout(() => {
        if (!mapRef.current) return;
        
        try {
          mapInstance.current = L.map(mapRef.current, {
            zoomControl: false,
            center: [31.69, -106.42],
            zoom: 13,
          });

          // Use a more descriptive tile layer (Standard OSM for better details)
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(mapInstance.current);

          mapInstance.current.on('click', async (e) => {
            const { lat, lng } = e.latlng;
            
            // Marker updates immediately for responsiveness
            setLocations(prev => {
              const isFirst = !prev.origin;
              const isSecond = prev.origin && !prev.destination;

              if (isFirst) {
                // Fetch address in background
                fetchAddress(lat, lng).then(addr => {
                  setFormData(curr => ({ ...curr, addressOrigin: addr }));
                });
                return { ...prev, origin: { lat, lng } };
              }
              if (isSecond) {
                // Fetch address in background
                fetchAddress(lat, lng).then(addr => {
                  setFormData(curr => ({ ...curr, addressDestination: addr }));
                });
                const dist = calculateDistance(prev.origin.lat, prev.origin.lng, lat, lng);
                return { ...prev, destination: { lat, lng }, distance: dist };
              }
              // Reset
              setFormData(curr => ({ ...curr, addressOrigin: '', addressDestination: '' }));
              return { origin: { lat, lng }, destination: null, distance: 0 };
            });
          });
        } catch (err) {
          console.error("Leaflet init error:", err);
        }
      }, 200); 
    }

    return () => {
      clearTimeout(timer);
      if (mapInstance.current) {
        mapInstance.current.off();
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [showForm]);

  // Update markers on map
  useEffect(() => {
    if (mapInstance.current) {
      // Clear old markers
      if (markersRef.current.origin) mapInstance.current.removeLayer(markersRef.current.origin);
      if (markersRef.current.destination) mapInstance.current.removeLayer(markersRef.current.destination);

      // Add new markers
      if (locations.origin) {
        markersRef.current.origin = L.marker([locations.origin.lat, locations.origin.lng], { icon: originIcon }).addTo(mapInstance.current);
      }
      if (locations.destination) {
        markersRef.current.destination = L.marker([locations.destination.lat, locations.destination.lng], { icon: destIcon }).addTo(mapInstance.current);
        // Fit bounds if both exist
        const bounds = L.latLngBounds([locations.origin.lat, locations.origin.lng], [locations.destination.lat, locations.destination.lng]);
        mapInstance.current.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  }, [locations.origin, locations.destination]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no es soportada por su navegador.");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const coords = { lat: latitude, lng: longitude };
      
      setLocations(prev => ({ ...prev, origin: coords }));
      
      // Auto-fill address
      const addr = await fetchAddress(latitude, longitude);
      setFormData(curr => ({ ...curr, addressOrigin: addr }));
      
      if (mapInstance.current) {
        mapInstance.current.setView([latitude, longitude], 15);
      }
    }, () => {
      alert("No se pudo obtener su ubicación. Por favor, actívela o seleccione en el mapa.");
    });
  };

  const handleSendWhatsApp = () => {
    if (!formData.name || !formData.time || !locations.origin || !locations.destination) {
      alert('Por favor complete los datos obligatorios y seleccione origen/destino en el mapa.');
      return;
    }

    const textMessage = 
      `*NUEVA SOLICITUD DE RESERVA*\n\n` +
      `👤 *Pasajero:* ${formData.name}\n` +
      `📱 *Teléfono:* ${formData.phone}\n` +
      `🕒 *Horario:* ${formData.time} hrs\n` +
      `📅 *Días de Servicio:* ${formData.days.length > 0 ? formData.days.join(', ') : 'No especificado'}\n\n` +
      `*📍 ORIGEN:*\n` +
      `${formData.addressOrigin || 'Seleccionado en mapa'}\n` +
      `https://www.google.com/maps/search/?api=1&query=${locations.origin.lat},${locations.origin.lng}\n\n` +
      `*🏁 DESTINO:*\n` +
      `${formData.addressDestination || 'Seleccionado en mapa'}\n` +
      `https://www.google.com/maps/search/?api=1&query=${locations.destination.lat},${locations.destination.lng}\n\n` +
      `*📏 Distancia:* ${locations.distance} KM\n\n` +
      `_Enviado desde el portal Safar Elite_`;

    const encodedMessage = encodeURIComponent(textMessage);
    window.open(`https://wa.me/526567696979?text=${encodedMessage}`, '_blank');
  };

  return (
    <section className="login-container">
      <div className="login-bg-glow"></div>
      
      <div ref={revealRef} className={`${showForm ? 'booking-form-expanded' : 'reveal login-card contact-card'}`}>
        {!showForm ? (
          <>
            <div className="login-header">
              <div className="login-logo-container">
                <h1 className="login-brand">SAFAR</h1>
              </div>
              <h2 className="login-title">Contacto</h2>
              <p className="login-subtitle">
                Hable directamente con un asesor personal para su próxima reserva.
              </p>
            </div>

            <div className="contact-actions-grid single-action">
              <button 
                className="contact-action-btn whatsapp-btn main-action"
                onClick={() => setShowForm(true)}
              >
                <span className="btn-icon">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </span>
                <span className="btn-text">WhatsApp Elite</span>
              </button>
            </div>
          </>
        ) : (
          <div className="booking-form-content">
            <div className="form-header">
              <h3 className="form-title">Detalles de Reserva</h3>
              <button className="close-form-btn" onClick={() => {
                setShowForm(false);
                setLocations({ origin: null, destination: null, distance: 0 });
              }}>×</button>
            </div>

            <div className="form-grid">
              <div className="input-field">
                <label>Nombre</label>
                <input 
                  type="text" 
                  placeholder="Ej. Juan Pérez" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="input-field">
                <label>Teléfono</label>
                <input 
                  type="tel" 
                  placeholder="+52 ..." 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="input-field">
                <label>Días de Servicio</label>
                <div className="service-days-container">
                  {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`day-chip ${formData.days.includes(day) ? 'selected' : ''}`}
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="input-field">
                <label>Horario Recogida</label>
                <input 
                  type="time" 
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
              </div>

              {/* Nuevos campos de dirección manual */}
              <div className="input-field">
                <label>Dirección Origen</label>
                <input 
                  type="text" 
                  placeholder="Calle, Número, Colonia" 
                  value={formData.addressOrigin}
                  onChange={(e) => setFormData({...formData, addressOrigin: e.target.value})}
                />
              </div>
              <div className="input-field">
                <label>Dirección Destino</label>
                <input 
                  type="text" 
                  placeholder="¿A dónde vamos?" 
                  value={formData.addressDestination}
                  onChange={(e) => setFormData({...formData, addressDestination: e.target.value})}
                />
              </div>
            </div>

            <div className="map-controls">
              <button className="geo-btn" onClick={handleGetLocation}>
                📍 Usar mi ubicación actual
              </button>
            </div>

            <div className="map-instruction">
              {!locations.origin ? "Seleccione punto de ORIGEN en el mapa" : 
               !locations.destination ? "Seleccione punto de DESTINO en el mapa" : 
               `Recorrido: ${locations.distance} KM`}
            </div>

            <div className="map-picker-container">
              <div 
                ref={mapRef} 
                className="booking-map" 
                style={{ height: '280px', width: '100%', borderRadius: '16px' }}
              />
            </div>

            <button className="submit-booking-btn" onClick={handleSendWhatsApp}>
              ENVIAR RESERVA POR WHATSAPP
            </button>
          </div>
        )}

        <button className="login-back-btn" onClick={() => setActiveView('home')}>
          VOLVER AL INICIO
        </button>
      </div>
    </section>
  );
};

export default Login;
