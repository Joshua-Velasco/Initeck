import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserCircle, Loader2, MapPin, Car } from 'lucide-react';

// Subcomponentes
import SeleccionVehiculo from './SubComponents/SeleccionVehiculo';
import PanelAcciones from './SubComponents/PanelAcciones';
import FormularioGasto from './SubComponents/FormularioGasto';
import FormularioLiquidacion from './SubComponents/FormularioLiquidacion';
import CerrarJornada from './SubComponents/CerrarJornada';

// Compartidos
import ResumenJornada from '../Empleados_User/SubComponents/ResumenJornada';
import HistorialLiquidaciones from '../Empleados_User/SubComponents/HistorialLiquidaciones';
import { GraficoRendimiento } from '../Empleados_Admin/GraficoRendimiento';

// Config
import {
  EMPLEADO_API_BASE,
  EMPLEADO_GUARDAR_INSPECCION,
  EMPLEADO_GET_VEHICULOS,
  EMPLEADO_ACTUALIZAR_GPS,
  EMPLEADOS_UPDATE_LOCATION_URL
} from '../../config';

export default function ViajesEmpleado({ user }) {
  const colorGuinda = "#800020";

  const [viajeActivo, setViajeActivo] = useState(false);
  const [activeTab, setActiveTab] = useState('menu');
  const [loading, setLoading] = useState(true);
  const [miUbicacionActual, setMiUbicacionActual] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [finanzas, setFinanzas] = useState({ monto_total: 0, propinas: 0 });
  const [gastoData, setGastoData] = useState({ tipo: '', monto: '', odometro: '', evidencia: null });

  const [datosInicio, setDatosInicio] = useState({
    id_vehiculo: '',
    unidad_nombre: 'Buscando unidad...',
    odometro: '',
    empleado_id: user?.id || 0,
    gasolina: 50
  });

  // --- FECHAS PARA GRÁFICO ---
  const getLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [fechas, setFechas] = useState({
    inicio: getLocalDate(),
    fin: getLocalDate()
  });

  // --- MANEJO DE MODAL PERSONALIZADO ---
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'info' });

  const showCustomModal = (title, message, type = 'info') => {
    setModalContent({ title, message, type });
    setShowModal(true);
  };

  // --- LOGICA DE ROLES ---
  const renderRoleBadge = (rol) => {
    const rolesConfig = {
      admin: { color: 'bg-dark', label: 'Administrador' },
      operator: { color: 'bg-primary', label: 'Operador' },
      employee: { color: 'bg-success', label: 'Empleado' },
      cleaning: { color: 'bg-info', label: 'Limpieza' },
      development: { color: 'bg-warning text-dark', label: 'Desarrollo' }
    };
    const current = rolesConfig[rol?.toLowerCase()] || { color: 'bg-secondary', label: rol };
    return (
      <span className={`badge rounded-pill ${current.color} text-uppercase px-3 shadow-sm`} style={{ fontSize: '10px' }}>
        {current.label}
      </span>
    );
  };

  // --- FETCH INICIAL DE VEHÍCULO ---
  const fetchVehiculo = useCallback(async () => {
    if (!user?.id) return;
    try {
      const resV = await fetch(`${EMPLEADO_GET_VEHICULOS}?empleado_id=${user.id}&t=${Date.now()}`);
      const dataV = await resV.json();

      if (dataV.status === "success" && dataV.vehiculo) {
        setDatosInicio(prev => ({
          ...prev,
          id_vehiculo: dataV.vehiculo.id,
          unidad_nombre: `${dataV.vehiculo.unidad_nombre} [${dataV.vehiculo.placas}]`,
          odometro: dataV.vehiculo.kilometraje_actual || 0,
          gasolina: dataV.vehiculo.nivel_gasolina || 50
        }));

        // Si ya inspeccionó hoy, activar la jornada automáticamente
        if (dataV.inspeccionado_hoy) {
          setViajeActivo(true);
        }
      }
    } catch (e) {
      console.error("Error cargando vehículo:", e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchVehiculo();
  }, [fetchVehiculo]);

  // --- MANEJADOR PARA INICIAR JORNADA (ENVÍO AL PHP) ---
  // Helper para convertir base64 a Blob (para la firma)
  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // --- MANEJADOR PARA INICIAR JORNADA (ENVÍO AL PHP) ---
  const handleIniciarJornada = async (payloadCompleto) => {
    // Validación crítica de ID
    if (!payloadCompleto.empleado_id || payloadCompleto.empleado_id <= 0) {
      alert("⚠️ Error: No se ha identificado al usuario (ID de empleado inválido). Por favor recarga la página.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      // Datos simples
      formData.append('empleado_id', payloadCompleto.empleado_id);
      formData.append('id_vehiculo', payloadCompleto.id_vehiculo);
      formData.append('odometro', payloadCompleto.odometro);
      formData.append('gasolina', payloadCompleto.gasolina);
<<<<<<< HEAD
      formData.append('comentarios', payloadCompleto.comentarios || '');
=======
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)

      // Firma (Base64 -> File)
      if (payloadCompleto.firma) {
        const firmaBlob = dataURLtoBlob(payloadCompleto.firma);
        formData.append('firma', firmaBlob, 'firma.png');
      }

      // Fotos (Files reales)
      const files = payloadCompleto.evidencia_files || {};
      if (files.tablero) formData.append('tablero', files.tablero);
      if (files.frente) formData.append('frente', files.frente);
      if (files.atras) formData.append('atras', files.atras);
      if (files.izquierdo) formData.append('izquierdo', files.izquierdo);
      if (files.derecho) formData.append('derecho', files.derecho);

      const response = await fetch(EMPLEADO_GUARDAR_INSPECCION, {
        method: 'POST',
        // NO poner Content-Type, el navegador lo pone con el boundary correcto para FormData
        body: formData
      });

      // Leer respuesta como texto primero para diagnosticar errores HTML (ej: 413, 500)
      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error("Error parseando JSON:", text);
        // Si es HTML, probablemente es un error de Apache/Nginx (413 Payload Too Large, etc)
        const errorMessage = text.includes("Too Large")
          ? "El envío es demasiado grande para el servidor (Error 413)."
          : `Error del servidor (No retornó JSON). Respuesta parcial: ${text.substring(0, 50)}...`;

        throw new Error(errorMessage);
      }

      if (result.status === "success") {
        setViajeActivo(true);
        setRefreshKey(prev => prev + 1);
        setActiveTab('menu');
      } else {
        alert("❌ Error al guardar inspección: " + result.message);
      }
    } catch (error) {
      console.error("Error en el envío:", error);
      alert(`❌ Error enviando datos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para resetear los estados de formulario
  const resetFormStates = () => {
    setFinanzas({ monto_total: 0, propinas: 0 });
    setGastoData({ tipo: '', monto: '', odometro: '', evidencia: null });
  };

  const handleActionSuccess = () => {
    // Limpiar estados para evitar "información fantasma"
    resetFormStates();

    setRefreshKey(prev => prev + 1);
    setActiveTab('menu');
  };

  const handleCancelAction = () => {
    // También limpiamos al cancelar por si el usuario dejó datos a medias
    resetFormStates();
    setActiveTab('menu');
  };

  const confirmarCierreTotal = () => {
    setViajeActivo(false);
    setActiveTab('menu');
    resetFormStates();
    fetchVehiculo(); // <--- Re-verificar para que el backend diga que ya no hay inspección pendiente
    setRefreshKey(prev => prev + 1);
  };

  // --- WAKE LOCK & BACKGROUND WORKAROUND ---
  const [wakeLock, setWakeLock] = useState(null);
  const [modoActivo, setModoActivo] = useState(false);
  const audioRef = useRef(null);

  const toggleModoActivo = async () => {
    if (modoActivo) {
      // Desactivar
      if (wakeLock) {
        wakeLock.release().then(() => setWakeLock(null));
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setModoActivo(false);
    } else {
      // Activar
      try {
        let wl = null;
        if ('wakeLock' in navigator) {
          wl = await navigator.wakeLock.request('screen');
          setWakeLock(wl);
        }
        // Fallback audio para iOS background
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.warn("Audio play failed", e));
        }
        setModoActivo(true);
        showCustomModal("✅ Modo Activo Activado", "La pantalla y el GPS se mantendrán encendidos. No bloquee su teléfono manualmente, deje que la app gestione la energía.", "success");
      } catch (err) {
        console.error(`${err.name}, ${err.message}`);
        showCustomModal("⚠️ Error", "No se pudo activar el bloqueo de pantalla. Mantenga la app abierta.", "error");
      }
    }
  };

  // Re-solicitar Wake Lock si la visibilidad cambia (tab switch)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        try {
          const wl = await navigator.wakeLock.request('screen');
          setWakeLock(wl);
        } catch (e) { console.error(e); }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [wakeLock]);


  // --- RASTREO GPS ---
  // El rastreo ahora es manejado de forma GLOBAL en App.jsx para todos los roles operativos.
  // Aquí solo mantenemos la visualización en el mapa local si es necesario.
  useEffect(() => {
    if (!viajeActivo || !user?.id) return;

    // Solo escuchamos la posición para mover el marcador en el mapa local,
    // pero YA NO mandamos fecth al servidor desde aquí porque App.jsx ya lo hace.
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        console.log("📍 GPS LOCAL SUCCESS:", pos.coords.latitude, pos.coords.longitude);
        setMiUbicacionActual([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.warn("📍 GPS LOCAL ERROR:", err.code, err.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [viajeActivo, user?.id]);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
        <Loader2 className="animate-spin text-danger mb-3" size={40} />
        <span className="fw-bold text-secondary text-uppercase" style={{ letterSpacing: '2px' }}>Initeck Sincronizando...</span>
      </div>
    );
  }

  return (
    <div className="container-fluid px-2 py-3 px-md-4 py-md-4" style={{ backgroundColor: '#f4f4f7', minHeight: '100vh' }}>
      <div className="mx-auto" style={{ maxWidth: '1200px' }}>

        {/* HEADER DE USUARIO */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 bg-white p-3 p-md-4 rounded-4 shadow-sm border-start border-5" style={{ borderColor: colorGuinda }}>
          <div className="d-flex align-items-center gap-3 mb-3 mb-md-0">
            <UserCircle size={48} style={{ color: colorGuinda }} />
            <div>
              <h3 className="fw-bold mb-0 text-dark text-uppercase" style={{ fontSize: '1.2rem' }}>{user?.nombre_completo || user?.nombre}</h3>
              <div className="mt-1">
                {/* Primera línea: Badges y Ubicación */}
                <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                  {renderRoleBadge(user?.rol)}

                  {/* Mostrar unidad asignada si existe */}
                  {datosInicio.unidad_nombre && !datosInicio.unidad_nombre.includes("Buscando") && (
                    <span className="badge rounded-pill bg-danger text-white text-uppercase px-3 shadow-sm" style={{ fontSize: '10px' }}>
                      <Car size={10} className="me-1" />
                      {datosInicio.unidad_nombre}
                    </span>
                  )}

                  <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '11px' }}>
                    <MapPin size={12} />
                    <span>Ciudad Juárez, MX</span>
                  </div>
                </div>

                {/* Segunda línea: Botón Modo Activo (Wake Lock) */}
<<<<<<< HEAD

=======
                <div className="d-flex mt-2">
                  <button
                    onClick={toggleModoActivo}
                    className={`btn btn-sm rounded-pill d-flex align-items-center gap-2 shadow-sm transition-all border-0 ${modoActivo ? 'text-white' : 'bg-light text-secondary'}`}
                    style={{
                      backgroundColor: modoActivo ? colorGuinda : '#f8f9fa',
                      fontSize: '11px',
                      padding: '8px 18px',
                      fontWeight: '700',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {modoActivo ? "SEGUIMIENTO ACTIVO" : "MODO MONITOR OFF"}
                  </button>
                  <audio ref={audioRef} loop style={{ display: 'none' }}>
                    {/* Audio silencioso (Base64) para prevenir suspensión en móviles sin ser audible */}
                    <source src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA" type="audio/wav" />
                  </audio>
                </div>
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
              </div>
            </div>
          </div>
        </div>

        {/* RESUMEN JORNADA */}
        <ResumenJornada
          user={user}
          unidad={datosInicio.unidad_nombre}
          viajeActivo={viajeActivo}
          onFinalizar={() => setActiveTab('finalizar')}
          key={`resumen-${refreshKey}`}
        />

        {!viajeActivo ? (
          <SeleccionVehiculo
            datosInicio={datosInicio}
            setDatosInicio={setDatosInicio}
            onIniciar={handleIniciarJornada} // <--- Pasamos la función con el fetch
            loading={loading}
          />
        ) : (
          <div className="animate__animated animate__fadeIn">
            {activeTab !== 'finalizar' && (
              <PanelAcciones onSetTab={setActiveTab} activeTab={activeTab} colorGuinda={colorGuinda} />
            )}

            <div className="mt-4">
              {activeTab === 'menu' && (
                <div className="row g-4">
                  {/* Gráficas de Rendimiento (Lugar que ocupaba el mapa) */}
                  <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                      <GraficoRendimiento empleado={user} fechas={fechas} />
                    </div>
                  </div>

                  {/* Historial de Liquidaciones ('Mi actividad') */}
                  <div className="col-12">
<<<<<<< HEAD
                    <HistorialLiquidaciones 
                      user={user} 
                      fechas={fechas} 
                      onDateChange={setFechas}
                      key={`historial-${refreshKey}`} 
                    />
=======
                    <HistorialLiquidaciones user={user} key={`historial-${refreshKey}`} />
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
                  </div>
                </div>
              )}

              {activeTab === 'gasto' && (
                <FormularioGasto
                  user={user}
                  vehiculoId={datosInicio.id_vehiculo}
                  gastoData={gastoData}
                  setGastoData={setGastoData}
                  onCancel={handleCancelAction}
                  onGuardar={handleActionSuccess}
                />
              )}

              {activeTab === 'liquidacion' && (
                <FormularioLiquidacion
                  user={user}
                  vehiculoId={datosInicio.id_vehiculo}
                  finanzas={finanzas}
                  setFinanzas={setFinanzas}
                  onCancel={handleCancelAction}
                  onConfirmar={handleActionSuccess}
                />
              )}

              {activeTab === 'finalizar' && (
                <CerrarJornada
                  user={user}
                  datosInicio={datosInicio}
                  onCancel={handleCancelAction}
                  onConfirm={confirmarCierreTotal}
                />
              )}
            </div>
          </div>
        )}

        {/* MODAL PERSONALIZADO */}
        {showModal && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                <div className={`modal-header border-0 ${modalContent.type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                  <h5 className="modal-title fw-bold">{modalContent.title}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4 text-center">
                  <p className="text-muted mb-0" style={{ fontSize: '1.1rem' }}>{modalContent.message}</p>
                </div>
                <div className="modal-footer border-0 justify-content-center pb-4">
                  <button type="button" className="btn btn-dark rounded-pill px-4" onClick={() => setShowModal(false)}>
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}