import React, { useState, useEffect, useCallback } from 'react';
import { Camera, ChevronDown, ChevronUp, Gauge, Fuel, Loader2, Calendar, ClipboardCheck } from 'lucide-react';
<<<<<<< HEAD
import { buildUploadUrl, EMPLEADOS_INSPECCIONES_URL, BASE_API } from '../../../config.js';
=======
import { buildUploadUrl, EMPLEADOS_INSPECCIONES_URL } from '../../../config.js';
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)

const HistorialInspecciones = ({ empleado }) => {
    const [inspecciones, setInspecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const getLocalDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [fechaConsulta, setFechaConsulta] = useState(getLocalDate());

    const BASE_URL = buildUploadUrl();

    const fetchInspecciones = useCallback(async () => {
        if (!empleado?.id) return;
        setLoading(true);
        try {
            const response = await fetch(`${EMPLEADOS_INSPECCIONES_URL}?empleado_id=${empleado.id}&fecha=${fechaConsulta}`);
            const result = await response.json();
            if (result.status === 'success') {
                setInspecciones(result.data);
            } else {
                setInspecciones([]);
            }
        } catch (error) {
            console.error("Error al obtener historial de inspecciones:", error);
            setInspecciones([]);
        } finally {
            setLoading(false);
        }
    }, [empleado?.id, fechaConsulta]);

    useEffect(() => {
        fetchInspecciones();
    }, [fetchInspecciones]);

    const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

    const resolveImg = (path) => {
        if (!path) return null;
        if (path.includes('http')) return path;
<<<<<<< HEAD
        
        // Si el path ya contiene 'uploads/', asumimos que es una ruta relativa desde la raíz de la API
        if (path.includes('uploads/')) {
            const root = BASE_API.replace('v1/', '');
            return `${root}${path.startsWith('/') ? path.substring(1) : path}`;
        }
        
        // Por defecto, asumimos que es un nombre de archivo en la carpeta uploads de v1
=======
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
        return `${BASE_URL}${path}`;
    };

    return (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 animate__animated animate__fadeIn">
            <div className="bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
                <h6 className="fw-bold mb-0 text-secondary d-flex align-items-center">
                    <ClipboardCheck size={18} className="me-2 text-primary" /> Checklist de Salida (Inspecciones)
                </h6>
                <div className="d-flex align-items-center gap-2 bg-light px-2 py-1 rounded-3">
                    <Calendar size={14} className="text-muted" />
                    <input
                        type="date"
                        className="form-control form-control-sm border-0 bg-transparent fw-bold p-0"
                        value={fechaConsulta?.substring(0, 10)}
                        onChange={(e) => setFechaConsulta(e.target.value)}
                        style={{ cursor: 'pointer', fontSize: '13px' }}
                    />
                </div>
            </div>

            <div className="card-body p-3">
                {loading ? (
                    <div className="text-center py-5">
                        <Loader2 className="animate-spin text-primary mx-auto" size={30} />
                        <p className="text-muted small mt-2">Cargando inspecciones...</p>
                    </div>
                ) : inspecciones.length === 0 ? (
                    <div className="text-center py-5 border border-dashed rounded-4">
                        <p className="text-muted mb-0 small">No hay inspecciones registradas en esta fecha.</p>
                    </div>
                ) : (
                    <div className="row g-3">
                        {inspecciones.map((item) => {
                            const isExpanded = expandedId === item.id;
                            return (
                                <div key={item.id} className="col-12">
                                    <div className="border rounded-4 overflow-hidden shadow-sm">
                                        <div
                                            onClick={() => toggleExpand(item.id)}
                                            className="p-3 bg-white d-flex justify-content-between align-items-center cursor-pointer"
                                        >
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-primary bg-opacity-10 p-2 rounded-circle text-primary">
                                                    <Gauge size={20} />
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark small">Unidad: {item.unidad_nombre}</div>
                                                    <div className="text-muted d-flex gap-2" style={{ fontSize: '11px' }}>
<<<<<<< HEAD
                                                        <span><strong>ODO:</strong> {item.odometro_inicio} → {item.odometro_final || '...'} <span className="text-primary fw-bold text-uppercase" style={{ fontSize: '9px' }}>{item.unidad_medida || 'km'}</span></span>
=======
                                                        <span><strong>ODO:</strong> {item.odometro_inicio} → {item.odometro_final || '...'}</span>
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
                                                        <span className="text-secondary">|</span>
                                                        <span><strong>GAS:</strong> {item.gasolina}% → {item.gasolina_final || item.gasolina}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center gap-3">
                                                <span className="badge bg-light text-dark">{item.placas}</span>
                                                {isExpanded ? <ChevronUp size={18} className="text-muted" /> : <ChevronDown size={18} className="text-muted" />}
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="p-3 bg-light border-top animate__animated animate__fadeIn">
                                                <div className="row g-3">
                                                    {[
                                                        { label: 'TABLERO', key: 'foto_tablero' },
                                                        { label: 'FRENTE', key: 'foto_frente' },
                                                        { label: 'ATRÁS', key: 'foto_atras' },
                                                        { label: 'IZQUIERDA', key: 'foto_izquierdo' },
                                                        { label: 'DERECHA', key: 'foto_derecho' }
                                                    ].map((foto, idx) => (
                                                        <div key={idx} className="col-6 col-md-4 col-lg-2.4">
                                                            <div className="text-center">
                                                                <label className="d-block text-muted mb-1 fw-bold" style={{ fontSize: '9px' }}>{foto.label}</label>
                                                                <div className="bg-white p-1 rounded-3 border shadow-sm">
                                                                    {item[foto.key] ? (
                                                                        <img
                                                                            src={resolveImg(item[foto.key])}
                                                                            alt={foto.label}
                                                                            className="img-fluid rounded-2"
                                                                            style={{ height: '100px', width: '100%', objectFit: 'cover' }}
                                                                            onClick={() => window.open(resolveImg(item[foto.key]), '_blank')}
<<<<<<< HEAD
                                                                            onError={(e) => {
                                                                                if (!e.target.dataset.triedFallback) {
                                                                                    e.target.dataset.triedFallback = 'true';
                                                                                    // Primer intento: carpeta empleados/uploads
                                                                                    e.target.src = `${BASE_API}empleados/uploads/${item[foto.key]}`;
                                                                                } else if (e.target.dataset.triedFallback === 'true') {
                                                                                    e.target.dataset.triedFallback = 'tried_all';
                                                                                    // Segundo intento: carpeta raíz de uploads (fuera de v1)
                                                                                    const rootUploads = BASE_API.replace('v1/', '') + 'uploads/';
                                                                                    e.target.src = `${rootUploads}${item[foto.key]}`;
                                                                                }
                                                                            }}
=======
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
                                                                        />
                                                                    ) : (
                                                                        <div className="d-flex align-items-center justify-content-center text-muted" style={{ height: '100px' }}>
                                                                            <Camera size={20} className="opacity-20" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {item.firma_url && (
                                                        <div className="col-12 mt-2 text-center border-top pt-3">
                                                            <p className="text-muted mb-1" style={{ fontSize: '10px', letterSpacing: '1px' }}>FIRMA DE INSPECCIÓN</p>
                                                            <img
                                                                src={resolveImg(item.firma_url)}
                                                                alt="Firma"
                                                                style={{ maxHeight: '60px', filter: 'contrast(1.2)' }}
<<<<<<< HEAD
                                                                onError={(e) => {
                                                                    if (!e.target.dataset.triedFallback) {
                                                                        e.target.dataset.triedFallback = 'true';
                                                                        e.target.src = `${BASE_API}empleados/uploads/${item.firma_url}`;
                                                                    } else if (e.target.dataset.triedFallback === 'true') {
                                                                        e.target.dataset.triedFallback = 'tried_all';
                                                                        const rootUploads = BASE_API.replace('v1/', '') + 'uploads/';
                                                                        e.target.src = `${rootUploads}${item.firma_url}`;
                                                                    }
                                                                }}
=======
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistorialInspecciones;
