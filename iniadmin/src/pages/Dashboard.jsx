import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, UserX, TrendingUp,
  ArrowUpRight, ArrowDownRight, Clock, Calendar,
  Activity, ChevronRight, Sparkles, CheckSquare, AlertCircle
} from 'lucide-react';
import { API_URLS } from '../config';
import { COLORS, getRolLabel, getRolStyle } from '../constants/theme';

/* ── Stat Card ── */
const StatCard = ({ icon: Icon, label, value, trend, trendUp, color, gradient }) => (
  <div className="card-admin animate-fade-in" style={{ 
    position: 'relative', overflow: 'hidden', 
    border: '1px solid rgba(226, 232, 240, 0.8)',
    boxShadow: 'var(--shadow-card)'
  }}>
    {/* Top gradient accent */}
    <div style={{ height: 4, background: gradient || color }} />
    <div style={{ padding: '24px 28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
          {label}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <h3 style={{ fontSize: 36, fontWeight: 900, color: 'var(--gray-900)', lineHeight: 1, marginBottom: 10, letterSpacing: '-1.5px' }}>
            {value}
          </h3>
        </div>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: trendUp ? 'var(--success)' : 'var(--danger)' }}>
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </div>
        )}
      </div>
      <div style={{
        width: 54, height: 54, borderRadius: '16px',
        background: gradient || color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 8px 24px ${color}35`,
        flexShrink: 0,
      }}>
        <Icon size={24} color="white" strokeWidth={2.5} />
      </div>
    </div>
  </div>
);

/* ── Role Distribution Bar ── */
const RoleBar = ({ label, count, total, color }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color }}>{count}</span>
      </div>
      <div style={{ height: 8, background: 'var(--gray-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: 'var(--radius-full)',
          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: `0 0 10px ${color}30`
        }} />
      </div>
    </div>
  );
};

/* ── Employee Row ── */
const EmployeeRow = ({ emp, onClick }) => {
  const rolStyle = getRolStyle(emp.rol);
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 20px', borderRadius: '14px',
        cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        borderBottom: '1px solid var(--gray-50)',
      }}
      onMouseEnter={e => { 
        e.currentTarget.style.background = 'var(--gray-50)';
        e.currentTarget.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={e => { 
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: '12px',
        background: 'linear-gradient(135deg, var(--red-600), var(--red-800))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 800, fontSize: 14, flexShrink: 0,
        boxShadow: '0 4px 10px rgba(220, 38, 38, 0.2)'
      }}>
        {(emp.nombre_completo || '?')[0].toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {emp.nombre_completo}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <span style={{
            fontSize: 10, fontWeight: 800, padding: '2px 10px',
            borderRadius: 'var(--radius-full)',
            background: rolStyle.bg, color: rolStyle.color,
            textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>
            {getRolLabel(emp.rol)}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: emp.estado === 'Activo' ? 'var(--success)' : 'var(--danger)',
            display: 'flex', alignItems: 'center', gap: 4
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: emp.estado === 'Activo' ? 'var(--success)' : 'var(--danger)' }} />
            {emp.estado}
          </span>
        </div>
      </div>
      <ChevronRight size={16} color="var(--gray-300)" />
    </div>
  );
};

/* ══════════════════════════════════════
   DASHBOARD PAGE
   ══════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState([]);
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resEmp, resTar] = await Promise.all([
          fetch(`${API_URLS.empleados}listar.php?t=${Date.now()}`),
          fetch(`${API_URLS.tareas}listar.php?t=${Date.now()}`)
        ]);
        if (resEmp.ok) {
          const dataEmp = await resEmp.json();
          setEmpleados(Array.isArray(dataEmp) ? dataEmp : []);
        }
        if (resTar.ok) {
          const dataTar = await resTar.json();
          setTareas(Array.isArray(dataTar) ? dataTar : []);
        }
      } catch (err) {
        console.error('Error cargando datos del dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const total = empleados.length;
    const activos = empleados.filter(e => e.estado === 'Activo').length;
    const inactivos = total - activos;

    // Role distribution
    const roleCount = {};
    empleados.forEach(e => {
      const rol = e.rol || 'employee';
      roleCount[rol] = (roleCount[rol] || 0) + 1;
    });

    // Recent (last 5)
    const recientes = [...empleados]
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 5);

    // Tasks metrics & Alerts
    const totalTareas = tareas.length;
    const tareasCompletadas = tareas.filter(t => t.estado === 'completada').length;

    const today = new Date();
    today.setHours(0,0,0,0);
    
    const upcomingTasks = tareas.filter(t => {
      if (t.estado === 'completada' || t.estado === 'cancelada') return false;
      return t.fecha_inicio || t.fecha_fin;
    }).map(t => {
      const inicio = t.fecha_inicio ? new Date(t.fecha_inicio + 'T00:00:00') : null;
      const fin = t.fecha_fin ? new Date(t.fecha_fin + 'T00:00:00') : null;
      
      let badge = null;
      let days = 0;
      let type = 'info';

      if (inicio && inicio > today) {
        days = Math.ceil((inicio - today) / 86400000);
        badge = `Empieza en ${days} d.`;
        type = 'brand';
      } else if (fin) {
        days = Math.ceil((fin - today) / 86400000);
        if (days < 0) {
          badge = `${Math.abs(days)} d. de retraso`;
          type = 'danger';
        } else if (days === 0) {
          badge = 'Vence Hoy';
          type = 'warning';
        } else {
          badge = `Quedan ${days} d.`;
          type = 'gray';
        }
      }
      return { ...t, alertBadge: badge, alertType: type, daysLeft: days };
    }).sort((a,b) => {
      if (a.daysLeft < 0 && b.daysLeft >= 0) return -1;
      if (b.daysLeft < 0 && a.daysLeft >= 0) return 1;
      return a.daysLeft - b.daysLeft;
    }).slice(0, 3);

    return { total, activos, inactivos, roleCount, recientes, totalTareas, tareasCompletadas, upcomingTasks };
  }, [empleados, tareas]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
        <div className="animate-spin" style={{ width: 40, height: 40, border: '4px solid var(--gray-200)', borderTopColor: 'var(--red-600)', borderRadius: '50%' }} />
        <p style={{ color: 'var(--gray-500)', fontSize: 15, fontWeight: 600 }}>Iniciando Panel de Control...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      {/* ── Welcome Banner ── */}
      <div className="card-admin" style={{ marginBottom: 32, overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-xl)' }}>
        <div style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 45%, #0d0d0d 100%)',
          padding: '44px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background decorations */}
          <div style={{
            position: 'absolute', top: -100, right: -50, width: 350, height: 350,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: -120, right: 100, width: 280, height: 280,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)',
          }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 12px var(--success)', animation: 'pulse 2s ease-in-out infinite' }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                  Panel de Control
                </span>
              </div>
              <h1 style={{ fontSize: 34, fontWeight: 900, color: 'white', margin: 0, lineHeight: 1.1, letterSpacing: '-1.2px' }}>
                Bienvenido a IniAdmin
              </h1>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginTop: 10, fontWeight: 500, maxWidth: 480 }}>
                Administración de procesos internos · <span style={{ color: 'rgba(255,255,255,0.8)' }}>{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </p>
            </div>
            <button
              className="btn-admin"
              onClick={() => navigate('/empleados')}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: 'white',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '14px',
                padding: '12px 28px',
                fontSize: 14,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}
            >
              <Users size={18} /> Gestionar Empleados
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginBottom: 32 }}>
        <StatCard
          icon={Users} label="Total Empleados" value={stats.total}
          trend="+2 este mes" trendUp={true}
          color="#dc2626" gradient="linear-gradient(135deg, #dc2626, #991b1b)"
        />
        <StatCard
          icon={UserCheck} label="Activos" value={stats.activos}
          trend={`${stats.total > 0 ? Math.round((stats.activos / stats.total) * 100) : 0}% del total`}
          trendUp={true}
          color="#10b981"
          gradient="linear-gradient(135deg, #10b981, #059669)"
        />
        <StatCard
          icon={UserX} label="Inactivos" value={stats.inactivos}
          color="#f59e0b"
          gradient="linear-gradient(135deg, #f59e0b, #d97706)"
        />
        <StatCard
          icon={CheckSquare} label="Tareas Terminadas" value={stats.tareasCompletadas}
          trend={`${stats.totalTareas} en total`}
          trendUp={true}
          color="#3b82f6"
          gradient="linear-gradient(135deg, #3b82f6, #2563eb)"
        />
      </div>

      {/* ── Alertas de Agenda ── */}
      <div className="card-admin animate-fade-in" style={{ marginBottom: 24, border: '1px solid rgba(226, 232, 240, 0.8)' }}>
        <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(220, 38, 38, 0.2)' }}>
              <Calendar size={20} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>Alertas de Agenda</h3>
              <p style={{ fontSize: 12, color: 'var(--gray-500)', margin: '2px 0 0', fontWeight: 500 }}>Tareas pendientes, atrasadas o próximas a iniciar</p>
            </div>
          </div>
          <button className="btn-admin btn-ghost" style={{ fontSize: 13, fontWeight: 700 }} onClick={() => navigate('/tareas')}>
            Ir al Tablero <ChevronRight size={16} />
          </button>
        </div>
        <div style={{ padding: '20px 20px' }}>
          {stats.upcomingTasks.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
              {stats.upcomingTasks.map(t => (
                <div key={t.id} onClick={() => navigate('/tareas')} style={{
                  display: 'flex', gap: 14, alignItems: 'center', padding: '16px 20px', 
                  border: '1px solid var(--gray-200)', borderRadius: '16px', cursor: 'pointer',
                  background: 'white', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderLeft: `5px solid ${t.alertType === 'danger' ? 'var(--danger)' : t.alertType === 'brand' ? 'var(--brand)' : t.alertType === 'warning' ? '#f59e0b' : 'var(--gray-300)'}`,
                  boxShadow: 'var(--shadow-xs)'
                }} onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }} onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.titulo}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4, fontWeight: 500 }}>Resp: <span style={{ color: 'var(--gray-700)', fontWeight: 600 }}>{t.equipo_nombre || t.empleado_nombre || 'Sin asignar'}</span></div>
                  </div>
                  <div className="premium-pill" style={{ 
                    whiteSpace: 'nowrap',
                    background: t.alertType === 'danger' ? '#fee2e2' : t.alertType === 'brand' ? 'var(--red-50)' : t.alertType === 'warning' ? '#fef3c7' : 'var(--gray-50)',
                    color: t.alertType === 'danger' ? '#b91c1c' : t.alertType === 'brand' ? 'var(--brand)' : t.alertType === 'warning' ? '#92400e' : 'var(--gray-600)'
                  }}>
                    {t.alertBadge}
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gray-400)' }}>
               <CheckSquare size={44} color="var(--gray-100)" style={{ marginBottom: 16 }} />
               <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>No hay tareas próximas o atrasadas</p>
             </div>
          )}
        </div>
      </div>

      {/* ── Bottom Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>

        {/* Role Distribution */}
        <div className="card-admin animate-fade-in" style={{ animationDelay: '0.1s', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
          <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid var(--gray-100)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '12px',
                background: 'linear-gradient(135deg, #dc2626, #7f1d1d)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(220, 38, 38, 0.2)'
              }}>
                <Activity size={20} color="white" />
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>Distribución por Rol</h3>
                <p style={{ fontSize: 12, color: 'var(--gray-500)', margin: '2px 0 0', fontWeight: 500 }}>Personal operativo por categoría</p>
              </div>
            </div>
          </div>
          <div style={{ padding: '24px 28px' }}>
            {Object.entries(stats.roleCount)
              .sort(([,a],[,b]) => b - a)
              .map(([rol, count]) => {
                const style = getRolStyle(rol);
                return (
                  <RoleBar
                    key={rol}
                    label={style.label}
                    count={count}
                    total={stats.total}
                    color={style.color}
                  />
                );
              })}
            {Object.keys(stats.roleCount).length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--gray-400)', fontSize: 14, padding: 40, fontWeight: 500 }}>
                Aún no hay personal registrado
              </p>
            )}
          </div>
        </div>

        {/* Recent Employees */}
        <div className="card-admin animate-fade-in" style={{ animationDelay: '0.15s', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
          <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(16, 185, 129, 0.2)'
              }}>
                <Clock size={20} color="white" />
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>Empleados Recientes</h3>
                <p style={{ fontSize: 12, color: 'var(--gray-500)', margin: '2px 0 0', fontWeight: 500 }}>Últimos registros en plataforma</p>
              </div>
            </div>
            <button
              className="btn-admin btn-ghost"
              style={{ fontSize: 13, fontWeight: 700 }}
              onClick={() => navigate('/empleados')}
            >
              Ver todos <ChevronRight size={16} />
            </button>
          </div>
          <div style={{ padding: '8px' }}>
            {stats.recientes.length > 0 ? stats.recientes.map((emp) => (
              <EmployeeRow
                key={emp.id}
                emp={emp}
                onClick={() => navigate('/empleados')}
              />
            )) : (
              <p style={{ textAlign: 'center', color: 'var(--gray-400)', fontSize: 14, padding: 60, fontWeight: 500 }}>
                No hay empleados recientes
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          div[style*="grid-template-columns: 1.2fr 0.8fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
