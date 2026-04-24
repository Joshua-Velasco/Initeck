// ══════════════════════════════════════════════════
// IniAdmin — Role Permissions
// ══════════════════════════════════════════════════

// Rutas accesibles por rol
export const ROLE_ROUTES = {
  admin:      ['/', '/empleados', '/tareas', '/calendario', '/proyectos', '/reportes'],
  supervisor: ['/', '/tareas', '/calendario', '/proyectos', '/reportes'],
  developer:  ['/', '/tareas', '/calendario', '/proyectos'],
  soporte:    ['/', '/tareas'],
  campo:      ['/tareas'],
};

// Ruta inicial al entrar según rol
export const ROLE_DEFAULT_ROUTE = {
  admin:      '/',
  supervisor: '/',
  developer:  '/',
  soporte:    '/',
  campo:      '/tareas',
};

// Etiquetas de rol para mostrar en UI
export const ROLE_LABELS = {
  admin:      'Administrador',
  supervisor: 'Supervisor',
  developer:  'Desarrollo',
  soporte:    'Soporte',
  campo:      'Campo',
};

// Puede crear/editar tareas
export const canManageTasks = (rol) =>
  ['admin', 'supervisor', 'developer', 'soporte'].includes(rol);

// Puede eliminar tareas
export const canDeleteTasks = (rol) =>
  ['admin', 'supervisor'].includes(rol);

// Puede gestionar empleados
export const canManageEmpleados = (rol) => rol === 'admin';
