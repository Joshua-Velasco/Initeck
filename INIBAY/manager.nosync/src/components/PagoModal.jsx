import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, DollarSign, Calendar, FileText, RefreshCw, AlertCircle } from 'lucide-react';

// Fecha de hoy en hora local (evita el problema de UTC que cambia el día)
const localToday = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const PagoModal = ({ isOpen, onClose, onSave, client }) => {
  const [formData, setFormData] = useState({ fecha_pago: '', monto: '', nota: '' });

  useEffect(() => {
    if (client && isOpen) {
      setFormData({
        fecha_pago: localToday(),
        monto: client.deudaTotal > 0 ? client.deudaTotal : (client.costo ?? ''),
        nota: ''
      });
    }
  }, [client, isOpen]);

  if (!isOpen || !client) return null;

  const costo        = parseFloat(client.costo || 0);
  const monto        = parseFloat(formData.monto) || costo;
  const mesesAPagar  = Math.max(1, Math.floor(monto / (costo || 1)));
  const mesesDeuda   = client.mesesDeuda || 0;
  const hayDeuda     = mesesDeuda > 0;

  // Calcular qué meses se registrarán según la fecha_renovacion actual
  const calcMesesRegistrar = () => {
    const meses = [];
    const fechaPagoObj = new Date(formData.fecha_pago + 'T12:00:00');
    const mesPago  = fechaPagoObj.getMonth() + 1; // 1-12
    const anioPago = fechaPagoObj.getFullYear();
    const renovacion = client.fecha_renovacion ? new Date(client.fecha_renovacion + 'T12:00:00') : null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const mesesPagados = new Set((client.meses_pagados_anio || []).map(m => `${anioPago}-${String(m).padStart(2,'0')}`));
    const mesesAPagar = Math.max(1, Math.floor(monto / (costo || 1)));

    if (renovacion && renovacion < hoy) {
      // Hay deuda: cobrar desde el mes de la fecha_renovacion hasta el mes de pago
      const cursor = new Date(renovacion);
      cursor.setDate(1); // primer día del mes de renovación

      const limite = new Date(fechaPagoObj);
      limite.setDate(1); // primer día del mes de pago

      while (cursor <= limite && meses.length < mesesAPagar) {
        const key = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}`;
        if (!mesesPagados.has(key)) {
          meses.push({ mes: cursor.getMonth() + 1, anio: cursor.getFullYear() });
        }
        cursor.setMonth(cursor.getMonth() + 1);
      }
    } else {
      // Sin deuda: registrar mes actual si no está pagado
      const keyActual = `${anioPago}-${String(mesPago).padStart(2,'0')}`;
      if (!mesesPagados.has(keyActual)) {
        meses.push({ mes: mesPago, anio: anioPago });
      }
    }

    // Pagos adelantados si el pago cubre más meses que la deuda
    if (meses.length < mesesAPagar) {
      const last = meses.length > 0 ? meses[meses.length - 1] : { mes: mesPago, anio: anioPago };
      const advance = new Date(last.anio, last.mes - 1, 1);
      advance.setMonth(advance.getMonth() + 1); // siguiente mes

      while (meses.length < mesesAPagar) {
        const key = `${advance.getFullYear()}-${String(advance.getMonth()+1).padStart(2,'0')}`;
        if (!mesesPagados.has(key)) {
          meses.push({ mes: advance.getMonth() + 1, anio: advance.getFullYear() });
        }
        advance.setMonth(advance.getMonth() + 1);
      }
    }

    return meses;
  };

  const mesesARegistrar = calcMesesRegistrar();
  const ultimoMes       = mesesARegistrar[mesesARegistrar.length - 1];

  // Calcular la nueva fecha de vigencia respetando el día original de fecha_renovacion
  const nuevaFecha = (() => {
    if (!ultimoMes) return null;

    // Obtener el día original de la fecha_renovacion del cliente
    let diaOriginal = 1;
    if (client.fecha_renovacion) {
      const renoOriginal = new Date(client.fecha_renovacion + 'T12:00:00');
      diaOriginal = renoOriginal.getDate();
    }

    // Crear fecha basada en el último mes registrado, avanzando 1 mes desde ahí
    const nuevaFechaCalc = new Date(ultimoMes.anio, ultimoMes.mes, diaOriginal);

    // Ajustar si el día original no existe en ese mes (ej. 31 en febrero → 28)
    if (nuevaFechaCalc.getDate() !== diaOriginal) {
      nuevaFechaCalc.setDate(0); // último día del mes anterior (que es el mes correcto)
    }

    return nuevaFechaCalc;
  })();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      suscripcion_id: client.id,
      fecha_pago: formData.fecha_pago,
      monto: parseFloat(formData.monto) || parseFloat(client.costo) || 0,
      nota: formData.nota || null
    });
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
              <DollarSign size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0 }}>Registrar Pago</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {client.nombre} · {client.tipo_servicio}
              </span>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon-only" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Alerta de deuda */}
            {hayDeuda && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                padding: '0.75rem 1rem',
                background: 'rgba(239,68,68,0.08)',
                borderRadius: '10px',
                border: '1px solid rgba(239,68,68,0.25)',
                fontSize: '0.82rem',
                color: '#ef4444'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>
                  Este cliente tiene <strong>{mesesDeuda} {mesesDeuda === 1 ? 'mes' : 'meses'} de deuda</strong>.
                  El pago saldará los meses más antiguos primero.
                </span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
                <Calendar size={14} /> Fecha de Pago
              </label>
              <input
                type="date"
                name="fecha_pago"
                value={formData.fecha_pago}
                onChange={handleChange}
                className="form-control"
                required
              />
              <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                El mes de este pago se toma de esta fecha
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
                <DollarSign size={14} /> Monto a Pagar
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>$</span>
                <input
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  className="form-control"
                  style={{ paddingLeft: '1.75rem' }}
                  step="0.01"
                  min={costo}
                  required
                />
              </div>
              <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                ${costo.toFixed(2)}/mes · Puedes pagar más para adelantar meses
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
                <FileText size={14} /> Nota (opcional)
              </label>
              <input
                type="text"
                name="nota"
                value={formData.nota}
                onChange={handleChange}
                className="form-control"
                placeholder="Ej. Efectivo, transferencia SPEI..."
              />
            </div>

            {/* Preview de meses a registrar */}
            <div style={{
              padding: '1rem',
              background: 'rgba(16,185,129,0.06)',
              borderRadius: '12px',
              border: '1px solid rgba(16,185,129,0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.1rem' }}>
                <RefreshCw size={14} /> Meses que se registrarán
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {mesesARegistrar.map((m, i) => (
                  <span key={i} style={{
                    padding: '0.2rem 0.5rem',
                    background: 'rgba(16,185,129,0.15)',
                    color: '#10b981',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}>
                    {MESES[m.mes - 1]} {m.anio}
                  </span>
                ))}
                {mesesARegistrar.length === 0 && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>Este mes ya está pagado</span>
                )}
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.1rem' }}>
                {nuevaFecha && (
                  <span>· Vigente hasta: <strong style={{ color: 'var(--text-primary)' }}>
                    {nuevaFecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </strong></span>
                )}
                {client?.vip
                  ? <span>· Cliente <strong style={{ color: 'var(--primary)' }}>VIP</strong> — el servicio no se interrumpirá</span>
                  : <span>· La suscripción quedará <strong style={{ color: '#10b981' }}>ACTIVA</strong></span>
                }
                <span>· El ingreso se reflejará en Finanzas automáticamente</span>
              </div>
            </div>

          </div>

          <div className="modal-footer" style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-panel)', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ minWidth: '160px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', gap: '0.5rem' }}
              disabled={mesesARegistrar.length === 0}
            >
              <DollarSign size={16} />
              Registrar {mesesARegistrar.length > 1 ? `${mesesARegistrar.length} Meses` : 'Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default PagoModal;
