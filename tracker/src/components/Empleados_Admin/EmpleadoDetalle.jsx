<<<<<<< HEAD
import React, { useState } from 'react';
=======
import React from 'react';
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
import { ResumenOperativo } from './ResumenOperativo';
import { GraficoRendimiento } from './GraficoRendimiento';
import { UnidadManager } from './UnidadManager';
import HistorialFinanciero from './SubComponents/HistorialFinanciero';
import HistorialInspecciones from './SubComponents/HistorialInspecciones';
import GraficoKilometraje from './SubComponents/GraficoKilometraje';
import HistorialMantenimientoEmpleado from './SubComponents/HistorialMantenimientoEmpleado';
import ResumenMonitorista from './SubComponents/ResumenMonitorista';
import { Shield, HardDrive, Zap } from 'lucide-react';
import { COLORS, getRolStyle, getRolLabel } from '../../constants/theme';

<<<<<<< HEAD
export default function EmpleadoDetalle({ empleado, onUnidadChange, activeTab, fechas, setFechas }) {
=======
export default function EmpleadoDetalle({ empleado, onUnidadChange }) {
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
  // Verificación de seguridad para evitar errores si el empleado es null
  if (!empleado) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center p-5 text-muted">
        <Zap size={48} className="mb-3 opacity-20" />
        <p className="fw-bold">Selecciona un empleado para ver su detalle operativo</p>
      </div>
    );
  }


<<<<<<< HEAD

=======
  const getLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [fechas, setFechas] = React.useState({
    inicio: getLocalDate(),
    fin: getLocalDate()
  });
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)

  return (
    <div className="container-fluid p-0 animate__animated animate__fadeIn">
      <div className="row g-4">
        {/* Lógica de Visualización basada en Roles */}

        {/* CASO 1: TALLER -> Ver Historial de Mantenimientos */}
        {['taller'].includes(empleado.rol) ? (
          <div className="col-12">
            <HistorialMantenimientoEmpleado empleado={empleado} />
          </div>
        )

          /* CASO 2: MONITORISTA -> Ver Stats de Monitoreo */
          : ['monitorista'].includes(empleado.rol) ? (
            <div className="col-12">
              <ResumenMonitorista empleado={empleado} />
            </div>
          )

            /* CASO 3: OTROS NO OPERATIVOS -> Ver Placeholder */
            : ['employee', 'cleaning', 'development'].includes(empleado.rol) ? (
              <div className="col-12">
                <div className="card border-0 shadow-sm rounded-4 bg-light">
                  <div className="card-body text-center p-5">
                    <Shield size={48} className="text-muted opacity-25 mb-3" />
                    <h4 className="fw-bold text-muted">Perfil No Operativo</h4>
                    <p className="text-muted mb-0">
                      El rol <span className="badge bg-secondary">{getRolLabel(empleado.rol)}</span> no genera registros de viajes, ingresos financieros ni kilometraje.
                    </p>
                  </div>
                </div>
              </div>
            )

              /* CASO 3: OPERATIVOS (Admin, Operator) -> Ver Dashboard Completo */
<<<<<<< HEAD
  /* CASO 3: OPERATIVOS (Admin, Operator) -> Ver Dashboard Completo */
              : (
                <>
                  {/* CONTENIDO DE TABS */}
                  <div className="col-12">
                    
                    {/* TAB: GENERAL */}
                    {activeTab === 'general' && (
                      <div className="row g-4 animate__animated animate__fadeIn">
                        <div className="col-12">
                          <ResumenOperativo
                            empleado={empleado}
                            fechas={fechas}
                            setFechas={setFechas}
                          />
                        </div>
                        <div className="col-12">
                          <div className="card border-0 shadow-sm rounded-4 h-100">
                            <div className="card-body p-4">
                              <GraficoRendimiento
                                empleado={empleado}
                                fechas={fechas}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB: HISTORIAL (FINANCIERO) */}
                    {activeTab === 'historial' && (
                      <div className="animate__animated animate__fadeIn">
                         <HistorialFinanciero
                            empleado={empleado}
                            fechas={fechas}
                          />
                      </div>
                    )}

                    {/* TAB: INSPECCIONES */}
                    {activeTab === 'inspecciones' && (
                       <div className="animate__animated animate__fadeIn">
                          <HistorialInspecciones
                            empleado={empleado}
                          />
                       </div>
                    )}

                    {/* TAB: COMPARATIVA */}
                    {activeTab === 'comparativa' && (
                       <div className="animate__animated animate__fadeIn">
                          <GraficoKilometraje
                            empleado={empleado}
                          />
                       </div>
                    )}

=======
              : (
                <>
                  {/* Resumen Superior: Métricas clave como combustible, odómetro y unidad actual */}
                  <div className="col-12">
                    <ResumenOperativo
                      empleado={empleado}
                      fechas={fechas}
                      setFechas={setFechas}
                    />
                  </div>


                  {/* Columna Principal: Gráficos de productividad y rutas diarias */}
                  <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                      <div className="card-body p-4">
                        <GraficoRendimiento
                          empleado={empleado}
                          fechas={fechas}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Historial Financiero: Ingresos y gastos del empleado */}
                  <div className="col-12">
                    <HistorialFinanciero
                      empleado={empleado}
                      fechas={fechas}
                    />
                  </div>

                  {/* Historial de Inspecciones: Checklist de salida y fotos */}
                  <div className="col-12">
                    <HistorialInspecciones
                      empleado={empleado}
                    />
                  </div>

                  {/* Gráfico de Kilometraje: Comparativa de recorrido */}
                  <div className="col-12">
                    <GraficoKilometraje
                      empleado={empleado}
                    />
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
                  </div>
                </>
              )}

        <style>{`
        .fw-black { font-weight: 900; }
        .uppercase { text-transform: uppercase; letter-spacing: 0.8px; }
        .animate__fadeIn { --animate-duration: 0.5s; }
      `}</style>
      </div>
    </div>
  );
}