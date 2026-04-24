import React, { useState, useEffect } from 'react';
import {
  Navigation, Clock, Activity, Fuel,
  CheckCircle, MapPin, Zap, X, Wallet, ArrowUpRight, List, TrendingUp, DollarSign, Users, Car, Calendar, RefreshCw
} from 'lucide-react';
import ViajeMapa from '../components/Viajes/ViajeMapa';
import HistorialLiquidaciones from '../components/Empleados_Admin/SubComponents/HistorialLiquidaciones';
import {
  EMPLEADOS_UBICACION_URL,
  EMPLEADOS_EVENTOS_URL,
  EMPLEADOS_LIQUIDACIONES_URL,
  EMPLEADOS_RESUMEN_OPERATIVO_URL
} from '../config.js';

export default function ViajesMobile({ user }) {
  const isMonitorista = user?.rol === 'monitorista';
  const colorGuinda = "#800020";
  const [showStats, setShowStats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [empleados, setEmpleados] = useState([]);
  const [eventosGlobales, setEventosGlobales] = useState([]);
  const [liquidaciones, setLiquidaciones] = useState([]);
  const [resumenOperativo, setResumenOperativo] = useState({ ventas: 0, gastos: 0, balance: 0, unidades_activas: 0 });
  const [seleccionado, setSeleccionado] = useState(null);
  const [mobileTab, setMobileTab] = useState('map'); // 'map' | 'activity' | 'list'
  const [busqueda, setBusqueda] = useState('');

  // Date state for Cash Flow section
  const [fechaFlujo, setFechaFlujo] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const isUsuarioEnLinea = (emp) => {
    if (emp.tiempo_inactividad !== undefined && emp.tiempo_inactividad !== null) {
      const segundos = parseInt(emp.tiempo_inactividad);
      if (segundos <= 600) return 'online';
      if (segundos <= 1800) return 'away';
      return 'offline';
    }

    if (!emp.ultima_actividad) return 'offline';
    try {
      const ahora = new Date();
      const ultimaActividad = new Date(emp.ultima_actividad.replace(' ', 'T'));
      const diferenciaMinutos = (ahora - ultimaActividad) / (1000 * 60);
      if (diferenciaMinutos <= 10) return 'online';
      if (diferenciaMinutos <= 30) return 'away';
      return 'offline';
    } catch (e) { return 'offline'; }
  };

  // Función para refrescar todos los datos
  const refreshAllData = async () => {
    setRefreshing(true);
    try {
      // Forzar refetch inmediato
      await Promise.all([
        fetchEmpleadosConUbicacion(),
        fetchDataSecundaria()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Mover las funciones fetch fuera de useEffect para poder reutilizarlas
  const fetchEmpleadosConUbicacion = async () => {
    try {
      const response = await fetch(EMPLEADOS_UBICACION_URL);
      const data = await response.json();
      if (data.status === 'success') {
        const todosLosEmpleados = (data.data || []).map(emp => ({
          ...emp,
          id: emp.id,
          nombre: emp.nombre_completo || emp.usuario || "Sin nombre",
          estadoConexion: isUsuarioEnLinea(emp),
          montoDia: emp.monto_dia || "0.00",
          latitud: parseFloat(emp.latitud),
          longitud: parseFloat(emp.longitud),
        }));

        setEmpleados(todosLosEmpleados);
      }
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  const fetchDataSecundaria = async () => {
    try {
      const getLocalDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const [resEv, resLiq, resOp] = await Promise.all([
        fetch(`${EMPLEADOS_EVENTOS_URL}?fecha=${fechaFlujo}`),
        fetch(`${EMPLEADOS_LIQUIDACIONES_URL}?fecha=${getLocalDate()}`),
        fetch(EMPLEADOS_RESUMEN_OPERATIVO_URL)
      ]);
      const dataEv = await resEv.json();
      const dataLiq = await resLiq.json();
      const dataOp = await resOp.json();
      if (dataEv.status === 'success') setEventosGlobales(dataEv.data || []);
      if (dataLiq.status === 'success') setLiquidaciones(dataLiq.data || []);
      if (dataOp.status === 'success') setResumenOperativo(dataOp.data);
    } catch (error) { console.error('Error fetch secundario:', error); }
  };

  useEffect(() => {
    fetchEmpleadosConUbicacion();
    const interval = setInterval(fetchEmpleadosConUbicacion, 3000);
    return () => clearInterval(interval);
  }, [seleccionado?.id]);

  useEffect(() => {
    fetchDataSecundaria();
    const interval = setInterval(fetchDataSecundaria, 15000);
    return () => clearInterval(interval);
  }, [fechaFlujo]);

  // Pull-to-refresh handler
  const handlePullToRefresh = async (e) => {
    const scrollTop = e.target.scrollTop;
    
    // Solo activar si estamos en el tope
    if (scrollTop === 0 && !refreshing) {
      await refreshAllData();
    }
  };

  if (loading && empleados.length === 0) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center bg-light" style={{ height: '100vh' }}>
        <div className="spinner-grow text-danger mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <h6 className="fw-bold text-secondary">INICIALIZANDO TERMINAL DE CONTROL...</h6>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0 bg-white d-flex flex-column" style={{ minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* MOBILE SEGMENTED CONTROL */}
      <div className="px-3 py-2 bg-white border-bottom shadow-sm">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-light p-1 rounded-pill d-flex flex-grow-1">
            <button
              className={`btn btn-sm flex-grow-1 rounded-pill border-0 transition-all ${mobileTab === 'map' ? 'bg-white shadow-sm fw-bold text-dark' : 'text-muted'}`}
              onClick={() => setMobileTab('map')}
            >
              Mapa
            </button>
            <button
              className={`btn btn-sm flex-grow-1 rounded-pill border-0 transition-all ${mobileTab === 'list' ? 'bg-white shadow-sm fw-bold text-dark' : 'text-muted'}`}
              onClick={() => setMobileTab('list')}
            >
              Lista
            </button>
            {!isMonitorista && (
              <button
                className={`btn btn-sm flex-grow-1 rounded-pill border-0 transition-all ${mobileTab === 'activity' ? 'bg-white shadow-sm fw-bold text-dark' : 'text-muted'}`}
                onClick={() => setMobileTab('activity')}
              >
                Actividad
              </button>
            )}
          </div>
          <button
            className="btn btn-link text-danger p-2"
            onClick={refreshAllData}
            disabled={refreshing}
            title="Actualizar datos"
          >
            <RefreshCw size={18} className={refreshing ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* MAP VIEW */}
      {mobileTab === 'map' && (
        <div className="position-relative" style={{ minHeight: '600px', height: 'calc(100vh - 200px)' }}>
          {refreshing && (
            <div className="position-absolute top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 1000 }}>
              <div className="spinner-border spinner-border-sm text-danger" role="status">
                <span className="visually-hidden">Actualizando...</span>
              </div>
            </div>
          )}
          <ViajeMapa
            empleados={empleados}
            idSeleccionado={seleccionado?.id}
            colorGuinda={colorGuinda}
            enableUserTracking={true}
          />
        </div>
      )}

      {/* LIST VIEW */}
      {mobileTab === 'list' && (
        <div className="p-3 overflow-auto" style={{ height: 'calc(100vh - 200px)', position: 'relative' }} onScroll={handlePullToRefresh}>
          {refreshing && (
            <div className="position-absolute top-0 start-50 translate-middle-x mt-2" style={{ zIndex: 1000 }}>
              <div className="spinner-border spinner-border-sm text-danger" role="status" />
            </div>
          )}
          <div className="mb-3">
            <h6 className="fw-bold mb-2 text-dark">Lista de Operadores</h6>
            <input
              type="text"
              placeholder="Buscar unidad o chofer..."
              className="form-control form-control-sm rounded-pill bg-light border-0"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="d-flex flex-column gap-2">
            {empleados
              .filter(emp =>
                emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                (emp.vehiculo_nombre && emp.vehiculo_nombre.toLowerCase().includes(busqueda.toLowerCase()))
              )
              .map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => {
                    setSeleccionado(seleccionado?.id === emp.id ? null : emp);
                    setMobileTab('map');
                  }}
                  className={`d-flex align-items-center gap-3 p-3 rounded-3 cursor-pointer transition-all border ${seleccionado?.id === emp.id ? 'bg-light border-danger' : 'border-transparent bg-white shadow-sm'}`}
                  style={{ borderColor: seleccionado?.id === emp.id ? colorGuinda : 'transparent' }}
                >
                  <div className="position-relative">
                    <img src={`https://ui-avatars.com/api/?name=${emp.nombre}&background=random&color=fff`} className="rounded-circle shadow-sm" style={{ width: '50px', height: '50px' }} alt="p" />
                    <div
                      className={`position-absolute bottom-0 end-0 rounded-circle border border-2 border-white ${emp.estadoConexion === 'online' ? 'bg-success' : 'bg-secondary'}`}
                      style={{ width: 16, height: 16, boxShadow: '0 0 0 1px rgba(0,0,0,0.1)' }}
                    ></div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold text-dark">{emp.nombre}</span>
                      <span className="badge bg-light text-dark border">${emp.montoDia}</span>
                    </div>
                    <small className="text-muted">{emp.vehiculo_nombre || 'Sin vehículo'}</small>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ACTIVITY VIEW */}
      {mobileTab === 'activity' && !isMonitorista && (
        <div className="overflow-auto p-3" style={{ height: 'calc(100vh - 200px)', position: 'relative' }} onScroll={handlePullToRefresh}>
          {refreshing && (
            <div className="position-absolute top-0 start-50 translate-middle-x mt-2" style={{ zIndex: 1000 }}>
              <div className="spinner-border spinner-border-sm text-danger" role="status" />
            </div>
          )}
          <div className="mb-3">
            <h6 className="fw-bold mb-2 text-dark">Cierres Recientes</h6>
            <HistorialLiquidaciones liquidaciones={liquidaciones} colorGuinda={colorGuinda} />
          </div>

          <hr className="my-4" />

          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0 text-dark">Flujo de Efectivo</h6>
              <div className="position-relative bg-light rounded-pill px-3 py-1 border d-flex align-items-center gap-2">
                <Calendar size={14} className="text-secondary" />
                <span className="text-primary fw-bold" style={{ fontSize: '11px' }}>
                  {(() => {
                    if (!fechaFlujo) return 'Seleccionar fecha';
                    const [y, m, d] = fechaFlujo.split('-');
                    const date = new Date(y, m - 1, d);
                    const nextDay = new Date(date);
                    nextDay.setDate(date.getDate() + 1);

                    const opts = { day: 'numeric', month: 'short' };
                    const currStr = date.toLocaleDateString('es-MX', opts);
                    const nextStr = nextDay.toLocaleDateString('es-MX', opts);
                    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
                    return `${cap(currStr)} - ${cap(nextStr)}`;
                  })()}
                </span>
                <input
                  type="date"
                  className="position-absolute w-100 h-100 top-0 start-0 opacity-0"
                  value={fechaFlujo}
                  onChange={(e) => setFechaFlujo(e.target.value)}
                />
              </div>
            </div>

            <div className="d-flex flex-column gap-2">
              {eventosGlobales.map((evento, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded-3 border shadow-sm"
                  style={{ borderLeft: `3px solid ${evento.tipo === 'gasto' ? '#dc3545' : colorGuinda}` }}
                >
                  <div className="d-flex gap-3 align-items-start">
                    <div className="mt-1">
                      {evento.tipo === 'gasto' ? <Fuel size={18} className="text-danger" /> : <DollarSign size={18} className="text-success" />}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-dark">{evento.usuario}</span>
                        <span className="text-muted small">{evento.hora}</span>
                      </div>
                      <p className="mb-0 text-secondary small mt-1">{evento.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STATS MODAL */}
      {showStats && seleccionado && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="bg-white rounded-5 shadow-2xl overflow-hidden animate-slide-up" style={{ width: '100%', maxWidth: '400px' }}>
            <div className="p-4 text-white position-relative" style={{ backgroundColor: colorGuinda }}>
              <div className="d-flex gap-3 align-items-center">
                <img src={`https://ui-avatars.com/api/?name=${seleccionado.nombre}&background=fff&color=800020`} className="rounded-circle border border-3 border-white shadow" style={{ width: 60 }} alt="a" />
                <div>
                  <h5 className="fw-bold mb-0">{seleccionado.nombre}</h5>
                  <small className="opacity-75">{seleccionado.vehiculo_nombre}</small>
                </div>
              </div>
              <button onClick={() => setShowStats(false)} className="btn btn-link text-white position-absolute top-0 end-0 m-3 p-1">
                <X size={24} />
              </button>
            </div>

            <div className="p-4 bg-light">
              <div className="row g-3">
                {[
                  { label: 'Efectivo Hoy', val: `$${seleccionado.montoDia}`, icon: <Wallet size={20} className="text-success" /> },
                  { label: 'Kilometraje', val: `${seleccionado.km_dia} KM`, icon: <MapPin size={20} className="text-danger" /> },
                  { label: 'Última Señal', val: seleccionado.ultima_actividad?.split(' ')[1] || '--:--', icon: <Clock size={20} className="text-primary" /> },
                  { label: 'Estado', val: seleccionado.estadoConexion?.toUpperCase(), icon: <Activity size={20} className="text-warning" /> }
                ].map((item, i) => (
                  <div key={i} className="col-6">
                    <div className="p-3 bg-white border-0 shadow-sm rounded-4 text-center h-100">
                      {item.icon}
                      <div className="small text-muted mt-2 fw-bold" style={{ fontSize: '9px' }}>{item.label}</div>
                      <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>{item.val}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowStats(false)} className="btn btn-dark w-100 mt-4 py-3 rounded-4 fw-bold shadow-sm">ENTENDIDO</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-slide-up { animation: slideUp 0.4s ease-out; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
