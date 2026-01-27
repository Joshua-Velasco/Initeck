import React, { useState } from 'react';
import { 
  ChevronDown, ChevronUp, Edit3, Trash2, Car, 
  Shield, User, Sparkles, Code 
} from 'lucide-react';
import EmpleadoDetalle from './EmpleadoDetalle';

export default function EmpleadoTabla({ empleados, prepararEdicion, confirmarEliminar, asignarUnidad, ocultarInfoSensible }) {
  const [expandedId, setExpandedId] = useState(null);

  // Colores sólidos para garantizar visibilidad
  const ROLES_STYLE = {
    admin: { bg: '#0f172a', text: '#ffffff', icon: <Shield size={14} />, label: 'Administrador' },
    operator: { bg: '#3b82f6', text: '#ffffff', icon: <Car size={14} />, label: 'Operador' },
    employee: { bg: '#64748b', text: '#ffffff', icon: <User size={14} />, label: 'Empleado' },
    cleaning: { bg: '#06b6d4', text: '#ffffff', icon: <Sparkles size={14} />, label: 'Limpieza' },
    development: { bg: '#f59e0b', text: '#ffffff', icon: <Code size={14} />, label: 'Desarrollo' }
  };

  const getRolBadge = (rol) => {
    const config = ROLES_STYLE[rol] || ROLES_STYLE.employee;
    return (
      <span 
        className="badge rounded-pill d-inline-flex align-items-center gap-2 px-3 py-2"
        style={{ backgroundColor: config.bg, color: config.text, fontSize: '0.75rem', fontWeight: '600' }}
      >
        {config.icon} {config.label}
      </span>
    );
  };

  return (
    <div className="card border-0 shadow-sm overflow-hidden rounded-4 bg-white">
      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead style={{ backgroundColor: '#f8fafc' }}>
            <tr>
              <th className="border-0 ps-4" style={{ width: '40px' }}></th>
              <th className="border-0 text-muted small text-uppercase fw-bold">Colaborador / Unidad</th>
              <th className="border-0 text-muted small text-uppercase fw-bold">Cargo</th>
              <th className="border-0 text-muted small text-uppercase fw-bold">Estatus</th>
              <th className="border-0 text-muted small text-uppercase fw-bold text-end pe-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-5">
                  <div className="text-muted">No hay registros disponibles en este momento.</div>
                </td>
              </tr>
            ) : (
              empleados.map((emp) => (
                <React.Fragment key={emp.id}>
                  {/* Fila Principal */}
                  <tr 
                    onClick={() => setExpandedId(expandedId === emp.id ? null : emp.id)} 
                    style={{ 
                      cursor: 'pointer', 
                      transition: 'all 0.2s',
                      backgroundColor: expandedId === emp.id ? '#f1f5f9' : 'transparent'
                    }}
                    className="hover-row"
                  >
                    <td className="ps-4">
                      <div className={`p-1 rounded-circle d-flex align-items-center justify-content-center ${expandedId === emp.id ? 'bg-dark text-white' : 'text-muted'}`}>
                        {expandedId === emp.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold text-dark mb-0" style={{ fontSize: '0.95rem' }}>{emp.nombre_completo}</div>
                      <div className="d-flex align-items-center gap-1">
                        {emp.nombre_vehiculo ? (
                          <div className="small text-primary d-flex align-items-center gap-1">
                            <Car size={12} /> 
                            <span>{emp.nombre_vehiculo}</span>
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>• {emp.placas_vehiculo}</span>
                          </div>
                        ) : (
                          <span className="text-muted small opacity-75">Sin unidad vinculada</span>
                        )}
                      </div>
                    </td>
                    <td>{getRolBadge(emp.rol)}</td>
                    <td>
                      <span 
                        className="badge px-3 py-2 rounded-pill"
                        style={{ 
                          backgroundColor: emp.estado === 'Activo' ? '#dcfce7' : '#fee2e2',
                          color: emp.estado === 'Activo' ? '#15803d' : '#b91c1c',
                          fontSize: '0.75rem'
                        }}
                      >
                        {emp.estado}
                      </span>
                    </td>
                    <td className="text-end pe-4" onClick={e => e.stopPropagation()}>
                      <div className="btn-group bg-white shadow-sm border rounded-3 overflow-hidden">
                        <button 
                          className="btn btn-sm btn-light border-end py-2 px-3" 
                          onClick={() => prepararEdicion(emp)} 
                          title="Editar"
                        >
                          <Edit3 size={14} className="text-primary" />
                        </button>
                        <button 
                          className="btn btn-sm btn-light border-end py-2 px-3" 
                          onClick={() => asignarUnidad(emp)} 
                          title="Vehículo"
                        >
                          <Car size={14} className="text-success" />
                        </button>
                        <button 
                          className="btn btn-sm btn-light py-2 px-3" 
                          onClick={() => confirmarEliminar(emp.id)}
                          title="Eliminar"
                        >
                          <Trash2 size={14} className="text-danger" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Fila Expandible */}
                  {expandedId === emp.id && (
                    <tr>
                      <td colSpan="5" className="p-0 border-0 shadow-inner">
                        <div 
                          className="animate__animated animate__fadeIn px-4 py-4" 
                          style={{ 
                            backgroundColor: '#ffffff',
                            borderLeft: '4px solid #0f172a',
                            boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.05)'
                          }}
                        >
                          <EmpleadoDetalle 
                            empleado={emp} 
                            ocultarInfoSensible={ocultarInfoSensible} 
                            colorGuinda="#6b0f1a"
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .hover-row:hover { background-color: #f8fafc !important; }
        .table > :not(caption) > * > * { padding: 1rem 0.5rem; }
        .shadow-inner { box-shadow: inset 0 2px 10px rgba(0,0,0,0.05); }
      `}</style>
    </div>
  );
}