import React from 'react';
import { 
  Gauge, Settings, Activity, Fuel, Calendar, 
  MapPin, Hash, Zap, Droplet, Thermometer, Disc
} from 'lucide-react';
import { BadgeEstado } from './BadgeEstado';

export const TarjetaAuto = ({ vehiculo }) => {
  if (!vehiculo) return null;

  const fmtKm = (val) => Number(val || 0).toLocaleString();

  return (
    <div className="card border-0 shadow-lg rounded-4 bg-white mb-4 overflow-hidden">
      {/* 1. CABECERA PRINCIPAL */}
      <div className="p-4 border-bottom bg-light bg-opacity-50">
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center">
            <div className="p-3 bg-dark rounded-4 me-3 shadow-sm">
              <Gauge size={32} className="text-primary" />
            </div>
            <div>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <h3 className="fw-bolder mb-0 text-dark tracking-tighter">
                  {vehiculo.unidad_nombre}
                </h3>
                <BadgeEstado estado={vehiculo.estado} />
              </div>
              <div className="d-flex align-items-center gap-3 mt-1">
                <div className="d-flex align-items-center gap-1 text-secondary">
                  <Hash size={14} />
                  <span className="fw-bold text-dark bg-warning bg-opacity-10 px-2 rounded small" style={{ border: '1px solid #ffc10744' }}>
                    {vehiculo.placas || 'S/P'}
                  </span>
                </div>
                <span className="text-secondary opacity-25">|</span>
                <div className="d-flex align-items-center gap-1">
                  <MapPin size={14} className="text-primary" />
                  <span className="fw-bold text-primary small">
                    {fmtKm(vehiculo.kilometraje_actual)} {vehiculo.unidad_medida}
                  </span>
                </div>
              </div>
              {vehiculo.numero_serie && (
                <div className="d-flex align-items-center gap-1 mt-1">
                  <span className="text-muted small">
                    <strong>VIN:</strong> 
                    <span className="font-monospace bg-light px-2 py-1 rounded ms-1">
                      {vehiculo.numero_serie}
                    </span>
                  </span>
                </div>
              )}
              {vehiculo.tipo_unidad && (
                <div className="d-flex align-items-center gap-1 mt-1">
                  <span className="text-muted small">
                    <strong>Tipo:</strong> 
                    <span className="badge bg-secondary bg-opacity-10 text-secondary px-2 py-1 rounded-pill ms-1">
                      {vehiculo.tipo_unidad}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <button 
            className="btn btn-dark rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2" 
            data-bs-toggle="modal" 
            data-bs-target="#modalEdicion"
          >
            <Settings size={18} /> GESTIONAR UNIDAD
          </button>
        </div>
      </div>

      <div className="card-body p-4">
        {/* 2. FICHA TÉCNICA EXPANDIDA (Icono de fondo eliminado) */}
        <div className="p-4 rounded-4 bg-light border-0">
          <h6 className="fw-bolder mb-4 text-uppercase tracking-widest text-secondary d-flex align-items-center gap-2" style={{ fontSize: '0.75rem' }}>
            <Activity size={18} className="text-primary" /> Especificaciones de la Unidad
          </h6>
          
          <div className="row g-4">
            {[
              { label: "TIPO DE MOTOR", val: vehiculo.motor_tipo, icon: <Zap size={14}/> },
              { label: "TIPO DE ACEITE", val: vehiculo.aceite_tipo, icon: <Droplet size={14}/>, color: "primary fw-bold" },
              { label: "FILTRO DE ACEITE", val: vehiculo.filtro_aceite, icon: <Disc size={14}/> },
              { label: "ANTICONGELANTE", val: vehiculo.anticongelante_tipo, icon: <Thermometer size={14}/> },
              { label: "MEDIDA LLANTAS", val: vehiculo.llantas_medida, icon: <Disc size={14}/> },
              { label: "TIPO DE FOCOS", val: vehiculo.focos_tipo, icon: <Zap size={14}/> },
              { label: "BUJÍAS", val: vehiculo.bujias_tipo, icon: <Zap size={14}/> }
            ].map((item, i) => (
              <div key={i} className="col-6 col-md-4 col-xl-3">
                <div className="d-flex flex-column">
                  <label className="text-muted text-uppercase mb-1 d-flex align-items-center gap-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                    {item.icon} {item.label}
                  </label>
                  <span className={`text-${item.color || 'dark'} fw-semibold`} style={{ fontSize: '0.95rem' }}>
                    {item.val || 'NO REGISTRADO'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. FOOTER */}
      <div className="px-4 py-3 bg-dark d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-4">
          <div className="d-flex align-items-center gap-2 text-white">
            <Fuel size={18} className="text-warning" />
            <span style={{ fontSize: '0.85rem' }}>Consumo Promedio: <strong className="text-warning">{vehiculo.rendimiento_gasolina || '0'} km/L</strong></span>
          </div>
          <div className="d-flex align-items-center gap-2 text-white border-start border-secondary ps-4 border-opacity-50">
            <Calendar size={18} className="text-info" />
            <span style={{ fontSize: '0.85rem' }}>Próximo Servicio: <strong className="text-info">{vehiculo.fecha_proximo_mantenimiento || 'PENDIENTE'}</strong></span>
          </div>
        </div>
        
        <div className="text-white-50 small font-monospace d-none d-lg-block" style={{ fontSize: '0.7rem' }}>
          FLEET_MANAGEMENT_SYSTEM // ID_{vehiculo.id || 'N/A'}
        </div>
      </div>
    </div>
  );
};

export default TarjetaAuto;