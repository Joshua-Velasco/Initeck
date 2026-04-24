// ══════════════════════════════════════════════════
// IniAdmin — Theme & Constants
// ══════════════════════════════════════════════════

export const COLORS = {
  // Brand
  brand: '#b91c1c',
  brandDark: '#7f1d1d',
  brandDeep: '#450a0a',
  
  // Neutrals
  bg: '#f4f4f5',
  bgDark: '#09090b',
  surface: '#ffffff',
  
  // Semantic
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  
  // Text
  textPrimary: '#18181b',
  textSecondary: '#71717a',
  textMuted: '#a1a1aa',
  
  // Borders
  border: '#e4e4e7',
  borderLight: '#f4f4f5',
};

export const ROLES = {
  admin:      { color: '#dc2626', bg: '#fee2e2', label: 'Administrador' },
  developer:  { color: '#18181b', bg: '#e4e4e7', label: 'Desarrollo' },
  campo:      { color: '#ea580c', bg: '#ffedd5', label: 'Campo' },
  supervisor: { color: '#7c3aed', bg: '#ede9fe', label: 'Supervisor' },
  soporte:    { color: '#0891b2', bg: '#cffafe', label: 'Soporte' },
};

export const TASK_STATUS = {
  pendiente:   { color: '#f59e0b', bg: '#fef3c7', label: 'Pendiente' },
  en_progreso: { color: '#3b82f6', bg: '#dbeafe', label: 'En Progreso' },
  completada:  { color: '#10b981', bg: '#d1fae5', label: 'Completada' },
  cancelada:   { color: '#ef4444', bg: '#fee2e2', label: 'Cancelada' },
};

export const TASK_PRIORITY = {
  baja:    { color: '#10b981', bg: '#d1fae5', label: 'Baja' },
  media:   { color: '#f59e0b', bg: '#fef3c7', label: 'Media' },
  alta:    { color: '#ef4444', bg: '#fee2e2', label: 'Alta' },
  urgente: { color: '#7f1d1d', bg: '#fecaca', label: 'Urgente' },
};

export const getRolLabel = (rol) => ROLES[rol]?.label || rol || 'Sin rol';

export const getRolStyle = (rol) => ROLES[rol] || { color: '#52525b', bg: '#f4f4f5', label: rol };

export const getTaskStatusStyle = (status) => TASK_STATUS[status] || { color: '#52525b', bg: '#f4f4f5', label: status };

export const getTaskPriorityStyle = (priority) => TASK_PRIORITY[priority] || { color: '#52525b', bg: '#f4f4f5', label: priority };

export const initialFormState = {
  id: '',
  nombre_completo: '',
  telefono: '',
  estado: 'Activo',
  fecha_ingreso: new Date().toISOString().split('T')[0],
  usuario: '',
  password: '',
  rol: 'campo',
  foto_perfil: null,
  foto_ine: null,
  foto_curp: null,
  foto_rfc: null,
  foto_licencia: null,
};

export const ESTILOS_COMPARTIDOS = `
  .hover-emp-card {
    transition: all 0.2s ease;
    border: 1.5px solid transparent;
  }
  .hover-emp-card:hover {
    border-color: rgba(185, 28, 28, 0.2) !important;
    transform: translateX(4px);
    background: white !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .selected-emp-card {
    border-left: 4px solid #b91c1c !important;
    background-color: white !important;
    box-shadow: 0 4px 12px rgba(185, 28, 28, 0.1) !important;
  }
`;
