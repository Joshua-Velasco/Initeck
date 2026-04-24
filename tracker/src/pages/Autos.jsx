import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Loader2, Car, ListFilter, Calendar, Trash2,
  SearchX, EyeOff, Eye, Lock, ShieldAlert, Info, BarChart3, DollarSign
} from 'lucide-react';

// --- IMPORTACIÓN DE COMPONENTES ---
import ModalEdicion from '../components/Autos/modificar/ModalEdicion';
import ModalAgregar from '../components/Autos/agregar/ModalAgregar';
import ModalBorrarUnidad from '../components/Autos/estatus/ModalBorrarUnidad';
import ModalEstado from '../components/Autos/estatus/ModalEstado';
import VehiculosBarra from '../components/Autos/VehiculosBarra';
import VehiculosInfo from '../components/Autos/VehiculosInfo';
import MetricasTarjetas from '../components/Autos/MetricasTarjetas';
import GraficoPresupuesto from '../components/Autos/mantenimiento/GraficoPresupuesto';
import CalendarioPagos from '../components/Autos/CalendarioPagos';
import CarruselVehiculo from '../components/Autos/CarruselVehiculo';
import TargetaAuto from '../components/Autos/TargetaAuto';
import VehicleFinance from '../components/Autos/VehicleFinance';

import {
  API_URL,
  MODIFICAR_URL,
  ELIMINAR_URL,
  ANADIR_URL,
  GASTOS_COMBUSTIBLE_URL,
  MANTENIMIENTO_URL,
  TALLER_GASTOS_PIEZAS_URL
} from '../config.js';

const COLORS = {
  primary: "#0f172a", tech: "#64748b", insurance: "#3b82f6",
  fuel: "#eab308", oil: "#f97316", tires: "#8b5cf6"
};

// Componente para cubrir secciones privadas
const OverlayPrivacidad = () => (
  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center rounded-4"
    style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)', zIndex: 10 }}>
    <Lock className="text-primary mb-2" size={32} />
    <span className="fw-bold text-dark small">Información Protegida</span>
  </div>
);

const PuntoEstado = ({ estado }) => {
  const colors = { 'Activo': '#22c55e', 'Mantenimiento': '#eab308', 'En Taller': '#f97316', 'Baja': '#ef4444' };
  return <span style={{ width: '8px', height: '8px', backgroundColor: colors[estado] || '#94a3b8', borderRadius: '50%', display: 'inline-block' }} />;
};

export default function Autos({ user }) {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [unidadParaEliminar, setUnidadParaEliminar] = useState(null);
  const [mostrarGraficos, setMostrarGraficos] = useState(false);
  const [ocultarInfoSensible, setOcultarInfoSensible] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // Tab activo: 'general' o 'metricas'
  const [modalEstado, setModalEstado] = useState({
    mostrar: false,
    tipo: 'success',
    titulo: '',
    mensaje: ''
  });
  const [gastosCombustible, setGastosCombustible] = useState({ total: 0, gastos: [] });
  const [mantenimientos, setMantenimientos] = useState([]);
  const [gastosPiezasTotal, setGastosPiezasTotal] = useState(0);

  const lateralScrollStyle = { maxHeight: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' };

  const fetchVehiculos = useCallback(async (idToSelect = null) => {
    setRefreshing(true);
    try {
      // 1. Intentamos la petición
      const response = await fetch(`${API_URL}?cache_bust=${Date.now()}`);

      // 2. Verificamos si la respuesta es correcta (Status 200-299)
      if (!response.ok) {
        throw new Error(`Error HTTP! estado: ${response.status}. Revisa la ruta: ${API_URL}`);
      }

      // 3. Leemos el cuerpo como texto primero para validar
      const text = await response.text();

      if (!text) {
        throw new Error("El servidor devolvió una respuesta vacía (Empty response)");
      }

      // 4. Intentamos convertir a JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("El servidor no envió JSON. Recibiste esto:", text);
        throw new Error("La respuesta del servidor no es un JSON válido.");
      }

      // 5. Procesamos la lista como ya lo hacías
      const lista = Array.isArray(data) ? data : [];
      setVehiculos(lista);

      if (idToSelect || vehiculoSeleccionado?.id) {
        const targetId = idToSelect || vehiculoSeleccionado?.id;
        const found = lista.find(v => String(v.id) === String(targetId));
        if (found) setVehiculoSeleccionado(found);
      }

    } catch (e) {
      // Este log ahora te dirá la verdad sobre el error
      console.error("🔴 Error en fetchVehiculos:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [vehiculoSeleccionado?.id]);

  useEffect(() => { 
    fetchVehiculos(); 
  }, []);

  useEffect(() => {
    setMostrarGraficos(false);
    if (vehiculoSeleccionado) {
      const timer = setTimeout(() => setMostrarGraficos(true), 150);
      return () => clearTimeout(timer);
    }
  }, [vehiculoSeleccionado?.id]);

  // Fetch gastos de combustible cuando cambia el vehículo seleccionado
  useEffect(() => {
    if (vehiculoSeleccionado?.id) {
      fetch(`${GASTOS_COMBUSTIBLE_URL}?vehiculo_id=${vehiculoSeleccionado.id}`)
        .then(res => res.ok ? res.json() : { total_gastado: 0, gastos: [] })
        .then(data => {
          if (data.status === 'success') {
            setGastosCombustible({ total: data.total_gastado || 0, gastos: data.gastos || [] });
          }
        })
        .catch(e => console.error('Error fetching gastos combustible:', e));
    }
  }, [vehiculoSeleccionado?.id]);

  // Fetch mantenimientos cuando cambia el vehículo seleccionado
  useEffect(() => {
    if (!vehiculoSeleccionado?.id) { setMantenimientos([]); return; }
    fetch(`${MANTENIMIENTO_URL}?vehiculo_id=${vehiculoSeleccionado.id}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const list = Array.isArray(data) ? data
          : Array.isArray(data?.data) ? data.data
          : Array.isArray(data?.mantenimientos) ? data.mantenimientos
          : [];
        setMantenimientos(list);
      })
      .catch(() => setMantenimientos([]));
  }, [vehiculoSeleccionado?.id]);

  // Fetch gastos de piezas/taller cuando cambia el vehículo seleccionado
  useEffect(() => {
    if (!vehiculoSeleccionado?.id) { setGastosPiezasTotal(0); return; }
    const currentYear = new Date().getFullYear();
    fetch(`${TALLER_GASTOS_PIEZAS_URL}?unidad_id=${vehiculoSeleccionado.id}&vehiculo_id=${vehiculoSeleccionado.id}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          const delAño = data.filter(g => g.fecha && parseInt(String(g.fecha).split('-')[0], 10) === currentYear);
          setGastosPiezasTotal(delAño.reduce((s, g) => s + parseFloat(g.costo_total || 0), 0));
        }
      })
      .catch(() => setGastosPiezasTotal(0));
  }, [vehiculoSeleccionado?.id]);

  // Filtrado de vehículos
  const filteredVehicles = useMemo(() => {
    return vehiculos.filter(v => {
      const s = searchTerm.toLowerCase();
      const matchSearch = !searchTerm || (v.unidad_nombre || "").toLowerCase().includes(s) || (v.placas || "").toLowerCase().includes(s);
      const matchStatus = filterStatus === "Todos" || v.estado === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [vehiculos, searchTerm, filterStatus]);

  // Métricas
  const metricasTotales = useMemo(() => {
    if (!vehiculoSeleccionado) return { diario: 0, semanal: 0, mensual: 0, proyectado: 0, realizado: 0, pendiente: 0 };
    const v = vehiculoSeleccionado;
    
    // Mapeo de campos de costo vs sus campos de fecha de pago (sin gasolina)
    const configuracionGastos = [
      { costo: 'costo_seguro_anual',            fecha: 'fecha_pago_seguro' },
      { costo: 'costo_deducible_seguro_anual',  fecha: null },
      { costo: 'costo_aceite_anual',            fecha: null },
      { costo: 'costo_ecologico_anual',         fecha: 'fecha_pago_ecologico' },
      { costo: 'costo_placas_anual',            fecha: 'fecha_pago_placas' },
      { costo: 'costo_servicio_general_anual',  fecha: 'fecha_proximo_mantenimiento' },
      { costo: 'costo_llantas_anual',           fecha: null },
      { costo: 'costo_tuneup_anual',            fecha: null },
      { costo: 'costo_frenos_anual',            fecha: null },
      { costo: 'costo_lavado_anual',            fecha: null }
    ];

    let proyectado = 0;
    let realizado = 0;

    configuracionGastos.forEach(g => {
      const monto = parseFloat(v[g.costo]) || 0;
      proyectado += monto;
      if (g.fecha && v[g.fecha] && v[g.fecha] !== '0000-00-00') {
        realizado += monto;
      }
    });

    const pendiente = proyectado - realizado;

    // Gastado real: misma lógica que GraficoPresupuesto (Métricas tab)
    const currentYear = new Date().getFullYear();
    const tallerGastado = mantenimientos
      .filter(m => new Date(m.fecha).getFullYear() === currentYear)
      .reduce((s, m) => s + parseFloat(m.costo_total || 0), 0);

    const finanzaFija = [
      { dateField: 'fecha_pago_placas',    limitField: 'costo_placas_anual' },
      { dateField: 'fecha_pago_seguro',    limitField: 'costo_seguro_anual' },
      { dateField: 'fecha_pago_ecologico', limitField: 'costo_ecologico_anual' },
    ].reduce((sum, { dateField, limitField }) => {
      const fecha = v[dateField];
      if (!fecha || fecha === '0000-00-00') return sum;
      if (parseInt(String(fecha).split('-')[0], 10) !== currentYear) return sum;
      return sum + (parseFloat(v[limitField]) || 0);
    }, 0);

    const gastadoReal = tallerGastado + parseFloat(gastosCombustible.total || 0) + gastosPiezasTotal + finanzaFija;

    return {
      anual: proyectado,
      proyectado,
      realizado,
      pendiente,
      gastadoReal,
      mensual: proyectado / 12,
      semanal: proyectado / 52,
      diario: proyectado / 365
    };
  }, [vehiculoSeleccionado, mantenimientos, gastosCombustible.total, gastosPiezasTotal]);

  const handleGuardarCambios = async (formData) => {
    try {
      const res = await fetch(MODIFICAR_URL, { method: 'POST', body: formData });
      
      // Intentar parsear JSON
      let data;
      try {
        const text = await res.text();
        data = JSON.parse(text);
      } catch (e) {
        console.error("Error al parsear respuesta del servidor (Posible error 500 HTML):", text);
        return { success: false, message: `Error del servidor (${res.status}): ${res.statusText}. Verifica la consola.` };
      }

      if (data.status === 'success' || data.success) {
        // Extraer los datos del FormData para actualizar el vehículo seleccionado
        const nuevosDatos = {};
        for (let [key, value] of formData.entries()) {
          if (key !== 'accion' && key !== 'id' && key !== 'fotos_restantes' && key !== 'fotos_eliminar') {
            nuevosDatos[key] = value;
          }
        }

        // Actualizar el vehículo seleccionado con los nuevos datos
        if (vehiculoSeleccionado) {
          setVehiculoSeleccionado(prev => ({
            ...prev,
            ...nuevosDatos
          }));
        }

        // Recargar la lista completa para mantener sincronía
        await fetchVehiculos(vehiculoSeleccionado?.id);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || "La API devolvió un error desconocido." };
    } catch (error) {
      console.error("Error al guardar:", error);
      return { success: false, message: error.message };
    }
  };

  const handleEliminarVehiculo = async (id) => {
    // Encontrar el vehículo a eliminar para mostrar en el modal
    const vehiculo = vehiculos.find(v => v.id === id);
    if (vehiculo) {
      setUnidadParaEliminar(vehiculo);
    }
  };

  const cancelarEliminacion = () => {
    setUnidadParaEliminar(null);
  };

  const confirmarEliminacion = async () => {
    if (!unidadParaEliminar) return;

    try {
      const formData = new FormData();
      formData.append('accion', 'eliminar_vehiculo');
      formData.append('id', unidadParaEliminar.id);

      const res = await fetch(ELIMINAR_URL, { method: 'POST', body: formData });
      const data = await res.json();

      if (data.status === 'success' || data.success) {
        // Si el vehículo eliminado estaba seleccionado, limpiar la selección
        if (vehiculoSeleccionado?.id === unidadParaEliminar.id) {
          setVehiculoSeleccionado(null);
        }

        // Recargar la lista de vehículos
        await fetchVehiculos();

        // Cerrar modal y limpiar estado
        setUnidadParaEliminar(null);

        // Mostrar mensaje de éxito
        setModalEstado({
          mostrar: true,
          tipo: 'success',
          titulo: '¡Eliminación Exitosa!',
          mensaje: `El vehículo "${unidadParaEliminar.unidad_nombre}" ha sido eliminado correctamente.`
        });
      } else {
        // Mostrar mensaje de error
        setModalEstado({
          mostrar: true,
          tipo: 'error',
          titulo: 'Error al Eliminar',
          mensaje: data.message || 'Error desconocido al eliminar el vehículo.'
        });
      }
    } catch (error) {
      console.error("Error al eliminar vehículo:", error);
      // Mostrar mensaje de error
      setModalEstado({
        mostrar: true,
        tipo: 'error',
        titulo: 'Error de Conexión',
        mensaje: 'Error al eliminar el vehículo. Por favor, intenta nuevamente.'
      });
    }
  };

  if (loading) return (
    <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-white">
      <Loader2 className="text-primary animate-spin mb-3" size={48} />
      <p className="fw-bold text-muted">Cargando flota...</p>
    </div>
  );

  return (
    <div className="autos-container p-3 p-lg-4 bg-light min-vh-100">
      <div className="container-fluid" style={{ maxWidth: '1800px' }}>

        <VehiculosBarra
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          totalResultados={filteredVehicles.length}
        />

        <div className="row g-4 mt-2">
          {/* --- COLUMNA IZQUIERDA: LISTADO --- */}
          <div className="col-12 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden" style={lateralScrollStyle}>
              <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
                <span className="fw-bold small text-uppercase text-secondary d-flex align-items-center gap-2">
                  <ListFilter size={16} /> Flota
                </span>
                <button
                  onClick={() => setOcultarInfoSensible(!ocultarInfoSensible)}
                  className={`btn btn-sm p-1 border-0 ${ocultarInfoSensible ? 'text-warning' : 'text-muted'}`}
                >
                  {ocultarInfoSensible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="p-2 overflow-auto custom-scrollbar flex-grow-1">
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map(v => (
                    <div
                      key={v.id}
                      className="d-flex align-items-center p-2 mb-2 rounded-4 cursor-pointer border transition-all"
                      style={{
                        border: vehiculoSeleccionado?.id === v.id ? '2px solid var(--bs-primary)' : '1px solid var(--bs-gray-200)',
                        backgroundColor: vehiculoSeleccionado?.id === v.id ? 'var(--bs-primary)' : 'white',
                        color: vehiculoSeleccionado?.id === v.id ? 'white' : 'inherit'
                      }}
                    >
                      <div
                        className="rounded-3 me-2 d-flex align-items-center justify-content-center"
                        style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: vehiculoSeleccionado?.id === v.id ? 'rgba(255,255,255,0.2)' : 'var(--bs-gray-100)',
                          border: vehiculoSeleccionado?.id === v.id ? '1px solid rgba(255,255,255,0.3)' : '1px solid var(--bs-gray-200)'
                        }}
                        onClick={() => setVehiculoSeleccionado(v)}
                      >
                        <Car size={18} className={vehiculoSeleccionado?.id === v.id ? 'text-white' : 'text-muted'} />
                      </div>
                      <div
                        className="flex-grow-1 overflow-hidden"
                        onClick={() => setVehiculoSeleccionado(v)}
                      >
                        <div className="fw-bold text-truncate" style={{ fontSize: '0.8rem' }}>{v.unidad_nombre}</div>
                        <div className="small opacity-75 d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                          {v.placas} <PuntoEstado estado={v.estado} />
                        </div>
                      </div>
                      <button
                        className={`btn btn-sm p-1 border-0 ${vehiculoSeleccionado?.id === v.id ? 'text-white' : 'text-danger'
                          } opacity-50 hover-opacity-100`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEliminarVehiculo(v.id);
                        }}
                        title="Eliminar vehículo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-5 text-center">
                    <SearchX size={32} className="text-muted opacity-50 mb-2" />
                    <p className="small text-muted mb-0">No hay coincidencias</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- COLUMNA CENTRAL Y DERECHA: DETALLES --- */}
          {filteredVehicles.length > 0 ? (
            <>
              <div className="col-12 col-lg-9">
                {!vehiculoSeleccionado ? (
                  <div className="card border-0 shadow-sm rounded-4 bg-white d-flex flex-column justify-content-center align-items-center p-5 text-center" style={{ minHeight: '520px' }}>
                    <Car size={48} className="text-primary opacity-20 mb-3" />
                    <h5 className="fw-bold">Selecciona una unidad</h5>
                    <p className="text-muted small">Haz clic en un vehículo de la lista para ver sus detalles.</p>
                  </div>
                ) : (
                  <>
                    {/* Navegación de Pestañas */}
                    <div className="d-flex flex-wrap gap-2 mb-4 p-2 bg-white rounded-pill shadow-sm d-inline-flex" style={{maxWidth: '100%', overflowX: 'auto'}}>
                      {[
                        { id: 'general', label: 'General', icon: <Info size={18}/> },
                        { id: 'metricas', label: 'Métricas', icon: <BarChart3 size={18}/> },
                        { id: 'finanzas', label: 'Finanzas', icon: <DollarSign size={18}/> },
                      ].map(tab => {
                        // Filtrar tab de métricas si no es admin/development
                        if (tab.id === 'metricas' && !['admin', 'development'].includes(user?.rol)) return null;

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
                      
                      {/* TAB GENERAL */}
                      {activeTab === 'general' && (
                        <div className="row g-3">
                          {/* Métricas superiores */}
                          <div className="col-12">
                            <div className="card border-0 shadow-sm rounded-4 bg-white p-3 position-relative overflow-hidden">
                              <MetricasTarjetas totales={metricasTotales} />
                              {ocultarInfoSensible && <OverlayPrivacidad />}
                            </div>
                          </div>

                          {/* Tarjeta del Auto - Ancho Completo */}
                          <div className="col-12">
                            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 position-relative overflow-hidden">
                              <TargetaAuto vehiculo={vehiculoSeleccionado} />
                              {ocultarInfoSensible && <OverlayPrivacidad />}
                            </div>
                          </div>

                          {/* Galería de Fotos */}
                          <div className="col-12 col-lg-6">
                            <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden position-relative" style={{ minHeight: '400px' }}>
                              <div className="p-3 border-bottom bg-light fw-bold small text-primary">Galería de Fotos</div>
                              <div className="p-3"><CarruselVehiculo vehiculo={vehiculoSeleccionado} /></div>
                              {ocultarInfoSensible && <OverlayPrivacidad />}
                            </div>
                          </div>

                          {/* Vencimientos */}
                          <div className="col-12 col-lg-6">
                            <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden position-relative" style={{ minHeight: '400px' }}>
                              <div className="p-3 border-bottom bg-light fw-bold small text-primary">Vencimientos</div>
                              <div className="p-3"><CalendarioPagos vehiculoSeleccionado={vehiculoSeleccionado} /></div>
                              {ocultarInfoSensible && <OverlayPrivacidad />}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB MÉTRICAS */}
                      {activeTab === 'metricas' && (
                        <div className="animate__animated animate__fadeIn position-relative">
                          {ocultarInfoSensible && <OverlayPrivacidad />}
                          <GraficoPresupuesto
                            vehiculo={vehiculoSeleccionado}
                            mantenimientos={mantenimientos}
                          />
                        </div>
                      )}

                        {/* TAB FINANZAS */}
                        {activeTab === 'finanzas' && (
                          <div className="animate__animated animate__fadeIn">
                            <VehicleFinance 
                              vehiculo={vehiculoSeleccionado} 
                              handleGuardarCambios={handleGuardarCambios} 
                            />
                          </div>
                        )}

                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            /* --- ESTADO VACÍO: CUANDO NO HAY COINCIDENCIAS --- */
            <div className="col-12 col-lg-9">
              <div className="card border-0 shadow-sm rounded-4 bg-white d-flex flex-column justify-content-center align-items-center p-5 text-center" style={{ minHeight: '520px' }}>
                <div className="bg-light rounded-circle p-4 mb-3">
                  <SearchX size={64} className="text-muted opacity-20" />
                </div>
                <h4 className="fw-bold text-dark">Sin resultados de búsqueda</h4>
                <p className="text-muted" style={{ maxWidth: '400px' }}>
                  No pudimos encontrar ninguna unidad que coincida con "<strong>{searchTerm}</strong>" o el filtro seleccionado.
                </p>
                <button
                  onClick={() => { setSearchTerm(""); setFilterStatus("Todos"); }}
                  className="btn btn-primary rounded-pill px-4 mt-2"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ModalEdicion editData={vehiculoSeleccionado} setEditData={setVehiculoSeleccionado} guardarCambios={handleGuardarCambios} />
      <ModalAgregar colors={COLORS} onUnidadAgregada={fetchVehiculos} />

      <ModalBorrarUnidad
        unidad={unidadParaEliminar}
        onConfirm={confirmarEliminacion}
        onCancel={cancelarEliminacion}
      />

      <ModalEstado
        tipo={modalEstado.tipo}
        titulo={modalEstado.titulo}
        mensaje={modalEstado.mensaje}
        mostrar={modalEstado.mostrar}
        onClose={() => setModalEstado({ ...modalEstado, mostrar: false })}
      />
    </div>
  );
}