import React, { useState } from 'react';

export const CalcRow = ({ icon: Icon, label, field, value, onCalculate }) => {
  const formatNumberWithCommas = (num) => {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const [monto, setMonto] = useState(() => {
    if (value && value !== '0' && value !== 0) {
      return formatNumberWithCommas(value.toString());
    }
    return '';
  });
  const [periodo, setPeriodo] = useState("anual");

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
    const cleanMonto = monto.replace(/,/g, '');
    onCalculate(cleanMonto, nuevoPeriodo, field);
  };

  return (
    <div className="col-12 col-md-6 col-lg-4">
      <div className="bg-white p-3 rounded-3 border shadow-sm h-100 transition-all hover-shadow">
        <div className="d-flex flex-column h-100">
          {/* Header con icono y label */}
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="bg-primary bg-opacity-10 p-2 rounded-2 flex-shrink-0">
              {Icon && <Icon size={16} className="text-primary"/>}
            </div>
            <label className="text-muted fw-bold text-truncate mb-0" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
              {label}
            </label>
            <span className="badge bg-light text-dark border-0 py-1 flex-shrink-0" style={{ fontSize: '0.6rem' }}>GASTO</span>
          </div>
          
          {/* Contenido principal */}
          <div className="flex-grow-1 d-flex flex-column justify-content-between">
            {/* Inputs */}
            <div className="row g-2">
              <div className="col-7">
                <div className="input-group">
                  <span className="input-group-text bg-light border-0 p-2 text-muted fw-bold">$</span>
                  <input 
                    type="text" 
                    className="form-control border-0 bg-light shadow-none fw-bold" 
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
                  className="form-select border-0 bg-light shadow-none cursor-pointer fw-semibold" 
                  style={{ fontSize: '0.75rem' }}
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

            {/* Resultado Calculado */}
            <div className="text-end border-top pt-2 mt-2">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted" style={{ fontSize: '0.6rem' }}>ANUAL:</span>
                <span className="fw-bold text-success" style={{fontSize: '0.75rem'}}>
                  ${new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2 }).format(calcularTotalAnual())}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};