// ══════════════════════════════════════════════════
// IniAdmin — Configuration
// ══════════════════════════════════════════════════

const hostname = window.location.hostname;

const isLocal = hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname.startsWith("192.168.") ||
  hostname.startsWith("10.") ||
  hostname.startsWith("172.");

// Base API URL — apunta a la carpeta api_php dentro de iniadmin
const BASE_API = isLocal
  ? "/initeck-flota/iniadmin/api_php/"
  : `https://admin.initeck.com.mx/iniadmin/api_php/`;

export { BASE_API, isLocal };

// Construir URLs de API
export const buildApiUrl = (endpoint) => `${BASE_API}${endpoint}`;

export const API_URLS = {
  empleados: `${BASE_API}empleados/`,
  dashboard: `${BASE_API}dashboard/`,
  tareas: `${BASE_API}tareas/`,
  equipos: `${BASE_API}equipos/`,
  divisiones: `${BASE_API}divisiones/`,
  proyectos: `${BASE_API}proyectos/`,
  reportes: `${BASE_API}reportes/`,
};

// Uploads URLs
export const EMPLEADOS_UPLOADS_URL = isLocal
  ? "http://localhost/initeck-flota/iniadmin/api_php/empleados/uploads/"
  : `https://admin.initeck.com.mx/iniadmin/api_php/empleados/uploads/`;

// Log para depuración
console.log(`🔧 IniAdmin API:`, {
  entorno: isLocal ? 'LOCAL' : 'PRODUCCIÓN',
  baseUrl: BASE_API
});
