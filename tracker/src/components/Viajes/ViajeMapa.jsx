import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize, Locate } from 'lucide-react';

// --- ICONOS DINÁMICOS HYPER-PREMIUM CON ROTACIÓN ---
const createVehicleIcon = (color = "#800020", size = 42, pulse = false) => {
  return L.divIcon({
    html: `
            <div class="vehicle-marker-wrapper" style="width: ${size}px; height: ${size}px; position: relative; perspective: 1000px;">
                ${pulse ? `
                    <div class="pulse-ring ring-1" style="border-color: ${color}4d;"></div>
                    <div class="pulse-ring ring-2" style="border-color: ${color}26;"></div>
                ` : ''}
                <div class="vehicle-icon-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                    <svg viewBox="0 0 512 512" width="${size}" height="${size}" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));">
                        <defs>
                            <linearGradient id="bodyGrad_${size}_${pulse ? 'p' : 's'}" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#3d000f;stop-opacity:1" />
                            </linearGradient>
                            <linearGradient id="glassGrad_${size}" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style="stop-color:rgba(255,255,255,0.7);stop-opacity:1" />
                                <stop offset="100%" style="stop-color:rgba(255,255,255,0.2);stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <path fill="url(#bodyGrad_${size}_${pulse ? 'p' : 's'})" stroke="#fff" stroke-width="10" 
                              d="M128 160c0-44.2 35.8-80 80-80h96c44.2 0 80 35.8 80 80v224c0 35.3-28.7 64-64 64H192c-35.3 0-64-28.7-64-64V160z"/>
                        <path fill="url(#glassGrad_${size})" 
                              d="M164 160c0-17.7 14.3-32 32-32h120c17.7 0 32 14.3 32 32v48H164v-48z"/>
                        <rect x="160" y="420" width="40" height="12" rx="4" fill="#ff0000" opacity="0.8"/>
                        <rect x="312" y="420" width="40" height="12" rx="4" fill="#ff0000" opacity="0.8"/>
                        <path fill="#fff" d="M160 88h32v8h-32zM320 88h32v8h-32z" opacity="0.9"/>
                    </svg>
                </div>
            </div>
            <style>
                .pulse-ring {
                    position: absolute;
                    top: -50%; left: -50%;
                    width: 200%; height: 200%;
                    border-radius: 50%;
                    border: 4px solid;
                    animation: m-pulse 3s cubic-bezier(0.2, 0, 0.2, 1) infinite;
                }
                .ring-2 { animation-delay: 1.5s; }
                @keyframes m-pulse { 0% { transform: scale(0.4); opacity: 1; } 100% { transform: scale(1.1); opacity: 0; } }
                .vehicle-marker-wrapper { transition: transform 0.8s ease-out; transform-origin: center; }
            </style>
        `,
    className: 'custom-vehicle-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

const secondaryLocationIcon = L.divIcon({
  html: `<div style="background-color: #64748b; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
  className: 'secondary-gps-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Componente para manejar la vista del mapa (Zoom y Centro)
const MapController = ({ empleados, idSeleccionado, triggerFitAll, triggerCenterMe, miUbicacion }) => {
  const map = useMap();
  const [hasInitialFit, setHasInitialFit] = useState(false);

  const fitAll = useCallback(() => {
    const puntos = empleados
      .filter(e => e.latitud && e.longitud && e.estadoConexion !== 'offline')
      .map(e => [e.latitud, e.longitud]);

    if (puntos.length > 0) {
      const bounds = L.latLngBounds(puntos);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [empleados, map]);

  useEffect(() => {
    if (!hasInitialFit && empleados.length > 0) {
      fitAll();
      setHasInitialFit(true);
    }
  }, [empleados, hasInitialFit, fitAll]);

  useEffect(() => {
    if (triggerFitAll > 0) fitAll();
  }, [triggerFitAll, fitAll]);

  useEffect(() => {
    if (triggerCenterMe > 0 && miUbicacion) {
      map.flyTo(miUbicacion, 16, { animate: true });
    }
  }, [triggerCenterMe, miUbicacion, map]);

  useEffect(() => {
    if (idSeleccionado) {
      const emp = empleados.find(e => String(e.id) === String(idSeleccionado));
      if (emp && emp.latitud && emp.longitud) {
        map.flyTo([emp.latitud, emp.longitud], map.getZoom(), { animate: true, duration: 1.5 });
        if (!hasInitialFit) setHasInitialFit(true);
      }
    }
  }, [idSeleccionado, empleados, map, hasInitialFit]);

  return null;
};

// --- ANIMACIÓN TIPO UBER (Interpolación y Rotación) ---
const SmoothMarker = ({ position, icon, zIndexOffset, children }) => {
  const [currentPos, setCurrentPos] = useState(position);
  const [rotation, setRotation] = useState(0);
  const prevPosRef = useRef(position);
  const markerRef = useRef(null);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const duration = 2800;

  const calculateBearing = (start, end) => {
    if (!start || !end) return 0;
    const startLat = (start[0] * Math.PI) / 180;
    const startLng = (start[1] * Math.PI) / 180;
    const endLat = (end[0] * Math.PI) / 180;
    const endLng = (end[1] * Math.PI) / 180;
    const dLng = endLng - startLng;
    const y = Math.sin(dLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  };

  useEffect(() => {
    if (position[0] !== prevPosRef.current[0] || position[1] !== prevPosRef.current[1]) {
      const startPos = [...currentPos];
      const endPos = [...position];
      const newBearing = calculateBearing(startPos, endPos);

      const dist = Math.sqrt(Math.pow(endPos[0] - startPos[0], 2) + Math.pow(endPos[1] - startPos[1], 2));
      if (dist > 0.00001) setRotation(newBearing);

      const animate = (timestamp) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const progress = (timestamp - startTimeRef.current) / duration;

        if (progress < 1) {
          const lat = startPos[0] + (endPos[0] - startPos[0]) * progress;
          const lng = startPos[1] + (endPos[1] - startPos[1]) * progress;
          setCurrentPos([lat, lng]);
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setCurrentPos(endPos);
          prevPosRef.current = endPos;
          startTimeRef.current = null;
        }
      };

      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      startTimeRef.current = null;
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [position]);

  useEffect(() => {
    if (markerRef.current) {
      const el = markerRef.current.getElement();
      if (el) {
        const wrapper = el.querySelector('.vehicle-marker-wrapper');
        if (wrapper) {
          wrapper.style.transform = `rotate(${rotation}deg)`;
        }
      }
    }
  }, [rotation, currentPos]);

  return (
    <Marker ref={markerRef} position={currentPos} icon={icon} zIndexOffset={zIndexOffset}>
      {children}
    </Marker>
  );
};

export default function ViajeMapa({ empleados = [], idSeleccionado, colorGuinda = "#800020", enableUserTracking = true }) {
  const [miUbicacion, setMiUbicacion] = useState(null);
  const [triggerFitAll, setTriggerFitAll] = useState(0);
  const [triggerCenterMe, setTriggerCenterMe] = useState(0);

  useEffect(() => {
    if (!enableUserTracking || !navigator.geolocation) return;
    const watcher = navigator.geolocation.watchPosition(
      (pos) => setMiUbicacion([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.warn("📍 GPS Mapa Warning:", err.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, [enableUserTracking]);

  const empleadoActivo = empleados.find(e => String(e.id) === String(idSeleccionado));
  const pathActivo = empleadoActivo?.path || [];

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', overflow: 'hidden' }}>
      <MapContainer
        center={[31.7333, -106.4833]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          attribution='&copy; Google Maps'
        />

        <MapController
          empleados={empleados}
          idSeleccionado={idSeleccionado}
          triggerFitAll={triggerFitAll}
          triggerCenterMe={triggerCenterMe}
          miUbicacion={miUbicacion}
        />

        {miUbicacion && (
          <Marker
            key="mi-ubicacion-admin"
            position={miUbicacion}
            icon={secondaryLocationIcon}
            zIndexOffset={1000}
          >
            <Popup>Tu ubicación (Admin)</Popup>
          </Marker>
        )}

        {pathActivo.length > 1 && (
          <Polyline
            key={`path-${idSeleccionado}`}
            positions={pathActivo}
            color={colorGuinda}
            weight={5}
            opacity={0.8}
          />
        )}

        {/* RENDERIZADO DE TODOS LOS ACTIVOS */}
        {empleados
          .filter(emp => emp.estadoConexion !== 'offline' && emp.latitud && emp.longitud)
          .map(emp => {
            const isSeleccionado = String(emp.id) === String(idSeleccionado);
            const icon = createVehicleIcon(colorGuinda, isSeleccionado ? 54 : 44, isSeleccionado);

            return (
              <SmoothMarker
                key={`marker-emp-${emp.id}`}
                position={[parseFloat(emp.latitud), parseFloat(emp.longitud)]}
                icon={icon}
                zIndexOffset={isSeleccionado ? 2000 : 500}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -20]}
                  opacity={1}
                  // Si hay un seleccionado: solo mostrar permanentemente el del seleccionado.
                  // Los demás se ocultan (permanent=false) para limpiar el mapa.
                  permanent={idSeleccionado ? isSeleccionado : true}
                  className={`custom-tooltip shadow-sm rounded-3 border-0 ${isSeleccionado ? 'selected-tooltip' : ''}`}
                >
                  <div className="text-center p-1">
                    <div className="fw-bold text-dark lh-1" style={{ fontSize: '11px' }}>
                      {isSeleccionado ? emp.nombre : emp.nombre.split(' ')[0]}
                    </div>
                    <div className="small text-muted mb-1" style={{ fontSize: '9px' }}>{emp.vehiculo_nombre}</div>
                    <div className={`badge ${parseFloat(emp.velocidad) > 3 ? 'bg-success' : 'bg-secondary'} border`} style={{ fontSize: '9px' }}>
                      {parseFloat(emp.velocidad) > 3 ? `${Math.round(emp.velocidad)} km/h` : 'Detenido'}
                    </div>
                  </div>
                </Tooltip>

                {isSeleccionado && (
                  <Popup>
                    <div className="text-center">
                      <h6>{emp.nombre}</h6>
                      <p className="small mb-0">{emp.vehiculo_nombre}</p>
                    </div>
                  </Popup>
                )}
              </SmoothMarker>
            );
          })}

      </MapContainer>

      <div className="position-absolute bottom-0 end-0 m-3 d-flex flex-column gap-2" style={{ zIndex: 1000 }}>
        {miUbicacion && (
          <button
            className="btn btn-white shadow rounded-circle p-2 border d-flex align-items-center justify-content-center"
            style={{ width: 40, height: 40 }}
            onClick={() => setTriggerCenterMe(prev => prev + 1)}
            title="Mi Ubicación"
          >
            <Locate size={20} className="text-primary" />
          </button>
        )}
        <button
          className="btn btn-white shadow rounded-circle p-2 border d-flex align-items-center justify-content-center"
          style={{ width: 40, height: 40 }}
          onClick={() => setTriggerFitAll(prev => prev + 1)}
          title="Ver Todo"
        >
          <Maximize size={20} className="text-dark" />
        </button>
      </div>
      <style>{`
        .selected-tooltip {
          z-index: 9000 !important;
          border: 2px solid #800020 !important;
          background-color: white !important;
        }
        .custom-vehicle-icon {
          transition: z-index 0.3s ease;
        }
      `}</style>
    </div>
  );
}