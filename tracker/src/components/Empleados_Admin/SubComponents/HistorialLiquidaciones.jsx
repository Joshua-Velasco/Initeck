import React from 'react';
import { DollarSign, TrendingUp, Clock, User, Calendar, ArrowUpRight } from 'lucide-react';

export default function HistorialLiquidaciones({ liquidaciones = [], colorGuinda = "#800020" }) {
  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  };

  const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalDia = () => {
    return liquidaciones.reduce((total, liquidacion) => {
      const efectivo = parseFloat(liquidacion.monto || 0);
      const propinas = parseFloat(liquidacion.propinas || 0);
      return total + efectivo + propinas;
    }, 0);
  };

  return (
    <div className="bg-white rounded-4 shadow-sm overflow-hidden">
      {/* Header con resumen del día */}
      <div className="p-3 border-bottom bg-light">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0 fw-bold text-dark">
            <DollarSign size={16} className="me-2 text-success" />
            Liquidaciones del Turno
          </h6>
          <div className="text-end">
            <div className="small text-muted">Total del turno</div>
            <div className="h6 mb-0 fw-bold text-success">
              {formatearMoneda(getTotalDia())}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de liquidaciones */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {liquidaciones.length > 0 ? (
          liquidaciones.map((liquidacion, idx) => (
            <div
              key={liquidacion.id || idx}
              className="p-3 border-bottom hover-light transition-all cursor-pointer"
              style={{
                borderLeft: `4px solid ${liquidacion.tipo === 'bono' ? '#28a745' : colorGuinda}`,
                backgroundColor: idx % 2 === 0 ? '#f8f9fa' : 'white'
              }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <User size={14} className="text-muted" />
                    <span className="fw-bold" style={{ fontSize: '13px' }}>
                      {liquidacion.empleado?.split(' ')[0] || liquidacion.nombre_empleado?.split(' ')[0] || 'Empleado'}
                    </span>
                    {liquidacion.tipo === 'bono' && (
                      <span className="badge bg-success bg-opacity-10 text-success" style={{ fontSize: '9px' }}>
                        BONO
                      </span>
                    )}
                    {liquidacion.tipo === 'descuento' && (
                      <span className="badge bg-danger bg-opacity-10 text-danger" style={{ fontSize: '9px' }}>
                        DESCUENTO
                      </span>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-3 text-muted small">
                    {liquidacion.viajes_count && (
                      <div className="d-flex align-items-center gap-1">
                        <TrendingUp size={12} />
                        <span>{liquidacion.viajes_count} viajes</span>
                      </div>
                    )}
                    {liquidacion.horas_trabajadas && (
                      <div className="d-flex align-items-center gap-1">
                        <Clock size={12} />
                        <span>{liquidacion.horas_trabajadas}</span>
                      </div>
                    )}
                  </div>

                  {liquidacion.concepto && (
                    <div className="mt-2 small text-muted">
                      <em>"{liquidacion.concepto}"</em>
                    </div>
                  )}
                </div>

                <div className="text-end ms-3">
                  <div className={`fw-bold ${liquidacion.tipo === 'descuento' ? 'text-danger' : 'text-success'}`}
                    style={{ fontSize: '16px' }}>
                    {liquidacion.tipo === 'descuento' ? '-' : '+'}
                    {formatearMoneda(parseFloat(liquidacion.monto || 0) + parseFloat(liquidacion.propinas || 0))}
                  </div>
                  {(parseFloat(liquidacion.propinas || 0) > 0) && (
                    <div className="text-secondary small text-end" style={{ fontSize: '9px' }}>
                      (Inc. {formatearMoneda(liquidacion.propinas)} propinas)
                    </div>
                  )}
                  {liquidacion.estado && (
                    <div className="small">
                      <span className={`badge bg-light text-dark ${liquidacion.estado === 'pagado' ? 'text-success' :
                        liquidacion.estado === 'pendiente' ? 'text-warning' : 'text-muted'
                        }`} style={{ fontSize: '8px' }}>
                        {liquidacion.estado.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-muted">
            <DollarSign size={48} className="opacity-25 mb-3" />
            <p className="mb-0">Sin liquidaciones registradas hoy</p>
            <small>Las liquidaciones aparecerán aquí en tiempo real</small>
          </div>
        )}
      </div>

      {/* Footer con estadísticas */}
      {liquidaciones.length > 0 && (
        <div className="p-3 bg-light border-top">
          <div className="row g-2 text-center">
            <div className="col-4">
              <div className="small text-muted">Liquidaciones</div>
              <div className="fw-bold">{liquidaciones.length}</div>
            </div>
            <div className="col-4">
              <div className="small text-muted">Promedio</div>
              <div className="fw-bold">
                {formatearMoneda(getTotalDia() / liquidaciones.length)}
              </div>
            </div>
            <div className="col-4">
              <div className="small text-muted">Empleados</div>
              <div className="fw-bold">
                {new Set(liquidaciones.map(l => l.empleado_id)).size}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
