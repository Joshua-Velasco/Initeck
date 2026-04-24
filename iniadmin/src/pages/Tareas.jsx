import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Loader2, Plus, Search,
  CheckSquare, User,
  Clock, ChevronDown, ChevronRight, MoreVertical, Calendar
} from 'lucide-react';
import TareaFormModal from '../components/Tareas/TareaFormModal';
import { API_URLS } from '../config';
import { getTaskStatusStyle, getTaskPriorityStyle } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { canManageTasks, canDeleteTasks } from '../constants/roles';

const initialTareaState = {
  id: '', titulo: '', descripcion: '', empleado_id: '',
  fecha_inicio: new Date().toISOString().split('T')[0],
  fecha_fin: '', hora_inicio: '', hora_fin: '',
  estado: 'pendiente', prioridad: 'media',
  departamento: 'campo', materiales: [], responsabilidades: '',
  color: '#2563eb'
};

/* ── Materials Cell con tooltip ── */
const MaterialsCell = ({ materiales }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!materiales || materiales.length === 0) {
    return <span style={{ fontSize: 11, color: 'var(--gray-300)' }}>—</span>;
  }

  const visible = materiales.slice(0, 2);
  const hidden  = materiales.slice(2);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
      {visible.map((m, i) => (
        <span key={i} style={{
          fontSize: 10, fontWeight: 500,
          background: 'var(--gray-100)', color: 'var(--gray-600)',
          padding: '3px 8px', borderRadius: 'var(--radius-sm)',
          whiteSpace: 'nowrap',
          maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis',
          display: 'inline-block',
          border: '1px solid var(--gray-200)',
        }} title={m}>
          {m}
        </span>
      ))}

      {hidden.length > 0 && (
        <span
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          style={{
            position: 'relative',
            fontSize: 10, fontWeight: 700,
            background: 'var(--gray-800)', color: 'white',
            padding: '3px 7px', borderRadius: 'var(--radius-sm)',
            cursor: 'default', userSelect: 'none', flexShrink: 0,
          }}
        >
          +{hidden.length}
          {showTooltip && (
            <div style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--gray-900)', color: 'white',
              borderRadius: 'var(--radius-md)', padding: '10px 12px',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 200, minWidth: 160, maxWidth: 260,
              animation: 'fadeInScale 0.15s ease-out',
              pointerEvents: 'none',
            }}>
              {/* Flecha */}
              <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: `6px solid var(--gray-900)` }} />
              <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 6px' }}>
                Todos los materiales
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {materiales.map((m, i) => (
                  <span key={i} style={{ fontSize: 12, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red-400)', flexShrink: 0, display: 'inline-block' }} />
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}
        </span>
      )}
    </div>
  );
};

export default function Tareas() {
  const { user } = useAuth();
  const puedeGestionar = canManageTasks(user?.rol);
  const puedeEliminar  = canDeleteTasks(user?.rol);

  const [tareas, setTareas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Fitros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroDept, setFiltroDept] = useState('all');
  const [filtroMes, setFiltroMes] = useState(new Date().toISOString().substring(0, 7)); // 'YYYY-MM' o vacio
  
  // Form State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialTareaState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Collapse state for departments
  const [collapsedDepts, setCollapsedDepts] = useState({});
  
  // Menú de opciones (3 puntos) en fila
  const [openMenuId, setOpenMenuId] = useState(null);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      // Usar Promise.all para cargar tareas y empleados
      const [resTareas, resEmp, resEq] = await Promise.all([
        fetch(`${API_URLS.tareas}listar.php?t=${Date.now()}`),
        fetch(`${API_URLS.empleados}listar.php?t=${Date.now()}`),
        fetch(`${API_URLS.equipos}listar.php?t=${Date.now()}`)
      ]);
      
      const [dataTareas, dataEmp, dataEq] = await Promise.all([
        resTareas.json(), resEmp.json(), resEq.json()
      ]);
      
      // Parsear JSON de materiales
      const parsedTareas = (Array.isArray(dataTareas) ? dataTareas : []).map(t => {
        let mats = [];
        try {
          if (t.materiales) mats = JSON.parse(t.materiales);
        } catch (e) {
          if (typeof t.materiales === 'string') mats = [t.materiales];
        }
        return { ...t, materiales: mats };
      });

      setTareas(parsedTareas);
      setEmpleados(Array.isArray(dataEmp) ? dataEmp : []);
      setEquipos(Array.isArray(dataEq) ? dataEq : []);
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const endpoint = formData.id ? 'editar.php' : 'crear.php';
      
      // Send as JSON
      const res = await fetch(`${API_URLS.tareas}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        await fetchData();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (tarea, nuevoEstado) => {
    // Optimistic UI update
    setTareas(prev => prev.map(t => t.id === tarea.id ? { ...t, estado: nuevoEstado } : t));
    
    try {
      await fetch(`${API_URLS.tareas}actualizar_estado.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tarea.id, estado: nuevoEstado })
      });
    } catch (error) {
      console.error('Error updating status:', error);
      fetchData(); // Rollback on error
    }
  };

  const handleEliminarTarea = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta tarea permanentemente?")) return;
    try {
      await fetch(`${API_URLS.tareas}eliminar.php?id=${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDept = (dept) => {
    setCollapsedDepts(prev => ({ ...prev, [dept]: !prev[dept] }));
  };

  // Grouping and Filtering
  const groupedTareas = useMemo(() => {
    let filtered = tareas;

    // Rol campo: solo ve sus propias tareas
    if (user?.rol === 'campo' && user?.empleado_id) {
      filtered = filtered.filter(t =>
        String(t.empleado_id) === String(user.empleado_id)
      );
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        (t.titulo || '').toLowerCase().includes(lower) ||
        (t.empleado_nombre || '').toLowerCase().includes(lower)
      );
    }

    if (filtroDept !== 'all') {
      filtered = filtered.filter(t => t.departamento === filtroDept);
    }

    // Filtrar por mes
    if (filtroMes) {
      filtered = filtered.filter(t => {
        // Usa fecha_fin si está, sino fecha_inicio, sino created_at 
        let d = t.fecha_fin || t.fecha_inicio || t.created_at;
        if (!d) return false;
        return d.startsWith(filtroMes);
      });
    }

    // Agrupar por departamento
    const grouped = {};
    filtered.forEach(t => {
      const d = t.departamento || 'otros';
      if (!grouped[d]) grouped[d] = [];
      grouped[d].push(t);
    });
    
    return grouped;
  }, [tareas, searchTerm, filtroDept]);

  const DEPT_FILTERS = [
    { id: 'all', label: 'Todos los Deptos' },
    { id: 'admin', label: 'Admin' },
    { id: 'developer', label: 'Dev' },
    { id: 'campo', label: 'Campo' },
    { id: 'soporte', label: 'Soporte' },
    { id: 'supervisor', label: 'Supervisor' }
  ];

  // Helper para mostrar tiempos relativos
  const renderTimeBadge = (task) => {
    if (!task.fecha_inicio && !task.fecha_fin) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inicio = task.fecha_inicio ? new Date(task.fecha_inicio + 'T00:00:00') : null;
    const fin = task.fecha_fin ? new Date(task.fecha_fin + 'T00:00:00') : null;

    // 1. Tarea Agendada Futura
    if (inicio && inicio > today && task.estado !== 'completada') {
      const diffTime = inicio.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return (
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand)', background: 'var(--red-100)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap', marginTop: 4, display: 'inline-block' }}>
          ⏳ Empieza en {diffDays} {diffDays === 1 ? 'día' : 'días'}
        </span>
      );
    }
    
    // 2. Tarea en Plazo / Atrasada
    if (fin) {
      const diffTime = fin.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (task.estado === 'completada') {
        return <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-500)', background: 'var(--gray-100)', padding: '2px 6px', borderRadius: '4px', marginTop: 4, display: 'inline-block' }}>✓ En tiempo</span>;
      }
      
      if (diffDays < 0) {
        return (
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--danger)', background: 'var(--danger-light)', padding: '2px 6px', borderRadius: '4px', marginTop: 4, display: 'inline-block' }}>
            🔴 Atrasada por {Math.abs(diffDays)} {Math.abs(diffDays) === 1 ? 'día' : 'días'}
          </span>
        );
      } else if (diffDays === 0) {
        return <span style={{ fontSize: 10, fontWeight: 700, color: '#ca8a04', background: '#fef08a', padding: '2px 6px', borderRadius: '4px', marginTop: 4, display: 'inline-block' }}>⚡ Vence Hoy</span>;
      } else {
        return <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-600)', background: 'var(--gray-100)', padding: '2px 6px', borderRadius: '4px', marginTop: 4, display: 'inline-block' }}>Quedan {diffDays} d.</span>;
      }
    }
    return null;
  };

  const TaskRow = ({ task }) => (
    <div className="task-row" style={{
      display: 'grid', 
      gridTemplateColumns: 'minmax(250px, 2fr) 150px 140px 120px 150px minmax(120px, 1fr) 60px',
      gap: 10,
      alignItems: 'center',
      padding: '8px 16px',
      borderBottom: '1px solid var(--gray-100)',
      background: 'white',
      transition: 'all 0.1s',
      borderLeft: `5px solid ${task.color || 'var(--gray-300)'}`
    }}>
      {/* 1. Título & Resp */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: task.estado === 'completada' ? 'line-through' : 'none' }}>
            {task.titulo}
          </div>
          {task.responsabilidades && (
            <div style={{ fontSize: 11, color: 'var(--gray-400)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {task.responsabilidades}
            </div>
          )}
        </div>
      </div>

      {/* 2. Responsable */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ 
          width: 24, height: 24, borderRadius: '50%', background: task.equipo_id ? (task.equipo_color || 'var(--gray-800)') : 'var(--gray-200)', 
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, fontSize: 10, fontWeight: 700
        }}>
          {task.equipo_id ? 'EQ' : (
            task.empleado_foto ? (
               <img src={`${API_URLS.empleados}uploads/${task.empleado_foto}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={12} color="var(--gray-500)" />
            )
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-700)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {task.equipo_id ? (
              <strong>{task.equipo_nombre}</strong>
            ) : (
              task.empleado_nombre || <span style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>Sin asignar</span>
            )}
          </span>
          {task.equipo_id && <span style={{ fontSize: 10, color: 'var(--gray-400)' }}>Equipo</span>}
        </div>
      </div>

      {/* 3. Estado (Clickable / Editable Inline) */}
      <div className="status-cell" style={{ position: 'relative' }}>
        {(() => {
          const st = getTaskStatusStyle(task.estado);
          return (
            <select 
              value={task.estado} 
              onChange={(e) => handleStatusChange(task, e.target.value)}
              style={{
                width: '100%', appearance: 'none', background: st.bg, color: st.color,
                fontWeight: 700, fontSize: 11, textAlign: 'center', padding: '6px',
                border: 'none', borderRadius: '4px', outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          )
        })()}
        <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'currentcolor', opacity: 0.5 }} />
      </div>

      {/* 4. Prioridad */}
       <div style={{ display: 'flex', justifyContent: 'center' }}>
        {(() => {
          const p = getTaskPriorityStyle(task.prioridad);
          return (
            <span style={{ 
              background: p.bg, color: p.color, fontSize: 10, fontWeight: 700, 
              padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase' 
            }}>
              {p.label}
            </span>
          )
        })()}
      </div>

      {/* 5. Fecha Fin / Tiempos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--gray-600)' }}>
          {task.fecha_fin ? (
            <>
              <Calendar size={13} color="var(--gray-400)" />
              {new Date(task.fecha_fin + 'T12:00:00Z').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
              {task.hora_fin && <span style={{ color: 'var(--gray-400)' }}>{task.hora_fin.substring(0,5)}</span>}
            </>
          ) : (
            <span style={{ color: 'var(--gray-400)' }}>Sin fecha límite</span>
          )}
        </div>
        {renderTimeBadge(task)}
      </div>

      {/* 6. Materiales */}
      <MaterialsCell materiales={task.materiales} />

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, position: 'relative' }}>
        
        {/* Checkbox Completar */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input 
            type="checkbox" 
            checked={task.estado === 'completada'} 
            onChange={(e) => handleStatusChange(task, e.target.checked ? 'completada' : 'pendiente')}
            style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--success)' }} 
            title="Marcar como completada"
          />
        </div>

        {/* Menú Tres Puntos — solo si puede gestionar */}
        {puedeGestionar && (
          <>
            <button className="btn-icon" onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(openMenuId === task.id ? null : task.id);
            }}>
              <MoreVertical size={16} />
            </button>

            {openMenuId === task.id && (
              <>
                <div
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}
                  onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}
                />
                <div style={{
                  position: 'absolute', top: 32, right: 0, background: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-200)', padding: 4, zIndex: 100, minWidth: 120
                }}>
                  <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setFormData(task); setShowModal(true); }}
                    style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', borderRadius: 4, color: 'var(--gray-700)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    ✏️ Editar
                  </button>
                  {puedeEliminar && (
                    <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); handleEliminarTarea(task.id); }}
                      style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', borderRadius: 4, color: 'var(--danger)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      🗑️ Borrar
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── Ribbon / Header ── */}
      <div className="card-admin" style={{ marginBottom: 20, border: 'none', flexShrink: 0 }}>
        <div style={{
          background: 'var(--gradient-brand)', padding: '24px 28px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
        }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 10 }}>
              Tablero de Tareas
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', fontWeight: 500 }}>
              Gestión visual de responsabilidades • {tareas.length} Tareas Activas
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', 
              borderRadius: 'var(--radius-full)', padding: '6px 14px', border: '1px solid rgba(255,255,255,0.15)'
            }}>
              <Search size={14} color="rgba(255,255,255,0.6)" />
              <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', color: 'white', fontSize: 13, width: 140 }} />
            </div>
            
            {puedeGestionar && (
              <button className="btn-admin" style={{ background: 'white', color: 'var(--brand)' }}
                onClick={() => { setFormData(initialTareaState); setShowModal(true); }}>
                <Plus size={16} /> Nueva Tarea
              </button>
            )}
          </div>
        </div>

        {/* Ribbon Filters */}
        <div style={{ 
          padding: '12px 28px', borderTop: '1px solid rgba(0,0,0,0.05)', 
          display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center', 
          background: 'white' 
        }}>
          {/* Departamentos */}
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', flex: 1, minWidth: 250, paddingBottom: 2 }}>
            {DEPT_FILTERS.map(f => (
              <button key={f.id} onClick={() => setFiltroDept(f.id)}
                style={{
                  padding: '6px 14px', fontSize: 12, fontWeight: 600, borderRadius: 'var(--radius-full)',
                  border: filtroDept === f.id ? 'none' : '1px solid var(--gray-200)',
                  background: filtroDept === f.id ? 'var(--gray-900)' : 'transparent',
                  color: filtroDept === f.id ? 'white' : 'var(--gray-600)',
                  cursor: 'pointer', outline: 'none', whiteSpace: 'nowrap', flexShrink: 0
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Historial por Meses */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, paddingLeft: 12, borderLeft: '1px solid var(--gray-100)' }}>
            <input 
              type="month"
              value={filtroMes}
              onChange={e => setFiltroMes(e.target.value)}
              title="Filtrar tareas por mes (Periodo)"
              style={{
                padding: '4px 8px', fontSize: 12, fontWeight: 600, borderRadius: '4px',
                border: '1px solid var(--gray-200)', background: 'var(--gray-50)', color: 'var(--gray-700)',
                cursor: 'pointer', outline: 'none', height: 28
              }}
            />
            {filtroMes && (
              <button 
                onClick={() => setFiltroMes('')}
                title="Ver historial completo"
                style={{
                  background: 'none', border: 'none', padding: '0 4px', fontSize: 11, fontWeight: 600, 
                  color: 'var(--gray-500)', cursor: 'pointer', textDecoration: 'underline'
                }}
              >
                Ver todas
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Board Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'transparent' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 40 }}>
            <Loader2 className="animate-spin" size={32} color="var(--red-600)" />
            <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Cargando tablero...</p>
          </div>
        ) : (
          <div style={{ paddingBottom: 40 }}>
            {Object.keys(groupedTareas).length === 0 ? (
               <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 'var(--radius-lg)' }}>
                 <CheckSquare size={48} color="var(--gray-200)" style={{ marginBottom: 16 }} />
                 <h3 style={{ color: 'var(--gray-700)', fontSize: 16, marginBottom: 8 }}>Mesa de trabajo limpia</h3>
                 <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>No se encontraron tareas con estos filtros.</p>
               </div>
            ) : (
              // Monday-style Department Groups
              Object.entries(groupedTareas).sort((a,b) => a[0].localeCompare(b[0])).map(([dept, tasks]) => {
                const isCollapsed = collapsedDepts[dept];
                
                // Set group color based on dept
                const deptColor = dept === 'admin' ? '#dc2626' : dept === 'developer' ? '#18181b' : dept === 'soporte' ? '#0891b2' : '#ea580c';
                
                return (
                  <div key={dept} style={{ marginBottom: 30 }}>
                    {/* Group Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, marginLeft: 16 }}>
                      <button 
                        onClick={() => toggleDept(dept)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        {isCollapsed ? <ChevronRight size={18} color={deptColor} /> : <ChevronDown size={18} color={deptColor} />}
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: deptColor, margin: 0, textTransform: 'capitalize' }}>
                          Departamento: {dept}
                        </h3>
                      </button>
                      <span style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>
                        {tasks.length} tareas
                      </span>
                    </div>

                    {/* Group Table */}
                    {!isCollapsed && (
                      <div className="card-admin" style={{ overflowX: 'auto', overflowY: 'hidden', borderLeft: `5px solid ${deptColor}` }}>
                        <div style={{ minWidth: 990 }}>
                        {/* Table Header */}
                        <div style={{
                          display: 'grid', 
                          gridTemplateColumns: 'minmax(250px, 2fr) 150px 140px 120px 150px minmax(120px, 1fr) 60px',
                          gap: 10, padding: '10px 16px', background: 'var(--gray-50)',
                          borderBottom: '1px solid var(--gray-200)',
                          fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5
                        }}>
                          <div>Tarea</div>
                          <div>Responsable</div>
                          <div style={{ textAlign: 'center' }}>Estado</div>
                          <div style={{ textAlign: 'center' }}>Prioridad</div>
                          <div>Fecha Fin</div>
                          <div>Materiales</div>
                          <div></div>
                        </div>
                        
                        {/* Table Body */}
                        <div>
                          {tasks.map(t => <TaskRow key={t.id} task={t} />)}
                        </div>
                        
                        {/* Table Footer - Add inline task */}
                        {puedeGestionar && (
                          <div style={{ padding: '8px 16px', background: 'white' }}>
                            <button style={{
                              background: 'none', border: 'none', color: 'var(--gray-400)',
                              fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', outline: 'none'
                            }}
                              onClick={() => { setFormData({ ...initialTareaState, departamento: dept }); setShowModal(true); }}>
                              <Plus size={14} /> Añadir Tarea
                            </button>
                          </div>
                        )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {showModal && (
        <TareaFormModal 
          formData={formData}
          empleados={empleados}
          equipos={equipos}
          isSubmitting={isSubmitting}
          handleInputChange={handleInputChange}
          handleMaterialesChange={(mats) => setFormData(prev => ({...prev, materiales: mats}))}
          handleSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Global styles for generic resets */}
      <style>{`
        .task-row:hover { background-color: var(--gray-50) !important; }
        .status-cell:hover select { filter: brightness(0.95); }
        .btn-icon { background: none; border: none; cursor: pointer; color: var(--gray-400); padding: 4px; border-radius: 4px; }
        .btn-icon:hover { background: var(--gray-100); color: var(--gray-800); }
      `}</style>
    </div>
  );
}
