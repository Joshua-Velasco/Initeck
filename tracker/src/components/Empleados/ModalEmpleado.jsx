import React from 'react';
import { Save, User, FileUp, Truck, Phone, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export default function ModalEmpleado({ modalRef, editData, setEditData, guardarCambios, alert, colorGuinda, vehiculos = [] }) {
  
  // FILTROS DE ENTRADA
  const handleNombreChange = (e) => {
    const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '');
    setEditData({ ...editData, nombre_completo: val });
  };

  const handleTelefonoChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setEditData({ ...editData, telefono: val });
  };

  return (
    <div className="modal fade" id="modalEmpleado" tabIndex="-1" ref={modalRef} aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 rounded-4 overflow-hidden">
          
          {/* Header */}
          <div className="modal-header border-0 text-white p-3" style={{ backgroundColor: colorGuinda }}>
            <div className="d-flex align-items-center gap-3">
              <div className="bg-white bg-opacity-25 p-2 rounded-3">
                <User size={20} />
              </div>
              <div>
                <h6 className="modal-title fw-bold mb-0">
                  {editData.id ? 'Editar Perfil de Operador' : 'Registro de Nuevo Operador'}
                </h6>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          
          <form onSubmit={guardarCambios}>
            <div className="modal-body p-4 bg-white">
              {alert?.show && (
                <div className={`alert alert-${alert.type} border-0 d-flex align-items-center gap-2 mb-4 small`}>
                  {alert.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  <span>{alert.msg}</span>
                </div>
              )}

              <div className="row g-3">
                <div className="col-12">
                  <h6 className="text-muted fw-bold small text-uppercase mb-0">Información General</h6>
                  <hr className="mt-1 mb-2 opacity-25" />
                </div>
                
                <div className="col-md-8">
                  <label className="form-label small fw-bold">Nombre Completo</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-end-0"><User size={16}/></span>
                    <input type="text" className="form-control bg-light border-start-0" required
                      value={editData.nombre_completo || ''} onChange={handleNombreChange} 
                      placeholder="Ej. Juan Pérez García" />
                  </div>
                </div>
                
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Teléfono</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-end-0"><Phone size={16}/></span>
                    <input type="text" className="form-control bg-light border-start-0"
                      value={editData.telefono || ''} onChange={handleTelefonoChange} 
                      placeholder="6561234567" />
                  </div>
                </div>

                <div className="col-md-5">
                  <label className="form-label small fw-bold">Unidad Asignada</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-end-0"><Truck size={16}/></span>
                    {/* Se eliminó 'required' para permitir que sea opcional */}
                    <select className="form-select bg-light border-start-0"
                      value={editData.unidad_id || ''}
                      onChange={e => setEditData({...editData, unidad_id: e.target.value})}>
                      <option value="">-- Sin unidad asignada --</option>
                      {vehiculos.map(v => (
                        <option key={v.id} value={v.id}>{v.unidad_nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-bold">Estatus</label>
                  <select className="form-select form-select-sm bg-light" value={editData.estado || 'Activo'}
                    onChange={e => setEditData({...editData, estado: e.target.value})}>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-bold">Fecha de Alta</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-end-0"><Calendar size={16}/></span>
                    <input type="date" className="form-control bg-light border-start-0"
                      required max={new Date().toISOString().split("T")[0]}
                      value={editData.fecha_ingreso || ''} 
                      onChange={e => setEditData({...editData, fecha_ingreso: e.target.value})} />
                  </div>
                </div>

                <div className="col-12 mt-3">
                  <h6 className="text-muted fw-bold small text-uppercase mb-0">Documentación</h6>
                  <hr className="mt-1 mb-2 opacity-25" />
                </div>
                
                <div className="col-md-6">
                  <div className={`p-2 border rounded-3 bg-light text-center ${editData.ine_archivo ? 'border-success' : 'border-dashed'}`}>
                    <label className="small fw-bold d-block mb-1">INE (JPG/PDF)</label>
                    <input type="file" id="fileIne" className="form-control form-control-sm border-0" accept=".jpg,.jpeg,.png,.pdf" />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className={`p-2 border rounded-3 bg-light text-center ${editData.licencia_archivo ? 'border-success' : 'border-dashed'}`}>
                    <label className="small fw-bold d-block mb-1">Licencia (JPG/PDF)</label>
                    <input type="file" id="fileLicencia" className="form-control form-control-sm border-0" accept=".jpg,.jpeg,.png,.pdf" />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light border-0 p-3">
              <button type="button" className="btn btn-sm btn-outline-secondary px-3" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" className="btn btn-sm text-white px-4 fw-bold" style={{ backgroundColor: colorGuinda }}>
                <Save size={16} className="me-2"/>
                {editData.id ? 'Actualizar' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}