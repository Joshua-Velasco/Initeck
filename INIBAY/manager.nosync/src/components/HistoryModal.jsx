import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, History, Trash2, Calendar, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { API_URL } from '../config';

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const HistoryModal = ({ isOpen, onClose, client, onSuccess }) => {
  const [payments, setPayments]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [confirmId, setConfirmId]       = useState(null); // ID del pago a eliminar
  const [deleting, setDeleting]         = useState(false);
  const [errorMsg, setErrorMsg]         = useState('');

  const fetchHistory = () => {
    if (!client?.id) return;
    setLoading(true);
    fetch(`${API_URL}/api/pagos?suscripcion_id=${client.id}`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setPayments(data); })
      .catch(err => console.error("Error fetching history:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen && client) {
      setConfirmId(null);
      setErrorMsg('');
      fetchHistory();
    }
  }, [isOpen, client]);

  const handleDeleteConfirmed = async () => {
    if (!confirmId) return;
    setDeleting(true);
    setErrorMsg('');
    try {
      const res  = await fetch(`${API_URL}/api/pagos/${confirmId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setConfirmId(null);
        fetchHistory();
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(data.error || 'Error al eliminar el pago');
        setConfirmId(null);
      }
    } catch {
      setErrorMsg('Error de conexión. Intenta de nuevo.');
      setConfirmId(null);
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !client) return null;

  const pagoAEliminar = payments.find(p => p.id === confirmId);

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in" style={{ maxWidth: '600px' }}>

        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', color: 'var(--primary)' }}>
              <History size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0 }}>Historial de Pagos</h2>
              <span className="user-id">{client.nombre} ({client.no_cliente})</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon-only" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: 0 }}>

          {/* Modal de confirmación inline */}
          {confirmId && pagoAEliminar && (
            <div style={{
              margin: '1rem 1.5rem',
              padding: '1rem 1.25rem',
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 700, fontSize: '0.9rem' }}>
                <AlertTriangle size={16} />
                ¿Eliminar este pago?
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Se eliminará el registro de <strong style={{ color: 'var(--text-primary)' }}>
                  {MESES[pagoAEliminar.mes - 1]} {pagoAEliminar.anio}
                </strong> (${parseFloat(pagoAEliminar.monto).toFixed(2)}) y la fecha de vencimiento del cliente se recalculará automáticamente.
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setConfirmId(null)}
                  disabled={deleting}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-sm"
                  style={{ background: 'var(--danger)', color: '#fff', minWidth: '110px' }}
                  onClick={handleDeleteConfirmed}
                  disabled={deleting}
                >
                  {deleting ? 'Eliminando…' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          )}

          {/* Mensaje de error */}
          {errorMsg && (
            <div style={{
              margin: '0.75rem 1.5rem',
              padding: '0.75rem 1rem',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '10px',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              fontSize: '0.82rem',
              color: '#ef4444',
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {errorMsg}
            </div>
          )}

          {/* Lista de pagos */}
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Cargando historial…
            </div>
          ) : payments.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No hay pagos registrados para este cliente.
            </div>
          ) : (
            <div className="table-container" style={{ maxHeight: '380px', overflowY: 'auto' }}>
              <table className="data-table" style={{ border: 'none' }}>
                <thead>
                  <tr>
                    <th style={{ background: 'var(--bg-panel)' }}>Fecha pago</th>
                    <th style={{ background: 'var(--bg-panel)' }}>Periodo</th>
                    <th style={{ background: 'var(--bg-panel)' }}>Monto</th>
                    {pagoAEliminar && <th style={{ background: 'var(--bg-panel)' }} />}
                    {!pagoAEliminar && <th style={{ background: 'var(--bg-panel)', textAlign: 'right' }}>Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {payments.map(pago => (
                    <tr
                      key={pago.id}
                      style={{
                        opacity: confirmId && confirmId !== pago.id ? 0.4 : 1,
                        transition: 'opacity 0.2s',
                        background: confirmId === pago.id ? 'rgba(239,68,68,0.05)' : undefined,
                      }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                          <Calendar size={14} className="text-muted" />
                          {new Date(pago.fecha_pago + 'T12:00:00').toLocaleDateString('es-MX')}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                          {MESES[pago.mes - 1]} {pago.anio}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#10b981' }}>
                        ${parseFloat(pago.monto).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {confirmId !== pago.id && (
                          <button
                            className="btn btn-sm btn-ghost btn-icon-only"
                            onClick={() => { setConfirmId(pago.id); setErrorMsg(''); }}
                            style={{ color: 'var(--danger)' }}
                            title="Eliminar este pago"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        {confirmId === pago.id && (
                          <CheckCircle size={16} style={{ color: '#ef4444', marginRight: '0.5rem' }} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Nota informativa */}
          <div style={{
            padding: '0.9rem 1.5rem',
            background: 'rgba(245,158,11,0.05)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
          }}>
            <AlertCircle size={15} style={{ color: '#f59e0b', marginTop: '0.15rem', flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.73rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Al eliminar un pago, la fecha de vencimiento se recalcula desde los registros restantes. Úsalo solo para corregir errores.
            </p>
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '1.25rem 1.5rem' }}>
          <button className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default HistoryModal;
