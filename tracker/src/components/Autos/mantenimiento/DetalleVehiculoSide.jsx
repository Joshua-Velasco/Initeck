<<<<<<< HEAD
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
=======
import React from 'react';
import { Info, Gauge, Droplets, Disc, Settings, CarFront, Calendar, User, Wrench, Battery, CreditCard, FileText, Leaf } from 'lucide-react';

export default function DetalleVehiculoSide({ unidad }) {
  if (!unidad) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white" style={{ minHeight: '400px', background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)' }}>
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
        <div className="bg-primary bg-opacity-10 rounded-circle p-4 mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
          <CarFront size={32} className="text-primary" />
        </div>
        <h6 className="fw-bold text-muted mb-2">Sin Unidad Seleccionada</h6>
        <p className="small text-muted">Selecciona una unidad para ver su ficha técnica y estado actual</p>
      </div>
    );
  }

<<<<<<< HEAD
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

=======
  // Especificaciones técnicas basadas en los campos reales de la BD
  const especificaciones = [
    { label: 'Motor', value: unidad.motor_tipo || 'No especificado', icon: <Settings size={16}/> },
    { label: 'Tipo de Aceite', value: unidad.aceite_tipo || 'No especificado', icon: <Droplets size={16}/> },
    { label: 'Filtro de Aceite', value: unidad.filtro_aceite || 'No especificado', icon: <Info size={16}/> },
    { label: 'Bujías', value: unidad.bujias_tipo || 'No especificado', icon: <Gauge size={16}/> },
    { label: 'Medida Llantas', value: unidad.llantas_medida || 'No especificado', icon: <Disc size={16}/> },
  ];

  return (
    <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white sticky-top" style={{ top: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
      {/* Header de la Tarjeta */}
      <div className="bg-gradient-primary text-white p-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="badge bg-white text-primary fw-bold mb-2 px-3 py-1 rounded-pill" style={{ fontSize: '0.75rem' }}>
            {unidad.placas}
          </span>
        </div>
        <h4 className="fw-black mb-1" style={{ fontSize: '1.25rem' }}>{unidad.unidad_nombre}</h4>
        <p className="small mb-0 opacity-75 d-flex align-items-center gap-2">
          <Settings size={14} />
          {unidad.modelo} {unidad.modelo_anio || ''}
        </p>
      </div>

      <div className="card-body p-0">
        {/* Información General */}
        <div className="p-4 border-bottom bg-light" style={{ background: 'linear-gradient(to right, #f8fafc, #ffffff)' }}>
          <h6 className="text-uppercase small fw-black text-muted mb-3 d-flex align-items-center gap-2">
            <Info size={14} className="text-primary" />
            Información General
          </h6>
          <div className="row g-3">
            <div className="col-6">
              <div className="d-flex align-items-center gap-2 p-2 rounded-3 bg-white">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                  <Calendar size={12} className="text-primary" />
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.65rem' }}>Año</div>
                  <div className="fw-bold small">{unidad.modelo_anio || 'N/A'}</div>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex align-items-center gap-2 p-2 rounded-3 bg-white">
                <div className="bg-success bg-opacity-10 rounded-circle p-2">
                  <Gauge size={12} className="text-success" />
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.65rem' }}>Kilometraje</div>
                  <div className="fw-bold small">{unidad.kilometraje_actual ? unidad.kilometraje_actual.toLocaleString() + ' km' : 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Especificaciones Técnicas */}
        <div className="p-4">
          <h6 className="text-uppercase small fw-black text-muted mb-3 d-flex align-items-center gap-2">
            <Settings size={14} className="text-primary" />
            Especificaciones Técnicas
          </h6>
          <div className="d-flex flex-column gap-2">
            {especificaciones.map((item, idx) => (
              <div key={idx} className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light hover-light transition-all" style={{ background: 'linear-gradient(to right, #f8fafc, #ffffff)' }}>
                <div className="bg-primary bg-opacity-10 p-2 rounded-2 text-primary">
                  {item.icon}
                </div>
                <div className="flex-grow-1">
                  <div className="text-muted fw-bold" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                  <div className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Último Mantenimiento */}
        {unidad.ultimo_mantenimiento && (
          <div className="p-4 mt-2 bg-success bg-opacity-10 border-top border-success" style={{ background: 'linear-gradient(to right, #f0fdf4, #ffffff)' }}>
            <h6 className="text-uppercase small fw-black text-success mb-3 d-flex align-items-center gap-2">
              <Wrench size={14} className="text-success" />
              Último Mantenimiento
            </h6>
            <div className="bg-white p-3 rounded-3">
              <div className="fw-bold text-success mb-1">{unidad.ultimo_mantenimiento.tipo}</div>
              <div className="text-muted small mb-1">{new Date(unidad.ultimo_mantenimiento.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              <div className="text-muted small">Km: {unidad.ultimo_mantenimiento.kilometraje?.toLocaleString() || 'N/A'}</div>
            </div>
          </div>
        )}

        {/* Próximos Servicios Programados */}
        <div className="p-4 mt-2 bg-info bg-opacity-10 border-top" style={{ background: 'linear-gradient(to right, #f0f9ff, #ffffff)' }}>
          <h6 className="text-uppercase small fw-black text-info mb-3 d-flex align-items-center gap-2">
            <Calendar size={14} className="text-info" />
            Próximos Servicios
          </h6>
          <div className="d-flex flex-column gap-2">
            {unidad.fecha_pago_seguro && (
              <div className="d-flex align-items-center gap-3 p-3 bg-white rounded-3 transition-all hover-scale">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                  <CreditCard size={16} className="text-primary" />
                </div>
                <div className="flex-grow-1">
                  <div className="fw-bold small text-dark">Seguro</div>
                  <div className="text-muted small">{new Date(unidad.fecha_pago_seguro + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                </div>
              </div>
            )}

            {unidad.fecha_pago_revalidacion && (
              <div className="d-flex align-items-center gap-3 p-3 bg-white rounded-3 transition-all hover-scale">
                <div className="bg-success bg-opacity-10 rounded-circle p-2">
                  <FileText size={16} className="text-success" />
                </div>
                <div className="flex-grow-1">
                  <div className="fw-bold small text-dark">Revalidación</div>
                  <div className="text-muted small">{new Date(unidad.fecha_pago_revalidacion + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                </div>
              </div>
            )}

            {unidad.fecha_pago_ecologico && (
              <div className="d-flex align-items-center gap-3 p-3 bg-white rounded-3 transition-all hover-scale">
                <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                  <Leaf size={16} className="text-warning" />
                </div>
                <div className="flex-grow-1">
                  <div className="fw-bold small text-dark">Ecológica</div>
                  <div className="text-muted small">{new Date(unidad.fecha_pago_ecologico + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                </div>
              </div>
            )}

            {unidad.fecha_proximo_mantenimiento && (
              <div className="d-flex align-items-center gap-3 p-3 bg-white rounded-3 transition-all hover-scale">
                <div className="bg-danger bg-opacity-10 rounded-circle p-2">
                  <Wrench size={16} className="text-danger" />
                </div>
                <div className="flex-grow-1">
                  <div className="fw-bold small text-dark">Mantenimiento</div>
                  <div className="text-muted small">{new Date(unidad.fecha_proximo_mantenimiento + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                </div>
              </div>
            )}

            {!unidad.fecha_pago_seguro && !unidad.fecha_pago_revalidacion && !unidad.fecha_pago_ecologico && !unidad.fecha_proximo_mantenimiento && (
              <div className="text-center text-muted small p-4">
                <div className="bg-info bg-opacity-10 rounded-circle p-3 mx-auto mb-2" style={{ width: '60px', height: '60px' }}>
                  <Calendar size={24} className="text-info" />
                </div>
                <p className="mb-0 fw-semibold">No hay fechas programadas</p>
                <p className="mb-0 small">Los próximos servicios aparecerán aquí</p>
              </div>
            )}
          </div>
        </div>
      </div>
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
    </div>
  );
}