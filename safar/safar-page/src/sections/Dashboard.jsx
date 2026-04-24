import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { API_URL, UPLOADS_URL } from '../config';
import './Dashboard.css';
import BookingForm from '../components/BookingForm';
import ReservasCalendar from '../components/ReservasCalendar';
import EditProfileModal from '../components/EditProfileModal';

// Fix for Leaflet default icons path
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const STATUS_LABELS = {
  pendiente:   'Pago Pendiente',
  confirmado:  'Confirmado',
  asignado:    'Asignado',
  en_curso:    'En Curso',
  completado:  'Completado',
  cancelado:   'Cancelado',
};

const getStatusKey  = (raw) => (raw || 'pendiente').toLowerCase().replace(/\s+/g, '_');
const getStatusLabel = (raw) => STATUS_LABELS[getStatusKey(raw)] ?? raw ?? 'Pendiente';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9zaHZlbGEiLCJhIjoiY21uOTBleGFyMDNvODJ3cTE1MDU3ZWdmYSJ9.JEARY1ndg_yCWaLsVMIWkQ';
const CJ_BBOX = '-106.65,31.55,-106.20,31.87';

const Dashboard = ({ revealRef, setActiveView, authUser, setAuthUser }) => {
  const [data, setData] = useState({ plan: null, trips: [] });
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapTilesLoaded, setMapTilesLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('viaje');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setAuthUser(null);
    setActiveView('home');
  };
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCardExpanded, setIsCardExpanded] = useState(false);

  // Calendar state (lifted from ReservasCalendar)
  const [calView, setCalView] = useState('day');
  const [calDay, setCalDay] = useState(new Date());

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routeLayerRef = useRef(null);
  const driversLayerRef = useRef(null);
  const cardRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  // --- CONDUCTORES EN TIEMPO REAL ---
  const [drivers, setDrivers] = useState([]);

  const fetchDrivers = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/choferes_ubicacion.php?t=${Date.now()}`);
      const data = await res.json();
      if (data.success) setDrivers(data.drivers || []);
    } catch (_) {}
  }, []);

  // Poll cada 20 segundos
  useEffect(() => {
    fetchDrivers();
    const interval = setInterval(fetchDrivers, 20000);
    return () => clearInterval(interval);
  }, [fetchDrivers]);

  // Actualizar marcadores de conductores cuando cambia `drivers` o el mapa
  useEffect(() => {
    if (!mapInstance.current) return;

    // Limpiar capa anterior
    if (driversLayerRef.current) {
      driversLayerRef.current.clearLayers();
    } else {
      driversLayerRef.current = L.layerGroup().addTo(mapInstance.current);
    }

    drivers.forEach(driver => {
      const lat = Number(driver.latitud);
      const lng = Number(driver.longitud);
      if (!lat || !lng) return;

      const size = 30;
      const color = '#800020';
      const uid = driver.empleado_id || Math.random().toString(36).slice(2);
      const icon = L.divIcon({
        className: 'custom-vehicle-icon',
        html: `
          <div style="width:${size}px;height:${size}px;position:relative;">
            <svg viewBox="0 0 512 512" width="${size}" height="${size}" style="filter:drop-shadow(0 4px 6px rgba(0,0,0,0.4));">
              <defs>
                <linearGradient id="sfBg_${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:${color};stop-opacity:1"/>
                  <stop offset="100%" style="stop-color:#3d000f;stop-opacity:1"/>
                </linearGradient>
                <linearGradient id="sfGl_${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:rgba(255,255,255,0.7);stop-opacity:1"/>
                  <stop offset="100%" style="stop-color:rgba(255,255,255,0.2);stop-opacity:1"/>
                </linearGradient>
              </defs>
              <path fill="url(#sfBg_${uid})" stroke="#fff" stroke-width="10"
                    d="M128 160c0-44.2 35.8-80 80-80h96c44.2 0 80 35.8 80 80v224c0 35.3-28.7 64-64 64H192c-35.3 0-64-28.7-64-64V160z"/>
              <path fill="url(#sfGl_${uid})"
                    d="M164 160c0-17.7 14.3-32 32-32h120c17.7 0 32 14.3 32 32v48H164v-48z"/>
              <rect x="160" y="420" width="40" height="12" rx="4" fill="#ff0000" opacity="0.8"/>
              <rect x="312" y="420" width="40" height="12" rx="4" fill="#ff0000" opacity="0.8"/>
              <path fill="#fff" d="M160 88h32v8h-32zM320 88h32v8h-32z" opacity="0.9"/>
            </svg>
          </div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const kmh = driver.velocidad > 0 ? Math.round(driver.velocidad * 3.6) + ' km/h' : 'Detenido';
      const nombre = driver.nombre_completo || 'Chofer';
      const unidad = [driver.unidad_nombre, driver.placas ? `· ${driver.placas}` : ''].filter(Boolean).join(' ');

      const marker = L.marker([lat, lng], { icon });
      marker.bindPopup(`
        <div style="min-width:150px;font-family:sans-serif">
          <div style="font-weight:700;font-size:14px;color:#1a1a1a;margin-bottom:2px">${nombre}</div>
          ${unidad ? `<div style="font-size:12px;color:#666;margin-bottom:4px">${unidad}</div>` : ''}
          <div style="display:inline-block;background:#1a1a1a;color:#fff;border-radius:6px;padding:2px 8px;font-size:11px;font-weight:600">${kmh}</div>
        </div>
      `);
      driversLayerRef.current.addLayer(marker);
    });
  }, [drivers, mapReady]); // eslint-disable-line
  const peekRef = useRef(null);
  const isCardExpandedRef = useRef(false);
  const dragRef = useRef({ active: false, startY: 0, lastY: 0 });

  // Keep ref in sync with state for use inside touch handlers
  useEffect(() => { isCardExpandedRef.current = isCardExpanded; }, [isCardExpanded]);

  // Collapse card when trip changes
  useEffect(() => { setIsCardExpanded(false); }, [selectedTrip]);

  // Bottom sheet drag handlers
  const onPeekTouchStart = useCallback((e) => {
    dragRef.current = { active: true, startY: e.touches[0].clientY, lastY: e.touches[0].clientY };
    if (cardRef.current) cardRef.current.style.transition = 'none';
  }, []);

  const onPeekTouchMove = useCallback((e) => {
    if (!dragRef.current.active || !cardRef.current) return;
    const y = e.touches[0].clientY;
    const delta = y - dragRef.current.startY;
    dragRef.current.lastY = y;
    const cardH = cardRef.current.offsetHeight;
    const peekH = peekRef.current ? peekRef.current.offsetHeight : 120;
    const collapsedY = cardH - peekH;
    const baseY = isCardExpandedRef.current ? 0 : collapsedY;
    const newY = Math.max(0, Math.min(collapsedY, baseY + delta));
    cardRef.current.style.transform = `translateY(${newY}px)`;
  }, []);

  const onPeekTouchEnd = useCallback(() => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    if (cardRef.current) {
      cardRef.current.style.transition = '';
      cardRef.current.style.transform = '';
    }
    const delta = dragRef.current.lastY - dragRef.current.startY;
    if (isCardExpandedRef.current) {
      if (delta > 50) setIsCardExpanded(false);
    } else {
      if (delta < -50) setIsCardExpanded(true);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard.php?codigoUsuario=${authUser.codigoUsuario}`);
      const result = await response.json();
      if (result.success) {
        setData({ plan: result.plan, trips: result.trips });
        if (result.trips && result.trips.length > 0) {
          const upcoming = result.trips.find(t =>
            t.EstatusOrden !== 'Completado' && t.EstatusOrden !== 'Cancelado'
          ) || result.trips[0];
          setSelectedTrip(upcoming);
        }
      }
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    } finally {
      setLoading(false);
    }
  }, [authUser.codigoUsuario]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const res  = await fetch(`${API_URL}/get_profile.php?codigoUsuario=${authUser.codigoUsuario}`);
      const data = await res.json();
      if (data.success) {
        // Normalizar llaves a minúsculas
        const profile = {};
        Object.keys(data.profile).forEach(k => {
          profile[k.toLowerCase()] = data.profile[k];
        });
        
        setUserProfile(profile);

        if (profile.urlfoto) {
          setProfilePhotoUrl(`${API_URL}/${profile.urlfoto}?t=${Date.now()}`);
        }

        // AUTO-HEALING: If coordinates are default (Juárez center) or missing, resolve them background
        const lat = Number(profile.latitud);
        const lng = Number(profile.longitud);
        const isDefault = (lat === 31.69 && lng === -106.42);
        
        if (!lat || !lng || isDefault) {
          const address = [profile.calle, profile.numexterior, profile.colonia, profile.ciudad, "CP " + profile.codigopostal]
            .filter(Boolean).join(', ');
          
          if (address.length > 10) {
            setMapLoading(true);
            const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1&bbox=${CJ_BBOX}`;
            
            try {
              const geoRes = await fetch(geocodeUrl);
              const geoData = await geoRes.json();
              if (geoData?.features?.length > 0) {
                const [lon, lat] = geoData.features[0].center;
                setUserProfile(prev => ({ ...prev, latitud: lat, longitud: lon }));
              }
            } catch (e) {
              console.warn("Background geocoding failed", e);
            } finally {
              setMapLoading(false);
            }
          }
        }
      }
    } catch (_) {}
  }, [authUser.codigoUsuario]);

  useEffect(() => {
    if (!authUser) {
      setActiveView('signin');
      return;
    }

    fetchDashboardData();
    fetchUserProfile();
  }, [authUser, setActiveView, refreshTrigger, fetchDashboardData, fetchUserProfile]);

  const handleDeleteBooking = async () => {
    if (!selectedTrip) return;
    try {
      const res = await fetch(`${API_URL}/delete_booking.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idOrden: selectedTrip.IdOrdenServicio })
      });
      const data = await res.json();
      if (data.success) {
        setShowDeleteConfirm(false);
        setSelectedTrip(null);
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Error al intentar eliminar la reserva.");
    }
  };

  // Map effect: initialize/destroy based on selected trip and active tab
  useEffect(() => {
    let timer;
    
    // Auto-wait for the profile to inject correct coordinates, avoiding map duplicate destruction
    if (!userProfile) return;
    if (showBooking) return; // Wait until booking UI is firmly closed

    if (mapRef.current && activeTab === 'viaje') {
      timer = setTimeout(() => {
        try {
          if (!mapRef.current) return;

          if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
          }

          const defaultLat = Number(userProfile?.latitud) || 31.69;
          const defaultLng = Number(userProfile?.longitud) || -106.42;

          mapInstance.current = L.map(mapRef.current, {
            zoomControl: false,
            center: selectedTrip 
              ? [Number(selectedTrip.LatitudOrigen) || defaultLat, Number(selectedTrip.LongitudOrigen) || defaultLng]
              : [defaultLat, defaultLng],
            zoom: 14,
          });

          setMapTilesLoaded(false);
          const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          });
          
          let tilesLoaded = false;
          tileLayer.on('load', () => {
            if (!tilesLoaded) {
              tilesLoaded = true;
              setMapTilesLoaded(true);
            }
          });
          
          setTimeout(() => {
            if (!tilesLoaded) {
              tilesLoaded = true;
              setMapTilesLoaded(true);
            }
          }, 800); // 800ms max wait for animation

          tileLayer.addTo(mapInstance.current);

          routeLayerRef.current = L.featureGroup().addTo(mapInstance.current);
          setMapReady(true);

          // User Marker (if no selectedTrip or as a reference)
          if (userProfile?.latitud && userProfile?.longitud) {
            const userLat = Number(userProfile.latitud);
            const userLng = Number(userProfile.longitud);
            
            if (!isNaN(userLat) && !isNaN(userLng)) {
              const userIcon = L.divIcon({
                className: 'user-location-marker-home',
                html: `
                  <div style="background: #ffffff; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.25); border: 2px solid #111;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#111">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                    </svg>
                  </div>
                `,
                iconSize: [36, 36],
                iconAnchor: [18, 18]
              });

              const addressText = [userProfile.calle, userProfile.numexterior].filter(Boolean).join(' ') 
                + (userProfile.colonia ? `, ${userProfile.colonia}` : '');

              // Dibujar círculo que representa la "ZONA" del CP (aprox 800m de radio)
              L.circle([userLat, userLng], {
                color: '#111',
                fillColor: '#111',
                fillOpacity: 0.08,
                weight: 1,
                dashArray: '5, 5',
                radius: 800
              }).addTo(mapInstance.current);

              L.marker([userLat, userLng], { icon: userIcon })
                .addTo(mapInstance.current)
                .bindPopup(`<strong>Tu ubicación:</strong><br/>${addressText || 'Ubicación de perfil'}`);

              if (!selectedTrip) {
                mapInstance.current.setView([userLat, userLng], 15);
              }
            }
          }

          if (selectedTrip) {
            const latO = Number(selectedTrip.LatitudOrigen);
            const lngO = Number(selectedTrip.LongitudOrigen);
            const latD = Number(selectedTrip.LatitudDestino);
            const lngD = Number(selectedTrip.LongitudDestino);

            if (!isNaN(latO) && !isNaN(lngO)) {
              L.marker([latO, lngO], {
                icon: L.divIcon({ className: 'map-marker origin', html: 'A' })
              }).addTo(routeLayerRef.current).bindPopup(`<strong>Origen:</strong><br/>${selectedTrip.DireccionOrigen}`);
            }

            if (!isNaN(latD) && !isNaN(lngD)) {
              L.marker([latD, lngD], {
                icon: L.divIcon({ className: 'map-marker destination', html: 'B' })
              }).addTo(routeLayerRef.current).bindPopup(`<strong>Destino:</strong><br/>${selectedTrip.DireccionDestino}`);
            }

            if (selectedTrip.GeoJSON_Ruta) {
              try {
                const geoJSON = typeof selectedTrip.GeoJSON_Ruta === 'string'
                  ? JSON.parse(selectedTrip.GeoJSON_Ruta)
                  : selectedTrip.GeoJSON_Ruta;

                L.geoJSON(geoJSON, {
                  style: { color: '#111111', weight: 5, opacity: 0.9 }
                }).addTo(routeLayerRef.current);
              } catch (e) {
                console.error("GeoJSON error:", e);
              }
            } else if (!isNaN(latO) && !isNaN(lngO) && !isNaN(latD) && !isNaN(lngD)) {
              // Draw a straight line if no route
              L.polyline([[latO, lngO], [latD, lngD]], {
                color: '#111111', weight: 4, opacity: 0.6, dashArray: '8, 8'
              }).addTo(routeLayerRef.current);
            }

            if (routeLayerRef.current.getLayers().length > 0) {
              const bounds = routeLayerRef.current.getBounds();
              if (bounds.isValid()) {
                mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
              }
            }
          }

          // Force resize check to ensure tiles render correctly
          setTimeout(() => {
            if (mapInstance.current) mapInstance.current.invalidateSize();
          }, 100);
        } catch (error) {
          console.error("Map initialization error:", error);
        }
      }, 50);
    } else if (activeTab !== 'viaje') {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        driversLayerRef.current = null;
        setMapReady(false);
      }
    }

    return () => {
      clearTimeout(timer);
    };
  }, [selectedTrip, activeTab, userProfile, showBooking]);


  if (loading) {
    return (
      <section className="db-mobile-container">
        <div className="db-loading">
          <div className="db-loading-spinner"></div>
          <p>Cargando tu viaje...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="db-mobile-container">
      {/* Unified top header: greeting + tabs */}
      <div className="db-top-header">
        {/* Brand row */}
        <div className="db-top-brand-row">
          {/* Profile avatar button */}
          <button
            className="db-avatar-btn"
            onClick={() => setShowEditProfile(true)}
            aria-label="Editar perfil"
          >
            {profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt="Perfil" className="db-avatar-img" />
            ) : (
              <svg className="db-avatar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/>
              </svg>
            )}
          </button>

          <div className="db-top-greeting">
            <span className="db-top-greeting-sub">Bienvenido de vuelta</span>
            <span className="db-top-greeting-name">{authUser?.nombre} <span>👋</span></span>
          </div>
          <button className="db-top-logout-btn" onClick={() => setShowLogoutConfirm(true)} aria-label="Cerrar sesión">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>

        {/* Tab bar */}
        <div className="db-tab-bar">
          <button
            className={`db-tab-btn ${activeTab === 'viaje' ? 'active' : ''}`}
            onClick={() => setActiveTab('viaje')}
          >
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/></svg>
            Viaje
          </button>
          <button
            className={`db-tab-btn ${activeTab === 'reservas' ? 'active' : ''}`}
            onClick={() => setActiveTab('reservas')}
          >
            <svg viewBox="0 0 24 24" fill="none"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" fill="currentColor"/></svg>
            Reservas
          </button>
        </div>
      </div>

      {/* VIAJE TAB */}
      {activeTab === 'viaje' && (
        <div className="db-viaje-view">
          {showBooking ? (
            <div className="db-booking-wrapper">
              <BookingForm 
                authUser={authUser} 
                userProfile={userProfile}
                onBookingComplete={(result) => {
                  // Solo refrescar datos — NO cerrar aquí.
                  // El modal de éxito dentro de BookingForm tiene el botón
                  // "FINALIZAR" que llama a onCancel para cerrar el formulario.
                  setRefreshTrigger(prev => prev + 1);
                }}
                onCancel={() => setShowBooking(false)}
              />
            </div>
          ) : (
            <>
              {/* Map wrapper — bounded above the card peek so button never overlaps card */}
              <div className="db-map-wrapper">
                <div 
                  className="db-map-skeleton"
                  style={{
                    opacity: (mapLoading || loading || !mapTilesLoaded) ? 1 : 0,
                    visibility: (mapLoading || loading || !mapTilesLoaded) ? 'visible' : 'hidden',
                    pointerEvents: (mapLoading || loading || !mapTilesLoaded) ? 'auto' : 'none',
                    transition: 'opacity 0.25s ease, visibility 0.25s ease'
                  }}
                >
                  <div className="db-skeleton-pulse-ring"></div>
                  <div className="db-skeleton-pin">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="5" />
                    </svg>
                  </div>
                  <div className="db-skeleton-text">Cargando mapa...</div>
                </div>
                <div className="db-map-area" ref={mapRef}>
                </div>

                {/* Recenter — absolute inside wrapper, always within visible map */}
                {selectedTrip && (
                  <button
                    className="db-recenter-btn"
                    onClick={() => {
                      if (!mapInstance.current) return;
                      if (routeLayerRef.current && routeLayerRef.current.getLayers().length > 0) {
                        const bounds = routeLayerRef.current.getBounds();
                        if (bounds.isValid()) {
                          mapInstance.current.fitBounds(bounds, { padding: [50, 50], animate: true });
                          return;
                        }
                      }
                      const lat = Number(selectedTrip.LatitudOrigen) || 31.69;
                      const lng = Number(selectedTrip.LongitudOrigen) || -106.42;
                      mapInstance.current.setView([lat, lng], 14, { animate: true });
                    }}
                    title="Centrar ruta"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                    </svg>
                  </button>
                )}
              </div>

              {/* Bottom details card — bottom sheet */}
              {selectedTrip ? (
                <div
                  className={`db-details-card ${isCardExpanded ? 'expanded' : 'collapsed'}`}
                  ref={cardRef}
                >
                  {/* PEEK — always visible, handles drag */}
                  <div
                    className="db-card-peek"
                    ref={peekRef}
                    onTouchStart={onPeekTouchStart}
                    onTouchMove={onPeekTouchMove}
                    onTouchEnd={onPeekTouchEnd}
                    onClick={() => setIsCardExpanded(prev => !prev)}
                  >
                    <div className="db-details-handle"></div>
                    <div className="db-trip-stats">
                      <div className="db-stat">
                        <span className="db-stat-label">Tiempo Est.</span>
                        <span className="db-stat-value">{selectedTrip.TiempoEstimado || '—'}</span>
                      </div>
                      <div className="db-stat-divider"></div>
                      <div className="db-stat">
                        <span className="db-stat-label">Distancia</span>
                        <span className="db-stat-value">{selectedTrip.Distancia || '—'}</span>
                      </div>
                      <div className="db-stat-divider"></div>
                      <div className="db-stat">
                        <span className="db-stat-label">Total</span>
                        <span className="db-stat-value db-stat-value--price">${Number(selectedTrip.MontoFinal || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* BODY — visible only when expanded */}
                  <div className="db-card-body">
                    {(() => {
                      const rawKey = getStatusKey(selectedTrip.EstatusOrden);
                      const metodo = (selectedTrip.MetodoPago || '').toUpperCase();
                      // Stripe payments are pre-paid — override "pendiente" label
                      const chipKey   = (rawKey === 'pendiente' && metodo === 'STRIPE') ? 'confirmado' : rawKey;
                      const chipLabel = STATUS_LABELS[chipKey] ?? selectedTrip.EstatusOrden ?? 'Pendiente';
                      return (
                        <div className="db-trip-header">
                          <div className="db-trip-folio">
                            <span className="db-folio-label">Reserva</span>
                            <span className="db-folio-number">#{selectedTrip.Folio}</span>
                          </div>
                          <span className={`db-status-chip db-status-${chipKey}`}>{chipLabel}</span>
                        </div>
                      );
                    })()}

                    <div className="db-route-summary">
                      <div className="db-route-point">
                        <div className="db-route-dot db-route-dot--origin"></div>
                        <p className="db-route-address">{selectedTrip.DireccionOrigen || 'Origen no definido'}</p>
                      </div>
                      <div className="db-route-line"></div>
                      <div className="db-route-point">
                        <div className="db-route-dot db-route-dot--dest"></div>
                        <p className="db-route-address">{selectedTrip.DireccionDestino || 'Destino no definido'}</p>
                      </div>
                    </div>

                    {/* ── Ticket de pago ──────────────────────────────── */}
                    {(() => {
                      const metodo = (selectedTrip.MetodoPago || '').toUpperCase();
                      const total   = Number(selectedTrip.MontoFinal || 0);
                      // Fallback: si el API no devuelve MontoDeposito, calcularlo como 30%
                      const depositoRaw = Number(selectedTrip.MontoDeposito ?? selectedTrip.monto_deposito ?? 0);
                      const deposito = depositoRaw > 0 ? depositoRaw : (metodo === 'EFECTIVO_DEPOSITO' ? Math.round(total * 0.30) : 0);
                      const pendiente = total - deposito;

                      const isCard    = metodo === 'STRIPE';
                      const isDeposit = metodo === 'EFECTIVO_DEPOSITO';
                      const isCash    = metodo === 'EFECTIVO' || (!metodo && total > 0);

                      return (
                        <div className="db-payment-ticket">
                          <div className="db-ticket-top">
                            <span className="db-ticket-icon">{isCard ? '💳' : '💵'}</span>
                            <div className="db-ticket-method-info">
                              <span className="db-ticket-method-name">
                                {isCard    ? 'Tarjeta de crédito/débito' :
                                 isDeposit ? 'Efectivo con depósito' :
                                             'Efectivo'}
                              </span>
                              <span className="db-ticket-method-sub">
                                {isCard    ? 'Pago en línea' :
                                 isDeposit ? `Depósito garantía al reservar` :
                                             'Pago al chofer el día del viaje'}
                              </span>
                            </div>
                          </div>

                          <div className="db-ticket-perforation" />

                          <div className="db-ticket-rows">
                            <div className="db-ticket-row">
                              <span>Total del viaje</span>
                              <strong>${total.toFixed(2)}</strong>
                            </div>

                            {isCard && (
                              <div className="db-ticket-row">
                                <span>Estado</span>
                                <span className="db-ticket-badge db-ticket-badge--paid">✓ Pagado en línea</span>
                              </div>
                            )}

                            {isDeposit && (
                              <>
                                <div className="db-ticket-row">
                                  <span>Depósito pagado (30%)</span>
                                  <span className="db-ticket-badge db-ticket-badge--paid">✓ ${deposito.toFixed(2)}</span>
                                </div>
                                <div className="db-ticket-row">
                                  <span>Pendiente al chofer</span>
                                  <span className="db-ticket-badge db-ticket-badge--pending">💵 ${pendiente.toFixed(2)}</span>
                                </div>
                              </>
                            )}

                            {isCash && (
                              <div className="db-ticket-row">
                                <span>Pagar al chofer</span>
                                <span className="db-ticket-badge db-ticket-badge--pending">💵 ${total.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                    {/* ─────────────────────────────────────────────────── */}

                    <div className="db-driver-row">
                      {/* Car image */}
                      <div className="db-car-img-wrap">
                        {selectedTrip.ImagenVehiculo && selectedTrip.ImagenVehiculo !== 'default_car.jpg' ? (
                          <img
                            className="db-car-img"
                            src={`${UPLOADS_URL}/${selectedTrip.ImagenVehiculo}`}
                            alt={selectedTrip.Unidad || 'Vehículo'}
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          />
                        ) : null}
                        <div className="db-car-img-fallback" style={{ display: (selectedTrip.ImagenVehiculo && selectedTrip.ImagenVehiculo !== 'default_car.jpg') ? 'none' : 'flex' }}>
                          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
                        </div>
                      </div>

                      {/* Driver + vehicle info */}
                      <div className="db-driver-info">
                        <span className="db-driver-name">{selectedTrip.Chofer || 'Sin chofer asignado'}</span>
                        <span className="db-driver-vehicle">{selectedTrip.Unidad || 'Unidad por definir'}</span>
                        {selectedTrip.Placas && (
                          <span className="db-driver-plates">{selectedTrip.Placas}</span>
                        )}
                      </div>

                      <button className="db-delete-btn" onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}>
                        <svg viewBox="0 0 24 24" fill="none"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/></svg>
                      </button>
                    </div>

                    <button className="db-new-booking-btn" onClick={(e) => { e.stopPropagation(); setShowBooking(true); }}>
                      + Nueva Reserva
                    </button>
                  </div>
                </div>
              ) : (
                <div className="db-no-trip-card">
                  <p className="db-no-trip-text">No tienes viajes agendados próximamente.</p>
                  
                  {userProfile && (userProfile.calle || userProfile.colonia) && (
                    <div className="db-saved-address-hint">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      <div className="db-saved-address-info">
                        <span className="db-saved-address-label">Ubicación Registrada:</span>
                        <span className="db-saved-address-value">
                          {[userProfile.calle, userProfile.numexterior].filter(Boolean).join(' ')}
                          {userProfile.colonia ? `, ${userProfile.colonia}` : ''}
                        </span>
                      </div>
                    </div>
                  )}

                  <button className="db-new-booking-btn" onClick={() => setShowBooking(true)}>
                    + Agendar Viaje
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* RESERVAS TAB */}
      {activeTab === 'reservas' && (() => {
        // Compute dynamic label
        const _isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
        const _today = new Date();
        const isCalToday = _isSameDay(calDay, _today);

        // Helper: get Monday of calDay's week
        const getMon = (d) => { const c = new Date(d); c.setHours(0,0,0,0); const dow = c.getDay(); const diff = dow === 0 ? -6 : 1 - dow; c.setDate(c.getDate() + diff); return c; };
        const mon = getMon(calDay);
        const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
        const isThisWeek = _isSameDay(getMon(_today), mon);

        let headerLabel;
        if (calView === 'day') {
          headerLabel = isCalToday ? 'Hoy' : calDay.toLocaleString('es', { weekday: 'long', day: 'numeric', month: 'long' });
        } else {
          if (isThisWeek) {
            headerLabel = 'Esta Semana';
          } else {
            headerLabel = mon.getMonth() === sun.getMonth()
              ? `${mon.getDate()} – ${sun.getDate()} ${mon.toLocaleString('es', { month: 'long' })}`
              : `${mon.toLocaleString('es', { day: 'numeric', month: 'short' })} – ${sun.toLocaleString('es', { day: 'numeric', month: 'short' })}`;
          }
        }

        const navCal = (dir) => {
          const d = new Date(calDay);
          d.setDate(d.getDate() + (calView === 'day' ? dir : dir * 7));
          setCalDay(d);
        };

        return (
          <div className="db-reservas-view">
            <div className="db-reservas-header">
              {/* Row 1: ‹ Título › */}
              <div className="db-reservas-nav-row">
                <button className="db-cal-nav-btn" onClick={() => navCal(-1)} aria-label="Anterior">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <div className="db-reservas-title-wrap">
                  <h2 className="db-reservas-title">{headerLabel}</h2>
                  {!isCalToday && (
                    <button className="db-cal-today-chip" onClick={() => setCalDay(new Date())}>Hoy</button>
                  )}
                </div>
                <button className="db-cal-nav-btn" onClick={() => navCal(1)} aria-label="Siguiente">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
              {/* Row 2: toggle vista + nueva reserva */}
              <div className="db-reservas-actions-row">
                <div className="db-cal-toggle">
                  <button className={`db-cal-toggle-btn ${calView === 'day' ? 'active' : ''}`} onClick={() => setCalView('day')}>Día</button>
                  <button className={`db-cal-toggle-btn ${calView === 'week' ? 'active' : ''}`} onClick={() => setCalView('week')}>Semana</button>
                </div>
                <button className="db-reservas-add-btn" onClick={() => { setShowBooking(true); setActiveTab('viaje'); }}>+ Nueva</button>
              </div>
            </div>
            <div className="db-reservas-calendar-wrap">
              <ReservasCalendar
                trips={data.trips}
                onTripSelect={(trip) => { setSelectedTrip(trip); setActiveTab('viaje'); }}
                selectedTrip={selectedTrip}
                view={calView}
                currentDay={calDay}
                onNav={navCal}
                onViewChange={setCalView}
                onGoToday={() => setCalDay(new Date())}
                onSetDay={setCalDay}
              />
            </div>
          </div>
        );
      })()}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfileModal
          authUser={authUser}
          onClose={() => setShowEditProfile(false)}
          onSaved={() => {
            // Refresh everything after saving
            fetchUserProfile();
            fetchDashboardData();
          }}
        />
      )}

      {/* Logout Confirm Modal */}
      {showLogoutConfirm && (
        <div className="db-modal-overlay">
          <div className="db-modal-card">
            <div className="db-modal-icon">🚪</div>
            <h3 className="db-modal-title">¿Cerrar Sesión?</h3>
            <p className="db-modal-text">¿Estás seguro que deseas salir de tu panel?</p>
            <div className="db-modal-actions">
              <button className="db-modal-cancel" onClick={() => setShowLogoutConfirm(false)}>Cancelar</button>
              <button className="db-modal-confirm" onClick={handleLogout}>Sí, Salir</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="db-modal-overlay">
          <div className="db-modal-card">
            <div className="db-modal-icon">🗑️</div>
            <h3 className="db-modal-title">¿Eliminar Reserva?</h3>
            <p className="db-modal-text">Esta acción es irreversible y eliminará toda la información de esta reserva.</p>
            <div className="db-modal-actions">
              <button className="db-modal-cancel" onClick={() => setShowDeleteConfirm(false)}>Cancelar</button>
              <button className="db-modal-confirm" onClick={handleDeleteBooking}>Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Dashboard;
