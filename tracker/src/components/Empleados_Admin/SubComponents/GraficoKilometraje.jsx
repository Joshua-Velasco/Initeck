import React, { useState, useEffect, useCallback } from 'react';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area
} from 'recharts';
import { Gauge, ChartBar, Loader2, AlertCircle } from 'lucide-react';
import { EMPLEADOS_KILOMETRAJE_URL } from '../../../config.js';
import { COLORS } from '../../../constants/theme';

const GraficoKilometraje = ({ empleado }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
<<<<<<< HEAD
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 500);
        return () => clearTimeout(timer);
    }, []);
=======
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)

    const fetchKilometraje = useCallback(async () => {
        if (!empleado?.id) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${EMPLEADOS_KILOMETRAJE_URL}?empleado_id=${empleado.id}&limit=50`);
            const result = await response.json();
            if (result.status === 'success') {
                // Agrupar por fecha para sumar recorridos del mismo día
                const grouped = result.data.reduce((acc, curr) => {
                    const date = curr.fecha;
                    if (!acc[date]) {
                        acc[date] = {
                            fecha: date,
                            odometro_inicio: curr.odometro_inicio,
                            odometro_final: curr.odometro_final,
<<<<<<< HEAD
                            unidad: curr.unidad_medida || 'km',
=======
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
                            recorrido: 0,
                            count: 0
                        };
                    }
<<<<<<< HEAD
                    // Actualizar min/max odometros del día (mantener unidades originales para el display)
                    acc[date].odometro_inicio = Math.min(acc[date].odometro_inicio, curr.odometro_inicio);
                    acc[date].odometro_final = Math.max(acc[date].odometro_final, curr.odometro_final);

                    // Sumar el recorrido ya normalizado por el API
                    acc[date].recorrido += parseFloat(curr.recorrido) || 0;
=======
                    // Actualizar min/max odometros del día
                    acc[date].odometro_inicio = Math.min(acc[date].odometro_inicio, curr.odometro_inicio);
                    acc[date].odometro_final = Math.max(acc[date].odometro_final, curr.odometro_final);

                    // Recalcular recorrido basado en diferencias absolutas (Max - Min)
                    acc[date].recorrido = acc[date].odometro_final - acc[date].odometro_inicio;
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)

                    acc[date].count++;
                    return acc;
                }, {});

                // Convertir a array y ordenar por fecha ascendente
                const processedData = Object.values(grouped)
                    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
                    .slice(-7);

                setData(processedData);
            } else {
                setError(result.message);
            }
        } catch (err) {
            console.error("Error fetching mileage data:", err);
            setError("Error de conexión al obtener datos de kilometraje");
        } finally {
            setLoading(false);
        }
    }, [empleado?.id]);

    useEffect(() => {
        fetchKilometraje();
    }, [fetchKilometraje]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const getVal = (key) => payload.find(p => p.dataKey === key)?.value || 0;

            const inicio = getVal('odometro_inicio');
            const fin = getVal('odometro_final');
            const recorrido = getVal('recorrido');
<<<<<<< HEAD
            const unidad = payload[0].payload.unidad || 'km';
=======
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)

            return (
                <div className="bg-white p-3 border rounded shadow-sm">
                    <p className="fw-bold mb-1 small text-secondary border-bottom pb-1">
                        {new Date(label).toLocaleDateString()}
                    </p>
                    <div className="d-flex flex-column gap-2 mt-2">
                        <div className="d-flex flex-column">
                            <span className="text-muted fw-bold" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
                                RANGO DE ODÓMETRO (DÍA)
                            </span>
                            <div className="d-flex justify-content-between gap-4 mt-1">
                                <span className="small text-secondary">Inicio:</span>
<<<<<<< HEAD
                                <span className="small fw-bold">{inicio.toLocaleString()} {unidad}</span>
                            </div>
                            <div className="d-flex justify-content-between gap-4">
                                <span className="small text-secondary">Fin:</span>
                                <span className="small fw-bold text-primary">{fin.toLocaleString()} {unidad}</span>
=======
                                <span className="small fw-bold">{inicio.toLocaleString()} km</span>
                            </div>
                            <div className="d-flex justify-content-between gap-4">
                                <span className="small text-secondary">Fin:</span>
                                <span className="small fw-bold text-primary">{fin.toLocaleString()} km</span>
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
                            </div>
                        </div>

                        <div className="bg-light p-2 rounded-3 d-flex justify-content-between align-items-center">
                            <span className="fw-bold text-success small">DISTANCIA RECORRIDA:</span>
<<<<<<< HEAD
                            <span className="badge bg-success fs-6">{recorrido.toFixed(2)} km</span>
=======
                            <span className="badge bg-success fs-6">{recorrido} km</span>
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 animate__animated animate__fadeIn">
            <div className="bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
                <h6 className="fw-bold mb-0 text-secondary d-flex align-items-center">
                    <ChartBar size={18} className="me-2 text-primary" /> Comparativa de Kilometraje (Últimos Viajes)
                </h6>
                <div className="badge bg-light text-muted fw-normal" style={{ fontSize: '11px' }}>
                    Distancia recorrida diaria
                </div>
            </div>

            <div className="card-body p-4">
                {loading ? (
                    <div className="text-center py-5">
                        <Loader2 className="animate-spin text-primary mx-auto" size={32} />
                        <p className="text-muted small mt-2">Cargando gráfico...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-5 d-flex flex-column align-items-center gap-2">
                        <AlertCircle size={40} className="text-danger opacity-25" />
                        <p className="text-muted small mb-0">{error}</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center py-5 border border-dashed rounded-4">
                        <p className="text-muted mb-0 small">No hay datos suficientes para generar la comparativa.</p>
                    </div>
                ) : (
                    <div style={{ width: '100%', height: 320 }}>
<<<<<<< HEAD
                        {isReady && (
                            <div style={{ width: '100%', height: '100%', minWidth: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart
                                        data={data}
                                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="fecha"
                                            tickFormatter={(val) => new Date(val).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            yAxisId="left"
                                            orientation="left"
                                            stroke="#e2e3e5"
                                            tick={{ fontSize: 10, fill: '#64748b' }}
                                            axisLine={false}
                                            tickLine={false}
                                            label={{ value: 'Distancia (km)', angle: -90, position: 'insideLeft', style: { fontSize: '10px', fill: '#94a3b8' } }}
                                        />
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            stroke="#e2e3e5"
                                            domain={['auto', 'auto']}
                                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                                            axisLine={false}
                                            tickLine={false}
                                            label={{ value: 'Odo. Total', angle: 90, position: 'insideRight', style: { fontSize: '10px', fill: '#94a3b8' } }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend
                                            verticalAlign="top"
                                            align="center"
                                            iconType="circle"
                                            wrapperStyle={{ fontSize: '11px', paddingBottom: '30px' }}
                                        />
                                        <Area
                                            name="Acumulación Odo."
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="odometro_final"
                                            fill={COLORS.guinda}
                                            fillOpacity={0.05}
                                            stroke="transparent"
                                        />
                                        <Line
                                            name="Odo. Inicial"
                                            yAxisId="right"
                                            dataKey="odometro_inicio"
                                            stroke="#cbd5e1"
                                            strokeWidth={1}
                                            strokeDasharray="5 5"
                                            dot={false}
                                            activeDot={false}
                                        />
                                        <Line
                                            name="Odo. Final"
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="odometro_final"
                                            stroke="#94a3b8"
                                            strokeWidth={2}
                                            dot={{ r: 3, fill: '#94a3b8' }}
                                        />
                                        <Bar
                                            name="Distancia del Recorrido (km)"
                                            yAxisId="left"
                                            dataKey="recorrido"
                                            fill={COLORS.guinda}
                                            barSize={30}
                                            radius={[6, 6, 0, 0]}
                                            opacity={0.8}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        )}
=======
                        <ResponsiveContainer>
                            <ComposedChart
                                data={data}
                                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="fecha"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                {/* YAxis Izquierdo para Distancia */}
                                <YAxis
                                    yAxisId="left"
                                    orientation="left"
                                    stroke="#e2e3e5"
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                    axisLine={false}
                                    tickLine={false}
                                    label={{ value: 'Distancia (km)', angle: -90, position: 'insideLeft', style: { fontSize: '10px', fill: '#94a3b8' } }}
                                />
                                {/* YAxis Derecho para Odómetro Total */}
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    stroke="#e2e3e5"
                                    domain={['auto', 'auto']}
                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                    label={{ value: 'Odo. Total', angle: 90, position: 'insideRight', style: { fontSize: '10px', fill: '#94a3b8' } }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="top"
                                    align="center"
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '11px', paddingBottom: '30px' }}
                                />

                                <Area
                                    name="Acumulación Odo."
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="odometro_final"
                                    fill={COLORS.guinda}
                                    fillOpacity={0.05}
                                    stroke="transparent"
                                />

                                <Line
                                    name="Odo. Inicial"
                                    yAxisId="right"
                                    dataKey="odometro_inicio"
                                    stroke="#cbd5e1"
                                    strokeWidth={1}
                                    strokeDasharray="5 5"
                                    dot={false}
                                    activeDot={false}
                                />
                                <Line
                                    name="Odo. Final"
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="odometro_final"
                                    stroke="#94a3b8"
                                    strokeWidth={2}
                                    dot={{ r: 3, fill: '#94a3b8' }}
                                />
                                <Bar
                                    name="Distancia del Recorrido (km)"
                                    yAxisId="left"
                                    dataKey="recorrido"
                                    fill={COLORS.guinda}
                                    barSize={30}
                                    radius={[6, 6, 0, 0]}
                                    opacity={0.8}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
                    </div>
                )}
            </div>

            <div className="card-footer bg-light border-0 py-2 px-4">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                        <div className="p-1.5 rounded-circle bg-white shadow-sm">
                            <Gauge size={14} className="text-primary" />
                        </div>
                        <span className="small text-muted" style={{ fontSize: '11px' }}>
                            Mide la eficiencia y desgaste de la unidad por turno.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GraficoKilometraje;
