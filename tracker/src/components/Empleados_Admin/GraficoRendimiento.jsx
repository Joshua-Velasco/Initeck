import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area, ReferenceLine,
  ComposedChart, Scatter
} from 'recharts';
import { COLORS } from '../../constants/theme';
import { EMPLEADOS_RENDIMIENTO_URL } from '../../config';


export const GraficoRendimiento = ({ empleado, fechas }) => {
  const [periodoGrafico, setPeriodoGrafico] = useState('dia');
  const [datosGrafico, setDatosGrafico] = useState([]);
  const [cargandoGrafico, setCargandoGrafico] = useState(false);
<<<<<<< HEAD
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 500);
    return () => clearTimeout(timer);
  }, []);
=======
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)

  const COLOR_GASTOS = '#ef4444'; // Rojo vibrante
  const COLOR_NETO = '#10b981';   // Verde esmeralda
  const COLOR_EFECTIVO = '#3b82f6'; // Azul
  const COLOR_PROPINAS = '#f59e0b'; // Amarillo ambar

  const fetchRendimiento = useCallback(async () => {
    if (!empleado?.id) return;
    setCargandoGrafico(true);

    try {
      // Usar rango de fechas desde props
      const url = `${EMPLEADOS_RENDIMIENTO_URL}?id=${empleado.id}&periodo=${periodoGrafico}&fecha_inicio=${fechas.inicio}&fecha_fin=${fechas.fin}`;

      const res = await fetch(url);
<<<<<<< HEAD
      
      let data;
      try {
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("Error parsing JSON:", text.substring(0, 200)); // Log first 200 chars of error
          throw new Error("Invalid JSON response");
        }
      } catch (err) {
        throw new Error("Failed to read response body");
      }
=======
      const data = await res.json();
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)

      const procesados = (Array.isArray(data) ? data : []).map(item => {

        let labelFinal = '---';
        const fDate = item.fecha || '';

        // Si viene como Mes (YYYY-MM)
        if (item.mes) {
          labelFinal = item.mes;
        }
        // Si parece Hora (HH:MM:SS) -> Mostrar HH:MM
        else if (fDate.includes(':')) {
          labelFinal = fDate.substring(0, 5);
        }
        // Si parece Fecha (YYYY-MM-DD) -> Mostrar DD/MM
        else if (fDate.includes('-')) {
          const parts = fDate.split('-'); // [YYYY, MM, DD]
          if (parts.length === 3) {
            labelFinal = `${parts[2]}/${parts[1]}`;
          } else {
            labelFinal = fDate;
          }
        } else {
          labelFinal = fDate || 'S/F';
        }

        return {
          ...item,
          efectivo: parseFloat(item.total_efectivo) || 0,
          propinas: parseFloat(item.total_propinas) || 0,
          gastos: parseFloat(item.total_gastos) || 0,
          neto: parseFloat(item.neto) || 0,
          label: labelFinal
        };
      });

      setDatosGrafico(procesados);
    } catch (err) {
      console.error("Error en dashboard:", err);
      setDatosGrafico([]);
    } finally {
      setCargandoGrafico(false);
    }
  }, [empleado?.id, periodoGrafico, fechas.inicio, fechas.fin]);

  useEffect(() => { fetchRendimiento(); }, [fetchRendimiento]);

  const totalesPie = useMemo(() => {
    const totalEfectivo = datosGrafico.reduce((acc, curr) => acc + curr.efectivo, 0);
    const totalPropinas = datosGrafico.reduce((acc, curr) => acc + curr.propinas, 0);
    const totalGas = datosGrafico.reduce((acc, curr) => acc + curr.gastos, 0);
    return [
      { name: 'Efectivo', value: totalEfectivo, color: COLOR_EFECTIVO },
      { name: 'Propinas', value: totalPropinas, color: COLOR_PROPINAS },
      { name: 'Gastos', value: totalGas, color: COLOR_GASTOS }
    ].filter(d => d.value > 0);
  }, [datosGrafico]);

  const gradientOffset = () => {
    const dataMax = Math.max(...datosGrafico.map((i) => i.neto));
    const dataMin = Math.min(...datosGrafico.map((i) => i.neto));

    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;

    return dataMax / (dataMax - dataMin);
  };

  const off = gradientOffset();

  const formatCurrency = (val) => `$${new Intl.NumberFormat('es-MX').format(val)}`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border shadow-sm rounded-3" style={{ fontSize: '12px', minWidth: '180px' }}>
          <p className="fw-bold mb-2 border-bottom pb-1 text-center">{label}</p>

          <div className="d-flex justify-content-between mb-1">
            <span style={{ color: COLOR_EFECTIVO }}>● Efectivo:</span>
            <span className="fw-bold">{formatCurrency(data.efectivo)}</span>
          </div>
          <div className="d-flex justify-content-between mb-1">
            <span style={{ color: COLOR_PROPINAS }}>● Propinas:</span>
            <span className="fw-bold">{formatCurrency(data.propinas)}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span style={{ color: COLOR_GASTOS }}>● Gastos:</span>
            <span className="fw-bold">{formatCurrency(data.gastos)}</span>
          </div>

          <div className="d-flex justify-content-between pt-2 border-top bg-light mx-n3 px-3 pb-1 mb-n3 rounded-bottom-3">
            <span className="fw-bold text-dark">Total Neto:</span>
            <span className={`fw-bold ${data.neto >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(data.neto)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (datosGrafico.length === 0 && !cargandoGrafico) {
    return (
      <div className="card border-0 shadow-sm p-5 rounded-4 bg-white text-center">
        <p className="text-muted small mb-0">Sin datos de rendimiento para este periodo.</p>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm p-3 p-md-4 rounded-4 bg-white h-100">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
        <div>
          <h6 className="fw-bold text-uppercase mb-1" style={{ letterSpacing: '1px', color: '#444', fontSize: '0.85rem' }}>Análisis de Rendimiento</h6>
          <span className="badge bg-light text-muted border fw-normal">ID: {empleado?.id}</span>
        </div>
        <select
          className="form-select form-select-sm w-auto border-0 bg-light fw-bold shadow-none"
          value={periodoGrafico}
          onChange={(e) => setPeriodoGrafico(e.target.value)}
        >
          <option value="dia">Hoy</option>
          <option value="semana">Últimos 7 días</option>
          <option value="mes">Últimos meses</option>
        </select>
      </div>

      {cargandoGrafico ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
          <div className="spinner-border text-guinda opacity-50" />
        </div>
      ) : (
        <div className="row g-4">
          {/* GRÁFICA PRINCIPAL: NETO DESCARTANDO PROPINAS */}
          <div className="col-lg-8">
            <div className="p-3 bg-light rounded-4 h-100 border">
              <h6 className="fw-bold small text-muted mb-3">TENDENCIA DE UTILIDAD OPERATIVA (NETO)</h6>
              <div style={{ height: '300px' }}>
<<<<<<< HEAD
                {isReady && (
                  <div style={{ width: '100%', height: '100%', minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={datosGrafico} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset={off} stopColor={COLOR_NETO} stopOpacity={1} />
                            <stop offset={off} stopColor={COLOR_GASTOS} stopOpacity={1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="label" fontSize={10} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                        <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
                        <ReferenceLine y={0} stroke="#000" strokeOpacity={0.1} />
                        <Area type="monotone" name="Utilidad Neta (Efectivo - Gastos)" dataKey="neto" stroke="url(#splitColor)" fill="url(#splitColor)" fillOpacity={0.6} strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
=======
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={datosGrafico} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset={off} stopColor={COLOR_NETO} stopOpacity={1} />
                        <stop offset={off} stopColor={COLOR_GASTOS} stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="label" fontSize={10} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
                    <ReferenceLine y={0} stroke="#000" strokeOpacity={0.1} />
                    <Area type="monotone" name="Utilidad Neta (Efectivo - Gastos)" dataKey="neto" stroke="url(#splitColor)" fill="url(#splitColor)" fillOpacity={0.6} strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
              </div>
            </div>
          </div>

          {/* COLUMNA LATERAL: BARRAS Y PIE */}
          <div className="col-lg-4">
            <div className="d-flex flex-column gap-3 h-100">



              {/* PROPORCIÓN PIE */}
              <div className="p-3 bg-light rounded-4 border h-100 d-flex flex-column">
                <h6 className="fw-bold small text-muted mb-auto">DISTRIBUCIÓN DE FLUJO</h6>
                <div style={{ height: '260px', marginTop: 'auto', marginBottom: 'auto' }}>
<<<<<<< HEAD
                  {isReady && (
                    <div style={{ width: '100%', height: '100%', minWidth: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={totalesPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={4}>
                            {totalesPie.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                          </Pie>
                          <Tooltip formatter={(val) => formatCurrency(val)} />
                          <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
=======
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={totalesPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={4}>
                        {totalesPie.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(val) => formatCurrency(val)} />
                      <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};