import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Wrench, Plus, Loader2, Car, BarChart3, BookOpen, AlertTriangle, Archive, Info, FileText, DollarSign, ShoppingBag } from 'lucide-react';

import ModalMantenimiento from '../components/Autos/mantenimiento/ModalMantenimiento';
import TablaMantenimiento from '../components/Autos/mantenimiento/TablaMantenimiento';
import DetalleVehiculoSide from '../components/Autos/mantenimiento/DetalleVehiculoSide'; // Still needed for legacy logic if any, or can keep solely for backward compat if desired. Actually, checking impl, let's keep clean.
import ModalManual from '../components/Autos/mantenimiento/ModalManual';
import ModalBorrar from '../components/Autos/estatus/ModalBorrar';

// Nuevos componentes de Taller
import InventarioTaller from '../components/Autos/mantenimiento/InventarioTaller';
import AlertasVehiculo from '../components/Autos/mantenimiento/AlertasVehiculo';
import GraficoPresupuesto from '../components/Autos/mantenimiento/GraficoPresupuesto';
import TarjetaInformacion from '../components/Autos/mantenimiento/TarjetaInformacion';
import TarjetaCiclo from '../components/Autos/mantenimiento/TarjetaCiclo';
import TarjetaEquipamiento from '../components/Autos/mantenimiento/TarjetaEquipamiento';
import NotasVehiculo from '../components/Autos/mantenimiento/NotasVehiculo';
import GastosPiezasTaller from '../components/Autos/mantenimiento/GastosPiezasTaller';

import {
  MANTENIMIENTO_URL as API_MAINTENANCE_URL,
  API_URL as API_VEHICULOS_URL,
  MODIFICAR_URL,
  TALLER_STATUS_URL,
  TALLER_ALERTAS_URL,
  TALLER_NOTAS_URL
} from '../config.js';

// Mapped categories for dropdown/logic if needed, or imported
const CATEGORIAS_MANTO = [
  "Aceite", "Frenos", "Llantas", "Tune Up", 
  "Combustible", "Lavado", "Servicio General", 
  "Seguro", "Trámites (Placas/Tenencia)", "Verificación Ecológica", "Otro"
];

export default function Mantenimiento({ user }) {
  const [registros, setRegistros] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [unidadSeleccionadaId, setUnidadSeleccionadaId] = useState(null);
  
  // Modals state
  const [showModalMantenimiento, setShowModalMantenimiento] = useState(false);
  const [maintenanceToDelete, setMaintenanceToDelete] = useState(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [confirmarEstado, setConfirmarEstado] = useState(null);

  const [alertasUnidad, setAlertasUnidad] = useState([]);

  // Tabs: 'resumen', 'historial', 'presupuesto', 'equipamiento', 'notas', 'inventario'
  const [activeTab, setActiveTab] = useState('notas');

  // Fetch alerts when unit changes
  useEffect(() => {
    if (unidadSeleccionadaId) {
      fetch(`${TALLER_ALERTAS_URL}?unidad_id=${unidadSeleccionadaId}`)
        .then(res => res.ok ? res.json() : [])
        .then(setAlertasUnidad)
        .catch(e => console.error("Error alerts:", e));
    } else {
      setAlertasUnidad([]);
    }
  }, [unidadSeleccionadaId]);

  // Security check: redirect from restricted tabs if role changed or invalid
  useEffect(() => {
    if (activeTab === 'presupuesto' && !['admin', 'development'].includes(user?.rol)) {
        setActiveTab('resumen');
    }
  }, [activeTab, user]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resV, resM] = await Promise.allSettled([
        fetch(API_VEHICULOS_URL).then(r => r.ok ? r.json() : []),
        fetch(API_MAINTENANCE_URL).then(r => r.ok ? r.json() : [])
      ]);

      let maintenanceData = resM.status === 'fulfilled' ? resM.value : [];
      if (!Array.isArray(maintenanceData)) {
         maintenanceData = maintenanceData.data || maintenanceData.mantenimientos || [];
         if (!Array.isArray(maintenanceData)) maintenanceData = [];
      }
      setRegistros(maintenanceData);

      let vehiculosData = resV.status === 'fulfilled' ? resV.value : [];
      if (!Array.isArray(vehiculosData)) {
         vehiculosData = vehiculosData.data || vehiculosData.vehiculos || [];
         if (!Array.isArray(vehiculosData)) vehiculosData = [];
      }

      const dataV = vehiculosData.map(v => {
        // Calculate last maintenance date
        const unitMaintenance = maintenanceData
            .filter(m => String(m.unidad_id) === String(v.id))
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        const lastMaint = unitMaintenance.length > 0 ? unitMaintenance[0] : null;

        return {
          ...v,
          kilometraje_actual: parseInt(v.kilometraje_actual || 0),
          manual_url: v.manual_url || v.url_manual || '',
          ultimo_mantenimiento: lastMaint // Attach full object
        };
      });
      setVehiculos(dataV);
      
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const vehiculoSeleccionado = useMemo(() =>
    vehiculos.find(v => String(v.id) === String(unidadSeleccionadaId)) || null
    , [vehiculos, unidadSeleccionadaId]);

  // Fetch quick notes for the selected vehicle (for TarjetaCiclo)
  const [notasResumen, setNotasResumen] = useState([]);
  
  useEffect(() => {
    if (vehiculoSeleccionado?.id) {
        fetch(`${TALLER_NOTAS_URL}?vehiculo_id=${vehiculoSeleccionado.id}`)
            .then(res => res.ok ? res.json() : [])
            .then(data => setNotasResumen(data))
            .catch(err => console.error("Error fetching notes:", err));
    } else {
        setNotasResumen([]);
    }
  }, [vehiculoSeleccionado?.id]);

  const registrosFiltrados = useMemo(() => {
    return (registros || []).filter(reg => {
      const matchUnidad = unidadSeleccionadaId ? String(reg.unidad_id) === String(unidadSeleccionadaId) : true;
      const term = searchTerm.toLowerCase();
      return matchUnidad && (
        reg.descripcion?.toLowerCase().includes(term) || 
        reg.tipo?.toLowerCase().includes(term) ||
        reg.responsable?.toLowerCase().includes(term) // Added responsable to search
      );
    }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [registros, unidadSeleccionadaId, searchTerm]);

  const confirmDelete = async () => {
    if (!maintenanceToDelete) return;
    try {
      const response = await fetch(`${API_MAINTENANCE_URL}?id=${maintenanceToDelete.id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.status === "success") {
        setMaintenanceToDelete(null);
        fetchData();
      } else {
        alert("Error: " + (result.message || "No se pudo eliminar"));
      }
    } catch (e) {
      console.error("Error en eliminación:", e);
      alert("Error de conexión al eliminar");
    }
  };

  const handleDeleteClick = (reg) => {
      setMaintenanceToDelete(reg);
  };

  const actualizarEstado = async (nuevoEstado) => {
    if (!vehiculoSeleccionado) return;
    // Direct update logic or via modal confirmation if strict
    // Assuming direct update for smoother UX as per extraction
    try {
        await fetch(TALLER_STATUS_URL, {
        method: 'POST',
        body: JSON.stringify({ id: vehiculoSeleccionado.id, estado: nuevoEstado })
        });
        fetchData(); 
    } catch(e) { console.error(e); }
  };
  
  const handleGuardarMantenimiento = () => {
      fetchData();
      setShowModalMantenimiento(false);
  }

  if (loading) return (
    <div className="d-flex flex-column justify-content-center align-items-center py-5" style={{ minHeight: 'calc(100vh - 100px)' }}>
      <div className="bg-white rounded-4 p-5 shadow-lg">
        <div className="bg-primary bg-opacity-10 rounded-circle p-4 mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
          <Loader2 className="text-primary animate-spin" size={40} />
        </div>
        <h4 className="text-primary fw-bold mb-2">Actualizando Taller...</h4>
        <p className="text-muted small mb-0">Cargando información de la flota</p>
      </div>
    </div>
  );

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="container-fluid py-4 px-lg-5" style={{ maxWidth: '100%' }}>
        
        {/* Header Principal (Estilo Dashboard) */}
        <div
          className="text-white rounded-4 p-4 mb-5 shadow-lg border-0 d-flex flex-column flex-md-row justify-content-between align-items-center animate__animated animate__fadeIn"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            boxShadow: "rgba(15, 23, 42, 0.3) 0px 10px 30px"
          }}
        >
          <div className="d-flex align-items-center gap-3 text-center text-md-start">
            <div className="d-none d-sm-flex align-items-center justify-content-center bg-white bg-opacity-10 rounded-4" style={{ width: '58px', height: '58px' }}>
              <Wrench size={32} color="white" strokeWidth={2.2} />
            </div>

            <div className="d-flex flex-column">
              <h1 className="fw-bold mb-0" style={{ fontSize: '2rem' }}>Gestión de Taller</h1>
              <p className="text-white-50 mb-0 text-uppercase tracking-widest" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>
                Control y Presupuesto de Flota
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-4 mt-3 mt-md-0">
             <div className="bg-white bg-opacity-10 px-4 py-2 rounded-pill border border-white border-opacity-10 d-flex align-items-center gap-2">
                <Car size={20} className="text-white opacity-70" />
                <span className="fw-bold text-white text-uppercase" style={{ letterSpacing: '0.5px', fontSize: '0.9rem' }}>
                  {vehiculos.length} Unidades
                </span>
             </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Panel de Unidades (Columna Izquierda) */}
          <div className="col-12 col-xl-2">
            {/* Header Alineado con Tabs */}
            <div className="d-flex align-items-center justify-content-center mb-4 p-2 bg-white rounded-pill shadow-sm d-flex">
              <div className="btn btn-white border-0 fw-bold text-dark small text-uppercase letter-spacing-1 d-flex align-items-center gap-2 px-3 disabled" style={{opacity: 1}}>
                 <Car className="text-primary" size={18}/> Unidades
              </div>
            </div>
            
            <div className="overflow-auto list-unidades pe-2" style={{ maxHeight: '75vh', overflowX: 'hidden' }}>
              {vehiculos.map(v => (
                <div
                  key={v.id}
                  onClick={() => { 
                    if (unidadSeleccionadaId === v.id) {
                        setUnidadSeleccionadaId(null);
                        setActiveTab('notas');
                    } else {
                        setUnidadSeleccionadaId(v.id);
                        setActiveTab('resumen');
                    }
                  }}
                  className={`card border-0 mb-3 cursor-pointer transition-all ${unidadSeleccionadaId === v.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white shadow-sm hover-shadow'
                    }`}
                  style={{
                    borderRadius: '16px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className={`fw-bold mb-0 ${unidadSeleccionadaId === v.id ? 'text-white' : 'text-dark'}`} style={{ fontSize: '1.1rem' }}>{v.unidad_nombre}</h6>
                    </div>
                    <div className="d-flex justify-content-between opacity-75 align-items-center">
                      <span className={`fw-bold ${unidadSeleccionadaId === v.id ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>{v.placas}</span>
                      
                      {/* Indicador de Estado - Simplificado cuando seleccionado */}
                      {unidadSeleccionadaId === v.id ? (
                           <span className="badge bg-white bg-opacity-25 text-white rounded-pill border-0" style={{ fontSize: '0.75rem' }}>
                              {v.estado.toUpperCase()}
                           </span>
                      ) : (
                          <span className={`badge ${
                            v.estado === 'Activo' ? 'bg-success bg-opacity-10 text-success' : 
                            v.estado === 'En Taller' ? 'bg-warning bg-opacity-10 text-warning' : 
                            v.estado === 'Baja' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-secondary bg-opacity-10 text-secondary'
                          } rounded-pill border-0`} style={{ fontSize: '0.75rem', fontWeight: '800' }}>
                            {v.estado.toUpperCase()}
                          </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel Principal (Tabs + Contenido) */}
          <div className="col-12 col-xl-10">
            
            {/* Si no hay unidad seleccionada y NO estamos en Inventario, Notas o Alertas Globales */}
            {!unidadSeleccionadaId && !['inventario', 'notas', 'alertas'].includes(activeTab) ? (
               <div className="text-center py-5 mt-5 animate__animated animate__fadeIn">
                  <div className="bg-white rounded-circle p-5 d-inline-block shadow-lg mb-4">
                     <Car size={64} className="text-primary opacity-50" />
                  </div>
                  <h3 className="fw-bold text-dark">Selecciona una Unidad</h3>
                  <p className="text-muted fs-5">Elige un vehículo del panel izquierdo para ver su expediente.</p>
                  <div className="d-flex gap-3 justify-content-center mt-3">
                      <button className="btn btn-outline-primary rounded-pill px-4 fw-bold shadow-sm" onClick={() => setActiveTab('inventario')}>
                          <Archive size={18} className="me-2"/> Inventario Global
                      </button>
                      <button className="btn btn-outline-warning rounded-pill px-4 fw-bold shadow-sm" onClick={() => setActiveTab('alertas')}>
                          <AlertTriangle size={18} className="me-2"/> Alertas Globales
                      </button>
                      <button className="btn btn-outline-secondary rounded-pill px-4 fw-bold shadow-sm" onClick={() => setActiveTab('notas')}>
                          <FileText size={18} className="me-2"/> Notas de Taller
                      </button>
                  </div>
               </div>
            ) : (
              <>
                 {/* Navegación de Pestañas */}
                 <div className="d-flex flex-wrap gap-2 mb-4 p-2 bg-white rounded-pill shadow-sm d-inline-flex" style={{maxWidth: '100%', overflowX: 'auto'}}>
                    {[
                      { id: 'resumen', label: 'Resumen', icon: <Info size={18}/>, requiresUnit: true },
                      { id: 'historial', label: 'Historial', icon: <FileText size={18}/>, requiresUnit: true },
                      { id: 'presupuesto', label: 'Presupuesto', icon: <DollarSign size={18}/>, requiresUnit: true },
                      { id: 'equipamiento', label: 'Equipamiento', icon: <Wrench size={18}/>, requiresUnit: true },
                      { id: 'alertas', label: 'Alertas', icon: <AlertTriangle size={18}/>, requiresUnit: false }, // Tab Added
                      { id: 'notas', label: 'Notas', icon: <FileText size={18}/>, requiresUnit: false },
                      { id: 'gastos_piezas', label: 'Gastos / Piezas', icon: <ShoppingBag size={18}/>, requiresUnit: false },
                      { id: 'inventario', label: 'Inventario Taller', icon: <Archive size={18}/>, requiresUnit: false },
                    ].map(tab => {
                        // Filter logic
                        if (tab.id === 'presupuesto' && !['admin', 'development'].includes(user?.rol)) return null;
                        if (tab.requiresUnit && !unidadSeleccionadaId) return null;

                        return (
                           <button
                             key={tab.id}
                             onClick={() => setActiveTab(tab.id)}
                             className={`btn rounded-pill d-flex align-items-center gap-2 px-4 fw-bold transition-all ${activeTab === tab.id ? 'btn-primary shadow-sm' : 'btn-light text-muted bg-white border-0'}`}
                             style={{ whiteSpace: 'nowrap' }}
                           >
                             {tab.icon} {tab.label}
                           </button>
                        );
                    })}
                 </div>

                 {/* Contenido de Pestañas */}
                 <div className="animate__animated animate__fadeIn">
                    
                    {/* 1. RESUMEN: Info, Specs, Estado + Ciclo Mantenimiento */}
                    {activeTab === 'resumen' && vehiculoSeleccionado && (
                        <div className="row g-4">
                           <div className="col-12 col-lg-7">
                              <TarjetaInformacion 
                                 unidad={vehiculoSeleccionado} 
                                 onEstadoChange={actualizarEstado} 
                                 onManualOpen={() => setShowManualModal(true)} 
                                 onUpdate={fetchData}
                              />
                           </div>
                           <div className="col-12 col-lg-5">
                              <TarjetaCiclo 
                                  unidad={vehiculoSeleccionado} 
                                  alertas={alertasUnidad} 
                                  notas={notasResumen || []}
                              />
                           </div>
                        </div>
                    )}

                    {/* 2. HISTORIAL: Tabla de Mantenimientos */}
                    {activeTab === 'historial' && (
                        <div>
                           {vehiculoSeleccionado && (
                               <div className="d-flex justify-content-end mb-3">
                                  <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
                                          onClick={() => setShowModalMantenimiento(true)}>
                                      <Plus size={18} /> Nuevo Registro
                                  </button>
                               </div>
                           )}
                           <TablaMantenimiento 
                              registros={registrosFiltrados}
                              searchTerm={searchTerm}
                              setSearchTerm={setSearchTerm}
                              unidadSeleccionada={vehiculoSeleccionado}
                              onDelete={handleDeleteClick}
                           />
                        </div>
                    )}

                    {/* 3. PRESUPUESTO: Gráfico */}
                    {activeTab === 'presupuesto' && vehiculoSeleccionado && (
                        <div className="row justify-content-center">
                           <div className="col-12">
                              <GraficoPresupuesto 
                                 vehiculo={vehiculoSeleccionado} 
                                 mantenimientos={registros.filter(m => String(m.unidad_id) === String(vehiculoSeleccionado.id) && new Date(m.fecha).getFullYear() === new Date().getFullYear())} 
                              />
                           </div>
                        </div>
                    )}

                    {/* 4. EQUIPAMIENTO: Checklist */}
                    {activeTab === 'equipamiento' && vehiculoSeleccionado && (
                        <div className="row justify-content-center">
                           <div className="col-12 col-md-8 col-lg-6">
                              <TarjetaEquipamiento 
                                 unidad={vehiculoSeleccionado} 
                                 onRefresh={fetchData} 
                              />
                           </div>
                        </div>
                    )}

                     {/* 5. ALERTAS */}
                     {activeTab === 'alertas' && (
                         <div className="row justify-content-center">
                            <div className="col-12 col-md-8">
                               <AlertasVehiculo 
                                  unidadId={unidadSeleccionadaId} 
                                  vehiculos={vehiculos} 
                               />
                            </div>
                         </div>
                     )}

                    {/* 6. NOTAS */}
                    {activeTab === 'notas' && (
                        <div className="row justify-content-center">
                           <div className="col-12 col-md-10">
                              <NotasVehiculo unidad={vehiculoSeleccionado || null} />
                           </div>
                        </div>
                    )}

                    {/* 6. INVENTARIO GLOBAL */}
                    {activeTab === 'inventario' && (
                        <div className="row justify-content-center">
                           <div className="col-12">
                              <InventarioTaller />
                           </div>
                        </div>
                    )}

                    {/* 7. GASTOS DE PIEZAS */}
                    {activeTab === 'gastos_piezas' && (
                        <div className="row justify-content-center">
                           <div className="col-12">
                              <GastosPiezasTaller unidadId={unidadSeleccionadaId} vehiculos={vehiculos} />
                           </div>
                        </div>
                    )}

                 </div>
              </>
            )}
          </div>

        </div>

        {/* Modales */}
        {showModalMantenimiento && (
          <ModalMantenimiento
            user={user}
            isOpen={true}
            unidad={vehiculoSeleccionado}
            categorias={CATEGORIAS_MANTO}
            onClose={() => setShowModalMantenimiento(false)}
            onSave={handleGuardarMantenimiento}
            registros={registros}
          />
        )}
        
        {showManualModal && vehiculoSeleccionado && (
           <ModalManual 
              isOpen={showManualModal}
              onClose={() => setShowManualModal(false)}
              vehiculo={vehiculoSeleccionado}
           />
        )}

        {maintenanceToDelete && (
          <ModalBorrar
            titulo="¿Eliminar registro de mantenimiento?"
            mensaje={`Se eliminará el registro de ${maintenanceToDelete.tipo} del ${new Date(maintenanceToDelete.fecha).toLocaleDateString()}. Esta acción no se puede deshacer.`}
            onConfirmar={confirmDelete}
            onCancelar={() => setMaintenanceToDelete(null)}
          />
        )}
      </div>
    </div>
  );
}