import React from 'react';
import { Calendar, Gauge, CreditCard, FileText, Leaf, Wrench, AlertTriangle } from 'lucide-react';

export default function TarjetaCiclo({ unidad, alertas = [], notas = [] }) {
  if (!unidad) return null;

  return (
    <div className="card border-0 shadow-sm rounded-4 h-100 bg-white animate__animated animate__fadeIn" style={{ borderRadius: '24px', animationDelay: '0.1s' }}>
       <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0">
          <h5 className="fw-extrabold mb-0 d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
             <div className="p-2 rounded-3 bg-light"><Calendar size={20} className="text-primary"/></div>
             Ciclo de Mantenimiento
          </h5>
       </div>
       
       <div className="p-4">
          {unidad.ultimo_mantenimiento && (
             <div className="mb-4">
                <label className="text-muted fw-bold mb-2 text-uppercase letter-spacing-1" style={{fontSize: '0.8rem'}}>ÚLTIMO SERVICIO</label>
                <div className="bg-success bg-opacity-10 p-3 rounded-4 border-start border-4 border-success">
                   <div className="d-flex justify-content-between align-items-start mb-2">
                       <div className="fw-bold text-dark" style={{fontSize: '1rem'}}>{unidad.ultimo_mantenimiento.tipo}</div>
                       <div className="text-muted d-flex align-items-center gap-1 fw-bold" style={{fontSize: '0.85rem'}}>
                          <Gauge size={14}/> {unidad.ultimo_mantenimiento.kilometraje?.toLocaleString()} {unidad.unidad_medida === 'mi' ? 'mi' : 'km'}
                       </div>
                   </div>
                   
                   {/* Description */}
                   <p className="mb-2 text-dark opacity-100 lh-sm text-truncate" style={{maxWidth: '100%', fontSize: '0.95rem'}}>
                      {unidad.ultimo_mantenimiento.descripcion || 'Sin detalles registrados.'}
                   </p>

                   <div className="d-flex align-items-center justify-content-between pt-2 border-top border-success border-opacity-25">
                       <div className="text-muted d-flex align-items-center gap-2" style={{fontSize: '0.85rem'}}>
                          <Calendar size={14}/> {new Date(unidad.ultimo_mantenimiento.fecha).toLocaleDateString('es-MX', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                       </div>
                       {unidad.ultimo_mantenimiento.costo_total > 0 && (
                          <div className="fw-bold text-success bg-white px-2 py-1 rounded-pill border border-success border-opacity-25 shadow-sm" style={{fontSize: '0.85rem'}}>
                             ${parseFloat(unidad.ultimo_mantenimiento.costo_total).toLocaleString()}
                          </div>
                       )}
                   </div>
                </div>
             </div>
          )}

          <label className="text-muted fw-bold mb-3 text-uppercase d-block letter-spacing-1" style={{fontSize: '0.8rem'}}>PRÓXIMOS VENCIMIENTOS</label>
          <div className="d-flex flex-column gap-3">
            {[
              { label: 'Seguro', date: unidad.fecha_pago_seguro, icon: <CreditCard size={20}/>, color: 'primary', isAlert: false },
              { label: 'Placas', date: unidad.fecha_pago_revalidacion, icon: <FileText size={20}/>, color: 'success', isAlert: false },
              { label: 'Ecológico', date: unidad.fecha_pago_ecologico, icon: <Leaf size={20}/>, color: 'success', isAlert: false },
              { label: 'Mantenimiento', date: unidad.fecha_proximo_mantenimiento, icon: <Wrench size={20}/>, color: 'warning', isAlert: false },
              ...alertas.map(a => ({ label: a.titulo, date: a.fecha, icon: <AlertTriangle size={20}/>, color: 'danger', isAlert: true }))
            ]
            .filter(item => item.date)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 6)
            .map((item, i) => {
               return (
                   <div key={i} className={`d-flex justify-content-between align-items-center p-3 border-bottom ${item.isAlert ? 'bg-warning bg-opacity-10 rounded-3 border-warning' : ''}`}>
                      <span className={`text-${item.color} d-flex align-items-center gap-3 fw-bold`} style={{fontSize: '1rem'}}>
                         {item.icon} {item.label}
                      </span>
                      <span className={`fw-bold ${item.isAlert ? 'text-danger' : 'text-dark w-100 text-end'}`} style={{fontSize: '1rem'}}>
                         {new Date(item.date + (item.date.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('es-MX', {day:'2-digit', month:'short'})}
                      </span>
                   </div>
               );
            })}

            {!unidad.fecha_pago_seguro && !unidad.fecha_proximo_mantenimiento && alertas.length === 0 && (
               <div className="text-center py-4 text-muted fst-italic bg-light rounded-4 fs-6">Sin fechas pendientes</div>
            )}
          </div>

          {/* Notas Compactas */}
          {notas && notas.length > 0 && (
             <div className="mt-4 pt-4 border-top">
                <label className="text-muted fw-bold mb-3 text-uppercase d-block letter-spacing-1" style={{fontSize: '0.8rem'}}>NOTAS RECIENTES</label>
                <div className="d-flex flex-column gap-2">
                   {notas.slice(0, 3).map(nota => {
                      const noteColor = {
                        yellow: '#fef3c7', blue: '#dbeafe', green: '#dcfce7', pink: '#fce7f3'
                      }[nota.color || 'yellow'];

                      return (
                        <div key={nota.id} className="p-3 rounded-3 d-flex align-items-start gap-2" style={{ backgroundColor: noteColor }}>
                           <div className="mt-1"><FileText size={16} className="opacity-50" color="#000"/></div>
                           <div className="flex-grow-1" style={{ fontSize: '0.9rem', lineHeight: '1.3' }}>
                              <span className="fw-bold d-block text-dark opacity-75 mb-1" style={{fontSize: '0.75rem'}}>
                                  {new Date(nota.fecha_creacion).toLocaleDateString()}
                              </span>
                              <span className="text-dark opacity-100">{nota.nota}</span>
                           </div>
                        </div>
                      );
                   })}
                   {notas.length > 3 && (
                      <div className="text-center mt-2">
                          <span className="badge bg-light text-muted border fst-italic shadow-sm fs-6">+ {notas.length - 3} más</span>
                      </div>
                   )}
                </div>
             </div>
          )}
       </div>
    </div>
  );
}
