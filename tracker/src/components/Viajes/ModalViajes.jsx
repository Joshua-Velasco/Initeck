import React from 'react';
import { Navigation, MapPin, Save, Play, Square, Info } from 'lucide-react';

export default function ViajeModal({ 
  formData, 
  setFormData, 
  handleSubmit, 
  empleados, 
  vehiculos, 
  colorGuinda,
  isTracking,
  handleToggleTracking,
  puntosCapturados
}) {
  return (
    <div className="modal fade" id="modalViaje" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          
          {/* Header del Modal */}
          <div className="modal-header text-white" style={{ backgroundColor: colorGuinda }}>
            <h5 className="modal-title fw-bold">Registrar Nuevo Trayecto</h5>
            <button type="button" id="btnCerrar" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              
              {/* SECCIÓN DE RASTREO GPS */}
              <div className="card border-0 bg-light mb-4">
                <div className="card-body text-center">
                  <h6 className="fw-bold mb-3">Control de Rastreo en Tiempo Real</h6>
                  <button 
                    type="button" 
                    onClick={handleToggleTracking} 
                    className={`btn ${isTracking ? 'btn-danger' : 'btn-success'} px-4 py-2 fw-bold shadow-sm`}
                  >
                    {isTracking ? (
                      <><Square size={18} className="me-2"/> Detener Rastreo</>
                    ) : (
                      <><Play size={18} className="me-2"/> Iniciar Rastreo GPS</>
                    )}
                  </button>
                  {isTracking && (
                    <div className="mt-2 animate__animated animate__pulse animate__infinite">
                      <span className="badge bg-danger">REC • Capturando ruta ({puntosCapturados} puntos)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="row g-3">
                {/* Selección de Personal y Unidad */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">Operador Responsable</label>
                  <select 
                    className="form-select border-0 bg-light" 
                    required 
                    value={formData.empleado_id}
                    onChange={e => setFormData({...formData, empleado_id: e.target.value})}
                  >
                    <option value="">Seleccionar empleado...</option>
                    {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre_completo}</option>)}
                  </select>
                </div>
                
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">Unidad Asignada</label>
                  <select 
                    className="form-select border-0 bg-light" 
                    required 
                    value={formData.vehiculo_id}
                    onChange={e => setFormData({...formData, vehiculo_id: e.target.value})}
                  >
                    <option value="">Seleccionar vehículo...</option>
                    {vehiculos.map(v => <option key={v.id} value={v.id}>{v.unidad_nombre} - {v.placas}</option>)}
                  </select>
                </div>

                {/* Ruta */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">
                    <Navigation size={14} className="me-1"/> Punto de Origen
                  </label>
                  <input 
                    type="text" 
                    className="form-control border-0 bg-light" 
                    placeholder="Ej. Sede Initeck Juárez"
                    required 
                    value={formData.origen} 
                    onChange={e => setFormData({...formData, origen: e.target.value})}
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">
                    <MapPin size={14} className="me-1"/> Punto de Destino
                  </label>
                  <input 
                    type="text" 
                    className="form-control border-0 bg-light" 
                    placeholder="Ej. Cliente Planta 1"
                    required 
                    value={formData.destino} 
                    onChange={e => setFormData({...formData, destino: e.target.value})}
                  />
                </div>

                {/* Finanzas y KM */}
                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted text-uppercase">Costo del Viaje</label>
                  <div className="input-group">
                    <span className="input-group-text border-0 bg-light">$</span>
                    <input 
                      type="number" 
                      className="form-control border-0 bg-light" 
                      required 
                      value={formData.monto_total}
                      onChange={e => setFormData({...formData, monto_total: e.target.value})}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted text-uppercase">Distancia (KM)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    className="form-control border-0 bg-light" 
                    placeholder="0.0"
                    value={formData.kilometros_recorridos}
                    onChange={e => setFormData({...formData, kilometros_recorridos: e.target.value})}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold text-muted text-uppercase">Método de Pago</label>
                  <select 
                    className="form-select border-0 bg-light"
                    value={formData.metodo_pago}
                    onChange={e => setFormData({...formData, metodo_pago: e.target.value})}
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold text-muted text-uppercase">Notas Adicionales</label>
                  <textarea 
                    className="form-control border-0 bg-light" 
                    rows="2"
                    value={formData.notas}
                    onChange={e => setFormData({...formData, notas: e.target.value})}
                  ></textarea>
                </div>
              </div>

              <div className="mt-3 p-2 bg-info-subtle rounded d-flex align-items-center">
                <Info size={18} className="text-info me-2"/>
                <small className="text-info-emphasis">
                  Al guardar, se actualizarán los totales del empleado y el kilometraje del vehículo automáticamente.
                </small>
              </div>
            </div>

            {/* Footer con botón de acción */}
            <div className="modal-footer bg-light border-0">
              <button 
                type="submit" 
                className="btn text-white px-5 fw-bold shadow-sm" 
                style={{ backgroundColor: colorGuinda }}
                disabled={isTracking} // Evita guardar si el GPS sigue activo
              >
                <Save size={18} className="me-2"/> Finalizar y Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}