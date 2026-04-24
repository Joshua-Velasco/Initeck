import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Loader2, Users, UserPlus, Plus, Search, RefreshCw,
  Trash2, Edit3, User, PlusCircle, AlertCircle, ChevronRight,
  Phone, Shield, Hash, Component,
  Zap, Heart, TrendingUp, FolderOpen, Palmtree
} from 'lucide-react';
import EmpleadoFormModal from '../components/Empleados/EmpleadoFormModal';
import EquipoFormModal from '../components/Empleados/EquipoFormModal';
import TabHabilidades from '../components/Empleados/tabs/TabHabilidades';
import TabFichaMedica from '../components/Empleados/tabs/TabFichaMedica';
import TabDesempeno   from '../components/Empleados/tabs/TabDesempeno';
import TabProyectos   from '../components/Empleados/tabs/TabProyectos';
import TabVacaciones  from '../components/Empleados/tabs/TabVacaciones';
import { API_URLS, EMPLEADOS_UPLOADS_URL } from '../config';
import { COLORS, ESTILOS_COMPARTIDOS, getRolLabel, getRolStyle, initialFormState } from '../constants/theme';

export default function Empleados() {
  const [activeTab, setActiveTab] = useState('directorio'); // 'directorio' | 'equipos'

  const [empleados, setEmpleados] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [divisiones, setDivisiones] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  
  const [formData, setFormData] = useState(initialFormState);
  const [formEquipoData, setFormEquipoData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedRole, setSelectedRole] = useState('all');
  const [detailTab,    setDetailTab]    = useState('perfil');

  const [showEmpleadoModal, setShowEmpleadoModal] = useState(false);
  const [showEquipoModal, setShowEquipoModal] = useState(false);
  
  const [showEliminarModal, setShowEliminarModal] = useState(false);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);
  const [showEliminarEquipoModal, setShowEliminarEquipoModal] = useState(false);
  const [equipoAEliminar, setEquipoAEliminar] = useState(null);
  
  const [isDeleting, setIsDeleting] = useState(false);

  /* ── Fetch ── */
  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [resEmp, resEq, resDiv] = await Promise.all([
        fetch(`${API_URLS.empleados}listar.php?t=${Date.now()}`),
        fetch(`${API_URLS.equipos}listar.php?t=${Date.now()}`),
        fetch(`${API_URLS.divisiones}listar.php?t=${Date.now()}`)
      ]);
      const [dataEmp, dataEq, dataDiv] = await Promise.all([
        resEmp.json(), resEq.json(), resDiv.json()
      ]);
      setEmpleados(Array.isArray(dataEmp) ? dataEmp : []);
      setEquipos(Array.isArray(dataEq) ? dataEq : []);
      setDivisiones(Array.isArray(dataDiv) ? dataDiv : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Keep selection strictly in sync with refetch
  useEffect(() => {
    if (empleadoSeleccionado) {
      const actualizado = empleados.find(e => e.id === empleadoSeleccionado.id);
      if (actualizado && actualizado !== empleadoSeleccionado) setEmpleadoSeleccionado(actualizado);
      else if (!actualizado && !loading) setEmpleadoSeleccionado(null);
    }
  }, [empleados]);

  useEffect(() => {
    if (equipoSeleccionado) {
      const actualizado = equipos.find(e => e.id === equipoSeleccionado.id);
      if (actualizado && actualizado !== equipoSeleccionado) setEquipoSeleccionado(actualizado);
      else if (!actualizado && !loading) setEquipoSeleccionado(null);
    }
  }, [equipos]);

  // Reset HR tab when switching employee
  useEffect(() => { setDetailTab('perfil'); }, [empleadoSeleccionado?.id]);

  /* ── Handlers Empleados ── */
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev, [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmitEmpleado = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'divisiones') return; // Handled separately
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });
      // Add division_ids as JSON
      if (formData.divisiones) {
        const ids = formData.divisiones.map(d => d.id || d);
        data.append('division_ids', JSON.stringify(ids));
      }
      const endpoint = formData.id ? 'editar.php' : 'crear.php';
      const res = await fetch(`${API_URLS.empleados}${endpoint}`, { method: 'POST', body: data });
      if (res.ok) {
        await fetchData();
        setShowEmpleadoModal(false);
        setFormData(initialFormState);
      }
    } catch (error) { console.error('Error al procesar formulario:', error); } 
    finally { setIsSubmitting(false); }
  };

  const handleEliminarEmpleado = async () => {
    if (!empleadoAEliminar?.id) return;
    setIsDeleting(true);
    try {
      await fetch(`${API_URLS.empleados}eliminar.php?id=${empleadoAEliminar.id}`, { method: 'DELETE' });
      await fetchData();
      setShowEliminarModal(false);
      setEmpleadoSeleccionado(null);
    } catch (e) { console.error(e); }
    setIsDeleting(false);
  };

  /* ── Handlers Equipos ── */
  const handleEquipoInputChange = (e) => {
    const { name, value } = e.target;
    setFormEquipoData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitEquipo = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const endpoint = formEquipoData.id ? 'editar.php' : 'crear.php';
      const res = await fetch(`${API_URLS.equipos}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEquipoData)
      });
      if (res.ok) {
        await fetchData();
        setShowEquipoModal(false);
      }
    } catch (error) { console.error('Error al guardar equipo:', error); } 
    finally { setIsSubmitting(false); }
  };

  const handleEliminarEquipo = async () => {
    if (!equipoAEliminar?.id) return;
    setIsDeleting(true);
    try {
      await fetch(`${API_URLS.equipos}eliminar.php?id=${equipoAEliminar.id}`, { method: 'DELETE' });
      await fetchData();
      setShowEliminarEquipoModal(false);
      setEquipoSeleccionado(null);
    } catch (e) { console.error(e); }
    setIsDeleting(false);
  };

  const empleadosFiltrados = useMemo(() => {
    return empleados.filter(e => {
      const matchSearch = (e.nombre_completo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.usuario || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = selectedRole === 'all' || e.rol === selectedRole;
      return matchSearch && matchRole;
    });
  }, [empleados, searchTerm, selectedRole]);

  const equiposFiltrados = useMemo(() => {
    return equipos.filter(e => (e.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }, [equipos, searchTerm]);

  const ROLE_FILTERS = [
    { id: 'all', label: 'Todos' },
    { id: 'admin', label: 'Admin' },
    { id: 'developer', label: 'Desarrollo' },
    { id: 'campo', label: 'Campo' },
    { id: 'supervisor', label: 'Supervisor' },
    { id: 'soporte', label: 'Soporte' },
  ];

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0', borderBottom: '1px solid var(--gray-100)' }}>
      <div className="premium-icon-box" style={{ width: 38, height: 38, background: 'var(--gray-50)', color: 'var(--gray-400)', borderColor: 'var(--gray-100)' }}>
        <Icon size={16} />
      </div>
      <div>
        <p style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{label}</p>
        <p style={{ fontSize: 14, color: 'var(--gray-800)', fontWeight: 750, margin: '2px 0 0' }}>{value || '—'}</p>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '10px' }}>
      <style>{ESTILOS_COMPARTIDOS}</style>

      {/* ── Header Bar ── */}
      <div className="card-admin" style={{ marginBottom: 20, border: 'none', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', padding: '32px 40px', display: 'flex', justifyContent: 'space-between', 
          alignItems: 'center', flexWrap: 'wrap', gap: 16, position: 'relative', overflow: 'hidden',
        }}>
          {/* Accent decoration */}
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)' }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-1px' }}>
              Capital Humano
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: '6px 0 0', fontWeight: 500 }}>
              Directorio corporativo y administración de grupos de trabajo
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, position: 'relative', zIndex: 1 }}>
            <button className="btn-admin" onClick={fetchData} disabled={refreshing} style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '10px 20px' }}>
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> {refreshing ? 'Actualizando...' : 'Refrescar'}
            </button>
            <button className="btn-admin" style={{ background: 'var(--red-600)', color: 'white', border: 'none', borderRadius: '14px', padding: '10px 24px', fontWeight: 800, boxShadow: 'var(--shadow-glow-red)' }} onClick={() => {
              if (activeTab === 'directorio') { setFormData(initialFormState); setShowEmpleadoModal(true); }
              else { setFormEquipoData({ color: '#dc2626', miembros: [] }); setShowEquipoModal(true); }
            }}>
              <Plus size={18} strokeWidth={3} /> Nuevo {activeTab === 'directorio' ? 'Empleado' : 'Equipo'}
            </button>
          </div>
        </div>
        
        {/* Tabs Bar */}
        <div style={{ padding: '0 40px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'white', display: 'flex', gap: 40 }}>
          <button 
            className="btn-admin btn-ghost"
            onClick={() => { setActiveTab('directorio'); setEquipoSeleccionado(null); }}
            style={{ 
              borderRadius: 0, borderBottom: activeTab === 'directorio' ? '3px solid var(--red-600)' : '3px solid transparent',
              color: activeTab === 'directorio' ? 'var(--gray-900)' : 'var(--gray-400)', fontWeight: activeTab === 'directorio' ? 800 : 600,
              padding: '20px 0', fontSize: 15, transition: 'all 0.2s'
            }}>
            Directorio Personal
          </button>
          <button 
            className="btn-admin btn-ghost"
            onClick={() => { setActiveTab('equipos'); setEmpleadoSeleccionado(null); }}
            style={{ 
              borderRadius: 0, borderBottom: activeTab === 'equipos' ? '3px solid var(--red-600)' : '3px solid transparent',
              color: activeTab === 'equipos' ? 'var(--gray-900)' : 'var(--gray-400)', fontWeight: activeTab === 'equipos' ? 800 : 600,
              padding: '20px 0', fontSize: 15, transition: 'all 0.2s'
            }}>
            Equipos de Trabajo
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ display: 'flex', gap: 20, flex: 1, minHeight: 0 }}>

        {/* ── Left Side (List) ── */}
        <div className="card-admin" style={{ width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          
          <div style={{ padding: '24px', borderBottom: '1px solid var(--gray-100)', flexShrink: 0, background: 'var(--gray-50)' }}>
            {activeTab === 'directorio' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {ROLE_FILTERS.map(role => (
                  <button 
                    key={role.id} 
                    onClick={() => setSelectedRole(role.id)} 
                    style={{ 
                      padding: '6px 14px', fontSize: 11, borderRadius: 'full', 
                      background: selectedRole === role.id ? 'var(--gray-900)' : 'white', 
                      color: selectedRole === role.id ? 'white' : 'var(--gray-500)', 
                      fontWeight: 800, border: '1px solid var(--gray-200)',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {role.label.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', borderRadius: '14px', padding: '10px 16px', border: '1.5px solid var(--gray-200)' }}>
              <Search size={18} color="var(--gray-400)" />
              <input 
                type="text" 
                placeholder={`Buscar por nombre...`} 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                style={{ border: 'none', background: 'none', outline: 'none', fontSize: 14, fontWeight: 500, color: 'var(--gray-700)', width: '100%' }} 
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
                <Loader2 size={32} className="animate-spin" color="var(--brand)" />
                <p style={{ marginTop: 12, color: 'var(--gray-400)', fontSize: 13, fontWeight: 600 }}>Cargando datos...</p>
              </div>
            ) : activeTab === 'directorio' ? (
               empleadosFiltrados.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {empleadosFiltrados.map(emp => {
                    const isSelected = empleadoSeleccionado?.id === emp.id;
                    const rolStyle = getRolStyle(emp.rol);
                    return (
                      <div 
                        key={emp.id} 
                        onClick={() => setEmpleadoSeleccionado(emp)} 
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', 
                          borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s',
                          background: isSelected ? 'var(--red-50)' : 'white',
                          border: isSelected ? '1.5px solid var(--red-100)' : '1.5px solid transparent',
                          boxShadow: isSelected ? '0 4px 12px rgba(220,38,38,0.05)' : 'none'
                        }}
                      >
                        <div style={{ 
                          width: 44, height: 44, borderRadius: '14px', 
                          background: emp.foto_perfil ? 'var(--gray-100)' : 'var(--gradient-brand)', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
                          boxShadow: '0 4px 10px rgba(0,0,0,0.08)'
                        }}>
                          {emp.foto_perfil ? <img src={`${EMPLEADOS_UPLOADS_URL}${emp.foto_perfil}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={18} color="white" />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: isSelected ? 'var(--brand)' : 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {emp.nombre_completo}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <span className="premium-pill" style={{ background: rolStyle.bg, color: rolStyle.color, border: 'none', fontSize: 10, padding: '2px 8px' }}>
                              {getRolLabel(emp.rol)}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={16} color={isSelected ? 'var(--brand)' : 'var(--gray-300)'} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-300)' }}>
                   <Users size={48} strokeWidth={1} style={{ opacity: 0.3, marginBottom: 16 }} />
                   <p style={{ fontSize: 14, fontWeight: 600 }}>No se encontraron empleados</p>
                </div>
              )
            ) : (
               equiposFiltrados.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {equiposFiltrados.map(eq => {
                    const isSelected = equipoSeleccionado?.id === eq.id;
                    return (
                      <div 
                        key={eq.id} 
                        onClick={() => setEquipoSeleccionado(eq)} 
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: 14, padding: '16px', 
                          borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s',
                          background: isSelected ? 'white' : 'var(--gray-50)',
                          border: isSelected ? `1.5px solid ${eq.color || 'var(--gray-300)'}` : '1.5px solid transparent',
                          borderLeft: `6px solid ${eq.color || 'var(--gray-300)'}`,
                          boxShadow: isSelected ? 'var(--shadow-md)' : 'none'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 850, color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{eq.nombre}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                            <span style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                               <Users size={14} /> {eq.miembros_count || 0} Miembros
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={16} color="var(--gray-300)" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-300)' }}>
                   <Component size={48} strokeWidth={1} style={{ opacity: 0.3, marginBottom: 16 }} />
                   <p style={{ fontSize: 14, fontWeight: 600 }}>No se encontraron equipos</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* ── Right Side (Details) ── */}
        <div className="card-admin" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, padding: 0 }}>
          
          {activeTab === 'directorio' ? (
            empleadoSeleccionado ? (
              <>
                <div style={{ padding: '32px 40px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: 'var(--gray-50)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 72, height: 72, borderRadius: '20px', background: empleadoSeleccionado.foto_perfil ? 'var(--gray-100)' : 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, boxShadow: 'var(--shadow-lg)' }}>
                      {empleadoSeleccionado.foto_perfil ? <img src={`${EMPLEADOS_UPLOADS_URL}${empleadoSeleccionado.foto_perfil}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={32} color="white" />}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 24, fontWeight: 900, color: 'var(--gray-950)', margin: 0, letterSpacing: '-0.5px' }}>{empleadoSeleccionado.nombre_completo}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                        <span className="premium-pill" style={{ background: getRolStyle(empleadoSeleccionado.rol).bg, color: getRolStyle(empleadoSeleccionado.rol).color, border: 'none', padding: '4px 14px', fontSize: 11 }}>
                           {getRolLabel(empleadoSeleccionado.rol)}
                        </span>
                        {empleadoSeleccionado.equipo_nombre && (
                          <span style={{ fontSize: 12, fontWeight: 750, color: 'var(--gray-600)', background: 'white', border: '1.5px solid var(--gray-200)', borderRadius: '10px', padding: '3px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Component size={14} color={empleadoSeleccionado.equipo_color || 'var(--brand)'} /> {empleadoSeleccionado.equipo_nombre}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-admin btn-secondary" style={{ background: 'white', borderRadius: '12px' }} onClick={() => { const emp = { ...empleadoSeleccionado }; if (emp.fecha_ingreso) emp.fecha_ingreso = emp.fecha_ingreso.split('T')[0].split(' ')[0]; setFormData(emp); setShowEmpleadoModal(true); }}>
                       <Edit3 size={15} /> Editar Ficha
                    </button>
                    <button className="btn-admin btn-danger" style={{ borderRadius: '12px' }} onClick={() => { setEmpleadoAEliminar(empleadoSeleccionado); setShowEliminarModal(true); }}>
                       <Trash2 size={15} /> Dar de Baja
                    </button>
                  </div>
                </div>

                {/* Subtabs Navigation */}
                <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--gray-100)', flexShrink: 0, overflowX: 'auto', background: 'white', padding: '0 40px' }}>
                  {[
                    { key: 'perfil',    label: 'Perfil',       icon: User },
                    { key: 'habilidades', label: 'Habilidades', icon: Zap },
                    { key: 'medica',    label: 'Ficha Médica', icon: Heart },
                    { key: 'desempeno', label: 'Desempeño',    icon: TrendingUp },
                    { key: 'proyectos', label: 'Proyectos',    icon: FolderOpen },
                    { key: 'vacaciones', label: 'Vacaciones',  icon: Palmtree },
                  ].map(tab => {
                    const isActive = detailTab === tab.key;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setDetailTab(tab.key)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '16px 20px', background: 'none', border: 'none',
                          borderBottom: isActive ? '3px solid var(--brand)' : '3px solid transparent',
                          color: isActive ? 'var(--brand)' : 'var(--gray-500)',
                          fontWeight: isActive ? 850 : 600, fontSize: 13,
                          cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                        }}
                      >
                        <Icon size={15} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0 40px 40px' }}>
                  {detailTab === 'perfil' && (
                    <div style={{ paddingTop: 20 }}>
                      <div style={{ maxWidth: 600, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
                        <InfoRow icon={User}   label="Nombre Completo" value={empleadoSeleccionado.nombre_completo} />
                        <InfoRow icon={Hash}   label="Usuario Sistema" value={empleadoSeleccionado.usuario ? `@${empleadoSeleccionado.usuario}` : null} />
                        <InfoRow icon={Phone}  label="Teléfono Contacto" value={empleadoSeleccionado.telefono} />
                        <InfoRow icon={Shield} label="Nivel de Acceso" value={getRolLabel(empleadoSeleccionado.rol)} />
                      </div>
                      
                      {/* Divisions Section */}
                      <div style={{ marginTop: 40 }}>
                         <h4 style={{ fontSize: 12, fontWeight: 800, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>Divisiones Asignadas</h4>
                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                            {empleadoSeleccionado.divisiones?.map(div => (
                              <div key={div.id} className="premium-pill" style={{ background: `${div.color}10`, color: div.color, borderColor: `${div.color}30`, padding: '8px 16px', fontWeight: 800 }}>
                                {div.nombre.toUpperCase()}
                              </div>
                            ))}
                            {(!empleadoSeleccionado.divisiones || empleadoSeleccionado.divisiones.length === 0) && (
                              <p style={{ color: 'var(--gray-400)', fontSize: 14, fontStyle: 'italic', fontWeight: 500 }}>No asignado a ninguna división</p>
                            )}
                         </div>
                      </div>
                    </div>
                  )}
                  {detailTab === 'habilidades' && <TabHabilidades empleadoId={empleadoSeleccionado.id} />}
                  {detailTab === 'medica'      && <TabFichaMedica empleadoId={empleadoSeleccionado.id} />}
                  {detailTab === 'desempeno'   && <TabDesempeno   empleadoId={empleadoSeleccionado.id} />}
                  {detailTab === 'proyectos'   && <TabProyectos   empleadoId={empleadoSeleccionado.id} />}
                  {detailTab === 'vacaciones'  && <TabVacaciones  empleadoId={empleadoSeleccionado.id} />}
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
                <div style={{ opacity: 0.2 }}>
                  <Users size={80} strokeWidth={1} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 850, color: 'var(--gray-600)', margin: '24px 0 8px' }}>Selecciona un Empleado</h3>
                <p style={{ color: 'var(--gray-400)', fontSize: 15, fontWeight: 500 }}>Para ver el perfil detallado y gestionar sus actividades</p>
              </div>
            )
          ) : (
            /* Equipos View */
            equipoSeleccionado ? (
              <>
                <div style={{ padding: '32px 40px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0, background: 'var(--gray-50)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 62, height: 62, borderRadius: '18px', background: equipoSeleccionado.color || 'var(--gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 20px ${equipoSeleccionado.color}30` }}>
                      <Component size={30} color="white" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 24, fontWeight: 900, color: 'var(--gray-950)', margin: 0, letterSpacing: '-0.5px' }}>{equipoSeleccionado.nombre}</h3>
                      <p style={{ fontSize: 14, color: 'var(--gray-500)', margin: '6px 0 0', maxWidth: 450, fontWeight: 500 }}>{equipoSeleccionado.descripcion || 'Sin descripción detallada para este equipo.'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-admin btn-secondary" style={{ background: 'white', borderRadius: 12 }} onClick={() => { setFormEquipoData(equipoSeleccionado); setShowEquipoModal(true); }}><Edit3 size={15} /> Configurar</button>
                    <button className="btn-admin btn-danger" style={{ borderRadius: 12 }} onClick={() => { setEquipoAEliminar(equipoSeleccionado); setShowEliminarEquipoModal(true); }}><Trash2 size={15} /> Eliminar</button>
                  </div>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'flex-start' }}>
                    <div className="premium-shaded-box">
                      <h4 style={{ fontSize: 12, fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 20 }}>LIDERAZGO</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                         <div style={{ width: 48, height: 48, borderRadius: '14px', background: equipoSeleccionado.encargado_foto ? 'var(--gray-100)' : 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                            {equipoSeleccionado.encargado_foto ? <img src={`${EMPLEADOS_UPLOADS_URL}${equipoSeleccionado.encargado_foto}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} color="white" />}
                         </div>
                         <div>
                           <div style={{ fontSize: 16, fontWeight: 850, color: 'var(--gray-900)' }}>{equipoSeleccionado.encargado_nombre || 'Sin líder asignado'}</div>
                           <div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600, marginTop: 2 }}>Encargado responsable</div>
                         </div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontSize: 12, fontWeight: 800, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 20 }}>PERSONAL ASIGNADO ({equipoSeleccionado.miembros?.length || 0})</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {equipoSeleccionado.miembros?.map(m => (
                          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '1.5px solid var(--gray-100)', borderRadius: '16px', background: 'white' }}>
                            <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'var(--gray-50)', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, overflow: 'hidden' }}>
                              {m.foto_perfil ? <img src={`${EMPLEADOS_UPLOADS_URL}${m.foto_perfil}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : m.nombre_completo.charAt(0)}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 750, color: 'var(--gray-800)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{m.nombre_completo}</div>
                              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600 }}>{getRolLabel(m.rol)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
                <div style={{ opacity: 0.2 }}>
                  <Component size={80} strokeWidth={1} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 850, color: 'var(--gray-600)', margin: '24px 0 8px' }}>Estructura de Equipos</h3>
                <p style={{ color: 'var(--gray-400)', fontSize: 15, fontWeight: 500 }}>Selecciona un grupo para gestionar sus integrantes y liderazgo</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Modals remain structurally the same but benefit from global CSS .modal-content-admin */}
      {showEmpleadoModal && (
        <EmpleadoFormModal 
          formData={formData} 
          divisionesDisponibles={divisiones}
          isSubmitting={isSubmitting} 
          handleInputChange={handleInputChange} 
          handleSubmit={handleSubmitEmpleado} 
          onClose={() => setShowEmpleadoModal(false)} 
        />
      )}

      {showEquipoModal && (
        <EquipoFormModal 
          formData={formEquipoData} 
          empleadosLibres={empleados.filter(e => !e.equipo_id)} 
          todosEmpleados={empleados}
          isSubmitting={isSubmitting} 
          handleInputChange={handleEquipoInputChange} 
          handleMiembrosChange={(m) => setFormEquipoData({...formEquipoData, miembros: m})}
          handleSubmit={handleSubmitEquipo} 
          onClose={() => setShowEquipoModal(false)} 
        />
      )}

      {showEliminarModal && (
        <div className="modal-overlay" onClick={() => setShowEliminarModal(false)}>
          <div className="modal-content-admin" style={{ maxWidth: 420, textAlign: 'center', padding: '40px 32px' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fee2e2', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertCircle size={36} color="#ef4444" /></div>
            <h3 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.5px' }}>¿Confirmar Baja?</h3>
            <p style={{ fontSize: 15, color: 'var(--gray-500)', margin: '0 0 32px', lineHeight: 1.5 }}>Estás por eliminar a <strong>{empleadoAEliminar?.nombre_completo}</strong>.<br />Esta acción borrará permanentemente su registro del sistema.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn-admin btn-ghost" style={{ border: '1.5px solid var(--gray-200)', borderRadius: '12px', padding: '12px 24px' }} onClick={() => setShowEliminarModal(false)}>Cancelar</button>
              <button className="btn-admin btn-danger" style={{ borderRadius: '12px', padding: '12px 24px', background: '#ef4444' }} disabled={isDeleting} onClick={handleEliminarEmpleado}>{isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}</button>
            </div>
          </div>
        </div>
      )}

      {showEliminarEquipoModal && (
         <div className="modal-overlay" onClick={() => setShowEliminarEquipoModal(false)}>
          <div className="modal-content-admin" style={{ maxWidth: 420, textAlign: 'center', padding: '40px 32px' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fee2e2', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertCircle size={36} color="#ef4444" /></div>
            <h3 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.5px' }}>¿Disolver Equipo?</h3>
            <p style={{ fontSize: 15, color: 'var(--gray-500)', margin: '0 0 32px', lineHeight: 1.5 }}>Estás por eliminar a <strong>{equipoAEliminar?.nombre}</strong>. Los empleados quedarán sin equipo asignado.<br />Las tareas del equipo NO serán borradas.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn-admin btn-ghost" style={{ border: '1.5px solid var(--gray-200)', borderRadius: '12px', padding: '12px 24px' }} onClick={() => setShowEliminarEquipoModal(false)}>Cancelar</button>
              <button className="btn-admin btn-danger" style={{ borderRadius: '12px', padding: '12px 24px', background: '#ef4444' }} disabled={isDeleting} onClick={handleEliminarEquipo}>{isDeleting ? 'Procesando...' : 'Sí, Eliminar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Fixes */}
      <style>{`
        @media (max-width: 1024px) { 
          div[style*="width: 360"] { width: 100% !important; ${empleadoSeleccionado || equipoSeleccionado ? 'display: none !important;' : ''} } 
          div[style*="minWidth: 0"] { ${!empleadoSeleccionado && !equipoSeleccionado ? 'display: none !important;' : ''} } 
        }
      `}</style>
    </div>
  );
}
