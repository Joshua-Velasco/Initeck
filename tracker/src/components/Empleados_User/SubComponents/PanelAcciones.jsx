import React from 'react';
import { Receipt, MessageSquare, FileText, DollarSign } from 'lucide-react';

export default function PanelAcciones({ onSetTab, activeTab, ticketsPendientes = 0 }) {
  const isActive = (tab) => activeTab === tab;

  return (
    <div className="card border-0 shadow-sm p-3 rounded-4 bg-white mb-4">
      <div className="d-flex flex-wrap gap-3 justify-content-center">

        {/* BOTÓN REGISTRAR INGRESO - VERDE */}
        <button
          onClick={() => onSetTab('liquidacion')}
          className="btn text-white px-4 py-3 fw-bold rounded-4 shadow-sm border-0 flex-grow-1 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: '#198754',
            opacity: isActive('liquidacion') ? 1 : 0.75,
            transform: isActive('liquidacion') ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.2s ease'
          }}
        >
          <DollarSign size={22} className="me-2" />
          REGISTRAR INGRESO
        </button>

        {/* BOTÓN REGISTRAR GASTO - AMARILLO */}
        <button
          onClick={() => onSetTab('gasto')}
          className="btn text-dark px-4 py-3 fw-bold rounded-4 shadow-sm border-0 flex-grow-1 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: '#ffc107',
            opacity: isActive('gasto') ? 1 : 0.75,
            transform: isActive('gasto') ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.2s ease'
          }}
        >
          <Receipt size={22} className="me-2 text-dark" />
          REGISTRAR GASTO
        </button>

        {/* BOTÓN MENSAJE TALLER - AZUL */}
        <button
          onClick={() => onSetTab('mensaje_taller')}
          className="btn text-white px-4 py-3 fw-bold rounded-4 shadow-sm border-0 flex-grow-1 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: '#0d6efd',
            opacity: isActive('mensaje_taller') ? 1 : 0.75,
            transform: isActive('mensaje_taller') ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.2s ease'
          }}
        >
          <MessageSquare size={22} className="me-2" />
          MENSAJE TALLER
        </button>

        {/* BOTÓN MIS TICKETS - GUINDA */}
        <button
          onClick={() => onSetTab('tickets')}
          className="btn text-white px-4 py-3 fw-bold rounded-4 shadow-sm border-0 flex-grow-1 d-flex align-items-center justify-content-center position-relative"
          style={{
            backgroundColor: '#6b0f1a',
            opacity: isActive('tickets') ? 1 : 0.75,
            transform: isActive('tickets') ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.2s ease'
          }}
        >
          <FileText size={22} className="me-2" />
          MIS TICKETS
          {ticketsPendientes > 0 && (
            <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-warning text-dark"
              style={{ fontSize: 11, fontWeight: 800, minWidth: 22 }}>
              {ticketsPendientes}
            </span>
          )}
        </button>

      </div>
    </div>
  );
}