import React, { useState } from 'react';
import { 
  X, Save, Loader2, Calendar, Clock, 
  MapPin, CheckSquare, Palette, User, Type, AlertCircle, Plus
} from 'lucide-react';
import TaskCalendar from './TaskCalendar';

export default function TareaFormModal({ 
  formData = {}, 
  empleados = [],
  equipos = [], 
  isSubmitting = false, 
  handleInputChange = () => {}, 
  handleMaterialesChange = () => {},
  handleSubmit = (e) => e.preventDefault(), 
  onClose = () => {} 
}) {
  const isEdit = !!formData.id;
  const [materialInput, setMaterialInput] = useState('');

  const renderSelectGroup = (label, icon, name, value, options) => (
    <div style={{ flex: 1, minWidth: 150 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {icon} {label}
      </label>
      <select 
        name={name} 
        value={value} 
        onChange={handleInputChange}
        disabled={isSubmitting}
        style={{
          width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)',
          background: 'var(--gray-50)', outline: 'none', fontSize: 13, color: 'var(--gray-800)', fontFamily: 'inherit',
          transition: 'all 0.2s', cursor: 'pointer'
        }}
        onFocus={e => e.target.style.borderColor = 'var(--red-400)'}
        onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const addMaterial = () => {
    if (materialInput.trim()) {
      handleMaterialesChange([...(formData.materiales || []), materialInput.trim()]);
      setMaterialInput('');
    }
  };

  const removeMaterial = (index) => {
    const newMats = [...(formData.materiales || [])];
    newMats.splice(index, 1);
    handleMaterialesChange(newMats);
  };

  const assignedEmp = empleados.find(e => e.id == formData.empleado_id);
  const assignedEq = equipos.find(e => e.id == formData.equipo_id);

  // Derivar el valor seleccionado unificado
  let assignValue = '';
  if (formData.empleado_id) assignValue = `EMP_${formData.empleado_id}`;
  if (formData.equipo_id) assignValue = `EQ_${formData.equipo_id}`;

  const onAssignChange = (e) => {
    const val = e.target.value;
    if (!val) {
      handleInputChange({ target: { name: 'empleado_id', value: '' } });
      handleInputChange({ target: { name: 'equipo_id', value: '' } });
    } else if (val.startsWith('EMP_')) {
      handleInputChange({ target: { name: 'equipo_id', value: '' } });
      handleInputChange({ target: { name: 'empleado_id', value: val.replace('EMP_', '') } });
    } else if (val.startsWith('EQ_')) {
      handleInputChange({ target: { name: 'empleado_id', value: '' } });
      handleInputChange({ target: { name: 'equipo_id', value: val.replace('EQ_', '') } });
    }
  };

  const setOffsetDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const dateStr = d.toISOString().split('T')[0];
    handleInputChange({ target: { name: 'fecha_inicio', value: dateStr } });
    handleInputChange({ target: { name: 'fecha_fin', value: dateStr } });
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if(e.target === e.currentTarget) onClose(); }} style={{ padding: 20 }}>
      <div className="modal-content-admin animate-fade-in" style={{ maxWidth: 700, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        
        {/* Modern Header */}
        <div style={{ padding: '24px 32px', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--gray-200)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <CheckSquare size={24} color="var(--red-600)" />
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--gray-900)', margin: 0, letterSpacing: '-0.5px' }}>
                {isEdit ? 'Actualizar Tarea' : 'Asignar Nueva Tarea'}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: '2px 0 0' }}>
                {isEdit ? 'Revisa y ajusta los detalles de la actividad' : 'Define responsabilidades, recursos y plazos'}
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSubmitting} style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gray-500)', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-100)'; e.currentTarget.style.color = 'var(--gray-900)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--gray-500)'; }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ maxHeight: '65vh', overflowY: 'auto', padding: '32px' }}>
            
            {/* Row 1: Título & Asignado */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 28 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', display: 'block', marginBottom: 8 }}>
                  ¿Qué hay que hacer? <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input type="text" name="titulo" value={formData.titulo || ''} onChange={handleInputChange} required autoFocus
                  placeholder="Ej. Realizar mantenimiento preventivo a unidad 104" disabled={isSubmitting}
                  style={{ width: '100%', padding: '14px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: 15, background: 'white', outline: 'none', transition: 'border-color 0.2s', fontWeight: 500 }}
                  onFocus={e => e.target.style.borderColor = 'var(--red-400)'}
                  onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
                />
              </div>
              
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', display: 'block', marginBottom: 8 }}>
                  Asignar A
                </label>
                <div style={{ position: 'relative' }}>
                  <select value={assignValue} onChange={onAssignChange} disabled={isSubmitting}
                    style={{ width: '100%', padding: '14px 16px', paddingLeft: 44, border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: 14, background: 'var(--gray-50)', outline: 'none', appearance: 'none', cursor: 'pointer', fontWeight: 500, color: assignValue ? 'var(--brand)' : 'var(--gray-500)' }}
                  >
                    <option value="">Sin asignar (Abierta)</option>
                    <optgroup label="💼 Empleados">
                      {empleados.map(emp => (
                        <option key={`EMP_${emp.id}`} value={`EMP_${emp.id}`}>👤 {emp.nombre_completo}</option>
                      ))}
                    </optgroup>
                    {equipos && equipos.length > 0 && (
                      <optgroup label="🏢 Equipos">
                        {equipos.map(eq => (
                          <option key={`EQ_${eq.id}`} value={`EQ_${eq.id}`}>👥 Equipo: {eq.nombre}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                    {formData.empleado_id ? (
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--red-100)', color: 'var(--red-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>
                        {assignedEmp?.nombre_completo?.charAt(0) || 'U'}
                      </div>
                    ) : formData.equipo_id ? (
                       <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gray-800)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>
                        EQ
                      </div>
                    ) : (
                      <User size={18} color="var(--gray-400)" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', display: 'block', marginBottom: 8 }}>
                Detalles / Responsabilidades
              </label>
              <textarea name="responsabilidades" value={formData.responsabilidades || ''} onChange={handleInputChange} disabled={isSubmitting}
                placeholder="Escribe instrucciones detalladas, contexto, o notas importantes para quien realizará la tarea..."
                style={{ width: '100%', minHeight: 100, padding: '16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', resize: 'vertical', fontSize: 14, background: 'white', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = 'var(--red-400)'}
                onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
              />
            </div>

            <hr style={{ border: 'none', borderTop: '1px dashed var(--gray-200)', margin: '0 0 28px 0' }} />

            {/* Atributos: Departamento, Estado, Prioridad */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 28 }}>
              {renderSelectGroup("Departamento", <MapPin size={14} />, "departamento", formData.departamento || 'campo', [
                { value: 'admin', label: 'Administrativo' },
                { value: 'developer', label: 'Sistemas / Dev' },
                { value: 'campo', label: 'Operativo / Campo' },
                { value: 'supervisor', label: 'Supervisión' },
                { value: 'soporte', label: 'Soporte' },
              ])}
              
              {renderSelectGroup("Estado", <CheckSquare size={14} />, "estado", formData.estado || 'pendiente', [
                { value: 'pendiente', label: 'Pendiente' },
                { value: 'en_progreso', label: '🚀 En Progreso' },
                { value: 'completada', label: '✅ Completada' },
                { value: 'cancelada', label: '❌ Cancelada' },
              ])}
              
              {renderSelectGroup("Prioridad", <AlertCircle size={14} />, "prioridad", formData.prioridad || 'media', [
                { value: 'baja', label: '🟢 Baja' },
                { value: 'media', label: '🟡 Media' },
                { value: 'alta', label: '🟠 Alta' },
                { value: 'urgente', label: '🔴 Urgente' },
              ])}
            </div>

            {/* Fechas y Tiempo */}
            <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: 28 }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1.2fr) minmax(200px, 1fr)', gap: 32 }}>
                
                {/* Visual Calendar */}
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={16} color="var(--brand)" /> 1. Fechas (Día o Rango)
                  </h4>
                  <TaskCalendar 
                    fechaInicio={formData.fecha_inicio}
                    fechaFin={formData.fecha_fin}
                    onChange={({inicio, fin}) => {
                      handleInputChange({ target: { name: 'fecha_inicio', value: inicio } });
                      handleInputChange({ target: { name: 'fecha_fin', value: fin } });
                    }}
                  />
                </div>

                {/* Clock / Options */}
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={16} color="var(--brand)" /> 2. Configura los tiempos
                  </h4>
                  
                  {/* Times */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>Hora de Inicio (Opcional)</label>
                      <input type="time" name="hora_inicio" value={formData.hora_inicio || ''} onChange={handleInputChange} disabled={isSubmitting}
                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: 14, background: 'white', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', display: 'block', marginBottom: 6 }}>Hora Límite / Entrega</label>
                      <input type="time" name="hora_fin" value={formData.hora_fin || ''} onChange={handleInputChange} disabled={isSubmitting}
                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: 14, background: 'white', outline: 'none' }} />
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Resources / Color */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 32 }}>
              {/* Materiales */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', margin: '0 0 12px 0' }}>Equipamiento / Materiales</h4>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input type="text" value={materialInput} onChange={e => setMaterialInput(e.target.value)}
                    onKeyPress={e => { if (e.key === 'Enter') { e.preventDefault(); addMaterial(); } }}
                    placeholder="Ej. Taladro, Software X, Llaves..." disabled={isSubmitting}
                    style={{ flex: 1, padding: '10px 14px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: 14, outline: 'none', transition: 'border-color 0.2s', background: 'white' }}
                    onFocus={e => e.target.style.borderColor = 'var(--gray-400)'}
                    onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
                  />
                  <button type="button" onClick={addMaterial} style={{ padding: '0 16px', background: 'var(--gray-800)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'black'} onMouseLeave={e => e.currentTarget.style.background = 'var(--gray-800)'}>
                    <Plus size={18} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {(!formData.materiales || formData.materiales.length === 0) ? (
                    <p style={{ fontSize: 13, color: 'var(--gray-400)', margin: 0, paddingLeft: 4 }}>Ningún elemento asignado.</p>
                  ) : (
                    formData.materiales.map((mat, i) => (
                      <div key={i} style={{ padding: '6px 12px', background: 'var(--gray-100)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 500, color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {mat}
                        <button type="button" onClick={() => removeMaterial(i)} style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer', color: 'var(--gray-400)', display: 'flex', alignItems: 'center' }} onMouseEnter={e => e.currentTarget.style.color='var(--danger)'} onMouseLeave={e => e.currentTarget.style.color='var(--gray-400)'}>
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Color */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Palette size={16} color="var(--gray-500)" /> Etiqueta
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {['#b91c1c', '#ea580c', '#f59e0b', '#10b981', '#0891b2', '#2563eb', '#7c3aed', '#18181b'].map(color => (
                    <div key={color}
                      onClick={() => handleInputChange({ target: { name: 'color', value: color } })}
                      style={{
                        width: '100%', aspectRatio: '1/1', borderRadius: '8px', background: color, cursor: 'pointer',
                        border: formData.color === color ? '2px solid white' : '2px solid transparent',
                        boxShadow: formData.color === color ? `0 0 0 3px ${color}` : 'none',
                        transition: 'transform 0.1s',
                        transform: formData.color === color ? 'scale(1.05)' : 'scale(1)'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Modern Footer */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12,
            padding: '24px 32px', borderTop: '1px solid var(--gray-200)', background: 'white',
          }}>
            <button type="button" onClick={onClose} disabled={isSubmitting}
              style={{ padding: '12px 24px', background: 'white', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', color: 'var(--gray-700)', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.borderColor = 'var(--gray-300)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--gray-200)'; }}
            >
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting}
              style={{ padding: '12px 32px', background: 'var(--brand)', border: 'none', borderRadius: 'var(--radius-lg)', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(185, 28, 28, 0.25)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(185, 28, 28, 0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(185, 28, 28, 0.25)'; }}
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Guardando…</>
              ) : (
                <><Save size={16} /> {isEdit ? 'Guardar Cambios' : 'Asignar Tarea'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
