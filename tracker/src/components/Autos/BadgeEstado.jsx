import React from 'react';
import { CheckCircle2, Wrench, Ban, Car } from 'lucide-react';

export const BadgeEstado = ({ estado }) => {
  const configs = {
    'Activo': { color: 'bg-success', icon: CheckCircle2 },
    'En Taller': { color: 'bg-warning text-dark', icon: Wrench },
    'Mantenimiento': { color: 'bg-warning text-dark', icon: Wrench },
    'Baja': { color: 'bg-danger', icon: Ban },
    'Fuera de Servicio': { color: 'bg-danger', icon: Ban }
  };
  const config = configs[estado] || { color: 'bg-secondary', icon: Car };
  const Icon = config.icon;

  return (
    <span className={`badge ${config.color} d-flex align-items-center gap-1 py-1 px-2 rounded-pill shadow-sm`} style={{ fontSize: '0.65rem' }}>
      <Icon size={10} /> {estado}
    </span>
  );
};

export default BadgeEstado;