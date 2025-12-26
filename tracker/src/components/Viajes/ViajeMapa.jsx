import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- ICONO ESTILO GOOGLE MAPS (PUNTO AZUL) ---
const iconHtml = `
  <div style="background-color: #4285F4; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3); position: relative;">
    <div style="position: absolute; top: -4px; left: -4px; width: 20px; height: 20px; border-radius: 50%; background-color: rgba(66, 133, 244, 0.3); animation: pulse 2s infinite;"></div>
  </div>
  <style> @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } } </style>
`;

const customMarkerIcon = L.divIcon({
  html: iconHtml,
  className: 'custom-gps-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Componente para centrar el mapa suavemente
function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && Array.isArray(coords) && coords.length === 2 && coords[0] !== null) {
      map.setView(coords, map.getZoom(), { animate: true });
    }
  }, [coords, map]);
  return null;
}

export default function ViajeMapa({ empleados = [], idSeleccionado, colorGuinda = "#800020" }) {
  
  // 1. Buscamos al empleado seleccionado para dibujar su estela y centrar el mapa
  const empleadoActivo = empleados.find(e => e.id === idSeleccionado);
  const pathActivo = empleadoActivo?.path || [];
  
  // Obtenemos la última posición válida del seleccionado
  const currentPosActivo = pathActivo.length > 0 ? pathActivo[pathActivo.length - 1] : null;
  
  const centerDefault = [31.7333, -106.4833]; // Ciudad Juárez

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative', overflow: 'hidden' }}>
      <MapContainer 
        center={currentPosActivo || centerDefault} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer 
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; Initeck'
        />
        
        {/* DIBUJAR ESTELA (RECORRIDO) SOLO DEL SELECCIONADO */}
        {pathActivo.length > 1 && (
          <Polyline 
            positions={pathActivo} 
            color={colorGuinda} 
            weight={4} 
            opacity={0.7} 
            lineJoin="round"
          />
        )}

        {/* DIBUJAR MARCADORES DE TODOS LOS EMPLEADOS DISPONIBLES */}
        {empleados.map(emp => {
          // Validación rigurosa de coordenadas
          const tienePath = emp.path && Array.isArray(emp.path) && emp.path.length > 0;
          if (!tienePath) return null;

          const ultimaPos = emp.path[emp.path.length - 1];
          
          // Si la posición no es válida, no renderizar marcador
          if (!ultimaPos || isNaN(ultimaPos[0]) || isNaN(ultimaPos[1])) return null;

          return (
            <Marker 
              key={emp.id} 
              position={ultimaPos} 
              icon={customMarkerIcon}
            >
              <Popup>
                <div className="text-center" style={{ minWidth: '100px' }}>
                  <div className="fw-bold">{emp.nombre}</div>
                  <div className="small text-muted">{emp.estado}</div>
                  {emp.montoDia && (
                    <div className="small text-success fw-bold mt-1">${emp.montoDia}</div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Centrado automático cuando cambia el empleado seleccionado */}
        <RecenterMap coords={currentPosActivo} />
      </MapContainer>

      {/* Indicador superior derecho */}
      <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 1000 }}>
        <div className="badge bg-white text-dark shadow-sm border rounded-pill d-flex align-items-center gap-2 p-2">
          <div className="spinner-grow spinner-grow-sm text-success" style={{width: '8px', height: '8px'}}></div>
          <span style={{fontSize: '10px', fontWeight: 'bold'}}>
            {empleados.length} {empleados.length === 1 ? 'OPERADOR' : 'OPERADORES'} EN VIVO
          </span>
        </div>
      </div>
    </div>
  );
}