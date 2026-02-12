import React, { useState, useEffect } from 'react';
import { Info, Gauge, Droplets, Disc, Settings, CarFront, Calendar, User, Wrench, Battery, CreditCard, FileText, Leaf, BookOpen, Activity, AlertTriangle } from 'lucide-react';
import NotasVehiculo from './NotasVehiculo';

export default function DetalleVehiculoSide({ unidad, alertas = [], onEstadoChange, onManualOpen, onRefresh }) {
  // Optimistic state for checklist
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
     e.stopPropagation(); // prevent bubbling if needed
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
        // 3. Refresh Parent Data
        if (onRefresh) onRefresh();
     } catch(e) { 
        console.error(e); 
        // Revert on error
        setChecklist(prev => ({ ...prev, [item]: currentVal }));
        alert("Error al guardar cambio");
     }
  };

  if (!unidad) {
     /* ... unchanged ... */
    return (
      <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white" style={{ minHeight: '200px', background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)' }}>
        <div className="bg-primary bg-opacity-10 rounded-circle p-4 mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
          <CarFront size={32} className="text-primary" />
        </div>
        <h6 className="fw-bold text-muted mb-2">Sin Unidad Seleccionada</h6>
        <p className="small text-muted">Selecciona una unidad para ver su ficha técnica y estado actual</p>
      </div>
    );
  }

  /* ... unchanged ... */
  // Especificaciones técnicas (Safe access)
  const especificaciones = unidad ? [
    { label: 'Motor', value: unidad.motor_tipo || 'No especificado', icon: <Settings size={16}/> },
    { label: 'Aceite', value: unidad.aceite_tipo || 'No especificado', icon: <Droplets size={16}/> },
    { label: 'Llantas', value: unidad.llantas_medida || 'No especificado', icon: <Disc size={16}/> },
  ] : [];

  return (
    <div className="row g-4 animate__animated animate__fadeInUp">
      
      {unidad && (
        <>
      {/* TARJETA 1: INFORMACIÓN GENERAL Y ESTADO */}
      <div className="col-12 col-lg-4">
        <div className="card border-0 shadow-sm h-100 overflow-hidden bg-white animate__animated animate__fadeInUp" style={{ borderRadius: '24px' }}>
          <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0">
             <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="badge bg-light text-dark fw-bold px-3 py-2 rounded-pill fs-6 border shadow-sm">{unidad.placas}</span>
                <span className="opacity-75 fs-6 fw-bold text-muted"><Settings size={16} className="me-1"/> {unidad.modelo_anio}</span>
             </div>
             <h3 className="fw-extrabold mb-0 text-dark" style={{ color: '#1e293b' }}>{unidad.unidad_nombre}</h3>
             <p className="text-muted small mb-0 mt-1" style={{ fontSize: '11px' }}>Ficha técnica y estado</p>
          </div>

          <div className="px-4 pt-4 pb-0">
             <div className="row g-2">
                {especificaciones.map((spec, idx) => (
                   <div key={idx} className="col-4 text-center">
                      <div className="bg-light p-3 rounded-4 h-100 d-flex flex-column align-items-center justify-content-center border-0">
                         <div className="text-secondary mb-2">{React.cloneElement(spec.icon, { size: 20 })}</div>
                         <div className="fw-bold text-dark text-truncate w-100" style={{fontSize: '0.85rem'}}>{spec.value}</div>
                         <div className="text-muted small text-uppercase" style={{fontSize: '0.7rem'}}>{spec.label}</div>
                      </div>
                   </div>
                ))}
            </div>
          </div>
          
          <div className="p-4">
             <label className="text-muted fw-bold mb-2 small text-uppercase d-block letter-spacing-1">ESTADO ACTUAL</label>
             <select 
                className="form-select form-select-lg border-0 bg-light fw-bold text-center mb-4 py-3 fs-6 rounded-4 shadow-sm"
                value={unidad.estado}
                onChange={(e) => onEstadoChange && onEstadoChange(e.target.value)}
                style={{
                  color: unidad.estado === 'Activo' ? 'var(--bs-success)' :
                         unidad.estado === 'En Taller' ? 'var(--bs-warning)' : 'var(--bs-secondary)'
                }}
              >
                <option value="Activo">🟢 Activo</option>
                <option value="En Taller">🟠 En Taller</option>
                <option value="Mantenimiento">🟡 Mantenimiento</option>
                <option value="Baja">🔴 Baja</option>
              </select>

             <div className="d-flex align-items-center gap-3 p-3 rounded-4 bg-light mb-4 shadow-sm border-0">
                <div className="bg-white rounded-circle p-3 shadow-sm">
                   <Gauge size={24} className="text-success" />
                </div>
                <div>
                   <div className="text-muted small fw-bold text-uppercase">Kilometraje Actual</div>
                   <div className="fw-extrabold fs-4 text-dark">{unidad.kilometraje_actual ? unidad.kilometraje_actual.toLocaleString() : 0} <span className="fs-6 text-muted fw-normal">{unidad.unidad_medida === 'mi' ? 'mi' : 'km'}</span></div>
                </div>
             </div>

             <button 
                onClick={onManualOpen} 
                className="btn btn-outline-dark w-100 rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-2 fs-6 hover-scale shadow-sm"
             >
                <BookOpen size={20}/> VER MANUAL DE USUARIO
             </button>
          </div>
        </div>
      </div>

      {/* TARJETA 2: MANTENIMIENTOS Y FECHAS */}
      <div className="col-12 col-lg-4">
         <div className="card border-0 shadow-sm rounded-4 h-100 bg-white animate__animated animate__fadeInUp" style={{ borderRadius: '24px', animationDelay: '0.1s' }}>
            <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0">
               <h5 className="fw-extrabold mb-0 d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
                  <div className="p-2 rounded-3 bg-light"><Calendar size={20} className="text-primary"/></div>
                  Ciclo de Mantenimiento
               </h5>
            </div>
            
            <div className="p-4">
               {unidad.ultimo_mantenimiento && (
                  <div className="mb-4">
                     <label className="text-muted fw-bold mb-2 small text-uppercase letter-spacing-1">ÚLTIMO SERVICIO</label>
                     <div className="bg-success bg-opacity-10 p-4 rounded-4 border-start border-4 border-success">
                        <div className="fw-bold text-dark fs-5 mb-1">{unidad.ultimo_mantenimiento.tipo}</div>
                        <div className="text-muted d-flex align-items-center gap-2 small">
                           <Calendar size={14}/> {new Date(unidad.ultimo_mantenimiento.fecha).toLocaleDateString()}
                        </div>
                        <div className="text-muted d-flex align-items-center gap-2 mt-1 small">
                           <Gauge size={14}/> {unidad.ultimo_mantenimiento.kilometraje?.toLocaleString()} {unidad.unidad_medida === 'mi' ? 'mi' : 'km'}
                        </div>
                     </div>
                  </div>
               )}

               <label className="text-muted fw-bold mb-3 small text-uppercase d-block letter-spacing-1">PRÓXIMOS VENCIMIENTOS</label>
               <div className="d-flex flex-column gap-3">
                 {[
                   { label: 'Seguro', date: unidad.fecha_pago_seguro, icon: <CreditCard size={18}/>, color: 'primary', isAlert: false },
                   { label: 'Placas', date: unidad.fecha_pago_revalidacion, icon: <FileText size={18}/>, color: 'success', isAlert: false },
                   { label: 'Ecológico', date: unidad.fecha_pago_ecologico, icon: <Leaf size={18}/>, color: 'success', isAlert: false },
                   { label: 'Mantenimiento', date: unidad.fecha_proximo_mantenimiento, icon: <Wrench size={18}/>, color: 'warning', isAlert: false },
                   ...alertas.map(a => ({ label: a.titulo, date: a.fecha, icon: <AlertTriangle size={18}/>, color: 'danger', isAlert: true }))
                 ]
                 .filter(item => item.date)
                 .sort((a, b) => new Date(a.date) - new Date(b.date))
                 .slice(0, 6)
                 .map((item, i) => {
                    return (
                        <div key={i} className={`d-flex justify-content-between align-items-center p-3 border-bottom ${item.isAlert ? 'bg-warning bg-opacity-10 rounded-3 border-warning' : ''}`}>
                           <span className={`text-${item.color} d-flex align-items-center gap-3 fw-bold fs-6`}>
                              {item.icon} {item.label}
                           </span>
                           <span className={`fw-bold fs-6 ${item.isAlert ? 'text-danger' : 'text-dark w-100 text-end'}`}>
                              {new Date(item.date + (item.date.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('es-MX', {day:'2-digit', month:'short'})}
                           </span>
                        </div>
                    );
                 })}

                 {!unidad.fecha_pago_seguro && !unidad.fecha_proximo_mantenimiento && alertas.length === 0 && (
                    <div className="text-center py-4 text-muted fst-italic bg-light rounded-4">Sin fechas pendientes</div>
                 )}
               </div>
            </div>
         </div>
      </div>

      {/* TARJETA 3: EQUIPAMIENTO Y SPECS */}
      <div className="col-12 col-lg-4">
         <div className="card border-0 shadow-sm rounded-4 h-100 bg-white animate__animated animate__fadeInUp" style={{ borderRadius: '24px', animationDelay: '0.2s' }}>
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
      </div>
      </>
      )}

      {/* SECCIÓN NOTAS (width 100%) */}
      <div className="col-12">
        <NotasVehiculo unidad={unidad} />
      </div>

    </div>
  );
}