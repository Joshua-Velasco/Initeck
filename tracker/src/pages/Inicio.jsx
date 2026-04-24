import React, { useState, useEffect } from 'react';
import {
  Users, DollarSign, Map, Star, Loader2,
  TrendingUp, TrendingDown, Calendar, LayoutDashboard,
  ChevronRight, ChevronLeft, Zap, Wrench, CreditCard,
  Activity, Car, Clock, Receipt
} from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { DASHBOARD_V2_URL } from '../config';
import { useDate } from '../modules/shell/DateProvider';
import { getOperationalDateRange, formatDateForApi, getWeekNumber } from '../utils/dateUtils';

const f = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v || 0);

// ── Skeleton ──
const Skeleton = ({ style, className }) => (
  <div className={className} style={{
    borderRadius: 8,
    backgroundImage: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-loading 1.5s infinite linear',
    ...style
  }} />
);

// ── KPI Card ──
const MetricCard = ({ title, value, icon, color, delay, loading }) => (
  <div className="col-6 col-md-4 col-xl animate__animated animate__fadeInUp"
    style={{ animationDelay: `${delay}s`, minWidth: 0 }}>
    <div className="card border-0 h-100 overflow-hidden position-relative"
      style={{ borderRadius: 20, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,.06)', transition: 'transform 0.25s, box-shadow 0.25s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.06)'; }}>
      <div className="card-body p-3" style={{ zIndex: 1, position: 'relative' }}>
        {loading ? (
          <>
            <Skeleton style={{ width: 40, height: 40, marginBottom: 10, borderRadius: 12 }} />
            <Skeleton style={{ width: '55%', height: 9, marginBottom: 6 }} />
            <Skeleton style={{ width: '80%', height: 22 }} />
          </>
        ) : (
          <>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40, background: `${color}18`, color, flexShrink: 0 }}>
                {React.cloneElement(icon, { size: 18, strokeWidth: 2.2 })}
              </div>
            </div>
            <p className="mb-1 fw-bold text-uppercase" style={{ fontSize: 9, color: '#94a3b8', letterSpacing: '0.08em' }}>{title}</p>
            <p className="fw-bold mb-0" style={{ fontSize: '1.1rem', color: '#0f172a', lineHeight: 1.2 }}>{value}</p>
          </>
        )}
      </div>
      {!loading && (
        <div className="position-absolute" style={{ right: -10, bottom: -10, opacity: 0.04, color }}>
          {React.cloneElement(icon, { size: 80 })}
        </div>
      )}
    </div>
  </div>
);

// ── Eventos Recientes de Choferes ──
const EventosRecientes = ({ eventos = [], loading }) => {
  const getInitial = (name = '') => name.trim().charAt(0).toUpperCase();
  const avatarColors = ['#800020', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
  const getColor = (name = '') => avatarColors[name.charCodeAt(0) % avatarColors.length];

  const formatTime = (fechaHora) => {
    if (!fechaHora) return '';
    const d = new Date(fechaHora);
    return d.toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="card border-0 h-100 bg-white" style={{ borderRadius: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
      <div className="pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: '#0f172a', fontSize: 16 }}>
            <div className="p-2 rounded-3" style={{ background: '#f1f5f9' }}>
              <Activity size={16} style={{ color: '#800020' }} />
            </div>
            Actividad de Choferes
          </h5>
          <p className="mb-0 mt-1" style={{ fontSize: 11, color: '#94a3b8' }}>Registros del período seleccionado</p>
        </div>
        <span className="badge rounded-pill px-2 py-1" style={{ background: '#f1f5f9', color: '#64748b', fontSize: 10, fontWeight: 700 }}>
          {eventos.length} eventos
        </span>
      </div>
      <div className="px-3 pb-3" style={{ maxHeight: 420, overflowY: 'auto' }}>
        {loading ? (
          <div className="d-flex flex-column gap-2 pt-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="d-flex gap-3 p-2 rounded-3" style={{ background: '#f8fafc' }}>
                <Skeleton style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0 }} />
                <div className="flex-grow-1">
                  <Skeleton style={{ width: '60%', height: 10, marginBottom: 6 }} />
                  <Skeleton style={{ width: '40%', height: 9 }} />
                </div>
                <Skeleton style={{ width: 55, height: 18, borderRadius: 8 }} />
              </div>
            ))}
          </div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-5">
            <Receipt size={36} className="mb-2" style={{ color: '#cbd5e1' }} />
            <p className="mb-0" style={{ fontSize: 13, color: '#94a3b8' }}>Sin registros en este período</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2 pt-2">
            {eventos.map((ev, i) => {
              const color = getColor(ev.nombre_completo);
              const neto = (parseFloat(ev.monto_efectivo) || 0) - (parseFloat(ev.gastos_total) || 0);
              return (
                <div key={i} className="d-flex align-items-center gap-3 p-2 rounded-3"
                  style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  {/* Avatar */}
                  <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                    style={{ width: 38, height: 38, background: color, color: '#fff', fontSize: 14 }}>
                    {getInitial(ev.nombre_completo)}
                  </div>
                  {/* Info */}
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <p className="fw-bold mb-0 text-truncate" style={{ fontSize: 13, color: '#0f172a' }}>
                      {ev.nombre_completo}
                    </p>
                    <p className="mb-0 d-flex align-items-center gap-1 text-truncate" style={{ fontSize: 11, color: '#94a3b8' }}>
                      {ev.unidad_nombre && <><Car size={10} /> {ev.unidad_nombre} · </>}
                      <Clock size={10} /> {formatTime(ev.fecha_hora)}
                    </p>
                  </div>
                  {/* Amount */}
                  <div className="text-end flex-shrink-0">
                    <p className="fw-bold mb-0" style={{ fontSize: 13, color: neto >= 0 ? '#16a34a' : '#dc2626' }}>
                      {f(neto)}
                    </p>
                    {parseFloat(ev.propinas) > 0 && (
                      <p className="mb-0" style={{ fontSize: 10, color: '#d97706' }}>
                        +{f(ev.propinas)} prop.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Bitácora Taller ──
const BitacoraTaller = ({ eventos = [], loading }) => (
  <div className="card border-0 h-100 bg-white" style={{ borderRadius: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
    <div className="pt-4 px-4 pb-2">
      <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: '#0f172a', fontSize: 16 }}>
        <div className="p-2 rounded-3" style={{ background: '#f1f5f9' }}>
          <Wrench size={16} style={{ color: '#800020' }} />
        </div>
        Bitácora Taller
      </h5>
      <p className="mb-0 mt-1" style={{ fontSize: 11, color: '#94a3b8' }}>Mantenimientos registrados</p>
    </div>
    <div className="px-3 pb-3" style={{ maxHeight: 420, overflowY: 'auto' }}>
      {loading ? (
        <div className="d-flex flex-column gap-2 pt-2">
          {[1,2,3].map(i => (
            <div key={i} className="d-flex gap-3 p-2 rounded-3" style={{ background: '#f8fafc' }}>
              <Skeleton style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0 }} />
              <div className="flex-grow-1">
                <Skeleton style={{ width: '50%', height: 10, marginBottom: 6 }} />
                <Skeleton style={{ width: '70%', height: 9 }} />
              </div>
            </div>
          ))}
        </div>
      ) : eventos.length === 0 ? (
        <div className="text-center py-5">
          <Wrench size={36} className="mb-2" style={{ color: '#cbd5e1' }} />
          <p className="mb-0" style={{ fontSize: 13, color: '#94a3b8' }}>Sin servicios en este período</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2 pt-2">
          {eventos.map((ev, i) => (
            <div key={i} className="d-flex align-items-center gap-3 p-2 rounded-3"
              style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <div className="rounded-circle bg-white d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 38, height: 38, border: '1px solid #f1f5f9' }}>
                <Wrench size={15} style={{ color: '#f59e0b' }} />
              </div>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <p className="fw-bold mb-0 text-truncate" style={{ fontSize: 13, color: '#0f172a' }}>{ev.unidad_nombre}</p>
                <p className="mb-0 text-truncate" style={{ fontSize: 11, color: '#94a3b8' }}>{ev.descripcion || ev.tipo}</p>
              </div>
              <div className="text-end flex-shrink-0">
                {ev.costo > 0 && (
                  <p className="fw-bold mb-0" style={{ fontSize: 12, color: '#dc2626' }}>{f(ev.costo)}</p>
                )}
                <p className="mb-0" style={{ fontSize: 10, color: '#94a3b8' }}>
                  {new Date(ev.fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// ── Tooltip chart ──
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white p-3 shadow-lg rounded-4" style={{ border: '1px solid #f1f5f9', fontSize: 12 }}>
      <p className="fw-bold mb-2 text-dark border-bottom pb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="d-flex align-items-center gap-2 mb-1">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color }} />
          <span className="text-muted">{entry.name}:</span>
          <span className="fw-bold">{entry.name.includes('%') ? `${entry.value}%` : f(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function Inicio() {
  const colorGuinda = '#800020';
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const { date: currentDate, setDate: setCurrentDate, view: viewType, setView: setViewType } = useDate();
  const [dateRange, setDateRange] = useState(getOperationalDateRange(currentDate, viewType));
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [persistentData, setPersistentData] = useState(null);
  const [loadingPersistent, setLoadingPersistent] = useState(true);
  const [isReady, setIsReady]     = useState(false);

  useEffect(() => { const t = setTimeout(() => setIsReady(true), 300); return () => clearTimeout(t); }, []);

  useEffect(() => { setDateRange(getOperationalDateRange(currentDate, viewType)); }, [currentDate, viewType]);

  // Persistent data (bitácora taller — always this week)
  useEffect(() => {
    const fetch_ = async () => {
      setLoadingPersistent(true);
      try {
        const range = getOperationalDateRange(new Date(), 'week');
        const res   = await fetch(DASHBOARD_V2_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user?.id, role_id: user?.rol === 'admin' ? 1 : 2,
            start_date: formatDateForApi(range.start), end_date: formatDateForApi(range.end) })
        });
        setPersistentData(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoadingPersistent(false); }
    };
    if (user?.id) fetch_();
  }, [user?.id]);

  // Dynamic data (KPIs + pareto + eventos — selected period)
  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res  = await fetch(DASHBOARD_V2_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user?.id, role_id: user?.rol === 'admin' ? 1 : 2,
            start_date: formatDateForApi(dateRange.start), end_date: formatDateForApi(dateRange.end) })
        });
        setData(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    if (user && dateRange.start) fetch_();
  }, [user?.id, user?.rol, dateRange.start.toISOString(), dateRange.end.toISOString()]);

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewType === 'day') d.setDate(d.getDate() - 1);
    else if (viewType === 'week') d.setDate(d.getDate() - 7);
    else if (viewType === 'month') d.setMonth(d.getMonth() - 1);
    else d.setFullYear(d.getFullYear() - 1);
    setCurrentDate(d);
  };
  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewType === 'day') d.setDate(d.getDate() + 1);
    else if (viewType === 'week') d.setDate(d.getDate() + 7);
    else if (viewType === 'month') d.setMonth(d.getMonth() + 1);
    else d.setFullYear(d.getFullYear() + 1);
    setCurrentDate(d);
  };
  const getViewLabel = () => {
    if (viewType === 'day')   return currentDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
    if (viewType === 'month') return currentDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).toUpperCase();
    if (viewType === 'year')  return String(currentDate.getFullYear());
    const o = { day: 'numeric', month: 'short' };
    return `${new Date(dateRange.start).toLocaleDateString('es-MX', o)} — ${new Date(dateRange.end).toLocaleDateString('es-MX', o)}`;
  };

  const kpis = [
    { title: 'Ingresos Brutos',   value: f(data?.metrics?.ingresos),   icon: <DollarSign />, color: '#3b82f6', delay: 0.05 },
    { title: 'Propinas',          value: f(data?.metrics?.propinas),   icon: <Star />,       color: '#f59e0b', delay: 0.10 },
    { title: 'Transacciones',     value: f(data?.metrics?.depositos),  icon: <CreditCard />, color: '#0f172a', delay: 0.15 },
    { title: 'Gastos Totales',    value: f(data?.metrics?.gastos),     icon: <TrendingDown />,color: '#ef4444', delay: 0.20 },
    { title: 'Rendimiento Neto',  value: f(data?.metrics?.neto),       icon: <Zap />,        color: colorGuinda, delay: 0.25 },
    { title: 'Uso de Flota',      value: `${Number(data?.metrics?.km || 0).toLocaleString()} km`, icon: <Map />, color: '#8b5cf6', delay: 0.30 },
    { title: 'Personal en Línea', value: data?.metrics?.empleados_online ?? '—', icon: <Users />, color: '#10b981', delay: 0.35 },
  ];

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh' }}>
      <div className="container-fluid py-4 px-3 px-lg-5">

        {/* ── HEADER ── */}
        <div className="text-white rounded-4 p-4 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 animate__animated animate__fadeIn"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', boxShadow: '0 10px 30px rgba(15,23,42,.25)' }}>

          <div className="d-flex align-items-center gap-3">
            <div className="d-none d-sm-flex align-items-center justify-content-center rounded-4 bg-white bg-opacity-10"
              style={{ width: 54, height: 54, flexShrink: 0 }}>
              <LayoutDashboard size={28} color="white" />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h1 className="fw-bold mb-0" style={{ fontSize: '1.6rem' }}>Dashboard</h1>
                {viewType === 'week' && (
                  <span className="badge rounded-pill px-2 py-1 fw-bold" style={{ fontSize: 10, background: colorGuinda }}>
                    SEM. {getWeekNumber(dateRange.start)}
                  </span>
                )}
              </div>
              <p className="text-white-50 mb-0 text-uppercase" style={{ fontSize: 10, letterSpacing: '0.08em' }}>Control Logístico de Flota</p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3 flex-wrap justify-content-center">
            {/* Period selector */}
            <div className="d-flex rounded-4 overflow-hidden p-1 gap-1"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {[{ id: 'day', label: 'Día' }, { id: 'week', label: 'Semana' }, { id: 'month', label: 'Mes' }, { id: 'year', label: 'Año' }].map(t => (
                <button key={t.id} onClick={() => setViewType(t.id)}
                  className="btn btn-sm px-3 py-1 rounded-3 border-0 fw-bold"
                  style={{ fontSize: 11, background: viewType === t.id ? '#fff' : 'transparent', color: viewType === t.id ? '#0f172a' : 'rgba(255,255,255,0.6)', transition: 'all 0.2s' }}>
                  {t.label.toUpperCase()}
                </button>
              ))}
            </div>
            {/* Nav arrows + label */}
            <div className="d-flex align-items-center gap-2">
              <button onClick={handlePrev} className="btn btn-outline-light rounded-circle p-0 d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40, borderColor: 'rgba(255,255,255,0.3)', color: '#fff', flexShrink: 0 }}>
                <ChevronLeft size={20} color="#fff" />
              </button>
              <div className="px-3 py-2 rounded-pill d-flex align-items-center gap-2"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <Calendar size={14} color="rgba(255,255,255,0.7)" />
                <span className="fw-bold text-white text-uppercase" style={{ fontSize: 11, letterSpacing: '0.04em' }}>{getViewLabel()}</span>
              </div>
              <button onClick={handleNext} className="btn btn-outline-light rounded-circle p-0 d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40, borderColor: 'rgba(255,255,255,0.3)', color: '#fff', flexShrink: 0 }}>
                <ChevronRight size={20} color="#fff" />
              </button>
            </div>
          </div>
        </div>

        {/* ── KPI CARDS ── */}
        <div className="row g-3 mb-4">
          {kpis.map((kpi, i) => (
            <MetricCard key={i} {...kpi} loading={loading} />
          ))}
        </div>

        {/* ── BOTTOM ROW ── */}
        <div className="row g-4">
          {/* Pareto chart */}
          <div className="col-12 col-xl-6">
            <div className="card border-0 bg-white h-100" style={{ borderRadius: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
              <div className="pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="fw-bold mb-0" style={{ color: '#0f172a', fontSize: 16 }}>Rendimiento por Unidad</h5>
                  <p className="mb-0 mt-1" style={{ fontSize: 11, color: '#94a3b8' }}>Distribución de Ingresos (Pareto)</p>
                </div>
                <div className="p-2 rounded-3" style={{ background: '#fef2f2' }}>
                  <TrendingUp size={18} style={{ color: colorGuinda }} />
                </div>
              </div>
              <div className="p-4 pt-2" style={{ height: 400 }}>
                {loading ? (
                  <div className="d-flex align-items-end gap-2 h-100 pb-4">
                    {[45, 72, 55, 90, 65, 80].map((h, i) => (
                      <Skeleton key={i} style={{ flex: 1, height: `${h}%`, borderRadius: '8px 8px 0 0' }} />
                    ))}
                  </div>
                ) : isReady && (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data?.pareto || []} margin={{ top: 20, right: 30, left: 0, bottom: 15 }}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={colorGuinda} stopOpacity={1} />
                          <stop offset="100%" stopColor={colorGuinda} stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis yAxisId="right" orientation="right" domain={[0,100]} axisLine={false} tickLine={false} tick={{ fill: '#eab308', fontSize: 10 }} unit="%" />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 20, fontSize: 11, fontWeight: 700 }} />
                      <Bar yAxisId="left" dataKey="ingresos" fill="url(#barGrad)" radius={[8,8,0,0]} barSize={32} name="Efectivo ($)"
                        onClick={(d) => navigate(`/autos?unidad=${d.name}`)} style={{ cursor: 'pointer' }}>
                        {(data?.pareto || []).map((_, i) => <Cell key={i} />)}
                      </Bar>
                      <Line yAxisId="right" type="monotone" dataKey="acumulado" stroke="#eab308" strokeWidth={3}
                        dot={{ r: 4, fill: '#fff', strokeWidth: 3, stroke: '#eab308' }} activeDot={{ r: 6 }} name="% Acumulado" />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Actividad de Choferes */}
          <div className="col-12 col-md-6 col-xl-3">
            <EventosRecientes eventos={data?.eventos_recientes || []} loading={loading} />
          </div>

          {/* Bitácora Taller */}
          <div className="col-12 col-md-6 col-xl-3">
            <BitacoraTaller eventos={persistentData?.bitacora_taller || []} loading={loadingPersistent} />
          </div>
        </div>

      </div>

      <style>{`
        @keyframes skeleton-loading {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
