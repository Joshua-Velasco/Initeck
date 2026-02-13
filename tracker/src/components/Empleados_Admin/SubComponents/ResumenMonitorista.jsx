import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Calendar, TrendingUp, Activity, Loader2, AlertCircle } from 'lucide-react';
import { MONITOR_STATS_URL } from '../../../config';
import { COLORS } from '../../../constants/theme';

export default function ResumenMonitorista({ empleado }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!empleado?.id) return;

        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${MONITOR_STATS_URL}?id=${empleado.id}`);
                if (!res.ok) throw new Error("Error fetching stats");

                const data = await res.json();
                if (data.status === 'success') {
                    setStats(data.data);
                } else {
                    setError(data.message || "Error desconocido");
                }
            } catch (err) {
                console.error("Error fetching monitor stats:", err);
                setError("No se pudo cargar la información.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [empleado]);

    if (loading) return (
        <div className="text-center py-5">
            <Loader2 className="animate-spin text-primary mb-2 mx-auto" size={32} />
            <p className="text-muted small">Calculando horas de actividad...</p>
        </div>
    );

    if (error) return (
        <div className="alert alert-light text-center border-0 text-muted">
            <AlertCircle className="mb-2 d-block mx-auto text-danger" />
            {error}
        </div>
    );

    if (!stats) return null;

    return (
        <div className="row g-4 animate__animated animate__fadeIn">
            {/* Tarjetas de Estadísticas Check-in/Check-out simulado */}
            <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                    <div className="card-body p-4">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="bg-primary bg-opacity-10 p-2 rounded-3">
                                <Clock size={24} className="text-primary" />
                            </div>
                            <h6 className="fw-bold text-muted mb-0">Hoy</h6>
                        </div>
                        <h2 className="fw-bold mb-1" style={{ color: COLORS.dark }}>
                            {stats.horas_hoy}<span className="fs-6 text-muted ms-1">hrs</span>
                        </h2>
                        <small className="text-success d-flex align-items-center gap-1">
                            <Activity size={12} />
                            Activo ahora
                        </small>
                    </div>
                </div>
            </div>

            <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                    <div className="card-body p-4">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="bg-success bg-opacity-10 p-2 rounded-3">
                                <Calendar size={24} className="text-success" />
                            </div>
                            <h6 className="fw-bold text-muted mb-0">Esta Semana</h6>
                        </div>
                        <h2 className="fw-bold mb-1" style={{ color: COLORS.dark }}>
                            {stats.horas_semana}<span className="fs-6 text-muted ms-1">hrs</span>
                        </h2>
                        <small className="text-muted">Total acumulado</small>
                    </div>
                </div>
            </div>

            <div className="col-md-4">
                <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                    <div className="card-body p-4">
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="bg-info bg-opacity-10 p-2 rounded-3">
                                <TrendingUp size={24} className="text-info" />
                            </div>
                            <h6 className="fw-bold text-muted mb-0">Promedio Diario</h6>
                        </div>
                        <h2 className="fw-bold mb-1" style={{ color: COLORS.dark }}>
                            {stats.promedio_diario}<span className="fs-6 text-muted ms-1">hrs</span>
                        </h2>
                        <small className="text-muted">Últimos 7 días</small>
                    </div>
                </div>
            </div>

            {/* Gráfico de Actividad */}
            <div className="col-12">
                <div className="card border-0 shadow-sm rounded-4 bg-white">
                    <div className="card-header bg-transparent border-0 p-4">
                        <h5 className="fw-bold mb-0">Actividad de Monitoreo (Últimos 7 días)</h5>
                    </div>
                    <div className="card-body p-4 pt-0" style={{ height: '300px' }}>
                        {isReady && (
                            <div style={{ width: '100%', height: '100%', minWidth: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.chart_data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaecf0" />
                                        <XAxis
                                            dataKey="fecha"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => {
                                                const date = new Date(val + 'T00:00:00'); // Force local time avoid timezone shift
                                                return date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' });
                                            }}
                                        />
                                        <YAxis
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => `${val}h`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                            formatter={(val) => [`${val} horas`, 'Actividad']}
                                            labelFormatter={(val) => new Date(val + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar
                                            dataKey="duracion_horas"
                                            fill={COLORS.primary || '#0f172a'}
                                            radius={[6, 6, 0, 0]}
                                            barSize={32}
                                            name="Horas Activo"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
