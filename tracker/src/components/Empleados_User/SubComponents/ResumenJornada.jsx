import React, { useState, useEffect } from 'react';
import { Activity, Clock, DollarSign, TrendingUp, TrendingDown, Loader2, Car, Calendar, Square } from 'lucide-react';
import { EMPLEADO_RESUMEN_DIARIO } from '../../../config';

const ResumenJornada = ({ user, unidad, viajeActivo, onFinalizar }) => {
  const [fechaHora, setFechaHora] = useState(new Date());
  const [data, setData] = useState({ ingresos: 0, gastos: 0, propinas: 0 });
  const [loading, setLoading] = useState(false);
  // 1. Reloj
  useEffect(() => {
    const timer = setInterval(() => setFechaHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. FETCH de datos reales desde resumen_diario.php
  const fetchResumen = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const resp = await fetch(`${EMPLEADO_RESUMEN_DIARIO}?empleado_id=${user.id}&t=${Date.now()}`);
      const result = await resp.json();
      if (result.status === "success") {
        setData({
          ingresos: result.ingresos,
          gastos: result.gastos,
          propinas: result.propinas || 0
        });
      }
    } catch (error) {
      console.error("Error al obtener resumen:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumen();
    const interval = setInterval(fetchResumen, 30000);
    return () => clearInterval(interval);
  }, [user?.id, viajeActivo]);

  const formatCurrency = (val) => `$${(parseFloat(val) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
  const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date) => date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }).toUpperCase();

  const metrics = [
    { label: 'INGRESOS HOY', value: data.ingresos, color: 'success', icon: <TrendingUp size={12} /> },
    { label: 'GASTOS HOY', value: data.gastos, color: 'danger', icon: <TrendingDown size={12} /> },
    { label: 'PROPINAS HOY', value: data.propinas, color: 'warning', icon: <DollarSign size={12} /> },
  ];

  return (
    <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white position-relative overflow-hidden">
      {/* Indicador de carga sutil */}
      <div
        className="position-absolute top-0 start-0 w-100"
        style={{
          height: '3px',
          backgroundColor: '#800020',
          opacity: loading ? 0.5 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none'
        }}
      ></div>

      {/* Vista Móvil (Tipo Grid Estático) */}
      <div className="d-md-none">
        <div className="row g-2 mb-3">
          {metrics.map((m, idx) => (
            <div key={idx} className="col-4">
              <div className={`text-center p-2 bg-light rounded-3 border-start border-${m.color} border-4 shadow-sm h-100 d-flex flex-column justify-content-center`}>
                <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
                  <span className={`text-${m.color}`} style={{ opacity: 0.8 }}>{m.icon}</span>
                  <div className="fw-bold text-muted" style={{ fontSize: '0.45rem', letterSpacing: '0.5px' }}>{m.label.split(' ')[0]}</div>
                </div>
                <div className={`fw-bold text-${m.color}`} style={{ fontSize: '0.75rem' }}>{formatCurrency(m.value)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-2 mb-2">
          <div className="col-7">
            <div className="p-2 bg-light rounded-3 h-100">
              <div className="fw-bold text-muted text-uppercase" style={{ fontSize: '0.55rem' }}>Vehículo en uso</div>
              <div className="small mb-0 fw-bold text-primary text-truncate">
                <Car size={10} className="me-1" /> {unidad || "Sin unidad"}
              </div>
            </div>
          </div>
          <div className="col-5">
            <div className="text-center p-2 bg-dark text-white rounded-3">
              <div className="fw-bold" style={{ fontSize: '0.55rem', opacity: 0.8 }}>{formatDate(fechaHora)}</div>
              <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{formatTime(fechaHora)}</div>
            </div>
          </div>
        </div>

        {viajeActivo && (
          <button onClick={onFinalizar} className="btn btn-danger w-100 rounded-pill fw-bold py-2 mt-2 shadow-sm border-0" style={{ background: 'linear-gradient(45deg, #dc3545, #800020)' }}>
            <Square size={14} className="me-1" /> FINALIZAR JORNADA
          </button>
        )}
      </div>

      {/* Vista Escritorio */}
      <div className="d-none d-md-block">
        <div className="row align-items-center text-center g-3">
          <div className="col-md-2 border-end">
            <div className="fw-bold text-muted small">INGRESOS</div>
            <div className="h5 mb-0 fw-bold text-success">{formatCurrency(data.ingresos)}</div>
          </div>

          <div className="col-md-2 border-end">
            <div className="fw-bold text-muted small">GASTOS</div>
            <div className="h5 mb-0 fw-bold text-danger">{formatCurrency(data.gastos)}</div>
          </div>

          <div className="col-md-2 border-end">
            <div className="fw-bold text-muted small">PROPINAS</div>
            <div className="h5 mb-0 fw-bold text-warning" style={{ color: '#f59e0b' }}>{formatCurrency(data.propinas)}</div>
          </div>

          <div className="col-md-2 border-end px-3">
            <div className="fw-bold text-muted text-uppercase small">Vehículo Actual</div>
            <div className="h6 mb-0 fw-bold text-primary text-truncate">
              <Car size={16} className="me-2" />
              {unidad || "Sincronizando..."}
            </div>
          </div>

          <div className="col-md-2 border-end px-2">
            <div className="text-muted fw-bold small"><Calendar size={12} /> {formatDate(fechaHora)}</div>
            <div className="fw-bold text-dark h5 mb-0"><Clock size={14} /> {formatTime(fechaHora)}</div>
          </div>

          <div className="col-md-2">
            {viajeActivo ? (
              <button onClick={onFinalizar} className="btn btn-outline-danger w-100 rounded-pill fw-bold py-2 shadow-sm border-2">
                FINALIZAR
              </button>
            ) : (
              <span className="badge bg-light text-muted border py-2 px-3 rounded-pill w-100">INACTIVO</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumenJornada;