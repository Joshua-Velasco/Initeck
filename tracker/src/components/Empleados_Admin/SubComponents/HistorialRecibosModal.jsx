import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, Loader2, AlertCircle, Eye, Clock, DollarSign, UserCheck, History as HistoryIcon } from 'lucide-react';
import { NOMINA_LISTAR_RECIBOS_CAJA_URL, UPLOADS_BASE_URL } from '../../../config';
import { f } from '../../../utils/formatUtils';

const HistorialRecibosModal = ({ isOpen, onClose, empleado }) => {
  const [recibos, setRecibos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && empleado) {
      fetchRecibos();
    }
  }, [isOpen, empleado]);

  const fetchRecibos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${NOMINA_LISTAR_RECIBOS_CAJA_URL}?empleado_id=${empleado.empleado_id || empleado.id}`);
      const result = await response.json();
      if (result.status === 'success') {
        setRecibos(result.data);
      } else {
        throw new Error(result.message || 'Error al cargar el historial');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !empleado) return null;

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 9999 }}>
      <div className="bg-white rounded-5 shadow-2xl animate__animated animate__zoomIn p-0 overflow-hidden" style={{ width: '95%', maxWidth: '700px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header con gradiente premium */}
        <div className="p-4 bg-dark text-white d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
            <div className="d-flex align-items-center gap-3">
                <div className="p-2 bg-primary bg-opacity-20 border border-primary border-opacity-30 rounded-3 shadow-sm">
                    <HistoryIcon size={24} className="text-primary-subtle" />
                </div>
                <div>
                    <h5 className="mb-0 fw-extrabold" style={{ letterSpacing: '-0.5px' }}>Historial de Recibos</h5>
                    <div className="d-flex align-items-center gap-2 opacity-75 small">
                        <UserCheck size={14} />
                        <span>{empleado.empleado_nombre}</span>
                    </div>
                </div>
            </div>
            <button 
                onClick={onClose} 
                className="btn btn-link text-white p-2 hover-bg-light hover-bg-opacity-10 rounded-circle transition-all"
                style={{ textDecoration: 'none' }}
            >
                <X size={24} />
            </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto flex-grow-1 bg-light bg-opacity-50">
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-grow text-primary mb-3" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="text-secondary fw-medium animate__animated animate__pulse animate__infinite">Obteniendo registros de caja...</p>
                </div>
            ) : error ? (
                <div className="alert alert-danger rounded-4 border-0 shadow-sm p-4 d-flex align-items-start gap-3">
                    <AlertCircle className="text-danger mt-1" size={24} />
                    <div>
                        <h6 className="fw-bold mb-1">Error al cargar</h6>
                        <p className="mb-0 small">{error}</p>
                    </div>
                </div>
            ) : recibos.length === 0 ? (
                <div className="text-center py-5 bg-white border border-dashed rounded-5 shadow-sm">
                    <div className="bg-light d-inline-flex p-4 rounded-circle mb-3">
                        <FileText className="text-muted opacity-50" size={48} />
                    </div>
                    <p className="text-secondary fw-bold mb-1">Sin registros</p>
                    <p className="text-muted small">No se han encontrado recibos de caja para este operador.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {recibos.map((recibo) => (
                        <div key={recibo.id} className="col-12 col-md-6">
                            <div className="card border-0 rounded-4 shadow-sm h-100 hover-shadow-md transition-all overflow-hidden bg-white">
                                <div className="card-header bg-transparent border-0 pt-3 px-3 d-flex justify-content-between align-items-center">
                                    <div className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1 fw-bold">
                                        ID: #{recibo.id}
                                    </div>
                                    <div className="d-flex align-items-center gap-1 text-muted small">
                                        <Clock size={12} />
                                        {new Date(recibo.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                
                                <div className="card-body p-3">
                                    <div className="text-center mb-3 p-3 bg-light bg-opacity-50 rounded-4">
                                        <h3 className="fw-extrabold text-primary mb-0">{f(recibo.monto)}</h3>
                                        <p className="text-muted small mb-0 d-flex align-items-center justify-content-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(recibo.fecha).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>

                                    <div className="mb-3">
                                        <label className="text-uppercase text-secondary fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>Firma del Operador</label>
                                        <div className="bg-white border rounded-3 p-2 text-center overflow-hidden" style={{ minHeight: '80px' }}>
                                            {recibo.firma_url ? (
                                                <img 
                                                    src={`${UPLOADS_BASE_URL}${recibo.firma_url}`} 
                                                    alt="Firma" 
                                                    className="img-fluid"
                                                    style={{ maxHeight: '80px', filter: 'contrast(1.2)' }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div className="d-none w-100 h-100 align-items-center justify-content-center text-muted small py-3">
                                                No hay firma disponible
                                            </div>
                                        </div>
                                    </div>

                                    <a 
                                        href={`${UPLOADS_BASE_URL}${recibo.comprobante_url}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="btn btn-dark w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 transition-all hover-translate-y"
                                    >
                                        <Eye size={18} />
                                        Ver Comprobante PDF
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-3 border-top bg-white d-flex justify-content-end px-4">
            <button 
                onClick={onClose} 
                className="btn btn-outline-dark rounded-pill px-5 fw-bold hover-bg-dark transition-all"
            >
                Entendido
            </button>
        </div>
      </div>
    </div>
  );
};

export default HistorialRecibosModal;
