import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Clock, Image as ImageIcon, Gauge, Loader2, Receipt, ChevronDown, ChevronUp } from 'lucide-react';
import { EMPLEADO_HISTORIAL, UPLOADS_BASE_URL } from '../../../config';

const HistorialLiquidaciones = ({ user, fechas, onDateChange }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  
  // Si no se pasaron props (por compatibilidad), usar estado local (fallback)
  // Aunque en este caso sabemos que el padre lo pasará.
  // Para simplificar, asumiremos que se llaman 'fechas' y 'onDateChange'
  // Si no existen, podríamos inicializarlos, pero el requerimiento es linkearlos.

  const fetchHistorial = async () => {
    if (!user?.id || !fechas) return;
    setLoading(true);
    try {
      const response = await fetch(`${EMPLEADO_HISTORIAL}?empleado_id=${user.id}&fecha_inicio=${fechas.inicio}&fecha_fin=${fechas.fin}`);
      const result = await response.json();
      if (result.status === 'success') {
        setHistorial(result.data);
      } else {
        setHistorial([]);
      }
    } catch (error) {
      console.error("Error al obtener historial:", error);
      setHistorial([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, [user?.id, fechas]);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  const resolveImg = (path) => {
    if (!path || typeof path !== 'string') return null;
    if (path.includes('data:image')) return path;
    if (path.includes('http') && path.includes(',')) {
      const base64Part = path.substring(path.indexOf('data:image'));
      if (base64Part.startsWith('data:image')) return base64Part;
    }
    if (path.includes('http')) return path;
    return `${UPLOADS_BASE_URL}${path}`;
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4" style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)' }}>
      {/* Header */}
      <div className="p-3 p-md-4 border-bottom" style={{ background: 'linear-gradient(135deg, #800020 0%, #a0002a 100%)' }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h5 className="fw-bold mb-1 text-white d-flex align-items-center">
              <Clock size={20} className="me-2" />
              Mi Actividad
            </h5>
            <p className="mb-0 text-white-50 small">Historial de liquidaciones y gastos</p>
          </div>
          
          <div className="d-flex gap-2 bg-white bg-opacity-20 p-1 rounded-3 backdrop-blur">
             <div className="position-relative">
                <input
                  type="date"
                  className="form-control form-control-sm border-0 bg-white bg-opacity-90 fw-bold text-center"
                  style={{ fontSize: '13px', width: '130px', cursor: 'pointer' }}
                  value={fechas.inicio}
                  onChange={(e) => onDateChange({ ...fechas, inicio: e.target.value })}
                />
             </div>
             <div className="d-flex align-items-center text-white opacity-75">
               <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }}/>
             </div>
             <div className="position-relative">
                <input
                  type="date"
                  className="form-control form-control-sm border-0 bg-white bg-opacity-90 fw-bold text-center"
                  style={{ fontSize: '13px', width: '130px', cursor: 'pointer' }}
                  value={fechas.fin}
                  onChange={(e) => onDateChange({ ...fechas, fin: e.target.value })}
                />
             </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-2 p-md-4" style={{ height: '400px', overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'contain' }}>
        {loading ? (
          <div className="text-center py-5">
            <Loader2 className="animate-spin text-danger mx-auto mb-3" size={40} />
            <p className="text-muted fw-medium">Cargando registros...</p>
          </div>
        ) : historial.length === 0 ? (
          <div className="text-center py-5">
            <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
              <Receipt size={40} className="text-muted" />
            </div>
            <p className="fw-bold text-dark mb-1">No hay registros</p>
            <p className="text-muted small mb-0">No se encontraron transacciones para esta fecha</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {historial.map((item) => {
              const montoNeto = parseFloat(item.neto_entregado) || 0;
              const montoGastos = parseFloat(item.gastos_total) || 0;
              const montoBruto = parseFloat(item.monto_efectivo) || 0;
              const isExpanded = expandedId === item.id;
              const esSoloGasto = montoBruto === 0 && montoGastos > 0;

              let listaDetalles = [];
              try {
                const parsed = typeof item.detalles_gastos === 'string'
                  ? JSON.parse(item.detalles_gastos)
                  : item.detalles_gastos;
                listaDetalles = Array.isArray(parsed) ? parsed : [parsed];
              } catch (e) { listaDetalles = []; }

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-4 shadow-sm border overflow-hidden transition-all"
                  style={{ borderLeft: `4px solid ${esSoloGasto ? '#ffc107' : '#198754'}` }}
                >
                  {/* Card Header */}
                  <div
                    onClick={() => toggleExpand(item.id)}
                    className="p-3 d-flex justify-content-between align-items-center"
                    style={{
                      cursor: 'pointer',
                      background: isExpanded ? '#ffffff' : '#f8f9fa',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className={`p-2 rounded-3 d-flex align-items-center justify-content-center ${esSoloGasto ? 'bg-warning bg-opacity-10' : 'bg-success bg-opacity-10'
                          }`}
                        style={{ width: '44px', height: '44px' }}
                      >
                        {esSoloGasto ? (
                          <Receipt size={22} className="text-warning" />
                        ) : (
                          <DollarSign size={22} className="text-success" />
                        )}
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="fw-bold text-dark" style={{ fontSize: '15px' }}>
                            {esSoloGasto ? 'GASTO' : 'LIQUIDACIÓN'} #{item.id}
                          </span>
                          <span className="badge bg-light text-secondary border" style={{ fontSize: '10px' }}>
                            {item.hora}
                          </span>
                        </div>
                        <p className="mb-0 text-muted small">
                          {esSoloGasto ? (listaDetalles[0]?.tipo || 'Gasto Operativo') : `${item.viajes} viajes registrados`}
                        </p>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <div className="text-end">
                        <div
                          className={`fw-bold ${esSoloGasto ? 'text-warning' : 'text-success'}`}
                          style={{ fontSize: '1.25rem' }}
                        >
                          ${esSoloGasto ? montoGastos.toFixed(2) : montoNeto.toFixed(2)}
                        </div>
                        {!esSoloGasto && montoGastos > 0 && (
                          <div className="text-danger small fw-medium">
                            Gastos: -${montoGastos.toFixed(2)}
                          </div>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-muted" />
                      ) : (
                        <ChevronDown size={20} className="text-muted" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-top bg-white p-4">
                      {/* Summary Row (only for liquidaciones) */}
                      {!esSoloGasto && (() => {
                        const otrosViajes = parseFloat(item.otros_viajes) || 0;
                        const hasOtros = otrosViajes > 0;
                        const colSize = hasOtros ? 'col-3' : 'col-4';
                        return (
                          <div className="row g-3 mb-4">
                            <div className={colSize}>
                              <div className="text-center p-3 bg-light rounded-3">
                                <p className="text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                                  Bruto
                                </p>
                                <span className="fw-bold text-dark" style={{ fontSize: '18px' }}>
                                  ${montoBruto.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <div className={colSize}>
                              <div className="text-center p-3 bg-light rounded-3">
                                <p className="text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                                  Propinas
                                </p>
                                <span className="fw-bold text-dark" style={{ fontSize: '18px' }}>
                                  ${(parseFloat(item.propinas) || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            {hasOtros && (
                              <div className="col-3">
                                <div className="text-center p-3 rounded-3" style={{ background: '#f3e8ff' }}>
                                  <p className="mb-1 text-uppercase fw-bold" style={{ fontSize: '10px', letterSpacing: '0.5px', color: '#7c3aed' }}>
                                    Otros Viajes
                                  </p>
                                  <span className="fw-bold" style={{ fontSize: '18px', color: '#7c3aed' }}>
                                    ${otrosViajes.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            )}
                            <div className={colSize}>
                              <div className="text-center p-3 bg-success bg-opacity-10 rounded-3">
                                <p className="text-success mb-1 text-uppercase fw-bold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                                  Neto
                                </p>
                                <span className="fw-bold text-success" style={{ fontSize: '18px' }}>
                                  ${montoNeto.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Gastos Details */}
                      {listaDetalles.length > 0 && (
                        <div className="d-flex flex-column gap-3">
                          {listaDetalles.map((gasto, idx) => (
                            <div key={idx} className="border rounded-4 overflow-hidden">
                              <div className="bg-light p-3 border-bottom">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="d-flex align-items-center gap-2">
                                    <ImageIcon size={16} className="text-warning" />
                                    <span className="fw-bold text-dark">{gasto.tipo}</span>
                                  </div>
                                  <span className="badge bg-warning text-dark fw-bold">
                                    ${parseFloat(gasto.monto).toFixed(2)}
                                  </span>
                                </div>
                                {gasto.tipo === 'Otros' && gasto.motivo && (
                                  <div className="mt-2 text-dark small fst-italic fw-medium">
                                    Motivo: {gasto.motivo}
                                  </div>
                                )}
                                {gasto.odometro > 0 && (
                                  <div className="mt-2 d-flex align-items-center gap-2 small text-muted">
                                    <Gauge size={14} />
                                    <span>Kilometraje: <strong className="text-dark">{gasto.odometro} km</strong></span>
                                  </div>
                                )}
                              </div>

                              {/* Photos */}
                              <div className="p-3 bg-white">
                                <div className="row g-3">
                                  {gasto.foto_ticket && (
                                    <div className="col-6">
                                      <p className="text-muted mb-2 text-uppercase fw-bold" style={{ fontSize: '10px' }}>
                                        Ticket / Recibo
                                      </p>
                                      <img
                                        src={resolveImg(gasto.foto_ticket)}
                                        className="img-fluid rounded-3 border shadow-sm"
                                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                        alt="Ticket"
                                        onError={(e) => {
                                          e.target.src = 'https://placehold.co/400x400?text=Error+al+cargar';
                                        }}
                                      />
                                    </div>
                                  )}
                                  {gasto.foto_tablero && (
                                    <div className="col-6">
                                      <p className="text-muted mb-2 text-uppercase fw-bold" style={{ fontSize: '10px' }}>
                                        Tablero / KM
                                      </p>
                                      <img
                                        src={resolveImg(gasto.foto_tablero)}
                                        className="img-fluid rounded-3 border shadow-sm"
                                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                        alt="Tablero"
                                        onError={(e) => {
                                          e.target.src = 'https://placehold.co/400x400?text=Error+al+cargar';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Firma */}
                      {item.firma_path && (
                        <div className="mt-4 pt-4 border-top text-center">
                          <p className="text-muted mb-2 text-uppercase fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                            Firma Digital del Empleado
                          </p>
                          <img
                            src={resolveImg(item.firma_path)}
                            alt="Firma"
                            className="rounded-3 border bg-light p-2"
                            style={{ maxHeight: '80px', filter: 'contrast(1.2)' }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialLiquidaciones;