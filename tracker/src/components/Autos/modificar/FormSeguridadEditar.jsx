import React from 'react';
import { Briefcase, ShieldCheck, ShieldAlert } from 'lucide-react';

export const FormSeguridadEditar = ({ formData, updateField }) => {
  const items = [
    { key: 'llanta_refaccion', label: 'Llanta de Refacción' },
    { key: 'cables_corriente', label: 'Cables de Corriente' },
    { key: 'gato', label: 'Gato / Manivela' },
    { key: 'cruzeta', label: 'Cruceta' },
  ];

  return (
    <div className="p-2">
      <div className="d-flex align-items-center mb-4">
        <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
          <Briefcase size={20} className="text-primary" />
        </div>
        <h6 className="fw-bold mb-0 text-uppercase small tracking-wide">
          Inventario de Equipo de Seguridad
        </h6>
      </div>
      
      <div className="row g-3">
        {items.map(acc => {
          // Aseguramos que el valor sea exactamente "SÍ" o "NO"
          const value = formData[acc.key] === "SÍ" ? "SÍ" : "NO";
          const isYes = value === "SÍ";

          return (
            <div key={acc.key} className="col-md-6">
              <div 
                className={`d-flex align-items-center justify-content-between p-3 rounded-4 border transition-all ${
                  isYes 
                    ? 'bg-white border-success shadow-sm' 
                    : 'bg-light border-secondary border-opacity-10'
                }`}
              >
                <div className="d-flex align-items-center">
                  {isYes 
                    ? <ShieldCheck size={20} className="text-success me-3" /> 
                    : <ShieldAlert size={20} className="text-muted me-3" />
                  }
                  <span className={`fw-bold small ${isYes ? 'text-dark' : 'text-secondary'}`}>
                    {acc.label}
                  </span>
                </div>
                
                <div style={{ width: '100px' }}>
                  <select 
                    className={`form-select form-select-sm border-0 fw-bold rounded-3 ${
                      isYes ? 'bg-success text-white' : 'bg-secondary bg-opacity-10 text-secondary'
                    }`}
                    value={value}
                    onChange={e => updateField(acc.key, e.target.value)}
                    style={{ cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    <option value="SÍ">Lleva</option>
                    <option value="NO">No lleva</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-4 bg-warning bg-opacity-10 border border-warning border-opacity-20">
        <div className="d-flex gap-2">
          <ShieldAlert size={18} className="text-warning flex-shrink-0" />
          <p className="small text-dark mb-0">
            <strong>Revisión de Inventario:</strong> Verifique físicamente que la unidad cuente con las herramientas marcadas como <strong>"SÍ"</strong> antes de liberar el vehículo.
          </p>
        </div>
      </div>
    </div>
  );
};