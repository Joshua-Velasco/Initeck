import React, { useState, useEffect } from 'react';
import {
  Navigation, Clock, Activity, Fuel,
  CheckCircle, MapPin, Zap, X, Wallet, ArrowUpRight, List, TrendingUp, DollarSign, Users, Car, Calendar
} from 'lucide-react';
import ViajeMapa from '../components/Viajes/ViajeMapa';
import HistorialLiquidaciones from '../components/Empleados_Admin/SubComponents/HistorialLiquidaciones';
import {
  EMPLEADOS_UBICACION_URL,
  EMPLEADOS_EVENTOS_URL,
  EMPLEADOS_LIQUIDACIONES_URL,
  EMPLEADOS_RESUMEN_OPERATIVO_URL
} from '../config.js';

export default function ViajesWeb({ user }) {
  const isMonitorista = user?.rol === 'monitorista';
  const colorGuinda = "#800020";
  const [showStats, setShowStats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [empleados, setEmpleados] = useState([]);
  const [eventosGlobales, setEventosGlobales] = useState([]);
  const [liquidaciones, setLiquidaciones] = useState([]);
  const [resumenOperativo, setResumenOperativo] = useState({ ventas: 0, gastos: 0, balance: 0, unidades_activas: 0 });
  const [seleccionado, setSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  // Date state for Cash Flow section, defaults to today
  const [fechaFlujo, setFechaFlujo] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const isUsuarioEnLinea = (emp) => {
    // Si el backend nos da el tiempo de inactividad calculado por el servidor, lo usamos
    if (emp.tiempo_inactividad !== undefined && emp.tiempo_inactividad !== null) {
      const segundos = parseInt(emp.tiempo_inactividad);
      if (segundos <= 600) return 'online'; // 10 min
      if (segundos <= 1800) return 'away';  // 30 min
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

  useEffect(() => {
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

    fetchEmpleadosConUbicacion();
    const interval = setInterval(fetchEmpleadosConUbicacion, 3000);
    return () => clearInterval(interval);
  }, [seleccionado?.id]);

  useEffect(() => {
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
          // Pass the selected date for events
          fetch(`${EMPLEADOS_EVENTOS_URL}?fecha=${fechaFlujo}`),
          // Keep liquidations on current day (as it says 'del Día') or should validly match? 
          // The user specifically asked for 'Flujo de Efectivo', so we focus on that, 
          // but arguably liquidations should also match if we want a full day view.
          // For now, leaving liquidations as 'today' to strictly follow specific request, 
          // unless user wants to travel back in time for everything.
          // Let's keep liquidations as is (current day real-time) unless user asked to inspect past days for everything.
          // Actually, 'Liquidaciones del día' implies today. 
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
    fetchDataSecundaria();
    // Re-fetch when fechaFlujo changes
    const interval = setInterval(fetchDataSecundaria, 15000);
    return () => clearInterval(interval);
  }, [fechaFlujo]);

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
      
      <div className="row g-0 flex-grow-1 pb-0" style={{ minHeight: 'calc(100vh - 75px)' }}>

        {/* PANEL IZQUIERDO: EVENTOS (Activity Feed) - Oculto para Monitorista */}
        {!isMonitorista && (
          <div className="col-3 border-end bg-white shadow-sm d-flex flex-column" style={{ minHeight: 'calc(100vh - 75px)' }}>
            <div className="p-4 d-flex align-items-center justify-content-between flex-shrink-0" style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', color: 'white' }}>
              <div>
                <h6 className="mb-0 fw-bold tracking-widest text-uppercase" style={{ letterSpacing: '2px', fontSize: '11px', opacity: 0.8 }}>Logística Vivo</h6>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span className="pulse-green"></span>
                  <span className="fw-bold" style={{ fontSize: '14px' }}>Monitor en Vivo</span>
                </div>
              </div>
              <div className="bg-white bg-opacity-10 p-2 rounded-circle">
                <Activity size={20} className="text-white" />
              </div>
            </div>

            <div className="flex-grow-1 overflow-auto custom-scroll-v header-gradient-fade">
              <div className="p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="fw-bold small text-muted uppercase tracking-wider" style={{ fontSize: '10px' }}>Cierres Recientes</span>
                  <span className="badge bg-light text-dark border">Hoy</span>
                </div>
                <HistorialLiquidaciones liquidaciones={liquidaciones} colorGuinda={colorGuinda} />
              </div>

              <div className="px-4 py-2">
                <hr className="m-0 opacity-10" />
              </div>

              <div className="p-4 pt-2">
                <div className="d-flex align-items-center justify-content-between mb-3 mt-2">
                  <span className="fw-bold small text-muted uppercase tracking-wider" style={{ fontSize: '10px' }}>Flujo de Efectivo</span>
                  <div className="position-relative bg-light rounded-pill px-3 py-1 border d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                    <Calendar size={14} className="text-secondary" />
                    <span className="text-primary fw-bold" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
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
                        return `Turno: ${cap(currStr)} - ${cap(nextStr)}`;
                      })()}
                    </span>
                    <input
                      type="date"
                      className="position-absolute w-100 h-100 top-0 start-0 opacity-0"
                      style={{ cursor: 'pointer' }}
                      value={fechaFlujo}
                      onChange={(e) => setFechaFlujo(e.target.value)}
                    />
                  </div>
                </div>

                <div className="custom-scroll-v" style={{ maxHeight: 'calc(100vh - 450px)', overflowY: 'auto', paddingRight: '5px' }}>
                  {eventosGlobales.map((evento, idx) => (
                    <div
                      key={idx}
                      className="p-3 mb-2 bg-white rounded-3 border hover-bg-light cursor-pointer transition-all"
                      style={{ borderLeft: `3px solid ${evento.tipo === 'gasto' ? '#dc3545' : colorGuinda}` }}
                      onClick={() => {
                        const emp = empleados.find(e => e.usuario === evento.usuario);
                        if (emp) setSeleccionado(emp);
                      }}
                    >
                      <div className="d-flex gap-3 align-items-start">
                        <div className="mt-1">
                          {evento.tipo === 'gasto' ? <div className="text-danger bg-danger bg-opacity-10 p-1 rounded"><Fuel size={14} /></div> : <div className="text-success bg-success bg-opacity-10 p-1 rounded"><DollarSign size={14} /></div>}
                        </div>
                        <div className="w-100">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold text-dark" style={{ fontSize: '13px' }}>{evento.usuario}</span>
                            <span className="text-muted small" style={{ fontSize: '10px' }}>{evento.hora}</span>
                          </div>
                          <p className="mb-0 text-secondary mt-1 lh-sm" style={{ fontSize: '11px' }}>{evento.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ÁREA DERECHA: MAP A Y OPERADORES (REDISTRIBUCIÓN UI) */}
        <div className={`${isMonitorista ? 'col-12' : 'col-9'} position-relative d-flex flex-column`} style={{ minHeight: 'calc(100vh - 75px)' }}>

          {/* MAPA FULL HEIGHT */}
          <div className="flex-grow-1 position-relative" style={{ height: '100%' }}>
            <ViajeMapa
              empleados={empleados}
              idSeleccionado={seleccionado?.id}
              colorGuinda={colorGuinda}
              enableUserTracking={false}
            />
          </div>

          {/* PANEL LATERAL DERECHO FLOTANTE (LISTA DE EMPLEADOS) */}
          <div className="position-absolute top-0 end-0 h-100 p-3 pt-4 d-flex flex-column" style={{ width: '320px', zIndex: 900 }}>
            <div className="bg-white bg-opacity-90 backdrop-blur shadow-lg rounded-4 overflow-hidden d-flex flex-column h-100 border pointer-events-auto" style={{ pointerEvents: 'auto', backdropFilter: 'blur(10px)' }}>
              <div className="p-3 border-bottom bg-white bg-opacity-50">
                <h6 className="fw-bold mb-0 text-dark tracking-wider small uppercase">Lista de Operadores</h6>
                <input
                  type="text"
                  placeholder="Buscar unidad o chofer..."
                  className="form-control form-control-sm mt-2 rounded-pill bg-light border-0"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <div className="overflow-auto custom-scroll p-2 flex-grow-1">
                {empleados
                  .filter(emp =>
                    emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                    (emp.vehiculo_nombre && emp.vehiculo_nombre.toLowerCase().includes(busqueda.toLowerCase()))
                  )
                  .map((emp) => (
                    <div
                      key={emp.id}
                      onClick={() => setSeleccionado(seleccionado?.id === emp.id ? null : emp)}
                      className={`d-flex align-items-center gap-2 p-2 rounded-3 mb-1 cursor-pointer transition-all border ${seleccionado?.id === emp.id ? 'bg-light border-danger' : 'border-transparent hover:bg-light'}`}
                      style={{ borderColor: seleccionado?.id === emp.id ? colorGuinda : 'transparent' }}
                    >
                      <div className="position-relative">
                        <img src={`https://ui-avatars.com/api/?name=${emp.nombre}&background=random&color=fff`} className="rounded-circle shadow-sm" style={{ width: '40px', height: '40px' }} alt="p" />
                        <div
                          className={`position-absolute bottom-0 end-0 rounded-circle border border-2 border-white ${emp.estadoConexion === 'online' ? 'bg-success' : 'bg-secondary'}`}
                          style={{ width: 14, height: 14, boxShadow: '0 0 0 1px rgba(0,0,0,0.1)' }}
                          title={emp.estadoConexion === 'online' ? 'En línea' : 'Desconectado'}
                        ></div>
                      </div>
                      <div className="flex-grow-1 overflow-hidden" style={{ lineHeight: '1.2' }}>
                        <div className="d-flex justify-content-between">
                          <span className="fw-bold text-dark text-truncate" style={{ fontSize: '13px' }}>{emp.nombre}</span>
                          <span className="badge bg-light text-dark border" style={{ fontSize: '10px' }}>${emp.montoDia}</span>
                        </div>
                        <small className="text-muted d-block text-truncate" style={{ fontSize: '11px' }}>{emp.vehiculo_nombre || 'Sin vehículo'}</small>
                      </div>
                    </div>
                  ))}
                {empleados.length === 0 && (
                  <div className="text-center p-4 text-muted small">No hay operadores conectados</div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>



      {/* MODAL DE REPORTES (OPTIMIZADO) */}
      {showStats && seleccionado && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="bg-white rounded-5 shadow-2xl overflow-hidden animate-slide-up" style={{ width: '100%', maxWidth: '400px' }}>
            <div className="p-4 text-white position-relative" style={{ backgroundColor: colorGuinda }}>
              <div className="d-flex gap-3 align-items-center">
                <img src={`https://ui-avatars.com/api/?name=${seleccionado.nombre}&background=fff&color=800020`} className="rounded-circle border border-3 border-white shadow" style={{ width: 60 }} alt="a" />
                <div>
                  <h5 className="fw-bold mb-0">{seleccionado.nombre}</h5>
                  <small className="opacity-75 uppercase tracking-widest">{seleccionado.vehiculo_nombre}</small>
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
                  { label: 'Kilometraje', val: `${seleccionado.kmDia} KM`, icon: <MapPin size={20} className="text-danger" /> },
                  { label: 'Última Señal', val: seleccionado.ultima_actividad?.split(' ')[1] || '--:--', icon: <Clock size={20} className="text-primary" /> },
                  { label: 'Estado', val: seleccionado.estadoConexion?.toUpperCase(), icon: <Activity size={20} className="text-warning" /> }
                ].map((item, i) => (
                  <div key={i} className="col-6">
                    <div className="p-3 bg-white border-0 shadow-sm rounded-4 text-center h-100 hover-up">
                      {item.icon}
                      <div className="small text-muted mt-2 uppercase fw-bold" style={{ fontSize: '9px' }}>{item.label}</div>
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
        .custom-scroll::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scroll-v::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-thumb, .custom-scroll-v::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .hover-card:hover { transform: translateY(-3px); background-color: #fdfdfd !important; transition: all 0.3s ease; }
        .hover-up:hover { transform: translateY(-5px); transition: all 0.3s ease; }
        .active-operator { background-color: #fff9f9 !important; }
        .pulse-green { width: 8px; height: 8px; background: #28a745; border-radius: 50%; box-shadow: 0 0 0 rgba(40, 167, 69, 0.4); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(40, 167, 69, 0); } 100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); } }
        .animate-slide-up { animation: slideUp 0.4s ease-out; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .uppercase { text-transform: uppercase; }
        .tracking-wider { letter-spacing: 1px; }
        .hover-bg-light:hover { background-color: #f8f9fa; }
      `}</style>
    </div>
  );
}