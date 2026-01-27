import React from 'react';
import { Siren, Wallet, Receipt } from 'lucide-react';

export default function PanelAcciones({ onSetTab, activeTab }) {
  // Función para determinar si el botón está activo
  const isActive = (tab) => activeTab === tab;

  return (
    <div className="card border-0 shadow-sm p-3 rounded-4 bg-white mb-4">
      <div className="d-flex flex-wrap gap-3 justify-content-center">
        
        {/* BOTÓN REPORTAR INGRESOS - VERDE */}
        <button 
          onClick={() => onSetTab('liquidacion')} 
          className="btn text-white px-4 py-3 fw-bold rounded-4 shadow-sm border-0 flex-grow-1 d-flex align-items-center justify-content-center" 
          style={{ 
            backgroundColor: '#198754', // Verde Success
            opacity: isActive('liquidacion') ? 1 : 0.75,
            transform: isActive('liquidacion') ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.2s ease'
          }}
        >
          <Wallet size={22} className="me-2" />
          REPORTAR INGRESOS
        </button>

        {/* BOTÓN REGISTRAR GASTO - AMARILLO */}
        <button 
          onClick={() => onSetTab('gasto')} 
          className="btn text-dark px-4 py-3 fw-bold rounded-4 shadow-sm border-0 flex-grow-1 d-flex align-items-center justify-content-center" 
          style={{ 
            backgroundColor: '#ffc107', // Amarillo Warning
            opacity: isActive('gasto') ? 1 : 0.75,
            transform: isActive('gasto') ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.2s ease'
          }}
        >
          <Receipt size={22} className="me-2 text-dark" />
          REGISTRAR GASTO
        </button>

        
      </div>
    </div>
  );
}