import React, { useState, useRef } from 'react';
import { 
  Users, Search, User, CreditCard, ChevronRight, CheckCircle, 
  X, DollarSign, Activity, TrendingUp 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as ReTooltip, ResponsiveContainer 
} from 'recharts';
import SignatureCanvas from 'react-signature-canvas';
import { NOMINA_GUARDAR_TRANSFERENCIA_URL, UPLOADS_URL } from '../../config';
import { formatDateForApi } from '../../utils/dateUtils';

// Utility functions
const f = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);

const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const TabTransferencias = ({ 
  data, 
  loadingLocal, 
  setLoadingLocal, 
  transferHistory, 
  setTransferHistory, 
  selectedTransferEmp, 
  setSelectedTransferEmp,
  filtroFecha,
  setFiltroFecha,
  statusTransfer,
  setStatusTransfer,
  StatusModal,
  montoTransferencia,
  setMontoTransferencia,
  // Props needed for calculations/logic inside
  getRangoFechas
}) => {
    const sigCanvas = useRef({});

    // Calcular la semana pasada (lunes a domingo)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Dom) a 6 (Sab)
    const diffToLastMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + 7;
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - diffToLastMonday);
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);

    const handleSave = async () => {
      // 1. Validaciones
      if (!selectedTransferEmp || !montoTransferencia || parseFloat(montoTransferencia) <= 0) {
        setStatusTransfer({ show: true, type: 'error', message: 'Selecciona un empleado e ingresa un monto válido.' });
        return;
      }
      if (sigCanvas.current.isEmpty()) {
        setStatusTransfer({ show: true, type: 'error', message: 'La firma del administrador es obligatoria.' });
        return;
      }

      setLoadingLocal(true);
      setStatusTransfer({ show: true, type: 'loading', message: 'Procesando transferencia...' });

      try {
        const signatureDataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
        const signatureFile = dataURLtoFile(signatureDataUrl, 'firma_admin.png');

        const formData = new FormData();
        const empId = selectedTransferEmp.empleado_id;
        // Si no tiene ID de empleado, es vehículo asignado directo (caso raro pero posible en lógica actual)
        // La API espera empleado_id. Si es null, el backend podría fallar o requerir ajuste. 
        // Asumimos que siempre hay empleado_id en la lista filtrada salvo bug.
        
        formData.append('empleado_id', empId); 
        formData.append('monto', montoTransferencia);
        
        // Usar fechas locales correctas
        formData.append('fecha_inicio_semana', formatDateForApi(lastMonday));
        formData.append('fecha_fin_semana', formatDateForApi(lastSunday));
        
        formData.append('firma_admin', signatureFile);

        const res = await fetch(NOMINA_GUARDAR_TRANSFERENCIA_URL, {
          method: 'POST',
          body: formData
        });

        const result = await res.json();

        if (result.status === 'success') {
          setStatusTransfer({ show: true, type: 'success', message: 'Transferencia registrada correctamente.' });
          setMontoTransferencia('');
          sigCanvas.current.clear();
          
          // Actualizar historial localmente
          const newTransfer = {
            fecha_ejecucion: new Date().toISOString(),
            empleado_nombre: selectedTransferEmp.empleado_nombre, // Para mostrar en tabla global al instante
            empleado_id: empId,
            monto: montoTransferencia,
            fecha_inicio_semana: formatDateForApi(lastMonday),
            fecha_fin_semana: formatDateForApi(lastSunday),
            firma_admin_path: result.firma_path // Asumiendo que el back devuelve esto
          };
          setTransferHistory(prev => [newTransfer, ...prev]);
        } else {
          throw new Error(result.message || 'Error al guardar');
        }
      } catch (error) {
        console.error(error);
        setStatusTransfer({ show: true, type: 'error', message: error.message || 'Error de conexión.' });
      } finally {
        setLoadingLocal(false);
      }
    };

    const chartDataTrans = [...transferHistory].reverse().map(t => ({
      fecha: new Date(t.fecha_ejecucion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
      monto: parseFloat(t.monto)
    }));

    return (
      <div className="animate__animated animate__fadeIn h-100 overflow-hidden">
        <div className="row g-4 h-100 flex-nowrap m-0">
          {/* Listado de Empleados */}
          <div className="col-12 col-lg-4 col-xl-3 h-100 d-flex flex-column">
            <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden h-100 d-flex flex-column">
               <div className="p-3 border-bottom bg-white flex-shrink-0">
                  <h6 className="mb-3 fw-bold d-flex align-items-center gap-2">
                     <div className="p-1 rounded-2 bg-primary bg-opacity-10 text-primary"><Users size={16}/></div>
                     Colaboradores
                  </h6>
                  <div className="input-group bg-light rounded-pill border-0 px-3 py-1">
                     <Search size={14} className="text-muted" />
                     <input 
                        type="text" 
                        className="form-control bg-transparent border-0 shadow-none ps-2 small"
                        placeholder="Buscar..." 
                        style={{ fontSize: '0.8rem' }}
                        value={filtroFecha} // Reusing filtroFecha as a general search term or adding a new state if needed
                        onChange={(e) => setFiltroFecha(e.target.value)}
                     />
                  </div>
               </div>
               <div className="card-body p-0 overflow-auto custom-scrollbar flex-grow-1">
                  {(() => {
                    const uniqueEmps = [];
                    const seenIds = new Set();
                    (data.empleados || []).forEach(e => {
                      if (e.empleado_id && !seenIds.has(e.empleado_id)) {
                        seenIds.add(e.empleado_id);
                        uniqueEmps.push(e);
                      }
                    });

                    return uniqueEmps
                      .filter(e => !['monitorista', 'taller'].includes((e.empleado_rol || '').toLowerCase()))
                      .filter(e => e.vehiculo_asignado) // Filter: Only show employees with assigned vehicle
                      .filter(e => {
                         if (!filtroFecha) return true;
                         const search = filtroFecha.toLowerCase();
                         return (e.empleado_nombre || "").toLowerCase().includes(search);
                      })
                      .map((e, idx) => {
                      const id = e.empleado_id || e.vehiculo_asignado;
                      const isSelected = selectedTransferEmp && (selectedTransferEmp.empleado_id === e.empleado_id);
                      
                      return (
                        <div 
                          key={idx}
                          onClick={() => {
                             if (isSelected) {
                                setSelectedTransferEmp(null); // Deseleccionar
                             } else {
                                setSelectedTransferEmp(e);
                             }
                          }}
                          className={`p-3 border-bottom cursor-pointer transition-all ${isSelected ? 'bg-primary bg-opacity-10 border-primary border-start border-4' : 'hover-bg-light'}`}
                        >
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                              <div className={`rounded-circle d-flex align-items-center justify-content-center fw-bold small ${isSelected ? 'bg-primary text-white' : 'bg-light text-secondary'}`} 
                                   style={{width: '32px', height: '32px'}}>
                                <User size={14} />
                              </div>
                              <div>
                                <h6 className={`mb-0 small fw-bold ${isSelected ? 'text-primary' : 'text-dark'}`}>{e.empleado_nombre || e.vehiculo_asignado}</h6>
                                <span className="text-muted" style={{fontSize: '10px'}}>{e.empleado_rol || 'Sin Rol'}</span>
                              </div>
                            </div>
                            {isSelected && <ChevronRight size={14} className="text-primary"/>}
                          </div>
                        </div>
                      );
                    });
                  })()}
               </div>
            </div>
          </div>

          {/* Formulario de Transferencia */}
          <div className="col-12 col-lg-8 col-xl-9 h-100 overflow-auto custom-scrollbar">
            {selectedTransferEmp ? (
              <div className="bg-white rounded-4 shadow-sm border p-4 animate__animated animate__fadeIn">
                <div className="d-flex justify-content-between align-items-start mb-4 pb-3 border-bottom">
                  <div>
                    <h5 className="fw-bold mb-1">Nueva Transferencia</h5>
                    <p className="text-muted small mb-0">Registrar pago o adelanto semanal</p>
                  </div>
                  <div className="text-end">
                    <span className="d-block small text-muted text-uppercase fw-bold">Periodo Reportado</span>
                    <span className="badge bg-light text-dark border">
                      {lastMonday.toLocaleDateString('es-MX', {day: '2-digit', month: 'short'})} - {lastSunday.toLocaleDateString('es-MX', {day: '2-digit', month: 'short'})}
                    </span>
                    <div className="text-end mt-2">
                      <span className="d-block small text-muted text-uppercase fw-bold">Empleado</span>
                      <span className="fw-bold">{selectedTransferEmp.empleado_nombre || selectedTransferEmp.vehiculo_asignado}</span>
                    </div>
                  </div>
                </div>

                <div className="row g-4 m-0">
                  <div className="col-12 col-xl-6">
                    <div className="bg-light bg-opacity-50 p-4 rounded-4 border border-dashed mb-4">
                      <label className="fw-bold small text-muted text-uppercase mb-2">Monto Transferido ($)</label>
                      <div className="input-group input-group-lg shadow-sm rounded-4 overflow-hidden border bg-white">
                        <span className="input-group-text bg-white border-0 text-success"><DollarSign size={20}/></span>
                        <input 
                          type="number" 
                          min="0"
                          className="form-control border-0 fw-extrabold" 
                          placeholder="0.00"
                          value={montoTransferencia}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMontoTransferencia(val);
                          }}
                        />
                      </div>
                      
                      <div className="mt-4">
                        <div className="d-flex justify-content-between mb-2">
                          <label className="fw-bold small text-muted text-uppercase">Firma Administrador</label>
                          <button onClick={() => sigCanvas.current.clear()} className="btn btn-sm text-danger fw-bold p-0">Limpiar</button>
                        </div>
                        <div className="border rounded-4 bg-white overflow-hidden shadow-sm" style={{height: '140px', borderStyle: 'solid', borderWidth: '1px'}}>
                          <SignatureCanvas 
                            ref={sigCanvas} 
                            penColor="#0f172a" 
                            canvasProps={{className: 'w-100 h-100'}}
                          />
                        </div>
                      </div>

                      <button 
                        className="btn btn-primary w-100 py-3 rounded-4 fw-bold mt-4 shadow-sm"
                        onClick={handleSave}
                        disabled={loadingLocal}
                      >
                        {loadingLocal ? 'Guardando...' : 'Autorizar y Guardar'}
                      </button>
                    </div>
                  </div>

                  <div className="col-12 col-xl-6">
                    <h6 className="fw-bold small text-muted text-uppercase mb-3">Flujo de Transferencias</h6>
                    <div style={{height: '250px', minWidth: 0}}>
                      {chartDataTrans.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%" debounce={100}>
                          <BarChart data={chartDataTrans}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1}/>
                            <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{fontSize: 10}}/>
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} hide/>
                            <ReTooltip 
                              contentStyle={{borderRadius: '12px', border: 'none', shadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                              formatter={(val) => [f(val), 'Monto']}
                            />
                            <Bar dataKey="monto" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={30} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="d-flex flex-column align-items-center justify-content-center h-100 border rounded-4 border-dashed text-muted small bg-light bg-opacity-50 p-4">
                          <Activity size={32} className="opacity-25 mb-2"/>
                          Sin datos históricos para graficar
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Historial */}
                <div className="bg-white rounded-4 shadow-sm border overflow-hidden mt-4">
                  <div className="p-3 border-bottom bg-light">
                    <h6 className="mb-0 fw-bold">Historial de Transferencias</h6>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                      <thead className="bg-light">
                        <tr style={{fontSize: '11px'}} className="text-muted text-uppercase">
                          <th className="px-4">Fecha Ejecución</th>
                          <th>Periodo Reportado</th>
                          <th>Monto</th>
                          <th className="text-end px-4">Firma</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transferHistory.length > 0 ? (
                          transferHistory.map((t, idx) => (
                            <tr key={idx}>
                              <td className="px-4">
                                <span className="d-block fw-bold">{new Date(t.fecha_ejecucion).toLocaleDateString()}</span>
                                <small className="text-muted">{new Date(t.fecha_ejecucion).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                              </td>
                              <td>
                                {(() => {
                                  // Forzar interpretación local reemplazando guiones por slashes 
                                  const dIni = new Date(t.fecha_inicio_semana.replace(/-/g, '\/'));
                                  const dFin = new Date(t.fecha_fin_semana.replace(/-/g, '\/'));
                                  return `${dIni.toLocaleDateString('es-MX', {day: '2-digit', month: 'short'})} - ${dFin.toLocaleDateString('es-MX', {day: '2-digit', month: 'short'})}`;
                                })()}
                              </td>
                              <td className="fw-extrabold text-success">{f(t.monto)}</td>
                              <td className="text-end px-4">
                                {t.firma_admin_path ? (
                                  <img 
                                    src={`${UPLOADS_URL}${t.firma_admin_path}`} 
                                    alt="Firma" 
                                    style={{height: '30px', mixBlendMode: 'multiply'}}
                                    className="bg-light rounded p-1"
                                  />
                                ) : <span className="text-muted small">Sin firma</span>}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center py-5 text-muted small">No hay transferencias registradas para este colaborador.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <StatusModal status={statusTransfer} onClose={() => setStatusTransfer({...statusTransfer, show: false})} />

              </div>
            ) : (
              <div className="d-flex flex-column gap-4 animate__animated animate__fadeIn">
                {/* Cuadro de Resumen Global */}
                <div className="row g-4 m-0 p-0">
                  <div className="col-12 col-md-4">
                    <div className="bg-white rounded-4 shadow-sm border p-4 h-100 border-start border-primary border-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-3 rounded-4 bg-primary bg-opacity-10 text-primary">
                          <Activity size={24} />
                        </div>
                        <div>
                          <h6 className="text-muted small fw-bold mb-1 text-uppercase">Total Histórico</h6>
                          <h4 className="fw-extrabold mb-0">{f(transferHistory.reduce((acc, t) => acc + parseFloat(t.monto), 0))}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="bg-white rounded-4 shadow-sm border p-4 h-100 border-start border-success border-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-3 rounded-4 bg-success bg-opacity-10 text-success">
                          <TrendingUp size={24} />
                        </div>
                        <div>
                          <h6 className="text-muted small fw-bold mb-1 text-uppercase">Promedio Depósito</h6>
                          <h4 className="fw-extrabold mb-0">{f(transferHistory.length > 0 ? transferHistory.reduce((acc, t) => acc + parseFloat(t.monto), 0) / transferHistory.length : 0)}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="bg-white rounded-4 shadow-sm border p-4 h-100 border-start border-info border-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-3 rounded-4 bg-info bg-opacity-10 text-info">
                          <CreditCard size={24} />
                        </div>
                        <div>
                          <h6 className="text-muted small fw-bold mb-1 text-uppercase">Total Operaciones</h6>
                          <h4 className="fw-extrabold mb-0">{transferHistory.length}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-4 shadow-sm border p-4">
                   <div className="d-flex justify-content-between align-items-center mb-4">
                      <h6 className="fw-bold mb-0">Tendencia de Transferencias (Global)</h6>
                      <div className="badge bg-light text-dark border">Últimas 10 operaciones</div>
                   </div>
                   <div style={{height: '250px'}}>
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={chartDataTrans.slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1}/>
                            <XAxis dataKey="fecha" axisLine={false} tickLine={false} tick={{fontSize: 10}}/>
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} hide/>
                            <ReTooltip 
                               contentStyle={{borderRadius: '12px', border: 'none', shadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                               formatter={(val) => [f(val), 'Monto Total']}
                            />
                            <Bar dataKey="monto" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                {/* Historial Global */}
                <div className="bg-white rounded-4 shadow-sm border overflow-hidden mb-4">
                  <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold">Registro Maestro de Transferencias</h6>
                    <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill">Visualizando todos los colaboradores</span>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                      <thead className="bg-light">
                        <tr style={{fontSize: '11px'}} className="text-muted text-uppercase">
                          <th className="px-4">Fecha Ejecución</th>
                          <th>Colaborador</th>
                          <th>Periodo Reportado</th>
                          <th>Monto</th>
                          <th className="text-end px-4">Firma</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transferHistory.length > 0 ? (
                          transferHistory.map((t, idx) => (
                            <tr key={idx}>
                              <td className="px-4">
                                <span className="d-block fw-bold">{new Date(t.fecha_ejecucion).toLocaleDateString()}</span>
                                <small className="text-muted">{new Date(t.fecha_ejecucion).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                              </td>
                              <td className="fw-bold">{t.empleado_nombre || t.empleado_id}</td>
                              <td>
                                {(() => {
                                  const dIni = new Date(t.fecha_inicio_semana.replace(/-/g, '\/'));
                                  const dFin = new Date(t.fecha_fin_semana.replace(/-/g, '\/'));
                                  return `${dIni.toLocaleDateString('es-MX', {day: '2-digit', month: 'short'})} - ${dFin.toLocaleDateString('es-MX', {day: '2-digit', month: 'short'})}`;
                                })()}
                              </td>
                              <td className="fw-extrabold text-success">{f(t.monto)}</td>
                              <td className="text-end px-4">
                                {t.firma_admin_path ? (
                                  <img 
                                    src={`${UPLOADS_URL}${t.firma_admin_path}`} 
                                    alt="Firma" 
                                    style={{height: '30px', mixBlendMode: 'multiply'}}
                                    className="bg-light rounded p-1"
                                  />
                                ) : <span className="text-muted small">Sin firma</span>}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center py-5 text-muted small">No hay transferencias registradas aún en el sistema.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
};

export default TabTransferencias;
