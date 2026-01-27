import React, { useState, useEffect } from 'react';
import { Wrench, Calendar, Car, AlertCircle, CheckCircle, Clock, XCircle, ChevronRight, Loader2 } from 'lucide-react';
import { MANTENIMIENTO_URL, VEHICULOS_UPLOADS_URL } from '../../../config';
import { COLORS } from '../../../constants/theme';

export default function HistorialMantenimientoEmpleado({ empleado }) {
    const [mantenimientos, setMantenimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (!empleado?.nombre_completo) return;

        const fetchMantenimientos = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = `${MANTENIMIENTO_URL}?responsable=${encodeURIComponent(empleado.nombre_completo)}`;
                const res = await fetch(url);

                if (!res.ok) throw new Error("Error al obtener datos");

                const data = await res.json();

                if (Array.isArray(data)) {
                    setMantenimientos(data);
                } else {
                    setMantenimientos([]);
                }
            } catch (err) {
                console.error("Error fetching maintenances:", err);
                setError("No se pudo cargar el historial.");
            } finally {
                setLoading(false);
            }
        };

        fetchMantenimientos();
    }, [empleado]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completado': return <CheckCircle size={16} className="text-success" />;
            case 'En Progreso': return <Clock size={16} className="text-primary" />;
            case 'Pendiente': return <AlertCircle size={16} className="text-warning" />;
            case 'Cancelado': return <XCircle size={16} className="text-danger" />;
            default: return <Clock size={16} className="text-muted" />;
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Completado': 'bg-success bg-opacity-10 text-success',
            'En Progreso': 'bg-primary bg-opacity-10 text-primary',
            'Pendiente': 'bg-warning bg-opacity-10 text-warning',
            'Cancelado': 'bg-danger bg-opacity-10 text-danger'
        };
        return styles[status] || 'bg-secondary bg-opacity-10 text-secondary';
    };

    if (loading) return (
        <div className="text-center py-5">
            <Loader2 className="animate-spin text-primary mx-auto mb-2" size={32} />
            <p className="text-muted small">Cargando historial de mantenimientos...</p>
        </div>
    );

    if (error) return (
        <div className="alert alert-light text-center border-0 text-muted">
            <AlertCircle className="mb-2 d-block mx-auto text-danger" />
            {error}
        </div>
    );

    return (
        <>
            <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-header bg-transparent border-0 p-4">
                    <h5 className="fw-bold mb-0 d-flex align-items-center gap-3" style={{ color: COLORS.dark }}>
                        <div className="p-2 rounded-3" style={{ backgroundColor: '#eef2ff' }}>
                            <Wrench size={20} className="text-primary" />
                        </div>
                        Historial de Mantenimientos
                        <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill ms-auto px-3">
                            {mantenimientos.length} Registros
                        </span>
                    </h5>
                </div>

                <div className="card-body p-0">
                    {mantenimientos.length === 0 ? (
                        <div className="text-center py-5 text-muted px-4">
                            <div className="bg-light rounded-circle p-4 mx-auto mb-3" style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Wrench size={32} className="opacity-25" />
                            </div>
                            <h6 className="fw-bold">Sin mantenimientos asignados</h6>
                            <p className="small mb-0">Este usuario no aparece como responsable de ningún servicio registrado.</p>
                        </div>
                    ) : (
                        <div className="list-group list-group-flush">
                            {mantenimientos.map((m) => (
                                <div key={m.id} className="list-group-item border-0 p-4 hover-bg-light transition-all">
                                    <div className="row align-items-center g-3">
                                        <div className="col-md-5">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-light p-2 rounded-3 border">
                                                    <Car size={20} className="text-muted" />
                                                </div>
                                                <div>
                                                    <h6 className="fw-bold mb-1 text-dark">{m.unidad_nombre || 'Unidad Desconocida'}</h6>
                                                    <small className="text-muted d-block">{m.tipo}</small>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <div className="d-flex flex-column gap-1">
                                                <div className="d-flex align-items-center gap-2 small text-muted">
                                                    <Calendar size={14} />
                                                    {new Date(m.fecha).toLocaleDateString()}
                                                </div>
                                                <div className="d-flex align-items-center gap-2 small text-muted">
                                                    <div className={`badge rounded-pill ${getStatusBadge(m.estado)} d-flex align-items-center gap-1 px-2 py-1`}>
                                                        {getStatusIcon(m.estado)}
                                                        {m.estado}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-3 text-end">
                                            <span className="fw-bold text-dark d-block">
                                                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(m.costo_total)}
                                            </span>
                                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>Costo Total</small>
                                        </div>
                                    </div>

                                    {m.descripcion && (
                                        <div className="mt-3 bg-light rounded-3 p-3 small text-muted border-start border-3 border-primary">
                                            {m.descripcion}
                                        </div>
                                    )}

                                    {/* Documentación: Evidencia y Firma */}
                                    {(m.evidencia_foto || m.firma_empleado) && (
                                        <div className="mt-3 d-flex gap-3 pt-3 border-top">
                                            {m.evidencia_foto && (
                                                <div
                                                    className="d-flex align-items-center gap-2 small text-primary cursor-pointer fw-bold"
                                                    onClick={() => setSelectedImage(`${VEHICULOS_UPLOADS_URL}${m.evidencia_foto}`)}
                                                >
                                                    <img
                                                        src={`${VEHICULOS_UPLOADS_URL}${m.evidencia_foto}`}
                                                        alt="Evidencia"
                                                        className="rounded-3 border object-fit-cover transition-all hover-scale"
                                                        style={{ width: '40px', height: '40px' }}
                                                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                                                    />
                                                    <span>Ver Evidencia</span>
                                                </div>
                                            )}

                                            {m.firma_empleado && (
                                                <div
                                                    className="d-flex align-items-center gap-2 small text-success cursor-pointer fw-bold"
                                                    onClick={() => setSelectedImage(`${VEHICULOS_UPLOADS_URL}${m.firma_empleado}`)}
                                                >
                                                    <div className="bg-success bg-opacity-10 p-1 rounded-2 border border-success border-opacity-25">
                                                        <img
                                                            src={`${VEHICULOS_UPLOADS_URL}${m.firma_empleado}`}
                                                            alt="Firma"
                                                            className="object-fit-contain"
                                                            style={{ width: '38px', height: '30px' }}
                                                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                                                        />
                                                    </div>
                                                    <span>Firma Validada</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de visualización de imágenes */}
            {selectedImage && (
                <div
                    className="modal d-block"
                    style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1060 }}
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content bg-transparent border-0 shadow-none">
                            <div className="modal-body text-center position-relative p-0">
                                <button
                                    type="button"
                                    className="btn btn-dark rounded-circle position-absolute top-0 end-0 m-3 shadow-lg"
                                    onClick={() => setSelectedImage(null)}
                                    style={{ width: '40px', height: '40px', zIndex: 10 }}
                                >
                                    <XCircle size={24} />
                                </button>
                                <img
                                    src={selectedImage}
                                    alt="Vista previa"
                                    className="img-fluid rounded-4 shadow-2xl"
                                    style={{ maxHeight: '85vh', objectFit: 'contain' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
