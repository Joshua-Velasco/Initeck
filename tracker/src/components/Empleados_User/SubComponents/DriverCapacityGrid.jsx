import React, { useState, useEffect, useRef } from 'react';
import { Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const SAFAR_API = '/initeck-flota/safar/api/';

const CAL_HOURS = Array.from({ length: 24 }, (_, i) => i);

const fmtTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
};

const toDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function getWeekDays(anchor) {
  const d = new Date(anchor);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return x;
  });
}

/**
 * DriverCapacityGrid
 * Vista tipo "cinema" donde cada chofer es una "sala".
 * Muestra visualmente qué chofer está saturado en cada franja horaria.
 */
export default function DriverCapacityGrid({ trips: tripsProp, totalDrivers: totalDriversProp, onTripSelect }) {
  const [currentDay, setCurrentDay] = useState(new Date());
  const [trips, setTrips] = useState(tripsProp || []);
  const [choferes, setChoferes] = useState([]);
  const [capacidad, setCapacidad] = useState({});
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  // Siempre fetch del backend para obtener choferes + trips + capacidad
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${SAFAR_API}agenda_con_capacidad.php?dias=7`);
        const data = await res.json();
        if (data.success) {
          setTrips(data.trips || []);
          setChoferes(data.choferes || []);
          setCapacidad(data.capacidad || {});
        } else {
          console.error('Error cargando agenda:', data.message);
        }
      } catch (err) {
        console.error('Error cargando agenda con capacidad:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const weekDays = getWeekDays(currentDay);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Agrupar trips por fecha
  const byDate = {};
  trips.forEach((t) => {
    const k = toDateKey(new Date(t.FechaProgramadaInicio));
    if (!byDate[k]) byDate[k] = [];
    byDate[k].push(t);
  });

  const navDay = (dir) => {
    const d = new Date(currentDay);
    d.setDate(d.getDate() + dir);
    setCurrentDay(d);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40 }}>
        <div className="spinner-border text-danger mb-2" role="status" />
        <span style={{ fontSize: 13, color: '#888' }}>Cargando agenda...</span>
      </div>
    );
  }

  const dayKey = toDateKey(currentDay);
  const dayTrips = (byDate[dayKey] || []).sort(
    (a, b) => new Date(a.FechaProgramadaInicio) - new Date(b.FechaProgramadaInicio)
  );

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
      }}
    >
      {/* Header de navegación */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px 10px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <button
          onClick={() => navDay(-1)}
          style={{
            background: 'none',
            border: 'none',
            width: 36,
            height: 36,
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#333',
            fontSize: 20,
          }}
        >
          ‹
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>
            {currentDay.toLocaleDateString('es-MX', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </div>
        </div>

        <button
          onClick={() => navDay(1)}
          style={{
            background: 'none',
            border: 'none',
            width: 36,
            height: 36,
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#333',
            fontSize: 20,
          }}
        >
          ›
        </button>
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px', background: '#f8f8f8', fontSize: 11, color: '#666' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          Libre
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
          Ocupado
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
          Saturado
        </span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Users size={12} />
          {choferes.length} chofer{choferes.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {/* Vista de cuadrícula: filas = horas, columnas = choferes */}
      {choferes.length > 0 ? (
        <div ref={scrollRef} style={{ maxHeight: 600, overflowY: 'auto' }}>
          {/* Header de choferes (sticky) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `60px repeat(${choferes.length}, 1fr)`,
              position: 'sticky',
              top: 0,
              zIndex: 10,
              background: '#fff',
              borderBottom: '2px solid #e0e0e0',
            }}
          >
            <div style={{ padding: 10, fontSize: 10, fontWeight: 700, color: '#888', textAlign: 'center' }}>HORA</div>
            {choferes.map((ch, idx) => {
              const capacityKey = `${currentDay.toISOString().split('T')[0]}`;
              return (
                <div
                  key={idx}
                  style={{
                    padding: '8px 4px',
                    fontSize: 10,
                    fontWeight: 700,
                    textAlign: 'center',
                    borderLeft: '1px solid #f0f0f0',
                    color: ch.activo ? '#111' : '#ccc',
                  }}
                >
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ch.nombre_completo?.split(' ')[0] || `Chofer ${idx + 1}`}
                  </div>
                  {ch.unidad_nombre && (
                    <div style={{ fontSize: 9, color: '#888', fontWeight: 500 }}>{ch.unidad_nombre}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Filas de horas */}
          {CAL_HOURS.map((hour) => {
            const hourTrips = dayTrips.filter((t) => {
              const tripHour = new Date(t.FechaProgramadaInicio).getHours();
              return tripHour === hour;
            });

            return (
              <div
                key={hour}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `60px repeat(${choferes.length}, 1fr)`,
                  borderTop: '1px solid #f0f0f0',
                  minHeight: 60,
                }}
              >
                {/* Columna de hora */}
                <div
                  style={{
                    padding: '8px 4px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#bbb',
                    textAlign: 'center',
                    borderRight: '1px solid #f0f0f0',
                    background: '#fafafa',
                  }}
                >
                  {String(hour).padStart(2, '0')}:00
                </div>

                {/* Columnas de choferes */}
                {choferes.map((ch, idx) => {
                  const choferTrips = hourTrips.filter(
                    (t) => t.CodigoUsuarioChofer === ch.codigo_chofer
                  );
                  const tripCount = choferTrips.length;
                  const maxViajes = ch.max_viajes || 3;
                  const saturado = tripCount >= maxViajes;
                  const ocupado = tripCount > 0 && !saturado;

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: 4,
                        borderLeft: '1px solid #f0f0f0',
                        background: saturado
                          ? '#fef2f2'
                          : ocupado
                          ? '#fefce8'
                          : '#f0fdf4',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                      }}
                    >
                      {choferTrips.map((trip) => (
                        <button
                          key={trip.IdOrdenServicio}
                          onClick={() => onTripSelect && onTripSelect(trip)}
                          style={{
                            width: '100%',
                            padding: '6px 4px',
                            borderRadius: 8,
                            border: 'none',
                            background: '#fff',
                            cursor: 'pointer',
                            fontSize: 9,
                            fontWeight: 700,
                            color: '#111',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            transition: 'transform 0.1s',
                            overflow: 'hidden',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                          <div style={{ fontSize: 9, color: '#888', marginBottom: 2 }}>
                            {fmtTime(trip.FechaProgramadaInicio)}
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 800 }}>
                            #{trip.Folio}
                          </div>
                        </button>
                      ))}

                      {tripCount === 0 && (
                        <div
                          style={{
                            fontSize: 18,
                            color: '#22c55e',
                            opacity: 0.3,
                          }}
                        >
                          +
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: 60, textAlign: 'center', color: '#ccc' }}>
          <Users size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <div style={{ fontSize: 14, fontWeight: 600 }}>No hay choferes registrados</div>
          <div style={{ fontSize: 12, marginTop: 8 }}>Registra choferes en el sistema para ver la agenda.</div>
        </div>
      )}
    </div>
  );
}
