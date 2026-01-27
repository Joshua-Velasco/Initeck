import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Calendar, TrendingUp, AlertCircle, Loader2, Coins } from 'lucide-react';
import { COLORS } from '../../constants/theme';
import { EMPLEADOS_DATOS_DIARIOS_URL } from '../../config';


export const ResumenOperativo = ({ empleado, fechas, setFechas }) => {

  const getLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [datosDiarios, setDatosDiarios] = useState({
    ingresos: 0,
<<<<<<< HEAD
    depositos: 0, // Nueva propiedad
=======
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
    efectivo: 0,
    propinas: 0,
    gastos: 0,
    viajes: 0,
    neto: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDatosDiarios = useCallback(async () => {
    if (!empleado?.id) return;

    setLoading(true);
    setError(null);

    try {
      const url = `${EMPLEADOS_DATOS_DIARIOS_URL}?empleado_id=${empleado.id}&fecha_inicio=${fechas.inicio}&fecha_fin=${fechas.fin}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error("Error en la respuesta del servidor");

      const data = await res.json();

      if (data.status === 'success') {
        setDatosDiarios(prev => ({
          ...prev,
          viajes: parseInt(data.total_viajes) || 0,
          ingresos: parseFloat(data.total_ingresos) || 0,
<<<<<<< HEAD
          depositos: parseFloat(data.total_depositos) || 0, // Nuevo campo
=======
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
          efectivo: parseFloat(data.total_efectivo) || 0,
          propinas: parseFloat(data.total_propinas) || 0,
          gastos: parseFloat(data.total_gastos) || 0,
          neto: parseFloat(data.neto) || 0
        }));
      } else {
        throw new Error(data.mensaje || "No se encontraron datos");
      }
    } catch (err) {
      console.error('Error al obtener liquidación:', err);
      setError(err.message === "No se encontraron datos" ? null : "Error de conexión");
<<<<<<< HEAD
      setDatosDiarios(p => ({ ...p, ingresos: 0, depositos: 0, gastos: 0, viajes: 0, neto: 0 }));
=======
      setDatosDiarios(p => ({ ...p, ingresos: 0, gastos: 0, viajes: 0, neto: 0 }));
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
    } finally {
      setLoading(false);
    }
  }, [empleado?.id, fechas.inicio, fechas.fin]);

  useEffect(() => {
    fetchDatosDiarios();
  }, [fetchDatosDiarios]);

  const f = (val) => new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(val || 0);

  const porcentajeEficiencia = datosDiarios.efectivo > 0
    ? ((datosDiarios.neto / datosDiarios.efectivo) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
<<<<<<< HEAD
      {/* Header Eliminado */}

      <div className="card-body p-3">
=======
      <div className="card-header border-0 p-4 bg-transparent d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <h5 className="fw-bold mb-0 d-flex align-items-center" style={{ color: COLORS.guinda }}>
          <div className="p-2 rounded-3 me-3" style={{ backgroundColor: `${COLORS.guinda}15` }}>
            <Zap size={20} fill={COLORS.guinda} stroke={COLORS.guinda} />
          </div>
          Resumen Operativo
        </h5>
        <div className="d-flex align-items-center bg-light p-1 px-3 rounded-pill border shadow-sm gap-2">
          <Calendar size={16} className="text-muted" />
          <div className="d-flex align-items-center gap-2">
            <input
              type="date"
              className="form-control form-control-sm border-0 bg-transparent fw-bold shadow-none p-0"
              style={{ width: '110px' }}
              value={fechas.inicio}
              onChange={(e) => setFechas(p => ({ ...p, inicio: e.target.value }))}
            />
            <span className="text-muted small">al</span>
            <input
              type="date"
              className="form-control form-control-sm border-0 bg-transparent fw-bold shadow-none p-0"
              style={{ width: '110px' }}
              value={fechas.fin}
              onChange={(e) => setFechas(p => ({ ...p, fin: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="card-body p-4 pt-0">
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
        {loading ? (
          <div className="text-center py-5">
            <Loader2 className="animate-spin" style={{ color: COLORS.guinda }} size={32} />
            <p className="text-muted small mt-2">Calculando totales...</p>
          </div>
        ) : error ? (
          <div className="alert alert-light text-center border-0 small text-muted py-4">
            <AlertCircle size={24} className="mb-2 text-warning d-block mx-auto" />
            {error}
          </div>
        ) : (
<<<<<<< HEAD
          <div className="row g-3">
            {/* Ingresos Totales */}
            <div className="col-12 col-md-4 col-xl-2">
              <div className="p-3 rounded-4 h-100 shadow-sm border-start border-5 border-success" style={{ background: 'linear-gradient(145deg, #ffffff, #f0fdf4)' }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                   <span className="badge rounded-pill bg-success bg-opacity-10 text-success" style={{fontSize: '0.7rem'}}>Ingresos</span>
                   <TrendingUp size={14} className="text-success opacity-50" />
                </div>
                <h3 className="fw-bold mb-0 text-dark text-truncate">{f(datosDiarios.efectivo)}</h3>
                <p className="text-muted small fw-bold mb-0 text-truncate" style={{fontSize: '0.75rem'}}>VIAJES: {datosDiarios.viajes}</p>
              </div>
            </div>

            {/* Depósitos / Transferencias */}
            <div className="col-12 col-md-4 col-xl-2">
              <div className="p-3 rounded-4 h-100 shadow-sm border-start border-5 border-primary" style={{ background: 'linear-gradient(145deg, #ffffff, #f0f9ff)' }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                   <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary" style={{fontSize: '0.7rem'}}>Depósitos</span>
                   <Coins size={14} className="text-primary opacity-50" />
                </div>
                <h3 className="fw-bold mb-0 text-dark text-truncate">{f(datosDiarios.depositos)}</h3>
                <p className="text-muted small fw-bold mb-0 text-truncate" style={{fontSize: '0.75rem'}}>TRANSFERENCIAS</p>
              </div>
            </div>

            {/* Propinas */}
            <div className="col-12 col-md-4 col-xl-2">
              <div className="p-3 rounded-4 h-100 shadow-sm border-start border-5 border-warning" style={{ background: 'linear-gradient(145deg, #ffffff, #fefce8)' }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                   <span className="badge rounded-pill bg-warning bg-opacity-10 text-warning" style={{fontSize: '0.7rem'}}>Propinas</span>
                   <Coins size={14} className="text-warning opacity-50" />
                </div>
                <h3 className="fw-bold mb-0 text-dark text-truncate">{f(datosDiarios.propinas)}</h3>
                 <p className="text-muted small fw-bold mb-0 text-truncate" style={{fontSize: '0.75rem'}}>EXTRAS ACUM.</p>
=======
          <div className="row g-4">
            {/* Ingresos Totales */}
            <div className="col-md-6 col-xl-3">
              <div className="p-4 rounded-4 h-100 shadow-sm border-start border-5 border-success" style={{ background: 'linear-gradient(145deg, #ffffff, #f0fdf4)' }}>
                <span className="badge rounded-pill bg-success bg-opacity-10 text-success mb-3 px-3">Ingresos Efectivo</span>
                <p className="text-muted small fw-bold mb-1">VIAJES REGISTRADOS: {datosDiarios.viajes}</p>
                <h2 className="fw-bold mb-0 text-dark">{f(datosDiarios.efectivo)}</h2>
                <div className="mt-3 pt-3 border-top text-muted small d-flex justify-content-between">
                  <span className="d-flex align-items-center">
                    <TrendingUp size={14} className="me-1 text-success" /> Total Efectivo
                  </span>
                </div>
              </div>
            </div>

            {/* Propinas [NUEVO] */}
            <div className="col-md-6 col-xl-3">
              <div className="p-4 rounded-4 h-100 shadow-sm border-start border-5 border-warning" style={{ background: 'linear-gradient(145deg, #ffffff, #fefce8)' }}>
                <span className="badge rounded-pill bg-warning bg-opacity-10 text-warning mb-3 px-3">Propinas</span>
                <p className="text-muted small fw-bold mb-1">EXTRAS DEL DÍA</p>
                <h2 className="fw-bold mb-0 text-dark">{f(datosDiarios.propinas)}</h2>
                <div className="mt-3 pt-3 border-top text-muted small d-flex justify-content-between">
                  <span className="d-flex align-items-center">
                    <Coins size={14} className="me-1 text-warning" /> Total Propinas
                  </span>
                </div>
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
              </div>
            </div>

            {/* Gastos del Día */}
<<<<<<< HEAD
            <div className="col-12 col-md-6 col-xl-3">
              <div className="p-3 rounded-4 h-100 shadow-sm border-start border-5 border-danger" style={{ background: 'linear-gradient(145deg, #ffffff, #fef2f2)' }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                   <span className="badge rounded-pill bg-danger bg-opacity-10 text-danger" style={{fontSize: '0.7rem'}}>Gastos</span>
                   <div className="text-danger opacity-50" style={{ fontSize: '9px' }}>OPERACIÓN</div>
                </div>
                <h3 className="fw-bold mb-0 text-danger text-truncate">{f(datosDiarios.gastos)}</h3>
                <p className="text-muted small fw-bold mb-0 text-truncate" style={{fontSize: '0.75rem'}}>EGRESOS TOTALES</p>
=======
            <div className="col-md-6 col-xl-3">
              <div className="p-4 rounded-4 h-100 shadow-sm border-start border-5 border-danger" style={{ background: 'linear-gradient(145deg, #ffffff, #fef2f2)' }}>
                <span className="badge rounded-pill bg-danger bg-opacity-10 text-danger mb-3 px-3">Gastos Totales</span>
                <p className="text-muted small fw-bold mb-1">EGRESOS DEL DÍA</p>
                <h2 className="fw-bold mb-0 text-danger">{f(datosDiarios.gastos)}</h2>
                <div className="mt-3 pt-3 border-top text-muted small text-end">
                  Operación y mantenimiento
                </div>
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
              </div>
            </div>

            {/* Rendimiento Neto */}
<<<<<<< HEAD
            <div className="col-12 col-md-6 col-xl-3">
              <div className="p-3 rounded-4 h-100 shadow-sm border-start border-5" style={{
                background: 'linear-gradient(145deg, #ffffff, #f0fdf4)',
                borderColor: datosDiarios.neto >= 0 ? COLORS.success : COLORS.danger
              }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                   <span className={`badge rounded-pill ${datosDiarios.neto >= 0 ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                     Neto
                   </span>
                   <span className="text-muted small fw-bold">EFIC: {porcentajeEficiencia}%</span>
                </div>
                <h2 className={`fw-bold mb-1 text-truncate ${datosDiarios.neto >= 0 ? 'text-success' : 'text-danger'}`}>
                  {f(datosDiarios.neto)}
                </h2>
                <p className="text-muted small fw-bold mb-0 text-truncate">
                   {datosDiarios.neto >= 0 ? 'UTILIDAD' : 'PÉRDIDA'}
                </p>
=======
            <div className="col-md-6 col-xl-3">
              <div className="p-4 rounded-4 h-100 shadow-sm border-start border-5" style={{
                background: 'linear-gradient(145deg, #ffffff, #f0fdf4)',
                borderColor: datosDiarios.neto >= 0 ? COLORS.success : COLORS.danger
              }}>
                <span className={`badge rounded-pill mb-3 px-3 ${datosDiarios.neto >= 0 ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'
                  }`}>
                  Balance Neto
                </span>
                <p className="text-muted small fw-bold mb-1">
                  EFICIENCIA: {porcentajeEficiencia}%
                </p>
                <h2 className={`fw-bold mb-0 ${datosDiarios.neto >= 0 ? 'text-success' : 'text-danger'}`}>
                  {f(datosDiarios.neto)}
                </h2>
                <div className="mt-3 pt-3 border-top text-muted small text-end">
                  {datosDiarios.neto >= 0 ? 'Utilidad del periodo' : 'Pérdida operativa'}
                </div>
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};