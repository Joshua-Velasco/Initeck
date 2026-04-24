import React, { useState, useEffect, useCallback } from 'react';
import { FolderOpen, Plus, X, Loader2, ChevronDown } from 'lucide-react';
import { BASE_API } from '../../../config';

const ESTADOS = [
  { value: 'en_progreso', label: 'En Progreso', color: '#2563eb', bg: '#eff6ff' },
  { value: 'completado',  label: 'Completado',  color: '#16a34a', bg: '#f0fdf4' },
  { value: 'pausado',     label: 'Pausado',     color: '#d97706', bg: '#fffbeb' },
  { value: 'cancelado',   label: 'Cancelado',   color: '#6b7280', bg: '#f9fafb' },
];

const getEstado = (v) => ESTADOS.find(e => e.value === v) ?? ESTADOS[0];

const inputStyle = {
  width: '100%', padding: '8px 12px', border: '1.5px solid var(--gray-200)',
  borderRadius: 'var(--radius-md)', fontSize: 13, fontFamily: 'inherit', outline: 'none',
  background: 'white', boxSizing: 'border-box',
};

const formatDate = (d) => {
  if (!d) return null;
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

export default function TabProyectos({ empleadoId }) {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({
    titulo: '', descripcion: '', fecha: '', fecha_fin: '', estado: 'en_progreso',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_API}empleados/historial.php?empleado_id=${empleadoId}&tipo=proyecto`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch { setItems([]); }
    setLoading(false);
  }, [empleadoId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleAdd = async () => {
    if (!form.titulo.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${BASE_API}empleados/historial.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empleado_id: empleadoId, tipo: 'proyecto', ...form }),
      });
      if (res.ok) {
        const nuevo = await res.json();
        setItems(prev => [nuevo, ...prev]);
        setForm({ titulo: '', descripcion: '', fecha: '', fecha_fin: '', estado: 'en_progreso' });
        setShowForm(false);
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    try {
      await fetch(`${BASE_API}empleados/historial.php?id=${id}`, { method: 'DELETE' });
    } catch { fetchData(); }
  };

  return (
    <div style={{ padding: '20px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FolderOpen size={16} color="#2563eb" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>Proyectos</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '1px 8px', borderRadius: 20 }}>{items.length}</span>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 'var(--radius-md)', background: showForm ? 'var(--gray-100)' : 'var(--gradient-brand)', color: showForm ? 'var(--gray-700)' : 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.2s' }}
        >
          {showForm ? <><X size={13} /> Cancelar</> : <><Plus size={13} /> Agregar</>}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: 10 }}>
            <input type="text" name="titulo" value={form.titulo} onChange={handleChange} placeholder="Nombre del proyecto" autoFocus style={{ ...inputStyle, fontWeight: 600 }} />
            <select name="estado" value={form.estado} onChange={handleChange} style={{ ...inputStyle, width: 'auto' }}>
              {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={2} placeholder="Descripción del proyecto..." style={{ ...inputStyle, resize: 'vertical', marginBottom: 10 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>Fecha inicio</label>
              <input type="date" name="fecha" value={form.fecha} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', display: 'block', marginBottom: 4 }}>Fecha fin (estimada)</label>
              <input type="date" name="fecha_fin" value={form.fecha_fin} onChange={handleChange} style={inputStyle} />
            </div>
            <button onClick={handleAdd} disabled={saving || !form.titulo.trim()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: 'var(--gradient-brand)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Guardar
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Loader2 size={24} className="animate-spin" color="var(--gray-400)" />
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)' }}>
          <FolderOpen size={36} style={{ opacity: 0.2, marginBottom: 12 }} />
          <p style={{ fontSize: 13, margin: 0 }}>Sin proyectos registrados</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(item => {
            const est = getEstado(item.estado);
            return (
              <div key={item.id} style={{ border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '14px 16px', background: 'white', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 4, background: est.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>{item.titulo}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: est.color, background: est.bg, padding: '2px 8px', borderRadius: 20 }}>{est.label}</span>
                  </div>
                  {item.descripcion && (
                    <p style={{ fontSize: 12, color: 'var(--gray-500)', margin: '0 0 6px', lineHeight: 1.4 }}>{item.descripcion}</p>
                  )}
                  {(item.fecha || item.fecha_fin) && (
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--gray-400)', fontWeight: 600 }}>
                      {item.fecha && <span>Inicio: {formatDate(item.fecha)}</span>}
                      {item.fecha_fin && <span>Fin: {formatDate(item.fecha_fin)}</span>}
                    </div>
                  )}
                </div>
                <button onClick={() => handleDelete(item.id)} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-300)', padding: 4, flexShrink: 0, transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-300)'}>
                  <X size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
