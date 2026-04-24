import React, { useState, useRef, useEffect } from 'react';
import {
  UserPlus, Save, Loader2, X, User, Phone, Lock,
  Calendar, Shield, FileText, Camera, Eye, CheckCircle2, Component
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 2 }}>{label}</label>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        style={{
          height: 86,
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: hasFile ? 'var(--gray-50)' : 'var(--gray-100)',
          borderColor: hasFile ? 'var(--success)' : 'var(--gray-300)',
          borderWidth: 1.5,
          borderStyle: hasFile ? 'solid' : 'dashed',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          transition: 'all .2s',
        }}
      >
        {hasFile ? (
          <>
            <img src={thumb} alt={label}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(9,9,11,.6)', opacity: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 4,
                transition: 'opacity .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >
              <Camera size={16} color="white" />
              <span style={{ color: 'white', fontSize: 10, fontWeight: 600 }}>Cambiar</span>
            </div>
            <span style={{
              position: 'absolute', top: 4, right: 4,
              background: 'var(--success)', borderRadius: '50%',
              padding: 2, lineHeight: 1, display: 'flex',
            }}>
              <CheckCircle2 size={10} color="white" />
            </span>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--gray-400)', pointerEvents: 'none', padding: '0 8px' }}>
            <FileText size={18} style={{ marginBottom: 4, opacity: 0.4 }} />
            <div style={{ fontSize: 10, fontWeight: 600 }}>Subir archivo</div>
          </div>
        )}
        <input ref={inputRef} type="file" name={name}
          accept="image/*,application/pdf"
          style={{ display: 'none' }} onChange={handleChange} disabled={disabled} />
      </div>
      {hasFile && serverUrl && !preview && (
        <a href={serverUrl} target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--info)', fontWeight: 600, fontSize: 10, textDecoration: 'none' }}
          onClick={e => e.stopPropagation()}>
          <Eye size={10} /> Ver actual
        </a>
      )}
    </div>
  );
};

/* ─── Separador de sección ─── */
const SectionTitle = ({ icon: Icon, label, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
    <div style={{
      background: `${color}15`,
      borderRadius: 'var(--radius-sm)',
      padding: 5, lineHeight: 1, display: 'flex',
    }}>
      <Icon size={13} color={color} />
    </div>
    <span style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-500)', fontSize: 10, letterSpacing: 1 }}>
      {label}
    </span>
    <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
  </div>
);

/* ─── Componente principal ─── */
export default function EmpleadoFormModal({
  formData = {},
  divisionesDisponibles = [],
  isSubmitting = false,
  handleInputChange = () => {},
  handleSubmit = (e) => e.preventDefault(),
  onClose = () => {},
}) {
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
    { value: 'developer',   label: 'Desarrollo' },
    { value: 'campo',       label: 'Campo' },
    { value: 'supervisor',  label: 'Supervisor' },
    { value: 'soporte',     label: 'Soporte' },
  ];

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid var(--gray-200)',
    borderRadius: 'var(--radius-md)',
    fontSize: 13,
    fontFamily: 'inherit',
    color: 'var(--gray-800)',
    background: 'white',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const inputGroupStyle = {
    display: 'flex',
    alignItems: 'center',
    border: '1.5px solid var(--gray-200)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    transition: 'border-color 0.2s',
    background: 'white',
  };

  const iconBoxStyle = {
    padding: '0 10px',
    background: 'var(--gray-50)',
    display: 'flex',
    alignItems: 'center',
    borderRight: '1px solid var(--gray-200)',
    height: 38,
  };

  const innerInputStyle = {
    ...inputStyle,
    border: 'none',
    borderRadius: 0,
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content-admin" style={{ maxWidth: 680 }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px',
          background: 'var(--gradient-brand)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <UserPlus size={20} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: 0 }}>
                {isEdit ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h3>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                Complete la información del personal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              background: 'rgba(255,255,255,0.1)', border: 'none',
              borderRadius: 'var(--radius-full)', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'white', transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>

            {/* ── Foto de Perfil ── */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 0 20px',
              background: 'linear-gradient(180deg, var(--gray-950) 55%, var(--gray-50) 100%)',
            }}>
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => !isSubmitting && perfilInputRef.current?.click()}
                  style={{
                    width: 88, height: 88, borderRadius: '50%',
                    overflow: 'hidden', cursor: 'pointer',
                    border: '3px solid white', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    background: 'var(--gray-800)',
                  }}
                >
                  {perfilSrc ? (
                    <img src={perfilSrc} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={36} color="var(--gray-500)" />
                    </div>
                  )}
                </div>
                <button type="button"
                  onClick={() => !isSubmitting && perfilInputRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'var(--red-600)', border: '2px solid white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'white',
                  }}
                >
                  <Camera size={12} />
                </button>
                <input ref={perfilInputRef} type="file" name="foto_perfil"
                  accept="image/*" style={{ display: 'none' }}
                  onChange={handlePerfilChange} disabled={isSubmitting} />
              </div>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                {perfilSrc ? 'Clic para cambiar' : 'Agregar foto de perfil'}
              </p>
            </div>

            <div style={{ padding: '20px 28px 28px' }}>
              {/* ── Info Personal ── */}
              <SectionTitle icon={User} label="Información Personal" color="var(--info)" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 4 }}>
                    Nombre Completo <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <div style={inputGroupStyle}>
                    <div style={iconBoxStyle}><User size={14} color="var(--gray-400)" /></div>
                    <input type="text" name="nombre_completo" value={safeData.nombre_completo || ''}
                      onChange={handleInputChange} placeholder="Ej. Juan Pérez"
                      disabled={isSubmitting} style={innerInputStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 4 }}>Teléfono</label>
                  <div style={inputGroupStyle}>
                    <div style={iconBoxStyle}><Phone size={14} color="var(--gray-400)" /></div>
                    <input type="tel" name="telefono" value={safeData.telefono || ''}
                      onChange={handleInputChange} maxLength={10}
                      placeholder="(000) 000-0000" disabled={isSubmitting} style={innerInputStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 4 }}>Fecha de Ingreso</label>
                  <div style={inputGroupStyle}>
                    <div style={iconBoxStyle}><Calendar size={14} color="var(--gray-400)" /></div>
                    <input type="date" name="fecha_ingreso"
                      value={(() => {
                        const d = safeData.fecha_ingreso;
                        if (!d || d === '0000-00-00') return '';
                        return d.includes('T') ? d.split('T')[0] : d;
                      })()}
                      onChange={handleInputChange} disabled={isSubmitting}
                      style={innerInputStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 4 }}>Estado</label>
                  <select name="estado" value={safeData.estado || 'Activo'}
                    onChange={handleInputChange} disabled={isSubmitting}
                    style={inputStyle}>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
 
              {/* ── División / Empresa ── */}
              <SectionTitle icon={Component} label="División / Empresa" color="var(--brand-600)" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                {divisionesDisponibles.map(div => {
                  const isChecked = (safeData.divisiones || []).some(d => (d.id || d) == div.id);
                  return (
                    <label key={div.id} style={{ 
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', 
                      borderRadius: 'var(--radius-md)', background: isChecked ? `${div.color}15` : 'var(--gray-50)',
                      border: `1.5px solid ${isChecked ? div.color : 'var(--gray-200)'}`,
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={(e) => {
                          const current = safeData.divisiones || [];
                          const updated = e.target.checked 
                            ? [...current, div] 
                            : current.filter(d => (d.id || d) != div.id);
                          handleInputChange({ target: { name: 'divisiones', value: updated } });
                        }}
                        style={{ display: 'none' }}
                      />
                      <div style={{ 
                        width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${isChecked ? div.color : 'var(--gray-400)'}`,
                        background: isChecked ? div.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {isChecked && <CheckCircle2 size={12} color="white" />}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: isChecked ? div.color : 'var(--gray-600)' }}>
                        {div.nombre}
                      </span>
                    </label>
                  );
                })}
                {divisionesDisponibles.length === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--gray-400)', fontStyle: 'italic' }}>No hay divisiones configuradas</p>
                )}
              </div>

              {/* ── Acceso al Sistema ── */}
              <SectionTitle icon={Shield} label="Acceso al Sistema" color="var(--warning)" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 4 }}>
                    Usuario <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <div style={inputGroupStyle}>
                    <div style={{ ...iconBoxStyle, fontWeight: 700, fontSize: 14, color: 'var(--gray-500)' }}>@</div>
                    <input type="text" name="usuario" value={safeData.usuario || ''}
                      onChange={handleInputChange} placeholder="nombre.usuario"
                      disabled={isSubmitting || isEdit}
                      style={{ ...innerInputStyle, background: isEdit ? 'var(--gray-50)' : 'white' }} />
                  </div>
                  {isEdit && <p style={{ color: 'var(--gray-400)', fontSize: 10, margin: '4px 0 0' }}>No se puede cambiar</p>}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 4 }}>
                    {isEdit ? 'Nueva Contraseña' : <>Contraseña <span style={{ color: 'var(--danger)' }}>*</span></>}
                  </label>
                  <div style={inputGroupStyle}>
                    <div style={iconBoxStyle}><Lock size={14} color="var(--gray-400)" /></div>
                    <input type="password" name="password" value={safeData.password || ''}
                      onChange={handleInputChange}
                      placeholder={isEdit ? 'En blanco = sin cambio' : '••••••••'}
                      disabled={isSubmitting} style={innerInputStyle} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 4 }}>Rol</label>
                  <div style={inputGroupStyle}>
                    <div style={iconBoxStyle}><Shield size={14} color="var(--gray-400)" /></div>
                    <select name="rol" value={safeData.rol || 'campo'}
                      onChange={handleInputChange} disabled={isSubmitting}
                      style={innerInputStyle}>
                      {ROLES_OPTIONS.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Documentación ── */}
              <SectionTitle icon={FileText} label="Documentación" color="var(--success)" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { name: 'foto_ine', label: 'INE' },
                  { name: 'foto_curp', label: 'CURP' },
                  { name: 'foto_rfc', label: 'RFC' },
                  { name: 'foto_licencia', label: 'Licencia' },
                ].map(doc => (
                  <DocUpload key={doc.name} name={doc.name} label={doc.label}
                    currentFile={safeData[doc.name]}
                    onChange={handleInputChange}
                    disabled={isSubmitting} />
                ))}
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 24px', borderTop: '1px solid var(--gray-200)',
            background: 'var(--gray-50)',
          }}>
            <button type="button" className="btn-admin btn-secondary" onClick={onClose} disabled={isSubmitting}>
              <X size={14} /> Cancelar
            </button>
            <button type="submit" className="btn-admin btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 size={14} className="animate-spin" /> Guardando…</>
              ) : (
                <><Save size={14} /> {isEdit ? 'Actualizar' : 'Guardar'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
