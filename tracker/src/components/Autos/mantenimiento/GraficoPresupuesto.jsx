import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export default function GraficoPresupuesto({ vehiculo, mantenimientos }) {
  // Año en curso
  const currentYear = new Date().getFullYear();

  // Categorías de mantenimiento y sus campos de costo correspondientes en VEHICULO (presupuesto)
  // Basado en campos encontrados en vehiculos.php
  const CATEGORIAS = {
    // Specific maintenance types first to avoid keyword collisions
    'Seguro': { field: 'costo_seguro_anual', label: 'Seguro', keywords: ['seguro', 'póliza'] },
    'Trámites (Placas/Tenencia)': { field: 'costo_placas_anual', label: 'Placas/Tenencia', keywords: ['placa', 'tenencia', 'derechos'] },
    'Verificación Ecológica': { field: 'costo_ecologico_anual', label: 'Ecológico', keywords: ['ecológico', 'verificación', 'emisiones'] },
    
    // Maintenance higher priority than Fuel
    'Aceite': { field: 'costo_aceite_anual', label: 'Aceite', keywords: ['aceite'] },
    'Tune Up': { field: 'costo_tuneup_anual', label: 'Tune Up', keywords: ['tune', 'afinación'] },
    'Frenos': { field: 'costo_frenos_anual', label: 'Frenos', keywords: ['freno', 'balata', 'disco', 'rectificado'] },
    'Llantas': { field: 'costo_llantas_anual', label: 'Llantas', keywords: ['llanta', 'neumático', 'rotación', 'alineación', 'balanceo'] },
    'Lavado': { field: 'costo_lavado_anual', label: 'Lavado', keywords: ['lavado', 'limpieza', 'detail'] },
    
    // Fuel and General catch-alls last
    'Combustible': { field: 'costo_gasolina_anual', label: 'Gasolina', keywords: ['gasolina', 'diesel', 'combustible'] },
    'Servicio General': { field: 'costo_servicio_general_anual', label: 'Servicio Gral.', keywords: ['servicio', 'mantenimiento'] },
    'Otro': { field: null, label: 'Otros', keywords: [] }
  };

  const datos = useMemo(() => {
    if (!vehiculo) return [];

    // Agrupar gastos reales por tipo en el AÑO ACTUAL
    const gastosReales = {};
    
    // Inicializar gastos en 0
    Object.keys(CATEGORIAS).forEach(k => gastosReales[k] = 0);

    mantenimientos.forEach(m => {
      const fechaManto = new Date(m.fecha);
      if (fechaManto.getFullYear() !== currentYear) return;

      let categoriaFound = 'Otro';
      const tipo = (m.tipo || '') + ' ' + (m.descripcion || '');
      const tipoLower = tipo.toLowerCase();

      // Buscar categoría coincidente
      for (const [key, config] of Object.entries(CATEGORIAS)) {
        if (key === 'Otro') continue;
        if (config.keywords.some(kw => tipoLower.includes(kw))) {
            categoriaFound = key;
            break;
        }
      }

      gastosReales[categoriaFound] = (gastosReales[categoriaFound] || 0) + parseFloat(m.costo_total || 0);
    });

    // Construir array final
    return Object.entries(CATEGORIAS).map(([key, config]) => {
      // Presupuesto desde el vehículo
      const presupuesto = config.field ? parseFloat(vehiculo[config.field] || 0) : 0;
      const gastado = gastosReales[key] || 0;
      const restante = presupuesto - gastado;
      const porcentaje = presupuesto > 0 ? (gastado / presupuesto) * 100 : 0;

      return {
        categoria: config.label,
        presupuesto,
        gastado,
        restante,
        porcentaje: Math.min(porcentaje, 100),
        excedido: gastado > presupuesto && presupuesto > 0
      };
    }).filter(d => d.presupuesto > 0 || d.gastado > 0); // Solo mostrar si hay presupuesto o gasto

  }, [vehiculo, mantenimientos, currentYear]);

  if (!vehiculo) return null;

  return (
    <div className="card border-0 shadow-sm bg-white mb-4 animate__animated animate__fadeInUp" style={{ borderRadius: '24px' }}>
      <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0">
        <h6 className="fw-extrabold mb-0 d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
          <div className="p-2 rounded-3 bg-light"><TrendingUp size={20} className="text-success" /></div>
          Control Presupuestal {currentYear}
        </h6>
      </div>
      <div className="p-4">
        <div className="row g-4">
          {datos.map((d, i) => (
            <div key={i} className="col-md-6 col-lg-4">
              <div className="p-3 bg-light rounded-4 h-100 border-0 transition-all hover-lift" style={{ border: '1px solid rgba(0,0,0,0.02)' }}>
                <div className="mb-2 d-flex justify-content-between align-items-end">
                  <span className="fw-bold text-dark">{d.categoria}</span>
                  <span className={`small fw-bold px-2 py-1 rounded-pill ${d.excedido ? 'bg-danger bg-opacity-10 text-danger' : 'bg-success bg-opacity-10 text-success'}`}>
                    {d.excedido ? 'Excedido' : `${Math.round(d.porcentaje)}%`}
                  </span>
                </div>
                <div className="progress mb-3" style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius:'10px' }}>
                  <div 
                    className={`progress-bar rounded-pill ${d.excedido ? 'bg-danger' : 'bg-primary'}`} 
                    role="progressbar" 
                    style={{ width: `${d.porcentaje}%`, transition: 'width 1s ease' }} 
                  />
                </div>
                <div className="d-flex justify-content-between small text-muted">
                  <span className="d-flex flex-column">
                     <span style={{fontSize:'0.7rem'}}>GASTADO</span>
                     <strong className="text-dark">${d.gastado.toLocaleString()}</strong>
                  </span>
                  <span className="d-flex flex-column text-end">
                     <span style={{fontSize:'0.7rem'}}>PRESUPUESTO</span>
                     <strong className="text-dark">${d.presupuesto.toLocaleString()}</strong>
                  </span>
                </div>
                {!d.excedido && d.presupuesto > 0 && (
                   <div className="mt-2 pt-2 border-top text-center text-success small fw-bold d-flex align-items-center justify-content-center gap-1">
                     <DollarSign size={12}/> Disponible: ${d.restante.toLocaleString()}
                   </div>
                )}
              </div>
            </div>
          ))}
          {datos.length === 0 && (
            <div className="col-12 text-center text-muted small py-4">
              <div className="bg-light rounded-circle p-3 d-inline-block mb-2">
                 <AlertCircle size={24} className="text-muted opacity-50" />
              </div>
              <div>No hay información de presupuestos o gastos para {currentYear}.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
