import React from 'react';
import { Clock, TrendingUp, Calendar, DollarSign, CheckCircle, AlertCircle, PiggyBank } from 'lucide-react';

const MetricasTarjetas = ({ totales }) => {
  const f = (val, dec = 0) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: dec
    }).format(val || 0);

  const restante = (totales.proyectado || 0) - (totales.gastadoReal || 0);

  const items = [
    { label: 'PAGO ANUAL',            val: totales.proyectado, icon: DollarSign, color: '#000000', isMain: true },
    { label: 'PAGO POR SEMANA',       val: totales.semanal,    icon: Clock,      color: '#8b5cf6' },
    { label: 'PAGO POR MES',          val: totales.mensual,    icon: Calendar,   color: '#3b82f6' },
    { label: 'PRESUPUESTO RESTANTE',  val: restante,           icon: PiggyBank,  color: restante >= 0 ? '#10b981' : '#ef4444' },
  ];

  return (
    <div className="row g-2 mb-3">
      {items.map((item, i) => (
        <div key={i} className="col-6 col-xl-3">
          <div 
            className={`card h-100 border-0 shadow-sm rounded-4 overflow-hidden ${item.isMain ? 'bg-dark text-white' : 'bg-white'}`}
            style={{ 
              borderBottom: `4px solid ${item.color}`,
              transition: 'transform 0.2s'
            }}
          >
            <div className="card-body p-2 p-md-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className={`text-uppercase fw-bold tracking-widest ${item.isMain ? 'text-secondary' : 'text-muted'}`} 
                      style={{ fontSize: '0.6rem' }}>
                  {item.label}
                </span>
                <div className={`p-1 rounded-3 ${item.isMain ? 'bg-white bg-opacity-10' : 'bg-light'}`}>
                  <item.icon size={14} style={{ color: item.isMain ? '#fff' : item.color }} />
                </div>
              </div>

              <div className="mt-1">
                <h3 className={`fw-bolder mb-0 ${item.isMain ? 'text-warning' : 'text-dark'}`} 
                    style={{ 
                      fontSize: item.isMain ? '1.5rem' : '1.2rem', 
                      letterSpacing: '-0.5px' 
                    }}>
                  {item.isMain ? f(item.val) : f(item.val, 0)}
                </h3>
                {!item.isMain && (
                  <span className="text-muted small" style={{ fontSize: '0.65rem' }}>
                    Calculado {new Date().getFullYear()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricasTarjetas;