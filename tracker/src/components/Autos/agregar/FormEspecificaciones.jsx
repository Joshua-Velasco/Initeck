import React from 'react';
import { 
  Settings, Gauge, Droplets, Zap, Activity, 
  Thermometer, Disc, Lightbulb, Fuel, Globe, Hash 
} from 'lucide-react';

export const FormEspecificaciones = ({ formData, updateField }) => {
  
  // 1. Conversión de Odómetro
  const renderOdometerConversion = () => {
    const valor = parseFloat(formData.kilometraje_actual) || 0;
    if (valor === 0) return null;
    if (formData.unidad_medida === 'km') {
      const millas = (valor * 0.621371).toLocaleString(undefined, { maximumFractionDigits: 2 });
      return <small className="text-primary fw-medium">≈ {millas} Millas</small>;
    } else {
      const kms = (valor * 1.60934).toLocaleString(undefined, { maximumFractionDigits: 2 });
      return <small className="text-primary fw-medium">≈ {kms} Kilómetros</small>;
    }
  };

  // 2. Conversión de Rendimiento
  const renderFuelConversion = () => {
    const valor = parseFloat(formData.rendimiento_gasolina) || 0;
    if (valor === 0) return null;
    if (formData.unidad_medida === 'km') {
      const mpg = (valor * 2.35215).toFixed(2);
      return <small className="text-success fw-medium">≈ {mpg} MPG</small>;
    } else {
      const kml = (valor / 2.35215).toFixed(2);
      return <small className="text-success fw-medium">≈ {kml} KM/L</small>;
    }
  };

  return (
    <div className="section-card">
      <h6 className="section-title">
        <Settings size={18} className="text-primary" /> 1. Especificaciones y Datos Técnicos
      </h6>
      
      <div className="row g-3">
        {/* --- FILA 1: DATOS BÁSICOS --- */}
        <div className="col-md-3">
          <label className="form-label small fw-bold text-muted">Nombre de la Unidad</label>
          <input 
            type="text" 
            className="form-control bg-light border-0" 
            required 
            placeholder="Ej: Nissan Frontier" 
            value={formData.unidad_nombre || ''} 
            onChange={e => updateField('unidad_nombre', e.target.value)} 
          />
        </div>

        <div className="col-md-3">
          <label className="form-label small fw-bold text-muted">Registro de Unidad</label>
          <div className="input-group">
            <span className="input-group-text bg-light border-0"><Globe size={16} className="text-secondary"/></span>
            <select 
                className="form-select bg-light border-0 fw-bold" 
                value={formData.tipo_unidad || 'Nacional'} 
                onChange={e => updateField('tipo_unidad', e.target.value)}
            >
              <option value="Nacional">Nacional</option>
              <option value="Fronterizo">Fronterizo</option>
              <option value="Importado">Importado</option>
            </select>
          </div>
        </div>
        
        <div className="col-md-2">
          <label className="form-label small fw-bold text-muted">Año (Modelo)</label>
          <input 
            type="number" 
            className="form-control bg-light border-0" 
            placeholder="2023" 
            value={formData.modelo_anio || ''} 
            onChange={e => updateField('modelo_anio', e.target.value)} 
          />
        </div>

        <div className="col-md-2">
          <label className="form-label small fw-bold text-muted">Placas</label>
          <input 
            type="text" 
            className="form-control bg-light border-0" 
            style={{ textTransform: 'uppercase' }}
            placeholder="ABC-123"
            value={formData.placas || ''} 
            onChange={e => updateField('placas', e.target.value.toUpperCase())} 
          />
        </div>

        <div className="col-md-2">
          <label className="form-label small fw-bold text-muted">Estado</label>
          <select 
            className="form-select bg-light border-0 fw-bold" 
            value={formData.estado || 'Activo'} 
            onChange={e => updateField('estado', e.target.value)}
          >
            <option value="Activo">Activo</option>
            <option value="En Taller">En Taller</option>
          </select>
        </div>

        {/* --- NUEVO CAMPO: NÚMERO DE SERIE (VIN) --- */}
        <div className="col-md-6">
          <label className="form-label small fw-bold text-muted">Número de Serie (VIN)</label>
          <div className="input-group">
            <span className="input-group-text bg-light border-0"><Hash size={16} className="text-secondary"/></span>
            <input 
              type="text" 
              className="form-control bg-light border-0 fw-bold" 
              style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
              placeholder="17 DÍGITOS DEL VEHÍCULO"
              maxLength={17}
              value={formData.numero_serie || ''} 
              onChange={e => updateField('numero_serie', e.target.value.toUpperCase())} 
            />
          </div>
        </div>

        <div className="col-md-6">
          <label className="form-label small fw-bold text-muted">Motor / Cilindraje</label>
          <div className="input-group">
            <span className="input-group-text bg-light border-0"><Activity size={16} /></span>
            <input 
                type="text" 
                className="form-control bg-light border-0" 
                placeholder="V6 3.5L" 
                value={formData.motor_tipo || ''} 
                onChange={e => updateField('motor_tipo', e.target.value)} 
            />
          </div>
        </div>

        {/* --- FILA 3: RENDIMIENTO Y ODÓMETRO --- */}
        <div className="col-md-4">
          <label className="form-label small fw-bold text-muted">Rendimiento Promedio</label>
          <div className="input-group mb-1">
            <span className="input-group-text bg-light border-0 text-success"><Fuel size={16} /></span>
            <input 
                type="number" 
                step="0.1" 
                className="form-control bg-light border-0 fw-bold" 
                placeholder="0.0" 
                value={formData.rendimiento_gasolina || ''} 
                onChange={e => updateField('rendimiento_gasolina', e.target.value)} 
            />
            <span className="input-group-text bg-light border-0 small fw-bold text-muted">
                {formData.unidad_medida === 'km' ? 'KM/L' : 'MPG'}
            </span>
          </div>
          <div className="ps-1" style={{ height: '1rem' }}>{renderFuelConversion()}</div>
        </div>

        <div className="col-md-8">
          <label className="form-label small fw-bold text-muted">Odómetro Actual</label>
          <div className="input-group mb-1">
            <span className="input-group-text bg-light border-0 text-primary"><Gauge size={18} /></span>
            <input 
                type="number" 
                className="form-control bg-light border-0 fw-bold" 
                value={formData.kilometraje_actual || ''} 
                onChange={e => updateField('kilometraje_actual', e.target.value)} 
            />
            <select 
                className="form-select bg-light border-0 fw-bold text-muted" 
                style={{ maxWidth: '85px' }} 
                value={formData.unidad_medida || 'km'} 
                onChange={e => updateField('unidad_medida', e.target.value)}
            >
              <option value="km">KM</option>
              <option value="mi">MI</option>
            </select>
          </div>
          <div className="ps-1" style={{ height: '1rem' }}>{renderOdometerConversion()}</div>
        </div>

        {/* --- SECCIÓN: CONSUMIBLES --- */}
        <div className="col-12 mt-2">
            <label className="small fw-bold text-primary text-uppercase mb-2 d-block" style={{letterSpacing: '0.05em'}}>Consumibles y Especificaciones de Repuesto</label>
            <div className="row g-2">
                <div className="col-md-4">
                    <div className="bg-light p-2 rounded-3 border">
                        <label className="form-label small fw-bold text-muted mb-1 d-flex align-items-center gap-1">
                            <Droplets size={14} className="text-primary"/> Aceite y Filtro
                        </label>
                        <div className="d-flex gap-1">
                            <input type="text" className="form-control form-control-sm border-0 bg-white shadow-sm" placeholder="Aceite" value={formData.aceite_tipo || ''} onChange={e => updateField('aceite_tipo', e.target.value)} />
                            <input type="text" className="form-control form-control-sm border-0 bg-white shadow-sm" placeholder="Filtro" value={formData.filtro_aceite || ''} onChange={e => updateField('filtro_aceite', e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="bg-light p-2 rounded-3 border">
                        <label className="form-label small fw-bold text-muted mb-1 d-flex align-items-center gap-1">
                            <Disc size={14} className="text-primary"/> Medida de Llantas
                        </label>
                        <input type="text" className="form-control form-control-sm border-0 bg-white shadow-sm" placeholder="Ej: 265/70 R17" value={formData.llantas_medida || ''} onChange={e => updateField('llantas_medida', e.target.value)} />
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="bg-light p-2 rounded-3 border">
                        <label className="form-label small fw-bold text-muted mb-1 d-flex align-items-center gap-1">
                            <Lightbulb size={14} className="text-primary"/> Tipo de Focos
                        </label>
                        <input type="text" className="form-control form-control-sm border-0 bg-white shadow-sm" placeholder="Ej: H11 LED" value={formData.focos_tipo || ''} onChange={e => updateField('focos_tipo', e.target.value)} />
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="bg-light p-2 rounded-3 border">
                        <label className="form-label small fw-bold text-muted mb-1 d-flex align-items-center gap-1">
                            <Thermometer size={14} className="text-primary"/> Anticongelante
                        </label>
                        <input type="text" className="form-control form-control-sm border-0 bg-white shadow-sm" placeholder="Tipo/Color" value={formData.anticongelante_tipo || ''} onChange={e => updateField('anticongelante_tipo', e.target.value)} />
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="bg-light p-2 rounded-3 border">
                        <label className="form-label small fw-bold text-muted mb-1 d-flex align-items-center gap-1">
                            <Zap size={14} className="text-primary"/> Bujías
                        </label>
                        <input type="text" className="form-control form-control-sm border-0 bg-white shadow-sm" placeholder="Iridium" value={formData.bujias_tipo || ''} onChange={e => updateField('bujias_tipo', e.target.value)} />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};