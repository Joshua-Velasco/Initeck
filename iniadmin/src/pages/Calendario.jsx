import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Loader2, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus
} from 'lucide-react';
import TareaFormModal from '../components/Tareas/TareaFormModal';
import TaskDetailsModal from '../components/Tareas/TaskDetailsModal';
import { API_URLS } from '../config';

const initialTareaState = {
  id: '', titulo: '', descripcion: '', empleado_id: '',
  fecha_inicio: new Date().toISOString().split('T')[0],
  fecha_fin: '', hora_inicio: '', hora_fin: '',
  estado: 'pendiente', prioridad: 'media',
  departamento: 'campo', materiales: [], responsabilidades: '',
  color: '#2563eb'
};

const getWeekDates = (date) => {
  const current = new Date(date);
  const week = [];
  current.setDate(current.getDate() - current.getDay() + (current.getDay() === 0 ? -6 : 1));
  for (let i = 0; i < 7; i++) {
    week.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return week;
};

const DAYS_SHORT = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

export default function Calendario() {
  const [tareas, setTareas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialTareaState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [resTareas, resEmp] = await Promise.all([
        fetch(`${API_URLS.tareas}listar.php?t=${Date.now()}`),
        fetch(`${API_URLS.empleados}listar.php?t=${Date.now()}`)
      ]);
      const [dataTareas, dataEmp] = await Promise.all([
        resTareas.json(), resEmp.json()
      ]);
      const parsedTareas = (Array.isArray(dataTareas) ? dataTareas : []).map(t => {
        let mats = [];
        try {
          if (t.materiales) mats = JSON.parse(t.materiales);
        } catch {
          if (typeof t.materiales === 'string') mats = [t.materiales];
        }
        return { ...t, materiales: mats };
      });
      setTareas(parsedTareas);
      setEmpleados(Array.isArray(dataEmp) ? dataEmp : []);
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const endpoint = formData.id ? 'editar.php' : 'crear.php';
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

  const handleDelete = async (taskId) => {
    setDeletingId(taskId);
    try {
      const res = await fetch(`${API_URLS.tareas}eliminar.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId })
      });
      if (res.ok) {
        // Eliminar de estado local inmediatamente (todas las instancias del rango)
        setTareas(prev => prev.filter(t => t.id !== taskId));
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Error eliminando tarea:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const navWeek = (dir) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dir * 7);
    setCurrentDate(d);
  };

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  const taskMap = useMemo(() => {
    const map = {};
    tareas.forEach(t => {
      const inicioStr = t.fecha_inicio;
      const finStr = t.fecha_fin;
      if (!inicioStr && !finStr) return;

      if (inicioStr && finStr && inicioStr !== finStr) {
        const start = new Date(inicioStr + 'T12:00:00Z');
        const end = new Date(finStr + 'T12:00:00Z');
        if (start <= end) {
          let curr = new Date(start);
          while (curr <= end) {
            const dStr = curr.toISOString().split('T')[0];
            if (!map[dStr]) map[dStr] = [];
            map[dStr].push(t);
            curr.setDate(curr.getDate() + 1);
          }
        } else {
          if (!map[inicioStr]) map[inicioStr] = [];
          map[inicioStr].push(t);
        }
      } else {
        const dateStr = finStr || inicioStr;
        if (!map[dateStr]) map[dateStr] = [];
        map[dateStr].push(t);
      }
    });
    return map;
  }, [tareas]);

  const handleCellClick = (d) => {
    const ds = d.toISOString().split('T')[0];
    setFormData({ ...initialTareaState, fecha_inicio: ds, fecha_fin: ds });
    setShowModal(true);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const weekLabel = (() => {
    const start = weekDates[0];
    const end = weekDates[6];
    const sm = start.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    const em = end.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
    return `${sm} — ${em}`;
  })();

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header ribbon ── */}
      <div className="card-admin" style={{ flexShrink: 0, border: 'none', overflow: 'hidden' }}>
        <div style={{
          background: 'var(--gradient-brand)',
          padding: '20px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '-0.3px' }}>
            <CalendarIcon size={22} color="rgba(255,255,255,0.8)" />
            Calendario de Actividades
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', padding: '4px', border: '1px solid rgba(255,255,255,0.12)' }}>
            <button
              onClick={() => navWeek(-1)}
              style={{ width: 34, height: 34, border: 'none', background: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <ChevronLeft size={18} />
            </button>
            <span
              onClick={() => setCurrentDate(new Date())}
              style={{ color: 'white', fontWeight: 700, fontSize: 13, padding: '0 12px', cursor: 'pointer', letterSpacing: '0.2px', textTransform: 'capitalize', minWidth: 200, textAlign: 'center' }}
            >
              {weekLabel}
            </span>
            <button
              onClick={() => navWeek(1)}
              style={{ width: 34, height: 34, border: 'none', background: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-sm)', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Calendar body ── */}
      <div className="card-admin" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 16 }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <Loader2 className="animate-spin" size={28} color="var(--red-600)" />
            <span style={{ fontSize: 13, color: 'var(--gray-400)', fontWeight: 500 }}>Cargando calendario...</span>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 8, flexShrink: 0 }}>
              {weekDates.map((d, i) => {
                const ds = d.toISOString().split('T')[0];
                const isToday = ds === todayStr;
                return (
                  <div key={i} style={{
                    textAlign: 'center',
                    padding: '10px 8px',
                    borderRadius: 'var(--radius-md)',
                    background: isToday ? 'var(--red-600)' : 'var(--gray-50)',
                    border: `1px solid ${isToday ? 'var(--red-500)' : 'var(--gray-200)'}`,
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: isToday ? 'rgba(255,255,255,0.8)' : 'var(--gray-400)', marginBottom: 4 }}>
                      {DAYS_SHORT[i]}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: isToday ? 'white' : 'var(--gray-800)', lineHeight: 1, letterSpacing: '-0.5px' }}>
                      {d.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Day columns */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, overflow: 'hidden' }}>
              {weekDates.map((d, i) => {
                const ds = d.toISOString().split('T')[0];
                const dayTasks = (taskMap[ds] || []).sort((a, b) => (a.hora_inicio || '24:00').localeCompare(b.hora_inicio || '24:00'));
                const isToday = ds === todayStr;

                return (
                  <div
                    key={i}
                    onClick={() => handleCellClick(d)}
                    style={{
                      background: isToday ? '#fef7f7' : 'var(--gray-50)',
                      border: `1px solid ${isToday ? 'var(--red-200)' : 'var(--gray-200)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 6px',
                      cursor: 'pointer',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      transition: 'border-color 0.15s, background 0.15s',
                      position: 'relative',
                    }}
                    onMouseEnter={e => { if (!isToday) e.currentTarget.style.borderColor = 'var(--gray-300)'; e.currentTarget.style.background = isToday ? '#fdf2f2' : 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = isToday ? 'var(--red-200)' : 'var(--gray-200)'; e.currentTarget.style.background = isToday ? '#fef7f7' : 'var(--gray-50)'; }}
                  >
                    {/* Add task hint */}
                    {dayTasks.length === 0 && (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s' }}
                        className="cal-add-hint">
                        <Plus size={16} color="var(--gray-300)" />
                      </div>
                    )}

                    {dayTasks.map(task => (
                      <div
                        key={`${task.id}-${ds}`}
                        onClick={e => { e.stopPropagation(); setSelectedTask(task); }}
                        style={{
                          background: 'white',
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: `3px solid ${task.color || 'var(--gray-400)'}`,
                          padding: '7px 8px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                          cursor: 'pointer',
                          border: '1px solid var(--gray-100)',
                          borderLeftColor: task.color || 'var(--gray-400)',
                          borderLeftWidth: 3,
                          transition: 'transform 0.12s, box-shadow 0.12s',
                          flexShrink: 0,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-800)', lineHeight: 1.3, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {task.titulo}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                          <span style={{ fontSize: 10, color: 'var(--gray-400)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                            {task.empleado_nombre
                              ? task.empleado_nombre.split(' ')[0]
                              : task.equipo_nombre
                                ? `Eq: ${task.equipo_nombre}`
                                : '—'}
                          </span>
                          {task.hora_inicio && (
                            <span style={{ fontSize: 9, background: 'var(--gray-100)', color: 'var(--gray-500)', padding: '1px 5px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                              <Clock size={7} /> {task.hora_inicio.substring(0, 5)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={() => {
            setFormData(selectedTask);
            setSelectedTask(null);
            setShowModal(true);
          }}
          onDelete={handleDelete}
          isDeleting={deletingId === selectedTask?.id}
        />
      )}

      {showModal && (
        <TareaFormModal
          formData={formData}
          empleados={empleados}
          isSubmitting={isSubmitting}
          handleInputChange={e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
          handleMaterialesChange={mats => setFormData(prev => ({ ...prev, materiales: mats }))}
          handleSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}

      <style>{`
        .cal-col-body:hover .cal-add-hint { opacity: 1 !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: var(--gray-200); border-radius: 4px; }
      `}</style>
    </div>
  );
}
