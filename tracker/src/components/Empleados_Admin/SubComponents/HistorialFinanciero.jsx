import React, { useState, useEffect, useCallback } from 'react';
import { Clock, ChevronDown, ChevronUp, Gauge, Image as ImageIcon, Loader2, Calendar, Receipt, DollarSign } from 'lucide-react';
import { buildUploadUrl, EMPLEADOS_HISTORIAL_URL } from '../../../config.js';


const HistorialFinanciero = ({ empleado, fechas }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // URL base para las imágenes guardadas en el servidor
  const BASE_URL = buildUploadUrl();

  const fetchHistorial = useCallback(async () => {
    if (!empleado?.id) return;
    setLoading(true);
    try {
      // Usar fecha inicio/fin en lugar de fecha única
      const response = await fetch(`${EMPLEADOS_HISTORIAL_URL}?empleado_id=${empleado.id}&fecha_inicio=${fechas.inicio}&fecha_fin=${fechas.fin}`);
      const result = await response.json();
      if (result.status === 'success') {
        setHistorial(result.data);
      } else {
        setHistorial([]);
      }
    } catch (error) {
      console.error("Error al obtener historial financiero:", error);
      setHistorial([]);
    } finally {
      setLoading(false);
    }
  }, [empleado?.id, fechas.inicio, fechas.fin]);

  useEffect(() => {
    fetchHistorial();
  }, [empleado?.id, fechas.inicio, fechas.fin, fetchHistorial]);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  // Función para resolver la ruta de la imagen con mejor manejo de errores
  const resolveImg = (path) => {
    // Si el path no existe o no es un texto, devolver null
    if (!path || typeof path !== 'string') {
      console.warn("resolveImg: Path inválido", { path, type: typeof path });
      return null;
    }

    // Si ya es una URL completa o Base64, devolver tal cual
    if (path.includes('data:image') || path.includes('http')) {
      return path;
    }

    // Si es solo el nombre del archivo, añadir la URL del servidor
    const fullUrl = `${BASE_URL}${path}`;
    console.log("resolveImg: URL generada", fullUrl);
    return fullUrl;
  };



  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 animate__animated animate__fadeIn">
      <div className="bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
        <h6 className="fw-bold mb-0 text-secondary d-flex align-items-center">
          <Clock size={18} className="me-2 text-warning" /> Historial Financiero
        </h6>

        <div className="d-flex align-items-center gap-2 bg-light px-2 py-1 rounded-3">
          <Calendar size={14} className="text-muted" />
          <span className="text-muted fw-bold small">
            {fechas?.inicio === fechas?.fin ? fechas.inicio : `${fechas.inicio} / ${fechas.fin}`}
          </span>
        </div>
      </div>

      <div className="card-body p-3" style={{ maxHeight: '600px', overflowY: 'auto' }}>
        {loading ? (
          <div className="text-center py-5">
            <Loader2 className="animate-spin text-warning mx-auto" size={30} />
            <p className="text-muted small mt-2">Cargando registros...</p>
          </div>
        ) : historial.length === 0 ? (
          <div className="text-center py-5 border border-dashed rounded-4">
            <p className="text-muted mb-0 small">No hay registros financieros en esta fecha.</p>
          </div>
        ) : (
          <>


            {/* Lista detallada */}
            {historial.map((item) => {
              const montoNeto = parseFloat(item.neto_entregado) || 0;
              const montoGastos = parseFloat(item.gastos_total) || 0;
              const montoBruto = parseFloat(item.monto_efectivo) || 0;
              const isExpanded = expandedId === item.id;

              // Determinar tipo de registro
              const esSoloGasto = montoBruto === 0 && montoGastos > 0;

              let listaDetalles = [];
              try {
                const parsed = typeof item.detalles_gastos === 'string'
                  ? JSON.parse(item.detalles_gastos)
                  : item.detalles_gastos;
                listaDetalles = Array.isArray(parsed) ? parsed : [parsed];
              } catch { listaDetalles = []; }

              return (
                <div key={item.id} className="mb-3 shadow-sm rounded-4 overflow-hidden border border-light">
                  <div
                    onClick={() => toggleExpand(item.id)}
                    className={`d-flex justify-content-between align-items-center p-3 transition-all ${isExpanded ? 'bg-white' : 'bg-light'}`}
                    style={{ cursor: 'pointer', borderLeft: `5px solid ${esSoloGasto ? '#ffc107' : '#198754'}` }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className={`p-2 rounded-circle ${esSoloGasto ? 'bg-warning-subtle text-warning' : 'bg-success-subtle text-success'}`}>
                        {esSoloGasto ? <Receipt size={20} /> : <DollarSign size={20} />}
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold text-dark small">{esSoloGasto ? 'GASTO' : 'LIQUIDACIÓN'} #{item.id}</span>
                          <span className="text-muted" style={{ fontSize: '11px' }}>{item.hora}</span>
                        </div>
                        <div className="small text-secondary fw-medium">
                          {esSoloGasto ? (listaDetalles[0]?.tipo || 'Gasto Operativo') : `${item.viajes} Viajes registrados`}
                        </div>
                      </div>
                    </div>

                    <div className="text-end d-flex align-items-center gap-3">
                      <div>
                        <div className={`${esSoloGasto ? 'text-dark' : 'text-success'} fw-bold`} style={{ fontSize: '1.1rem' }}>
                          ${esSoloGasto ? montoGastos.toFixed(2) : montoNeto.toFixed(2)}
                        </div>
                        {!esSoloGasto && montoGastos > 0 && (
                          <div className="text-danger fw-bold" style={{ fontSize: '10px' }}>
                            Gastos: -${montoGastos.toFixed(2)}
                          </div>
                        )}
                      </div>
                      {isExpanded ? <ChevronUp size={18} className="text-muted" /> : <ChevronDown size={18} className="text-muted" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-3 bg-white border-top animate__animated animate__fadeIn">
                      <div className="row g-3">
                        {/* Resumen de Montos (Solo si no es solo gasto) */}
                        {!esSoloGasto && (
                          <>
                            <div className="col-12 col-sm-4 text-center border-bottom border-sm-0 border-end-sm pb-2 pb-sm-0">
                              <p className="text-muted mb-0" style={{ fontSize: '9px' }}>BRUTO</p>
                              <span className="fw-bold small">${montoBruto.toFixed(2)}</span>
                            </div>
                            <div className="col-6 col-sm-4 text-center border-end pt-2 pt-sm-0">
                              <p className="text-muted mb-0" style={{ fontSize: '9px' }}>PROPINAS</p>
                              <span className="fw-bold small">${(parseFloat(item.propinas) || 0).toFixed(2)}</span>
                            </div>
                            <div className="col-6 col-sm-4 text-center pt-2 pt-sm-0">
                              <p className="text-success mb-0" style={{ fontSize: '9px' }}>A ENTREGAR</p>
                              <span className="fw-bold text-success small">${montoNeto.toFixed(2)}</span>
                            </div>
                          </>
                        )}

                        {/* Detalles de Gastos / Fotos */}
                        {listaDetalles.length > 0 && listaDetalles.map((gasto, idx) => (
                          <div key={idx} className="col-12">
                            <div className="bg-light p-3 rounded-4 border">
                              <h6 className="fw-bold mb-2 text-uppercase text-secondary d-flex align-items-center" style={{ fontSize: '11px' }}>
                                <ImageIcon size={14} className="me-2 text-warning" />
                                Evidencia: {gasto.tipo} ${parseFloat(gasto.monto).toFixed(2)}
                              </h6>

                              {gasto.tipo === 'Otros' && gasto.motivo && (
                                <div className="mb-2 small text-dark fw-medium fst-italic">
                                  Motivo: {gasto.motivo}
                                </div>
                              )}

                              {gasto.odometro > 0 && (
                                <div className="mb-2 small d-flex align-items-center text-muted">
                                  <Gauge size={14} className="me-1" />
                                  KM registrado: <span className="fw-bold ms-1 text-dark">{gasto.odometro}</span>
                                </div>
                              )}

                              <div className="row g-2">
                                {gasto.foto_ticket && (
                                  <div className="col-6 text-center">
                                    <label className="d-block text-muted mb-1" style={{ fontSize: '9px' }}>TICKET / RECIBO</label>
                                    <img
                                      src={resolveImg(gasto.foto_ticket)}
                                      className="img-fluid rounded-3 border bg-white shadow-sm"
                                      style={{ minHeight: '100px', width: '100%', objectFit: 'contain', display: 'block' }}
                                      alt="Ticket"
                                      onError={(e) => {
                                        console.error("No se pudo cargar la imagen en:", e.target.src);
                                        e.target.src = 'https://placehold.co/400x400?text=Error+al+cargar+foto';
                                      }}
                                    />
                                  </div>
                                )}

                                {gasto.foto_tablero && (
                                  <div className="col-6 text-center">
                                    <label className="d-block text-muted mb-1" style={{ fontSize: '9px' }}>TABLERO / KM</label>
                                    <img
                                      src={resolveImg(gasto.foto_tablero)}
                                      className="img-fluid rounded-3 border bg-white shadow-sm"
                                      style={{ minHeight: '100px', width: '100%', objectFit: 'contain', display: 'block' }}
                                      alt="Tablero"
                                      onError={(e) => {
                                        console.error("No se pudo cargar la imagen en:", e.target.src);
                                        e.target.src = 'https://placehold.co/400x400?text=Error+al+cargar+foto';
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Firma al final */}
                        {item.firma_path && (
                          <div className="col-12 mt-2 text-center border-top pt-3">
                            <p className="text-muted mb-1" style={{ fontSize: '10px', letterSpacing: '1px' }}>FIRMA DIGITAL DEL EMPLEADO</p>
                            <img
                              src={resolveImg(item.firma_path)}
                              alt="Firma"
                              style={{ maxHeight: '60px', filter: 'contrast(1.2)' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default HistorialFinanciero;
