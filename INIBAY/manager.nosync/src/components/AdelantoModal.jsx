import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CalendarPlus, AlertCircle } from 'lucide-react';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto',
               'Septiembre','Octubre','Noviembre','Diciembre'];

// Genera lista de meses disponibles para adelantar a partir de la última fecha pagada
const generarMeses = (client) => {
  if (!client) return [];

  // Punto de partida: mes siguiente al último mes cubierto por fecha_renovacion
  let startYear, startMonth;
  if (client.fecha_renovacion) {
    const reno = new Date(client.fecha_renovacion + 'T12:00:00');
    startYear  = reno.getFullYear();
    startMonth = reno.getMonth() + 2; // +1 para "siguiente", +1 porque getMonth es 0-index
    if (startMonth > 12) { startMonth -= 12; startYear++; }
  } else {
    const hoy  = new Date();
    startYear  = hoy.getFullYear();
    startMonth = hoy.getMonth() + 2;
    if (startMonth > 12) { startMonth -= 12; startYear++; }
  }

  // Meses ya pagados (para saltarlos)
  const anioActual = new Date().getFullYear();
  const pagadosSet = new Set(
    (client.meses_pagados_anio || []).map(m => `${anioActual}-${String(m).padStart(2, '0')}`)
  );

  const lista = [];
  const cursor = new Date(startYear, startMonth - 1, 1);
  const costo  = parseFloat(client.costo || 250);

  for (let i = 0; i < 12; i++) {
    const y   = cursor.getFullYear();
    const m   = cursor.getMonth() + 1;
    const key = `${y}-${String(m).padStart(2, '0')}`;
    if (!pagadosSet.has(key)) {
      lista.push({ mes: m, anio: y, monto: costo, selected: i === 0 });
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return lista;
};

const AdelantoModal = ({ isOpen, onClose, onSave, client }) => {
  const [meses,    setMeses]    = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && client) {
      setMeses(generarMeses(client));
      setErrorMsg('');
    }
  }, [isOpen, client]);

  const toggle = (idx) =>
    setMeses(prev => prev.map((m, i) => i === idx ? { ...m, selected: !m.selected } : m));

  const updateMonto = (idx, val) =>
    setMeses(prev => prev.map((m, i) => i === idx ? { ...m, monto: parseFloat(val) || 0 } : m));

  const seleccionados = meses.filter(m => m.selected);
  const total         = seleccionados.reduce((s, m) => s + m.monto, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (seleccionados.length === 0) return;
    setSaving(true);
    setErrorMsg('');
    try {
      await onSave({
        suscripcion_id:    client.id,
        meses_especificos: seleccionados.map(m => ({
          mes:       m.mes,
          anio:      m.anio,
          monto:     m.monto,
          fecha_pago: `${m.anio}-${String(m.mes).padStart(2, '0')}-15`,
        })),
      });
      setSaving(false);
    } catch (err) {
      console.error('AdelantoModal error:', err);
      setErrorMsg(err?.message || 'Error al guardar. Intenta de nuevo.');
      setSaving(false);
    }
  };

  if (!isOpen || !client) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in" style={{ maxWidth: '500px' }}>

        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', color: 'var(--primary)' }}>
              <CalendarPlus size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0 }}>Pago Adelantado</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {client.nombre} · {client.tipo_servicio}
              </span>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon-only" onClick={onClose} disabled={saving}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Selecciona los meses a pagar por adelantado. Puedes ajustar el monto de cada mes.
            </p>

            {errorMsg && (
              <div style={{
                display: 'flex', gap: '0.5rem', alignItems: 'center',
                padding: '0.75rem 1rem',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '10px', fontSize: '0.82rem', color: '#ef4444',
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                {errorMsg}
              </div>
            )}

            {meses.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No hay meses disponibles para adelantar.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '360px', overflowY: 'auto', paddingRight: '2px' }}>
                {meses.map((m, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggle(idx)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.7rem 1rem',
                      borderRadius: '10px',
                      border: `1px solid ${m.selected ? 'rgba(99,102,241,0.45)' : 'var(--border)'}`,
                      background: m.selected ? 'rgba(99,102,241,0.07)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, background 0.15s',
                      userSelect: 'none',
                    }}
                  >
                    {/* Checkbox */}
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
                      background: m.selected ? 'var(--primary)' : 'transparent',
                      border: `2px solid ${m.selected ? 'var(--primary)' : 'var(--border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {m.selected && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>

                    {/* Nombre del mes */}
                    <span style={{ flex: 1, fontWeight: 600, fontSize: '0.87rem', color: 'var(--text-primary)' }}>
                      {MESES[m.mes - 1]} {m.anio}
                    </span>

                    {/* Monto */}
                    <div
                      onClick={e => e.stopPropagation()}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>$</span>
                      <input
                        type="number"
                        value={m.monto}
                        onChange={e => updateMonto(idx, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        className="form-control"
                        style={{
                          width: '85px', padding: '0.25rem 0.5rem',
                          fontSize: '0.85rem', textAlign: 'right',
                          opacity: m.selected ? 1 : 0.4,
                        }}
                        step="0.01"
                        min="0"
                        disabled={!m.selected}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Resumen */}
            {seleccionados.length > 0 && (
              <div style={{
                padding: '0.85rem 1rem',
                background: 'rgba(99,102,241,0.07)',
                border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: '10px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {seleccionados.length} {seleccionados.length === 1 ? 'mes seleccionado' : 'meses seleccionados'}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
                  ${total.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-panel)', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                minWidth: '170px',
                background: seleccionados.length === 0 ? undefined : 'linear-gradient(135deg, var(--primary), #8b5cf6)',
                gap: '0.5rem',
              }}
              disabled={seleccionados.length === 0 || saving}
            >
              <CalendarPlus size={15} />
              {saving
                ? 'Guardando…'
                : seleccionados.length === 0
                  ? 'Selecciona meses'
                  : `Registrar ${seleccionados.length} ${seleccionados.length === 1 ? 'mes' : 'meses'}`
              }
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AdelantoModal;
