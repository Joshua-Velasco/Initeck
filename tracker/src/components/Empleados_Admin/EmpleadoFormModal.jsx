import { UserPlus, Save, Loader2, X, User, Phone, Lock, Calendar, Shield, Upload, FileText, Image } from 'lucide-react';
import React from 'react';
import { getRolLabel, initialFormState } from '../../constants/theme';
import { EMPLEADOS_UPLOADS_URL } from '../../config';

export const EmpleadoFormModal = ({
  formData = {},
  errors = {},
  isSubmitting = false,
  handleInputChange = () => { },
  handleSubmit = (e) => e.preventDefault(),
  onClose = () => { }
}) => {

  // CORRECCIÓN: Usamos un objeto que priorice formData pero asegure un string vacío para evitar el bloqueo de escritura
  const safeData = {
    ...initialFormState,
    ...formData
  };

  // Helper para resolver la URL del documento con cache-busting
  const resolveDocUrl = (fileName) => {
    if (!fileName || typeof fileName !== 'string' || fileName.includes('data:image')) return null;
    return `${EMPLEADOS_UPLOADS_URL}${fileName}?t=${Date.now()}`;
  };

  return (
    <div className="modal-content border-0 shadow-lg">
      <div className="modal-header border-0 bg-gradient-primary text-white rounded-top-4">
        <div className="d-flex align-items-center">
          <div className="bg-white bg-opacity-10 p-2 rounded-3 me-3">
            <UserPlus size={24} className="text-white" />
          </div>
          <div>
            <h5 className="modal-title fw-bold mb-0">{formData.id ? 'Editar' : 'Nuevo'} Empleado</h5>
            <small className="text-white-50">Complete la información del personal</small>
          </div>
        </div>
        <button
          type="button"
          className="btn-close btn-close-white"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Cerrar"
        ></button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="modal-body p-4">
          <div className="row g-4">
            {/* Sección de Información Básica */}
            <div className="col-12">
              <h6 className="fw-bold text-uppercase text-muted small mb-3">Información Personal</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Nombre Completo <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><User size={16} /></span>
                    <input
                      type="text"
                      className={`form-control ${errors.nombre_completo ? 'is-invalid' : ''}`} // Agregado: className para estilos y desbloqueo
                      name="nombre_completo"
                      value={safeData.nombre_completo || ''} // Corregido: value estable
                      onChange={handleInputChange}
                      placeholder="Ej. Juan Pérez López"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.nombre_completo && <div className="invalid-feedback d-block">{errors.nombre_completo}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Teléfono</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><Phone size={16} /></span>
                    <input
                      type="tel"
                      className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                      name="telefono"
                      value={safeData.telefono || ''} // Corregido: value estable
                      onChange={handleInputChange}
                      maxLength={10}
                      placeholder="(000) 000-0000"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Fecha de Ingreso</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><Calendar size={16} /></span>
                    <input
                      type="date"
                      className="form-control"
                      name="fecha_ingreso"
                      value={safeData.fecha_ingreso ? (safeData.fecha_ingreso.includes('T') ? safeData.fecha_ingreso.split('T')[0] : safeData.fecha_ingreso) : ''}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Estado</label>
                  <select
                    className="form-select"
                    name="estado"
                    value={safeData.estado || 'Activo'}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sección de Acceso al Sistema */}
            <div className="col-12 pt-3">
              <h6 className="fw-bold text-uppercase text-muted small mb-3">Acceso al Sistema</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Nombre de Usuario <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">@</span>
                    <input
                      type="text"
                      className={`form-control ${errors.usuario ? 'is-invalid' : ''}`}
                      name="usuario"
                      value={safeData.usuario || ''}
                      onChange={handleInputChange}
                      placeholder="nombre.usuario"
                      disabled={isSubmitting || !!formData.id}
                    />
                  </div>
                  {errors.usuario && <div className="invalid-feedback d-block">{errors.usuario}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">
                    {formData.id ? 'Nueva ' : ''}Contraseña {!formData.id && <span className="text-danger">*</span>}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><Lock size={16} /></span>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      name="password"
                      value={safeData.password || ''}
                      onChange={handleInputChange}
                      placeholder={formData.id ? 'Dejar en blanco para no cambiar' : '••••••••'}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Rol en el Sistema</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><Shield size={16} /></span>
                    <select
                      className="form-select"
                      name="rol"
                      value={safeData.rol || 'employee'}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    >
                      <option value="admin">Administrador</option>
                      <option value="operator">Operador / Chófer</option>
                      <option value="monitorista">Monitorista</option>
                      <option value="taller">Taller</option>
                      <option value="employee">Empleado General</option>
                      <option value="cleaning">Limpieza</option>
                      <option value="development">Desarrollo</option>
                    </select>
                  </div>
                  <small className="text-muted">Permisos: {getRolLabel(safeData.rol)}</small>
                </div>
              </div>
            </div>

            {/* Sección de Documentación */}
            <div className="col-12 pt-3">
              <h6 className="fw-bold text-uppercase text-muted small mb-3">Documentación</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Foto INE</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><Image size={16} /></span>
                    <input
                      type="file"
                      className={`form-control ${errors.foto_ine ? 'is-invalid' : ''}`}
                      name="foto_ine"
                      onChange={handleInputChange}
                      accept="image/*"
                      disabled={isSubmitting}
                    />
                  </div>
                  {safeData.foto_ine && typeof safeData.foto_ine === 'string' && (
                    <small className="text-muted d-block mt-1">
                      <a href={resolveDocUrl(safeData.foto_ine)} target="_blank" rel="noopener noreferrer" className="text-primary fw-bold">
                        <Upload size={14} className="me-1" /> Ver INE actual
                      </a>
                    </small>
                  )}
                  {errors.foto_ine && <div className="invalid-feedback d-block">{errors.foto_ine}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Foto CURP</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><Image size={16} /></span>
                    <input
                      type="file"
                      className={`form-control ${errors.foto_curp ? 'is-invalid' : ''}`}
                      name="foto_curp"
                      onChange={handleInputChange}
                      accept="image/*"
                      disabled={isSubmitting}
                    />
                  </div>
                  {safeData.foto_curp && typeof safeData.foto_curp === 'string' && (
                    <small className="text-muted d-block mt-1">
                      <a href={resolveDocUrl(safeData.foto_curp)} target="_blank" rel="noopener noreferrer" className="text-primary fw-bold">
                        <Upload size={14} className="me-1" /> Ver CURP actual
                      </a>
                    </small>
                  )}
                  {errors.foto_curp && <div className="invalid-feedback d-block">{errors.foto_curp}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Foto RFC</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><FileText size={16} /></span>
                    <input
                      type="file"
                      className={`form-control ${errors.foto_rfc ? 'is-invalid' : ''}`}
                      name="foto_rfc"
                      onChange={handleInputChange}
                      accept="image/*"
                      disabled={isSubmitting}
                    />
                  </div>
                  {safeData.foto_rfc && typeof safeData.foto_rfc === 'string' && (
                    <small className="text-muted d-block mt-1">
                      <a href={resolveDocUrl(safeData.foto_rfc)} target="_blank" rel="noopener noreferrer" className="text-primary fw-bold">
                        <Upload size={14} className="me-1" /> Ver RFC actual
                      </a>
                    </small>
                  )}
                  {errors.foto_rfc && <div className="invalid-feedback d-block">{errors.foto_rfc}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Foto Licencia de Conducir</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><Image size={16} /></span>
                    <input
                      type="file"
                      className={`form-control ${errors.foto_licencia ? 'is-invalid' : ''}`}
                      name="foto_licencia"
                      onChange={handleInputChange}
                      accept="image/*"
                      disabled={isSubmitting}
                    />
                  </div>
                  {safeData.foto_licencia && typeof safeData.foto_licencia === 'string' && (
                    <small className="text-muted d-block mt-1">
                      <a href={resolveDocUrl(safeData.foto_licencia)} target="_blank" rel="noopener noreferrer" className="text-primary fw-bold">
                        <Upload size={14} className="me-1" /> Ver Licencia actual
                      </a>
                    </small>
                  )}
                  {errors.foto_licencia && <div className="invalid-feedback d-block">{errors.foto_licencia}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer bg-light rounded-bottom-4 border-0 d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={18} className="me-1" /> Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary px-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin me-2" />
                Procesando...
              </>
            ) : (
              <>
                <Save size={18} className="me-2" />
                {formData.id ? 'Actualizar' : 'Guardar'} Empleado
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};