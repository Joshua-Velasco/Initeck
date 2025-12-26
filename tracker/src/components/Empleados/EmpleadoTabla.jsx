import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit3, Trash2, User, Phone, AlertTriangle } from 'lucide-react';
import EmpleadoDetalle from './EmpleadoDetalle';

export default function EmpleadoTabla({ empleados, prepararEdicion, confirmarEliminar, colorGuinda }) {
  const [expandedId, setExpandedId] = useState(null);
  const [empleadoParaBorrar, setEmpleadoParaBorrar] = useState(null);

  const toggleRow = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Función para abrir el modal de borrado
  const seleccionarParaBorrar = (emp) => {
    setEmpleadoParaBorrar(emp);
  };

  return (
    <>
      <div className="card border-0 shadow-sm overflow-hidden">
        <table className="table align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: '50px' }}></th>
              <th>Empleado</th>
              <th>Contacto</th>
              <th>Estado</th>
              <th className="text-end" style={{ width: '120px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((emp) => (
              <React.Fragment key={emp.id}>
                <tr 
                  onClick={() => toggleRow(emp.id)} 
                  style={{ cursor: 'pointer' }}
                  className={expandedId === emp.id ? 'table-light' : ''}
                >
                  <td>
                    {expandedId === emp.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="bg-secondary-subtle p-2 rounded-circle me-3">
                        <User size={20} style={{ color: colorGuinda }} />
                      </div>
                      <div>
                        <div className="fw-bold text-dark">{emp.nombre_completo}</div>
                        <div className="small text-muted">ID: #{emp.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="small text-dark">
                      <Phone size={14} className="me-1 text-muted"/>
                      {emp.telefono || 'Sin teléfono'}
                    </div>
                  </td>
                  <td>
                    <span className={`badge rounded-pill ${
                      emp.estado === 'Activo' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'
                    }`}>
                      {emp.estado}
                    </span>
                  </td>
                  <td className="text-end" onClick={(e) => e.stopPropagation()}>
                    <div className="d-flex justify-content-end gap-2">
                      <button 
                        className="btn btn-sm btn-light text-primary border shadow-sm" 
                        data-bs-toggle="modal" 
                        data-bs-target="#modalEmpleado"
                        onClick={() => prepararEdicion(emp)}
                      >
                        <Edit3 size={16} />
                      </button>

                      <button 
                        className="btn btn-sm btn-light text-danger border shadow-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#modalConfirmarBorrado"
                        onClick={() => seleccionarParaBorrar(emp)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>

                {expandedId === emp.id && (
                  <tr>
                    <td colSpan="5" className="p-0 border-0">
                      <div className="bg-light p-4 shadow-inner">
                        <EmpleadoDetalle empleado={emp} colorGuinda={colorGuinda} />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CONFIRMACIÓN DE BORRADO */}
      <div className="modal fade" id="modalConfirmarBorrado" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content border-0 rounded-4 shadow">
            <div className="modal-body p-4 text-center">
              <div className="text-danger mb-3">
                <AlertTriangle size={48} />
              </div>
              <h5 className="fw-bold mb-2">¿Confirmar baja?</h5>
              <p className="text-muted small mb-0">
                Se eliminará el registro de: <br />
                <strong className="text-dark">{empleadoParaBorrar?.nombre_completo}</strong>
              </p>
              <div className="mt-4 d-flex gap-2">
                <button type="button" className="btn btn-light flex-grow-1 fw-bold" data-bs-dismiss="modal">
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger flex-grow-1 fw-bold" 
                  data-bs-dismiss="modal"
                  onClick={() => confirmarEliminar(empleadoParaBorrar.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}