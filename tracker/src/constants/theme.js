// Importar URLs dinámicas desde config.js
import { BASE_API } from '../config.js';

// Constantes compartidas para toda la aplicación
export const COLORS = { 
  guinda: "#6b0f1a", 
  slate: "#0f172a", 
  success: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  bg: "#f8fafc" 
};

export const ROLES = {
  admin: { color: '#dc3545', label: 'Administrador' },
  development: { color: '#212529', label: 'Desarrollo' },
  operator: { color: '#0d6efd', label: 'Operador' },
  cleaning: { color: '#0dcaf0', label: 'Limpieza' },
  monitorista: { color: '#6610f2', label: 'Monitorista' },
  taller: { color: '#fd7e14', label: 'Taller' },
  employee: { color: '#6c757d', label: 'Empleado' }
};

export const getRolLabel = (rol) => {
  return ROLES[rol]?.label || rol;
};

export const getRolStyle = (rol) => {
  return ROLES[rol] || { color: '#6c757d', label: rol };
};

export const API_URLS = {
  empleados: `${BASE_API}empleados/`,
  vehiculos: `${BASE_API}vehiculos/`
};

export const initialFormState = {
  id: '',
  nombre_completo: '',
  telefono: '',
  estado: 'Activo',
  fecha_ingreso: new Date().toISOString().split('T')[0],
  usuario: '',
  password: '',
  rol: 'employee',
  foto_perfil: null,
  foto_ine: null,
  foto_curp: null,
  foto_rfc: null,
  foto_licencia: null
};

export const ESTILOS_COMPARTIDOS = `
  .fw-black { font-weight: 800; }
  .uppercase { text-transform: uppercase; letter-spacing: 0.8px; }
  .spin-anim { animation: rotate 1s linear infinite; }
  @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .hover-card { transition: all 0.2s ease; border: 1px solid transparent; }
  .hover-card:hover { border-color: ${COLORS.guinda}30 !important; transform: translateX(5px); background: white !important; }
  .selected-card { border-left: 6px solid ${COLORS.guinda} !important; background-color: white !important; box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important; }
  .scroll-beauty::-webkit-scrollbar { width: 6px; }
  .scroll-beauty::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
`;
