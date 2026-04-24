import React, { useState, useEffect, useCallback } from 'react';
import { Clock, TrendingUp, ThumbsUp, Plus, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { BASE_API } from '../../../config';

const TIPOS = [
  {
    key: 'retardo',
    label: 'Retardos',
    icon: Clock,
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
    badge: 'var(--danger)',
  },
  {
    key: 'mejora',
    label: 'Puntos de Mejora',
    icon: TrendingUp,
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    badge: 'var(--warning)',
  },
  {
    key: 'acierto',
    label: 'Aciertos',
    icon: ThumbsUp,
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    badge: 'var(--success)',
  },
];

const inputStyle = {
  width: '100%', padding: '7px 10px', border: '1.5px solid var(--gray-200)',
  borderRadius: 'var(--radius-md)', fontSize: 12, fontFamily: 'inherit', outline: 'none',
  background: 'white', boxSizing: 'border-box',
};

const formatDate = (d) => {
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length !== 3) return d;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

function AddForm({ tipo, empleadoId, onAdded, onCancel }) {
  const [form,   setForm]   = useState({ titulo: '', descripcion: '', fecha: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.titulo.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${BASE_API}empleados/historial.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empleado_id: empleadoId, tipo, ...form }),
      });
      if (res.ok) {
        const nuevo = await res.json();
        onAdded(nuevo);
      }
    } catch {}
    setSaving(false);
  };

  return (
    <div style={{ background: 'white', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: 12, marginBottom: 8 }}>
      <input
        autoFocus
        type="text"
        placeholder={tipo === 'retardo' ? 'Motivo del retardo' : tipo === 'mejora' ? 'Área de mejora' : 'Logro o acierto'}
        value={form.titulo}
        onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
        style={{ ...inputStyle, marginBottom: 8, fontWeight: 600 }}
      />
      <textarea
        placeholder="Descripción adicional (opcional)"
        value={form.descripcion}
        onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
        rows={2}
        style={{ ...inputStyle, resize: 'vertical', marginBottom: 8 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="date"
          value={form.fecha}
          onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button onClick={onCancel} style={{ padding: '6px 12px', background: 'var(--gray-100)', color: 'var(--gray-600)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          Cancelar
        </button>
        <button onClick={handleSave} disabled={saving || !form.titulo.trim()} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: 'var(--gradient-brand)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          {saving ? <Loader2 size={12} className="animate-spin" /> : null} Guardar
        </button>
      </div>
    </div>
  );
}

function SeccionTipo({ tipo, empleadoId, items, onAdded, onDeleted }) {
  const { icon: Icon, label, color, bg, border } = tipo;
  const [showForm,     setShowForm]     = useState(false);
  const [collapsed,    setCollapsed]    = useState(false);
  const [deletingId,   setDeletingId]   = useState(null);

  const handleDelete = async (id) => {
    setDeletingId(id);
    onDeleted(id);
    try {
      await fetch(`${BASE_API}empleados/historial.php?id=${id}`, { method: 'DELETE' });
    } catch {}
    setDeletingId(null);
  };

  return (
    <div style={{ border: `1px solid ${border}`, borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: bg }}>
      {/* Section header */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setCollapsed(v => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={15} color={color} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>{label}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}20`, padding: '2px 8px', borderRadius: 20 }}>{items.length}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={e => { e.stopPropagation(); setShowForm(v => !v); setCollapsed(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: color, color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
          >
            <Plus size={12} /> Agregar
          </button>
          {collapsed ? <ChevronDown size={16} color="var(--gray-400)" /> : <ChevronUp size={16} color="var(--gray-400)" />}
        </div>
      </div>

      {!collapsed && (
        <div style={{ borderTop: `1px solid ${border}`, background: 'white', padding: 12 }}>
          {showForm && (
            <AddForm
              tipo={tipo.key}
              empleadoId={empleadoId}
              onAdded={(item) => { onAdded(item); setShowForm(false); }}
              onCancel={() => setShowForm(false)}
            />
          )}
          {items.length === 0 && !showForm ? (
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray-400)', padding: '12px 0', margin: 0 }}>Sin registros</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-100)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{item.titulo}</span>
                      {item.fecha && (
                        <span style={{ fontSize: 10, color: 'var(--gray-400)', background: 'var(--gray-100)', padding: '1px 8px', borderRadius: 20, fontWeight: 600 }}>
                          {formatDate(item.fecha)}
                        </span>
                      )}
                    </div>
                    {item.descripcion && (
                      <p style={{ fontSize: 12, color: 'var(--gray-500)', margin: '3px 0 0', lineHeight: 1.4 }}>{item.descripcion}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-300)', padding: 4, flexShrink: 0, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-300)'}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TabDesempeno({ empleadoId }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_API}empleados/historial.php?empleado_id=${empleadoId}&tipo=retardo&tipo=mejora&tipo=acierto`);
      // Fetch all three types
      const [rR, rM, rA] = await Promise.all([
        fetch(`${BASE_API}empleados/historial.php?empleado_id=${empleadoId}&tipo=retardo`).then(r => r.json()),
        fetch(`${BASE_API}empleados/historial.php?empleado_id=${empleadoId}&tipo=mejora`).then(r => r.json()),
        fetch(`${BASE_API}empleados/historial.php?empleado_id=${empleadoId}&tipo=acierto`).then(r => r.json()),
      ]);
      setItems([
        ...(Array.isArray(rR) ? rR : []),
        ...(Array.isArray(rM) ? rM : []),
        ...(Array.isArray(rA) ? rA : []),
      ]);
    } catch { setItems([]); }
    setLoading(false);
  }, [empleadoId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getByTipo = (tipo) => items.filter(i => i.tipo === tipo);

  const handleAdded = (item) => setItems(prev => [item, ...prev]);
  const handleDeleted = (id) => setItems(prev => prev.filter(i => i.id !== id));

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <Loader2 size={24} className="animate-spin" color="var(--gray-400)" />
    </div>
  );

  return (
    <div style={{ padding: '20px 28px' }}>
      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {TIPOS.map(t => (
          <div key={t.key} style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 'var(--radius-md)', padding: '12px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 28, fontWeight: 900, color: t.color, margin: 0, lineHeight: 1 }}>{getByTipo(t.key).length}</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: t.color, margin: '4px 0 0', opacity: 0.8 }}>{t.label}</p>
          </div>
        ))}
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {TIPOS.map(t => (
          <SeccionTipo
            key={t.key}
            tipo={t}
            empleadoId={empleadoId}
            items={getByTipo(t.key)}
            onAdded={handleAdded}
            onDeleted={handleDeleted}
          />
        ))}
      </div>
    </div>
  );
}
