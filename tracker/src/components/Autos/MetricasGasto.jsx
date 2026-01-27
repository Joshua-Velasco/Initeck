import React from 'react';
import { Clock, TrendingUp, Calendar, DollarSign, ArrowUpRight } from 'lucide-react';

const MetricasGasto = ({ totales }) => {
  const f = (val, digits = 0) => new Intl.NumberFormat('es-MX', { 
    style: 'currency', 
    currency: 'MXN', 
    maximumFractionDigits: digits 
  }).format(val || 0);

  const items = [
    { label: 'Proporción Diaria', val: totales.diario, icon: Clock, color: '#6366f1', pct: '+0.5%' },
    { label: 'Costo Semanal', val: totales.semanal, icon: TrendingUp, color: '#3b82f6', pct: '-1.2%' },
    { label: 'Proyección Mensual', val: totales.mensual, icon: Calendar, color: '#10b981', pct: '+2.4%' },
    { label: 'PRESUPUESTO ANUAL', val: totales.anual, icon: DollarSign, color: '#f59e0b', pct: 'FY2025', isMain: true }
  ];

  return (
    <div className="row g-3 mb-4 animate__animated animate__fadeIn">
      {items.map((item, i) => (
        <div key={i} className="col-6 col-xl-3">
          <div className={`card border-0 shadow-lg rounded-4 overflow-hidden ${item.isMain ? 'bg-dark text-white' : 'bg-white'}`} 
               style={{ 
                 transition: 'transform 0.2s',
                 borderLeft: `5px solid ${item.color}`
               }}>
            <div className="card-body p-3 p-lg-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className={`p-2 rounded-3 ${item.isMain ? 'bg-warning bg-opacity-10' : 'bg-light'}`}>
                  <item.icon size={20} style={{ color: item.color }} />
                </div>
                <span className={`badge ${item.isMain ? 'bg-warning text-dark' : 'bg-light text-secondary'} rounded-pill`} 
                      style={{ fontSize: '0.6rem' }}>
                  {item.pct}
                </span>
              </div>

              <div>
                <p className={`text-uppercase fw-bold mb-1 tracking-wider ${item.isMain ? 'text-secondary' : 'text-muted'}`} 
                   style={{ fontSize: '0.65rem' }}>
                  {item.label}
                </p>
                <h3 className={`fw-bolder mb-0 ${item.isMain ? 'display-6 text-warning' : 'text-dark'}`} 
                    style={{ fontSize: item.isMain ? '1.8rem' : '1.4rem' }}>
                  {item.isMain ? f(item.val) : f(item.val, 0)}
                </h3>
              </div>
              
              {/* Indicador visual de trading inferior */}
              <div className="mt-3 d-flex align-items-center gap-1">
                <div className="progress flex-grow-1" style={{ height: '4px', backgroundColor: item.isMain ? '#333' : '#f0f0f0' }}>
                  <div className="progress-bar" 
                       style={{ 
                         width: '70%', 
                         backgroundColor: item.color,
                         boxShadow: `0 0 10px ${item.color}` 
                       }}></div>
                </div>
                <ArrowUpRight size={12} className={item.isMain ? 'text-warning' : 'text-success'} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricasGasto;