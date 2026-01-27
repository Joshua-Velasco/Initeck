import React, { useState, useRef, useEffect } from 'react';
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import {
  Save, Plus, Calculator, FileText, CreditCard, Leaf,
  CheckCircle, XCircle, CalendarDays, Camera, Car,
  ShieldCheck, Zap, Disc, Droplets, Fuel, Waves
} from 'lucide-react';
import { ANADIR_URL } from '../../../config.js';

// Sub-componentes
import { FormEspecificaciones } from './FormEspecificaciones';
import { DocumentUpload } from './DocumentUpload';
import { FormVencimientos } from './FormVencimientos';
import { CalcRow } from './CalcRow';

const ModalEstado = ({ tipo, titulo, mensaje }) => (
  <div className="text-center p-4">
    <div className="mb-3">
      {tipo === 'success' ?
        <CheckCircle size={70} className="text-success animate__animated animate__bounceIn" /> :
        <XCircle size={70} className="text-danger animate__animated animate__shakeX" />
      }
    </div>
    <h4 className={`fw-bold ${tipo === 'success' ? 'text-success' : 'text-danger'}`}>{titulo}</h4>
    <p className="text-muted mb-4">{mensaje}</p>
    <button type="button" className="btn btn-dark w-100 py-2 fw-bold rounded-3" data-bs-dismiss="modal">Entendido</button>
  </div>
);

export default function ModalAgregar({ onUnidadAgregada }) {
  // Estado inicial alineado EXACTAMENTE con el PHP
  const initialState = {
    unidad_nombre: '',
    tipo_unidad: 'Nacional',
    estado: 'Activo',
    placas: '',
    numero_serie: '',
    modelo_anio: '',
    modelo: '',
    motor_tipo: '',
    cilindraje: '',
    kilometraje_actual: '',
    unidad_medida: 'km',
    aceite_tipo: '',
    filtro_aceite: '',
    anticongelante_tipo: '',
    bujias_tipo: '',
    llantas_medida: '',
    focos_tipo: '',
    rendimiento_gasolina: '',
    // Campos de costos (Monto y Periodo para el PHP)
<<<<<<< HEAD
    costo_seguro_monto: 0, costo_seguro_periodo: 'anual', costo_seguro_anual: 0,
    costo_deducible_seguro_monto: 0, costo_deducible_seguro_periodo: 'anual', costo_deducible_seguro_anual: 0,
    costo_gasolina_monto: 0, costo_gasolina_periodo: 'anual', costo_gasolina_anual: 0,
    costo_aceite_monto: 0, costo_aceite_periodo: 'anual', costo_aceite_anual: 0,
    costo_ecologico_monto: 0, costo_ecologico_periodo: 'anual', costo_ecologico_anual: 0,
    costo_placas_monto: 0, costo_placas_periodo: 'anual', costo_placas_anual: 0,
    costo_servicio_general_monto: 0, costo_servicio_general_periodo: 'anual', costo_servicio_general_anual: 0,
    costo_llantas_monto: 0, costo_llantas_periodo: 'anual', costo_llantas_anual: 0,
    costo_tuneup_monto: 0, costo_tuneup_periodo: 'anual', costo_tuneup_anual: 0,
    costo_frenos_monto: 0, costo_frenos_periodo: 'anual', costo_frenos_anual: 0,
    costo_lavado_monto: 0, costo_lavado_periodo: 'anual', costo_lavado_anual: 0,
=======
    costo_seguro_monto: 0, costo_seguro_periodo: 'anual',
    costo_deducible_seguro_monto: 0, costo_deducible_seguro_periodo: 'anual',
    costo_gasolina_monto: 0, costo_gasolina_periodo: 'anual',
    costo_aceite_monto: 0, costo_aceite_periodo: 'anual',
    costo_ecologico_monto: 0, costo_ecologico_periodo: 'anual',
    costo_placas_monto: 0, costo_placas_periodo: 'anual',
    costo_servicio_general_monto: 0, costo_servicio_general_periodo: 'anual',
    costo_llantas_monto: 0, costo_llantas_periodo: 'anual',
    costo_tuneup_monto: 0, costo_tuneup_periodo: 'anual',
    costo_lavado_monto: 0, costo_lavado_periodo: 'anual',
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
    // Checkboxes
    llanta_refaccion: 'NO', cables_corriente: 'NO', gato: 'NO', cruzeta: 'NO',
    // Fechas
    fecha_pago_seguro: '', fecha_pago_placas: '', fecha_pago_ecologico: '', fecha_proximo_mantenimiento: '',
    // Campos extra
    motor: '', tipo_aceite: '', filtro_aire: '', tipo_frenos: '', bujias: ''
  };

  const [formData, setFormData] = useState(initialState);
  const [activeTab, setActiveTab] = useState('especificaciones');
  const [docs, setDocs] = useState({ unit_files: [], placas: null, ecologico: null, circulacion: null });
  const [previews, setPreviews] = useState({ unit_photos: [] });
  const [status, setStatus] = useState({ loading: false, msg: "" });
  const [modalFeedback, setModalFeedback] = useState({ tipo: 'success', titulo: '', mensaje: '' });

  const closeBtnRef = useRef(null);

  // Limpieza de memoria
  useEffect(() => {
    return () => {
      Object.values(previews).forEach(p => {
        if (Array.isArray(p)) p.forEach(url => {
          if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
        });
        else if (p?.startsWith('blob:')) URL.revokeObjectURL(p);
      });
    };
  }, [previews]);

  const handleCameraCapture = (key) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setDocs(p => ({ ...p, [key]: file }));
        setPreviews(p => ({ ...p, [key]: URL.createObjectURL(file) }));
      }
    };
    input.click();
  };

  const handleMultipleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        setDocs(p => ({ ...p, unit_files: [...p.unit_files, ...files] }));
        const newPreviews = files.map(f => URL.createObjectURL(f));
        setPreviews(p => ({ ...p, unit_photos: [...p.unit_photos, ...newPreviews] }));
      }
    };
    input.click();
  };

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'numero_serie' ? value.toUpperCase().trim() : value
    }));
  };

  // Esta función ahora mapea correctamente los campos de CalcRow al formato Monto/Periodo
<<<<<<< HEAD
  // Calcular costo anual y actualizar estado
  const handleCostCalculation = (monto, periodo, campoAnual) => {
    const num = Math.max(0, parseFloat(monto) || 0);
    let anual = num;
    
    if (periodo === 'semanal') anual = num * 52;
    else if (periodo === 'mensual') anual = num * 12;
    else if (periodo === 'cuatrimestral') anual = num * 3;
    else if (periodo === 'semestral') anual = num * 2;
    
    const base = campoAnual.replace('_anual', '');
    setFormData(prev => ({
      ...prev,
      [campoAnual]: anual.toFixed(2), // Guardamos el valor calculado que espera el backend
=======
  const handleCostCalculation = (monto, periodo, campoAnual) => {
    const base = campoAnual.replace('_anual', '');
    setFormData(prev => ({
      ...prev,
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
      [`${base}_monto`]: monto,
      [`${base}_periodo`]: periodo
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.placas || !formData.numero_serie || !formData.unidad_nombre) {
      mostrarFeedback('error', 'Faltan Datos', 'Nombre, Placas y VIN son obligatorios.');
      return;
    }

    setStatus({ loading: true, msg: "Guardando..." });
    const dataToSend = new FormData();
    dataToSend.append('accion', 'registrar_vehiculo');

    // Procesar Datos
    Object.keys(formData).forEach(key => {
      if (key === 'kilometraje_actual') {
        const valorKM = parseFloat(formData[key]) || 0;
        const kmFinales = formData.unidad_medida === 'mi' ? valorKM * 1.60934 : valorKM;
        dataToSend.append(key, Math.round(kmFinales));
      } else {
        dataToSend.append(key, formData[key] ?? '');
      }
    });

    // Archivos
    if (docs.placas) dataToSend.append('foto_placas', docs.placas);
    if (docs.ecologico) dataToSend.append('foto_ecologico', docs.ecologico);
    if (docs.circulacion) dataToSend.append('foto_circulacion', docs.circulacion);

    docs.unit_files.forEach((file) => {
      dataToSend.append('unit_photos[]', file);
    });

    try {
      const response = await fetch(ANADIR_URL, {
        method: 'POST',
        body: dataToSend
      });

      const res = await response.json();

      if (res.status === 'success') {
        setFormData(initialState);
        setPreviews({ unit_photos: [] });
        setDocs({ unit_files: [], placas: null, ecologico: null, circulacion: null });
        setActiveTab('especificaciones');
        if (onUnidadAgregada) onUnidadAgregada();
        closeBtnRef.current?.click();
        mostrarFeedback('success', '¡Éxito!', 'Vehículo guardado correctamente.');
      } else {
        mostrarFeedback('error', 'Error', res.message || 'Error al guardar.');
      }
    } catch (error) {
      console.error("Submit Error:", error);
      mostrarFeedback('error', 'Conexión', 'No se pudo conectar con el servidor.');
    } finally {
      setStatus({ loading: false });
    }
  };

  const mostrarFeedback = (tipo, titulo, mensaje) => {
    setModalFeedback({ tipo, titulo, mensaje });
    const modalElement = document.getElementById('modalFeedbackStatus');
    if (modalElement) {
      const inst = bootstrap.Modal.getOrCreateInstance(modalElement);
      inst.show();
    }
  };

  return (
    <>
      <div className="modal fade" id="modalAgregar" tabIndex="-1" data-bs-backdrop="static">
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-lg rounded-4">

            <div className="modal-header bg-primary text-white py-3 border-0">
              <div className="d-flex align-items-center">
                <Plus size={24} className="me-3" />
                <div>
                  <h5 className="modal-title fw-bold mb-0">ALTA DE VEHÍCULO</h5>
                  <small className="opacity-75">Configuración de nueva unidad</small>
                </div>
              </div>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" ref={closeBtnRef}></button>
            </div>

            <div className="bg-white px-4 pt-3 border-bottom">
              <ul className="nav nav-pills nav-fill mb-2">
                {[
                  { id: 'especificaciones', label: '1. Especificaciones', icon: Car },
                  { id: 'fotos', label: '2. Fotos y Docs', icon: Camera },
                  { id: 'gastos', label: '3. Gastos Fijos', icon: Calculator },
                  { id: 'vencimientos', label: '4. Vencimientos', icon: CalendarDays }
                ].map(tab => (
                  <li className="nav-item" key={tab.id}>
                    <button
                      className={`nav-link border-0 ${activeTab === tab.id ? 'active fw-bold' : 'text-muted'}`}
                      onClick={() => setActiveTab(tab.id)}
                      type="button"
                    >
                      <tab.icon size={18} className="me-2" /> {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="bg-light">
              <div className="modal-body p-4" style={{ minHeight: '450px', maxHeight: '60vh', overflowY: 'auto' }}>
                {activeTab === 'especificaciones' && <FormEspecificaciones formData={formData} updateField={updateField} />}

                {activeTab === 'fotos' && (
                  <DocumentUpload
                    previews={previews}
                    onFileChange={(e, key) => {
                      const file = e.target.files[0];
                      if (file) {
                        setDocs(p => ({ ...p, [key]: file }));
                        setPreviews(p => ({ ...p, [key]: URL.createObjectURL(file) }));
                      }
                    }}
                    onMultipleChange={(e) => {
                      const files = Array.from(e.target.files);
                      setDocs(p => ({ ...p, unit_files: [...p.unit_files, ...files] }));
                      const newPreviews = files.map(f => URL.createObjectURL(f));
                      setPreviews(p => ({ ...p, unit_photos: [...p.unit_photos, ...newPreviews] }));
                    }}
                    onCameraCapture={handleCameraCapture}
                    onMultipleCameraCapture={handleMultipleCameraCapture}
                    onRemoveDoc={(key) => {
                      setDocs(p => ({ ...p, [key]: null }));
                      setPreviews(p => ({ ...p, [key]: null }));
                    }}
                    onRemovePhoto={(index) => {
                      setDocs(p => ({ ...p, unit_files: p.unit_files.filter((_, i) => i !== index) }));
                      setPreviews(p => ({ ...p, unit_photos: p.unit_photos.filter((_, i) => i !== index) }));
                    }}
                  />
                )}

                {activeTab === 'gastos' && (
                  <div className="card border-0 shadow-sm rounded-4 mb-4">
                    <div className="card-header bg-white py-3 border-0">
                      <h6 className="fw-bold mb-0 text-primary d-flex align-items-center">
                        <Calculator size={18} className="me-2" /> CÁLCULO DE COSTOS ANUALES
                      </h6>
                    </div>
                    <div className="card-body bg-white rounded-bottom-4">
                      <div className="row g-3">
                        <CalcRow icon={ShieldCheck} label="Seguro" field="costo_seguro_anual" onCalculate={handleCostCalculation} />
                        <CalcRow icon={ShieldCheck} label="Deducible" field="costo_deducible_seguro_anual" onCalculate={handleCostCalculation} />
                        <CalcRow icon={Fuel} label="Gasolina" field="costo_gasolina_anual" onCalculate={handleCostCalculation} />
                        <CalcRow icon={Waves} label="Aceite" field="costo_aceite_anual" onCalculate={handleCostCalculation} />
                        <CalcRow icon={Leaf} label="Ecológica" field="costo_ecologico_anual" onCalculate={handleCostCalculation} />
                        <CalcRow icon={CreditCard} label="Placas" field="costo_placas_anual" onCalculate={handleCostCalculation} />
                        <CalcRow icon={FileText} label="Servicio General" field="costo_servicio_general_anual" onCalculate={handleCostCalculation} />
                        <CalcRow icon={Disc} label="Llantas" field="costo_llantas_anual" onCalculate={handleCostCalculation} />
<<<<<<< HEAD
                        <CalcRow icon={Zap} label="Servicio Frenos" field="costo_frenos_anual" onCalculate={handleCostCalculation} />
                        <CalcRow icon={Zap} label="Tune Up / Afinación" field="costo_tuneup_anual" onCalculate={handleCostCalculation} />
=======
                        <CalcRow icon={Zap} label="Servicio Frenos" field="costo_tuneup_anual" onCalculate={handleCostCalculation} />
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
                        <CalcRow icon={Droplets} label="Limpieza" field="costo_lavado_anual" onCalculate={handleCostCalculation} />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'vencimientos' && <FormVencimientos formData={formData} updateField={updateField} />}
              </div>

              <div className="modal-footer bg-white border-top-0 p-4 sticky-bottom">
                <div className="d-flex gap-2 w-100">
                  {activeTab !== 'especificaciones' && (
                    <button type="button" className="btn btn-outline-secondary px-4" onClick={() => {
                      const tabs = ['especificaciones', 'fotos', 'gastos', 'vencimientos'];
                      setActiveTab(tabs[tabs.indexOf(activeTab) - 1]);
                    }}>Anterior</button>
                  )}

                  {activeTab !== 'vencimientos' ? (
                    <button type="button" className="btn btn-primary px-4 ms-auto" onClick={() => {
                      const tabs = ['especificaciones', 'fotos', 'gastos', 'vencimientos'];
                      const currentIndex = tabs.indexOf(activeTab);
                      const nextIndex = currentIndex + 1;
                      console.log('Current tab:', activeTab, 'Index:', currentIndex, 'Next index:', nextIndex, 'Next tab:', tabs[nextIndex]);
                      setActiveTab(tabs[nextIndex]);
                    }}>Siguiente</button>
                  ) : (
                    <button type="button" className="btn btn-success px-5 ms-auto fw-bold" disabled={status.loading} onClick={(e) => {
                      e.preventDefault();
                      console.log('Submit button clicked manually');
                      handleSubmit(e);
                    }}>
                      {status.loading ? 'GUARDANDO...' : 'FINALIZAR Y GUARDAR'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="modal fade" id="modalFeedbackStatus" tabIndex="-1">
        <div className="modal-dialog modal-sm modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <ModalEstado {...modalFeedback} />
          </div>
        </div>
      </div>
    </>
  );
}