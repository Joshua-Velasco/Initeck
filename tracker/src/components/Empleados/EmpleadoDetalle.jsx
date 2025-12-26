import React from 'react';
import { 
  User, DollarSign, MapPin, FileText, 
  TrendingUp, CheckCircle, XCircle, ExternalLink 
} from 'lucide-react';

export default function EmpleadoDetalle({ empleado, colorGuinda }) {
  // Utilidad de formato de moneda
  const f = (val) => new Intl.NumberFormat('es-MX', { 
    style: 'currency', 
    currency: 'MXN', 
    maximumFractionDigits: 0 
  }).format(val || 0);

  // Simulación de datos para el gráfico
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  const ganancias = empleado.ganancias_mensuales || [1200, 1900, 1500, 2100, 1800, 2400];

  return (
    <div className="row g-3 animate__animated animate__fadeIn">
      
      {/* Columna Izquierda: Estadísticas de Rendimiento */}
      <div className="col-md-4">
        <div className="card border-0 shadow-sm p-3 h-100 rounded-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="bg-light p-2 rounded-3">
              <TrendingUp size={18} style={{ color: colorGuinda }} />
            </div>
            <h6 className="text-dark small fw-bold mb-0 text-uppercase">Rendimiento Operativo</h6>
          </div>
          
          <div className="d-flex flex-column gap-3">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
              <span className="small text-muted">Unidad Actual:</span>
              <span className="badge rounded-pill bg-dark px-3">{empleado.unidad_nombre || 'Sin asignar'}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
              <span className="small text-muted">Total Viajes:</span>
              <span className="fw-bold text-dark">{Number(empleado.total_viajes).toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2">
              <span className="small text-muted">Propinas Acum.:</span>
              <span className="fw-bold text-success">{f(empleado.total_propinas)}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="small text-muted">Distancia Total:</span>
              <span className="fw-bold text-primary">{Number(empleado.total_km).toLocaleString()} KM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Columna Central: Gráfico de Barras Estilizado */}
      <div className="col-md-4">
        <div className="card border-0 shadow-sm p-3 h-100 rounded-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="bg-light p-2 rounded-3">
              <DollarSign size={18} style={{ color: colorGuinda }} />
            </div>
            <h6 className="text-dark small fw-bold mb-0 text-uppercase">Ingresos (6 Meses)</h6>
          </div>
          
          <div className="d-flex align-items-end justify-content-between mt-3" style={{ height: '120px' }}>
            {ganancias.map((valor, idx) => (
              <div key={idx} className="d-flex flex-column align-items-center" style={{ width: '14%' }}>
                <div 
                  className="rounded-top-2 w-100 transition-all" 
                  style={{ 
                    height: `${(valor / Math.max(...ganancias)) * 100}%`, 
                    backgroundColor: colorGuinda,
                    opacity: 0.85,
                    minHeight: '4px'
                  }}
                  title={`$${valor}`}
                ></div>
                <span className="text-muted mt-2" style={{ fontSize: '9px', fontWeight: 'bold' }}>
                  {meses[idx]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Columna Derecha: Documentación con Estado Visual */}
      <div className="col-md-4">
        <div className="card border-0 shadow-sm p-3 h-100 rounded-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="bg-light p-2 rounded-3">
              <FileText size={18} style={{ color: colorGuinda }} />
            </div>
            <h6 className="text-dark small fw-bold mb-0 text-uppercase">Expediente Digital</h6>
          </div>
          
          <div className="d-grid gap-2">
            {[
              { label: 'Licencia de Manejo', url: empleado.licencia_archivo },
              { label: 'INE (Identificación)', url: empleado.ine_archivo }
            ].map((doc, i) => (
              <div key={i} className="p-2 border rounded-3 d-flex align-items-center justify-content-between bg-white">
                <div className="d-flex align-items-center gap-2">
                  {doc.url ? (
                    <CheckCircle size={16} className="text-success" />
                  ) : (
                    <XCircle size={16} className="text-danger" />
                  )}
                  <span className="small fw-medium text-dark">{doc.label}</span>
                </div>
                {doc.url && (
                  <a 
                    href={`http://inimovil.free.nf/uploads/${doc.url}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-sm btn-light p-1 rounded-2 border"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-auto">
            <div className="alert alert-secondary py-1 px-2 mb-0 border-0 text-center" style={{ fontSize: '10px' }}>
              Fecha de ingreso: <strong>{empleado.fecha_ingreso || '---'}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}