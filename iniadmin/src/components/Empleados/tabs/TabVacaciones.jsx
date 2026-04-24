import React, { useState, useEffect, useCallback } from 'react';
import { Palmtree, Plus, X, Loader2 } from 'lucide-react';
import { BASE_API } from '../../../config';

const ESTADOS_VAC = [
  { value: 'aprobado',  label: 'Aprobado',  color: '#16a34a', bg: '#f0fdf4' },
  { value: 'pendiente', label: 'Pendiente', color: '#d97706', bg: '#fffbeb' },
  { value: 'rechazado', label: 'Rechazado', color: '#dc2626', bg: '#fef2f2' },
];

const getEstado = (v) => ESTADOS_VAC.find(e => e.value === v) ?? ESTADOS_VAC[1];

const inputStyle = {
  width: '100%', padding: '8px 12px', border: '1.5px solid var(--gray-200)',
  borderRadius: 'var(--radius-md)', fontSize: 13, fontFamily: 'inherit', outline: 'none',
  background: 'white', boxSizing: 'border-box',
};

const calcDays = (start, end) => {
  if (!start || !end) return null;
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : null;
};

const formatDate = (d) => {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

export default function TabVacaciones({ empleadoId }) {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({ titulo: '', fecha: '', fecha_fin: '', estado: 'pendiente', descripcion: '' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_API}empleados/historial.php?empleado_id=${empleadoId}&tipo=vacacion`);
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
    if (!form.fecha || !form.fecha_fin) return;
    const titulo = form.titulo || `Vacaciones ${formatDate(form.fecha)} – ${formatDate(form.fecha_fin)}`;
    setSaving(true);
    try {
      const res = await fetch(`${BASE_API}empleados/historial.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empleado_id: empleadoId, tipo: 'vacacion', ...form, titulo }),
      });
      if (res.ok) {
        const nuevo = await res.json();
        setItems(prev => [nuevo, ...prev]);
        setForm({ titulo: '', fecha: '', fecha_fin: '', estado: 'pendiente', descripcion: '' });
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

  const totalDays = items
    .filter(i => i.estado === 'aprobado')
    .reduce((acc, i) => acc + (calcDays(i.fecha, i.fecha_fin) ?? 0), 0);

  return (
    <div style={{ padding: '20px 28px' }}>
      {/* Header + stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Palmtree size={16} color="#16a34a" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>Vacaciones</span>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 'var(--radius-md)', background: showForm ? 'var(--gray-100)' : 'var(--gradient-brand)', color: showForm ? 'var(--gray-700)' : 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.2s' }}
        >
          {showForm ? <><X size={13} /> Cancelar</> : <><Plus size={13} /> Registrar</>}
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '10px 14px', textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 900, color: '#16a34a', margin: 0 }}>{totalDays}</p>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#16a34a', margin: '2px 0 0', opacity: 0.8 }}>Días Aprobados</p>
        </div>
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '10px 14px', textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 900, color: '#d97706', margin: 0 }}>{items.filter(i => i.estado === 'pendiente').length}</p>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#d97706', margin: '2px 0 0', opacity: 0.8 }}>Pendientes</p>
        </div>
        <div style={{ background: '#f8fafc', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '10px 14px', textAlign: 'center' }}>
          <p style={{ fontSize: 22, fontWeight: 900, color: 'var(--gray-600)', margin: 0 }}>{items.length}</p>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--gray-400)', margin: '2px 0 0' }}>Total Solicitudes</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>Fecha inicio <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input type="date" name="fecha" value={form.fecha} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>Fecha fin <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input type="date" name="fecha_fin" value={form.fecha_fin} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>Estado</label>
              <select name="estado" value={form.estado} onChange={handleChange} style={inputStyle}>
                {ESTADOS_VAC.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
          </div>
          {form.fecha && form.fecha_fin && calcDays(form.fecha, form.fecha_fin) && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '4px 12px', marginBottom: 10 }}>
              <Palmtree size={12} color="#16a34a" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{calcDays(form.fecha, form.fecha_fin)} días</span>
            </div>
          )}
          <input type="text" name="titulo" value={form.titulo} onChange={handleChange} placeholder="Motivo / etiqueta (opcional)" style={{ ...inputStyle, marginBottom: 10 }} />
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={2} placeholder="Notas adicionales..." style={{ ...inputStyle, resize: 'vertical', marginBottom: 10 }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleAdd} disabled={saving || !form.fecha || !form.fecha_fin} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 18px', background: 'var(--gradient-brand)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Guardar
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Loader2 size={24} className="animate-spin" color="var(--gray-400)" />
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)' }}>
          <Palmtree size={36} style={{ opacity: 0.2, marginBottom: 12 }} />
          <p style={{ fontSize: 13, margin: 0 }}>Sin vacaciones registradas</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(item => {
            const est  = getEstado(item.estado);
            const days = calcDays(item.fecha, item.fecha_fin);
            return (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', background: 'white' }}>
                {/* Days pill */}
                <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: est.bg, border: `1.5px solid ${est.color}30`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: est.color, lineHeight: 1 }}>{days ?? '?'}</span>
                  <span style={{ fontSize: 9, fontWeight: 600, color: est.color, opacity: 0.7 }}>días</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>
                      {formatDate(item.fecha)} – {formatDate(item.fecha_fin)}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: est.color, background: est.bg, padding: '1px 8px', borderRadius: 20 }}>{est.label}</span>
                  </div>
                  {item.titulo && item.titulo !== `Vacaciones ${formatDate(item.fecha)} – ${formatDate(item.fecha_fin)}` && (
                    <p style={{ fontSize: 12, color: 'var(--gray-500)', margin: 0 }}>{item.titulo}</p>
                  )}
                  {item.descripcion && <p style={{ fontSize: 11, color: 'var(--gray-400)', margin: '2px 0 0' }}>{item.descripcion}</p>}
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
