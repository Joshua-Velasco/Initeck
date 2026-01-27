import React from 'react';
import { Calendar } from 'lucide-react';

const CalendarioPagos = ({ vehiculoSeleccionado, externalEvents, onPrepararEdicion }) => {
  if (!vehiculoSeleccionado && !externalEvents) return <div className="text-center text-muted py-5 small bg-light rounded-4">Sin información de fechas</div>;

  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const rawEvents = externalEvents || (vehiculoSeleccionado ? [
    { fecha: vehiculoSeleccionado.fecha_pago_seguro, tipo: 'Seguro', color: '#3b82f6' },
    { fecha: vehiculoSeleccionado.fecha_pago_revalidacion, tipo: 'Revalidación', color: '#e11d48' },
    { fecha: vehiculoSeleccionado.fecha_pago_ecologico, tipo: 'Ecológico', color: '#10b981' },
    { fecha: vehiculoSeleccionado.fecha_pago_placas, tipo: 'Placas', color: '#8b5cf6' },
    { fecha: vehiculoSeleccionado.fecha_proximo_mantenimiento, tipo: 'Servicio', color: '#f59e0b' }
  ] : []);

  const eventos = rawEvents
    .filter(e => e.fecha && e.fecha !== "0000-00-00" && e.fecha !== "null" && e.fecha !== "")
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  return (
    <div className="d-grid gap-2">
      {eventos.length > 0 ? eventos.map((ev, idx) => {
        const fechaObj = new Date(ev.fecha + 'T00:00:00');
        return (
          <div key={idx}
            onClick={() => onPrepararEdicion && onPrepararEdicion(ev)}
            data-bs-toggle={onPrepararEdicion ? "modal" : ""}
            data-bs-target={onPrepararEdicion ? "#modalEditarFecha" : ""}
            className={`d-flex align-items-center p-3 rounded-3 border-start border-4 bg-white shadow-sm transition-all shadow-hover ${onPrepararEdicion ? 'cursor-pointer' : ''}`}
            style={{ borderLeftColor: ev.color || '#800020' }}>
            <div className="flex-grow-1">
              <span className="badge rounded-pill px-2 mb-1" style={{ backgroundColor: (ev.color || '#800020') + '20', color: ev.color || '#800020', fontSize: '0.6rem' }}>
                {(ev.tipo || 'EVENTO').toUpperCase()}
                {ev.unidad_nombre && <span className="ms-1 opacity-75">| {ev.unidad_nombre}</span>}
              </span>
              <div className="fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                <Calendar size={14} className="text-primary" />
                {fechaObj.getDate()} de {meses[fechaObj.getMonth()]}, {fechaObj.getFullYear()}
              </div>
            </div>
          </div>
        );
      }) : <div className="text-center py-4 text-muted small">Sin fechas próximas</div>}
    </div>
  );
};

export default CalendarioPagos;