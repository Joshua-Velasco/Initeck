import React, { useState, useRef } from 'react';
import { 
  Save, Car, ShieldCheck, Wrench, Calculator, 
  Fuel, Calendar, Coins, Settings, Gauge, 
  Thermometer, CreditCard, CheckCircle2, AlertCircle,
  Activity, Plus, Drill
} from 'lucide-react';

const CalcRow = ({ icon: Icon, label, field, value, onCalculate, colors }) => {
  const [monto, setMonto] = useState("");
  const [periodo, setPeriodo] = useState("anual");

  return (
    <div className="col-md-6 bg-white p-2 rounded shadow-sm mb-2 border-start border-4" style={{ borderColor: colors.tech }}>
      <div className="row align-items-center g-2">
        <div className="col-7">
          <label className="small fw-bold d-flex align-items-center gap-1">
            <Icon size={14} className="text-primary"/> {label}
          </label>
          <input 
            type="number" 
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
        <div className="col-5">
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
            <option value="semestral">Cada 6 meses</option>
            <option value="cuatrimestral">Cada 4 meses</option>
            <option value="mensual">Mensual</option>
            <option value="semanal">Semanal</option>
            <option value="diario">Diario</option>
          </select>
        </div>
        <div className="col-12 text-end border-top pt-1">
          <small className="text-muted" style={{ fontSize: '0.65rem' }}>Total Anual: </small>
          <span className="fw-bold text-success small">
            ${new Intl.NumberFormat('es-MX').format(value || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default function ModalAgregar({ colors, onUnidadAgregada }) {
  const initialState = {
    unidad_nombre: '', 
    estado: 'Activo', 
    placas: '', 
    modelo: '', 
    motor: '',
    aceite_tipo: '', 
    llantas_medida: '', 
    tiene_refaccion: 1,
    nivel_gasolina: 50, 
    kilometraje_actual: '',
    costo_seguro_anual: 0, 
    costo_gasolina_anual: 0, 
    costo_aceite_anual: 0,
    costo_llantas_anual: 0, 
    costo_revalidacion_anual: 0, 
    monto_ahorro_anual: 0,
    fecha_pago_seguro: '', 
    fecha_pago_revalidacion: '', 
    fecha_pago_ecologico: '', 
    fecha_proximo_mantenimiento: ''
  };

  const [formData, setFormData] = useState(initialState);
  const [status, setStatus] = useState({ loading: false, type: null, msg: "" });
  const closeBtnRef = useRef(null);
  const formRef = useRef(null);

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleCostCalculation = (valor, periodo, campoBase) => {
    const num = parseFloat(valor) || 0;
    let anual = 0;
    
    // Lógica de cálculo según el periodo seleccionado
    if (periodo === 'diario') anual = num * 365;
    else if (periodo === 'semanal') anual = num * 52;
    else if (periodo === 'mensual') anual = num * 12;
    else if (periodo === 'cuatrimestral') anual = num * 3; // 12 meses / 4 = 3 pagos al año
    else if (periodo === 'semestral') anual = num * 2;    // 12 meses / 6 = 2 pagos al año
    else anual = num;
    
    updateField(campoBase, anual.toFixed(2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, type: null, msg: "" });
    
    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      dataToSend.append(key, formData[key]);
    });

    try {
      const response = await fetch('http://inimovil.free.nf/Initeck-api/v1/vehiculos.php', {
        method: 'POST',
        body: dataToSend
      });
      const res = await response.json();
      
      if (res.status === 'success') {
        setStatus({ loading: false, type: 'success', msg: "¡Unidad registrada con éxito!" });
        setTimeout(() => {
          setFormData(initialState);
          formRef.current?.reset();
          onUnidadAgregada();
          closeBtnRef.current?.click();
          setTimeout(() => setStatus({ loading: false, type: null, msg: "" }), 500);
        }, 1800);
      } else {
        throw new Error(res.message || "Error al procesar");
      }
    } catch (error) {
      setStatus({ loading: false, type: 'error', msg: error.message || "Error de conexión" });
    }
  };

  return (
    <div className="modal fade" id="modalAgregar" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg position-relative overflow-hidden">
          
          {status.type && (
            <div className="position-absolute w-100 h-100 d-flex flex-column justify-content-center align-items-center" 
                 style={{ zIndex: 1050, backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)' }}>
                {status.type === 'success' ? (
                  <div className="text-center animate__animated animate__zoomIn">
                    <CheckCircle2 size={80} className="text-success mb-3" />
                    <h3 className="fw-bold text-dark">{status.msg}</h3>
                  </div>
                ) : (
                  <div className="text-center animate__animated animate__shakeX">
                    <AlertCircle size={80} className="text-danger mb-3" />
                    <h3 className="fw-bold text-dark">{status.msg}</h3>
                    <button type="button" className="btn btn-dark btn-sm mt-3" onClick={() => setStatus({ type: null })}>Reintentar</button>
                  </div>
                )}
            </div>
          )}

          <div className="modal-header bg-dark text-white border-0">
            <h5 className="modal-title fw-bold d-flex align-items-center">
              <Plus className="me-2" size={20}/> Nueva Unidad Operativa
            </h5>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" ref={closeBtnRef}></button>
          </div>
          
          <form onSubmit={handleSubmit} ref={formRef}>
            <div className="modal-body p-4 bg-light">
              <div className="row g-4">
                
                {/* FICHA TÉCNICA */}
                <div className="col-lg-6">
                  <div className="bg-white p-4 rounded-4 shadow-sm h-100 border-top border-4 border-dark">
                    <h6 className="fw-bold text-dark mb-4 text-uppercase small d-flex align-items-center">
                      <Car size={18} className="me-2 text-primary"/> Información de Identificación
                    </h6>
                    <div className="row g-3">
                      <div className="col-md-8">
                        <label className="form-label small fw-bold">Nombre de Unidad</label>
                        <input type="text" className="form-control" required value={formData.unidad_nombre} onChange={e => updateField('unidad_nombre', e.target.value)} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold">Modelo (Año)</label>
                        <input type="number" className="form-control" placeholder="YYYY" value={formData.modelo} onChange={e => updateField('modelo', e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Placas</label>
                        <input type="text" className="form-control" value={formData.placas} onChange={e => updateField('placas', e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Motor</label>
                        <input type="text" className="form-control" placeholder="Ej: V6 3.5L" value={formData.motor} onChange={e => updateField('motor', e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Tipo de Aceite</label>
                        <input type="text" className="form-control" placeholder="Ej: 5W-30 Sintético" value={formData.aceite_tipo} onChange={e => updateField('aceite_tipo', e.target.value)} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold">Medida de Llantas</label>
                        <input type="text" className="form-control" placeholder="Ej: 245/70R17" value={formData.llantas_medida} onChange={e => updateField('llantas_medida', e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* COSTOS */}
                <div className="col-lg-6">
                  <div className="bg-white p-4 rounded-4 shadow-sm border-top border-4 border-primary h-100">
                    <h6 className="fw-bold text-dark mb-4 text-uppercase small d-flex align-items-center">
                      <Calculator size={18} className="me-2 text-primary"/> Presupuesto Estimado
                    </h6>
                    <div className="row g-2">
                      <CalcRow icon={ShieldCheck} label="Seguro" field="costo_seguro_anual" value={formData.costo_seguro_anual} onCalculate={handleCostCalculation} colors={colors} />
                      <CalcRow icon={Fuel} label="Gasolina" field="costo_gasolina_anual" value={formData.costo_gasolina_anual} onCalculate={handleCostCalculation} colors={colors} />
                      <CalcRow icon={Wrench} label="Mant. Aceite" field="costo_aceite_anual" value={formData.costo_aceite_anual} onCalculate={handleCostCalculation} colors={colors} />
                      <CalcRow icon={Drill} label="Neumáticos" field="costo_llantas_anual" value={formData.costo_llantas_anual} onCalculate={handleCostCalculation} colors={colors} />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="modal-footer bg-white border-0 p-3">
              <button type="submit" className="btn btn-primary w-100 fw-bold py-3 shadow" disabled={status.loading}>
                {status.loading ? "PROCESANDO..." : "REGISTRAR VEHÍCULO"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}