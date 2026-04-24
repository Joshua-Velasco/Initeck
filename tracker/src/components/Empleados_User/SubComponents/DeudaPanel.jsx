import React from 'react';
import { TrendingDown, TrendingUp, Minus, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';

const f = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v ?? 0);
const fDate = (s) => {
  if (!s) return '—';
  // Soporta "2026-04-20 15:30:00" y "2026-04-20"
  const clean = String(s).replace(' ', 'T').split('T')[0];
  return new Date(clean + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function DeudaPanel({ tickets = [] }) {
  const cortes = tickets.filter(t => t.tipo === 'corte_caja');

  // Deuda total = suma de todas las diferencias
  const deudaTotal = cortes.reduce((sum, t) => sum + parseFloat(t.diferencia ?? 0), 0);
  const pendientesFirma = cortes.filter(t => !t.firmado_at).length;
  const recientes = [...cortes]
    .sort((a, b) => new Date(b.fecha_emision) - new Date(a.fecha_emision))
    .slice(0, 5);

  const estadoDeuda = deudaTotal > 0.005 ? 'deuda' : deudaTotal < -0.005 ? 'favor' : 'al_corriente';

  const colorMap = {
    deuda:        { text: '#dc2626', bg: '#fef2f2', border: '#fca5a5', label: 'Saldo pendiente',  icon: TrendingDown },
    favor:        { text: '#16a34a', bg: '#f0fdf4', border: '#86efac', label: 'A tu favor',        icon: TrendingUp   },
    al_corriente: { text: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd', label: 'Al corriente',      icon: CheckCircle  },
  };
  const estado = colorMap[estadoDeuda];
  const EstadoIcon = estado.icon;

  if (cortes.length === 0) return null;

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 d-flex align-items-center justify-content-between"
        style={{ borderBottom: '1px solid #f1f5f9' }}>
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-3 d-flex align-items-center justify-content-center"
            style={{ width: 34, height: 34, background: estado.bg, border: `1.5px solid ${estado.border}` }}>
            <EstadoIcon size={16} style={{ color: estado.text }} />
          </div>
          <div>
            <h6 className="fw-black mb-0" style={{ fontSize: 14, color: '#0f172a' }}>Mis Deudas</h6>
            <p className="mb-0" style={{ fontSize: 11, color: '#94a3b8' }}>
              {cortes.length} corte{cortes.length !== 1 ? 's' : ''} registrado{cortes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {pendientesFirma > 0 && (
          <span className="d-flex align-items-center gap-1 rounded-pill px-3 py-1 fw-bold"
            style={{ background: '#fffbeb', border: '1px solid #fde68a', fontSize: 11, color: '#d97706' }}>
            <Clock size={11} /> {pendientesFirma} sin firmar
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Tarjeta de saldo total */}
        <div className="rounded-4 p-3 mb-4 d-flex align-items-center justify-content-between"
          style={{ background: estado.bg, border: `1.5px solid ${estado.border}` }}>
          <div>
            <p className="mb-1 fw-bold text-uppercase" style={{ fontSize: 10, color: estado.text, letterSpacing: '0.07em' }}>
              {estado.label}
            </p>
            <p className="mb-0 fw-black" style={{ fontSize: 28, color: estado.text, letterSpacing: '-1px' }}>
              {f(Math.abs(deudaTotal))}
            </p>
          </div>
          <EstadoIcon size={40} style={{ color: estado.text, opacity: 0.2 }} />
        </div>

        {/* Lista de cortes recientes */}
        <p className="fw-bold text-uppercase mb-2" style={{ fontSize: 10, color: '#94a3b8', letterSpacing: '0.07em' }}>
          Historial reciente
        </p>
        <div className="d-flex flex-column gap-2">
          {recientes.map((t, i) => {
            const dif      = parseFloat(t.diferencia    ?? 0);
            const deudaAnt = parseFloat(t.deuda_anterior ?? 0);
            const adminFirmo  = !!t.firma_admin_at;
            const choferFirmo = !!t.firmado_at;

            // Si diferencia < 0 y había deuda anterior → es pago de deuda, no "entregó de más"
            const esPagoDeuda = dif < -0.005 && deudaAnt > 0.005;
            const est = dif > 0.005 ? 'deuda' : esPagoDeuda ? 'pago' : dif < -0.005 ? 'favor' : 'igual';

            const estColor = {
              deuda: { text: '#dc2626', bg: '#fef2f2', border: '#fca5a5', icon: TrendingDown, label: 'Faltó entregar',   prefix: '+' },
              favor: { text: '#16a34a', bg: '#f0fdf4', border: '#86efac', icon: TrendingUp,   label: 'Entregaste de más', prefix: '-' },
              pago:  { text: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: CheckCircle,  label: 'Pago de deuda',    prefix: ''  },
              igual: { text: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd', icon: Minus,        label: 'Balanceado',       prefix: ''  },
            }[est];
            const Icon = estColor.icon;

            return (
              <div key={i} className="d-flex align-items-center gap-3 rounded-3 p-3"
                style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 34, height: 34, background: estColor.bg, border: `1.5px solid ${estColor.border}` }}>
                  <Icon size={14} style={{ color: estColor.text }} />
                </div>
                <div className="flex-grow-1 min-w-0">
                  <p className="mb-0 fw-semibold" style={{ fontSize: 13, color: '#0f172a' }}>
                    {t.periodo || fDate(t.fecha_emision)}
                  </p>
                  <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>{fDate(t.fecha_emision)}</span>
                    {adminFirmo && (
                      <span className="rounded-pill px-2 fw-bold d-flex align-items-center gap-1"
                        style={{ fontSize: 9, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                        <CheckCircle size={8} /> Admin
                      </span>
                    )}
                    <span className="rounded-pill px-2 fw-bold d-flex align-items-center gap-1"
                      style={{ fontSize: 9, background: choferFirmo ? '#f0fdf4' : '#fffbeb', color: choferFirmo ? '#16a34a' : '#d97706', border: `1px solid ${choferFirmo ? '#86efac' : '#fde68a'}` }}>
                      {choferFirmo ? <CheckCircle size={8} /> : <Clock size={8} />}
                      {choferFirmo ? 'Firmado' : 'Pendiente tu firma'}
                    </span>
                  </div>
                </div>
                <div className="text-end flex-shrink-0">
                  <p className="mb-0 fw-black" style={{ fontSize: 14, color: estColor.text }}>
                    {estColor.prefix}{f(Math.abs(dif))}
                  </p>
                  <p className="mb-0" style={{ fontSize: 9, color: '#94a3b8' }}>
                    {estColor.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {deudaTotal > 0.005 && (
          <div className="mt-3 rounded-3 p-3 d-flex align-items-start gap-2"
            style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
            <AlertTriangle size={14} style={{ color: '#ea580c', flexShrink: 0, marginTop: 1 }} />
            <p className="mb-0 fw-semibold" style={{ fontSize: 12, color: '#9a3412' }}>
              Tienes un saldo pendiente de <strong>{f(deudaTotal)}</strong>. Se descontará en tu próximo corte.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
