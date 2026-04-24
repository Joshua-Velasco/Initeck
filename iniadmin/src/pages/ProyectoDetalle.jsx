import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Briefcase, Calendar, Users, Building2, FileText,
  Plus, Trash2, Edit2, Save, X, Clock, CheckCircle2, AlertCircle,
  Upload, Download, Phone, Mail, MapPin, User, Crown, ChevronDown,
  FileArchive, FileSpreadsheet, FileCheck, File, Loader2, GripVertical
} from 'lucide-react';
import { API_URLS, BASE_API } from '../config';
import { useAuth } from '../context/AuthContext';

/* ═══════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════ */
const ESTADO_CONFIG = {
  pendiente:   { bg: '#fef3c7', color: '#92400e', border: '#fde68a', label: 'Pendiente' },
  en_progreso: { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe', label: 'En Progreso' },
  completada:  { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0', label: 'Completada' },
  cancelada:   { bg: '#fee2e2', color: '#991b1b', border: '#fecaca', label: 'Cancelada' },
};

const TIPO_DOC_ICON = {
  contrato:     { icon: FileCheck, color: '#059669', bg: '#d1fae5' },
  presupuesto:  { icon: FileSpreadsheet, color: '#d97706', bg: '#fef3c7' },
  factura:      { icon: FileText, color: '#2563eb', bg: '#dbeafe' },
  plano:        { icon: FileArchive, color: '#7c3aed', bg: '#ede9fe' },
  otro:         { icon: File, color: '#64748b', bg: '#f1f5f9' },
};

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function ProyectoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [proyecto, setProyecto] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cronograma');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [resProj, resEmp] = await Promise.all([
        fetch(`${API_URLS.proyectos}detalle.php?id=${id}`),
        fetch(`${API_URLS.empleados}listar.php`)
      ]);
      const dataProj = await resProj.json();
      const dataEmp = await resEmp.json();
      if (dataProj.status === 'error') throw new Error(dataProj.message);
      setProyecto(dataProj);
      setEmpleados(Array.isArray(dataEmp) ? dataEmp : []);
    } catch (err) {
      console.error('Error fetching project detail:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
      <Loader2 size={24} className="animate-spin" style={{ color: 'var(--brand)' }} />
      <span style={{ color: 'var(--gray-400)', fontWeight: 600 }}>Cargando proyecto…</span>
    </div>
  );

  if (!proyecto) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
      <AlertCircle size={48} style={{ color: 'var(--gray-300)' }} />
      <p style={{ color: 'var(--gray-400)', fontWeight: 600 }}>Proyecto no encontrado</p>
      <button className="btn-admin btn-secondary" onClick={() => navigate('/proyectos')}>Volver a Proyectos</button>
    </div>
  );

  const estadoProyecto = ESTADO_CONFIG[proyecto.estado] || ESTADO_CONFIG.pendiente;
  const completadas = proyecto.actividades?.filter(a => a.estado === 'completada').length || 0;
  const totalAct = proyecto.actividades?.length || 0;
  const progreso = totalAct > 0 ? Math.round((completadas / totalAct) * 100) : 0;

  const TABS = [
    { key: 'cronograma',  label: 'Cronograma',  icon: Calendar },
    { key: 'equipo',      label: 'Equipo',       icon: Users },
    { key: 'cliente',     label: 'Cliente',      icon: Building2 },
    { key: 'documentos',  label: 'Documentos',   icon: FileText },
  ];

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '10px', overflow: 'hidden' }}>
      
      {/* ── Header ── */}
      <div className="card-admin" style={{ marginBottom: 16, border: 'none', flexShrink: 0 }}>
        <div style={{
          background: 'var(--gradient-brand)', padding: '20px 28px',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: -50, right: 100, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
            <button onClick={() => navigate('/proyectos')} style={{
              background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 12,
              width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'white', transition: 'background 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            >
              <ArrowLeft size={20} />
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.3px' }}>
                  {proyecto.nombre}
                </h2>
                <span style={{
                  padding: '3px 12px', borderRadius: 20,
                  fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px',
                  background: estadoProyecto.bg, color: estadoProyecto.color, border: `1px solid ${estadoProyecto.border}`
                }}>{estadoProyecto.label}</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '4px 0 0', fontWeight: 500 }}>
                {proyecto.descripcion || 'Sin descripción'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 20, color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inicio</div>
                <div style={{ fontWeight: 800, color: 'white' }}>{formatDate(proyecto.fecha_inicio)}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Equipo</div>
                <div style={{ fontWeight: 800, color: 'white' }}>{proyecto.personal?.length || 0} miembros</div>
              </div>
              {totalAct > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Progreso</div>
                  <div style={{ fontWeight: 800, color: 'white' }}>{progreso}%</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex', gap: 4, background: 'white', borderRadius: 16, padding: 4,
        boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)', marginBottom: 16, flexShrink: 0
      }}>
        {TABS.map(tab => {
          const active = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              flex: 1, padding: '10px 16px', border: 'none', borderRadius: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 13, fontWeight: active ? 800 : 600, fontFamily: 'inherit', letterSpacing: '-0.2px',
              background: active ? 'var(--gradient-brand)' : 'transparent',
              color: active ? 'white' : 'var(--gray-500)',
              transition: 'all 0.25s ease', boxShadow: active ? 'var(--shadow-md)' : 'none'
            }}>
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.key === 'cronograma' && totalAct > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 8,
                  background: active ? 'rgba(255,255,255,0.2)' : 'var(--gray-100)',
                  color: active ? 'white' : 'var(--gray-400)'
                }}>{totalAct}</span>
              )}
              {tab.key === 'documentos' && proyecto.documentos?.length > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 8,
                  background: active ? 'rgba(255,255,255,0.2)' : 'var(--gray-100)',
                  color: active ? 'white' : 'var(--gray-400)'
                }}>{proyecto.documentos.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 20 }}>
        {activeTab === 'cronograma'  && <TabCronograma  proyecto={proyecto} empleados={empleados} onRefresh={fetchData} />}
        {activeTab === 'equipo'      && <TabEquipo      proyecto={proyecto} empleados={empleados} onRefresh={fetchData} />}
        {activeTab === 'cliente'     && <TabCliente     proyecto={proyecto} onRefresh={fetchData} />}
        {activeTab === 'documentos'  && <TabDocumentos  proyecto={proyecto} user={user} onRefresh={fetchData} />}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   CALENDAR DATE RANGE PICKER
   ═══════════════════════════════════════════════════════ */
function CalendarRangePicker({ startDate, endDate, onChange }) {
  const todayD = new Date();
  const [viewDate, setViewDate] = useState(() => {
    if (startDate) return new Date(startDate + 'T00:00:00');
    return new Date(todayD.getFullYear(), todayD.getMonth(), 1);
  });
  const [picking, setPicking] = useState('start');
  const [hover, setHover] = useState(null);
  const year = viewDate.getFullYear(), month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DNAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const parseD = (s) => s ? new Date(s + 'T00:00:00') : null;
  const toStr = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const start = parseD(startDate), end = parseD(endDate);
  const cd = (n) => new Date(year, month, n);
  const handleClick = (n) => {
    const clicked = cd(n), str = toStr(clicked);
    if (picking === 'start') { onChange(str, null); setPicking('end'); }
    else { start && clicked < start ? onChange(str, startDate) : onChange(startDate, str); setPicking('start'); }
  };
  const isSt = (n) => start && cd(n).toDateString() === start.toDateString();
  const isEn = (n) => end && cd(n).toDateString() === end.toDateString();
  const inR  = (n) => { const d=cd(n), ef=picking==='end'&&hover?hover:end; return start&&ef&&d>start&&d<ef; };
  const isTd = (n) => cd(n).toDateString() === todayD.toDateString();
  const cells = [];
  for (let i=0;i<firstDay;i++) cells.push(null);
  for (let i=1;i<=daysInMonth;i++) cells.push(i);
  const days = startDate && endDate ? Math.ceil((new Date(endDate+'T00:00:00') - new Date(startDate+'T00:00:00'))/86400000) : null;

  return (
    <div style={{ background:'white', borderRadius:16, overflow:'hidden', border:'1.5px solid var(--gray-100)', boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
      {/* Step indicator */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--gray-100)' }}>
        <button onClick={()=>setPicking('start')} style={{
          flex:1, padding:'10px 12px', border:'none', cursor:'pointer', background: picking==='start'?'rgba(220,38,38,0.05)':'transparent',
          borderBottom: picking==='start'?'2.5px solid var(--brand)':'2.5px solid transparent', transition:'all 0.2s'
        }}>
          <div style={{ fontSize:9, fontWeight:800, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:2 }}>① Inicio</div>
          <div style={{ fontSize:13, fontWeight:800, color: startDate?'var(--brand)':'var(--gray-300)' }}>{startDate ? formatDate(startDate) : 'Seleccionar'}</div>
        </button>
        <div style={{ width:1, background:'var(--gray-100)' }}/>
        <button onClick={()=>setPicking('end')} style={{
          flex:1, padding:'10px 12px', border:'none', cursor:'pointer', background: picking==='end'?'rgba(5,150,105,0.05)':'transparent',
          borderBottom: picking==='end'?'2.5px solid #059669':'2.5px solid transparent', transition:'all 0.2s'
        }}>
          <div style={{ fontSize:9, fontWeight:800, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:2 }}>② Fin</div>
          <div style={{ fontSize:13, fontWeight:800, color: endDate?'#059669':'var(--gray-300)' }}>{endDate ? formatDate(endDate) : 'Seleccionar'}</div>
        </button>
      </div>
      {/* Month nav */}
      <div style={{ background:'var(--gradient-brand)', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <button onClick={()=>setViewDate(new Date(year,month-1,1))} style={{ background:'rgba(255,255,255,0.18)', border:'none', borderRadius:8, width:28, height:28, cursor:'pointer', color:'white', fontWeight:900, fontSize:16, lineHeight:1 }}>‹</button>
        <span style={{ fontWeight:800, fontSize:13, color:'white', letterSpacing:'-0.2px' }}>{MONTHS[month]} {year}</span>
        <button onClick={()=>setViewDate(new Date(year,month+1,1))} style={{ background:'rgba(255,255,255,0.18)', border:'none', borderRadius:8, width:28, height:28, cursor:'pointer', color:'white', fontWeight:900, fontSize:16, lineHeight:1 }}>›</button>
      </div>
      {/* Calendar grid */}
      <div style={{ padding:'10px 12px 12px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:4 }}>
          {DNAMES.map((d,i)=><div key={i} style={{ textAlign:'center', fontSize:9, fontWeight:800, color:'var(--gray-400)', padding:'4px 0' }}>{d}</div>)}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
          {cells.map((day,i)=>{
            if(!day) return <div key={`e-${i}`}/>;
            const s=isSt(day), e=isEn(day), r=inR(day), t=isTd(day);
            return (
              <button key={day} onClick={()=>handleClick(day)}
                onMouseEnter={()=>{ if(picking==='end'&&start) setHover(new Date(year,month,day)); }}
                onMouseLeave={()=>setHover(null)}
                style={{ height:32, border:'none', cursor:'pointer', fontSize:12, fontWeight:s||e||t?800:500,
                  borderRadius: s?'8px 3px 3px 8px': e?'3px 8px 8px 3px': r?3:8,
                  background: s?'var(--brand)': e?'#059669': r?'var(--red-50)':'transparent',
                  color: s||e?'white': t?'var(--brand)':'var(--gray-700)',
                  outline: t&&!s&&!e?'2px solid var(--red-100)':'none',
                  transition:'all 0.15s', position:'relative' }}>
                {day}
              </button>
            );
          })}
        </div>
      </div>
      {/* Duration footer */}
      {days !== null && (
        <div style={{ padding:'10px 14px', background:'linear-gradient(90deg, rgba(220,38,38,0.04), rgba(5,150,105,0.04))', borderTop:'1px solid var(--gray-100)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--brand)', flexShrink:0 }}/>
          <div style={{ flex:1, height:3, borderRadius:3, background:'linear-gradient(90deg, var(--brand), #059669)', position:'relative' }}>
            <div style={{ position:'absolute', top:-3, right:-1, width:9, height:9, borderRadius:'50%', background:'#059669', border:'2px solid white' }}/>
          </div>
          <div style={{ fontSize:12, fontWeight:800, color:'var(--gray-700)', whiteSpace:'nowrap' }}>
            {days} día{days!==1?'s':''}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   GANTT CHART
   ═══════════════════════════════════════════════════════ */
function GanttChart({ actividades, proyectoInicio, proyectoFin }) {
  const today = new Date();
  const [hovRow, setHovRow] = useState(null);
  const allS = actividades.filter(a=>a.fecha_inicio).map(a=>new Date(a.fecha_inicio+'T00:00:00'));
  const allE = actividades.filter(a=>a.fecha_fin).map(a=>new Date(a.fecha_fin+'T00:00:00'));
  let tsS = proyectoInicio ? new Date(proyectoInicio+'T00:00:00') : allS.length?new Date(Math.min(...allS)):new Date();
  let tsE = proyectoFin ? new Date(proyectoFin+'T00:00:00') : allE.length?new Date(Math.max(...allE)):new Date(today.getTime()+30*86400000);
  if(tsE<=tsS) tsE=new Date(tsS.getTime()+30*86400000);
  const totalMs = tsE-tsS;
  const projStart = proyectoInicio?new Date(proyectoInicio+'T00:00:00'):null;
  const projEnd = proyectoFin?new Date(proyectoFin+'T00:00:00'):null;
  const projTot = projStart&&projEnd?Math.max(1,Math.ceil((projEnd-projStart)/86400000)):null;
  const elapsed = projStart?Math.max(0,Math.ceil((today-projStart)/86400000)):null;
  const dlPct = projTot&&elapsed!==null?Math.min(100,Math.round((elapsed/projTot)*100)):null;
  const daysLeft = projEnd?Math.ceil((projEnd-today)/86400000):null;
  const todayPct = Math.max(0,Math.min(100,((today-tsS)/totalMs)*100));
  const completadas = actividades.filter(a=>a.estado==='completada').length;
  const enProgreso = actividades.filter(a=>a.estado==='en_progreso').length;
  const taskPct = actividades.length>0?Math.round((completadas/actividades.length)*100):0;
  const LBL_COUNT = 7;
  const labels = Array.from({length:LBL_COUNT+1},(_,i)=>({ date:new Date(tsS.getTime()+(totalMs*i)/LBL_COUNT), pct:(i/LBL_COUNT)*100 }));
  const getBar = (act) => {
    if(!act.fecha_inicio||!act.fecha_fin) return null;
    const s=new Date(act.fecha_inicio+'T00:00:00'), e=new Date(act.fecha_fin+'T00:00:00');
    const l=Math.max(0,(s-tsS)/totalMs*100), r=Math.min(100,(e-tsS)/totalMs*100);
    return { left:`${l}%`, width:`${Math.max(1,r-l)}%` };
  };
  const BAR_GRAD = {
    pendiente:'linear-gradient(135deg, #f59e0b, #d97706)',
    en_progreso:'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    completada:'linear-gradient(135deg, #10b981, #059669)',
    cancelada:'linear-gradient(135deg, #94a3b8, #64748b)',
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* ── Stats Row ── */}
      <div style={{ display:'grid', gridTemplateColumns: dlPct!==null?'1fr 1fr 1fr':'1fr 1fr', gap:12 }}>
        {/* Deadline card */}
        {dlPct!==null&&(
          <div className="card-admin" style={{ padding:'16px 18px', background: daysLeft<0?'linear-gradient(135deg,#fef2f2,#fff1f2)': daysLeft<7?'linear-gradient(135deg,#fffbeb,#fef3c7)':'linear-gradient(135deg,#ecfdf5,#d1fae5)', border:'none' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontSize:11, fontWeight:800, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Plazo</span>
              <span style={{ fontSize:20, fontWeight:900, color: daysLeft<0?'#dc2626':daysLeft<7?'#d97706':'#059669' }}>
                {daysLeft<0?`-${Math.abs(daysLeft)}`:daysLeft}
              </span>
            </div>
            <div style={{ fontSize:11, fontWeight:700, color: daysLeft<0?'#991b1b':daysLeft<7?'#92400e':'#065f46', marginBottom:8 }}>
              {daysLeft<0?'Días vencido':daysLeft===0?'Vence hoy':'Días restantes'}
            </div>
            <div style={{ height:6, background:'rgba(0,0,0,0.06)', borderRadius:20, overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:20, width:`${dlPct}%`, transition:'width 0.5s',
                background:dlPct>=90?'#ef4444':dlPct>=70?'#f59e0b':'#10b981' }}/>
            </div>
            <div style={{ fontSize:9, fontWeight:700, color:'var(--gray-400)', marginTop:4 }}>
              {formatDate(proyectoInicio)} → {formatDate(proyectoFin)}
            </div>
          </div>
        )}
        {/* Tasks progress card */}
        <div className="card-admin" style={{ padding:'16px 18px', border:'none' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <span style={{ fontSize:11, fontWeight:800, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Tareas</span>
            <span style={{ fontSize:20, fontWeight:900, color: taskPct===100?'#059669':'var(--brand)' }}>{taskPct}%</span>
          </div>
          <div style={{ display:'flex', gap:12, marginBottom:8 }}>
            <div><span style={{ fontSize:18, fontWeight:900, color:'#059669' }}>{completadas}</span><span style={{ fontSize:10, color:'var(--gray-400)', fontWeight:600, marginLeft:3 }}>listas</span></div>
            <div><span style={{ fontSize:18, fontWeight:900, color:'#2563eb' }}>{enProgreso}</span><span style={{ fontSize:10, color:'var(--gray-400)', fontWeight:600, marginLeft:3 }}>activas</span></div>
            <div><span style={{ fontSize:18, fontWeight:900, color:'var(--gray-400)' }}>{actividades.length-completadas-enProgreso}</span><span style={{ fontSize:10, color:'var(--gray-400)', fontWeight:600, marginLeft:3 }}>pend.</span></div>
          </div>
          <div style={{ height:6, background:'var(--gray-100)', borderRadius:20, overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:20, width:`${taskPct}%`, transition:'width 0.5s',
              background: taskPct===100?'linear-gradient(90deg,#10b981,#059669)':'var(--gradient-brand)' }}/>
          </div>
        </div>
        {/* Quick info card */}
        <div className="card-admin" style={{ padding:'16px 18px', border:'none', background:'linear-gradient(135deg, #0f172a, #1e293b)', color:'white' }}>
          <div style={{ fontSize:11, fontWeight:800, opacity:0.5, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8 }}>Resumen</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
              <span style={{ opacity:0.6, fontWeight:500 }}>Total actividades</span>
              <span style={{ fontWeight:800 }}>{actividades.length}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
              <span style={{ opacity:0.6, fontWeight:500 }}>Con fechas asignadas</span>
              <span style={{ fontWeight:800 }}>{actividades.filter(a=>a.fecha_inicio&&a.fecha_fin).length}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
              <span style={{ opacity:0.6, fontWeight:500 }}>Con responsable</span>
              <span style={{ fontWeight:800 }}>{actividades.filter(a=>a.responsable_id).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Gantt Timeline ── */}
      <div className="card-admin" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1.5px solid var(--gray-100)', background:'white', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <span style={{ fontSize:15, fontWeight:900, color:'var(--gray-900)', letterSpacing:'-0.3px' }}>Línea de Tiempo</span>
            <p style={{ fontSize:11, color:'var(--gray-400)', margin:'2px 0 0', fontWeight:500 }}>Visualiza la distribución temporal de cada actividad del proyecto</p>
          </div>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            {Object.entries(ESTADO_CONFIG).map(([k,v])=>(
              <div key={k} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <div style={{ width:10, height:10, borderRadius:3, background:BAR_GRAD[k] }}/>
                <span style={{ fontSize:10, fontWeight:700, color:'var(--gray-500)' }}>{v.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <div style={{ minWidth:700 }}>
            {/* Timeline header */}
            <div style={{ display:'flex', background:'#f8fafc', borderBottom:'1px solid var(--gray-100)' }}>
              <div style={{ width:240, flexShrink:0, padding:'8px 20px', fontSize:10, fontWeight:800, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Actividad</div>
              <div style={{ flex:1, position:'relative', height:32 }}>
                {labels.map((lb,i)=>(
                  <div key={i} style={{ position:'absolute', left:`${lb.pct}%`, top:'50%', transform:'translate(-50%,-50%)', fontSize:9, fontWeight:700, color:'var(--gray-400)', whiteSpace:'nowrap' }}>
                    {lb.date.toLocaleDateString('es-MX',{day:'2-digit',month:'short'})}
                  </div>
                ))}
              </div>
            </div>
            {/* Activity rows */}
            {actividades.map((act,idx)=>{
              const est=ESTADO_CONFIG[act.estado]||ESTADO_CONFIG.pendiente, bar=getBar(act);
              const actDays = act.fecha_inicio&&act.fecha_fin ? Math.ceil((new Date(act.fecha_fin+'T00:00:00')-new Date(act.fecha_inicio+'T00:00:00'))/86400000) : null;
              const isHov = hovRow===act.id;
              return (
                <div key={act.id} onMouseEnter={()=>setHovRow(act.id)} onMouseLeave={()=>setHovRow(null)}
                  style={{ display:'flex', borderBottom:'1px solid var(--gray-50)', background: isHov?'#f0f4ff':idx%2===0?'white':'#fafbfc', transition:'background 0.15s' }}>
                  <div style={{ width:240, flexShrink:0, padding:'12px 20px', display:'flex', alignItems:'center', gap:10, borderRight:'1px solid var(--gray-50)' }}>
                    <div style={{ width:4, height:28, borderRadius:2, background:est.color, flexShrink:0 }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:750, color:'var(--gray-800)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{act.titulo}</div>
                      <div style={{ display:'flex', gap:6, alignItems:'center', marginTop:3 }}>
                        <span style={{ fontSize:9, fontWeight:800, padding:'1px 6px', borderRadius:4, background:est.bg, color:est.color }}>{est.label}</span>
                        {actDays!==null&&<span style={{ fontSize:9, fontWeight:700, color:'var(--gray-400)' }}>{actDays}d</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ flex:1, position:'relative', height:56, display:'flex', alignItems:'center' }}>
                    {labels.map((lb,i)=><div key={i} style={{ position:'absolute', left:`${lb.pct}%`, top:0, bottom:0, width:1, background:'var(--gray-50)' }}/>)}
                    <div style={{ position:'absolute', left:`${todayPct}%`, top:0, bottom:0, width:2, background:'rgba(220,38,38,0.25)', zIndex:2 }}/>
                    {bar?(
                      <div title={`${act.titulo}\n${formatDate(act.fecha_inicio)} → ${formatDate(act.fecha_fin)}`}
                        style={{ position:'absolute', ...bar, height:26, borderRadius:8, zIndex:1, display:'flex', alignItems:'center', paddingLeft:8, overflow:'hidden',
                          background:BAR_GRAD[act.estado]||BAR_GRAD.pendiente, opacity:act.estado==='cancelada'?0.4:1,
                          boxShadow: isHov?`0 4px 12px ${est.color}50`:`0 2px 6px ${est.color}30`,
                          transform: isHov?'scaleY(1.1)':'scaleY(1)', transition:'all 0.2s' }}>
                        <span style={{ fontSize:10, fontWeight:800, color:'white', whiteSpace:'nowrap', textShadow:'0 1px 2px rgba(0,0,0,0.2)' }}>{act.titulo}</span>
                      </div>
                    ):(
                      <span style={{ paddingLeft:12, fontSize:10, color:'var(--gray-300)', fontWeight:600, fontStyle:'italic' }}>Sin fechas asignadas</span>
                    )}
                  </div>
                </div>
              );
            })}
            {actividades.length===0&&(
              <div style={{ textAlign:'center', padding:'50px 20px' }}>
                <Calendar size={32} style={{ color:'var(--gray-200)', marginBottom:10 }}/>
                <p style={{ color:'var(--gray-400)', fontSize:13, fontWeight:600, margin:0 }}>Agrega actividades con fechas para visualizar el diagrama</p>
              </div>
            )}
          </div>
        </div>
        {/* Footer legend */}
        <div style={{ padding:'10px 20px', borderTop:'1px solid var(--gray-100)', background:'var(--gray-50)', display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:14, height:2, background:'rgba(220,38,38,0.5)', borderRadius:1 }}/>
          <span style={{ fontSize:10, fontWeight:700, color:'var(--gray-500)' }}>
            Hoy — {today.toLocaleDateString('es-MX',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TAB: CRONOGRAMA
   ═══════════════════════════════════════════════════════ */
function TabCronograma({ proyecto, empleados, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ titulo: '', descripcion: '', fecha_inicio: '', fecha_fin: '', estado: 'pendiente', responsable_id: '' });

  const actividades = proyecto.actividades || [];
  const completadas = actividades.filter(a => a.estado === 'completada').length;
  const progreso = actividades.length > 0 ? Math.round((completadas / actividades.length) * 100) : 0;

  const handleSave = async () => {
    if (!form.titulo.trim()) return;
    setSaving(true);
    try {
      await fetch(`${API_URLS.proyectos}actividades.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editingId ? 'update' : 'create',
          id: editingId || undefined,
          proyecto_id: proyecto.id,
          ...form
        })
      });
      setShowForm(false);
      setEditingId(null);
      setForm({ titulo: '', descripcion: '', fecha_inicio: '', fecha_fin: '', estado: 'pendiente', responsable_id: '' });
      onRefresh();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (actId) => {
    if (!window.confirm('¿Eliminar esta actividad?')) return;
    await fetch(`${API_URLS.proyectos}actividades.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id: actId })
    });
    onRefresh();
  };

  const handleQuickStatus = async (act, newEstado) => {
    await fetch(`${API_URLS.proyectos}actividades.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id: act.id, titulo: act.titulo, descripcion: act.descripcion, fecha_inicio: act.fecha_inicio, fecha_fin: act.fecha_fin, estado: newEstado, responsable_id: act.responsable_id })
    });
    onRefresh();
  };

  const openEdit = (act) => {
    setForm({
      titulo: act.titulo,
      descripcion: act.descripcion || '',
      fecha_inicio: act.fecha_inicio || '',
      fecha_fin: act.fecha_fin || '',
      estado: act.estado,
      responsable_id: act.responsable_id || ''
    });
    setEditingId(act.id);
    setShowForm(true);
  };

  // personas from the project staff
  const personalOptions = proyecto.personal || [];

  return (
    <div className="animate-fade-in">
      {/* ── Gantt Chart + Stats + Deadline Progress ── */}
      {actividades.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <GanttChart
            actividades={actividades}
            proyectoInicio={proyecto.fecha_inicio}
            proyectoFin={proyecto.fecha_fin}
          />
        </div>
      )}

      {/* ── Section Header: Activity List ── */}
      {actividades.length > 0 && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, padding:'0 4px' }}>
          <div>
            <h3 style={{ fontSize:15, fontWeight:900, color:'var(--gray-900)', margin:0, letterSpacing:'-0.3px' }}>Actividades del Proyecto</h3>
            <p style={{ fontSize:11, color:'var(--gray-400)', margin:'2px 0 0', fontWeight:500 }}>{actividades.length} actividad{actividades.length!==1?'es':''} registrada{actividades.length!==1?'s':''}</p>
          </div>
        </div>
      )}

      {/* Activity List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {actividades.map((act, idx) => {
          const est = ESTADO_CONFIG[act.estado] || ESTADO_CONFIG.pendiente;
          return (
            <div key={act.id} className="card-admin" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--gray-100)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                {/* Left accent */}
                <div style={{ width: 5, background: est.color, flexShrink: 0 }} />
                <div style={{ flex: 1, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--gray-300)', fontFeatureSettings: '"tnum"' }}>#{idx + 1}</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.3px' }}>{act.titulo}</span>
                      <span style={{
                        padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800,
                        background: est.bg, color: est.color, border: `1px solid ${est.border}`, textTransform: 'uppercase', letterSpacing: '0.5px'
                      }}>{est.label}</span>
                    </div>
                    {act.descripcion && (
                      <p style={{ fontSize: 12, color: 'var(--gray-400)', margin: '0 0 8px', fontWeight: 500, lineHeight: 1.5 }}>{act.descripcion}</p>
                    )}
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      {(act.fecha_inicio || act.fecha_fin) && (
                        <span style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={12} /> {formatDate(act.fecha_inicio)} → {formatDate(act.fecha_fin)}
                        </span>
                      )}
                      {act.responsable_nombre && (
                        <span style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <User size={12} /> {act.responsable_nombre}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {/* Quick status toggle */}
                    {act.estado !== 'completada' && (
                      <button onClick={() => handleQuickStatus(act, 'completada')} title="Marcar completada"
                        style={{ width: 32, height: 32, borderRadius: 10, border: '1.5px solid #d1fae5', background: '#f0fdf4', color: '#059669', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    {act.estado === 'completada' && (
                      <button onClick={() => handleQuickStatus(act, 'pendiente')} title="Reabrir"
                        style={{ width: 32, height: 32, borderRadius: 10, border: '1.5px solid #fde68a', background: '#fefce8', color: '#d97706', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={16} />
                      </button>
                    )}
                    <button onClick={() => openEdit(act)} title="Editar"
                      style={{ width: 32, height: 32, borderRadius: 10, border: '1.5px solid var(--gray-200)', background: 'white', color: 'var(--gray-500)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(act.id)} title="Eliminar"
                      style={{ width: 32, height: 32, borderRadius: 10, border: '1.5px solid #fee2e2', background: 'white', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {actividades.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 20, border: '2px dashed var(--gray-200)' }}>
          <Calendar size={40} style={{ color: 'var(--gray-200)', marginBottom: 16 }} />
          <p style={{ color: 'var(--gray-400)', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Sin actividades en el cronograma</p>
          <p style={{ color: 'var(--gray-300)', fontSize: 13, fontWeight: 500 }}>Agrega la primera actividad para comenzar a organizar el proyecto</p>
        </div>
      )}

      {/* Add / Edit Form — with Calendar Range Picker */}
      {showForm && (
        <div className="card-admin animate-fade-in" style={{ padding: 24, marginTop: 16, border: `2px solid ${editingId ? '#dbeafe' : 'var(--red-100)'}` }}>
          <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--gray-800)', marginBottom: 16 }}>
            {editingId ? '✏️ Editar Actividad' : '➕ Nueva Actividad'}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input className="input-admin" placeholder="Título de la actividad *"
              value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} />
            <textarea className="input-admin" placeholder="Descripción (opcional)" rows={2}
              style={{ resize: 'none' }}
              value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />

            {/* ── Calendar Date Range Picker + Estado/Responsable ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Left: Calendar */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', display: 'block', marginBottom: 6 }}>
                  📅 Rango de Fechas
                </label>
                <CalendarRangePicker
                  startDate={form.fecha_inicio}
                  endDate={form.fecha_fin}
                  onChange={(start, end) => setForm({ ...form, fecha_inicio: start || '', fecha_fin: end || '' })}
                />
              </div>

              {/* Right: Estado + Responsable */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', display: 'flex', alignItems:'center', gap:5, marginBottom: 4 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background: form.estado==='completada'?'#059669': form.estado==='en_progreso'?'#2563eb': form.estado==='cancelada'?'#64748b':'#d97706' }}/>
                    Estado
                  </label>
                  <select className="input-admin" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                    <option value="pendiente">⏳ Pendiente</option>
                    <option value="en_progreso">🔄 En Progreso</option>
                    <option value="completada">✅ Completada</option>
                    <option value="cancelada">❌ Cancelada</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', display: 'flex', alignItems:'center', gap:5, marginBottom: 4 }}>
                    <User size={12}/> Responsable
                  </label>
                  <select className="input-admin" value={form.responsable_id} onChange={e => setForm({ ...form, responsable_id: e.target.value })}>
                    <option value="">Sin asignar</option>
                    {personalOptions.map(p => (
                      <option key={p.empleado_id} value={p.empleado_id}>{p.nombre_completo}</option>
                    ))}
                  </select>
                </div>

                {/* Helpful tip */}
                <div style={{
                  padding: 14, background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: 12,
                  border: '1px solid #bfdbfe', marginTop: 'auto'
                }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#1e40af', marginBottom: 6 }}>💡 Cómo usar</div>
                  <div style={{ fontSize: 11, color: '#1e3a8a', fontWeight: 500, lineHeight: 1.6 }}>
                    1. Selecciona la <b>fecha de inicio</b> en el calendario<br/>
                    2. Luego selecciona la <b>fecha de fin</b><br/>
                    3. Asigna estado y responsable<br/>
                    4. La tarea aparecerá en la línea de tiempo
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
              <button className="btn-admin btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); setForm({ titulo: '', descripcion: '', fecha_inicio: '', fecha_fin: '', estado: 'pendiente', responsable_id: '' }); }}>
                <X size={16} /> Cancelar
              </button>
              <button className="btn-admin btn-primary" disabled={saving || !form.titulo.trim()} onClick={handleSave}>
                {saving ? <><Loader2 size={16} className="animate-spin" /> Guardando…</> : <><Save size={16} /> {editingId ? 'Actualizar' : 'Crear'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!showForm && (
        <button className="btn-admin" onClick={() => { setEditingId(null); setForm({ titulo: '', descripcion: '', fecha_inicio: '', fecha_fin: '', estado: 'pendiente', responsable_id: '' }); setShowForm(true); }}
          style={{
            marginTop: 16, width: '100%', padding: 14, borderRadius: 14, border: '2px dashed var(--gray-200)',
            background: 'white', color: 'var(--gray-400)', fontWeight: 700, justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.color = 'var(--gray-400)'; }}
        >
          <Plus size={18} /> Agregar Actividad al Cronograma
        </button>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   TAB: EQUIPO
   ═══════════════════════════════════════════════════════ */
function TabEquipo({ proyecto, empleados, onRefresh }) {
  const [showAssign, setShowAssign] = useState(false);

  const handleAssign = async (empleadoId, rol) => {
    await fetch(`${API_URLS.proyectos}asignar.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proyecto_id: proyecto.id, empleados: [{ empleado_id: empleadoId, rol }] })
    });
    onRefresh();
  };

  const handleRemove = async (empleadoId) => {
    const newList = proyecto.personal.filter(x => x.empleado_id !== empleadoId)
      .map(x => ({ empleado_id: x.empleado_id, rol: x.rol_en_proyecto }));
    await fetch(`${API_URLS.proyectos}asignar.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proyecto_id: proyecto.id, empleados: newList, sync: true })
    });
    onRefresh();
  };

  const handleSetEncargado = async (empleadoId) => {
    await fetch(`${API_URLS.proyectos}encargado.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proyecto_id: proyecto.id, encargado_id: empleadoId })
    });
    onRefresh();
  };

  const personal = proyecto.personal || [];
  const availableEmps = empleados.filter(e => !personal.some(p => p.empleado_id === e.id));

  return (
    <div className="animate-fade-in">
      {/* Encargado Section */}
      <div className="card-admin" style={{ padding: 20, marginBottom: 16, background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Crown size={20} color="#fbbf24" />
          <span style={{ fontSize: 14, fontWeight: 800 }}>Encargado del Proyecto</span>
        </div>
        {proyecto.encargado_nombre ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', fontWeight: 800, fontSize: 16 }}>
                {proyecto.encargado_nombre[0]}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{proyecto.encargado_nombre}</div>
                <div style={{ fontSize: 11, opacity: 0.5 }}>Responsable principal</div>
              </div>
            </div>
            <button onClick={() => handleSetEncargado(null)} style={{
              background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: 10,
              padding: '6px 12px', color: '#f87171', fontSize: 11, fontWeight: 700, cursor: 'pointer'
            }}>Quitar</button>
          </div>
        ) : (
          <p style={{ fontSize: 13, opacity: 0.5, fontWeight: 500 }}>No se ha asignado un encargado. Selecciona uno del equipo asignado.</p>
        )}
      </div>

      {/* Staff List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {personal.map(p => {
          const isEncargado = String(proyecto.encargado_id) === String(p.empleado_id);
          return (
            <div key={p.empleado_id} className="card-admin" style={{
              padding: 18, border: isEncargado ? '2px solid #fbbf24' : '1px solid var(--gray-100)',
              background: isEncargado ? '#fffbeb' : 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: isEncargado ? '#fef3c7' : 'var(--gray-100)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isEncargado ? '#d97706' : 'var(--gray-500)', fontWeight: 800, fontSize: 15
                  }}>
                    {p.nombre_completo[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 750, color: 'var(--gray-900)' }}>{p.nombre_completo}</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3 }}>
                      <span style={{
                        fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 6, textTransform: 'uppercase',
                        background: p.rol_en_proyecto === 'supervisor' ? '#fef3c7' : 'var(--red-50)',
                        color: p.rol_en_proyecto === 'supervisor' ? '#92400e' : 'var(--brand)'
                      }}>{p.rol_en_proyecto === 'supervisor' ? 'Supervisor' : 'Empleado'}</span>
                      {isEncargado && (
                        <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 6px', borderRadius: 6, background: '#fbbf24', color: '#78350f' }}>ENCARGADO</span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {!isEncargado && (
                    <button onClick={() => handleSetEncargado(p.empleado_id)} title="Asignar como encargado"
                      style={{ width: 30, height: 30, borderRadius: 8, border: '1.5px solid #fde68a', background: '#fffbeb', color: '#d97706', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Crown size={14} />
                    </button>
                  )}
                  <button onClick={() => handleRemove(p.empleado_id)} title="Quitar del proyecto"
                    style={{ width: 30, height: 30, borderRadius: 8, border: '1.5px solid #fee2e2', background: 'white', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {personal.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 20, border: '2px dashed var(--gray-200)' }}>
          <Users size={40} style={{ color: 'var(--gray-200)', marginBottom: 16 }} />
          <p style={{ color: 'var(--gray-400)', fontWeight: 700, fontSize: 16 }}>No hay personal asignado</p>
        </div>
      )}

      {/* Add Staff Toggle */}
      <button className="btn-admin" onClick={() => setShowAssign(!showAssign)}
        style={{
          marginTop: 16, width: '100%', padding: 14, borderRadius: 14, border: '2px dashed var(--gray-200)',
          background: 'white', color: 'var(--gray-400)', fontWeight: 700, justifyContent: 'center'
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.color = 'var(--gray-400)'; }}
      >
        {showAssign ? <><X size={18} /> Cerrar</> : <><Plus size={18} /> Agregar Personal al Equipo</>}
      </button>

      {showAssign && (
        <div className="card-admin animate-fade-in" style={{ marginTop: 12, padding: 20 }}>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--gray-700)', marginBottom: 14 }}>Empleados Disponibles</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
            {availableEmps.map(e => (
              <div key={e.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--gray-100)'
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>{e.nombre_completo}</div>
                  <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>{e.equipo_nombre || 'Sin equipo'}</div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => handleAssign(e.id, 'supervisor')}
                    style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '6px 10px', borderRadius: 8, fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>+ Super</button>
                  <button onClick={() => handleAssign(e.id, 'empleado')}
                    style={{ background: 'var(--red-50)', color: 'var(--brand)', border: 'none', padding: '6px 10px', borderRadius: 8, fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>+ Emp</button>
                </div>
              </div>
            ))}
            {availableEmps.length === 0 && (
              <p style={{ fontSize: 12, color: 'var(--gray-400)', textAlign: 'center', padding: 20 }}>Todos los empleados ya están asignados</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   TAB: CLIENTE
   ═══════════════════════════════════════════════════════ */
function TabCliente({ proyecto, onRefresh }) {
  const existing = proyecto.cliente || {};
  const [form, setForm] = useState({
    nombre: existing.nombre || '',
    empresa: existing.empresa || '',
    email: existing.email || '',
    telefono: existing.telefono || '',
    direccion: existing.direccion || '',
    notas: existing.notas || ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const c = proyecto.cliente || {};
    setForm({
      nombre: c.nombre || '',
      empresa: c.empresa || '',
      email: c.email || '',
      telefono: c.telefono || '',
      direccion: c.direccion || '',
      notas: c.notas || ''
    });
  }, [proyecto.cliente]);

  const handleSave = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);
    try {
      await fetch(`${API_URLS.proyectos}cliente.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proyecto_id: proyecto.id, ...form })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onRefresh();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const inputBlock = (label, icon, key, type = 'text', placeholder = '') => {
    const Icon = icon;
    return (
      <div>
        <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Icon size={14} /> {label}
        </label>
        <input className="input-admin" type={type} placeholder={placeholder}
          value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="card-admin" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={24} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--gray-900)', margin: 0, letterSpacing: '-0.3px' }}>Información del Cliente</h3>
            <p style={{ fontSize: 12, color: 'var(--gray-400)', margin: 0, fontWeight: 500 }}>Datos de contacto y detalles del cliente del proyecto</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {inputBlock('Nombre del Cliente', User, 'nombre', 'text', 'Nombre completo')}
          {inputBlock('Empresa', Building2, 'empresa', 'text', 'Nombre de la empresa')}
          {inputBlock('Correo Electrónico', Mail, 'email', 'email', 'correo@ejemplo.com')}
          {inputBlock('Teléfono', Phone, 'telefono', 'tel', '+52 XXX XXX XXXX')}
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <MapPin size={14} /> Dirección
          </label>
          <input className="input-admin" placeholder="Dirección completa"
            value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} />
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', display: 'block', marginBottom: 6 }}>Notas Adicionales</label>
          <textarea className="input-admin" rows={3} style={{ resize: 'none' }} placeholder="Notas sobre el cliente..."
            value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} />
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-admin btn-primary" disabled={saving || !form.nombre.trim()} onClick={handleSave}
            style={{ padding: '12px 28px', borderRadius: 14, fontWeight: 800 }}>
            {saving ? <><Loader2 size={16} className="animate-spin" /> Guardando…</> : saved ? <><CheckCircle2 size={16} /> ¡Guardado!</> : <><Save size={16} /> Guardar Cliente</>}
          </button>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════
   TAB: DOCUMENTOS
   ═══════════════════════════════════════════════════════ */
function TabDocumentos({ proyecto, user, onRefresh }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadForm, setUploadForm] = useState({ nombre: '', tipo: 'otro' });
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const documentos = proyecto.documentos || [];

  const uploadsBaseUrl = `${window.location.protocol}//${window.location.host}/initeck-flota/iniadmin/api_php/proyectos/uploads/`;

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setUploadForm({ nombre: file.name.replace(/\.[^/.]+$/, ''), tipo: 'otro' });
    setShowUploadForm(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('archivo', selectedFile);
      formData.append('proyecto_id', proyecto.id);
      formData.append('nombre', uploadForm.nombre || selectedFile.name);
      formData.append('tipo', uploadForm.tipo);
      if (user?.empleado_id) formData.append('subido_por', user.empleado_id);

      const res = await fetch(`${API_URLS.proyectos}documentos.php`, {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      if (result.status === 'success') {
        setShowUploadForm(false);
        setSelectedFile(null);
        onRefresh();
      }
    } catch (err) { console.error(err); }
    finally { setUploading(false); }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('¿Eliminar este documento?')) return;
    await fetch(`${API_URLS.proyectos}documentos.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id: docId })
    });
    onRefresh();
  };

  return (
    <div className="animate-fade-in">
      {/* Upload Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          padding: '40px 20px', textAlign: 'center', borderRadius: 20, cursor: 'pointer',
          border: `2px dashed ${dragOver ? 'var(--brand)' : 'var(--gray-200)'}`,
          background: dragOver ? 'var(--red-50)' : 'white',
          transition: 'all 0.2s', marginBottom: 16
        }}
        onMouseEnter={e => { if (!dragOver) { e.currentTarget.style.borderColor = 'var(--gray-300)'; e.currentTarget.style.background = 'var(--gray-50)'; }}}
        onMouseLeave={e => { if (!dragOver) { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.background = 'white'; }}}
      >
        <Upload size={36} style={{ color: dragOver ? 'var(--brand)' : 'var(--gray-300)', marginBottom: 12 }} />
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-600)', marginBottom: 4 }}>
          {dragOver ? 'Suelta el archivo aquí' : 'Arrastra un archivo o haz clic para seleccionar'}
        </p>
        <p style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 500 }}>Contratos, presupuestos, facturas, planos y más • Máx. 10MB</p>
        <input ref={fileInputRef} type="file" hidden onChange={e => { if (e.target.files[0]) handleFileSelect(e.target.files[0]); e.target.value = ''; }} />
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && selectedFile && (
        <div className="card-admin animate-fade-in" style={{ padding: 24, marginBottom: 16, border: '2px solid var(--red-100)' }}>
          <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--gray-800)', marginBottom: 16 }}>📎 Subir Documento</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--gray-50)', borderRadius: 12, marginBottom: 16 }}>
            <File size={20} style={{ color: 'var(--gray-400)' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>{selectedFile.name}</div>
              <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{formatFileSize(selectedFile.size)}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>Nombre del documento</label>
              <input className="input-admin" value={uploadForm.nombre} onChange={e => setUploadForm({ ...uploadForm, nombre: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>Tipo</label>
              <select className="input-admin" value={uploadForm.tipo} onChange={e => setUploadForm({ ...uploadForm, tipo: e.target.value })}>
                <option value="contrato">Contrato</option>
                <option value="presupuesto">Presupuesto</option>
                <option value="factura">Factura</option>
                <option value="plano">Plano</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
            <button className="btn-admin btn-secondary" onClick={() => { setShowUploadForm(false); setSelectedFile(null); }}>
              <X size={16} /> Cancelar
            </button>
            <button className="btn-admin btn-primary" disabled={uploading} onClick={handleUpload}>
              {uploading ? <><Loader2 size={16} className="animate-spin" /> Subiendo…</> : <><Upload size={16} /> Subir Documento</>}
            </button>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {documentos.map(doc => {
          const tipoInfo = TIPO_DOC_ICON[doc.tipo] || TIPO_DOC_ICON.otro;
          const Icon = tipoInfo.icon;
          return (
            <div key={doc.id} className="card-admin" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: tipoInfo.bg, color: tipoInfo.color
                }}>
                  <Icon size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 750, color: 'var(--gray-900)' }}>{doc.nombre}</div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 3 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 6, textTransform: 'uppercase',
                      background: tipoInfo.bg, color: tipoInfo.color
                    }}>{doc.tipo}</span>
                    <span style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>{formatFileSize(doc.tamanio)}</span>
                    {doc.subido_por_nombre && (
                      <span style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500 }}>por {doc.subido_por_nombre}</span>
                    )}
                    <span style={{ fontSize: 11, color: 'var(--gray-300)' }}>{formatDate(doc.created_at?.split(' ')[0])}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <a href={`${uploadsBaseUrl}${doc.archivo}`} target="_blank" rel="noopener noreferrer"
                  style={{
                    width: 34, height: 34, borderRadius: 10, border: '1.5px solid #dbeafe',
                    background: '#eff6ff', color: '#2563eb', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none'
                  }} title="Descargar">
                  <Download size={16} />
                </a>
                <button onClick={() => handleDelete(doc.id)} title="Eliminar"
                  style={{
                    width: 34, height: 34, borderRadius: 10, border: '1.5px solid #fee2e2',
                    background: 'white', color: '#ef4444', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {documentos.length === 0 && !showUploadForm && (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: 20, border: '2px dashed var(--gray-200)', marginTop: 8 }}>
          <FileText size={40} style={{ color: 'var(--gray-200)', marginBottom: 16 }} />
          <p style={{ color: 'var(--gray-400)', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Sin documentos adjuntos</p>
          <p style={{ color: 'var(--gray-300)', fontSize: 13, fontWeight: 500 }}>Sube contratos, presupuestos y otros archivos importantes</p>
        </div>
      )}
    </div>
  );
}
