import React, { useState, useRef, useEffect } from 'react';
import {
  UserPlus, Save, Loader2, X, User, Phone, Lock,
  Calendar, Shield, FileText, Camera, Eye, CheckCircle2
} from 'lucide-react';
import { getRolLabel, initialFormState } from '../../constants/theme';
import { EMPLEADOS_UPLOADS_URL } from '../../config';

/* ─── Helper: resuelve URL de archivo guardado ─── */
const resolveDocUrl = (fileName) => {
  if (!fileName || typeof fileName !== 'string' || fileName.startsWith('data:')) return null;
  return `${EMPLEADOS_UPLOADS_URL}${fileName}?t=${Date.now()}`;
};

/* ─── Subcomponente: zona de carga de documento ─── */
const DocUpload = ({ name, label, currentFile, onChange, disabled }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const serverUrl = resolveDocUrl(currentFile);
  const thumb = preview || serverUrl;
  const hasFile = !!thumb;

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onChange(e);
    }
  };

  return (
    <div className="d-flex flex-column gap-1">
      <label className="form-label small fw-semibold text-dark mb-1" style={{ fontSize: 12 }}>{label}</label>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        className="position-relative rounded-3 border d-flex align-items-center justify-content-center overflow-hidden"
        style={{
          height: 86,
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: hasFile ? '#f8fafc' : '#f1f5f9',
          borderColor: hasFile ? '#10b981' : '#cbd5e1',
          borderStyle: hasFile ? 'solid' : 'dashed',
          transition: 'all .2s',
        }}
      >
        {hasFile ? (
          <>
            <img src={thumb} alt={label}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center gap-1 doc-overlay"
              style={{ background: 'rgba(15,23,42,.6)', opacity: 0, transition: 'opacity .2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}>
              <Camera size={16} color="white" />
              <span style={{ color: 'white', fontSize: 10, fontWeight: 600 }}>Cambiar</span>
            </div>
            <span className="position-absolute top-0 end-0 m-1 badge bg-success p-1 rounded-pill" style={{ lineHeight: 1 }}>
              <CheckCircle2 size={9} />
            </span>
          </>
        ) : (
          <div className="text-center text-muted" style={{ pointerEvents: 'none', padding: '0 8px' }}>
            <FileText size={18} className="mb-1 opacity-40" />
            <div style={{ fontSize: 10, fontWeight: 600 }}>Subir archivo</div>
          </div>
        )}
        <input ref={inputRef} type="file" name={name}
          accept="image/*,application/pdf"
          className="d-none" onChange={handleChange} disabled={disabled} />
      </div>
      {hasFile && serverUrl && !preview && (
        <a href={serverUrl} target="_blank" rel="noopener noreferrer"
          className="d-flex align-items-center gap-1 text-primary fw-semibold"
          style={{ fontSize: 10 }} onClick={e => e.stopPropagation()}>
          <Eye size={10} /> Ver actual
        </a>
      )}
    </div>
  );
};

/* ─── Separador de sección ─── */
const SectionTitle = ({ icon: Icon, label, color = 'primary' }) => (
  <div className="d-flex align-items-center gap-2 mb-3">
    <div className={`bg-${color} bg-opacity-10 rounded-2 p-1`} style={{ lineHeight: 1 }}>
      <Icon size={13} className={`text-${color}`} />
    </div>
    <span className="fw-bold text-uppercase text-muted" style={{ fontSize: 10, letterSpacing: 1 }}>
      {label}
    </span>
    <hr className="flex-grow-1 my-0 ms-1" />
  </div>
);

/* ─── Componente principal ─── */
export const EmpleadoFormModal = ({
  formData = {},
  errors = {},
  isSubmitting = false,
  handleInputChange = () => {},
  handleSubmit = (e) => e.preventDefault(),
  onClose = () => {},
}) => {
  const safeData = { ...initialFormState, ...formData };
  if (!safeData.fecha_ingreso || safeData.fecha_ingreso === '0000-00-00') {
    safeData.fecha_ingreso = initialFormState.fecha_ingreso;
  }
  const isEdit = !!formData.id;

  const [perfilPreview, setPerfilPreview] = useState(null);
  const perfilInputRef = useRef(null);

  useEffect(() => { setPerfilPreview(null); }, [formData.id]);

  const serverPerfil = resolveDocUrl(safeData.foto_perfil);
  const perfilSrc = perfilPreview || serverPerfil;

  const handlePerfilChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPerfilPreview(URL.createObjectURL(file));
      handleInputChange(e);
    }
  };

  const ROLES_OPTIONS = [
    { value: 'admin',       label: 'Administrador' },
    { value: 'operator',    label: 'Operador / Chófer' },
    { value: 'monitorista', label: 'Monitorista' },
    { value: 'taller',      label: 'Taller' },
    { value: 'employee',    label: 'Empleado General' },
    { value: 'cleaning',    label: 'Limpieza' },
    { value: 'development', label: 'Desarrollo' },
  ];

  return (
    <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 20, overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div className="d-flex align-items-center justify-content-between px-4 py-3"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center bg-white bg-opacity-10 rounded-3"
            style={{ width: 44, height: 44 }}>
            <UserPlus size={21} color="white" strokeWidth={2.2} />
          </div>
          <div>
            <h5 className="fw-bold text-white mb-0" style={{ fontSize: 17 }}>
              {isEdit ? 'Editar Empleado' : 'Nuevo Empleado'}
            </h5>
            <p className="text-white-50 mb-0" style={{ fontSize: 11 }}>
              Complete la información del personal
            </p>
          </div>
        </div>
        <button type="button" className="btn-close btn-close-white"
          onClick={onClose} disabled={isSubmitting} />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="modal-body p-0" style={{ maxHeight: '70vh', overflowY: 'auto' }}>

          {/* ── Foto de perfil ── */}
          <div className="d-flex flex-column align-items-center py-4"
            style={{ background: 'linear-gradient(180deg, #1e293b 60%, #f8fafc 100%)' }}>
            <div className="position-relative">
              <div
                onClick={() => !isSubmitting && perfilInputRef.current?.click()}
                className="rounded-circle overflow-hidden border border-3 border-white shadow"
                style={{ width: 92, height: 92, cursor: 'pointer', background: '#334155' }}>
                {perfilSrc ? (
                  <img src={perfilSrc} alt="Perfil"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                    <User size={38} color="#64748b" />
                  </div>
                )}
              </div>
              <button type="button"
                onClick={() => !isSubmitting && perfilInputRef.current?.click()}
                className="btn btn-sm btn-dark rounded-circle position-absolute d-flex align-items-center justify-content-center p-0"
                style={{ width: 26, height: 26, bottom: 0, right: 0, border: '2px solid white' }}>
                <Camera size={12} />
              </button>
              <input ref={perfilInputRef} type="file" name="foto_perfil"
                accept="image/*" className="d-none"
                onChange={handlePerfilChange} disabled={isSubmitting} />
            </div>
            <p className="mb-0 mt-2" style={{ color: 'rgba(255,255,255,.5)', fontSize: 11 }}>
              {perfilSrc ? 'Haz clic para cambiar la foto' : 'Agregar foto de perfil'}
            </p>
          </div>

          <div className="px-4 pb-4 pt-3">

            {/* ── Información Personal ── */}
            <div className="mb-4">
              <SectionTitle icon={User} label="Información Personal" color="primary" />
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Nombre Completo <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-end-0">
                      <User size={14} className="text-muted" />
                    </span>
                    <input type="text"
                      className={`form-control border-start-0 ${errors.nombre_completo ? 'is-invalid' : ''}`}
                      style={{ borderRadius: '0 8px 8px 0' }}
                      name="nombre_completo" value={safeData.nombre_completo || ''}
                      onChange={handleInputChange} placeholder="Ej. Juan Pérez López"
                      disabled={isSubmitting} />
                  </div>
                  {errors.nombre_completo && (
                    <div className="text-danger mt-1" style={{ fontSize: 11 }}>{errors.nombre_completo}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark mb-1">Teléfono</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-end-0">
                      <Phone size={14} className="text-muted" />
                    </span>
                    <input type="tel"
                      className="form-control border-start-0"
                      style={{ borderRadius: '0 8px 8px 0' }}
                      name="telefono" value={safeData.telefono || ''}
                      onChange={handleInputChange} maxLength={10}
                      placeholder="(000) 000-0000" disabled={isSubmitting} />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark mb-1">Fecha de Ingreso</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-end-0">
                      <Calendar size={14} className="text-muted" />
                    </span>
                    <input type="date"
                      className="form-control border-start-0"
                      style={{ borderRadius: '0 8px 8px 0' }}
                      name="fecha_ingreso"
                      value={(() => {
                        const d = safeData.fecha_ingreso;
                        if (!d || d === '0000-00-00') return '';
                        return d.includes('T') ? d.split('T')[0] : d;
                      })()}
                      onChange={handleInputChange} disabled={isSubmitting} />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark mb-1">Estado</label>
                  <select className="form-select form-select-sm" style={{ borderRadius: 8 }}
                    name="estado" value={safeData.estado || 'Activo'}
                    onChange={handleInputChange} disabled={isSubmitting}>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── Acceso al Sistema ── */}
            <div className="mb-4">
              <SectionTitle icon={Shield} label="Acceso al Sistema" color="warning" />
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Nombre de Usuario <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-end-0 fw-bold" style={{ fontSize: 13 }}>@</span>
                    <input type="text"
                      className={`form-control border-start-0 ${errors.usuario ? 'is-invalid' : ''}`}
                      style={{ borderRadius: '0 8px 8px 0', background: isEdit ? '#f8fafc' : undefined }}
                      name="usuario" value={safeData.usuario || ''}
                      onChange={handleInputChange} placeholder="nombre.usuario"
                      disabled={isSubmitting || isEdit} />
                  </div>
                  {isEdit && (
                    <p className="text-muted mb-0 mt-1" style={{ fontSize: 10 }}>
                      El usuario no puede cambiarse
                    </p>
                  )}
                  {errors.usuario && <div className="text-danger mt-1" style={{ fontSize: 11 }}>{errors.usuario}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    {isEdit ? 'Nueva Contraseña' : <>Contraseña <span className="text-danger">*</span></>}
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-end-0">
                      <Lock size={14} className="text-muted" />
                    </span>
                    <input type="password"
                      className={`form-control border-start-0 ${errors.password ? 'is-invalid' : ''}`}
                      style={{ borderRadius: '0 8px 8px 0' }}
                      name="password" value={safeData.password || ''}
                      onChange={handleInputChange}
                      placeholder={isEdit ? 'Dejar en blanco para no cambiar' : '••••••••'}
                      disabled={isSubmitting} />
                  </div>
                  {errors.password && <div className="text-danger mt-1" style={{ fontSize: 11 }}>{errors.password}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark mb-1">Rol en el Sistema</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-end-0">
                      <Shield size={14} className="text-muted" />
                    </span>
                    <select className="form-select border-start-0"
                      style={{ borderRadius: '0 8px 8px 0' }}
                      name="rol" value={safeData.rol || 'employee'}
                      onChange={handleInputChange} disabled={isSubmitting}>
                      {ROLES_OPTIONS.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-muted mb-0 mt-1" style={{ fontSize: 10 }}>
                    Permisos: {getRolLabel(safeData.rol)}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Documentación ── */}
            <div>
              <SectionTitle icon={FileText} label="Documentación" color="success" />
              <div className="row g-3">
                {[
                  { name: 'foto_ine',      label: 'INE' },
                  { name: 'foto_curp',     label: 'CURP' },
                  { name: 'foto_rfc',      label: 'RFC' },
                  { name: 'foto_licencia', label: 'Licencia de Conducir' },
                ].map(doc => (
                  <div key={doc.name} className="col-6 col-md-3">
                    <DocUpload
                      name={doc.name}
                      label={doc.label}
                      currentFile={safeData[doc.name]}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="d-flex justify-content-between align-items-center px-4 py-3 border-top bg-light">
          <button type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
            style={{ borderRadius: 8 }}
            onClick={onClose} disabled={isSubmitting}>
            <X size={14} /> Cancelar
          </button>
          <button type="submit"
            className="btn btn-sm fw-bold d-flex align-items-center gap-2 px-4"
            style={{ background: '#0f172a', color: '#fff', borderRadius: 8, border: 'none' }}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 size={14} className="animate-spin" /> Guardando…</>
            ) : (
              <><Save size={14} /> {isEdit ? 'Actualizar Empleado' : 'Guardar Empleado'}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
