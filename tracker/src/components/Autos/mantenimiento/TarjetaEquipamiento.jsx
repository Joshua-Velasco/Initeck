import React, { useState, useEffect } from 'react';
import { Wrench, Info } from 'lucide-react';

export default function TarjetaEquipamiento({ unidad, onRefresh }) {
  const [checklist, setChecklist] = useState({});

  useEffect(() => {
     if (unidad) {
        setChecklist({
           llanta_refaccion: unidad.llanta_refaccion,
           gato: unidad.gato,
           cruzeta: unidad.cruzeta,
           cables_corriente: unidad.cables_corriente
        });
     }
  }, [unidad]);

  const toggleItem = async (e, item) => {
     e.stopPropagation();
     const currentVal = checklist[item];
     const isChecked = currentVal === 'SÍ' || currentVal === 'YES' || currentVal === true || currentVal === '1';
     const newVal = !isChecked;
     
     // 1. Optimistic Update
     setChecklist(prev => ({ ...prev, [item]: newVal }));

     // 2. Server Update
     try {
        const { TALLER_EQUIPAMIENTO_URL } = await import('../../../config.js');
        await fetch(TALLER_EQUIPAMIENTO_URL, {
           method: 'POST',
           body: JSON.stringify({ unidad_id: unidad.id, [item]: newVal })
        });
        if (onRefresh) onRefresh();
     } catch(e) { 
        console.error(e); 
        setChecklist(prev => ({ ...prev, [item]: currentVal }));
        alert("Error al guardar cambio");
     }
  };

  if (!unidad) return null;

  return (
    <div className="card border-0 shadow-sm rounded-4 h-100 bg-white animate__animated animate__fadeIn" style={{ borderRadius: '24px', animationDelay: '0.2s' }}>
       <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0">
          <h5 className="fw-extrabold mb-0 d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
             <div className="p-2 rounded-3 bg-light"><Wrench size={20} className="text-secondary"/></div>
             Herramientas a Bordo
          </h5>
       </div>
       <div className="p-4">
          <label className="text-muted fw-bold mb-3 small text-uppercase d-block letter-spacing-1">CHECKLIST DE SALIDA</label>
          <div className="d-flex flex-column gap-3">
             {['llanta_refaccion', 'gato', 'cruzeta', 'cables_corriente'].map((item) => {
                const labels = {
                  'llanta_refaccion': 'Llanta Refacción',
                  'gato': 'Gato Hidráulico',
                  'cruzeta': 'Llave Cruz',
                  'cables_corriente': 'Cables Corriente'
                };
                
                const rawVal = checklist[item];
                const isChecked = rawVal === 'SÍ' || rawVal === 'YES' || rawVal === true || rawVal === '1' || rawVal === 1;

                return (
                   <div key={item} 
                        className="d-flex align-items-center justify-content-between p-3 rounded-4 transition-all"
                        style={{ backgroundColor: isChecked ? '#f0fdf4' : '#fef2f2', border: isChecked ? '1px solid #bbf7d0' : '1px solid #fecaca' }}
                   >
                      <span className={`fw-bold d-flex align-items-center gap-3 ${isChecked ? 'text-success' : 'text-danger'}`} style={{fontSize: '1rem'}}>
                         {isChecked ? <div className="bg-success rounded-circle shadow-sm" style={{width:12, height:12}}/> : <div className="bg-danger rounded-circle shadow-sm" style={{width:12, height:12}}/>}
                         {labels[item]}
                      </span>
                      <div className="form-check form-switch m-0" style={{ transform: 'scale(1.3)', marginRight: '5px' }}>
                         <input 
                           className="form-check-input shadow-sm" 
                           type="checkbox" 
                           checked={isChecked} 
                           onChange={(e) => toggleItem(e, item)} 
                           style={{cursor: 'pointer'}} 
                         />
                      </div>
                   </div>
                );
             })}
          </div>
          
          <div className="mt-4 p-3 bg-light rounded-4 text-muted small">
             <Info size={16} className="mb-1 me-1"/>
             Verifica visualmente que cada herramienta esté presente antes de marcar.
          </div>
       </div>
    </div>
  );
}
