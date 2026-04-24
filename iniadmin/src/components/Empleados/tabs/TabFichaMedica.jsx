import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Save, Edit3, Loader2, Phone, Shield, AlertCircle } from 'lucide-react';
import { BASE_API } from '../../../config';

const TIPOS_SANGRE = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Desconocido'];

const EMPTY = {
  tipo_sangre: '', alergias: '', condiciones_cronicas: '', medicamentos: '',
  contacto_nombre: '', contacto_telefono: '', contacto_parentesco: '',
  seguro_medico: '', numero_poliza: '',
};

const SangreColor = {
  'A+': '#ef4444', 'A-': '#f87171',
  'B+': '#3b82f6', 'B-': '#60a5fa',
  'AB+': '#8b5cf6', 'AB-': '#a78bfa',
  'O+': '#22c55e', 'O-': '#4ade80',
};

const inputStyle = {
  width: '100%', padding: '8px 12px', border: '1.5px solid var(--gray-200)',
  borderRadius: 'var(--radius-md)', fontSize: 13, fontFamily: 'inherit',
  color: 'var(--gray-800)', outline: 'none', background: 'white', boxSizing: 'border-box',
};

const FieldGroup = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {label}
    </label>
    {children}
  </div>
);

export default function TabFichaMedica({ empleadoId }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({ ...EMPTY });
  const [saving,  setSaving]  = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_API}empleados/ficha_medica.php?empleado_id=${empleadoId}`);
      const d   = await res.json();
      setData(d);
      if (d) setForm({ ...EMPTY, ...d });
    } catch { setData(null); }
    setLoading(false);
  }, [empleadoId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${BASE_API}empleados/ficha_medica.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empleado_id: empleadoId, ...form }),
      });
      if (res.ok) {
        setData({ ...form });
        setEditing(false);
      }
    } catch {}
    setSaving(false);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <Loader2 size={24} className="animate-spin" color="var(--gray-400)" />
    </div>
  );

  const view = data || EMPTY;

  return (
    <div style={{ padding: '20px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Heart size={16} color="#ef4444" />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)' }}>Ficha Médica</span>
          {!data && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--gray-400)', background: 'var(--gray-100)', padding: '2px 8px', borderRadius: 20 }}>Sin datos</span>}
        </div>
        {!editing ? (
          <button
            onClick={() => { if (!data) setForm({ ...EMPTY }); setEditing(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 'var(--radius-md)', background: 'var(--gray-100)', color: 'var(--gray-700)', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
          >
            <Edit3 size={13} /> Editar
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setForm(data ? { ...EMPTY, ...data } : { ...EMPTY }); setEditing(false); }} style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', background: 'var(--gray-100)', color: 'var(--gray-600)', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-brand)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Guardar
            </button>
          </div>
        )}
      </div>

      {/* View / Edit */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* ── Columna izquierda: datos médicos ── */}
        <div>
          {/* Tipo de sangre destacado */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Tipo de Sangre
            </p>
            {editing ? (
              <select name="tipo_sangre" value={form.tipo_sangre} onChange={handleChange} style={{ ...inputStyle, fontWeight: 700, fontSize: 16 }}>
                <option value="">Sin especificar</option>
                {TIPOS_SANGRE.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            ) : (
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 64, height: 64, borderRadius: 'var(--radius-lg)',
                background: SangreColor[view.tipo_sangre] ? `${SangreColor[view.tipo_sangre]}15` : 'var(--gray-100)',
                border: `2px solid ${SangreColor[view.tipo_sangre] || 'var(--gray-200)'}`,
              }}>
                <span style={{ fontSize: 20, fontWeight: 900, color: SangreColor[view.tipo_sangre] || 'var(--gray-400)' }}>
                  {view.tipo_sangre || '?'}
                </span>
              </div>
            )}
          </div>

          <div style={{ height: 1, background: 'var(--gray-100)', marginBottom: 16 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <AlertCircle size={13} color="var(--warning)" />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Condiciones Médicas
            </span>
          </div>

          {editing ? (
            <>
              <FieldGroup label="Alergias">
                <textarea name="alergias" value={form.alergias} onChange={handleChange} rows={2} placeholder="Ej. Penicilina, Polen..." style={{ ...inputStyle, resize: 'vertical' }} />
              </FieldGroup>
              <FieldGroup label="Condiciones Crónicas">
                <textarea name="condiciones_cronicas" value={form.condiciones_cronicas} onChange={handleChange} rows={2} placeholder="Ej. Diabetes tipo 2, Hipertensión..." style={{ ...inputStyle, resize: 'vertical' }} />
              </FieldGroup>
              <FieldGroup label="Medicamentos Habituales">
                <textarea name="medicamentos" value={form.medicamentos} onChange={handleChange} rows={2} placeholder="Ej. Metformina 500mg..." style={{ ...inputStyle, resize: 'vertical' }} />
              </FieldGroup>
            </>
          ) : (
            <>
              <InfoItem label="Alergias" value={view.alergias} />
              <InfoItem label="Condiciones Crónicas" value={view.condiciones_cronicas} />
              <InfoItem label="Medicamentos" value={view.medicamentos} />
            </>
          )}
        </div>

        {/* ── Columna derecha: contacto de emergencia + seguro ── */}
        <div>
          <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 'var(--radius-lg)', padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <Phone size={13} color="#ef4444" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Contacto de Emergencia
              </span>
            </div>
            {editing ? (
              <>
                <FieldGroup label="Nombre">
                  <input type="text" name="contacto_nombre" value={form.contacto_nombre} onChange={handleChange} placeholder="Nombre completo" style={inputStyle} />
                </FieldGroup>
                <FieldGroup label="Teléfono">
                  <input type="tel" name="contacto_telefono" value={form.contacto_telefono} onChange={handleChange} placeholder="(000) 000-0000" style={inputStyle} />
                </FieldGroup>
                <FieldGroup label="Parentesco">
                  <input type="text" name="contacto_parentesco" value={form.contacto_parentesco} onChange={handleChange} placeholder="Ej. Esposa, Madre, Hermano..." style={inputStyle} />
                </FieldGroup>
              </>
            ) : (
              <>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-800)', margin: '0 0 2px' }}>{view.contacto_nombre || '—'}</p>
                <p style={{ fontSize: 13, color: 'var(--gray-600)', margin: '0 0 4px' }}>{view.contacto_telefono || '—'}</p>
                <span style={{ fontSize: 11, fontWeight: 600, background: '#fecaca', color: '#dc2626', padding: '2px 8px', borderRadius: 20 }}>
                  {view.contacto_parentesco || 'Sin especificar'}
                </span>
              </>
            )}
          </div>

          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 'var(--radius-lg)', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <Shield size={13} color="#0284c7" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Seguro Médico
              </span>
            </div>
            {editing ? (
              <>
                <FieldGroup label="Aseguradora">
                  <input type="text" name="seguro_medico" value={form.seguro_medico} onChange={handleChange} placeholder="Ej. IMSS, GNP, AXA..." style={inputStyle} />
                </FieldGroup>
                <FieldGroup label="Número de Póliza">
                  <input type="text" name="numero_poliza" value={form.numero_poliza} onChange={handleChange} placeholder="Ej. GNP-12345678" style={inputStyle} />
                </FieldGroup>
              </>
            ) : (
              <>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)', margin: '0 0 4px' }}>{view.seguro_medico || '—'}</p>
                <p style={{ fontSize: 12, color: 'var(--gray-500)', margin: 0 }}>Póliza: {view.numero_poliza || 'Sin número'}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 3px' }}>{label}</p>
      <p style={{ fontSize: 13, color: value ? 'var(--gray-700)' : 'var(--gray-300)', margin: 0 }}>{value || 'Sin registrar'}</p>
    </div>
  );
}
