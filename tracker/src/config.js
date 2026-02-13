const hostname = window.location.hostname;
const isCapacitor = import.meta.env.VITE_IS_CAPACITOR === 'true';

const isLocal = !isCapacitor && (hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname.startsWith("192.168.") ||
  hostname.startsWith("10.") ||
  hostname.startsWith("172."));

// Detectamos la carpeta en producción (ej: /uber o /dev)
// En Capacitor, asumimos 'uber' ya que no tenemos la ruta en la URL
const currentFolder = isCapacitor ? 'uber' : window.location.pathname.split('/')[1];

/**
 * CONFIGURACIÓN DE BASE_API
 * En local: Apuntamos a tu carpeta /v1/
 * En producción: Apuntamos a la carpeta detectada + initeck-flota + tu estructura de API
 */
const BASE_API = isLocal
  ? "/initeck-flota/Initeck-api/v1/"
  : `https://admin.initeck.com.mx/uber/Initeck-api/v1/`;

// Exportar BASE_API para uso en otros módulos
export { BASE_API };

// Función utilitaria para construir URLs dinámicas
export const buildApiUrl = (endpoint) => {
  return `${BASE_API}${endpoint}`;
};

// Función utilitaria para construir URLs de uploads
export const buildUploadUrl = (path) => {
  return `${BASE_API}uploads/${path || ''}`;
};

// Función para detectar si estamos en local
export const isLocalEnvironment = () => isLocal;

// URLs DE API (Ajustadas a tus carpetas por módulo)
// Si cada módulo tiene su propia carpeta, las definimos así:
export const API_URL = buildApiUrl("vehiculos/vehiculos.php");
export const MANTENIMIENTO_URL = buildApiUrl("vehiculos/vehiculosMantenimiento.php");
export const EMPLEADOS_URL = buildApiUrl("empleados/empleados.php");
export const VIAJES_URL = buildApiUrl("viajes/viajes.php");

// URLs de acciones (Ajusta la carpeta según corresponda)
export const ANADIR_URL = buildApiUrl("vehiculos/vehiculosAnadir.php");
export const MODIFICAR_URL = buildApiUrl("vehiculos/vehiculosModificar.php");
export const ELIMINAR_URL = buildApiUrl("vehiculos/vehiculosEliminar.php");
export const VEHICULO_LISTAR_URL = buildApiUrl("vehiculos/listar.php");
export const GASTOS_COMBUSTIBLE_URL = buildApiUrl("vehiculos/gastos_combustible.php");
export const BALANCE_URL = buildApiUrl("balance/balance.php");
export const BALANCE_AVANZADO_URL = buildApiUrl("balance/balance_avanzado.php");

export const USUARIO_VEHICULOS_URL = buildApiUrl("empleados/usuario/get_vehiculos.php");
export const LIQUIDACIONES_URL = buildApiUrl("empleados/usuario/finalizar_jornada.php");

// URLs de empleados y gestión
export const EMPLEADO_LISTAR_URL = buildApiUrl("empleados/listar.php");
export const EMPLEADO_ASIGNAR_UNIDAD_URL = buildApiUrl("empleados/asignar_unidad.php");
export const EMPLEADOS_UBICACION_URL = buildApiUrl("empleados/ubicacion_tiempo_real.php");
export const EMPLEADOS_EVENTOS_URL = buildApiUrl("empleados/eventos_recientes.php");
export const EMPLEADOS_LIQUIDACIONES_URL = buildApiUrl("empleados/liquidaciones_tiempo_real.php");
export const EMPLEADOS_RESUMEN_OPERATIVO_URL = buildApiUrl("empleados/resumen_operativo.php");
export const EMPLEADOS_DATOS_DIARIOS_URL = buildApiUrl("empleados/datos_diarios.php");
export const EMPLEADOS_RENDIMIENTO_URL = buildApiUrl("empleados/rendimiento.php");
export const EMPLEADOS_INSPECCIONES_URL = buildApiUrl("empleados/historial_inspecciones.php");
export const EMPLEADOS_KILOMETRAJE_URL = buildApiUrl("empleados/rendimiento_kilometraje.php");
export const EMPLEADOS_HISTORIAL_URL = buildApiUrl("empleados/usuario/historial.php");
export const MONITOR_STATS_URL = buildApiUrl("empleados/monitor_stats.php");
export const DASHBOARD_V2_URL = buildApiUrl("dashboard/dashboard_v2.php");
export const EMPLEADOS_ACTUALIZAR_HORARIO_URL = buildApiUrl("empleados/actualizar_horario.php");

// URLs de TALLER (Nuevo Módulo)
export const TALLER_ALERTAS_URL = buildApiUrl("taller/alertas.php");
export const TALLER_INVENTARIO_URL = buildApiUrl("taller/inventario.php");
export const TALLER_EQUIPAMIENTO_URL = buildApiUrl("taller/equipamiento.php");
export const TALLER_STATUS_URL = buildApiUrl("taller/update_status.php");
export const TALLER_NOTAS_URL = buildApiUrl("vehiculos/notas.php");
export const TALLER_COMENTARIOS_URL = buildApiUrl("taller/comentarios_recientes.php");

// URLs de NÓMINA
export const NOMINA_GUARDAR_TICKET_URL = buildApiUrl("nomina/guardar_ticket.php");
export const NOMINA_LISTAR_TICKETS_URL = buildApiUrl("nomina/listar_tickets.php");
export const NOMINA_GUARDAR_TRANSFERENCIA_URL = buildApiUrl("nomina/guardar_transferencia.php");
export const NOMINA_LISTAR_TRANSFERENCIAS_URL = buildApiUrl("nomina/listar_transferencias.php");

// URLs de usuario y operaciones
export const USUARIO_LOGIN_URL = buildApiUrl("empleados/usuario/login.php");
export const USUARIO_GASTOS_URL = buildApiUrl("empleados/usuario/gastos.php");
export const USUARIO_LIQUIDACION_URL = buildApiUrl("empleados/usuario/liquidacion.php");
export const USUARIO_JORNADA_URL = buildApiUrl("empleados/usuario/jornada.php");
export const USUARIO_VIAJES_URL = buildApiUrl("empleados/usuario/viajes.php");

// URLs de uploads y archivos
export const UPLOADS_URL = buildApiUrl("uploads/");

// URLs de autenticación (están fuera de v1)
export const AUTH_SESSION_KEEPALIVE_URL = isLocal
  ? "/initeck-flota/Initeck-api/auth/session_keepalive.php"
  : `https://admin.initeck.com.mx/uber/Initeck-api/auth/session_keepalive.php`;
export const AUTH_CHECK_SESSION_URL = isLocal
  ? "/initeck-flota/Initeck-api/auth/check_session.php"
  : `https://admin.initeck.com.mx/uber/Initeck-api/auth/check_session.php`;
export const AUTH_LOGIN_URL = isLocal
  ? "/initeck-flota/Initeck-api/auth/login.php"
  : `https://admin.initeck.com.mx/uber/Initeck-api/auth/login.php`;
export const AUTH_PERFIL_URL = isLocal
  ? "/initeck-flota/Initeck-api/auth/actualizar_perfil.php"
  : `https://admin.initeck.com.mx/uber/Initeck-api/auth/actualizar_perfil.php`;

// URLs de ubicación
export const EMPLEADOS_UPDATE_LOCATION_URL = buildApiUrl("empleados/update_location.php");

// Log para depuración

// Colores
export const COLORS = {
  primary: '#0f172a',
  secondary: '#64748b',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  light: '#f8fafc',
  dark: '#1e293b'
};

// Employee API Endpoints
export const EMPLEADO_API_BASE = `${BASE_API}empleados/usuario`;
export const EMPLEADO_GUARDAR_INSPECCION = `${EMPLEADO_API_BASE}/guardar_inspeccion.php`;
export const EMPLEADO_GET_VEHICULOS = `${EMPLEADO_API_BASE}/get_vehiculos.php`;
export const EMPLEADO_ACTUALIZAR_GPS = `${EMPLEADO_API_BASE}/actualizar_gps.php`;
export const EMPLEADO_RESUMEN_DIARIO = `${EMPLEADO_API_BASE}/resumen_diario.php`;
export const EMPLEADO_HISTORIAL = `${EMPLEADO_API_BASE}/historial.php`;
export const EMPLEADO_GUARDAR_LIQUIDACION = `${EMPLEADO_API_BASE}/guardar_liquidacion.php`;
export const EMPLEADO_FINALIZAR_JORNADA = `${EMPLEADO_API_BASE}/finalizar_jornada.php`;
export const EMPLEADO_OBTENER_ODOMETRO = `${EMPLEADO_API_BASE}/obtener_odometro.php`;

// Uploads URLs por módulo
export const UPLOADS_BASE_URL = isLocal
  ? "http://localhost/initeck-flota/Initeck-api/v1/uploads/"
  : `https://admin.initeck.com.mx/uber/Initeck-api/v1/uploads/`;

export const VEHICULOS_UPLOADS_URL = isLocal
  ? "http://localhost/initeck-flota/Initeck-api/v1/vehiculos/uploads/"
  : `https://admin.initeck.com.mx/uber/Initeck-api/v1/vehiculos/uploads/`;

export const EMPLEADOS_UPLOADS_URL = isLocal
  ? "http://localhost/initeck-flota/Initeck-api/v1/empleados/uploads/"
  : `https://admin.initeck.com.mx/uber/Initeck-api/v1/empleados/uploads/`;


console.log(`🚀 API Configuración:`, {
  entorno: isLocal ? 'LOCALHOST' : 'PRODUCCIÓN',
  hostname: hostname,
  currentFolder: currentFolder || 'raíz',
  baseUrl: BASE_API
});