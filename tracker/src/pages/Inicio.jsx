import React, { useState, useEffect } from 'react';
import {
  Users, DollarSign, Map, Star, ArrowUpRight, Loader2,
  AlertCircle, Navigation, TrendingUp, TrendingDown, Calendar, LayoutDashboard,
  ChevronRight, ChevronLeft, Car, Zap, Wrench, CreditCard
} from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { DASHBOARD_V2_URL } from '../config';
import CalendarioPagos from '../components/Autos/CalendarioPagos';
import { useDate } from '../modules/shell/DateProvider';
import { getOperationalDateRange, formatDateForApi, getWeekNumber } from '../utils/dateUtils';

// --- COMPONENTE: SKELETON (CARGA) ---
const Skeleton = ({ className, style }) => (
  <div className={`bg-light animate-pulse ${className}`} 
       style={{ 
         backgroundImage: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
         backgroundSize: '200% 100%',
         animation: 'skeleton-loading 1.5s infinite linear',
         ...style
       }} 
  />
);

// Eliminadas funciones locales de fecha ya que se usan desde utils/dateUtils.js

// --- COMPONENTE: TARJETA DE MÉTRICA PROFESIONAL (GLASSPHORMISM) ---
const MetricCard = ({ title, value, icon, trend, color, delay, loading }) => (
  <div className="col-12 col-sm-6 col-xl-2 animate__animated animate__fadeInUp" style={{ animationDelay: `${delay}s` }}>
    <div className="card border-0 shadow-sm h-100 overflow-hidden position-relative hover-lift glass-card"
      style={{ borderRadius: '24px', transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)' }}>
      <div className="card-body p-4 position-relative" style={{ zIndex: 1 }}>
        {loading ? (
          <>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <Skeleton className="rounded-4" style={{ width: '54px', height: '54px' }} />
              <Skeleton className="rounded-pill" style={{ width: '40px', height: '18px' }} />
            </div>
            <Skeleton className="mb-2" style={{ width: '60px', height: '10px' }} />
            <Skeleton style={{ width: '100px', height: '28px' }} />
          </>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="p-3 rounded-4 shadow-sm icon-container" style={{ backgroundColor: `${color}15`, color: color }}>
                {React.cloneElement(icon, { size: 22, strokeWidth: 2.5 })}
              </div>
              <div className="d-flex flex-column align-items-end">
                <span className="badge rounded-pill px-2 py-1 bg-light text-dark border-0 shadow-sm d-flex align-items-center gap-1" style={{ fontSize: '9px', fontWeight: '800' }}>
                  <TrendingUp size={10} className="text-success" /> {trend}
                </span>
              </div>
            </div>
            <div>
              <span className="text-muted text-uppercase fw-bold letter-spacing-2 d-block mb-1" style={{ fontSize: '9px', opacity: 0.6 }}>{title}</span>
              <h3 className="fw-extrabold mb-0" style={{ fontSize: '1.5rem', color: '#1e293b', letterSpacing: '-0.5px' }}>{value}</h3>
            </div>
          </>
        )}
      </div>
      {!loading && (
        <div className="position-absolute" style={{ right: '-15px', bottom: '-15px', opacity: 0.03, color: color, transform: 'rotate(-15deg)' }}>
          {React.cloneElement(icon, { size: 120 })}
        </div>
      )}
    </div>
  </div>
);

// --- COMPONENTE: AGENDA DE SERVICIOS (ESTILO PREMIUM) ---
const AgendaDashboard = ({ servicios = [], colorGuinda, loading }) => {
  const eventosMapeados = servicios.map(s => {
    let color = '#800020';
    if (s.tipo.includes('SEGURO')) color = '#3b82f6';
    if (s.tipo.includes('PLACAS')) color = '#8b5cf6';
    if (s.tipo.includes('ECOLÓGICO')) color = '#10b981';
    if (s.tipo.includes('MANTENIMIENTO')) color = '#f59e0b';

    return {
      fecha: s.fecha,
      tipo: s.tipo,
      unidad_nombre: s.unidad_nombre,
      color: color
    };
  });

  return (
    <div className="card border-0 shadow-sm h-100 bg-white" style={{ borderRadius: '24px' }}>
      <div className="card-header bg-transparent border-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="fw-extrabold mb-0 d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
            <div className="p-2 rounded-3 bg-light"><Calendar size={18} style={{ color: colorGuinda }} /></div>
            Agenda Unificada
          </h5>
          <p className="text-muted small mb-0 mt-1" style={{ fontSize: '11px' }}>Próximos vencimientos y servicios</p>
        </div>
      </div>
      <div className="card-body p-4 custom-scroll-v" style={{ maxHeight: '450px', overflowY: 'auto' }}>
        {loading ? (
          <div className="d-flex flex-column gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="d-flex align-items-center gap-3">
                <Skeleton className="rounded-circle" style={{ width: '40px', height: '40px', minWidth: '40px' }} />
                <div className="flex-grow-1">
                  <Skeleton className="mb-2" style={{ width: '60%', height: '10px' }} />
                  <Skeleton style={{ width: '40%', height: '8px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <CalendarioPagos externalEvents={eventosMapeados} />
        )}
      </div>
    </div>
  );
};

// --- COMPONENTE: BITÁCORA TALLER (NUEVO) ---
const BitacoraTaller = ({ eventos = [], colorGuinda, loading }) => {
    return (
      <div className="card border-0 shadow-sm h-100 bg-white" style={{ borderRadius: '24px' }}>
        <div className="card-header bg-transparent border-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-extrabold mb-0 d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
              <div className="p-2 rounded-3 bg-light"><Wrench size={18} style={{ color: colorGuinda }} /></div>
              Bitácora Taller
            </h5>
            <p className="text-muted small mb-0 mt-1" style={{ fontSize: '11px' }}>Mantenimientos esta semana</p>
          </div>
        </div>
        <div className="card-body p-4 custom-scroll-v" style={{ maxHeight: '450px', overflowY: 'auto' }}>
          {loading ? (
            <div className="d-flex flex-column gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light bg-opacity-50 border border-light">
                    <Skeleton className="rounded-circle" style={{ width: '40px', height: '40px', minWidth: '40px' }} />
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between mb-2">
                        <Skeleton style={{ width: '50%', height: '12px' }} />
                        <Skeleton style={{ width: '30%', height: '10px' }} />
                      </div>
                      <Skeleton style={{ width: '80%', height: '10px' }} />
                    </div>
                </div>
              ))}
            </div>
          ) : eventos.length === 0 ? (
            <div className="text-center text-muted py-5">
                <Wrench size={32} className="mb-2 opacity-25" />
                <p className="mb-0 small">No hay servicios registrados en este periodo</p>
            </div>
          ) : (
             <div className="d-flex flex-column gap-3">
                {eventos.map((evt, idx) => (
                    <div key={idx} className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light bg-opacity-50 border border-light">
                        <div className="rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center" 
                             style={{ width: '40px', height: '40px', minWidth: '40px' }}>
                            <Wrench size={16} className="text-warning" />
                        </div>
                        <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="fw-bold text-dark small">{evt.unidad_nombre}</span>
                                <span className="badge bg-white text-muted border shadow-sm" style={{ fontSize: '9px' }}>
                                    {new Date(evt.fecha + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                                </span>
                            </div>
                            <p className="mb-0 text-muted small lh-sm" style={{ fontSize: '11px' }}>{evt.descripcion || evt.tipo}</p>
                            {evt.costo > 0 && (
                                <p className="mb-0 text-dark fw-bold mt-1" style={{ fontSize: '12px' }}>${Number(evt.costo).toLocaleString()}</p>
                            )}
                        </div>
                    </div>
                ))}
             </div>
          )}
        </div>
      </div>
    );
  };

// --- COMPONENTE: TOOLTIP PERSONALIZADO (ALTA FIDELIDAD) ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white p-3 shadow-lg border-0 rounded-4" style={{ backdropFilter: 'blur(10px)', border: '1px solid #f1f5f9' }}>
        <p className="fw-bold mb-2 text-dark border-bottom pb-2" style={{ fontSize: '13px' }}>{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="d-flex align-items-center gap-2 mb-1">
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color }}></div>
            <span className="text-muted small">{entry.name}:</span>
            <span className="fw-bold text-dark small">
              {entry.name.includes('%') ? `${entry.value}%` : `$${Number(entry.value).toLocaleString()}`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Inicio() {
  const colorGuinda = "#800020";
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  
  const { date: currentDate, setDate: setCurrentDate, view: viewType, setView: setViewType } = useDate();
  const [dateRange, setDateRange] = useState(getOperationalDateRange(currentDate, viewType));

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [persistentData, setPersistentData] = useState(null);
  const [loadingPersistent, setLoadingPersistent] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Actualizar rango cuando cambia currentDate o viewType (viniendo del context)
  useEffect(() => {
    const newRange = getOperationalDateRange(currentDate, viewType);
    setDateRange(newRange);
  }, [currentDate, viewType]);

  // --- EFECTO 1: DATOS PERSISTENTES (Agenda y Taller - Siempre Semana Actual) ---
  useEffect(() => {
    const fetchPersistent = async () => {
      setLoadingPersistent(true);
      try {
        const today = new Date();
        const currentRange = getOperationalDateRange(today, 'week'); // Mantenemos Agenda/Taller en modo semanal
        const payload = { 
            user_id: user?.id, 
            role_id: user?.rol === 'admin' ? 1 : 2,
            start_date: formatDateForApi(currentRange.start),
            end_date: formatDateForApi(currentRange.end)
        };
        
        const response = await fetch(DASHBOARD_V2_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        setPersistentData(result);
      } catch (err) {
        console.error("Error API Persistente:", err);
      } finally {
        setLoadingPersistent(false);
      }
    };
    if (user?.id) fetchPersistent();
  }, [user?.id, user?.rol]);

  // --- EFECTO 2: DATOS DINÁMICOS (KPIs y Pareto - Por Semana Seleccionada) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const payload = { 
            user_id: user?.id, 
            role_id: user?.rol === 'admin' ? 1 : 2,
            start_date: formatDateForApi(dateRange.start),
            end_date: formatDateForApi(dateRange.end)
        };
        
        console.log("Fetching Dynamic Dashboard Data:", payload);
        
        const response = await fetch(DASHBOARD_V2_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Error API Dinámica:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user && dateRange.start) fetchData();
  }, [user?.id, user?.rol, dateRange.start.toISOString(), dateRange.end.toISOString()]);

  // --- NAVEGACIÓN ---
  const handlePrev = () => {
    const nextDate = new Date(currentDate);
    if (viewType === 'day') nextDate.setDate(nextDate.getDate() - 1);
    else if (viewType === 'week') nextDate.setDate(nextDate.getDate() - 7);
    else if (viewType === 'month') nextDate.setMonth(nextDate.getMonth() - 1);
    else if (viewType === 'year') nextDate.setFullYear(nextDate.getFullYear() - 1);
    setCurrentDate(nextDate);
  };

  const handleNext = () => {
    const nextDate = new Date(currentDate);
    if (viewType === 'day') nextDate.setDate(nextDate.getDate() + 1);
    else if (viewType === 'week') nextDate.setDate(nextDate.getDate() + 7);
    else if (viewType === 'month') nextDate.setMonth(nextDate.getMonth() + 1);
    else if (viewType === 'year') nextDate.setFullYear(nextDate.getFullYear() + 1);
    setCurrentDate(nextDate);
  };

  const getViewLabel = () => {
    if (viewType === 'day') return currentDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    if (viewType === 'month') return currentDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).toUpperCase();
    if (viewType === 'year') return currentDate.getFullYear();
    
    // Default Week
    const options = { day: 'numeric', month: 'short' };
    return `${dateRange.start.toLocaleDateString('es-MX', options)} - ${dateRange.end.toLocaleDateString('es-MX', options)}`;
  };
  
  // Calcular número de semana para mostrar
  // Algoritmo simple usando la fecha de inicio de la semana
  // La lógica de getWeekNumber se movió a utils/dateUtils.js


  if (loading && !data) {
    // Show spinner only on initial load or empty data, maybe skeleton later
    // For now keep simple
  }

  const kpis = [
    { title: "Personal en Línea", value: data?.metrics?.empleados_online || "0", icon: <Users />, trend: "Activos", color: "#10b981", delay: 0.1, loading },
    { title: "Ingresos Brutos", value: `$${Number(data?.metrics?.ingresos || 0).toLocaleString()}`, icon: <DollarSign />, trend: "Caja", color: "#3b82f6", delay: 0.2, loading },
    { title: "Total Depósitos", value: `$${Number(data?.metrics?.depositos || 0).toLocaleString()}`, icon: <CreditCard />, trend: "Entradas", color: "#0f172a", delay: 0.3, loading },
    { title: "Propinas Totales", value: `$${Number(data?.metrics?.propinas || 0).toLocaleString()}`, icon: <Star />, trend: "Extras", color: "#f59e0b", delay: 0.4, loading },
    { title: "Gastos Totales", value: `$${Number(data?.metrics?.gastos || 0).toLocaleString()}`, icon: <TrendingDown />, trend: "Egresos", color: "#ef4444", delay: 0.5, loading },
    { title: "Rendimiento Neto", value: `$${Number(data?.metrics?.neto || 0).toLocaleString()}`, icon: <Zap />, trend: "Utilidad", color: "#800020", delay: 0.6, loading },
    { title: "Uso de Flota", value: `${Number(data?.metrics?.km || 0).toLocaleString()} km`, icon: <Map />, trend: "Distancia", color: "#8b5cf6", delay: 0.7, loading },
  ];

  return (
    <div className="container-fluid py-4 px-lg-5" style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', scrollBehavior: 'smooth' }}>

      {/* HEADER PREMIUM (ESTILO VEHICULOS) */}
      <div
        className="text-white rounded-4 p-4 mb-5 shadow-lg border-0 d-flex flex-column flex-md-row justify-content-between align-items-center animate__animated animate__fadeIn"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          boxShadow: "rgba(15, 23, 42, 0.3) 0px 10px 30px"
        }}
      >
        <div className="d-flex align-items-center gap-3 text-center text-md-start">
          <div className="d-none d-sm-flex align-items-center justify-content-center bg-white bg-opacity-10 rounded-4" style={{ width: '58px', height: '58px' }}>
            <LayoutDashboard size={32} color="white" strokeWidth={2.2} />
          </div>

          <div className="d-flex flex-column">
            <div className="d-flex align-items-center gap-2 flex-wrap justify-content-center justify-content-md-start">
              <h1 className="fw-bold mb-0" style={{ fontSize: '1.8rem' }}>Dashboard</h1>
              {viewType === 'week' && (
                <div className="badge rounded-pill text-white border-0 px-3 py-1 fw-bold" style={{ fontSize: '10px', backgroundColor: '#800020' }}>
                  SEMANA {getWeekNumber(dateRange.start)}
                </div>
              )}
            </div>
            <p className="text-white-50 mb-0 small text-uppercase tracking-widest" style={{ fontSize: '10px' }}>
              Control Logístico de Flota
            </p>
          </div>
        </div>

        <div className="d-flex flex-column flex-md-row align-items-center gap-4 mt-3 mt-md-0">
            {/* 1. Selector de periodo (DAY, WEEK, MONTH, YEAR) */}
            <div className="btn-group p-1 bg-white bg-opacity-10 rounded-4" style={{ backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {[
                { id: 'day', label: 'Día' },
                { id: 'week', label: 'Semana' },
                { id: 'month', label: 'Mes' },
                { id: 'year', label: 'Año' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setViewType(type.id)}
                  className={`btn btn-sm px-3 py-2 rounded-3 border-0 transition-all ${viewType === type.id ? 'bg-white text-dark fw-bold shadow-sm' : 'text-white opacity-60'}`}
                  style={{ fontSize: '10px', minWidth: '60px' }}
                >
                  {type.label.toUpperCase()}
                </button>
              ))}
            </div>

            {/* 2. Controles de navegación */}
            <div className="d-flex align-items-center gap-3">
                <button onClick={handlePrev} className="btn btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center border-opacity-25" style={{ width: 40, height: 40 }}>
                    <ChevronLeft size={20} />
                </button>
                
                <div className="bg-white bg-opacity-10 px-4 py-2 rounded-pill border border-white border-opacity-10 d-flex align-items-center gap-2">
                  <Calendar size={18} className="text-white opacity-70" />
                  <span className="small fw-bold text-white text-uppercase" style={{ letterSpacing: '0.5px' }}>
                    {getViewLabel()}
                  </span>
                </div>

                <button onClick={handleNext} className="btn btn-outline-light rounded-circle p-2 d-flex align-items-center justify-content-center border-opacity-25" style={{ width: 40, height: 40 }}>
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
      </div>

      {/* 1. KPIs */}
      <div className="mb-5">
          {/* Desktop View */}
          <div className="d-none d-xl-flex row g-3">
          {kpis.map((kpi, i) => (
              <MetricCard key={i} {...kpi} />
          ))}
          </div>
          {/* Mobile View */}
          <div className="d-xl-none row g-3">
          {kpis.map((kpi, i) => (
              <MetricCard key={i} {...kpi} delay={0} />
          ))}
          </div>
      </div>

      <div className="row g-4">
          {/* 2. RENDIMIENTO POR UNIDAD (PARETO) */}
          <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm h-100 overflow-hidden bg-white" style={{ borderRadius: '24px' }}>
              <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="fw-extrabold mb-0 text-dark">Rendimiento por Unidad</h5>
                    <p className="text-muted small mb-0 mt-1" style={{ fontSize: '11px' }}>Distribución de Ingresos (Pareto)</p>
                  </div>
                  <div className="p-2 bg-light rounded-3 text-danger shadow-sm"><TrendingUp size={20} /></div>
              </div>
              </div>
              <div className="card-body p-4 pt-1">
              <div style={{ width: '100%', height: 420 }}>
                  {loading ? (
                    <div className="h-100 d-flex flex-column gap-2">
                      <div className="d-flex align-items-end gap-3 h-100 px-4">
                        {[40, 70, 50, 90, 60, 80].map((h, i) => (
                          <Skeleton key={i} className="flex-grow-1 rounded-top" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                      <Skeleton style={{ width: '100%', height: '20px' }} />
                    </div>
                  ) : isReady ? (
                    <div style={{ width: '100%', height: '100%', minWidth: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={data?.pareto || []} margin={{ top: 30, right: 30, left: 0, bottom: 20 }}>
                          <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={colorGuinda} stopOpacity={1} />
                              <stop offset="100%" stopColor={colorGuinda} stopOpacity={0.7} />
                          </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                          <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                          dy={15}
                          />
                          <YAxis
                          yAxisId="left"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                          />
                          <YAxis
                          yAxisId="right"
                          orientation="right"
                          domain={[0, 100]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#eab308', fontSize: 10, fontWeight: 700 }}
                          unit="%"
                          />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                          <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '30px', fontSize: '11px', fontWeight: 'bold' }} />
                          <Bar 
                            yAxisId="left" 
                            dataKey="ingresos" 
                            fill="url(#barGradient)" 
                            radius={[8, 8, 0, 0]} 
                            barSize={35} 
                            name="Efectivo ($)"
                            onClick={(barData) => navigate(`/autos?unidad=${barData.name}`)}
                            style={{ cursor: 'pointer' }}
                          >
                          {(data?.pareto || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fillOpacity={1} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }} />
                          ))}
                          </Bar>
                          <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="acumulado"
                          stroke="#eab308"
                          strokeWidth={4}
                          dot={{ r: 5, fill: '#fff', strokeWidth: 3, stroke: '#eab308' }}
                          activeDot={{ r: 7, fill: '#eab308', stroke: '#fff' }}
                          name="% Acumulado"
                          />
                      </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  ) : null}
              </div>
              </div>
          </div>
          </div>

          {/* 3. AGENDA (PERSISTENTE) */}
          <div className="col-12 col-md-6 col-xl-3">
          <AgendaDashboard
              colorGuinda={colorGuinda}
              servicios={persistentData?.servicios_proximos || []}
              loading={loadingPersistent}
          />
          </div>

          {/* 4. BITÁCORA TALLER (PERSISTENTE) */}
          <div className="col-12 col-md-6 col-xl-3">
              <BitacoraTaller 
                  eventos={persistentData?.bitacora_taller || []} 
                  colorGuinda={colorGuinda} 
                  loading={loadingPersistent}
              />
          </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .fw-extrabold { font-weight: 800; }
        .letter-spacing-1 { letter-spacing: 1px; }
        .letter-spacing-2 { letter-spacing: 2px; }
        .letter-spacing-4 { letter-spacing: 4px; }
        
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.08) !important; }
        
        .glass-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); }
        .hover-shadow:hover { box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; transform: translateY(-2px); }
        
        /* Custom Scrollbar */
        .custom-scroll-v::-webkit-scrollbar { width: 5px; }
        .custom-scroll-v::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll-v::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scroll-v::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        
        .pointer { cursor: pointer; }
        
        @keyframes spinner-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}