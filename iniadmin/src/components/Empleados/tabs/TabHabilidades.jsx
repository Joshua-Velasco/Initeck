import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Loader2, Zap } from 'lucide-react';
import { BASE_API } from '../../../config';

const NIVELES = [
  { value: 'basico',      label: 'Básico',      color: '#64748b', bg: '#f1f5f9' },
  { value: 'intermedio',  label: 'Intermedio',  color: '#2563eb', bg: '#eff6ff' },
  { value: 'avanzado',    label: 'Avanzado',    color: '#d97706', bg: '#fffbeb' },
  { value: 'experto',     label: 'Experto',     color: '#16a34a', bg: '#f0fdf4' },
];

const CATEGORIAS = ['Técnico', 'Operativo', 'Administrativo', 'Comunicación', 'Liderazgo', 'Otro'];

const getNivel = (v) => NIVELES.find(n => n.value === v) ?? NIVELES[0];

export default function TabHabilidades({ empleadoId }) {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({ nombre: '', nivel: 'intermedio', categoria: 'Técnico' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_API}empleados/habilidades.php?empleado_id=${empleadoId}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch { setItems([]); }
    setLoading(false);
  }, [empleadoId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${BASE_API}empleados/habilidades.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empleado_id: empleadoId, ...form }),
      });
      if (res.ok) {
        const nuevo = await res.json();
        setItems(prev => [...prev, nuevo]);
        setForm({ nombre: '', nivel: 'intermedio', categoria: 'Técnico' });
        setShowForm(false);
      }
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    try {
      await fetch(`${BASE_API}empleados/habilidades.php?id=${id}`, { method: 'DELETE' });
    } catch { fetchData(); }
  };

  // Group by category
  const grouped = items.reduce((acc, item) => {
    const cat = item.categoria || 'Sin categoría';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div style={{ padding: '20px 28px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={16} color="var(--brand)" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>
            Habilidades
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', background: 'var(--red-50)', padding: '1px 8px', borderRadius: 20 }}>
            {items.length}
          </span>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 'var(--radius-md)',
            background: showForm ? 'var(--gray-100)' : 'var(--gradient-brand)',
            color: showForm ? 'var(--gray-700)' : 'white',
            border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          {showForm ? <><X size={13} /> Cancelar</> : <><Plus size={13} /> Agregar</>}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>Nombre de la habilidad</label>
              <input
                autoFocus
                type="text"
                placeholder="Ej. Manejo de montacargas"
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>Nivel</label>
              <select
                value={form.nivel}
                onChange={e => setForm(f => ({ ...f, nivel: e.target.value }))}
                style={{ padding: '8px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'white' }}
              >
                {NIVELES.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 4 }}>Categoría</label>
              <select
                value={form.categoria}
                onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                style={{ padding: '8px 12px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'white' }}
              >
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button
              onClick={handleAdd}
              disabled={saving || !form.nombre.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 18px', background: 'var(--gradient-brand)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              Guardar
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
          <Zap size={36} style={{ opacity: 0.2, marginBottom: 12 }} />
          <p style={{ fontSize: 13, margin: 0 }}>Sin habilidades registradas</p>
          <p style={{ fontSize: 11, marginTop: 4, color: 'var(--gray-300)' }}>Usa el botón "Agregar" para comenzar</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {Object.entries(grouped).map(([cat, skills]) => (
            <div key={cat}>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                {cat}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {skills.map(s => {
                  const nivel = getNivel(s.nivel);
                  return (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '5px 10px 5px 12px',
                        background: 'white',
                        border: `1.5px solid ${nivel.color}30`,
                        borderRadius: 'var(--radius-full)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{s.nombre}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: nivel.color, background: nivel.bg, padding: '1px 7px', borderRadius: 20 }}>{nivel.label}</span>
                      <button
                        onClick={() => handleDelete(s.id)}
                        style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-300)', padding: 0, marginLeft: 2, transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-300)'}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
