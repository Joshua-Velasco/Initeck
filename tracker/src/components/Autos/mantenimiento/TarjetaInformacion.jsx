import React, { useState, useEffect } from 'react';
import { Settings, Droplets, Disc, Gauge, BookOpen, Waves, Zap, Thermometer, Lightbulb, Edit2, Save, X } from 'lucide-react';
import { MODIFICAR_URL } from '../../../config.js';

export default function TarjetaInformacion({ unidad, onEstadoChange, onManualOpen, onUpdate }) {
  if (!unidad) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
     if(unidad) setFormData(unidad);
  }, [unidad]);

  const handleChange = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
      setSaving(true);
      try {
          const data = new FormData();
          data.append('id', unidad.id);
          data.append('accion', 'editar_vehiculo'); 
          
          // Send ALL fields to avoid nulling them out in the backend
          // Since the PHP script defaults missing fields to '', we must send everything we have.
          Object.keys(formData).forEach(key => {
              if (key !== 'id' && key !== 'accion') { // prevent duplicates of manually appended ones
                  // Handle potential null values
                  data.append(key, formData[key] == null ? '' : formData[key]);
              }
          });

          const res = await fetch(MODIFICAR_URL, {
              method: 'POST',
              body: data
          });
          
          const result = await res.json();
          if(result.status === 'success') {
              setIsEditing(false);
              if(onUpdate) onUpdate();
          } else {
              if(result.message) alert(result.message);
              else alert('Error al guardar cambios');
          }
      } catch(e) {
          console.error(e);
          alert('Error de conexión al actualizar');
      } finally {
          setSaving(false);
      }
  };

  const val = (v) => v || <span className="text-muted opacity-50 fst-italic">N/A</span>;

  // Render input or value
  const renderField = (field, label, icon) => {
      const value = formData[field];
      if (isEditing) {
          return (
             <div className="d-flex flex-column h-100 p-2 rounded-3 bg-white border border-primary transition-all shadow-sm">
                 <span className="d-flex align-items-center gap-2 text-primary small mb-1">
                     {React.cloneElement(icon, { size: 14 })} {label}
                 </span>
                 <input 
                    type="text" 
                    className="form-control form-control-sm border-0 bg-transparent p-0 fw-bold text-dark"
                    value={value || ''}
                    onChange={e => handleChange(field, e.target.value)}
                    placeholder={label}
                 />
             </div>
          );
      }
      return (
         <div className="d-flex flex-column h-100 p-2 rounded-3 hover-bg-light transition-all">
             <span className="d-flex align-items-center gap-2 text-muted mb-1" style={{fontSize: '0.85rem'}}>
                 {React.cloneElement(icon, { size: 16 })} {label}
             </span>
             <span className="fw-semibold text-dark text-break lh-sm" style={{fontSize: '1rem'}}>
                 {val(unidad[field])}
             </span>
         </div>
      );
  };

  return (
    <div className="card border-0 shadow-sm h-100 overflow-hidden bg-white animate__animated animate__fadeIn" style={{ borderRadius: '24px' }}>
      
      {/* HEADER: Estado y Título */}
      <div className="card-header bg-transparent border-0 pt-4 px-4 pb-2">
         {/* 1. Nombre y Botón Editar */}
         <div className="d-flex justify-content-between align-items-start mb-2">
            <h3 className="fw-extrabold m-0 text-dark text-break lh-sm" style={{ color: '#1e293b', fontSize: '2rem' }}>
                {val(unidad.unidad_nombre)}
            </h3>
             <div className="d-flex align-items-center gap-2">
                 {isEditing ? (
                     <div className="d-flex gap-2">
                         <button 
                            onClick={() => setIsEditing(false)} 
                            className="btn btn-light rounded-circle p-2 shadow-sm text-muted hover-bg-danger hover-text-white transition-all"
                            disabled={saving}
                            title="Cancelar"
                         >
                            <X size={18} />
                         </button>
                         <button 
                            onClick={handleSave} 
                            className="btn btn-primary rounded-circle p-2 shadow-sm text-white hover-scale transition-all"
                            disabled={saving}
                            title="Guardar"
                         >
                            {saving ? <span className="spinner-border spinner-border-sm" /> : <Save size={18} />}
                         </button>
                     </div>
                 ) : (
                     <button 
                        onClick={() => setIsEditing(true)} 
                        className="btn btn-white border shadow-sm rounded-circle p-2 text-muted hover-text-primary transition-all"
                        title="Editar Especificaciones"
                     >
                        <Edit2 size={16} />
                     </button>
                 )}
            </div>
         </div>

         {/* 2. Placas */}
         <div className="mb-2">
            <span className="badge bg-light text-dark fw-bold px-3 py-2 rounded-pill fs-5 border shadow-sm">
                {val(unidad.placas)}
            </span>
         </div>

         {/* 3. Tipo */}
         <div className="mb-1">
             <span className="text-muted fw-bold text-uppercase me-2" style={{fontSize: '0.8rem'}}>Tipo:</span>
             <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-1" style={{fontSize: '0.9rem'}}>
                 {val(unidad.tipo_unidad)}
             </span>
         </div>

         {/* 4. VIN */}
         <div className="mb-1">
             <span className="text-muted fw-bold text-uppercase me-2" style={{fontSize: '0.8rem'}}>VIN:</span>
             <span className="font-monospace text-dark fw-bold" style={{fontSize: '0.95rem'}}>
                 {val(unidad.numero_serie)}
             </span>
         </div>

         {/* 5. Año */}
         <div className="mb-3">
             <span className="text-muted fw-bold text-uppercase me-2" style={{fontSize: '0.8rem'}}>Año:</span>
             <span className="text-dark fw-bold" style={{fontSize: '1rem'}}>
                 {unidad.modelo_anio || unidad.modelo || 'N/A'}
             </span>
         </div>

         {/* 6. Selector de Estado */}
         <div className="bg-light p-1 rounded-pill d-inline-flex w-100 mb-2">
             <select 
                className="form-select border-0 bg-transparent fw-bold text-center py-2 fs-6 shadow-none"
                value={unidad.estado}
                onChange={(e) => onEstadoChange && onEstadoChange(e.target.value)}
                disabled={isEditing}
                style={{
                  color: unidad.estado === 'Activo' ? 'var(--bs-success)' :
                         unidad.estado === 'En Taller' ? 'var(--bs-warning)' : 
                         unidad.estado === 'Baja' ? 'var(--bs-danger)' : 'var(--bs-secondary)',
                  cursor: 'pointer'
                }}
              >
                <option value="Activo">🟢 Activo</option>
                <option value="En Taller">🟠 En Taller</option>
                <option value="Mantenimiento">🟡 Mantenimiento</option>
                <option value="Baja">🔴 Baja</option>
              </select>
         </div>
      </div>

      <div className="card-body px-4 pt-2">
         
         {/* SECCIÓN 1: Identificación y Motor */}
         <h6 className="text-muted fw-bold small text-uppercase letter-spacing-1 mb-3 mt-2 border-bottom pb-2">
            Identificación & Mecánica
         </h6>
         
         <div className="alert alert-light border-0 py-2 px-3 mb-3 d-flex align-items-center gap-2 text-muted small">
            <Settings size={14} className="flex-shrink-0"/>
            {isEditing ? 'Los campos de identificación (VIN, Placas) no son editables.' : 'Información técnica del vehículo.'}
         </div>

          <div className="row g-3 mb-4">
              <div className="col-4">
                  {isEditing ? (
                     <div className="p-2 border border-primary rounded-3 bg-white h-100">
                       <label className="d-block text-primary small mb-1 fw-bold">Motor</label>
                       <input 
                         className="form-control form-control-sm border-0 p-0 fw-bold" 
                         value={formData.motor_tipo || ''} 
                         onChange={e=>handleChange('motor_tipo', e.target.value)}
                         placeholder="Ej. V6 3.5L"
                       />
                     </div>
                  ) : (
                     <div className="p-2 border rounded-3 bg-light bg-opacity-50 h-100">
                        <label className="d-block text-muted small mb-1">Motor</label>
                        <div className="fw-bold text-dark small">{val(unidad.motor_tipo)}</div>
                     </div>
                  )}
              </div>
              <div className="col-4">
                  {isEditing ? (
                     <div className="p-2 border border-primary rounded-3 bg-white h-100">
                       <label className="d-block text-primary small mb-1 fw-bold">Cilindraje</label>
                       <input 
                         className="form-control form-control-sm border-0 p-0 fw-bold" 
                         value={formData.cilindraje || ''} 
                         onChange={e=>handleChange('cilindraje', e.target.value)}
                         placeholder="Ej. 2.0L"
                       />
                     </div>
                  ) : (
                     <div className="p-2 border rounded-3 bg-light bg-opacity-50 h-100">
                        <label className="d-block text-muted small mb-1">Cilindraje</label>
                        <div className="fw-bold text-dark small">{val(unidad.cilindraje)}</div>
                     </div>
                  )}
              </div>
              <div className="col-4">
                  {isEditing ? (
                     <div className="p-2 border border-primary rounded-3 bg-white h-100">
                       <label className="d-block text-primary small mb-1 fw-bold">Rendimiento</label>
                       <input 
                         className="form-control form-control-sm border-0 p-0 fw-bold" 
                         value={formData.rendimiento_gasolina || ''} 
                         onChange={e=>handleChange('rendimiento_gasolina', e.target.value)}
                         placeholder="Ej. 12.5"
                       />
                     </div>
                  ) : (
                     <div className="p-2 border rounded-3 bg-light bg-opacity-50 h-100">
                        <label className="d-block text-muted small mb-1">Rendimiento</label>
                        <div className="fw-bold text-dark small">{unidad.rendimiento_gasolina ? `${unidad.rendimiento_gasolina} km/l` : 'N/A'}</div>
                     </div>
                  )}
              </div>
          </div>

         {/* SECCIÓN 2: Especificaciones Técnicas */}
         <h6 className="text-muted fw-bold small text-uppercase letter-spacing-1 mb-3 border-bottom pb-2">
            Especificaciones Técnicas
         </h6>
         <div className="row g-2">
             <div className="col-6 col-sm-4">{renderField('aceite_tipo', 'Aceite', <Droplets/>)}</div>
             <div className="col-6 col-sm-4">{renderField('filtro_aceite', 'Filtro Aceite', <Settings/>)}</div>
             <div className="col-6 col-sm-4">{renderField('filtro_aire', 'Filtro Aire', <Waves/>)}</div>
             <div className="col-6 col-sm-4">{renderField('anticongelante_tipo', 'Anticongelante', <Thermometer/>)}</div>
             <div className="col-6 col-sm-4">{renderField('llantas_medida', 'Llantas', <Disc/>)}</div>
             <div className="col-6 col-sm-4">{renderField('tipo_frenos', 'Frenos', <Disc/>)}</div>
             <div className="col-6 col-sm-4">{renderField('bujias_tipo', 'Bujías', <Zap/>)}</div>
             <div className="col-6 col-sm-4">{renderField('focos_tipo', 'Focos', <Lightbulb/>)}</div>
         </div>

         {/* ODOMETRO Moderno */}
         <div className="mt-4 p-3 rounded-4 bg-light shadow-inner border navbar-light">
             <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                    <div className="bg-white rounded-circle p-2 shadow-sm">
                       <Gauge size={20} className="text-success" />
                    </div>
                    <div>
                       <div className="text-muted small fw-bold text-uppercase" style={{fontSize: '0.65rem'}}>Odómetro (No editable)</div>
                       <div className="fw-black fs-5 text-dark" style={{fontFamily: 'monospace', letterSpacing: '-0.5px'}}>
                          {unidad.kilometraje_actual ? parseInt(unidad.kilometraje_actual).toLocaleString() : 0} 
                          <span className="fs-6 text-muted ms-1 fw-normal">{unidad.unidad_medida === 'mi' ? 'mi' : 'km'}</span>
                       </div>
                    </div>
                </div>
                {/* Botón Manual pequeño */}
                 <button 
                    onClick={onManualOpen} 
                    className="btn btn-white border shadow-sm rounded-circle p-2"
                    title="Ver Manual"
                 >
                    <BookOpen size={18} className="text-dark"/>
                 </button>
             </div>
         </div>

      </div>
    </div>
  );
}


