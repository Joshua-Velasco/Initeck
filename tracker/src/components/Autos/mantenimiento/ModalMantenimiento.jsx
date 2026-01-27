import React, { useState, useRef, useEffect } from 'react';
import { X, Save, DollarSign, Gauge, PenTool, Camera, Trash2, Plus, User, Calendar, Car, CheckCircle, Settings, FileText, Wrench } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { handleDecimalInput } from '../../formatters';
import { MANTENIMIENTO_URL } from '../../../config.js';

// Importar estilos CSS
import '../estilos/EstiloMantenimiento.css';

<<<<<<< HEAD
export default function ModalMantenimiento({ user, isOpen, onClose, unidad, onSave, registros = [] }) {
=======
export default function ModalMantenimiento({ user, isOpen, onClose, unidad, onSave }) {
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
  const [loading, setLoading] = useState(false);
  const sigCanvasDesktop = useRef(null);
  const sigCanvasMobile = useRef(null);

  // Prevenir scroll en el body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Limpiar al desmontar
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const [fotoEvidencia, setFotoEvidencia] = useState(null); // Una sola foto de evidencia
<<<<<<< HEAD
  
  const [presupuestoInfo, setPresupuestoInfo] = useState({ anual: 0, gastado: 0, disponible: 0 });

  // Mapeo inverso para mostrar etiquetas bonitas en dropdown
  const CATEGORIAS_PRESUPUESTO = [
     { label: "Sin Afectación Presupuestal", field: null },
     { label: "Servicio General", field: 'costo_servicio_general_anual' },
     { label: "Cambio de Aceite", field: 'costo_aceite_anual' },
     { label: "Tune Up", field: 'costo_tuneup_anual' },
     { label: "Lavado", field: 'costo_lavado_anual' },
     { label: "Llantas", field: 'costo_llantas_anual' },
     { label: "Frenos", field: 'costo_frenos_anual' },
  ];
=======
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)

  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    tipo: 'Servicio General',
    tipo_otro: '',
    descripcion: '',
    costo_total: '',
    presupuesto: '',
    kilometraje_al_momento: '',
<<<<<<< HEAD
    responsable: user?.nombre || '',
    estado: 'Completado',
    fecha: getTodayDate(),
    categoria_presupuesto: 'costo_servicio_general_anual' // Default
  });

  // Estado para desglose de items
  const [items, setItems] = useState([]);

  // Si no hay items, costo_total es editable (o 0). Si hay items, es la suma.
  useEffect(() => {
    if (items.length > 0) {
        const total = items.reduce((sum, item) => sum + (cleanFloat(item.costo) || 0), 0);
        setFormData(prev => ({ ...prev, costo_total: total }));
    }
  }, [items]);

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now(), concepto: '', costo: '' }]);
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(item => {
        if (item.id === id) {
            return { ...item, [field]: field === 'costo' ? handleDecimalInput(value) : value };
        }
        return item;
    }));
  };

=======
    responsable: user?.nombre || '', // Pre-llenar con el usuario logeado
    estado: 'Completado', // Estado del mantenimiento
    fecha: getTodayDate()
  });

>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
  const tiposMantenimiento = [
    "Servicio General", "Cambio de Aceite", "Sistema Anticongelante",
    "Revisión de Llantas", "Frenos", "Suspensión", "Transmisión",
    "Sistema Eléctrico", "Batería", "Alineación y Balanceo", "Carrocería", "Otro"
  ];
<<<<<<< HEAD
  
  // Auto-seleccionar categoría al cambiar tipo
  useEffect(() => {
     if (!isOpen) return;
     let suggestedField = 'costo_servicio_general_anual';
     
     const map = {
        "Cambio de Aceite": 'costo_aceite_anual',
        "Revisión de Llantas": 'costo_llantas_anual',
        "Alineación y Balanceo": 'costo_llantas_anual',
        "Frenos": 'costo_frenos_anual',
        "TuneUp": 'costo_tuneup_anual', // Check typo vs array
        "Servicio General": 'costo_servicio_general_anual'
     };
     
     if (map[formData.tipo]) {
         suggestedField = map[formData.tipo];
     }
     
     // Update form data only if category hasn't been manually set differently (optional logic, but for now simple sync)
     setFormData(prev => ({ ...prev, categoria_presupuesto: suggestedField }));
  }, [formData.tipo, isOpen]);
=======
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)

  const estadosMantenimiento = ['Completado', 'Pendiente', 'En Progreso', 'Cancelado'];

  useEffect(() => {
    if (isOpen && unidad) {
      setFormData({
        tipo: 'Servicio General',
        tipo_otro: '',
        descripcion: '',
        costo_total: '',
<<<<<<< HEAD
        presupuesto: '', 
        kilometraje_al_momento: unidad.kilometraje_actual || '',
        responsable: String(user?.nombre || ''),
        estado: 'Completado',
        fecha: getTodayDate(),
        categoria_presupuesto: 'costo_servicio_general_anual'
      });
      setFotoEvidencia(null);
      setItems([]); // Reiniciar items
=======
        presupuesto: '', // Reset presupuesto field
        kilometraje_al_momento: unidad.kilometraje_actual || '',
        responsable: String(user?.nombre || ''),
        estado: 'Completado',
        fecha: getTodayDate()
      });
      setFotoEvidencia(null);
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
      if (sigCanvasDesktop.current) sigCanvasDesktop.current.clear();
      if (sigCanvasMobile.current) sigCanvasMobile.current.clear();
    }
  }, [isOpen, unidad]);

<<<<<<< HEAD
  // Helper para limpiar números
  const cleanFloat = (val) => {
    if (val === undefined || val === null || val === '') return 0;
    return parseFloat(String(val).replace(/,/g, '')) || 0;
  };

  // Calcular presupuesto basado en la CATEGORÍA SELECCIONADA
  useEffect(() => {
    if (!unidad || !isOpen) return;
    
    // DEBUG: Inspect budget data - ENHANCED
    console.log('🔍 DEBUG Budget Calculation:', {
        categoria_seleccionada: formData.categoria_presupuesto,
        valor_campo_bd: unidad[formData.categoria_presupuesto],
        tipo_valor: typeof unidad[formData.categoria_presupuesto],
        unidad_id: unidad?.id,
        unidad_nombre: unidad?.unidad_nombre,
        todos_campos_presupuesto: {
            costo_aceite_anual: unidad?.costo_aceite_anual,
            costo_frenos_anual: unidad?.costo_frenos_anual,
            costo_llantas_anual: unidad?.costo_llantas_anual,
            costo_servicio_general_anual: unidad?.costo_servicio_general_anual,
            costo_tuneup_anual: unidad?.costo_tuneup_anual,
            costo_lavado_anual: unidad?.costo_lavado_anual
        },
        presupuesto_anual_calculado: cleanFloat(unidad[formData.categoria_presupuesto]),
        costo_actual_formulario: cleanFloat(formData.costo_total),
        registros_historicos_count: registros?.length || 0
    });

    // Si no hay categoría seleccionada o es "Sin Afectación Presupuestal"
    if (!formData.categoria_presupuesto) {
        setPresupuestoInfo({ anual: 0, gastado: 0, disponible: 0, restante: 0 });
        return;
    }

    // Obtener el presupuesto anual asignado directamente del vehículo
    const campoPresupuesto = formData.categoria_presupuesto;
    const presupuestoAnual = cleanFloat(unidad[campoPresupuesto]);
    const currentYear = new Date().getFullYear();
    
    // Calcular gastado del año actual filtrando por categoria_presupuesto
    const gastadoEsteAño = registros
      .filter(r => 
        String(r.unidad_id) === String(unidad.id) &&
        r.categoria_presupuesto === campoPresupuesto &&
        new Date(r.fecha).getFullYear() === currentYear
      )
      .reduce((sum, r) => sum + cleanFloat(r.costo_total), 0);
    
    const costoActual = cleanFloat(formData.costo_total);
    
    // Presupuesto restante = Anual - Gastado este año - Costo actual
    const presupuestoRestante = presupuestoAnual - gastadoEsteAño - costoActual;
    
    console.log('💰 Budget Breakdown:', {
      presupuestoAnual,
      gastadoEsteAño,
      costoActual,
      presupuestoRestante,
      registrosFiltrados: registros.filter(r => 
        String(r.unidad_id) === String(unidad.id) &&
        r.categoria_presupuesto === campoPresupuesto &&
        new Date(r.fecha).getFullYear() === currentYear
      ).length
    });
    
    setPresupuestoInfo({
      anual: presupuestoAnual,
      gastado: gastadoEsteAño,
      disponible: presupuestoAnual - gastadoEsteAño,
      restante: presupuestoRestante
    });
    
  }, [formData.categoria_presupuesto, formData.costo_total, unidad, isOpen, registros]); 

=======
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoEvidencia({
        file,
        preview: URL.createObjectURL(file)
      });
    }
  };

  const removeFoto = () => {
    if (fotoEvidencia?.preview) {
      URL.revokeObjectURL(fotoEvidencia.preview);
    }
    setFotoEvidencia(null);
  };

  // Manejadores para inputs numéricos con formato
  const handleNumericChange = (field, e) => {
    const value = e.target.value;
    const formattedValue = handleDecimalInput(value);
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  // Función para limpiar valores formateados antes de enviar
  const cleanFormData = (data) => {
    return {
      ...data,
      costo_total: (typeof data.costo_total === 'string' ? data.costo_total.replace(/,/g, '') : data.costo_total) || 0,
      presupuesto: (typeof data.presupuesto === 'string' ? data.presupuesto.replace(/,/g, '') : data.presupuesto) || 0,
      kilometraje_al_momento: (typeof data.kilometraje_al_momento === 'string' ? data.kilometraje_al_momento.replace(/,/g, '') : data.kilometraje_al_momento) || 0
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isDesktopEmpty = sigCanvasDesktop.current?.isEmpty();
    const isMobileEmpty = sigCanvasMobile.current?.isEmpty();

    if (isDesktopEmpty && isMobileEmpty) {
      return alert("Se requiere la firma del empleado para validar el mantenimiento.");
    }

    setLoading(true);
    const data = new FormData();
    data.append('unidad_id', unidad.id);

    const tipoFinal = formData.tipo === 'Otro' ? formData.tipo_otro : formData.tipo;
    data.append('tipo', tipoFinal);
<<<<<<< HEAD
    
    // Si hay items, agregarlos al final de la descripción
    let descripcionFinal = formData.descripcion;
    if (items.length > 0) {
        const detalleItems = items
            .filter(i => i.concepto.trim() !== '')
            .map(i => `- ${i.concepto}: $${i.costo}`)
            .join('\n');
        
        if (detalleItems) {
            descripcionFinal += `\n\nDesglose de Costos:\n${detalleItems}`;
        }
    }
    data.append('descripcion', descripcionFinal);
=======
    data.append('descripcion', formData.descripcion);
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)

    // Limpiar datos numéricos formateados antes de enviar
    const cleanData = cleanFormData(formData);
    data.append('costo_total', cleanData.costo_total);
<<<<<<< HEAD
    // Presupuesto restante después de esta compra
    data.append('presupuesto', String(presupuestoInfo.restante || 0)); 
    data.append('kilometraje_al_momento', cleanData.kilometraje_al_momento);
    // Categoría presupuestal para tracking
    data.append('categoria_presupuesto', formData.categoria_presupuesto || '');
=======
    data.append('presupuesto', cleanData.presupuesto);
    data.append('kilometraje_al_momento', cleanData.kilometraje_al_momento);

>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
    data.append('responsable', formData.responsable);
    data.append('estado', formData.estado);
    data.append('fecha', formData.fecha);

    // Una sola foto de evidencia
    if (fotoEvidencia?.file) {
<<<<<<< HEAD
      console.log('📸 Foto evidencia:', {
        name: fotoEvidencia.file.name,
        size: fotoEvidencia.file.size,
        type: fotoEvidencia.file.type
      });
      data.append('evidencia_foto', fotoEvidencia.file);
    } else {
      console.log('⚠️ No hay foto de evidencia');
=======
      data.append('evidencia_foto', fotoEvidencia.file);
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
    }

    // Firma como archivo
    const firmaFile = await signatureToFile();
    if (firmaFile) {
<<<<<<< HEAD
      console.log('✍️ Firma empleado:', {
        name: firmaFile.name,
        size: firmaFile.size,
        type: firmaFile.type
      });
      data.append('firma_empleado', firmaFile);
    } else {
      console.log('⚠️ No hay firma (canvas vacío o error)');
=======
      data.append('firma_empleado', firmaFile);
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
    }

    try {
      const response = await fetch(MANTENIMIENTO_URL, {
        method: 'POST',
        body: data
      });

      const text = await response.text();
      if (!text.trim()) {
        throw new Error("Respuesta vacía del servidor");
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch {
        console.error("Respuesta no JSON:", text);
        throw new Error("El servidor devolvió una respuesta inválida");
      }

      if (result.status === "success") {
        onSave();
        onClose();
      } else {
        alert("Error: " + (result.message || "Error al guardar"));
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      alert("Error de conexión: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const signatureToFile = () => {
    const canvas = !sigCanvasDesktop.current?.isEmpty()
      ? sigCanvasDesktop.current
      : sigCanvasMobile.current;

    if (!canvas || canvas.isEmpty()) return null;

    return new Promise((resolve) => {
      canvas.getCanvas().toBlob((blob) => {
        const file = new File([blob], `firma_${Date.now()}.png`, { type: 'image/png' });
        resolve(file);
      }, 'image/png');
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal d-block modal-mantenimiento" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1050, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto' }}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-fullscreen-md-down" style={{ maxHeight: '95vh', overflow: 'auto' }}>
        <div className="modal-content border-0 shadow-2xl rounded-5 overflow-hidden bg-white" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

          {/* Header Moderno con Gradiente Mejorado */}
          <div className="modal-header bg-gradient-primary text-white border-0 py-3 py-sm-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderBottom: 'none' }}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
                <div className=" bg-opacity-20 p-2 p-sm-3 rounded-4" style={{ backdropFilter: 'blur(10px)' }}>
                  <Car size={20} className="text-white d-sm-none" />
                  <Car size={24} className="text-white d-none d-sm-block" />
                </div>
                <div className="flex-grow-1 min-w-0">
                  <h5 className="modal-title fw-bold mb-0 fs-5 fs-sm-4">Nuevo Mantenimiento</h5>
                  <small className="text-white-75 d-flex align-items-center gap-2 mt-1">
                    <Settings size={12} className="d-sm-none" />
                    <Settings size={14} className="d-none d-sm-block" />
                    <span className="text-truncate">{unidad?.unidad_nombre}</span>
                  </small>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-link text-white p-2 p-sm-3 rounded-4 hover:bg-white hover:bg-opacity-20 transition-all"
                onClick={onClose}
                style={{ minWidth: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} strokeWidth={2.5} className="d-sm-none" />
                <X size={20} strokeWidth={2.5} className="d-none d-sm-block" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-0" style={{ background: 'linear-gradient(to bottom, #fafbfc, #ffffff)' }}>
              <div className="row g-0">

                {/* COLUMNA IZQUIERDA: DATOS PRINCIPALES */}
                <div className="col-xl-7" style={{ background: 'linear-gradient(to right, #ffffff, #f8fafc)' }}>
                  <div className="p-3 p-xl-5">
                    <div className="mb-4">
                      <label className="form-label fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-2">
                          <Wrench size={18} className="text-primary" />
                        </div>
                        Información del Servicio
                      </label>
                      <div className="row g-4">
                        <div className="col-md-6">
                          <label className="form-label small text-muted fw-semibold mb-2">Tipo de Servicio</label>
                          <select
                            className="form-select border-0 bg-light rounded-4 shadow-sm"
                            value={formData.tipo}
                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                            required
                            style={{ fontSize: '0.95rem', padding: '0.75rem 1rem' }}
                          >
                            {tiposMantenimiento.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="col-md-6">
<<<<<<< HEAD
                          <label className="form-label small text-muted fw-semibold mb-2">Categoría (Rubro Presupuestal)</label>
                          <select
                            className="form-select border-0 bg-light rounded-4 shadow-sm"
                            value={formData.categoria_presupuesto || ''}
                            onChange={(e) => setFormData({ ...formData, categoria_presupuesto: e.target.value })}
                            required
                            style={{ fontSize: '0.95rem', padding: '0.75rem 1rem' }}
                          >
                             {CATEGORIAS_PRESUPUESTO.map(c => (
                                <option key={c.label} value={c.field || ''}>
                                    {c.label}
                                </option>
                             ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="row g-4 mt-1">
                        <div className="col-md-6">
                            <label className="form-label small text-muted fw-semibold mb-2">Estado</label>
                            <select
                                className="form-select border-0 bg-light rounded-4 shadow-sm"
                                value={formData.estado}
                                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                required
                                style={{ fontSize: '0.95rem', padding: '0.75rem 1rem' }}
                            >
                                {estadosMantenimiento.map(estado => (
                                <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </select>
                        </div>
                      </div>
=======
                          <label className="form-label small text-muted fw-semibold mb-2">Estado</label>
                          <select
                            className="form-select border-0 bg-light rounded-4 shadow-sm"
                            value={formData.estado}
                            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                            required
                            style={{ fontSize: '0.95rem', padding: '0.75rem 1rem' }}
                          >
                            {estadosMantenimiento.map(estado => (
                              <option key={estado} value={estado}>{estado}</option>
                            ))}
                          </select>
                        </div>
                      </div>
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
                    </div>

                    <div className="row g-4">
                      <div className="col-12">
                        <label className="form-label fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                          <div className="bg-primary bg-opacity-10 p-2 rounded-2">
                            <User size={18} className="text-primary" />
                          </div>
                          Responsable
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0 rounded-start-4">
                            <User size={18} className="text-muted" />
                          </span>
                          <input
                            type="text"
                            className="form-control border-0 bg-light rounded-end-4"
                            placeholder="Nombre del responsable"
                            value={formData.responsable}
                            readOnly
                            required
                            style={{ fontSize: '0.95rem', padding: '0.75rem 1rem', cursor: 'not-allowed' }}
                          />
                        </div>
                      </div>
                    </div>

                    {formData.tipo === 'Otro' && (
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label fw-bold text-primary mb-3">Especificar Tipo</label>
                          <input
                            type="text"
                            className="form-control border-primary bg-light"
                            placeholder="Descripción del mantenimiento personalizado"
                            value={formData.tipo_otro}
                            onChange={(e) => setFormData({ ...formData, tipo_otro: e.target.value })}
                            required={formData.tipo === 'Otro'}
                            style={{ fontSize: '0.95rem', padding: '0.75rem 1rem' }}
                          />
                        </div>
                      </div>
                    )}

<<<<<<< HEAD
                    <div className="row g-4 mt-1">
                       <div className="col-12">
                          <label className="form-label fw-bold text-primary mb-2 d-flex justify-content-between align-items-center">
                              <span>Desglose de Costos (Opcional)</span>
                              <button 
                                type="button" 
                                className="btn btn-sm btn-outline-primary rounded-pill d-flex align-items-center gap-1"
                                onClick={addItem}
                              >
                                <Plus size={14} /> Agregar Concepto
                              </button>
                          </label>
                          
                          {items.length > 0 && (
                            <div className="bg-light p-3 rounded-4 mb-3 border">
                                {items.map((item, index) => (
                                    <div key={item.id} className="row g-2 mb-2 align-items-center animate__animated animate__fadeIn">
                                        <div className="col-7">
                                            <input 
                                                type="text" 
                                                className="form-control form-control-sm border-0 bg-white" 
                                                placeholder="Concepto (ej. Aceite, Filtro)"
                                                value={item.concepto}
                                                onChange={(e) => updateItem(item.id, 'concepto', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-4">
                                            <div className="input-group input-group-sm">
                                                <span className="input-group-text bg-white border-0 text-muted">$</span>
                                                <input 
                                                    type="text" 
                                                    className="form-control border-0 bg-white text-end" 
                                                    placeholder="0.00"
                                                    value={item.costo}
                                                    onChange={(e) => updateItem(item.id, 'costo', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-1 text-end">
                                            <button 
                                                type="button" 
                                                className="btn btn-link text-danger p-0"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="text-end border-top pt-2 mt-2">
                                    <small className="text-muted fw-bold me-2">Total Calculado:</small>
                                    <span className="fw-bold text-primary fs-6">
                                        ${items.reduce((sum, i) => sum + (cleanFloat(i.costo) || 0), 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                                    </span>
                                </div>
                            </div>
                          )}
                       </div>
                    </div>

                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label small text-muted fw-semibold mb-2">Presupuesto Restante</label>
=======
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label small text-muted fw-semibold mb-2">Presupuesto</label>
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0 rounded-start-4">
                            <DollarSign size={18} className="text-muted" />
                          </span>
                          <input
                            type="text"
                            className="form-control border-0 bg-light rounded-end-4"
<<<<<<< HEAD
                            value={
                                presupuestoInfo.restante != null 
                                ? presupuestoInfo.restante.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})
                                : "0.00"
                            } 
                            readOnly
                            placeholder="Sin presupuesto asignado"
                            style={{ 
                                fontSize: '0.95rem', 
                                padding: '0.75rem 1rem', 
                                cursor: 'not-allowed',
                                color: (presupuestoInfo.restante < 0) ? 'var(--bs-danger)' : 'var(--bs-success)',
                                fontWeight: 'bold'
                            }}
                          />
                        </div>
                        {presupuestoInfo.anual > 0 && (
                          <div className="mt-1 small d-flex justify-content-between text-muted" style={{ fontSize: '0.75rem' }}>
                            <span>Anual: ${presupuestoInfo.anual.toLocaleString()}</span>
                            <span>Gastado: ${presupuestoInfo.gastado.toLocaleString()}</span>
                            <span>
                               Actual: ${cleanFloat(formData.costo_total).toLocaleString()}
                            </span>
                          </div>
                        )}
=======
                            value={formData.presupuesto}
                            onChange={(e) => handleNumericChange('presupuesto', e)}
                            placeholder="Ej: 1,500.00"
                            style={{ fontSize: '0.95rem', padding: '0.75rem 1rem' }}
                          />
                        </div>
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small text-muted fw-semibold mb-2">Costo Total</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0 rounded-start-4">
                            <DollarSign size={18} className="text-muted" />
                          </span>
                          <input
                            type="text"
                            className="form-control border-0 bg-light rounded-end-4"
                            value={formData.costo_total}
                            onChange={(e) => handleNumericChange('costo_total', e)}
                            placeholder="Ej: 1,234.56"
<<<<<<< HEAD
                            readOnly={items.length > 0}
                            required
                            style={{ 
                                fontSize: '0.95rem', 
                                padding: '0.75rem 1rem',
                                backgroundColor: items.length > 0 ? '#e9ecef' : 'white'
                            }}
=======
                            required
                            style={{ fontSize: '0.95rem', padding: '0.75rem 1rem' }}
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
                          />
                        </div>
                      </div>
                    </div>

                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="form-label small text-muted fw-semibold mb-2">Kilometraje</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0 rounded-start-4">
                            <Gauge size={18} className="text-muted" />
                          </span>
                          <input
                            type="text"
                            className="form-control border-0 bg-light rounded-end-4"
                            value={formData.kilometraje_al_momento}
                            onChange={(e) => handleNumericChange('kilometraje_al_momento', e)}
                            placeholder="Ej: 45,678"
                            required
                            style={{ fontSize: '0.95rem', padding: '0.75rem 1rem' }}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small text-muted fw-semibold mb-2">Fecha del Servicio</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0 rounded-start-4">
                            <Calendar size={18} className="text-muted" />
                          </span>
                          <input
                            type="date"
                            className="form-control border-0 bg-light rounded-end-4"
                            value={formData.fecha}
                            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                            required
                            style={{ fontSize: '0.95rem', padding: '0.75rem 1rem' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-2">
                          <FileText size={18} className="text-primary" />
                        </div>
                        Descripción del Servicio
                      </label>
                      <textarea
                        id="descripcion-servicio"
                        className="form-control border-0 bg-light rounded-4"
                        rows="4"
                        placeholder="Describe los detalles del mantenimiento realizado..."
                        value={formData.descripcion || ''}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        required
                        autoFocus
                        style={{ resize: 'none', fontSize: '0.95rem', padding: '1rem' }}
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Mobile: Sección de fotos y firma (Visible hasta XL) */}
                <div className="d-xl-none mt-4 pt-4 border-top">
                  <h6 className="text-primary fw-bold mb-4 d-flex align-items-center gap-2">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-2">
                      <Camera size={18} className="text-primary" />
                    </div>
                    Documentación
                  </h6>

                  {/* Evidencia Fotográfica Mobile */}
                  <div className="mb-4">
                    <label className="form-label small text-muted mb-3 d-flex align-items-center gap-2">
                      <div className="bg-primary bg-opacity-10 p-1 rounded-2">
                        <Camera size={14} className="text-primary" />
                      </div>
                      Evidencia Fotográfica (Opcional)
                    </label>
                    {fotoEvidencia ? (
                      <div className="position-relative">
                        <div className="rounded-4 overflow-hidden shadow-lg" style={{ height: '200px', border: '3px solid #e2e8f0' }}>
                          <img src={fotoEvidencia.preview} className="w-100 h-100 object-fit-cover" alt="Evidencia" />
                          <button
                            type="button"
                            onClick={removeFoto}
                            className="btn btn-danger btn-sm position-absolute top-3 end-3 p-2 rounded-circle shadow-lg hover-scale"
                            style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => document.getElementById('evidenciaInputMobile').click()}
                        className="border-3 border-dashed rounded-4 d-flex flex-column align-items-center justify-content-center bg-light text-muted p-4 cursor-pointer hover-bg-white hover-border-primary transition-all"
                        style={{ height: '200px' }}
                      >
                        <div className="bg-primary bg-opacity-10 rounded-circle p-3 mb-3">
                          <Camera size={48} className="text-primary" />
                        </div>
                        <span className="fw-bold text-dark">Subir Evidencia</span>
                        <small className="text-muted">Ticket o fotos del servicio</small>
                        <input
                          id="evidenciaInputMobile"
                          type="file"
                          hidden
                          accept="image/*"
                          capture="environment"
                          onChange={handleFotoChange}
                        />
                      </div>
                    )}
                  </div>

                  {/* Firma del Empleado Mobile */}
                  <div>
                    <label className="form-label small text-muted mb-3 d-flex justify-content-between align-items-center">
                      <span className="d-flex align-items-center gap-2">
                        <div className="bg-primary bg-opacity-10 p-1 rounded-2">
                          <PenTool size={14} className="text-primary" />
                        </div>
                        Firma del Empleado
                      </span>
                      <span
                        className="text-danger cursor-pointer fw-bold px-3 py-1 rounded-3 hover-bg-danger hover-bg-opacity-10 transition-all"
                        onClick={() => sigCanvasMobile.current?.clear()}
                        style={{ fontSize: '0.75rem' }}
                      >
                        LIMPIAR
                      </span>
                    </label>
                    <div className="bg-white rounded-4 border border-2 p-3" style={{ height: '140px', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.08)' }}>
                      <SignatureCanvas
                        ref={sigCanvasMobile}
                        canvasProps={{
                          className: 'w-100 h-100',
                          style: { display: 'block', backgroundColor: '#f8f9fa', borderRadius: '8px' }
                        }}
                      />
                    </div>
                    <small className="text-muted text-center d-block mt-3">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <PenTool size={12} className="text-muted" />
                        Dibuje su firma para validar el mantenimiento
                      </div>
                    </small>
                  </div>
                </div>

                {/* COLUMNA DERECHA: FOTOS Y FIRMA */}
                <div className="col-xl-5">
                  <div className="p-3 p-xl-5 border-start border-3 border-primary d-none d-xl-block" style={{ background: 'linear-gradient(to bottom, #f8fafc, #ffffff)' }}>
                    <h6 className="text-primary fw-bold mb-4 d-flex align-items-center gap-2">
                      <div className="bg-primary bg-opacity-10 p-2 rounded-2">
                        <Camera size={18} className="text-primary" />
                      </div>
                      Documentación
                    </h6>

                    {/* Evidencia Fotográfica */}
                    <div className="mb-4">
                      <label className="form-label small text-muted mb-3 d-flex align-items-center gap-2">
                        <div className="bg-primary bg-opacity-10 p-1 rounded-2">
                          <Camera size={14} className="text-primary" />
                        </div>
                        Evidencia Fotográfica (Opcional)
                      </label>
                      {fotoEvidencia ? (
                        <div className="position-relative">
                          <div className="rounded-4 overflow-hidden shadow-lg" style={{ height: '220px', border: '3px solid #e2e8f0' }}>
                            <img src={fotoEvidencia.preview} className="w-100 h-100 object-fit-cover" alt="Evidencia" />
                            <button
                              type="button"
                              onClick={removeFoto}
                              className="btn btn-danger btn-sm position-absolute top-3 end-3 p-2 rounded-circle shadow-lg hover-scale"
                              style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => document.getElementById('evidenciaInput').click()}
                          className="border-3 border-dashed rounded-4 d-flex flex-column align-items-center justify-content-center bg-light text-muted p-4 cursor-pointer hover-bg-white hover-border-primary transition-all"
                          style={{ height: '220px' }}
                        >
                          <div className="bg-primary bg-opacity-10 rounded-circle p-3 mb-3">
                            <Camera size={48} className="text-primary" />
                          </div>
                          <span className="fw-bold text-dark">Subir Evidencia</span>
                          <small className="text-muted">Ticket o fotos del servicio</small>
                          <input
                            id="evidenciaInput"
                            type="file"
                            hidden
                            accept="image/*"
                            capture="environment"
                            onChange={handleFotoChange}
                          />
                        </div>
                      )}
                    </div>

                    {/* Firma del Empleado */}
                    <div>
                      <label className="form-label small text-muted mb-3 d-flex justify-content-between align-items-center">
                        <span className="d-flex align-items-center gap-2">
                          <div className="bg-primary bg-opacity-10 p-1 rounded-2">
                            <PenTool size={14} className="text-primary" />
                          </div>
                          Firma del Empleado
                        </span>
                        <span
                          className="text-danger cursor-pointer fw-bold px-3 py-1 rounded-3 hover-bg-danger hover-bg-opacity-10 transition-all"
                          onClick={() => sigCanvasDesktop.current?.clear()}
                          style={{ fontSize: '0.75rem' }}
                        >
                          LIMPIAR
                        </span>
                      </label>
                      <div className="bg-white rounded-4 border border-2 p-3" style={{ height: '160px', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.08)' }}>
                        <SignatureCanvas
                          ref={sigCanvasDesktop}
                          canvasProps={{
                            className: 'w-100 h-100',
                            style: { display: 'block', backgroundColor: '#f8f9fa', borderRadius: '8px' }
                          }}
                        />
                      </div>
                      <small className="text-muted text-center d-block mt-3">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <PenTool size={12} className="text-muted" />
                          Dibuje su firma para validar el mantenimiento
                        </div>
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Moderno */}
            <div className="modal-footer bg-light border-0 p-3 p-sm-4" style={{ background: 'linear-gradient(to right, #f8fafc, #ffffff)', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <div className="d-flex justify-content-between align-items-center w-100 gap-2">
                <button
                  type="button"
                  className="btn btn-light text-muted fw-bold px-4 px-sm-5 py-2 py-sm-3 rounded-4 transition-all hover-scale hover-bg-white flex-fill flex-sm-auto"
                  onClick={onClose}
                  style={{ fontSize: '0.9rem' }}
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="btn btn-primary rounded-pill px-4 px-sm-6 py-2 py-sm-3 fw-bold shadow-lg transition-all hover-scale flex-fill flex-sm-auto"
                  disabled={loading}
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', fontSize: '0.9rem' }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      GUARDANDO...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="me-2 d-none d-sm-inline" />
                      GUARDAR
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}