import React from 'react';
import { 
  Download, Car, Info, DollarSign, 
  Calendar, Clock, TrendingUp, ShieldCheck, 
  Wrench, FileCheck, Leaf, CreditCard 
} from 'lucide-react';

export default function ModalResultados({ vehiculo, totales, gastos, onExportCSV }) {
  if (!vehiculo) return null;

  // Utilidades de formato
  const f = (val) => new Intl.NumberFormat('es-MX', { 
    style: 'currency', 
    currency: 'MXN', 
    maximumFractionDigits: 0 
  }).format(val || 0);

  const getStatusColor = (fechaStr) => {
    if (!fechaStr || fechaStr === "0000-00-00" || fechaStr === "---" || fechaStr === "") 
        return 'badge bg-secondary text-white';
    const hoy = new Date();
    const vencimiento = new Date(fechaStr + 'T00:00:00');
    if (isNaN(vencimiento.getTime())) return 'badge bg-secondary text-white';
    
    const diffDays = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'badge bg-danger text-white fw-bold';
    if (diffDays <= 30) return 'badge bg-warning text-dark fw-bold';
    return 'badge bg-success text-white fw-bold';
  };

  const renderFilaFinanciera = (titulo, montoAnual) => {
    const anual = parseFloat(montoAnual) || 0;
    return (
      <tr key={titulo} className="align-middle">
        <td className="ps-3 py-2 fw-medium text-dark" style={{ fontSize: '0.8rem' }}>{titulo}</td>
        <td className="text-end py-2 text-muted" style={{ fontSize: '0.75rem' }}>{f(anual / 365)}</td>
        <td className="text-end py-2 text-muted" style={{ fontSize: '0.75rem' }}>{f(anual / 52)}</td>
        <td className="text-end py-2 text-muted" style={{ fontSize: '0.75rem' }}>{f(anual / 12)}</td>
        <td className="text-end pe-3 py-2 fw-bold text-dark" style={{ fontSize: '0.8rem' }}>{f(anual)}</td>
      </tr>
    );
  };

  return (
    <div className="modal fade" id="modalResultados" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          
          <div className="modal-header bg-dark text-white border-0 p-4">
            <div className="d-flex align-items-center gap-4">
              <div className="bg-primary p-3 rounded-4 shadow-sm">
                <Car size={32} className="text-white" />
              </div>
              <div>
                <h4 className="fw-bold mb-1 text-uppercase">{vehiculo.unidad_nombre}</h4>
                <div className="d-flex flex-wrap gap-2">
                  <span className="badge bg-white bg-opacity-10 border border-white border-opacity-25">PLACAS: {vehiculo.placas}</span>
                  <span className="badge bg-primary text-white">KM ACTUAL: {vehiculo.kilometraje_actual}</span>
                  <span className="badge bg-info text-white">MODELO: {vehiculo.modelo}</span>
                </div>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>

          <div className="modal-body p-4 bg-light">
            <div className="row g-3 mb-4">
              {[
                { label: 'Diaria', val: totales.diario, icon: Clock, color: '#64748b' },
                { label: 'Semanal', val: totales.semanal, icon: TrendingUp, color: '#3b82f6' },
                { label: 'Mensual', val: totales.mensual, icon: Calendar, color: '#10b981' },
                { label: 'Anual Total', val: totales.anual, icon: DollarSign, color: '#0f172a' }
              ].map((item, i) => (
                <div key={i} className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm rounded-4 p-3 text-center bg-white border-top border-4" style={{borderColor: item.color}}>
                    <div className="small text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.6rem' }}>{item.label}</div>
                    <div className="h5 fw-bold mb-0" style={{ color: item.color }}>{f(item.val)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row g-4">
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                  <div className="p-3 bg-white border-bottom d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-0 small text-uppercase text-muted">Análisis Detallado de Costos</h6>
                    <span className="badge bg-light text-dark border">Cifras en MXN</span>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-sm table-hover mb-0">
                      <thead className="table-light">
                        <tr style={{ fontSize: '0.65rem' }}>
                          <th className="ps-3 py-2">CONCEPTO</th>
                          <th className="text-end py-2">DIARIO</th>
                          <th className="text-end py-2">SEMANAL</th>
                          <th className="text-end py-2">MENSUAL</th>
                          <th className="text-end pe-3 py-2">ANUAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {renderFilaFinanciera("Combustible Proyectado", vehiculo.costo_gasolina_anual)}
                        {renderFilaFinanciera("Mantenimiento y Aceite", vehiculo.costo_aceite_anual)}
                        {renderFilaFinanciera("Seguro de Cobertura", vehiculo.costo_seguro_anual)}
                        {renderFilaFinanciera("Neumáticos / Llantas", vehiculo.costo_llantas_anual)}
                        {renderFilaFinanciera("Revalidación y Tenencia", vehiculo.costo_revalidacion_anual)}
                        {renderFilaFinanciera("Gastos Bitácora (Variables)", gastos.reduce((acc, g) => acc + parseFloat(g.monto), 0))}
                        {renderFilaFinanciera("Fondo de Reserva / Ahorro", vehiculo.monto_ahorro_anual)}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                  <div className="p-3 bg-white border-bottom">
                    <h6 className="fw-bold mb-0 small text-uppercase text-muted">Calendario de Obligaciones</h6>
                  </div>
                  <div className="p-0">
                    <ul className="list-group list-group-flush">
                      {[
                        { n: 'Seguro', f: vehiculo.fecha_pago_seguro, icon: ShieldCheck, color: 'text-primary' },
                        { n: 'Próximo Servicio', f: vehiculo.fecha_proximo_mantenimiento, icon: Wrench, color: 'text-warning' },
                        { n: 'Revalidación', f: vehiculo.fecha_pago_revalidacion, icon: FileCheck, color: 'text-danger' },
                        { n: 'Canje de Placas', f: vehiculo.fecha_pago_placas, icon: CreditCard, color: 'text-info' },
                        { n: 'Ecológico', f: vehiculo.fecha_pago_ecologico, icon: Leaf, color: 'text-success' }
                      ].map((item, i) => (
                        <li key={i} className="list-group-item d-flex justify-content-between align-items-center py-3">
                          <div className="d-flex align-items-center">
                            <item.icon size={18} className={`${item.color} me-3`} />
                            <div>
                              <div className="fw-bold small" style={{ fontSize: '0.75rem' }}>{item.n}</div>
                            </div>
                          </div>
                          <span className={getStatusColor(item.f)} style={{ fontSize: '0.7rem' }}>
                            {item.f && item.f !== "0000-00-00" ? item.f : 'No Programado'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer bg-white border-top p-4 d-flex justify-content-between">
            <button type="button" className="btn btn-light rounded-3 fw-bold px-4 border" data-bs-dismiss="modal">
              CERRAR
            </button>
            <button 
              type="button" 
              onClick={() => onExportCSV()} 
              className="btn btn-success rounded-3 fw-bold px-4 d-flex align-items-center gap-2 shadow-sm"
            >
              <Download size={18}/> EXPORTAR EXCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}