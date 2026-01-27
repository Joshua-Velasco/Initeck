import React, { useState } from 'react';

export const CalcRowEditar = ({ icon: Icon, label, field, value, onCalculate, editData }) => {
  const formatNumberWithCommas = (num) => {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Obtener el campo base sin el sufijo _anual
  const campoBase = field;
  const campoMonto = campoBase.replace('_anual', '_monto');
  const campoPeriodo = campoBase.replace('_anual', '_periodo');
  
  // Inicializar con los valores originales de la BD
  const [monto, setMonto] = useState(() => {
    const montoOriginal = editData?.[campoMonto];
    if (montoOriginal && montoOriginal !== '0' && montoOriginal !== 0) {
      return formatNumberWithCommas(montoOriginal.toString());
    }
    // Si no hay monto original, usar el valor anual como fallback
    if (value && value !== '0' && value !== 0) {
      return formatNumberWithCommas(value.toString());
    }
    return '';
  });
  
  const [periodo, setPeriodo] = useState(() => {
    // Usar el período guardado, o fallback a 'anual'
    return editData?.[campoPeriodo] || 'anual';
  });

  // Calcular el total anual basado en el monto y período actuales
  const calcularTotalAnual = () => {
    const cleanValue = monto.toString().replace(/,/g, '');
    const num = Math.max(0, parseFloat(cleanValue) || 0);
    let anual = num;
    if (periodo === 'semanal') anual = num * 52;
    else if (periodo === 'mensual') anual = num * 12;
    else if (periodo === 'cuatrimestral') anual = num * 3;
    else if (periodo === 'semestral') anual = num * 2;
    return anual;
  };

  const handleMontoChange = (e) => {
    const value = e.target.value;
    
    // Permitir solo números y comas (sin punto decimal)
    let cleanValue = value.replace(/[^\d,]/g, '');
    
    // Remover comas existentes para formatear
    const integerPart = cleanValue.replace(/,/g, '');
    
    // Agregar comas cada tres dígitos
    let formattedValue = '';
    if (integerPart) {
      formattedValue = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    setMonto(formattedValue);
    
    // Para el cálculo, limpiar comas
    const numericValue = cleanValue.replace(/,/g, '');
    onCalculate(numericValue, periodo, field);
  };

  const handlePeriodoChange = (e) => {
    const nuevoPeriodo = e.target.value;
    setPeriodo(nuevoPeriodo);
    const cleanMonto = monto.toString().replace(/,/g, '');
    onCalculate(cleanMonto, nuevoPeriodo, field);
  };

  return (
    <div className="col-md-6 col-lg-4 mb-3">
      <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden transition-all hover-shadow bg-white">
        <div className="p-3 d-flex flex-column h-100">
          {/* Header con icono y label */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="bg-primary bg-opacity-10 p-2 rounded-2 flex-shrink-0">
              {Icon && <Icon size={16} className="text-primary" />}
            </div>
            <label className="fw-bold text-truncate mb-0" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
              {label}
            </label>
            <span className="badge bg-light text-dark border-0 py-1 flex-shrink-0" style={{ fontSize: '0.6rem' }}>GASTO</span>
          </div>

          {/* Contenido principal */}
          <div className="flex-grow-1 d-flex flex-column justify-content-between">
            {/* Inputs */}
            <div className="row g-2">
              <div className="col-7">
                <div className="input-group border-bottom border-2">
                  <span className="input-group-text bg-transparent border-0 text-muted fw-bold p-2" style={{ fontSize: '0.7rem' }}>$</span>
                  <input 
                    type="text" 
                    className="form-control border-0 bg-transparent shadow-none fw-bold text-dark" 
                    style={{ fontSize: '0.85rem' }}
                    placeholder="1,234"
                    value={monto} 
                    onChange={handleMontoChange}
                    onFocus={(e) => {
                      // Seleccionar todo el contenido al enfocar
                      e.target.select();
                    }}
                    autoFocus={false}
                  />
                </div>
              </div>
              <div className="col-5">
                <select 
                  className="form-select border-0 bg-light rounded-2 fw-semibold text-muted" 
                  style={{ fontSize: '0.7rem' }}
                  value={periodo} 
                  onChange={handlePeriodoChange}
                >
                  <option value="anual">Anual</option>
                  <option value="semestral">6 meses</option>
                  <option value="cuatrimestral">4 meses</option>
                  <option value="mensual">Mensual</option>
                  <option value="semanal">Semanal</option>
                </select>
              </div>
            </div>

            {/* Footer con el cálculo proyectado */}
            <div className="bg-light bg-opacity-50 px-3 py-2 border-top d-flex justify-content-between align-items-center mt-auto">
              <span className="text-muted fw-bold" style={{ fontSize: '0.55rem' }}>ANUAL ESTIMADO</span>
              <div className="d-flex align-items-center gap-1">
                <span className="text-success small fw-bold">$</span>
                <span className="fw-bolder text-success" style={{ fontSize: '0.75rem' }}>
                  {new Intl.NumberFormat('es-MX', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  }).format(calcularTotalAnual())}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};