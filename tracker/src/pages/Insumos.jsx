import React, { useState, useEffect, useMemo } from 'react';
import {
  Fuel, Car, TrendingDown, AlertTriangle,
  CheckCircle, BarChart2, Calendar, Gauge,
  ChevronLeft, ChevronRight, Users
} from 'lucide-react';
import { useDate } from '../modules/shell/DateProvider';
import { getOperationalDateRange, formatDateForApi, getWeekNumber } from '../utils/dateUtils';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { INSUMOS_GLOBAL_URL } from '../config.js';

const colorGuinda = '#800020';

/* ─── Helpers ─────────────────────────────────────────── */
const fmt = (n) =>
  Number(n || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 });

const fmtMes = (yyyymm) => {
  if (!yyyymm) return '';
  const [y, m] = yyyymm.split('-');
  const nombres = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${nombres[parseInt(m, 10) - 1]} ${y}`;
};

const COLORES_BARRA = ['#800020','#3b82f6','#10b981','#f59e0b','#8b5cf6','#06b6d4','#ec4899','#84cc16'];

/* ─── Status config ──────────────────────────────────── */
const STATUS = {
  bueno:     { color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', label: 'Buen rendimiento',      icon: CheckCircle },
  regular:   { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', label: 'Rendimiento regular',    icon: AlertTriangle },
  malo:      { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', label: 'Revisar consumo',        icon: TrendingDown },
  sin_datos: { color: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0', label: 'Sin datos suficientes',  icon: BarChart2 },
};

/* ─── Tooltip Recharts ───────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-3 shadow-lg border-0 rounded-4" style={{ border: '1px solid #f1f5f9', fontSize: 13 }}>
      <p className="fw-bold mb-2 text-dark border-bottom pb-2" style={{ fontSize: 13 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="d-flex align-items-center gap-2 mb-1">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span className="text-muted small">{p.name}:</span>
          <span className="fw-bold text-dark small">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Tarjeta KPI ────────────────────────────────────── */
const KpiCard = ({ label, value, sub, icon: Icon, color, delay = 0 }) => (
  <div className="col-12 col-sm-6 col-xl-3 animate__animated animate__fadeInUp" style={{ animationDelay: `${delay}s` }}>
    <div className="card border-0 shadow-sm h-100 overflow-hidden position-relative hover-lift"
      style={{ borderRadius: 24 }}>
      <div className="card-body p-4 position-relative" style={{ zIndex: 1 }}>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="p-3 rounded-4 shadow-sm" style={{ background: `${color}15`, color }}>
            <Icon size={22} strokeWidth={2.5} />
          </div>
        </div>
        <span className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: 9, opacity: 0.6, letterSpacing: 2 }}>
          {label}
        </span>
        <h3 className="fw-bold mb-0" style={{ fontSize: '1.5rem', color: '#1e293b', letterSpacing: '-0.5px' }}>{value}</h3>
        {sub && <p className="text-muted mb-0 mt-1" style={{ fontSize: 11 }}>{sub}</p>}
      </div>
      <div className="position-absolute" style={{ right: -15, bottom: -15, opacity: 0.04, color, transform: 'rotate(-15deg)' }}>
        <Icon size={120} />
      </div>
    </div>
  </div>
);

/* ─── Tarjeta de vehículo ────────────────────────────── */
const VehiculoCard = ({ v, isSelected, onClick }) => {
  const st = STATUS[v.eficiencia_status] || STATUS.sin_datos;
  const Icon = st.icon;
  const efKmL = v.eficiencia_promedio ? (v.eficiencia_promedio * 28).toFixed(1) : null;
  const pctBarra = v.eficiencia_promedio ? Math.min(100, (v.eficiencia_promedio / 0.45) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className="card border-0 shadow-sm mb-3 hover-shadow pointer"
      style={{
        borderRadius: 16,
        cursor: 'pointer',
        border: isSelected ? `2px solid ${st.color} !important` : undefined,
        boxShadow: isSelected ? `0 0 0 2px ${st.color}` : undefined,
        transition: 'all .2s',
      }}
    >
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <p className="fw-bold mb-0 text-dark" style={{ fontSize: 14 }}>{v.vehiculo_nombre || 'Sin nombre'}</p>
            <p className="text-muted mb-0" style={{ fontSize: 11 }}>{v.empleado_nombre} · {v.vehiculo_modelo}</p>
          </div>
          <span className="badge rounded-pill d-flex align-items-center gap-1 px-2 py-1"
            style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, fontSize: 10, fontWeight: 700 }}>
            <Icon size={11} strokeWidth={2.5} /> {st.label}
          </span>
        </div>

        <div className="d-flex gap-3 flex-wrap mb-2">
          <div>
            <p className="text-muted mb-0" style={{ fontSize: 10 }}>Gastado</p>
            <p className="fw-bold mb-0" style={{ fontSize: 13, color: colorGuinda }}>{fmt(v.total_gastado)}</p>
          </div>
          <div>
            <p className="text-muted mb-0" style={{ fontSize: 10 }}>Registros</p>
            <p className="fw-bold mb-0 text-dark" style={{ fontSize: 13 }}>{v.cantidad_registros}</p>
          </div>
          <div>
            <p className="text-muted mb-0" style={{ fontSize: 10 }}>Km registrados</p>
            <p className="fw-bold mb-0 text-dark" style={{ fontSize: 13 }}>
              {v.km_totales ? `${Number(v.km_totales).toLocaleString()} km` : '—'}
            </p>
          </div>
          {efKmL && (
            <div>
              <p className="text-muted mb-0" style={{ fontSize: 10 }}>Rend. estimado</p>
              <p className="fw-bold mb-0" style={{ fontSize: 13, color: st.color }}>{efKmL} km/L</p>
            </div>
          )}
        </div>

        {v.eficiencia_promedio !== null && (
          <div>
            <div className="progress" style={{ height: 5, borderRadius: 99 }}>
              <div className="progress-bar" role="progressbar"
                style={{ width: `${pctBarra}%`, background: st.color, borderRadius: 99 }} />
            </div>
            <div className="d-flex justify-content-between mt-1">
              <span className="text-muted" style={{ fontSize: 9 }}>Bajo consumo</span>
              <span className="text-muted" style={{ fontSize: 9 }}>Eficiente</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Componente principal ───────────────────────────── */
export default function Insumos() {
  const { date: currentDate, setDate: setCurrentDate, view: viewType, setView: setViewType } = useDate();
  const dateRange  = getOperationalDateRange(currentDate, viewType);
  const fechaInicio = formatDateForApi(dateRange.start);
  const fechaFin    = formatDateForApi(dateRange.end);

  const [datos,       setDatos]       = useState(null);
  const [cargando,    setCargando]    = useState(false);
  const [error,       setError]       = useState(null);
  const [vehiculoSel, setVehiculoSel] = useState(null);
  const [tabActiva,   setTabActiva]   = useState('resumen');

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewType === 'day')   d.setDate(d.getDate() - 1);
    else if (viewType === 'week')  d.setDate(d.getDate() - 7);
    else if (viewType === 'month') d.setMonth(d.getMonth() - 1);
    else if (viewType === 'year')  d.setFullYear(d.getFullYear() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewType === 'day')   d.setDate(d.getDate() + 1);
    else if (viewType === 'week')  d.setDate(d.getDate() + 7);
    else if (viewType === 'month') d.setMonth(d.getMonth() + 1);
    else if (viewType === 'year')  d.setFullYear(d.getFullYear() + 1);
    setCurrentDate(d);
  };

  const getViewLabel = () => {
    if (viewType === 'day')
      return currentDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    if (viewType === 'month')
      return currentDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).toUpperCase();
    if (viewType === 'year')
      return String(currentDate.getFullYear());
    const opts = { day: 'numeric', month: 'short' };
    return `${new Date(dateRange.start).toLocaleDateString('es-MX', opts).toUpperCase()} – ${new Date(dateRange.end).toLocaleDateString('es-MX', opts).toUpperCase()}`;
  };

  const cargar = () => {
    setCargando(true);
    setError(null);
    fetch(`${INSUMOS_GLOBAL_URL}?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') {
          setDatos(d);
          setVehiculoSel(d.vehiculos?.[0] || null);
        } else {
          setError(d.message || 'Error al cargar datos');
        }
      })
      .catch(() => setError('No se pudo conectar al servidor'))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, [fechaInicio, fechaFin]); // eslint-disable-line

  const datosGraficoGlobal = useMemo(() => {
    if (!datos?.vehiculos) return [];
    const porMes = {};
    datos.vehiculos.forEach((v) => {
      v.gasto_mensual.forEach(({ mes, total }) => {
        if (!porMes[mes]) porMes[mes] = { mes };
        porMes[mes][v.vehiculo_nombre || 'Unidad'] = total;
      });
    });
    return Object.values(porMes)
      .sort((a, b) => a.mes.localeCompare(b.mes))
      .map(r => ({ ...r, label: fmtMes(r.mes) }));
  }, [datos]);

  const vehiculosNombres = useMemo(() =>
    datos?.vehiculos?.map(v => v.vehiculo_nombre || 'Unidad') ?? [],
    [datos]
  );

  const datosEficiencia = useMemo(() => {
    if (!vehiculoSel?.intervalos?.length) return [];
    return vehiculoSel.intervalos.map((iv, i) => ({
      label: `#${i + 1}`,
      'km/$100': parseFloat((iv.eficiencia * 100).toFixed(1)),
      km: iv.km,
      monto: iv.monto,
    }));
  }, [vehiculoSel]);

  const datosChofer = useMemo(() => {
    if (!datos?.vehiculos) return [];
    const acc = {};
    datos.vehiculos.forEach((v) => {
      const nombre = v.empleado_nombre || 'Sin asignar';
      if (!acc[nombre]) acc[nombre] = { nombre, total: 0, unidades: [] };
      acc[nombre].total += parseFloat(v.total_gastado || 0);
      acc[nombre].unidades.push({
        nombre:   v.vehiculo_nombre || 'Unidad',
        monto:    parseFloat(v.total_gastado || 0),
        actual:   !!v.es_vehiculo_actual,
      });
    });
    // Sort unidades: actual first, then by monto desc
    Object.values(acc).forEach(ch => {
      ch.unidades.sort((a, b) => (b.actual - a.actual) || b.monto - a.monto);
    });
    return Object.values(acc).sort((a, b) => b.total - a.total);
  }, [datos]);

  const conteo = useMemo(() => {
    const c = { bueno: 0, regular: 0, malo: 0, sin_datos: 0 };
    datos?.vehiculos?.forEach(v => { c[v.eficiencia_status] = (c[v.eficiencia_status] || 0) + 1; });
    return c;
  }, [datos]);

  const vSel = vehiculoSel;
  const stSel = vSel ? (STATUS[vSel.eficiencia_status] || STATUS.sin_datos) : null;

  const TABS = [
    { id: 'resumen',    label: 'Resumen',   Icon: BarChart2 },
    { id: 'por_unidad', label: 'Por Unidad', Icon: Car },
    { id: 'detalle',    label: 'Historial',  Icon: Calendar },
  ];

  return (
    <div className="container-fluid py-4 px-lg-5 animate__animated animate__fadeIn"
      style={{ backgroundColor: '#f1f5f9', minHeight: '100vh' }}>

      {/* ─── HEADER ───────────────────────────────────── */}
      <div className="text-white rounded-4 p-4 mb-4 shadow-lg d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="d-none d-sm-flex align-items-center justify-content-center bg-white bg-opacity-10 rounded-4"
            style={{ width: 58, height: 58 }}>
            <Fuel size={30} color="white" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="fw-bold mb-0" style={{ fontSize: '1.8rem' }}>Insumos</h1>
            <p className="text-white-50 mb-0 text-uppercase" style={{ fontSize: 10, letterSpacing: 1 }}>
              Análisis de Combustible y Rendimiento
            </p>
          </div>
        </div>

        {/* Selector de período — estilo Dashboard */}
        <div className="d-flex flex-column flex-sm-row align-items-center gap-3">
          {/* Toggle DÍA / SEMANA / MES / AÑO */}
          <div className="btn-group p-1 bg-white bg-opacity-10 rounded-4"
            style={{ backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {[
              { id: 'day',   label: 'Día' },
              { id: 'week',  label: 'Semana' },
              { id: 'month', label: 'Mes' },
              { id: 'year',  label: 'Año' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setViewType(t.id)}
                className={`btn btn-sm px-3 py-2 rounded-3 border-0 transition-all ${viewType === t.id ? 'bg-white text-dark fw-bold shadow-sm' : 'text-white opacity-60'}`}
                style={{ fontSize: '10px', minWidth: 55 }}
              >
                {t.label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Navegación ← fecha → */}
          <div className="d-flex align-items-center gap-2">
            <button onClick={handlePrev}
              className="btn btn-outline-light rounded-circle p-0 d-flex align-items-center justify-content-center border-opacity-25"
              style={{ width: 40, height: 40 }}>
              <ChevronLeft size={20} />
            </button>

            <div className="bg-white bg-opacity-10 px-4 py-2 rounded-pill border border-white border-opacity-10 d-flex align-items-center gap-2"
              style={{ minWidth: 160, justifyContent: 'center' }}>
              <Calendar size={16} className="text-white opacity-70" />
              <span className="small fw-bold text-white text-uppercase"
                style={{ fontSize: '11px', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                {getViewLabel()}
              </span>
            </div>

            <button onClick={handleNext}
              className="btn btn-outline-light rounded-circle p-0 d-flex align-items-center justify-content-center border-opacity-25"
              style={{ width: 40, height: 40 }}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── ERROR ────────────────────────────────────── */}
      {error && (
        <div className="alert border-0 rounded-4 mb-4 d-flex align-items-center gap-2"
          style={{ background: '#fef2f2', color: '#dc2626' }}>
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {cargando && !datos && (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border spinner-border-sm me-2" />
          Cargando datos de combustible…
        </div>
      )}

      {datos && (
        <>
          {/* ─── KPI CARDS ──────────────────────────────── */}
          <div className="row g-3 mb-4">
            <KpiCard label="Total en Gasolina" value={fmt(datos.total_global)}
              sub={`${datos.total_registros} registros · ${datos.total_vehiculos} unidades`}
              icon={Fuel} color={colorGuinda} delay={0.1} />
            <KpiCard label="Buen Rendimiento" value={conteo.bueno}
              sub="unidades eficientes"
              icon={CheckCircle} color="#10b981" delay={0.2} />
            <KpiCard label="Rendimiento Regular" value={conteo.regular}
              sub="unidades aceptables"
              icon={Gauge} color="#f59e0b" delay={0.3} />
            <KpiCard label="Revisar Consumo" value={conteo.malo}
              sub="alto consumo detectado"
              icon={TrendingDown} color="#ef4444" delay={0.4} />
          </div>

          {/* ─── TABS ───────────────────────────────────── */}
          <div className="d-flex gap-2 mb-3 flex-wrap">
            {TABS.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setTabActiva(id)}
                className={`btn btn-sm d-flex align-items-center gap-2 fw-bold ${tabActiva === id ? 'btn-dark' : 'btn-light'}`}
                style={{ borderRadius: 10, fontSize: 13 }}>
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* ─── TAB: RESUMEN ───────────────────────────── */}
          {tabActiva === 'resumen' && (
            <div className="row g-4">
              {/* Gráfico de barras apiladas */}
              <div className="col-12 col-xl-7">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 24 }}>
                  <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="fw-bold mb-0 text-dark">Gasto mensual por unidad</h5>
                        <p className="text-muted mb-0 mt-1" style={{ fontSize: 11 }}>Distribución de combustible en el período</p>
                      </div>
                      <div className="p-2 bg-light rounded-3" style={{ color: colorGuinda }}>
                        <BarChart2 size={20} />
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-4 pt-2">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={datosGraficoGlobal}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                          tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingBottom: 12 }} />
                        {vehiculosNombres.map((nombre, i) => (
                          <Bar key={nombre} dataKey={nombre} stackId="a"
                            fill={COLORES_BARRA[i % COLORES_BARRA.length]}
                            radius={i === vehiculosNombres.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Ranking */}
              <div className="col-12 col-xl-5">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 24 }}>
                  <div className="card-header bg-transparent border-0 pt-4 px-4 pb-2">
                    <h5 className="fw-bold mb-0 text-dark">Ranking de consumo</h5>
                    <p className="text-muted mb-0 mt-1" style={{ fontSize: 11 }}>Unidades con mayor gasto de combustible</p>
                  </div>
                  <div className="card-body p-4 pt-2">
                    {[...datos.vehiculos]
                      .sort((a, b) => b.total_gastado - a.total_gastado)
                      .map((v, i) => {
                        const st = STATUS[v.eficiencia_status] || STATUS.sin_datos;
                        const StIcon = st.icon;
                        const pct = datos.total_global > 0
                          ? ((v.total_gastado / datos.total_global) * 100).toFixed(1)
                          : 0;
                        return (
                          <div key={v.vehiculo_id} className="d-flex align-items-center gap-3 mb-3">
                            <span className="text-muted fw-bold" style={{ width: 22, textAlign: 'right', fontSize: 13 }}>
                              #{i + 1}
                            </span>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between mb-1">
                                <div>
                                  <span className="fw-bold text-dark" style={{ fontSize: 13 }}>
                                    {v.vehiculo_nombre || 'Sin nombre'}
                                  </span>
                                  {v.empleado_nombre && (
                                    <p className="text-muted mb-0" style={{ fontSize: 10 }}>{v.empleado_nombre}</p>
                                  )}
                                </div>
                                <span className="fw-bold" style={{ fontSize: 13, color: colorGuinda }}>
                                  {fmt(v.total_gastado)}
                                </span>
                              </div>
                              <div className="progress" style={{ height: 6, borderRadius: 99 }}>
                                <div className="progress-bar" style={{
                                  width: `${pct}%`,
                                  background: COLORES_BARRA[i % COLORES_BARRA.length],
                                  borderRadius: 99
                                }} />
                              </div>
                            </div>
                            <StIcon size={14} strokeWidth={2.5} style={{ color: st.color, minWidth: 14 }} />
                            <span className="text-muted" style={{ fontSize: 11, width: 36, textAlign: 'right' }}>{pct}%</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Gasto por Chofer ───────────────────────── */}
          {datosChofer.length > 0 && (
            <div className="row g-4 mt-0">
              {/* Gráfico horizontal por chofer */}
              <div className="col-12 col-xl-7">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 24 }}>
                  <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="fw-bold mb-0 text-dark">Gasto por chofer</h5>
                        <p className="text-muted mb-0 mt-1" style={{ fontSize: 11 }}>
                          Total de combustible cargado por operador en el período
                        </p>
                      </div>
                      <div className="p-2 bg-light rounded-3" style={{ color: colorGuinda }}>
                        <Users size={20} />
                      </div>
                    </div>
                  </div>
                  <div className="card-body p-4 pt-3">
                    <ResponsiveContainer width="100%" height={Math.max(180, datosChofer.length * 56)}>
                      <BarChart data={datosChofer} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" axisLine={false} tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                          tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                        <YAxis type="category" dataKey="nombre" width={130} axisLine={false} tickLine={false}
                          tick={{ fill: '#1e293b', fontSize: 12, fontWeight: 700 }} />
                        <Tooltip
                          formatter={(v) => [fmt(v), 'Total gasolina']}
                          contentStyle={{ background: '#fff', border: 'none', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,.08)', fontSize: 13 }} />
                        <Bar dataKey="total" radius={[0, 6, 6, 0]} maxBarSize={32}>
                          {datosChofer.map((_, i) => (
                            <Cell key={i} fill={COLORES_BARRA[i % COLORES_BARRA.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Detalle: choferes + unidades manejadas */}
              <div className="col-12 col-xl-5">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 24 }}>
                  <div className="card-header bg-transparent border-0 pt-4 px-4 pb-2">
                    <h5 className="fw-bold mb-0 text-dark">Unidades por chofer</h5>
                    <p className="text-muted mb-0 mt-1" style={{ fontSize: 11 }}>
                      Vehículos manejados y su consumo individual
                    </p>
                  </div>
                  <div className="card-body p-4 pt-2 d-flex flex-column gap-3">
                    {datosChofer.map((ch, i) => {
                      const pct = datos.total_global > 0
                        ? ((ch.total / datos.total_global) * 100).toFixed(1)
                        : 0;
                      const color = COLORES_BARRA[i % COLORES_BARRA.length];
                      return (
                        <div key={ch.nombre}>
                          {/* Header del chofer */}
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="d-flex align-items-center gap-2">
                              <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                                style={{ width: 32, height: 32, fontSize: 13, background: color + '22', color }}>
                                {ch.nombre.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="fw-bold mb-0 text-dark" style={{ fontSize: 13 }}>{ch.nombre}</p>
                                <p className="mb-0 text-muted" style={{ fontSize: 10 }}>
                                  {ch.unidades.length} unidad{ch.unidades.length !== 1 ? 'es' : ''}
                                </p>
                              </div>
                            </div>
                            <div className="text-end">
                              <p className="fw-black mb-0" style={{ fontSize: 14, color }}>{fmt(ch.total)}</p>
                              <p className="mb-0 text-muted" style={{ fontSize: 10 }}>{pct}% del total</p>
                            </div>
                          </div>

                          {/* Barra de progreso */}
                          <div className="progress mb-2" style={{ height: 5, borderRadius: 99 }}>
                            <div className="progress-bar" style={{ width: `${pct}%`, background: color, borderRadius: 99 }} />
                          </div>

                          {/* Chips de unidades */}
                          <div className="d-flex flex-wrap gap-1">
                            {ch.unidades.map((u, j) => (
                              <span key={j}
                                title={u.actual ? 'Unidad actual' : 'Unidad anterior'}
                                className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1"
                                style={{
                                  background: u.actual ? `${COLORES_BARRA[i % COLORES_BARRA.length]}18` : '#f8fafc',
                                  border: `1px solid ${u.actual ? COLORES_BARRA[i % COLORES_BARRA.length] + '55' : '#e2e8f0'}`,
                                  fontSize: 10, fontWeight: 600,
                                  color: u.actual ? COLORES_BARRA[i % COLORES_BARRA.length] : '#94a3b8',
                                }}>
                                <Car size={9} />
                                {u.nombre}
                                {!u.actual && (
                                  <span className="fw-normal opacity-60" style={{ fontSize: 9 }}>(ant.)</span>
                                )}
                                <span className="fw-bold">
                                  {' '}{fmt(u.monto)}
                                </span>
                              </span>
                            ))}
                          </div>

                          {i < datosChofer.length - 1 && (
                            <hr className="mt-3 mb-0" style={{ borderColor: '#f1f5f9' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB: POR UNIDAD ────────────────────────── */}
          {tabActiva === 'por_unidad' && (
            <div className="row g-4">
              {/* Lista de vehículos */}
              <div className="col-12 col-xl-5">
                {datos.vehiculos.map(v => (
                  <VehiculoCard key={v.vehiculo_id} v={v}
                    isSelected={vehiculoSel?.vehiculo_id === v.vehiculo_id}
                    onClick={() => setVehiculoSel(v)} />
                ))}
              </div>

              {/* Panel de detalle */}
              {vSel && stSel && (
                <div className="col-12 col-xl-7">
                  <div className="card border-0 shadow-sm" style={{ borderRadius: 24, position: 'sticky', top: 80 }}>
                    <div className="card-header bg-transparent border-0 pt-4 px-4 pb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="fw-bold mb-0 text-dark">{vSel.vehiculo_nombre || 'Sin nombre'}</h5>
                          <p className="text-muted mb-0 mt-1" style={{ fontSize: 11 }}>
                            {vSel.empleado_nombre} · {vSel.vehiculo_modelo}
                          </p>
                        </div>
                        <span className="badge rounded-pill d-flex align-items-center gap-1 px-3 py-2"
                          style={{ background: stSel.bg, color: stSel.color, border: `1px solid ${stSel.border}`, fontSize: 11, fontWeight: 700 }}>
                          <stSel.icon size={13} strokeWidth={2.5} /> {stSel.label}
                        </span>
                      </div>
                    </div>
                    <div className="card-body p-4 pt-2">
                      {/* Alerta de análisis */}
                      <div className="rounded-3 p-3 mb-4 d-flex align-items-start gap-2"
                        style={{ background: stSel.bg, border: `1px solid ${stSel.border}` }}>
                        <stSel.icon size={16} style={{ color: stSel.color, marginTop: 1, flexShrink: 0 }} strokeWidth={2.5} />
                        <p className="mb-0" style={{ color: stSel.color, fontSize: 13 }}>
                          {vSel.eficiencia_status === 'bueno'
                            ? 'Este vehículo tiene un consumo eficiente. Mantén el ritmo actual.'
                            : vSel.eficiencia_status === 'regular'
                            ? 'Consumo aceptable pero mejorable. Revisa hábitos de manejo y presión de llantas.'
                            : vSel.eficiencia_status === 'malo'
                            ? 'Alto consumo detectado. Considera revisar el motor, filtros o cambiar hábitos de conducción.'
                            : 'Se necesitan al menos 2 registros de odómetro consecutivos para calcular el rendimiento.'}
                        </p>
                      </div>

                      {/* Stats grid */}
                      <div className="row g-3 mb-4">
                        {[
                          { label: 'Total gastado',    value: fmt(vSel.total_gastado),   color: colorGuinda },
                          { label: 'Registros',         value: vSel.cantidad_registros,   color: '#3b82f6' },
                          { label: 'Km registrados',    value: vSel.km_totales ? `${Number(vSel.km_totales).toLocaleString()} km` : '—', color: '#8b5cf6' },
                          { label: 'Rend. estimado',    value: vSel.eficiencia_promedio ? `${(vSel.eficiencia_promedio * 28).toFixed(1)} km/L` : '—', color: stSel.color },
                        ].map(s => (
                          <div key={s.label} className="col-6">
                            <div className="bg-light rounded-4 p-3">
                              <p className="text-muted mb-1" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</p>
                              <p className="fw-bold mb-0" style={{ fontSize: 18, color: s.color }}>{s.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Gráfico de eficiencia */}
                      {datosEficiencia.length > 1 ? (
                        <>
                          <h6 className="fw-bold text-dark mb-3" style={{ fontSize: 13 }}>
                            Km recorridos por cada $100 de gasolina
                          </h6>
                          <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={datosEficiencia}>
                              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="label" axisLine={false} tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10 }} />
                              <YAxis axisLine={false} tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10 }} unit=" km" />
                              <Tooltip
                                formatter={(v) => [`${v} km`, 'Km por $100']}
                                contentStyle={{ background: '#fff', border: 'none', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,.08)' }} />
                              <Line type="monotone" dataKey="km/$100" stroke={stSel.color} strokeWidth={3}
                                dot={{ fill: stSel.color, r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </>
                      ) : (
                        <div className="text-center text-muted py-4">
                          <Gauge size={32} className="mb-2 opacity-25" />
                          <p className="mb-0 small">Se necesitan al menos 2 registros con odómetro para calcular la eficiencia.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: HISTORIAL ─────────────────────────── */}
          {tabActiva === 'detalle' && (
            <div className="card border-0 shadow-sm" style={{ borderRadius: 24, overflow: 'hidden' }}>
              {/* Selector de unidad */}
              <div className="card-header bg-transparent border-0 pt-4 px-4 pb-3 d-flex align-items-center gap-3 flex-wrap">
                <h5 className="fw-bold mb-0 text-dark">Historial de cargas</h5>
                <select
                  value={vehiculoSel?.vehiculo_id || ''}
                  onChange={e => setVehiculoSel(datos.vehiculos.find(v => v.vehiculo_id == e.target.value))}
                  className="form-select form-select-sm border-0 bg-light fw-bold"
                  style={{ maxWidth: 280, borderRadius: 10 }}>
                  {datos.vehiculos.map(v => (
                    <option key={v.vehiculo_id} value={v.vehiculo_id}>
                      {v.vehiculo_nombre || 'Sin nombre'} — {v.empleado_nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      {['Fecha', 'Hora', 'Monto', 'Odómetro', 'Km desde anterior', 'Rendimiento'].map(h => (
                        <th key={h} className="text-muted fw-bold text-uppercase border-0 px-4 py-3"
                          style={{ fontSize: 10, letterSpacing: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(vehiculoSel?.entradas || []).map((e, i, arr) => {
                      const siguiente = arr[i + 1];
                      const km = siguiente && e.odometro > 0 && siguiente.odometro > 0 && e.odometro > siguiente.odometro
                        ? e.odometro - siguiente.odometro : null;
                      const ef = km && e.monto > 0 ? km / e.monto : null;
                      const st = ef === null ? STATUS.sin_datos
                        : ef >= 0.32 ? STATUS.bueno
                        : ef >= 0.20 ? STATUS.regular
                        : STATUS.malo;
                      const StIcon = st.icon;

                      return (
                        <tr key={`${e.liq_id}-${i}`}>
                          <td className="px-4 py-3 fw-bold text-dark" style={{ fontSize: 13 }}>{e.fecha}</td>
                          <td className="px-4 py-3 text-muted" style={{ fontSize: 13 }}>{e.hora?.slice(0, 5) || '—'}</td>
                          <td className="px-4 py-3 fw-bold" style={{ fontSize: 13, color: colorGuinda }}>{fmt(e.monto)}</td>
                          <td className="px-4 py-3 text-dark" style={{ fontSize: 13 }}>
                            {e.odometro > 0 ? `${Number(e.odometro).toLocaleString()} km` : '—'}
                          </td>
                          <td className="px-4 py-3 fw-bold" style={{ fontSize: 13, color: '#8b5cf6' }}>
                            {km !== null ? `${Number(km).toLocaleString()} km` : '—'}
                          </td>
                          <td className="px-4 py-3" style={{ fontSize: 13 }}>
                            {ef !== null ? (
                              <span className="badge rounded-pill d-inline-flex align-items-center gap-1 px-2 py-1"
                                style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, fontSize: 11, fontWeight: 700 }}>
                                <StIcon size={11} strokeWidth={2.5} />
                                {(ef * 28).toFixed(1)} km/L
                              </span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {!vehiculoSel?.entradas?.length && (
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-5">
                          <Fuel size={32} className="mb-2 opacity-25 d-block mx-auto" />
                          Sin registros de combustible para esta unidad en el período seleccionado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 15px 30px rgba(0,0,0,0.08) !important; }
        .hover-shadow:hover { box-shadow: 0 8px 20px rgba(0,0,0,0.07) !important; }
        .pointer { cursor: pointer; }
      `}</style>
    </div>
  );
}
