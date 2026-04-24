import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Calendar, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const SAFAR_API = '/initeck-flota/safar/api/';

const PERIODOS = [
  { key: 'hoy', label: 'Hoy' },
  { key: 'semana', label: 'Esta Semana' },
  { key: 'mes', label: 'Este Mes' },
];

/**
 * SafarFinanzas
 * Panel separado de Uber que muestra las finanzas del chofer en Safar.
 * Permite ver cobros registrados, diferencias y alertas.
 */
export default function SafarFinanzas({ codigoChofer }) {
  const [periodo, setPeriodo] = useState('hoy');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [mostrarAlertas, setMostrarAlertas] = useState(true);

  useEffect(() => {
    if (!codigoChofer) return;
    fetchFinanzas();
  }, [codigoChofer, periodo]);

  const fetchFinanzas = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${SAFAR_API}chofer_finanzas_safar.php?codigoChofer=${encodeURIComponent(codigoChofer)}&periodo=${periodo}`
      );
      const result = await res.json();

      if (result.success) {
        setData(result);
      } else {
        setError(result.message || 'Error al cargar finanzas.');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  if (!codigoChofer) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
        Cargando identificación del chofer...
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40 }}>
        <Loader2 size={32} className="animate-spin" style={{ color: '#b22222' }} />
        <span style={{ fontSize: 13, color: '#888', marginTop: 12 }}>Cargando finanzas Safar...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: '#fdecea', color: '#b71c1c', borderRadius: 14, padding: 16, fontSize: 13, fontWeight: 600 }}>
        ⚠️ {error}
      </div>
    );
  }

  if (!data) return null;

  const { resumen, viajes, sin_cobro, periodo: periodoInfo } = data;

  return (
    <div>
      {/* Selector de periodo */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {PERIODOS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriodo(p.key)}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 12,
              border: 'none',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              background: periodo === p.key ? '#111' : '#f0f0f0',
              color: periodo === p.key ? '#fff' : '#555',
              transition: 'all 0.15s',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Alertas de viajes sin cobro */}
      {resumen.viajes_sin_cobro > 0 && mostrarAlertas && (
        <div
          style={{
            background: '#fef3cd',
            border: '1.5px solid #ffc107',
            borderRadius: 14,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <AlertTriangle size={20} color="#b45309" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#78350f' }}>
                {resumen.viajes_sin_cobro} viaje(s) sin registrar cobro
              </div>
              <div style={{ fontSize: 12, color: '#92400e' }}>
                Debes registrar el cobro de estos viajes.
              </div>
            </div>
            <button
              onClick={() => setMostrarAlertas(false)}
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#92400e' }}
            >
              ×
            </button>
          </div>

          {sin_cobro.slice(0, 3).map((viaje) => (
            <div
              key={viaje.IdOrdenServicio}
              style={{
                background: '#fff',
                borderRadius: 10,
                padding: 10,
                marginBottom: 6,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>#{viaje.Folio}</div>
                <div style={{ fontSize: 11, color: '#888' }}>
                  {new Date(viaje.FechaProgramadaInicio).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                  {' · '}
                  {new Date(viaje.FechaProgramadaInicio).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#b45309' }}>
                ${parseFloat(viaje.monto_pendiente).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resumen financiero */}
      <div
        style={{
          background: 'linear-gradient(135deg, #111 0%, #333 100%)',
          borderRadius: 20,
          padding: 20,
          marginBottom: 16,
          color: '#fff',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
          Total Cobrado en Efectivo
        </div>
        <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 16 }}>
          ${resumen.cobrado_efectivo.toFixed(2)}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: 12,
              textAlign: 'center',
            }}
          >
            <TrendingUp size={16} style={{ color: '#22c55e', marginBottom: 6 }} />
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Esperado</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>${resumen.total_cobrado_esperado.toFixed(2)}</div>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: 12,
              textAlign: 'center',
            }}
          >
            <DollarSign size={16} style={{ color: '#f59e0b', marginBottom: 6 }} />
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Real</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>${resumen.cobrado_efectivo.toFixed(2)}</div>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: 12,
              textAlign: 'center',
            }}
          >
            {resumen.diferencia >= 0 ? (
              <TrendingUp size={16} style={{ color: '#22c55e', marginBottom: 6 }} />
            ) : (
              <TrendingDown size={16} style={{ color: '#ef4444', marginBottom: 6 }} />
            )}
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Diferencia</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: resumen.diferencia >= 0 ? '#22c55e' : '#ef4444' }}>
              ${resumen.diferencia.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats adicionales */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            padding: 14,
            border: '1.5px solid #e0e0e0',
          }}
        >
          <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 6 }}>Viajes Completados</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#111' }}>{resumen.total_viajes_completados}</div>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: 14,
            padding: 14,
            border: '1.5px solid #e0e0e0',
          }}
        >
          <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 6 }}>Pagado con Stripe</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#22c55e' }}>${resumen.pagado_stripe.toFixed(2)}</div>
        </div>
      </div>

      {/* Incidencias */}
      {resumen.incidencia_count > 0 && (
        <div
          style={{
            background: '#fdecea',
            borderRadius: 14,
            padding: 14,
            marginBottom: 16,
            border: '1.5px solid #f5b5b5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} color="#b71c1c" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#b71c1c' }}>
              {resumen.incidencia_count} incidencia(s) reportadas
            </span>
          </div>
        </div>
      )}

      {/* Lista de viajes (expandable) */}
      {viajes.length > 0 && (
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            border: '1.5px solid #e0e0e0',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => setMostrarDetalle(!mostrarDetalle)}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: 'none',
              background: '#f8f8f8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: 13,
              color: '#333',
            }}
          >
            <span>Detalle de Viajes ({viajes.length})</span>
            {mostrarDetalle ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {mostrarDetalle && (
            <div style={{ padding: 16 }}>
              {viajes.map((viaje) => {
                const cobroPendiente = viaje.estado_cobro === 'PENDIENTE' && viaje.monto_esperado_cobro > 0;
                const cobroOk = viaje.estado_cobro === 'NINGUNA';

                return (
                  <div
                    key={viaje.IdOrdenServicio}
                    style={{
                      background: cobroPendiente ? '#fef3cd' : cobroOk ? '#d1fae5' : '#f8f8f8',
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 8,
                      border: cobroPendiente ? '1.5px solid #ffc107' : cobroOk ? '1.5px solid #22c55e' : '1.5px solid #e0e0e0',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>#{viaje.Folio}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>
                          <Calendar size={10} style={{ marginRight: 4 }} />
                          {new Date(viaje.FechaProgramadaInicio).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: 16, color: '#111' }}>
                          ${parseFloat(viaje.MontoFinal).toFixed(2)}
                        </div>
                        <div style={{ fontSize: 10, color: '#888' }}>{viaje.MetodoPago}</div>
                      </div>
                    </div>

                    <div style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>
                      {viaje.DireccionOrigen} → {viaje.DireccionDestino}
                    </div>

                    {viaje.monto_esperado_cobro > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#555' }}>
                          Esperado: ${parseFloat(viaje.monto_esperado_cobro).toFixed(2)}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: cobroOk ? '#22c55e' : cobroPendiente ? '#b45309' : '#888',
                            background: cobroOk ? '#d1fae5' : cobroPendiente ? '#fef3cd' : '#f0f0f0',
                            padding: '4px 10px',
                            borderRadius: 20,
                          }}
                        >
                          {cobroOk
                            ? '✅ Cobrado'
                            : cobroPendiente
                            ? '⏳ Pendiente'
                            : `⚠️ ${viaje.estado_cobro}`}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
