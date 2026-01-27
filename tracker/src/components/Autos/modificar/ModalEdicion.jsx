import React, { useState, useRef, useEffect, useCallback } from 'react';
import { formatNumberWithCommas } from '../../formatters';
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import {
  Settings, Calculator, FileText, CreditCard, Leaf,
  CalendarDays, Zap, Disc, Droplets, ShieldCheck, Fuel, Waves, Car, Camera
} from 'lucide-react';

import { FormEspecificacionesEditar } from './FormEspecificacionesEditar';
import { FormVencimientosEditar } from './FormVencimientosEditar';
import { DocumentUploadEditar } from './DocumentUploadEditar';
import { CalcRowEditar } from './CalcRowEditar';
import ModalEstado from '../estatus/ModalEstado';

import { VEHICULOS_UPLOADS_URL } from '../../../config.js';

const BASE_URL = VEHICULOS_UPLOADS_URL;

export default function ModalEdicion({ editData, setEditData, guardarCambios }) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('especificaciones');
  const [previews, setPreviews] = useState({ unit_photos: [] });
  const [docs, setDocs] = useState({ unit_files: [] });

  const [fotosExistentes, setFotosExistentes] = useState([]);
  const [fotosEliminar, setFotosEliminar] = useState([]);

  const [statusModal, setStatusModal] = useState({ type: 'success', title: '', message: '' });
  const closeBtnRef = useRef(null);
  const urlsToRevoke = useRef(new Set());

  const revokeAllUrls = useCallback(() => {
    urlsToRevoke.current.forEach(url => URL.revokeObjectURL(url));
    urlsToRevoke.current.clear();
  }, []);

  const updateField = useCallback((field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: field === 'numero_serie' ? value?.toUpperCase() : value
    }));
  }, [setEditData]);

  const handleCostCalculation = (valor, periodo, campoBase) => {
    const num = Math.max(0, parseFloat(valor) || 0);
    let anual = num;
    if (periodo === 'semanal') anual = num * 52;
    else if (periodo === 'mensual') anual = num * 12;
    else if (periodo === 'cuatrimestral') anual = num * 3;
    else if (periodo === 'semestral') anual = num * 2;

    // Actualizar los tres campos: monto original, período y valor anual
    updateField(campoBase, anual.toFixed(2));
    updateField(campoBase.replace('_anual', '_monto'), valor);
    updateField(campoBase.replace('_anual', '_periodo'), periodo);
  };

  useEffect(() => {
    if (editData) {
      // Solo procesar si hay datos (tanto para edición como para nuevo auto)
      let initialPhotos = [];
      try {
        if (editData.fotos_json) {
          if (typeof editData.fotos_json === 'string') {
            const trimmed = editData.fotos_json.trim();
            if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
              try {
                initialPhotos = JSON.parse(trimmed);
              } catch (e) {
                console.warn("JSON malformado en ModalEdicion, tratando como string simple:", trimmed);
                initialPhotos = [trimmed];
              }
            } else if (trimmed.length > 0) {
              initialPhotos = [trimmed];
            }
          } else {
            initialPhotos = editData.fotos_json;
          }
        }
      } catch (e) { console.error("Error procesando fotos_json:", e); }

      // Para nuevo auto, no limpiar los datos existentes
      if (editData.id) {
        // Solo limpiar si es edición (tiene ID)
        setFotosExistentes(initialPhotos);
        setFotosEliminar([]);
        setDocs({ unit_files: [] });
        revokeAllUrls();

        setPreviews({
          placas: editData.foto_placas ? `${BASE_URL}${editData.foto_placas}` : null,
          ecologico: editData.foto_ecologico ? `${BASE_URL}${editData.foto_ecologico}` : null,
          circulacion: editData.foto_circulacion ? `${BASE_URL}${editData.foto_circulacion}` : null,
          unit_photos: initialPhotos.map(foto => `${BASE_URL}${foto}`)
        });
<<<<<<< HEAD

        // Sincronización inicial de costos (solo al cargar)
        const camposCosto = [
          'costo_seguro_anual', 'costo_deducible_seguro_anual', 'costo_gasolina_anual',
          'costo_aceite_anual', 'costo_ecologico_anual', 'costo_placas_anual',
          'costo_servicio_general_anual', 'costo_llantas_anual', 'costo_tuneup_anual', 
          'costo_frenos_anual', 'costo_lavado_anual'
        ];

        let updates = {};
        let hasUpdates = false;

        camposCosto.forEach(campoAnual => {
          const campoMonto = campoAnual.replace('_anual', '_monto');
          const campoPeriodo = campoAnual.replace('_anual', '_periodo');
          
          const monto = parseFloat(editData[campoMonto]) || 0;
          const periodo = editData[campoPeriodo] || 'anual';

          let anualCalculado = monto;
          if (periodo === 'semanal') anualCalculado = monto * 52;
          else if (periodo === 'mensual') anualCalculado = monto * 12;
          else if (periodo === 'cuatrimestral') anualCalculado = monto * 3;
          else if (periodo === 'semestral') anualCalculado = monto * 2;

          // Verificar discrepancia significativa (evitar floats epsilon)
          const actual = parseFloat(editData[campoAnual]) || 0;
          if (Math.abs(actual - anualCalculado) > 0.01) {
             updates[campoAnual] = anualCalculado.toFixed(2);
             hasUpdates = true;
          }
        });

        if (hasUpdates) {
           setEditData(prev => ({ ...prev, ...updates }));
        }

=======
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
      }
      // Para nuevo auto sin ID, mantener los datos actuales sin limpiar
    } else {
      // Limpiar estados solo cuando el modal se cierra completamente
      setFotosExistentes([]);
      setFotosEliminar([]);
      setDocs({ unit_files: [] });
      setPreviews({ placas: null, ecologico: null, circulacion: null, unit_photos: [] });
      revokeAllUrls();
    }
    return () => revokeAllUrls();
<<<<<<< HEAD
  }, [editData?.id, revokeAllUrls]); // Eliminado editData de deps para evitar loop, solo ID
=======
  }, [editData?.id, editData, revokeAllUrls]); // Re-ejecutar cuando los datos cambien

  useEffect(() => {
    if (!editData) return;

    // Campos de costo que necesitan sincronización
    const camposCosto = [
      'costo_seguro_anual', 'costo_deducible_seguro_anual', 'costo_gasolina_anual',
      'costo_aceite_anual', 'costo_ecologico_anual', 'costo_placas_anual',
      'costo_servicio_general_anual', 'costo_llantas_anual', 'costo_tuneup_anual', 'costo_lavado_anual'
    ];

    const calcularCostoAnual = (campoAnual, campoMonto, campoPeriodo) => {
      const monto = parseFloat(editData[campoMonto]) || 0;
      const periodo = editData[campoPeriodo] || 'anual';

      let anualCalculado = monto;
      if (periodo === 'semanal') anualCalculado = monto * 52;
      else if (periodo === 'mensual') anualCalculado = monto * 12;
      else if (periodo === 'cuatrimestral') anualCalculado = monto * 3;
      else if (periodo === 'semestral') anualCalculado = monto * 2;

      // Si el valor anual en editData es diferente al calculado, actualizarlo
      if (parseFloat(editData[campoAnual]) !== anualCalculado) {
        updateField(campoAnual, anualCalculado.toFixed(2));
      }
    };

    camposCosto.forEach(campoAnual => {
      const campoMonto = campoAnual.replace('_anual', '_monto');
      const campoPeriodo = campoAnual.replace('_anual', '_periodo');

      calcularCostoAnual(campoAnual, campoMonto, campoPeriodo);
    });
  }, [editData, updateField]);
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)

  if (!editData) return null;

  const handleFileChange = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      urlsToRevoke.current.add(url);
      setDocs(prev => ({ ...prev, [key]: file }));
      setPreviews(prev => ({ ...prev, [key]: url }));
    }
  };

  const handleCameraCapture = (key) => {
    // Crear input temporal para captura de cámara
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Forzar cámara trasera
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        urlsToRevoke.current.add(url);
        setDocs(prev => ({ ...prev, [key]: file }));
        setPreviews(prev => ({ ...prev, [key]: url }));
      }
    };
    input.click();
  };

  const handleMultipleCameraCapture = () => {
    // Crear input temporal para captura múltiple con cámara
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        setDocs(prev => ({ ...prev, unit_files: [...(prev.unit_files || []), ...files] }));
        const newPreviews = files.map(file => {
          const url = URL.createObjectURL(file);
          urlsToRevoke.current.add(url);
          return url;
        });
        setPreviews(prev => ({ ...prev, unit_photos: [...prev.unit_photos, ...newPreviews] }));
      }
    };
    input.click();
  };

  const handleMultipleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setDocs(prev => ({ ...prev, unit_files: [...(prev.unit_files || []), ...files] }));
    const newPreviews = files.map(file => {
      const url = URL.createObjectURL(file);
      urlsToRevoke.current.add(url);
      return url;
    });
    setPreviews(prev => ({ ...prev, unit_photos: [...prev.unit_photos, ...newPreviews] }));
  };

  const handleRemovePhoto = (index) => {
    const totalExistentes = fotosExistentes.length;
    const urlToRemove = previews.unit_photos[index];

    if (urlToRemove?.startsWith('blob:')) {
      URL.revokeObjectURL(urlToRemove);
      urlsToRevoke.current.delete(urlToRemove);
    }

    if (index < totalExistentes) {
      const fotoABorrar = fotosExistentes[index];
      setFotosEliminar(prev => [...prev, fotoABorrar]);
      setFotosExistentes(prev => prev.filter((_, i) => i !== index));
    } else {
      const indexArchivoNuevo = index - totalExistentes;
      setDocs(prev => ({
        ...prev,
        unit_files: prev.unit_files.filter((_, i) => i !== indexArchivoNuevo)
      }));
    }

    setPreviews(prev => ({
      ...prev,
      unit_photos: prev.unit_photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataObj = new FormData();

      // 1. Añadir todos los campos de texto/numéricos
      Object.keys(editData).forEach(key => {
        // Ignorar campos de archivos e internos
        if (!['fotos_json', 'foto_placas', 'foto_ecologico', 'foto_circulacion', 'unit_photos'].includes(key)) {
          let valor = editData[key];

          // Normalización de checks de seguridad
          if (['llanta_refaccion', 'cables_corriente', 'gato', 'cruzeta'].includes(key)) {
            valor = (valor === 1 || valor === "1" || valor === true || valor === "SÍ") ? "SÍ" : "NO";
          }
          formDataObj.append(key, valor ?? "");
        }
      });

      // 2. Manejo de fotos existentes y eliminadas
      formDataObj.append('fotos_restantes', JSON.stringify(fotosExistentes));
      formDataObj.append('fotos_eliminar', JSON.stringify(fotosEliminar));

<<<<<<< HEAD
      // 3. Documentos individuales (Subida y Eliminación)
      // Placas
      if (docs.placas) {
        formDataObj.append('foto_placas', docs.placas);
      } else if (!previews.placas && editData.foto_placas) {
        formDataObj.append('eliminar_foto_placas', 'true');
      }

      // Ecológico
      if (docs.ecologico) {
        formDataObj.append('foto_ecologico', docs.ecologico);
      } else if (!previews.ecologico && editData.foto_ecologico) {
        formDataObj.append('eliminar_foto_ecologico', 'true');
      }

      // Circulación
      if (docs.circulacion) {
        formDataObj.append('foto_circulacion', docs.circulacion);
      } else if (!previews.circulacion && editData.foto_circulacion) {
        formDataObj.append('eliminar_foto_circulacion', 'true');
      }
=======
      // 3. Documentos individuales
      if (docs.placas) formDataObj.append('foto_placas', docs.placas);
      if (docs.ecologico) formDataObj.append('foto_ecologico', docs.ecologico);
      if (docs.circulacion) formDataObj.append('foto_circulacion', docs.circulacion);
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)

      // 4. Fotos nuevas del carrusel
      if (docs.unit_files && docs.unit_files.length > 0) {
        docs.unit_files.forEach(file => formDataObj.append('unit_photos[]', file));
      }

      formDataObj.set('accion', 'editar_vehiculo');
      formDataObj.set('id', editData.id);

<<<<<<< HEAD
      const resultado = await guardarCambios(formDataObj);

      if (resultado.success) {
=======
      const exito = await guardarCambios(formDataObj);

      if (exito) {
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
        // Cerrar modal de edición
        const modalEl = document.getElementById('modalEdicion');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        modalInstance?.hide();

        setStatusModal({
          type: 'success',
          title: '¡Sincronizado!',
<<<<<<< HEAD
          message: resultado.message || 'Los cambios se guardaron correctamente en el sistema.'
        });
      } else {
        throw new Error(resultado.message || "La API devolvió un estado de error");
=======
          message: 'Los cambios se guardaron correctamente en el sistema.'
        });
      } else {
        throw new Error("La API devolvió un estado de error");
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
      }

    } catch (error) {
      console.error("Error al guardar:", error);
      setStatusModal({
        type: 'error',
        title: 'Fallo al Guardar',
<<<<<<< HEAD
        message: error.message || 'No pudimos conectar con el servidor para actualizar los datos.'
=======
        message: 'No pudimos conectar con el servidor para actualizar los datos.'
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
      });
    } finally {
      setLoading(false);
      // Mostrar el modal de estado (éxito o error)
      const statusModalEl = document.getElementById('modalEstadoStatus');
      if (statusModalEl) {
        const statusModalInst = new bootstrap.Modal(statusModalEl);
        statusModalInst.show();
      }
    }
  };

  return (
    <>
      <ModalEstado
        id="modalEstadoStatus"
        tipo={statusModal.type}
        titulo={statusModal.title}
        mensaje={statusModal.message}
      />

      <div className="modal fade modal-edicion" id="modalEdicion" tabIndex="-1" data-bs-backdrop="static">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="modal-header bg-dark text-white py-3">
              <div className="d-flex align-items-center">
                <div className="bg-warning p-2 rounded-3 me-3 text-dark">
                  <Settings size={22} />
                </div>
                <div>
                  <h5 className="modal-title fw-bold mb-0">CONFIGURACIÓN DE UNIDAD</h5>
                  <span className="badge bg-secondary opacity-75 small">{editData.unidad_nombre}</span>
                </div>
              </div>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" ref={closeBtnRef} style={{ filter: 'brightness(0) invert(1)', opacity: '0.8' }}></button>
            </div>

            <div className="bg-white px-4 pt-3 border-bottom">
              <ul className="nav nav-tabs border-0 gap-2">
                {[
                  { id: 'especificaciones', label: 'Ficha Técnica', icon: Car },
                  { id: 'gastos', label: 'Presupuesto Anual', icon: Calculator },
                  { id: 'vencimientos', label: 'Fechas de Vencimiento', icon: CalendarDays },
                  { id: 'fotos', label: 'Fotos', icon: Camera }
                ].map(tab => (
                  <li className="nav-item" key={tab.id}>
                    <button
                      type="button"
                      className={`nav-link border-0 rounded-top-3 px-4 py-2 fw-bold transition-all ${activeTab === tab.id ? 'active bg-light text-primary border-bottom border-primary border-3' : 'text-muted'}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <tab.icon size={16} className="me-2" /> {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body bg-light p-4" style={{ minHeight: '500px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div className="tab-content">
                  {activeTab === 'especificaciones' && (
                    <div className="bg-white p-4 rounded-4 shadow-sm border">
                      <FormEspecificacionesEditar formData={editData} updateField={updateField} />
                    </div>
                  )}

                  {activeTab === 'gastos' && (
                    <div className="bg-white p-4 rounded-4 shadow-sm border">
                      <div className="row g-3">
                        {[
                          { icon: ShieldCheck, label: "Seguro", field: "costo_seguro_anual" },
                          { icon: ShieldCheck, label: "Deducible de Seguro", field: "costo_deducible_seguro_anual" },
                          { icon: Fuel, label: "Gasolina", field: "costo_gasolina_anual" },
                          { icon: Waves, label: "Aceite", field: "costo_aceite_anual" },
                          { icon: Leaf, label: "Ecológica", field: "costo_ecologico_anual" },
                          { icon: CreditCard, label: "Placas", field: "costo_placas_anual" },
                          { icon: FileText, label: "Servicio General", field: "costo_servicio_general_anual" },
                          { icon: Disc, label: "Llantas", field: "costo_llantas_anual" },
<<<<<<< HEAD
                          { icon: Zap, label: "Servicio Frenos", field: "costo_frenos_anual" },
                          { icon: Zap, label: "Tune Up / Afinación", field: "costo_tuneup_anual" },
=======
                          { icon: Zap, label: "Servicio Frenos", field: "costo_tuneup_anual" },
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
                          { icon: Droplets, label: "Limpieza", field: "costo_lavado_anual" }
                        ].map(item => (
                          <CalcRowEditar
                            key={`${editData?.id || 'new'}-${item.field}`}
                            icon={item.icon}
                            label={item.label}
                            field={item.field}
                            value={editData[item.field] ? formatNumberWithCommas(editData[item.field].toString()) : ''}
                            onCalculate={handleCostCalculation}
                            editData={editData}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'vencimientos' && (
                    <div className="bg-white p-4 rounded-4 shadow-sm border">
                      <FormVencimientosEditar formData={editData} updateField={updateField} />
                    </div>
                  )}

                  {activeTab === 'fotos' && (
                    <div className="bg-white p-4 rounded-4 shadow-sm border">
                      <DocumentUploadEditar
                        previews={previews}
                        onFileChange={handleFileChange}
                        onMultipleChange={handleMultipleFilesChange}
                        onCameraCapture={handleCameraCapture}
                        onMultipleCameraCapture={handleMultipleCameraCapture}
                        onRemoveDoc={(key) => {
                          setDocs(prev => ({ ...prev, [key]: null }));
                          setPreviews(prev => ({ ...prev, [key]: null }));
                        }}
                        onRemovePhoto={handleRemovePhoto}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <div className="d-flex gap-3">
                  <button type="button" className="btn btn-light px-4 rounded-pill border" data-bs-dismiss="modal">DESCARTAR</button>
                  <button type="submit" className="btn btn-warning px-5 rounded-pill fw-bolder shadow-sm" disabled={loading}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>PROCESANDO...</>
                    ) : 'GUARDAR CAMBIOS'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}