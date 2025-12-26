import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, Car, ShieldCheck, Wrench, Calculator, 
  Fuel, Calendar, Coins, Settings, Gauge, 
  Thermometer, CreditCard, CheckCircle2, AlertCircle,
  Activity, Droplets, ClipboardList, Zap, Sparkles, RefreshCw
} from 'lucide-react';

// --- SUB-COMPONENTE: Fila de Fecha con Autoprogramación ---
const FechaVencimientoRow = ({ label, dateField, editData, updateField, colorClass }) => {
  const [periodo, setPeriodo] = useState("manual");

  const calcularProximaFecha = (fechaBase, intervalo) => {
    const base = fechaBase ? new Date(fechaBase + 'T00:00:00') : new Date();
    if (isNaN(base.getTime()) || intervalo === "manual") return;
    const fecha = new Date(base);
    switch (intervalo) {
      case "1m": fecha.setMonth(fecha.getMonth() + 1); break;
      case "4m": fecha.setMonth(fecha.getMonth() + 4); break;
      case "6m": fecha.setMonth(fecha.getMonth() + 6); break;
      case "1y": fecha.setFullYear(fecha.getFullYear() + 1); break;
      case "2y": fecha.setFullYear(fecha.getFullYear() + 2); break;
      default: return;
    }
    const nuevaFecha = fecha.toISOString().split('T')[0];
    updateField(dateField, nuevaFecha);
    setPeriodo("manual"); 
  };

  return (
    <div className="col-12 mb-3">
      <div className={`p-2 rounded border-start border-4 bg-light shadow-sm`} style={{ borderLeftColor: colorClass }}>
        <div className="row g-2 align-items-end">
          <div className="col-6">
            <label className="small fw-bold d-block text-truncate">
              <Calendar size={12} className="me-1"/> {label}
            </label>
            <input 
              type="date" 
              className="form-control form-control-sm border-0 bg-white" 
              value={editData[dateField] || ''} 
              onChange={e => updateField(dateField, e.target.value)} 
            />
          </div>
          <div className="col-6">
            <label className="small text-muted" style={{fontSize: '0.65rem'}}>Autoprogramar</label>
            <select 
              className="form-select form-select-sm border-0 bg-white fw-bold text-primary"
              value={periodo}
              onChange={(e) => {
                const val = e.target.value;
                setPeriodo(val);
                calcularProximaFecha(editData[dateField], val);
              }}
            >
              <option value="manual">⚙️ Manual</option>
              <option value="1m">+1 Mes</option>
              <option value="4m">+4 Meses</option>
              <option value="6m">+6 Meses</option>
              <option value="1y">+1 Año</option>
              <option value="2y">+2 Años</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE CalcRow ---
const CalcRow = ({ icon: Icon, label, field, editData, onCalculate, colors }) => {
  const [monto, setMonto] = useState("");
  const [periodo, setPeriodo] = useState("anual");

  useEffect(() => {
    if (editData && editData[field]) {
      setMonto(editData[field]);
      setPeriodo("anual");
    } else {
      setMonto("");
    }
  }, [editData?.id, field]);

  return (
    <div className="col-12 col-xl-6 bg-white p-2 rounded shadow-sm mb-2 border-start border-4" style={{ borderColor: colors.tech }}>
      <div className="row align-items-center g-2">
        <div className="col-7 col-sm-8">
          <label className="small fw-bold d-flex align-items-center gap-1">
            <Icon size={14} className="text-primary"/> {label}
          </label>
          <input 
            type="number" 
            name={field} 
            className="form-control form-control-sm" 
            placeholder="0.00"
            step="0.01"
            value={monto}
            onChange={(e) => { 
              setMonto(e.target.value); 
              onCalculate(e.target.value, periodo, field); 
            }}
          />
        </div>
        <div className="col-5 col-sm-4">
          <label className="small" style={{ fontSize: '0.65rem' }}>Periodo</label>
          <select 
            className="form-select form-select-sm" 
            value={periodo}
            onChange={(e) => { 
              setPeriodo(e.target.value); 
              onCalculate(monto, e.target.value, field); 
            }}
          >
            <option value="anual">Anual</option>
            <option value="semestral">Semestral (6m)</option>
            <option value="cuatrimestral">Cuatrimestral (4m)</option>
            <option value="mensual">Mes</option>
            <option value="semanal">Semana</option>
            <option value="diario">Día</option>
          </select>
        </div>
        <div className="col-12 text-end border-top pt-1 mt-1">
          <small className="text-muted" style={{ fontSize: '0.65rem' }}>Anual: </small>
          <span className="fw-bold text-success small">
            ${new Intl.NumberFormat('es-MX').format(editData?.[field] || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function ModalEdicion({ modalRef, editData, setEditData, guardarCambios, colors }) {
  const [status, setStatus] = useState({ loading: false, type: null, msg: "" });
  const closeBtnRef = useRef(null);

  if (!editData) return null;

  // --- CORRECCIÓN AQUÍ: Se crea el FormData con los datos actuales del estado ---
  const ejecutarGuardado = async () => {
    setStatus({ loading: true, type: null, msg: "" });
    try {
      const formData = new FormData();
      // Iteramos sobre editData para asegurar que kilometraje_actual y todo lo demás viaje
      Object.keys(editData).forEach(key => {
        formData.append(key, editData[key] ?? "");
      });

      // Enviamos el FormData al padre
      await guardarCambios({ 
        preventDefault: () => {}, 
        target: formData 
      });
      
      setStatus({ loading: false, type: 'success', msg: "¡Sincronizado!" });
      setTimeout(() => {
          setStatus({ loading: false, type: null, msg: "" });
          closeBtnRef.current?.click();
      }, 1500);
    } catch (error) {
      setStatus({ loading: false, type: 'error', msg: "Error al sincronizar." });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    ejecutarGuardado();
  };

  const handleCostCalculation = (valor, periodo, campoBase) => {
    const num = parseFloat(valor) || 0;
    let anual = 0;
    if (periodo === 'diario') anual = num * 365;
    else if (periodo === 'semanal') anual = num * 52;
    else if (periodo === 'mensual') anual = num * 12;
    else if (periodo === 'cuatrimestral') anual = num * 3;
    else if (periodo === 'semestral') anual = num * 2;
    else anual = num;
    setEditData(prev => ({ ...prev, [campoBase]: anual.toFixed(2) }));
  };

  const updateField = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="modal fade" id="modalEdicion" tabIndex="-1" ref={modalRef} aria-hidden="true">
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable p-2 p-md-0">
        <div className="modal-content border-0 shadow-lg position-relative overflow-hidden">
          
          {status.type && (
            <div className="position-absolute w-100 h-100 d-flex flex-column justify-content-center align-items-center rounded" 
                  style={{ zIndex: 1050, backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)' }}>
              {status.type === 'success' ? (
                <>
                  <CheckCircle2 size={60} className="text-success mb-2 animate__animated animate__bounceIn" />
                  <h4 className="fw-bold text-dark text-center px-3">{status.msg}</h4>
                </>
              ) : (
                <>
                  <AlertCircle size={60} className="text-danger mb-2" />
                  <h4 className="fw-bold text-dark text-center px-3">{status.msg}</h4>
                  <button type="button" className="btn btn-sm btn-outline-dark mt-3" onClick={() => setStatus({type: null})}>Reintentar</button>
                </>
              )}
            </div>
          )}

          <div className="modal-header text-white px-3 py-3" style={{ backgroundColor: colors.primary }}>
            <h5 className="modal-title fw-bold d-flex align-items-center mb-0" style={{ fontSize: 'clamp(0.9rem, 4vw, 1.25rem)' }}>
              <Settings className="me-2" size={20}/> 
              <span className="text-truncate" style={{ maxWidth: '200px' }}>{editData.unidad_nombre || 'Vehículo'}</span>
            </h5>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" ref={closeBtnRef}></button>
          </div>
          
          <form onSubmit={handleFormSubmit} className="d-flex flex-column overflow-hidden">
            <div className="modal-body p-3 p-md-4 bg-light">
              <div className="row g-3 g-lg-4">
                
                <div className="col-12 col-lg-5">
                  <h6 className="fw-bold text-muted mb-3 text-uppercase small"><Car size={16} className="me-2"/>Ficha Técnica</h6>
                  <div className="row g-2 g-md-3 bg-white p-3 rounded shadow-sm mb-4">
                    <div className="col-12">
                      <label className="form-label small fw-bold mb-1">Nombre de Unidad</label>
                      <input type="text" className="form-control form-control-sm" value={editData.unidad_nombre || ''} onChange={e => updateField('unidad_nombre', e.target.value)} required />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold text-danger mb-1"><Activity size={14} className="me-1"/> Estado Operativo</label>
                      <select className="form-select form-select-sm fw-bold" value={editData.estado || 'Activo'} onChange={e => updateField('estado', e.target.value)}>
                        <option value="Activo">Activo</option>
                        <option value="En Taller">En Taller</option>
                        <option value="Baja Temporal">Baja Temporal</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold mb-1">Placas</label>
                      <input type="text" className="form-control form-control-sm" value={editData.placas || ''} onChange={e => updateField('placas', e.target.value)} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold mb-1">Modelo (Año)</label>
                      <input type="text" className="form-control form-control-sm" value={editData.modelo || ''} onChange={e => updateField('modelo', e.target.value)} />
                    </div>
                  </div>

                  <h6 className="fw-bold text-muted mb-3 text-uppercase small"><Calendar size={16} className="me-2"/>Vencimientos e Intervalos</h6>
                  <div className="row g-1">
                    <FechaVencimientoRow label="Seguro" dateField="fecha_pago_seguro" editData={editData} updateField={updateField} colorClass="#3b82f6" />
                    <FechaVencimientoRow label="Revalidación" dateField="fecha_pago_revalidacion" editData={editData} updateField={updateField} colorClass="#e11d48" />
                    <FechaVencimientoRow label="Ecológico" dateField="fecha_pago_ecologico" editData={editData} updateField={updateField} colorClass="#10b981" />
                    <FechaVencimientoRow label="Servicio (Mantenimiento)" dateField="fecha_proximo_mantenimiento" editData={editData} updateField={updateField} colorClass="#f59e0b" />
                  </div>
                </div>

                <div className="col-12 col-lg-7">
                  <h6 className="fw-bold text-muted mb-3 text-uppercase small"><Calculator size={16} className="me-2"/>Presupuesto Anualizado</h6>
                  <div className="row g-2 mb-4">
                    <CalcRow icon={ShieldCheck} label="Seguro" field="costo_seguro_anual" editData={editData} onCalculate={handleCostCalculation} colors={colors} />
                    <CalcRow icon={Fuel} label="Gasolina" field="costo_gasolina_anual" editData={editData} onCalculate={handleCostCalculation} colors={colors} />
                    <CalcRow icon={Thermometer} label="Mant. Aceite" field="costo_aceite_anual" editData={editData} onCalculate={handleCostCalculation} colors={colors} />
                    <CalcRow icon={Wrench} label="Llantas" field="costo_llantas_anual" editData={editData} onCalculate={handleCostCalculation} colors={colors} />
                    <CalcRow icon={Zap} label="Tune Up" field="costo_tuneup_anual" editData={editData} onCalculate={handleCostCalculation} colors={colors} />
                    <CalcRow icon={Sparkles} label="Limpieza/Lavado" field="costo_lavado_anual" editData={editData} onCalculate={handleCostCalculation} colors={colors} />
                    <CalcRow icon={ClipboardList} label="Trámite Placas" field="costo_placas_anual" editData={editData} onCalculate={handleCostCalculation} colors={colors} />
                    <CalcRow icon={CheckCircle2} label="Engomado Ecol." field="costo_ecologico_anual" editData={editData} onCalculate={handleCostCalculation} colors={colors} />
                    <CalcRow icon={CreditCard} label="Reval. Anual" field="costo_revalidacion_anual" editData={editData} onCalculate={handleCostCalculation} colors={colors} />
                    <CalcRow icon={Coins} label="Fondo Ahorro" field="monto_ahorro_anual" editData={editData} onCalculate={handleCostCalculation} colors={colors} />
                  </div>

                  <h6 className="fw-bold text-muted mb-3 text-uppercase small"><Gauge size={16} className="me-2"/>Lecturas de Unidad</h6>
                  <div className="bg-white p-3 rounded shadow-sm">
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="small fw-bold mb-2">Odómetro Actual (KM)</label>
                        {/* El valor y el onChange ahora están vinculados correctamente */}
                        <input 
                           type="number" 
                           className="form-control form-control-sm fw-bold text-primary" 
                           value={editData.kilometraje_actual || ''} 
                           onChange={e => updateField('kilometraje_actual', e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer bg-white border-top p-3 mt-auto">
              <button type="submit" className="btn btn-primary w-100 fw-bold py-3 shadow-sm rounded-3 d-flex align-items-center justify-content-center" disabled={status.loading}>
                {status.loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <Save size={20} className="me-2"/>}
                <span>ACTUALIZAR EXPEDIENTE</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}