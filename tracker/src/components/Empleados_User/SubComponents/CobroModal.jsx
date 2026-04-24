import React, { useState } from 'react';
import { X, DollarSign, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const SAFAR_API = '/initeck-flota/safar/api/';

const INCIDENCIA_CONFIG = {
  NINGUNA: { label: 'Sin incidencia', icon: '✅', color: '#22c55e' },
  PAGADO_PREVIAMENTE: { label: 'Cliente ya había pagado', icon: '💳', color: '#3b82f6' },
  CLIENTE_NO_PAGO: { label: 'Cliente no pagó', icon: '❌', color: '#ef4444' },
  CLIENTE_RECHAZO: { label: 'Cliente rechazó cobro', icon: '⚠️', color: '#f59e0b' },
  MONTO_INCORRECTO: { label: 'Monto incorrecto', icon: '💰', color: '#8b5cf6' },
  OTRO: { label: 'Otro', icon: '📝', color: '#6b7280' },
};

/**
 * CobroModal
 * Modal obligatorio que aparece al completar un viaje Safar.
 * El chofer debe confirmar cuánto cobró antes de continuar.
 */
export default function CobroModal({ trip, codigoChofer, onClose, onCobroRegistrado }) {
  const [montoCobrado, setMontoCobrado] = useState('');
  const [incidencia, setIncidencia] = useState('NINGUNA');
  const [observaciones, setObservaciones] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  if (!trip) return null;

  const metodo = (trip.MetodoPago || '').toUpperCase();
  const montoTotal = Number(trip.MontoFinal || 0);
  const montoDeposito = Number(trip.MontoDeposito || 0);

  let montoEsperado = 0;
  let etiquetaMetodo = '';

  if (metodo === 'STRIPE') {
    montoEsperado = 0;
    etiquetaMetodo = 'Pagado con tarjeta';
  } else if (metodo === 'EFECTIVO_DEPOSITO') {
    montoEsperado = montoTotal - montoDeposito;
    etiquetaMetodo = `Depósito $${montoDeposito.toFixed(2)} + Efectivo`;
  } else {
    montoEsperado = montoTotal;
    etiquetaMetodo = 'Efectivo total';
  }

  const handleSubmit = async () => {
    setError('');

    if (montoEsperado > 0 && (montoCobrado === '' || montoCobrado < 0)) {
      setError('Ingresa el monto cobrado.');
      return;
    }

    setEnviando(true);

    try {
      const res = await fetch(`${SAFAR_API}registrar_cobro_efectivo.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          IdOrdenServicio: trip.IdOrdenServicio,
          CodigoChofer: codigoChofer,
          MontoCobrado: montoEsperado > 0 ? parseFloat(montoCobrado) : 0,
          Incidencia: incidencia,
          Observaciones: observaciones,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onCobroRegistrado(data);
      } else {
        setError(data.message || 'Error al registrar cobro.');
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setEnviando(false);
    }
  };

  const handleSkip = () => {
    // Permitir saltar solo si es Stripe (no requiere cobro)
    if (montoEsperado === 0) {
      onCobroRegistrado({ success: true, skipped: true });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1080,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 24,
          maxWidth: 480,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: montoEsperado > 0 ? '#f59e0b' : '#22c55e',
            borderRadius: '24px 24px 0 0',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <DollarSign size={28} color="#fff" />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>
                {montoEsperado > 0 ? 'Registrar Cobro' : 'Viaje Completado'}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
                Folio #{trip.Folio}
              </div>
            </div>
          </div>
          {montoEsperado === 0 && (
            <button
              onClick={() => onClose()}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 18,
              }}
            >
              ×
            </button>
          )}
        </div>

        <div style={{ padding: 24 }}>
          {/* Info del viaje */}
          <div
            style={{
              background: '#f8f8f8',
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 11, color: '#888', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
              Método de pago
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 12 }}>
              {etiquetaMetodo}
            </div>

            {montoEsperado > 0 && (
              <div
                style={{
                  background: '#fff3cd',
                  border: '1.5px solid #ffc107',
                  borderRadius: 12,
                  padding: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13, color: '#856404', fontWeight: 600 }}>
                  Monto a cobrar:
                </span>
                <span style={{ fontSize: 24, fontWeight: 900, color: '#b45309' }}>
                  ${montoEsperado.toFixed(2)}
                </span>
              </div>
            )}

            {montoEsperado === 0 && (
              <div
                style={{
                  background: '#d1fae5',
                  border: '1.5px solid #22c55e',
                  borderRadius: 12,
                  padding: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <CheckCircle size={18} color="#22c55e" />
                <span style={{ fontSize: 13, color: '#166534', fontWeight: 600 }}>
                  Este viaje ya fue pagado completamente. No necesitas cobrar nada.
                </span>
              </div>
            )}
          </div>

          {/* Formulario de cobro */}
          {montoEsperado > 0 && (
            <>
              {/* Monto cobrado */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 6 }}>
                  ¿Cuánto cobraste en efectivo?
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: 20,
                      fontWeight: 800,
                      color: '#888',
                    }}
                  >
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={montoCobrado}
                    onChange={(e) => setMontoCobrado(e.target.value)}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 36px',
                      fontSize: 28,
                      fontWeight: 900,
                      border: '2px solid #e0e0e0',
                      borderRadius: 14,
                      outline: 'none',
                      boxSizing: 'border-box',
                      color: '#111',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#f59e0b')}
                    onBlur={(e) => (e.target.style.borderColor = '#e0e0e0')}
                  />
                </div>
                {montoCobrado && Math.abs(parseFloat(montoCobrado) - montoEsperado) > 0.01 && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 11,
                      color: '#ef4444',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <AlertTriangle size={14} />
                    El monto no coincide con el esperado ($
                    {montoEsperado.toFixed(2)})
                  </div>
                )}
              </div>

              {/* Incidencia */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 8 }}>
                  ¿Hubo alguna incidencia?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {Object.entries(INCIDENCIA_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setIncidencia(key)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 10,
                        border:
                          incidencia === key
                            ? `2px solid ${cfg.color}`
                            : '1.5px solid #e0e0e0',
                        background: incidencia === key ? `${cfg.color}15` : '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        color: incidencia === key ? cfg.color : '#555',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{cfg.icon}</span>
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Observaciones */}
              {incidencia !== 'NINGUNA' && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 6 }}>
                    Observaciones (opcional)
                  </label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Describe lo que sucedió..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: 12,
                      fontSize: 14,
                      border: '1.5px solid #e0e0e0',
                      borderRadius: 12,
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}
            </>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                background: '#fdecea',
                color: '#b71c1c',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {/* Botones de acción */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={handleSubmit}
              disabled={enviando}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 16,
                border: 'none',
                background: '#111',
                color: '#fff',
                fontSize: 16,
                fontWeight: 800,
                cursor: enviando ? 'wait' : 'pointer',
                opacity: enviando ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {enviando ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Confirmar Cobro
                </>
              )}
            </button>

            {montoEsperado === 0 && (
              <button
                onClick={handleSkip}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 16,
                  border: '1.5px solid #e0e0e0',
                  background: '#fff',
                  color: '#555',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cerrar (sin cobro)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
