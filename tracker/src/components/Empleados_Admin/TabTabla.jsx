import React from 'react';
import { Users, Download, User, Car } from 'lucide-react';
import { f } from '../../utils/formatUtils';

const TabTabla = ({ data, onSelect, onExport, hideFinancials = false }) => (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white animate__animated animate__fadeIn h-100 d-flex flex-column">
      <div className="card-header bg-transparent border-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center flex-shrink-0">
        <div>
           <h5 className="fw-extrabold mb-0 text-dark d-flex align-items-center gap-2">
              <div className="p-2 rounded-3 bg-light text-primary"><Users size={20} /></div>
              {hideFinancials ? 'Lista de Empleados' : 'Rentabilidad por Empleado'}
           </h5>
           <p className="text-muted small mb-0 mt-1">
             {hideFinancials ? 'Selecciona un empleado para ver su detalle' : 'Desglose detallado de ingresos y costos atribuidos'}
           </p>
        </div>
        {!hideFinancials && (
          <button
            onClick={onExport}
            className="btn btn-light btn-sm rounded-pill px-3 shadow-sm d-flex align-items-center gap-2 fw-bold text-secondary"
          >
              <Download size={16} /> Exportar Excel
          </button>
        )}
      </div>
      <div className="card-body p-0 flex-grow-1 overflow-hidden d-flex flex-column">
         <div className="table-responsive flex-grow-1 overflow-auto custom-scrollbar">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-secondary small text-uppercase sticky-top" style={{ fontSize: '13px', letterSpacing: '0.5px', top: 0, zIndex: 10 }}>
              <tr>
                <th className="px-4 py-4 border-0 fw-bold">Chofer / Empleado</th>
                {!hideFinancials && (
                  <>
                    <th className="px-4 py-4 border-0 text-end fw-bold">Ingresos (Caja)</th>
                    <th className="px-4 py-4 border-0 text-end fw-bold">Gastos Op.</th>
                    <th className="px-4 py-4 border-0 text-end fw-bold">Mantenimiento</th>
                    <th className="px-4 py-4 border-0 text-end fw-bold">Nómina</th>
                    <th className="px-4 py-4 border-0 text-end fw-extrabold text-dark">Utilidad Real</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="border-top-0">
              {(() => {
                const uniqueEmps = [];
                const seenIds = new Set();
                (data.empleados || []).forEach(e => {
                  if (e.empleado_id && !seenIds.has(e.empleado_id)) {
                    seenIds.add(e.empleado_id);
                    uniqueEmps.push(e);
                  }
                });

                const filtered = uniqueEmps.filter(e => !['monitorista', 'taller'].includes((e.empleado_rol || '').toLowerCase()));

                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan={hideFinancials ? "1" : "6"} className="text-center py-5 text-muted small">
                        No hay empleados con ingresos registrados en este periodo.
                      </td>
                    </tr>
                  );
                }

                return filtered.map((emp, index) => {
                  const savedCom = localStorage.getItem(`comision_nomina_${emp.empleado_id || emp.vehiculo_asignado}`);
                  const comision = savedCom !== null ? Number(savedCom) : 20;
                  const baseComision = Math.max(0, Number(emp.utilidad_real));
                  const nominaAmount = (baseComision * comision) / 100;
                  const utilidadConNomina = Number(emp.utilidad_real) - nominaAmount;

                  return (
                    <tr key={`${emp.empleado_id || emp.vehiculo_asignado}-${index}`}
                        className={`transition-all ${onSelect ? 'hover-bg-light cursor-pointer' : ''}`}
                        onClick={() => onSelect && onSelect(emp)}
                    >
                      <td className="px-4 py-4">
                          <div className="d-flex align-items-center gap-3">
                              <div className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold small shadow-sm flex-shrink-0" style={{ width: '42px', height: '42px', fontSize: '14px', minWidth: '42px' }}>
                                  <User size={18} />
                              </div>
                              <div>
                                  <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: '15px' }}>
                                    {emp.empleado_nombre}
                                  </h6>
                                  <div className="d-flex flex-wrap gap-1">
                                      {emp.empleado_rol && (
                                          <span className="badge bg-light text-secondary border fw-normal d-flex align-items-center" style={{ fontSize: '11px', padding: '4px 8px' }}>
                                              {emp.empleado_rol}
                                          </span>
                                      )}
                                      {emp.vehiculo_asignado && (
                                          <span className="badge bg-light text-secondary border fw-normal d-flex align-items-center" style={{ fontSize: '11px', padding: '4px 8px' }}>
                                              <Car size={12} className="me-1 opacity-75"/> {emp.vehiculo_asignado}
                                          </span>
                                      )}
                                      <span className="badge bg-light text-secondary border fw-normal" style={{ fontSize: '11px', padding: '4px 8px' }}>
                                          {emp.total_viajes} viajes
                                      </span>
                                  </div>
                              </div>
                          </div>
                      </td>
                      {!hideFinancials && (
                        <>
                          <td className="px-4 text-end">
                              <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 border border-success border-opacity-10" style={{ fontSize: '14px' }}>
                                  +{f(emp.total_ingresos)}
                              </span>
                          </td>
                          <td className="px-4 text-end text-danger fw-medium" style={{ fontSize: '14px' }}>-{f(emp.gastos_operativos_chofer)}</td>
                          <td className="px-4 text-end text-warning fw-medium" style={{ fontSize: '14px' }}>-{f(emp.costo_mantenimiento_vehiculo)}</td>
                          <td className="px-4 text-end text-primary fw-medium" style={{ fontSize: '14px' }}>-{f(nominaAmount)}</td>
                          <td className="px-4 text-end">
                              <h6 className={`mb-0 fw-extrabold ${utilidadConNomina >= 0 ? 'text-primary' : 'text-danger'}`} style={{ fontSize: '16px' }}>
                                  {f(utilidadConNomina)}
                              </h6>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                });
              })()}
            </tbody>
            {!hideFinancials && (
              <tfoot className="bg-light fw-bold sticky-bottom" style={{ fontSize: '13px', bottom: 0, zIndex: 10 }}>
                <tr className="border-top">
                    <td className="px-4 py-3 text-uppercase text-secondary small">Totales Generales</td>
                    <td className="text-end px-4 py-3 text-dark">
                      <div className="d-flex flex-column align-items-end">
                        <span>{f(data.global.ingresos_brutos)}</span>
                        <small className="text-muted fw-normal" style={{fontSize: '9px'}}>+ {f(data.global.total_propinas || 0)} propinas</small>
                      </div>
                    </td>
                    <td className="text-end px-4 py-3 text-danger">-{f(data.global.gastos_operativos_chofer)}</td>
                    <td className="text-end px-4 py-3 text-warning">-{f(data.global.gastos_mantenimiento_flota + (data.global.gastos_fijos_flota || 0))}</td>
                    <td className="text-end px-4 py-3 text-primary">
                      {(() => {
                        const totalNomina = (data.empleados || [])
                          .filter(e => !['monitorista', 'taller'].includes((e.empleado_rol || '').toLowerCase()))
                          .reduce((sum, emp) => {
                            const savedCom = localStorage.getItem(`comision_nomina_${emp.empleado_id || emp.vehiculo_asignado}`);
                            const comision = savedCom !== null ? Number(savedCom) : 20;
                            const baseComision = Math.max(0, Number(emp.utilidad_real));
                            return sum + ((baseComision * comision) / 100);
                          }, 0);
                        return `-${f(totalNomina)}`;
                      })()}
                    </td>
                    <td className="text-end px-4 py-3">
                        <span className={`badge ${(() => {
                             const totalNomina = (data.empleados || [])
                               .filter(e => !['monitorista', 'taller'].includes((e.empleado_rol || '').toLowerCase()))
                               .reduce((sum, emp) => {
                                 const savedCom = localStorage.getItem(`comision_nomina_${emp.empleado_id || emp.vehiculo_asignado}`);
                                 const comision = savedCom !== null ? Number(savedCom) : 20;
                                 return sum + ((Number(emp.total_ingresos) * comision) / 100);
                               }, 0);
                             const netProfit = data.global.utilidad_neta_total - totalNomina;
                             return netProfit >= 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger';
                          })()} border border-subtle px-2 py-1 rounded-pill`}>
                            {(() => {
                               const totalNomina = (data.empleados || [])
                                 .filter(e => !['monitorista', 'taller'].includes((e.empleado_rol || '').toLowerCase()))
                                 .reduce((sum, emp) => {
                                   const savedCom = localStorage.getItem(`comision_nomina_${emp.empleado_id || emp.vehiculo_asignado}`);
                                   const comision = savedCom !== null ? Number(savedCom) : 20;
                                   const baseComision = Math.max(0, Number(emp.utilidad_real));
                                   return sum + ((baseComision * comision) / 100);
                                 }, 0);
                               return f(data.global.utilidad_neta_total - totalNomina);
                            })()}
                        </span>
                    </td>
                </tr>
              </tfoot>
            )}
          </table>
         </div>
      </div>
    </div>
  );

export default TabTabla;
