import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, Plus, Search, Filter, MoreVertical, 
  Users, Calendar, Clock, ChevronRight, UserPlus, 
  Shield, CheckCircle2, AlertCircle, Trash2, Edit2, X
} from 'lucide-react';
import { API_URLS } from '../config';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../constants/roles';

export default function Proyectos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'activo'
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resProj, resEmp] = await Promise.all([
        fetch(`${API_URLS.proyectos}listar.php`),
        fetch(`${API_URLS.empleados}listar.php`)
      ]);
      const dataProj = await resProj.json();
      const dataEmp = await resEmp.json();
      setProyectos(Array.isArray(dataProj) ? dataProj : []);
      setEmpleados(Array.isArray(dataEmp) ? dataEmp : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = selectedProyecto ? `${API_URLS.proyectos}editar.php` : `${API_URLS.proyectos}crear.php`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedProyecto ? { ...formData, id: selectedProyecto.id } : formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssign = async (empleadoId, rol) => {
    try {
      const res = await fetch(`${API_URLS.proyectos}asignar.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proyecto_id: selectedProyecto.id,
          empleados: [{ empleado_id: empleadoId, rol }]
        })
      });
      if (res.ok) {
        fetchData();
        // Refresh local state for the modal if needed
        const updatedRes = await fetch(`${API_URLS.proyectos}listar.php`);
        const updatedData = await updatedRes.json();
        const updatedProj = updatedData.find(p => p.id === selectedProyecto.id);
        setSelectedProyecto(updatedProj);
      }
    } catch (error) {
      console.error('Error assigning staff:', error);
    }
  };

  const filteredProyectos = proyectos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '10px' }}>
      
      {/* ── Ribbon / Header ── */}
      <div className="card-admin" style={{ marginBottom: 20, border: 'none', flexShrink: 0 }}>
        <div style={{
          background: 'var(--gradient-brand)', padding: '24px 28px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Ambient circles */}
          <div style={{ position: 'absolute', top: -40, right: -20, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: -50, right: 100, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Briefcase size={24} color="white" /> Gestión de Proyectos
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '6px 0 0', fontWeight: 500 }}>
              Administra el equipo y personal asignado • {proyectos.length} Registros Activos
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.15)', 
              borderRadius: 'var(--radius-full)', padding: '8px 16px', border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Search size={16} color="rgba(255,255,255,0.5)" />
              <input type="text" placeholder="Buscar proyecto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', color: 'white', fontSize: 13, width: 220, fontWeight: 500 }} />
            </div>
            
            <button className="btn-admin" style={{ background: 'white', color: 'var(--brand)', borderRadius: '12px', padding: '10px 20px', fontWeight: 800, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              onClick={() => { setSelectedProyecto(null); setFormData({ nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '', estado: 'activo' }); setShowModal(true); }}>
              <Plus size={18} strokeWidth={3} /> Nuevo Proyecto
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid Container (Scrollable) */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 40 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
        {filteredProyectos.map(proyecto => (
          <div key={proyecto.id} className="card-admin animate-fade-in premium-card-border-left" style={{ 
            background: 'white', padding: 0, overflow: 'hidden', cursor: 'pointer'
          }}
            onClick={() => navigate(`/proyectos/${proyecto.id}`)}
          >
            <div style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div className="premium-icon-box" style={{ background: 'var(--red-50)', color: 'var(--brand)', borderColor: 'var(--red-100)' }}>
                  <Briefcase size={22} strokeWidth={2.5} />
                </div>
                <div className="premium-pill" style={{ 
                  background: proyecto.estado === 'activo' ? '#ecfdf5' : '#fef2f2',
                  color: proyecto.estado === 'activo' ? '#059669' : '#dc2626',
                  border: `1px solid ${proyecto.estado === 'activo' ? '#d1fae5' : '#fee2e2'}`
                }}>
                  {proyecto.estado}
                </div>
              </div>
              
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--gray-950)', marginBottom: '10px', letterSpacing: '-0.5px' }}>{proyecto.nombre}</h3>
              <p style={{ fontSize: '14px', color: 'var(--gray-500)', lineHeight: '1.6', minHeight: '44px', marginBottom: '24px', fontWeight: 500 }}>
                {proyecto.descripcion || 'Sin descripción detallada disponible para este proyecto.'}
              </p>

              {/* Data Points */}
              <div style={{ display: 'flex', gap: '32px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <div style={{ color: 'var(--gray-300)' }}><Calendar size={18} /></div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--gray-400)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inicio</div>
                    <div style={{ fontSize: '13px', fontWeight: 750, color: 'var(--gray-800)' }}>{proyecto.fecha_inicio || 'TBD'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ color: 'var(--gray-300)' }}><Users size={18} /></div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--gray-400)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Equipo</div>
                    <div style={{ fontSize: '13px', fontWeight: 750, color: 'var(--gray-800)' }}>{proyecto.personal?.length || 0} Miembros</div>
                  </div>
                </div>
              </div>

              {/* Team Showcase */}
              <div className="premium-shaded-box" style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '1px' }}>Plantilla del Proyecto</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {proyecto.personal?.map(miembro => (
                    <div key={miembro.empleado_id} style={{ 
                      display: 'flex', alignItems: 'center', gap: '7px', 
                      background: 'white', padding: '6px 12px', borderRadius: '12px',
                      border: '1px solid var(--gray-200)', boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                    }}>
                      <div style={{ 
                        width: '7px', height: '7px', borderRadius: '50%', 
                        background: miembro.rol_en_proyecto === 'supervisor' ? '#f59e0b' : 'var(--brand)' 
                      }} />
                      <span style={{ fontSize: '12px', fontWeight: 750, color: 'var(--gray-800)' }}>{miembro.nombre_completo.trim().split(' ')[0]}</span>
                      <span style={{ 
                        fontSize: '9px', fontWeight: 800, color: miembro.rol_en_proyecto === 'supervisor' ? '#92400e' : 'var(--brand)',
                        background: miembro.rol_en_proyecto === 'supervisor' ? '#fef3c7' : 'var(--red-50)',
                        padding: '1px 5px', borderRadius: '6px', textTransform: 'uppercase'
                      }}>
                        {miembro.rol_en_proyecto === 'supervisor' ? 'SUP' : 'EMP'}
                      </span>
                    </div>
                  ))}
                  {(!proyecto.personal || proyecto.personal.length === 0) && (
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--gray-400)', fontStyle: 'italic', fontWeight: 500 }}>Sin personal asignado</p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate(`/proyectos/${proyecto.id}`); }}
                  className="btn-admin btn-ghost"
                  style={{ flex: 1, padding: '12px', fontSize: '14px', fontWeight: 700, borderRadius: '14px', border: '1.5px solid var(--gray-200)', color: 'var(--gray-600)' }}
                >
                  <ChevronRight size={16} /> Ver Proyecto
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedProyecto(proyecto); setShowAssignModal(true); }}
                  className="btn-admin btn-primary"
                  style={{ flex: 1.6, padding: '12px', fontSize: '14px', fontWeight: 800, borderRadius: '14px', background: 'var(--gradient-brand)', border: 'none' }}
                >
                  <Users size={17} /> Gestionar Equipo
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Modal Proyecto */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content-admin" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--gray-100)' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>{selectedProyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Nombre del Proyecto</label>
                  <input 
                    type="text" required value={formData.nombre}
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Ej. Proyecto de Campo A"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--gray-200)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Descripción</label>
                  <textarea 
                    value={formData.descripcion}
                    onChange={e => setFormData({...formData, descripcion: e.target.value})}
                    rows={3}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--gray-200)', resize: 'none' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Fecha Inicio</label>
                    <input 
                      type="date" value={formData.fecha_inicio}
                      onChange={e => setFormData({...formData, fecha_inicio: e.target.value})}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--gray-200)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Estado</label>
                    <select 
                      value={formData.estado}
                      onChange={e => setFormData({...formData, estado: e.target.value})}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid var(--gray-200)' }}
                    >
                      <option value="activo">Activo</option>
                      <option value="pausado">Pausado</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-admin btn-secondary">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="btn-admin btn-primary">
                  {isSubmitting ? 'Guardando...' : (selectedProyecto ? 'Actualizar' : 'Crear Proyecto')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Asignar Equipo */}
      {showAssignModal && selectedProyecto && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content-admin" style={{ maxWidth: '900px', padding: 0, borderRadius: '24px', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ 
              padding: '28px 32px', 
              background: 'linear-gradient(135deg, var(--gray-900), var(--gray-950))',
              color: 'white',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  background: 'rgba(255,255,255,0.1)', padding: '12px', 
                  borderRadius: '16px', backdropFilter: 'blur(10px)'
                }}>
                  <Users size={28} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Gestión de Equipo</h2>
                  <p style={{ margin: 0, fontSize: '13px', opacity: 0.6 }}>{selectedProyecto.nombre} — Control de Personal Operativo</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAssignModal(false)}
                style={{ 
                  position: 'absolute', top: '24px', right: '24px', 
                  background: 'rgba(244,63,94,0.1)', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', color: '#f43f5e', cursor: 'pointer' 
                }}
              >
                <X size={18} />
              </button>
            </div>
            
            <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '32px', maxHeight: '75vh', overflowY: 'auto', background: 'var(--gray-50)' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--gray-800)', marginBottom: '20px' }}>
                  Personal Asignado ({selectedProyecto.personal?.length || 0})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedProyecto.personal?.length > 0 ? selectedProyecto.personal.map(p => (
                    <div key={p.empleado_id} style={{ 
                      padding: '16px', background: 'white', borderRadius: '18px',
                      border: '1.5px solid var(--gray-100)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                          width: 40, height: 40, borderRadius: 12, 
                          background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--gray-500)', fontWeight: 800, fontSize: 14
                        }}>
                          {p.nombre_completo[0]}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-900)' }}>{p.nombre_completo}</div>
                          <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{p.equipo_nombre || 'Sin Equipo'}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ display: 'flex', background: 'var(--gray-100)', padding: 3, borderRadius: 10 }}>
                          <button 
                            onClick={() => handleAssign(p.empleado_id, 'supervisor')}
                            style={{ 
                              padding: '5px 10px', fontSize: 10, fontWeight: 800, border: 'none', borderRadius: 7, cursor: 'pointer',
                              background: p.rol_en_proyecto === 'supervisor' ? 'white' : 'transparent',
                              color: p.rol_en_proyecto === 'supervisor' ? '#f59e0b' : 'var(--gray-400)',
                              boxShadow: p.rol_en_proyecto === 'supervisor' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                             }}
                          >SUPER</button>
                          <button 
                            onClick={() => handleAssign(p.empleado_id, 'empleado')}
                            style={{ 
                              padding: '5px 10px', fontSize: 10, fontWeight: 800, border: 'none', borderRadius: 7, cursor: 'pointer',
                              background: p.rol_en_proyecto === 'empleado' ? 'white' : 'transparent',
                              color: p.rol_en_proyecto === 'empleado' ? 'var(--brand)' : 'var(--gray-400)',
                              boxShadow: p.rol_en_proyecto === 'empleado' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                             }}
                          >EMP</button>
                        </div>
                        <button 
                          onClick={async () => {
                            const newList = selectedProyecto.personal.filter(x => x.empleado_id !== p.empleado_id)
                              .map(x => ({ empleado_id: x.empleado_id, rol: x.rol_en_proyecto }));
                            await fetch(`${API_URLS.proyectos}asignar.php`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ proyecto_id: selectedProyecto.id, empleados: newList, sync: true })
                            });
                            fetchData();
                            const updatedRes = await fetch(`${API_URLS.proyectos}listar.php`);
                            const updatedData = await updatedRes.json();
                            setSelectedProyecto(updatedData.find(x => x.id === selectedProyecto.id));
                          }}
                          style={{ background: 'white', border: '1.5px solid #fee2e2', color: '#ef4444', width: 32, height: 32, borderRadius: 10, cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '20px', border: '2px dashed var(--gray-200)' }}>
                      <AlertCircle size={32} style={{ color: 'var(--gray-300)', marginBottom: '12px' }} />
                      <p style={{ color: 'var(--gray-400)', fontSize: '13px', fontWeight: 600 }}>No hay personal asignado</p>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ borderLeft: '2px solid var(--gray-100)', paddingLeft: '32px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--gray-800)', marginBottom: '16px' }}>Asignar Nuevo</h3>
                  <div id="available-staff-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '45vh', overflowY: 'auto' }}>
                    {empleados.filter(e => !selectedProyecto.personal?.some(p => p.empleado_id === e.id)).map(e => (
                      <div key={e.id} style={{ 
                        padding: '12px', background: 'white', borderRadius: '14px',
                        border: '1.5px solid var(--gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-800)' }}>{e.nombre_completo}</div>
                          <div style={{ fontSize: '10px', color: 'var(--gray-400)' }}>{e.equipo_nombre || 'Sin equipo'}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => handleAssign(e.id, 'supervisor')} style={{ background: '#fef3c7', color: '#d97706', border: 'none', padding: '6px 10px', borderRadius: 8, fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>+ Super</button>
                          <button onClick={() => handleAssign(e.id, 'empleado')} style={{ background: 'var(--red-50)', color: 'var(--brand)', border: 'none', padding: '6px 10px', borderRadius: 8, fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>+ Emp</button>
                        </div>
                      </div>
                    ))}
                  </div>
              </div>
            </div>
            <div style={{ padding: '24px 32px', borderTop: '1.5px solid var(--gray-100)', background: 'white', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAssignModal(false)} className="btn-admin btn-primary" style={{ padding: '10px 32px', borderRadius: 14, fontWeight: 700 }}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="animate-spin" style={{ width: 30, height: 30, border: '3px solid var(--brand)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
        </div>
      )}
    </div>
  );
}
