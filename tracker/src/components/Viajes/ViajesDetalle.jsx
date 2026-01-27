import React from 'react';
import { MapPin, Navigation, DollarSign, FileText, Image as ImageIcon } from 'lucide-react';
import { UPLOADS_BASE_URL } from '../../config.js';

export default function ViajeDetalle({ viaje, colorGuinda }) {
  const API_BASE_WITHOUT_V1 = UPLOADS_BASE_URL.replace('v1/uploads/', '');
  return (
    <div className="row g-3 p-2 animate__animated animate__fadeIn">
      {/* Ruta del Viaje */}
      <div className="col-md-6">
        <div className="card border-0 shadow-sm p-3">
          <h6 className="text-muted small fw-bold mb-3"><Navigation size={16} /> RUTA DEL TRAYECTO</h6>
          <div className="position-relative ps-4 border-start border-2 ms-2">
            <div className="mb-3">
              <MapPin size={14} className="position-absolute start-0 translate-middle-x text-success" style={{ left: '-1px' }} />
              <div className="small fw-bold">Origen</div>
              <div className="text-muted small">{viaje.origen}</div>
            </div>
            <div>
              <MapPin size={14} className="position-absolute start-0 translate-middle-x text-danger" style={{ left: '-1px' }} />
              <div className="small fw-bold">Destino</div>
              <div className="text-muted small">{viaje.destino}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Desglose Financiero y Notas */}
      <div className="col-md-3">
        <div className="card border-0 shadow-sm p-3 h-100">
          <h6 className="text-muted small fw-bold mb-3"><DollarSign size={16} /> DESGLOSE</h6>
          <div className="d-flex justify-content-between mb-1">
            <span className="small text-muted">Tarifa:</span>
            <span className="small fw-bold">${viaje.monto_total}</span>
          </div>
          <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
            <span className="small text-muted">Propina:</span>
            <span className="small text-success">+${viaje.propina}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span className="small fw-bold">Total:</span>
            <span className="fw-bold" style={{ color: colorGuinda }}>${(parseFloat(viaje.monto_total) + parseFloat(viaje.propina)).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="col-md-3">
        <div className="card border-0 shadow-sm p-3 h-100">
          <h6 className="text-muted small fw-bold mb-3"><FileText size={16} /> NOTAS Y EVIDENCIA</h6>
          <p className="small text-muted italic mb-2">"{viaje.notas || 'Sin observaciones'}"</p>
          {viaje.foto_evidencia_url && (
            <a href={`${UPLOADS_BASE_URL.replace('v1/uploads/', '')}${viaje.foto_evidencia_url}`} target="_blank" className="btn btn-sm btn-outline-dark w-100 mt-auto">
              <ImageIcon size={14} className="me-1" /> Ver Comprobante
            </a>
          )}
        </div>
      </div>
    </div>
  );
}