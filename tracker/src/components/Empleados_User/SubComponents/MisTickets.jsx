import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { FileText, CheckCircle, Clock, PenLine, X, ChevronDown, ChevronUp, RefreshCw, TrendingDown, TrendingUp, Minus, AlertCircle } from 'lucide-react';
import { NOMINA_LISTAR_TICKETS_URL, NOMINA_FIRMAR_TICKET_URL, UPLOADS_BASE_URL } from '../../../config';
import { dataURLtoBlob } from '../../../utils/api';

// Resuelve una firma: puede ser ruta relativa (nueva) o base64 (legado)
const firmaUrl = (v) => {
  if (!v) return null;
  if (v.startsWith('data:') || v.startsWith('http') || v.length > 500) return v; // base64 / URL absoluta
  return `${UPLOADS_BASE_URL}${v}`;  // ruta relativa → uploads/firmas/...
};

const f = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v || 0);

const GUINDA = '#6b0f1a';

export default function MisTickets({ user }) {
  const [tickets, setTickets]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [firmando, setFirmando]   = useState(null); // ticket id en proceso de firma
  const [saving, setSaving]       = useState(false);
  const [expandido, setExpandido] = useState(null);
  const [error, setError]         = useState(null);
  const [exito, setExito]         = useState(null);
  const sigRef = useRef(null);

  const empId = user?.id;

  const fetchTickets = async () => {
    if (!empId) return;
    setLoading(true);
    try {
      const res = await fetch(`${NOMINA_LISTAR_TICKETS_URL}?empleado_id=${empId}`);
      const data = await res.json();
      if (data.status === 'success') setTickets(data.data || []);
    } catch (e) {
      setError('No se pudieron cargar los tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [empId]);

  // Pendiente = falta firma del empleado (el admin ya firmó al generar)
  const pendientes = tickets.filter(t => !t.firmado_at);
  // Completos = ambos firmaron
  const firmados   = tickets.filter(t => t.firmado_at);

  const handleFirmar = async (ticket) => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      setError('Debes firmar antes de confirmar.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const firma = sigRef.current.getCanvas().toDataURL('image/png');
      const firmaBlob = dataURLtoBlob(firma);
      const formData = new FormData();
      formData.append('ticket_id', ticket.id);
      formData.append('empleado_id', String(empId));
      if (firmaBlob) formData.append('firma_empleado', firmaBlob, 'firma_empleado.png');
      const res = await fetch(NOMINA_FIRMAR_TICKET_URL, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.status === 'success') {
        setExito('¡Ticket firmado correctamente!');
        setFirmando(null);
        await fetchTickets();
        setTimeout(() => setExito(null), 3000);
      } else {
        setError(data.message || 'Error al firmar.');
      }
    } catch (e) {
      setError('Error de conexión.');
    } finally {
      setSaving(false);
    }
  };

  // ── Detalle específico para Corte de Caja ──
  const CorteCajaDetalle = ({ ticket }) => {
    const dif = parseFloat(ticket.diferencia ?? 0);
    const deudaAnt = parseFloat(ticket.deuda_anterior ?? 0);
    const deudaTotal = deudaAnt + dif;
    const esAbono    = dif < -0.005 && deudaAnt > 0.005;
    const estado      = dif > 0.005 ? 'deuda' : dif < -0.005 ? (esAbono ? 'abono' : 'favor') : 'igual';

    return (
      <div className="mb-3" style={{ fontSize: 13 }}>
        {/* Alerta de deuda si aplica */}
        {deudaTotal > 0.005 && (
          <div className="rounded-3 p-2 mb-3 d-flex align-items-center gap-2"
            style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
            <AlertCircle size={15} style={{ color: '#ea580c' }} className="flex-shrink-0" />
            <span className="fw-bold" style={{ color: '#ea580c', fontSize: 12 }}>
              Saldo pendiente: {f(deudaTotal)}
            </span>
          </div>
        )}
        <div className="rounded-3 p-3" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
          <div className="d-flex flex-column gap-2">
            {[
              { label: 'Efectivo en app (neto)', value: ticket.utilidad_total, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
              { label: 'Propinas del período', value: ticket.propinas, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
              { label: 'Total entregado al admin', value: ticket.total_pago, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
            ].map((row) => (
              <div key={row.label} className="d-flex justify-content-between align-items-center py-2 px-3 rounded-3"
                style={{ background: row.bg, border: `1px solid ${row.border}` }}>
                <span className="fw-semibold" style={{ color: row.color }}>{row.label}</span>
                <span className="fw-bold" style={{ fontSize: 15, color: row.color }}>{f(row.value)}</span>
              </div>
            ))}

            {/* Diferencia */}
            <div className="d-flex justify-content-between align-items-center py-2 px-3 rounded-3"
              style={{
                background: estado === 'deuda' ? '#fef2f2' : estado === 'favor' ? '#f0fdf4' : '#f0f9ff',
                border: `1px solid ${estado === 'deuda' ? '#fca5a5' : estado === 'favor' ? '#86efac' : '#bae6fd'}`
              }}>
              <span className="d-flex align-items-center gap-1 fw-bold"
                style={{ color: estado === 'deuda' ? '#dc2626' : estado === 'favor' ? '#16a34a' : '#0ea5e9', fontSize: 12 }}>
                {estado === 'deuda' && <TrendingDown size={13} />}
                {(estado === 'favor' || estado === 'abono') && <TrendingUp size={13} />}
                {estado === 'igual' && <Minus size={13} />}
                {estado === 'deuda' ? 'Faltó entregar' : estado === 'abono' ? 'Abono a deuda' : estado === 'favor' ? 'Entregó de más' : 'Balanceado'}
              </span>
              <span className="fw-bold" style={{
                fontSize: 15,
                color: estado === 'deuda' ? '#dc2626' : estado === 'abono' ? '#d97706' : estado === 'favor' ? '#16a34a' : '#0ea5e9'
              }}>
                {(estado === 'favor' || estado === 'abono') ? '-' : ''}{f(Math.abs(dif))}
              </span>
            </div>

            {/* Deuda anterior si la hay */}
            {deudaAnt > 0.005 && (
              <div className="d-flex justify-content-between align-items-center py-1 px-3 rounded-3"
                style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                <span style={{ fontSize: 11, color: '#ea580c' }}>Deuda de períodos anteriores</span>
                <span className="fw-bold" style={{ fontSize: 12, color: '#ea580c' }}>{f(deudaAnt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const TicketCard = ({ ticket }) => {
    const adminFirmado = !!ticket.firma_admin_at;
    const firmado      = !!ticket.firmado_at;
    const completo     = adminFirmado && firmado;
    const expanded     = expandido === ticket.id;
    const esFirmando   = firmando === ticket.id;

    const borderColor  = completo ? '#86efac' : adminFirmado ? GUINDA + '80' : '#e2e8f0';
    const headerBg     = completo ? '#f0fdf4' : adminFirmado ? `${GUINDA}08` : '#f8fafc';

    return (
      <div className="rounded-4 mb-3 overflow-hidden"
        style={{ border: `1.5px solid ${borderColor}`, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>

        {/* Header ticket */}
        <div className="d-flex align-items-center justify-content-between px-4 py-3"
          style={{ background: headerBg, cursor: 'pointer' }}
          onClick={() => setExpandido(expanded ? null : ticket.id)}>
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 38, height: 38, background: completo ? '#dcfce7' : `${GUINDA}18` }}>
              {completo
                ? <CheckCircle size={18} style={{ color: '#16a34a' }} />
                : <Clock size={18} style={{ color: GUINDA }} />}
            </div>
            <div>
              <p className="fw-bold mb-0" style={{ fontSize: 14, color: '#0f172a' }}>
                {ticket.tipo === 'corte_caja' ? 'CORTE DE CAJA' : 'RECIBO DE NÓMINA'}
              </p>
              <p className="mb-0 text-muted" style={{ fontSize: 11 }}>{ticket.periodo}</p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
            {adminFirmado && (
              <span className="badge rounded-pill px-2 py-1" style={{ fontSize: 10, background: '#eff6ff', color: '#2563eb' }}>
                ✓ Admin
              </span>
            )}
            <span className="badge rounded-pill px-2 py-1" style={{
              fontSize: 10, background: firmado ? '#dcfce7' : `${GUINDA}18`,
              color: firmado ? '#16a34a' : GUINDA
            }}>
              {firmado ? '✓ Tú firmaste' : 'Pendiente tu firma'}
            </span>
            {expanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
          </div>
        </div>

        {/* Detalle expandido */}
        {expanded && (
          <div className="px-4 py-3" style={{ borderTop: '1px solid #f1f5f9' }}>
            {/* Desglose según tipo de ticket */}
            {ticket.tipo === 'corte_caja' ? (
              <CorteCajaDetalle ticket={ticket} />
            ) : (
            <div className="rounded-3 p-3 mb-3" style={{ background: '#f8fafc', fontSize: 13 }}>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between align-items-center py-2 px-3 rounded-3"
                  style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <span className="fw-semibold" style={{ color: '#15803d' }}>Efectivo generado</span>
                  <span className="fw-bold" style={{ fontSize: 16, color: '#16a34a' }}>{f(ticket.ingresos_brutos)}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center py-2 px-3 rounded-3"
                  style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <span className="fw-semibold" style={{ color: '#92400e' }}>Propinas</span>
                  <span className="fw-bold" style={{ fontSize: 16, color: '#d97706' }}>{f(ticket.propinas)}</span>
                </div>
              </div>
            </div>
            )}

            {/* Emisión y firma admin */}
            <p className="text-muted mb-3" style={{ fontSize: 11 }}>
              Emitido: {new Date(ticket.fecha_emision).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              {ticket.firmado_at && (
                <span className="ms-2 text-success">· Firmado: {new Date(ticket.firmado_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              )}
            </p>

            {/* Firma del empleado */}
            {firmado ? (
              <div className="text-center rounded-3 py-3" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
                <CheckCircle size={20} style={{ color: '#16a34a' }} className="mb-1" />
                <p className="mb-0 fw-bold" style={{ color: '#16a34a', fontSize: 13 }}>Recibo firmado y confirmado</p>
                {ticket.firma_empleado && (
                  <img src={firmaUrl(ticket.firma_empleado)} alt="Firma" style={{ maxHeight: 60, marginTop: 8, opacity: .7 }} />
                )}
              </div>
            ) : esFirmando ? (
              <div>
                <p className="fw-bold mb-2" style={{ fontSize: 13, color: '#0f172a' }}>
                  <PenLine size={14} className="me-1" /> Firma de confirmación
                </p>
                <div className="rounded-3 overflow-hidden mb-2" style={{ border: `1.5px solid ${GUINDA}40`, background: '#fafafa', height: 160 }}>
                  <SignatureCanvas
                    ref={sigRef}
                    penColor="#0f172a"
                    canvasProps={{ style: { width: '100%', height: '100%' }, className: 'sigCanvas' }}
                  />
                </div>
                <p className="text-muted mb-3" style={{ fontSize: 11 }}>
                  Firma para confirmar los montos del período {ticket.periodo}
                </p>
                {error && <div className="alert alert-danger py-2 mb-2 rounded-3" style={{ fontSize: 12 }}>{error}</div>}
                <div className="d-flex gap-2">
                  <button className="btn btn-sm rounded-pill px-3 flex-grow-1"
                    style={{ background: '#f1f5f9', color: '#475569', border: 'none', fontSize: 13 }}
                    onClick={() => { sigRef.current?.clear(); }}>
                    Limpiar
                  </button>
                  <button className="btn btn-sm rounded-pill px-3 flex-grow-1"
                    style={{ background: '#e2e8f0', color: '#475569', border: 'none', fontSize: 13 }}
                    onClick={() => { setFirmando(null); setError(null); }}>
                    <X size={13} /> Cancelar
                  </button>
                  <button className="btn btn-sm rounded-pill px-4 fw-bold flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                    style={{ background: GUINDA, color: '#fff', border: 'none', fontSize: 13 }}
                    disabled={saving}
                    onClick={() => handleFirmar(ticket)}>
                    {saving ? <span className="spinner-border spinner-border-sm" /> : <><CheckCircle size={13} /> Confirmar firma</>}
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn w-100 rounded-3 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                style={{ background: GUINDA, color: '#fff', border: 'none', fontSize: 14 }}
                onClick={() => { setFirmando(ticket.id); setExpandido(ticket.id); setError(null); }}>
                <PenLine size={16} /> Firmar recibo
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border" style={{ color: GUINDA }} role="status" />
      <p className="mt-2 text-muted">Cargando tickets...</p>
    </div>
  );

  return (
    <div className="animate__animated animate__fadeIn">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: '#0f172a' }}>
            <FileText size={20} style={{ color: GUINDA }} /> Mis Recibos de Nómina
          </h5>
          <p className="text-muted mb-0" style={{ fontSize: 12 }}>
            {pendientes.length > 0
              ? `${pendientes.length} ticket${pendientes.length > 1 ? 's' : ''} pendiente${pendientes.length > 1 ? 's' : ''} de firma`
              : 'Todos los tickets firmados'}
          </p>
        </div>
        <button className="btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
          style={{ background: '#f1f5f9', color: '#475569', border: 'none', fontSize: 12 }}
          onClick={fetchTickets}>
          <RefreshCw size={13} /> Actualizar
        </button>
      </div>

      {exito && (
        <div className="alert rounded-3 d-flex align-items-center gap-2 mb-3"
          style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a', fontSize: 13 }}>
          <CheckCircle size={16} /> {exito}
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="text-center py-5 rounded-4" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
          <FileText size={44} className="mb-3 opacity-25" style={{ color: GUINDA }} />
          <p className="fw-bold text-muted mb-1">Sin tickets emitidos</p>
          <p className="text-muted" style={{ fontSize: 12 }}>Aquí aparecerán los recibos de pago que te emita el administrador.</p>
        </div>
      ) : (
        <>
          {/* Pendientes */}
          {pendientes.length > 0 && (
            <div className="mb-4">
              <p className="fw-bold text-uppercase mb-2 d-flex align-items-center gap-2" style={{ fontSize: 11, color: GUINDA, letterSpacing: 1 }}>
                <Clock size={13} /> Pendientes de firma ({pendientes.length})
              </p>
              {pendientes.map(t => <TicketCard key={t.id} ticket={t} />)}
            </div>
          )}

          {/* Completos */}
          {firmados.length > 0 && (
            <div>
              <p className="fw-bold text-uppercase mb-2 d-flex align-items-center gap-2" style={{ fontSize: 11, color: '#16a34a', letterSpacing: 1 }}>
                <CheckCircle size={13} /> Completados – Ambas firmas ({firmados.length})
              </p>
              {firmados.map(t => <TicketCard key={t.id} ticket={t} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
