import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Loader2, Users, UserPlus, Search, RefreshCw,
  Trash2, Edit3, Car, User, AlertCircle, ChevronRight, Clock,
  LayoutDashboard, List, Activity, TrendingUp, Calendar
} from 'lucide-react';


// Componentes
import EmpleadoDetalle from '../components/Empleados_Admin/EmpleadoDetalle';
import { UnidadManager } from '../components/Empleados_Admin/UnidadManager';
import { EmpleadoFormModal } from '../components/Empleados_Admin/EmpleadoFormModal';
import { HorarioManager } from '../components/Empleados_Admin/HorarioManager';

// Constantes
import { COLORS, ESTILOS_COMPARTIDOS, getRolLabel, API_URLS } from '../constants/theme';
import { EMPLEADOS_UPLOADS_URL } from '../config';

const EmpAvatar = ({ emp, size = 40, className = '' }) => {
  const src = emp?.foto_perfil ? `${EMPLEADOS_UPLOADS_URL}${emp.foto_perfil}` : null;
  return src ? (
    <img src={src} alt={emp.nombre_completo}
      className={`rounded-circle object-fit-cover flex-shrink-0 ${className}`}
      style={{ width: size, height: size, objectFit: 'cover' }}
      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
  ) : null;
};

export default function Empleados() {
  const initialFormState = useMemo(() => ({
    id: '',
    nombre_completo: '',
    telefono: '',
    estado: 'Activo',
    fecha_ingreso: (() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })(),
    usuario: '',
    password: '',
    rol: 'employee',
    foto_ine: null,
    foto_curp: null,
    foto_rfc: null,
    foto_licencia: null
  }), []);

  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showEmpleadoModal, setShowEmpleadoModal] = useState(false);
  const [showAsignarUnidadModal, setShowAsignarUnidadModal] = useState(false);
  const [showHorarioModal, setShowHorarioModal] = useState(false);

  const [showEliminarModal, setShowEliminarModal] = useState(false);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [activeTab, setActiveTab] = useState('general');
  const [selectedRole, setSelectedRole] = useState('all');
  const [fechas, setFechas] = useState(() => {
    const now = new Date();
    // Antes de las 04:00 AM el día operacional aún pertenece al día anterior
    if (now.getHours() < 4) now.setDate(now.getDate() - 1);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return { inicio: `${year}-${month}-${day}`, fin: `${year}-${month}-${day}` };
  });

  const fetchEmpleados = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${API_URLS.empleados}listar.php?t=${Date.now()}`);
      if (!res.ok) throw new Error("Error en servidor");
      const data = await res.json();
      setEmpleados(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []); // Dependencia vacía para evitar recargas al seleccionar

  // Efecto para sincronizar la selección cuando la lista se actualiza
  useEffect(() => {
    if (empleadoSeleccionado) {
      const actualizado = empleados.find(e => e.id === empleadoSeleccionado.id);
      if (actualizado) {
        if (actualizado !== empleadoSeleccionado) {
          setEmpleadoSeleccionado(actualizado);
        }
      } else if (!loading) {
        // Solo limpiar si no se encuentra Y no estamos cargando (aunque loading no es dep, la lista final ya llegó)
        // Nota: empleados se actualiza atomicamente, asi que si no esta en 'empleados', no existe.
        setEmpleadoSeleccionado(null);
      }
    }
  }, [empleados]);

  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });

      const endpoint = formData.id ? 'editar.php' : 'crear.php';
      const res = await fetch(`${API_URLS.empleados}${endpoint}`, {
        method: 'POST',
        body: data
      });

      if (res.ok) {
        await fetchEmpleados();
        setShowEmpleadoModal(false);
        setFormData(initialFormState);
      }
    } catch (error) {
      console.error("Error al procesar el formulario", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const detalleRef = useRef(null);

  // Reset scroll position when employee changes
  useEffect(() => {
    if (detalleRef.current) {
      detalleRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [empleadoSeleccionado]);

  const empleadosFiltrados = useMemo(() => {
    return empleados.filter(e => {
      const matchSearch = (e.nombre_completo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.usuario || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = selectedRole === 'all' || e.rol === selectedRole;
      return matchSearch && matchRole;
    });
  }, [empleados, searchTerm, selectedRole]);

  const handleEliminar = async () => {
    if (!empleadoAEliminar?.id) return;

    // Restricción: El usuario no puede eliminarse a sí mismo
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (currentUser?.id === empleadoAEliminar.id) {
      alert("⚠️ No puedes eliminar tu propio usuario. Esta acción está restringida por seguridad.");
      setShowEliminarModal(false);
      setEmpleadoAEliminar(null);
      setIsDeleting(false);
      return;
    }

    setIsDeleting(true);
    try {
      await fetch(`${API_URLS.empleados}eliminar.php?id=${empleadoAEliminar.id}`, { method: 'DELETE' });
      await fetchEmpleados();
      setShowEliminarModal(false);
      setEmpleadoSeleccionado(null);
    } catch (e) {
      console.error(e);
    }
    setIsDeleting(false);
  };


  return (
    <div className="d-flex flex-column" style={{ backgroundColor: COLORS.bg, height: 'calc(100vh - 75px)', overflow: 'hidden' }}>
      <style>{ESTILOS_COMPARTIDOS}</style>

      <div className="container-fluid px-3 px-md-5 py-3 py-md-4 h-100 d-flex flex-column">
        {/* Header Principal - Optimizado para móviles */}
        <div className="card border-0 rounded-4 shadow-sm mb-4 mb-md-5 overflow-hidden flex-shrink-0">
          <div className="p-3 p-md-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3"
            style={{ background: `linear-gradient(135deg, ${COLORS.guinda} 0%, #4a0a12 100%)` }}>
            <div className="text-center text-md-start text-white">
              <h2 className="fw-black mb-2 mb-md-1 d-flex align-items-center justify-content-center justify-content-md-start gap-2">
                <Users size={24} className="d-md-none" />
                <span className="d-none d-md-inline">Panel de Personal</span>
              </h2>
              <p className="opacity-75 mb-0 small text-uppercase fw-bold tracking-wider">
                Sistema de Gestión • {empleados.length} Registros
              </p>
            </div>
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn btn-white btn-sm rounded-3 shadow-sm px-3 d-flex align-items-center gap-2 bg-white fw-bold"
                onClick={fetchEmpleados} disabled={refreshing}>
                <RefreshCw size={16} className={refreshing ? 'spin-anim' : ''} />
                <span className="d-none d-md-inline">Refrescar</span>
              </button>
              <button className="btn btn-light btn-sm rounded-3 shadow-sm px-3 d-flex align-items-center gap-2 fw-bold text-dark"
                onClick={() => { setFormData(initialFormState); setShowEmpleadoModal(true); }}>
                <UserPlus size={16} />
                <span className="d-none d-md-inline">Nuevo</span>
              </button>
            </div>
          </div>
        </div>


        <div className="row g-3 g-md-4 flex-grow-1 overflow-hidden" style={{ minHeight: 0 }}>
          {/* LISTA DE EMPLEADOS - Optimizada para móviles */}
          <div className={`col-12 col-lg-4 col-xl-3 h-100 flex-column ${empleadoSeleccionado ? 'd-none d-lg-flex' : 'd-flex'}`}>
            <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden h-100 d-flex flex-column">
              <div className="card-header bg-white border-0 p-3 p-md-3 flex-shrink-0">
                {/* Cinta de Opciones por Categoría */}
                <div className="d-flex flex-wrap gap-1 mb-3 custom-scroll overflow-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'admin', label: 'Admin' },
                    { id: 'operator', label: 'Operador' },
                    { id: 'taller', label: 'Taller' },
                    { id: 'monitorista', label: 'Monitorista' },
                    { id: 'cleaning', label: 'Limpieza' }
                  ].map(role => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${selectedRole === role.id ? 'btn-dark' : 'btn-light text-muted border-0'}`}
                      style={{ fontSize: '11px', letterSpacing: '0.3px' }}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>

                <div className="input-group bg-light rounded-3 border-0 px-2 py-2">
                  <Search size={18} className="text-muted" />
                  <input type="text" className="form-control bg-transparent border-0 shadow-none ps-2"
                    placeholder="Buscar nombre o usuario..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </div>

              <div className="card-body p-2 p-md-3 flex-grow-1 overflow-auto custom-scroll">
                {loading ? (
                  <div className="text-center py-5">
                    <Loader2 className="spin-anim text-muted mx-auto" size={32} />
                    <p className="text-muted small mt-2">Cargando...</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2 px-1">
                    {empleadosFiltrados.length > 0 ? empleadosFiltrados.map((emp) => (
                      <div key={emp.id} onClick={() => setEmpleadoSeleccionado(emp)}
                        className={`p-2 p-md-2 rounded-4 d-flex align-items-center gap-3 transition-all cursor-pointer ${empleadoSeleccionado?.id === emp.id ? 'selected-card' : 'hover-card bg-light'}`}>
                        <div className="flex-shrink-0" style={{ width: 40, height: 40 }}>
                          {emp.foto_perfil ? (
                            <img
                              src={`${EMPLEADOS_UPLOADS_URL}${emp.foto_perfil}`}
                              alt={emp.nombre_completo}
                              className="rounded-circle shadow-sm border"
                              style={{ width: 40, height: 40, objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="rounded-circle bg-white shadow-sm border d-flex align-items-center justify-content-center"
                              style={{ width: 40, height: 40 }}>
                              <User size={16} style={{ color: COLORS.guinda }} />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow-1 overflow-hidden min-w-0">
                          <h6 className="fw-bold mb-1 mb-md-0 text-truncate text-dark">{emp.nombre_completo}</h6>
                          <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-1 gap-md-2">
                            <span className="badge bg-dark bg-opacity-10 text-dark border-0 small text-capitalize px-2" style={{ fontSize: '10px' }}>
                              {getRolLabel(emp.rol)}
                            </span>
                            <span className="small fw-bold d-block d-md-inline" style={{
                              color: emp.estado === 'Activo' ? COLORS.success : COLORS.danger,
                              fontSize: '11px'
                            }}>
                              • {emp.estado}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-muted d-none d-md-block flex-shrink-0" />
                      </div>
                    )) : (
                      <div className="text-center py-5 text-muted small">
                        <Users size={48} className="opacity-25 mb-3" />
                        <p>No se encontraron resultados</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DETALLE DEL EMPLEADO - Optimizado para móviles */}
          <div className={`col-12 col-lg-8 col-xl-9 h-100 flex-column ${!empleadoSeleccionado ? 'd-none d-lg-flex' : 'd-flex'}`}>
            {empleadoSeleccionado ? (
              <div className="card border-0 shadow-sm rounded-4 h-100 bg-white overflow-hidden d-flex flex-column">
                {/* CINTA DE OPCIONES + FECHAS (RIBBON EXTERNO) - MOVIDO AL TOP */}
                <div className="bg-white border-bottom px-3 px-md-4 py-3 d-flex flex-column flex-xl-row justify-content-between align-items-center gap-3">
                     {/* CINTA DE OPCIONES (RIBBON) */}
                      <div className="d-flex flex-wrap justify-content-center justify-content-xl-start gap-2 p-1 bg-light rounded-4 border align-items-center">
                        {[
                          { id: 'general', label: 'General', icon: <LayoutDashboard size={14}/> },
                          { id: 'historial', label: 'Historial', icon: <Activity size={14}/> },
                          { id: 'inspecciones', label: 'Inspecciones', icon: <List size={14}/> },
                          { id: 'comparativa', label: 'Comparativa', icon: <TrendingUp size={14}/> }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`btn btn-sm rounded-pill d-flex align-items-center gap-2 px-3 py-2 fw-bold transition-all border-0 ${activeTab === tab.id ? 'btn-white text-dark shadow-sm' : 'btn-transparent text-muted'}`}
                            style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', letterSpacing: '0.3px' }}
                          >
                            {tab.icon} {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* SELECTOR DE FECHAS (GLOBAL) */}
                      <div className="d-flex flex-wrap justify-content-center justify-content-sm-start gap-2 bg-light p-2 rounded-4 border align-items-center">
                          <div className="d-flex align-items-center gap-2 px-3">
                             <span className="text-secondary fw-bold small text-uppercase me-1" style={{ fontSize: '10px' }}>Desde:</span>
                             <input
                              type="date"
                              className="border-0 bg-transparent fw-bold small text-dark"
                              style={{ outline: 'none', width: 'auto' }}
                              value={fechas.inicio}
                              onChange={(e) => setFechas(p => ({ ...p, inicio: e.target.value }))}
                            />
                            <div className="vr mx-2 opacity-25"></div>
                            <span className="text-secondary fw-bold small text-uppercase me-1" style={{ fontSize: '10px' }}>Hasta:</span>
                             <input
                              type="date"
                              className="border-0 bg-transparent fw-bold small text-dark"
                              style={{ outline: 'none', width: 'auto' }}
                              value={fechas.fin}
                              onChange={(e) => setFechas(p => ({ ...p, fin: e.target.value }))}
                            />
                          </div>
                      </div>
                </div>

                <div className="card-header bg-white border-0 p-3 p-md-4 d-flex flex-wrap justify-content-between align-items-center gap-3 border-bottom flex-shrink-0">
                  <div className="d-flex align-items-center gap-3">
                    {/* Botón Volver (Solo Móvil) */}
                    <button 
                      className="btn btn-light btn-sm rounded-circle d-lg-none shadow-sm flex-shrink-0"
                      onClick={() => setEmpleadoSeleccionado(null)}
                      style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
                    </button>

                    {empleadoSeleccionado.foto_perfil ? (
                      <img
                        src={`${EMPLEADOS_UPLOADS_URL}${empleadoSeleccionado.foto_perfil}`}
                        alt={empleadoSeleccionado.nombre_completo}
                        className="rounded-4 shadow flex-shrink-0"
                        style={{ width: 56, height: 56, objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="bg-dark text-white rounded-4 shadow flex-shrink-0 d-flex align-items-center justify-content-center"
                        style={{ width: 56, height: 56 }}>
                        <User size={24} />
                      </div>
                    )}
                    <div>
                      <h4 className="fw-black mb-0 text-dark d-none d-md-block">{empleadoSeleccionado.nombre_completo}</h4>
                      <h5 className="fw-black mb-0 text-dark d-block d-md-none">{empleadoSeleccionado.nombre_completo}</h5>
                      <div className="d-flex flex-column flex-md-row gap-1 gap-md-2 align-items-center align-items-md-start">
                        <span className="badge bg-secondary text-uppercase" style={{ fontSize: '10px' }}>{getRolLabel(empleadoSeleccionado.rol)}</span>

                        {/* Mostrar unidad asignada si existe */}
                        {empleadoSeleccionado.unidad_nombre && (
                          <span className="badge rounded-pill bg-danger text-white text-uppercase px-2 shadow-sm" style={{ fontSize: '10px' }}>
                            <Car size={10} className="me-1" />
                            {empleadoSeleccionado.unidad_nombre}
                          </span>
                        )}

                        {/* Mostrar horario si existe */}
                        {empleadoSeleccionado.horario_entrada && empleadoSeleccionado.horario_salida && (
                          <span className="badge rounded-pill bg-primary text-white text-uppercase px-2 shadow-sm" style={{ fontSize: '10px', backgroundColor: COLORS.info }}>
                            <Clock size={10} className="me-1" />
                            {empleadoSeleccionado.horario_entrada.slice(0, 5)} - {empleadoSeleccionado.horario_salida.slice(0, 5)}
                          </span>
                        )}

                        <span className="text-muted small">ID: #{empleadoSeleccionado.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex gap-2 flex-wrap justify-content-center justify-content-md-start">

                    <button className="btn btn-outline-dark btn-sm rounded-3 px-3 d-flex align-items-center gap-2"
                      onClick={() => setShowAsignarUnidadModal(true)}>
                      <Car size={16} />
                      <span className="d-none d-md-inline">Unidad</span>
                    </button>
                    <button className="btn btn-outline-dark btn-sm rounded-3 px-3 d-flex align-items-center gap-2"
                      onClick={() => setShowHorarioModal(true)}>
                      <RefreshCw size={16} />
                      <span className="d-none d-md-inline">Horario</span>
                    </button>
                    <button className="btn btn-primary btn-sm rounded-3 px-3 d-flex align-items-center gap-2"
                      onClick={() => {
                        const emp = { ...empleadoSeleccionado };
                        if (emp.fecha_ingreso) {
                          emp.fecha_ingreso = emp.fecha_ingreso.split('T')[0].split(' ')[0];
                        }
                        setFormData(emp);
                        setShowEmpleadoModal(true);
                      }}>
                      <Edit3 size={16} />
                      <span className="d-none d-md-inline">Editar</span>
                    </button>
                    <button className="btn btn-danger btn-sm rounded-3 px-3 d-flex align-items-center gap-2"
                      onClick={() => { setEmpleadoAEliminar(empleadoSeleccionado); setShowEliminarModal(true); }}>
                      <Trash2 size={16} />
                      <span className="d-none d-md-inline">Eliminar</span>
                    </button>
                  </div>
                </div>

                <div
                  ref={detalleRef}
                  className="card-body p-3 p-md-4 flex-grow-1 overflow-auto custom-scroll"
                >
                  <EmpleadoDetalle
                    empleado={empleadoSeleccionado}
                    onUnidadChange={fetchEmpleados}
                    activeTab={activeTab}
                    fechas={fechas}
                    setFechas={setFechas}
                  />
                </div>
              </div>
            ) : (
              <div className="card border-0 shadow-sm rounded-4 h-100 d-flex flex-column justify-content-center align-items-center bg-white p-4 p-md-5">
                <div className="bg-light rounded-circle p-4 mb-4">
                  <Users size={48} className="text-muted opacity-50" />
                </div>
                <h5 className="fw-bold text-center">Selecciona un Colaborador</h5>
                <p className="text-muted text-center small">
                  Haz clic en un registro de la lista para gestionar su expediente y liquidaciones.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL ELIMINAR */}
      {showEliminarModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999
        }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-body p-4 text-center">
                <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-3 d-inline-block mx-auto mb-3">
                  <AlertCircle size={48} />
                </div>
                <h4 className="fw-bold mb-3">¿Confirmar Baja?</h4>
                <p className="text-muted mb-4">
                  Estás por eliminar a <b>{empleadoAEliminar?.nombre_completo}</b>. <br />
                  Esta acción es permanente y afectará los registros históricos.
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    className="btn btn-light rounded-3 px-4 fw-bold"
                    onClick={() => setShowEliminarModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-danger rounded-3 px-4 fw-bold"
                    disabled={isDeleting}
                    onClick={handleEliminar}
                  >
                    {isDeleting ? 'Procesando...' : 'Sí, Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FORMULARIO */}
      {showEmpleadoModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-2xl">
              <EmpleadoFormModal
                formData={formData}
                isSubmitting={isSubmitting}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                onClose={() => setShowEmpleadoModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL ASIGNAR UNIDAD */}
      {showAsignarUnidadModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-2xl">
              <UnidadManager
                empleado={empleadoSeleccionado}
                onAsignar={fetchEmpleados}
                onClose={() => setShowAsignarUnidadModal(false)}
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL HORARIO */}
      {showHorarioModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-2xl">
              <HorarioManager
                empleado={empleadoSeleccionado}
                onSave={fetchEmpleados}
                onClose={() => setShowHorarioModal(false)}
              />
            </div>
          </div>
        </div>
      )}


    </div>
  );
}