import React from 'react';
import { Calendar, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export const FormVencimientosEditar = ({ formData, updateField }) => {
  const fechas = [
    { l: 'Pago de Seguro', f: 'fecha_pago_seguro' },
    { l: 'Ecológico', f: 'fecha_pago_ecologico' },
    { l: 'Placas', f: 'fecha_pago_placas' },
    { l: 'Próximo Mantenimiento', f: 'fecha_proximo_mantenimiento' }
  ];

  // Función simple para actualizar fechas sin sincronización automática
  const handleFechaChange = (campoCambiado, nuevaFecha) => {
    console.log('Fecha cambiada:', campoCambiado, 'Nuevo valor:', nuevaFecha);
    updateField(campoCambiado, nuevaFecha);
    // REMOVED: Auto-synchronization logic - now each date is independent
  };

  // Función interna para calcular el estado visual de la fecha
  const getFechaStatus = (fecha) => {
    if (!fecha) return { color: 'text-muted', icon: <Clock size={14} />, text: 'Pendiente' };
    
    const hoy = new Date();
    const fechaVenc = new Date(fecha);
    const diff = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));

    if (diff < 0) return { color: 'text-danger', icon: <AlertCircle size={14} />, text: 'Vencido' };
    if (diff <= 30) return { color: 'text-warning', icon: <AlertCircle size={14} />, text: 'Por vencer' };
    return { color: 'text-success', icon: <CheckCircle2 size={14} />, text: 'Al corriente' };
  };

  return (
    <div className="p-2">
      <div className="row g-4">
        {fechas.map(d => {
          const status = getFechaStatus(formData[d.f]);
          
          return (
            <div className="col-md-6 col-lg-3" key={d.f}>
              <div className={`p-3 rounded-4 border-2 border-start shadow-sm bg-white ${status.color.replace('text-', 'border-')}`} 
                   style={{ borderStyle: 'none none none solid' }}>
                
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label small fw-bold text-secondary mb-0">{d.l}</label>
                  <span className={`small fw-bold d-flex align-items-center gap-1 ${status.color}`}>
                    {status.icon} {status.text}
                  </span>
                </div>

                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <Calendar size={16} className="text-muted" />
                  </span>
                  <input 
                    type="date" 
                    className="form-control bg-light border-0 fw-bold" 
                    value={formData[d.f] || ''} 
                    onChange={(e) => handleFechaChange(d.f, e.target.value)} 
                  />
                </div>
                
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-light rounded-4 border-0">
        <p className="small text-muted mb-0">
          <strong>Tip:</strong> Las fechas en <span className="text-danger fw-bold">rojo</span> indican trámites que requieren atención inmediata.
        </p>
      </div>
    </div>
  );
};