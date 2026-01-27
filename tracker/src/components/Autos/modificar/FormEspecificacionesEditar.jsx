import React from 'react';
import { 
  Settings, Gauge, Droplets, Zap, Activity, 
  Thermometer, Disc, Lightbulb, Fuel, Globe, Wrench, Hash 
} from 'lucide-react';
import { formatNumberWithCommas } from '../../formatters';

export const FormEspecificacionesEditar = ({ formData, updateField }) => {
  
  // Manejador para inputs numéricos con formato
  const handleNumericChange = (field, e) => {
    const value = e.target.value;
    const formattedValue = formatNumberWithCommas(value);
    const cleanValue = formattedValue.replace(/,/g, '');
    updateField(field, cleanValue);
  };
  
  // 1. Conversión de Odómetro
  const renderOdometerConversion = () => {
    const valor = parseFloat(formData.kilometraje_actual?.toString().replace(/,/g, '') || '0') || 0;
    if (valor === 0) return null;
    if (formData.unidad_medida === 'km') {
      const millas = (valor * 0.621371).toLocaleString(undefined, { maximumFractionDigits: 2 });
      return <small className="text-primary fw-bold">≈ {millas} Millas</small>;
    } else {
      const kms = (valor * 1.60934).toLocaleString(undefined, { maximumFractionDigits: 2 });
      return <small className="text-primary fw-bold">≈ {kms} Kilómetros</small>;
    }
  };

  // 2. Conversión de Rendimiento
  const renderFuelConversion = () => {
    const valor = parseFloat(formData.rendimiento_gasolina?.toString().replace(/,/g, '') || '0') || 0;
    if (valor === 0) return null;
    if (formData.unidad_medida === 'km') {
      const mpg = (valor * 2.35215).toFixed(2);
      return <small className="text-success fw-bold">≈ {mpg} MPG</small>;
    } else {
      const kml = (valor / 2.35215).toFixed(2);
      return <small className="text-success fw-bold">≈ {kml} KM/L</small>;
    }
  };

  return (
    <div className="form-especificaciones-editar">
      <div className="d-flex align-items-center mb-4">
        <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
          <Settings size={20} className="text-primary" />
        </div>
        <h6 className="fw-bold mb-0 text-uppercase small tracking-wide">1. Información Técnica y Estado</h6>
      </div>
      
      <div className="row g-3">
        {/* --- IDENTIFICACIÓN Y ESTADO --- */}
        <div className="col-md-4">
          <label className="form-label small fw-bold text-muted">Nombre de la Unidad</label>
          <input 
            type="text" 
            className="form-control border-2 shadow-sm" 
            placeholder="Ej: Nissan Frontier" 
            value={formData.unidad_nombre || ''} 
            onChange={e => updateField('unidad_nombre', e.target.value)} 
          />
        </div>

        <div className="col-md-4">
          <label className="form-label small fw-bold text-muted">Estado de la Unidad</label>
          <div className="input-group">
            <span className={`input-group-text border-2 border-end-0 bg-white ${formData.estado === 'En Taller' ? 'text-danger' : 'text-success'}`}>
              {formData.estado === 'En Taller' ? <Wrench size={16} /> : <Activity size={16} />}
            </span>
            <select 
                className={`form-select border-2 fw-bold ${formData.estado === 'En Taller' ? 'text-danger' : 'text-success'}`}
                value={formData.estado || 'Activo'} 
                onChange={e => updateField('estado', e.target.value)}
            >
              <option value="Activo">🟢 Activo / Operativo</option>
              <option value="En Taller">🔴 En Taller / Reparación</option>
              <option value="Baja">⚪ Fuera de Servicio (Baja)</option>
            </select>
          </div>
        </div>

        <div className="col-md-4">
          <label className="form-label small fw-bold text-muted">Registro / Origen</label>
          <div className="input-group">
            <span className="input-group-text bg-white border-2 border-end-0"><Globe size={16} className="text-secondary"/></span>
            <select 
                className="form-select border-2 fw-bold" 
                value={formData.tipo_unidad || 'Nacional'} 
                onChange={e => updateField('tipo_unidad', e.target.value)}
            >
              <option value="Nacional">Nacional</option>
              <option value="Fronterizo">Fronterizo</option>
              <option value="Importado">Importado</option>
            </select>
          </div>
        </div>
        
        <div className="col-md-3">
          <label className="form-label small fw-bold text-muted">Año</label>
          <input 
            type="number" 
            className="form-control border-2 shadow-sm fw-bold" 
            value={formData.modelo_anio || ''} 
            onChange={e => updateField('modelo_anio', e.target.value)} 
          />
        </div>

        <div className="col-md-3">
          <label className="form-label small fw-bold text-muted">Placas</label>
          <input 
            type="text" 
            className="form-control border-2 shadow-sm fw-bold text-primary" 
            style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
            value={formData.placas || ''} 
            onChange={e => updateField('placas', e.target.value.toUpperCase())} 
          />
        </div>

        {/* --- NUEVO CAMPO: NÚMERO DE SERIE (VIN) PARA EDICIÓN --- */}
        <div className="col-md-6">
          <label className="form-label small fw-bold text-muted">Número de Serie (VIN)</label>
          <div className="input-group">
            <span className="input-group-text bg-white border-2 border-end-0"><Hash size={16} className="text-secondary"/></span>
            <input 
              type="text" 
              className="form-control border-2 shadow-sm fw-bold" 
              style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
              placeholder="NÚMERO DE IDENTIFICACIÓN"
              maxLength={17}
              value={formData.numero_serie || ''} 
              onChange={e => updateField('numero_serie', e.target.value.toUpperCase())} 
            />
          </div>
        </div>

        <div className="col-md-12">
          <label className="form-label small fw-bold text-muted">Motor / Cilindraje</label>
          <div className="input-group">
            <span className="input-group-text bg-white border-2 border-end-0"><Zap size={16} className="text-warning" /></span>
            <input 
                type="text" 
                className="form-control border-2 shadow-sm" 
                placeholder="Ej: V6 3.5L Turbo" 
                value={formData.motor_tipo || ''} 
                onChange={e => updateField('motor_tipo', e.target.value)} 
            />
          </div>
        </div>

        {/* --- RENDIMIENTO Y KILOMETRAJE --- */}
        <div className="col-md-6">
          <label className="form-label small fw-bold text-muted">Rendimiento</label>
          <div className="input-group mb-1">
            <span className="input-group-text bg-white border-2 border-end-0 text-success"><Fuel size={16} /></span>
            <input 
                type="text" 
                step="0.1" 
                className="form-control border-2 shadow-sm fw-bold text-success" 
                value={formData.rendimiento_gasolina ? formatNumberWithCommas(formData.rendimiento_gasolina.toString()) : ''} 
                onChange={e => handleNumericChange('rendimiento_gasolina', e)} 
                placeholder="Ej: 12.5"
              />
            <span className="input-group-text bg-light border-2 border-start-0 small fw-bold">
                {formData.unidad_medida === 'km' ? 'KM/L' : 'MPG'}
            </span>
          </div>
          <div className="text-end px-1">{renderFuelConversion()}</div>
        </div>

        <div className="col-md-6">
          <label className="form-label small fw-bold text-muted">Kilometraje Actual</label>
          <div className="input-group mb-1">
            <span className="input-group-text bg-white border-2 border-end-0 text-primary"><Gauge size={18} /></span>
            <input 
                type="text" 
                className="form-control border-2 shadow-sm fw-bold text-primary" 
                value={formData.kilometraje_actual ? formatNumberWithCommas(formData.kilometraje_actual.toString()) : ''} 
                onChange={e => handleNumericChange('kilometraje_actual', e)} 
                placeholder="Ej: 45,678"
              />
            <select 
                className="form-select border-2 border-start-0 fw-bold" 
                style={{ maxWidth: '85px' }} 
                value={formData.unidad_medida || 'km'} 
                onChange={e => updateField('unidad_medida', e.target.value)}
            >
              <option value="km">KM</option>
              <option value="mi">MI</option>
            </select>
          </div>
          <div className="text-end px-1">{renderOdometerConversion()}</div>
        </div>

        {/* --- SECCIÓN MANTENIMIENTO --- */}
        <div className="col-12 mt-3">
            <div className="p-3 rounded-4" style={{ backgroundColor: '#f8f9fa', border: '1px dashed #dee2e6' }}>
                <label className="small fw-bold text-secondary text-uppercase mb-3 d-block" style={{letterSpacing: '0.05em'}}>
                    Ficha Técnica de Mantenimiento
                </label>
                <div className="row g-3">
                    <div className="col-md-4">
                        <label className="form-label x-small fw-bold text-muted mb-1 d-flex align-items-center gap-1">
                            <Droplets size={14} className="text-primary"/> Aceite y Filtro
                        </label>
                        <div className="input-group input-group-sm">
                            <input type="text" className="form-control border-2" placeholder="Tipo Aceite" value={formData.aceite_tipo || ''} onChange={e => updateField('aceite_tipo', e.target.value)} />
                            <input type="text" className="form-control border-2" placeholder="Filtro" value={formData.filtro_aceite || ''} onChange={e => updateField('filtro_aceite', e.target.value)} />
                        </div>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label x-small fw-bold text-muted mb-1 d-flex align-items-center gap-1">
                            <Disc size={14} className="text-primary"/> Llantas
                        </label>
                        <input type="text" className="form-control form-control-sm border-2" placeholder="Ej: 265/70 R17" value={formData.llantas_medida || ''} onChange={e => updateField('llantas_medida', e.target.value)} />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label x-small fw-bold text-muted mb-1 d-flex align-items-center gap-1">
                            <Lightbulb size={14} className="text-primary"/> Focos
                        </label>
                        <input type="text" className="form-control form-control-sm border-2" placeholder="Ej: H11 LED" value={formData.focos_tipo || ''} onChange={e => updateField('focos_tipo', e.target.value)} />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label x-small fw-bold text-muted mb-1 d-flex align-items-center gap-1">
                            <Thermometer size={14} className="text-primary"/> Anticongelante
                        </label>
                        <input type="text" className="form-control form-control-sm border-2" placeholder="Color / Tipo de Anticongelante" value={formData.anticongelante_tipo || ''} onChange={e => updateField('anticongelante_tipo', e.target.value)} />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label x-small fw-bold text-muted mb-1 d-flex align-items-center gap-1">
                            <Zap size={14} className="text-primary"/> Bujías
                        </label>
                        <input type="text" className="form-control form-control-sm border-2" placeholder="Marca / Modelo de Bujías" value={formData.bujias_tipo || ''} onChange={e => updateField('bujias_tipo', e.target.value)} />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};