import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Users, Type, Palette, Shield, CheckSquare } from 'lucide-react';
import { API_URLS } from '../../config';

export default function EquipoFormModal({ 
  formData = {}, 
  empleadosLibres = [], 
  todosEmpleados = [],
  isSubmitting = false, 
  handleInputChange = () => {}, 
  handleMiembrosChange = () => {},
  handleSubmit = (e) => e.preventDefault(), 
  onClose = () => {} 
}) {
  const isEdit = !!formData.id;
  const [searchTerm, setSearchTerm] = useState('');

  // Initial assigned members
  const [selectedMembers, setSelectedMembers] = useState(formData.miembros ? formData.miembros.map(m => m.id) : []);

  const toggleMember = (empId) => {
    let next;
    if (selectedMembers.includes(empId)) {
      next = selectedMembers.filter(id => id !== empId);
    } else {
      next = [...selectedMembers, empId];
    }
    setSelectedMembers(next);
    handleMiembrosChange(next);
  };

  // Only show Active employees. For adding members, we can show currently selected ones and unassigned ones.
  // Actually, we can just show all free ones + currently selected ones.
  const displayEmpleados = todosEmpleados.filter(emp => {
    // Si ya está en la lista selected, muestralo siempre (para poder quitarlo)
    if (selectedMembers.includes(emp.id)) return true;
    // Si no está selected, asumo que quiero los "libres" o si me deja "robar" empleados de otros equipos
    // Para simplificar, mostramos todos y si lo selecciona lo "mueve" de equipo, o solo libres
    return empleadosLibres.some(free => free.id === emp.id);
  });

  const filteredEmpleados = displayEmpleados.filter(emp => 
    emp.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={(e) => { if(e.target === e.currentTarget) onClose(); }} style={{ padding: 20 }}>
      <div className="modal-content-admin animate-fade-in" style={{ maxWidth: 650, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        
        {/* Header */}
        <div style={{ padding: '24px 32px', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--gray-200)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Users size={24} color="var(--brand)" />
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--gray-900)', margin: 0, letterSpacing: '-0.5px' }}>
                {isEdit ? 'Editar Equipo Operativo' : 'Crear Nuevo Equipo'}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: '2px 0 0' }}>
                {isEdit ? 'Modifica el responsable y miembros del equipo.' : 'Agrupa a tu personal estratégico.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSubmitting} style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gray-500)', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-100)'; e.currentTarget.style.color = 'var(--gray-900)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--gray-500)'; }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ maxHeight: '65vh', overflowY: 'auto', padding: '32px' }}>
            
            {/* Row 1: Nombre & Responsable */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginBottom: 28 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', display: 'block', marginBottom: 8 }}>
                  Nombre del Equipo <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Type size={16} color="var(--gray-400)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleInputChange} required autoFocus
                    placeholder="Ej. Cuadrilla Zona Sur" disabled={isSubmitting}
                    style={{ width: '100%', padding: '12px 16px', paddingLeft: 40, border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: 14, background: 'white', outline: 'none', transition: 'border-color 0.2s', fontWeight: 500 }}
                    onFocus={e => e.target.style.borderColor = 'var(--red-400)'}
                    onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', display: 'block', marginBottom: 8 }}>
                  Líder / Encargado
                </label>
                <div style={{ position: 'relative' }}>
                  <Shield size={16} color="var(--gray-400)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }} />
                  <select name="encargado_id" value={formData.encargado_id || ''} onChange={handleInputChange} disabled={isSubmitting}
                    style={{ width: '100%', padding: '12px 16px', paddingLeft: 40, border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: 14, background: 'var(--gray-50)', outline: 'none', appearance: 'none', cursor: 'pointer', fontWeight: 500, color: 'var(--gray-800)' }}
                  >
                    <option value="">Sin encargado</option>
                    {todosEmpleados.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.nombre_completo}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Row 2: Descripción y Color */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 28 }}>
              <div>
                 <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', display: 'block', marginBottom: 8 }}>
                  Descripción (Opcional)
                </label>
                <textarea name="descripcion" value={formData.descripcion || ''} onChange={handleInputChange} disabled={isSubmitting}
                  placeholder="Responsabilidades de la cuadrilla..."
                  style={{ width: '100%', height: 86, padding: '12px 16px', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', resize: 'vertical', fontSize: 13, background: 'white', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = 'var(--red-400)'}
                  onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)', display: 'block', marginBottom: 8 }}>
                  Color Distintivo
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {['#b91c1c', '#ea580c', '#eab308', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#171717'].map(color => (
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

            <hr style={{ border: 'none', borderTop: '1px dashed var(--gray-200)', margin: '0 0 28px 0' }} />

            {/* Integrantes List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>
                  Integrantes del Equipo
                </h4>
                <div style={{ background: 'var(--gray-100)', padding: '4px 12px', borderRadius: '100px', fontSize: 12, fontWeight: 700, color: 'var(--gray-600)' }}>
                  {selectedMembers.length} seleccionados
                </div>
              </div>
              
              <input type="text" placeholder="Buscar personal..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', fontSize: 13, marginBottom: 16, outline: 'none', background: 'var(--gray-50)' }} />

              <div style={{ border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', maxHeight: 200, overflowY: 'auto', background: 'white' }}>
                 {filteredEmpleados.length === 0 ? (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>No hay empleados libres o resultados para la búsqueda.</div>
                 ) : (
                    filteredEmpleados.map(emp => {
                      const isSelected = selectedMembers.includes(emp.id);
                      return (
                        <div key={emp.id} onClick={() => toggleMember(emp.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px',
                            borderBottom: '1px solid var(--gray-100)', cursor: 'pointer', transition: 'background 0.2s',
                            background: isSelected ? 'rgba(185, 28, 28, 0.05)' : 'transparent'
                          }}
                        >
                          <div style={{ width: 18, height: 18, borderRadius: '4px', border: `2px solid ${isSelected ? 'var(--red-600)' : 'var(--gray-300)'}`, background: isSelected ? 'var(--red-600)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                            {isSelected && <CheckSquare color="white" size={14} />}
                          </div>
                          {emp.foto_perfil ? (
                            <img src={`${API_URLS.empleados}uploads/${emp.foto_perfil}`} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gray-200)', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                              {emp.nombre_completo[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: 'var(--gray-800)' }}>
                              {emp.nombre_completo}
                            </span>
                            {emp.id == formData.encargado_id && (
                              <span style={{ marginLeft: 8, fontSize: 10, background: 'var(--yellow-100)', color: 'var(--yellow-800)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>LIDER</span>
                            )}
                          </div>
                        </div>
                      )
                    })
                 )}
              </div>
            </div>

          </div>

          {/* Footer */}
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
              style={{ padding: '12px 32px', background: 'var(--gray-900)', border: 'none', borderRadius: 'var(--radius-lg)', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'; }}
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Guardando…</>
              ) : (
                <><Save size={16} /> {isEdit ? 'Guardar Cambios' : 'Conformar Equipo'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
