import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  User,
  Car,
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  Activity,
  AlertCircle
} from 'lucide-react';
import { COLORS } from '../../constants/theme';
import { EMPLEADOS_UBICACION_URL } from '../../config';

const MonitorFlota = () => {
  const [empleadosConectados, setEmpleadosConectados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const REFRESH_INTERVAL = 5000; // 5 segundos por defecto

  // Función para obtener la ubicación de los empleados conectados
  const fetchUbicaciones = useCallback(async () => {
    try {
      const response = await fetch(EMPLEADOS_UBICACION_URL);
      const data = await response.json();

      if (data.status === 'success') {
        setEmpleadosConectados(data.data || []);
        setLastUpdate(new Date());
      } else {
        console.error('Error al obtener ubicaciones:', data.message);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efecto para cargar datos iniciales y configurar actualización automática
  useEffect(() => {
    fetchUbicaciones();

    const interval = setInterval(fetchUbicaciones, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchUbicaciones, REFRESH_INTERVAL]);

  // Función para determinar si un usuario está en línea
  const isUsuarioEnLinea = (emp) => {
    if (emp.tiempo_inactividad !== undefined && emp.tiempo_inactividad !== null) {
      return parseInt(emp.tiempo_inactividad) <= 600; // 10 min
    }
    if (!emp.ultima_actividad) return false;
    const ahora = new Date();
    const ultimaActividad = new Date(emp.ultima_actividad.replace(' ', 'T'));
    const diferenciaMinutos = (ahora - ultimaActividad) / (1000 * 60);
    return diferenciaMinutos <= 10;
  };

  // Formatear tiempo de última actividad
  const formatearUltimaActividad = (ultima_actividad) => {
    if (!ultima_actividad) return 'Sin registro';

    const ahora = new Date();
    const ultimaActividad = new Date(ultima_actividad);
    const diferenciaMinutos = Math.floor((ahora - ultimaActividad) / (1000 * 60));

    if (diferenciaMinutos < 1) return 'Ahora mismo';
    if (diferenciaMinutos < 60) return `Hace ${diferenciaMinutos} min`;

    const diferenciaHoras = Math.floor(diferenciaMinutos / 60);
    if (diferenciaHoras < 24) return `Hace ${diferenciaHoras} h`;

    return ultimaActividad.toLocaleDateString('es-MX');
  };

  // Obtener coordenadas para Google Maps
  const getMapsUrl = (lat, lng) => {
    if (!lat || !lng) return '#';
    return `https://www.google.com/maps?q=${lat},${lng}&z=15`;
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
      {/* Header del monitor */}
      <div className="card-header border-0 p-4 bg-gradient" style={{
        background: `linear-gradient(135deg, ${COLORS.guinda} 0%, #4a0a12 100%)`
      }}>
        <div className="d-flex justify-content-between align-items-center text-white">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-3">
              <Navigation size={24} />
            </div>
            <div>
              <h5 className="fw-bold mb-1">Monitor de Flota en Tiempo Real</h5>
              <p className="mb-0 small opacity-75">
                {empleadosConectados.filter(e => isUsuarioEnLinea(e)).length} usuarios conectados
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <small className="d-block opacity-75">Última actualización</small>
              <small className="fw-bold">
                {lastUpdate ? lastUpdate.toLocaleTimeString('es-MX') : '--:--:--'}
              </small>
            </div>

            <button
              className="btn btn-light btn-sm rounded-3 d-flex align-items-center gap-2"
              onClick={fetchUbicaciones}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span className="d-none d-md-inline">Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="card-body p-4" style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {loading ? (
          <div className="text-center py-5">
            <RefreshCw className="animate-spin text-muted mx-auto" size={32} />
            <p className="text-muted small mt-2">Cargando ubicaciones...</p>
          </div>
        ) : empleadosConectados.length === 0 ? (
          <div className="text-center py-5">
            <AlertCircle size={48} className="text-muted opacity-25 mb-3" />
            <p className="text-muted">No hay usuarios con ubicación registrada</p>
          </div>
        ) : (
          <div className="row g-3">
            {empleadosConectados.map((empleado) => {
              const enLinea = isUsuarioEnLinea(empleado);
              const tieneUbicacion = empleado.latitud && empleado.longitud;

              return (
                <div key={empleado.id} className="col-12 col-md-6 col-lg-4">
                  <div className={`card border-0 shadow-sm rounded-4 h-100 ${enLinea ? 'border-success' : 'border-light'
                    }`}>
                    <div className="card-body p-3">
                      {/* Header de la tarjeta */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className={`p-2 rounded-circle ${enLinea ? 'bg-success bg-opacity-10 text-success' : 'bg-light text-muted'
                            }`}>
                            <User size={16} />
                          </div>
                          <div>
                            <h6 className="fw-bold mb-0 text-truncate" style={{ maxWidth: '150px' }}>
                              {empleado.nombre_completo}
                            </h6>
                            <small className="text-muted">@{empleado.usuario}</small>
                          </div>
                        </div>

                        <div className={`d-flex align-items-center gap-1 px-2 py-1 rounded-pill ${enLinea ? 'bg-success text-white' : 'bg-light text-muted'
                          }`}>
                          {enLinea ? <Wifi size={12} /> : <WifiOff size={12} />}
                          <small className="fw-bold">
                            {enLinea ? 'En línea' : 'Desconectado'}
                          </small>
                        </div>
                      </div>

                      {/* Información del vehículo */}
                      {empleado.vehiculo_nombre && (
                        <div className="d-flex align-items-center gap-2 mb-3 p-2 bg-light rounded-3">
                          <Car size={16} className="text-muted" />
                          <div className="flex-grow-1">
                            <small className="d-block fw-bold text-dark">
                              {empleado.vehiculo_nombre}
                            </small>
                            <small className="text-muted">
                              {empleado.vehiculo_placas}
                            </small>
                          </div>
                        </div>
                      )}

                      {/* Ubicación */}
                      {tieneUbicacion ? (
                        <div className="mb-3">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <MapPin size={16} className="text-primary" />
                            <small className="fw-bold text-primary">Ubicación actual</small>
                          </div>

                          <div className="bg-light p-2 rounded-3">
                            <div className="small text-muted mb-1">
                              Lat: {parseFloat(empleado.latitud).toFixed(6)},
                              Lng: {parseFloat(empleado.longitud).toFixed(6)}
                            </div>

                            <a
                              href={getMapsUrl(empleado.latitud, empleado.longitud)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-primary w-100 rounded-3 mt-2"
                            >
                              <MapPin size={14} className="me-1" />
                              Ver en mapa
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-3">
                          <div className="alert alert-warning border-0 py-2 px-3">
                            <small className="text-muted">
                              <AlertCircle size={12} className="me-1" />
                              Sin ubicación registrada
                            </small>
                          </div>
                        </div>
                      )}

                      {/* Última actividad */}
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <Clock size={14} />
                        <small>
                          Últ. actividad: {formatearUltimaActividad(empleado.ultima_actividad)}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer con estadísticas */}
      <div className="card-footer border-0 bg-light p-3">
        <div className="row text-center">
          <div className="col-4">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <Activity size={16} className="text-success" />
              <div>
                <div className="fw-bold text-success">
                  {empleadosConectados.filter(e => isUsuarioEnLinea(e)).length}
                </div>
                <small className="text-muted">En línea</small>
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <MapPin size={16} className="text-primary" />
              <div>
                <div className="fw-bold text-primary">
                  {empleadosConectados.filter(e => e.latitud && e.longitud).length}
                </div>
                <small className="text-muted">Con ubicación</small>
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="d-flex align-items-center justify-content-center gap-2">
              <Car size={16} className="text-warning" />
              <div>
                <div className="fw-bold text-warning">
                  {empleadosConectados.filter(e => e.vehiculo_id || e.vehiculo_nombre).length}
                </div>
                <small className="text-muted">En ruta</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MonitorFlota;
