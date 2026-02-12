import React, { memo, useMemo, useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, ComposedChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine, Line } from 'recharts';
import { ArrowUpRight, TrendingUp, DollarSign, TrendingDown, AlertTriangle } from 'lucide-react';

const f = (val, digits = 0) => new Intl.NumberFormat('es-MX', { 
  style: 'currency', currency: 'MXN', maximumFractionDigits: digits 
}).format(val || 0);

const generateSparklineData = (baseValue) => {
  return Array.from({ length: 10 }, (_, i) => ({
    value: (baseValue / 12) * (0.8 + Math.random() * 0.4),
    index: i 
  }));
};

// Tarjeta estándar de costo con gráfica estilo trading
const InfoColumn = memo(({ title, accent, amount, diasEnPeriodo, fechaInicio, fechaFin }) => {
  const numAmount = parseFloat(amount) || 0;
  
  // Ajustar límites según la duración del período
  const esMensual = diasEnPeriodo > 60;
  // Factor proporcional al año
  const factorPeriodo = diasEnPeriodo / 365;
  
  const limitePeriodo = numAmount * factorPeriodo;
  const limiteMensual = numAmount / 12;
  const limiteDiario = numAmount / 365;
  
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Generar datos simulados según período
  const chartData = useMemo(() => {
    const data = [];
    
    if (esMensual) {
      // Modo Mensual (para periodos largos)
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      // Generar barras para la cantidad de meses en el periodo
      const numMeses = Math.min(12, Math.max(3, Math.ceil(diasEnPeriodo / 30)));
      const current = new Date(fechaInicio || new Date());
      
      let acumulado = 0;
      for (let i = 0; i < numMeses; i++) {
        // Simular variación en gastos
        const variacion = 0.7 + Math.random() * 0.6;
        const gasto = limiteMensual * variacion;
        acumulado += gasto;
        
        // Etiqueta basada en el mes actual del loop
        const label = meses[current.getMonth()];
        // Avanzar al siguiente mes
        current.setMonth(current.getMonth() + 1);
        
        data.push({
          label: label,
          gasto: gasto, 
          limite: limiteMensual,
          excede: gasto > limiteMensual,
          mediaMovil: acumulado / (i + 1)
        });
      }
    } else {
      // Modo Diario (para periodos cortos)
      let dias = diasEnPeriodo;
      // Limitar visualización si son muchos días pero menos de 60
      const paso = dias > 31 ? 2 : 1; 
      const current = new Date(fechaInicio || new Date());
      
      let acumulado = 0;
      for (let i = 1; i <= dias; i += paso) {
        const variacion = Math.random() > 0.7 ? (Math.random() * 0.5 + 0.3) : (Math.random() * 0.3); 
        const gasto = (limiteDiario * variacion) * (Math.random() > 0.2 ? 1 : 0); 
        acumulado += gasto;

        // Label: Día del mes
        const label = current.getDate(); 
        
        data.push({
          label: `${label}`,
          gasto: gasto,
          limite: limiteDiario,
          excede: gasto > limiteDiario,
          mediaMovil: acumulado / (data.length + 1)
        });
        
        // Avanzar fecha
        current.setDate(current.getDate() + paso);
      }
    }
    return data;
  }, [limiteMensual, limiteDiario, diasEnPeriodo, esMensual, fechaInicio]);

  return (
    <div className="col-12 col-xl-6 col-xxl-4 mb-4">
      <div className="card h-100 border-0 shadow-lg rounded-4 overflow-hidden bg-dark text-white border-top border-4" style={{ borderTopColor: accent }}>
        <div className="card-body p-4">
          
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <p className="text-secondary fw-bold mb-1 text-uppercase small tracking-widest">
                {title}
              </p>
              <h2 className="fw-bolder mb-0 display-6" style={{ color: accent }}>
                {f(numAmount)}
                <span className="fs-6 text-secondary ms-2 fw-normal">/ AÑO</span>
              </h2>
            </div>
            <div className="p-2 rounded-3" style={{ backgroundColor: `${accent}20` }}>
              <TrendingUp size={24} style={{ color: accent }} />
            </div>
          </div>

          {/* Gráfica estilo Trading */}
          {isReady && (
            <div style={{ 
              width: '100%', 
              height: 140, 
              background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: 8,
              padding: '8px 4px',
              position: 'relative',
              marginBottom: 12
            }}>
              <div style={{
                position: 'absolute',
                top: 8,
                left: 30,
                right: 8,
                bottom: 25,
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 25%, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.03) 26%)',
                pointerEvents: 'none'
              }} />
              
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                  barCategoryGap="20%"
                >
                  <XAxis 
                    dataKey="label" 
                    axisLine={{ stroke: '#334155' }}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis hide domain={[0, 'auto']} />
                  <Tooltip 
                    formatter={(value) => f(value)}
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569', 
                      borderRadius: 6,
                      fontSize: 11,
                      color: '#f8fafc'
                    }}
                    itemStyle={{ color: '#f8fafc' }}
                    labelStyle={{ color: '#cbd5e1', marginBottom: '0.25rem' }}
                  />
                  <ReferenceLine 
                    y={esMensual ? limiteMensual : limiteDiario} 
                    stroke={accent} 
                    strokeDasharray="3 3" 
                    strokeWidth={1.5}
                  />
                  <Bar dataKey="gasto" radius={[2, 2, 0, 0]} minPointSize={2}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.excede ? '#ef4444' : '#22c55e'} 
                      />
                    ))}
                  </Bar>
                  <Line 
                    type="monotone" 
                    dataKey="mediaMovil" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              
              <div className="d-flex justify-content-center gap-3" style={{ fontSize: '0.55rem' }}>
                <span><span style={{ color: '#22c55e' }}>■</span> Bajo</span>
                <span><span style={{ color: '#ef4444' }}>■</span> Sobre</span>
                <span><span style={{ color: accent }}>┅</span> {esMensual ? 'Lím. Mensual' : 'Lím. Diario'}</span>
                <span><span style={{ color: '#f59e0b' }}>━</span> Media</span>
              </div>
            </div>
          )}

          {/* Estadísticas de período */}
          <div className="row g-2 text-center">
            <div className="col-4">
              <div className="bg-white bg-opacity-5 rounded-2 p-2">
                <div className="text-secondary" style={{ fontSize: '0.55rem' }}>MENSUAL</div>
                <div className="fw-bold" style={{ fontSize: '0.9rem', color: accent }}>{f(limiteMensual)}</div>
              </div>
            </div>
            <div className="col-4">
              <div className="bg-white bg-opacity-5 rounded-2 p-2">
                <div className="text-secondary" style={{ fontSize: '0.55rem' }}>SEMANAL</div>
                <div className="fw-bold" style={{ fontSize: '0.9rem', color: accent }}>{f(numAmount / 52)}</div>
              </div>
            </div>
            <div className="col-4">
              <div className="bg-white bg-opacity-5 rounded-2 p-2">
                <div className="text-secondary" style={{ fontSize: '0.55rem' }}>DIARIO</div>
                <div className="fw-bold text-info" style={{ fontSize: '0.9rem' }}>{f(limiteDiario, 2)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black bg-opacity-40 py-2 px-4 d-flex justify-content-between align-items-center border-top border-secondary border-opacity-10">
          <span className="text-secondary fw-bold" style={{ fontSize: '0.55rem' }}>DATA: FY{new Date().getFullYear()}</span>
          <div className="d-flex align-items-center gap-1">
            <div className="rounded-circle bg-success" style={{ width: '6px', height: '6px' }}></div>
            <span className="text-secondary" style={{ fontSize: '0.55rem' }}>LIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
});

// Tarjeta especial de combustible con selector de período (CONTROLADO POR PADRE)
const FuelBudgetCard = memo(({ presupuesto, gastado, historial = [], accent = '#f59e0b', periodoData, containerClass = "col-12 col-xl-6 col-xxl-4 mb-4" }) => {
  const { fechaInicio, fechaFin, diasEnPeriodo, limitePeriodo, labelPeriodo } = periodoData;

  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  
  // Filtrar historial por período seleccionado (usando props del padre)
  const { gastosPeriodo, historialFiltrado } = useMemo(() => {
    const filtrado = historial.filter(g => {
      const fecha = new Date(g.fecha);
      // Ajustar fechas para comparación correcta (inicio a las 00:00, fin a las 23:59)
      const inicio = new Date(fechaInicio); inicio.setHours(0,0,0,0);
      const fin = new Date(fechaFin); fin.setHours(23,59,59,999);
      
      return fecha >= inicio && fecha <= fin;
    });
    const total = filtrado.reduce((sum, g) => sum + parseFloat(g.monto || 0), 0);
    return { gastosPeriodo: total, historialFiltrado: filtrado };
  }, [historial, fechaInicio, fechaFin]);
  
  const pctPeriodo = limitePeriodo > 0 ? (gastosPeriodo / limitePeriodo) * 100 : 0;
  const excedePerido = gastosPeriodo > limitePeriodo && limitePeriodo > 0;
  
  // Cálculos generales (anuales/totales) para badges superiores
  const excedidoAnual = gastado > presupuesto && presupuesto > 0;
  const restanteAnual = presupuesto - gastado;

  // Lógica de visualización (Días vs Meses)
  const esMensual = diasEnPeriodo > 60;

  return (
    <div className={containerClass}>
      <div className="card h-100 border-0 shadow-lg rounded-4 overflow-hidden bg-dark text-white border-top border-4" style={{ borderTopColor: accent }}>
        <div className="card-body p-4">
          
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <p className="text-secondary fw-bold mb-1 text-uppercase small tracking-widest">
                ⛽ Combustible
              </p>
              <h2 className="fw-bolder mb-0 display-6" style={{ color: accent }}>
                {f(presupuesto)}
                <span className="fs-6 text-secondary ms-2 fw-normal">/ AÑO</span>
              </h2>
            </div>
            <div className={`p-2 rounded-3 ${excedidoAnual ? 'bg-danger bg-opacity-25' : 'bg-success bg-opacity-15'}`}>
              {excedidoAnual ? <AlertTriangle size={24} className="text-danger" /> : <DollarSign size={24} style={{ color: accent }} />}
            </div>
          </div>

          {/* Comparación del Período Seleccionado */}
          <div className="bg-white bg-opacity-5 rounded-3 p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-warning fw-bold">📊 {labelPeriodo}</span>
              <span className={`badge rounded-pill ${excedePerido ? 'bg-danger' : pctPeriodo > 75 ? 'bg-warning text-dark' : 'bg-success'}`}>
                {Math.round(pctPeriodo)}%
              </span>
            </div>
            
            {/* Barra de progreso del período */}
            <div className="progress mb-3" style={{ height: '8px', backgroundColor: '#1e293b', borderRadius: '8px' }}>
              <div 
                className={`progress-bar rounded-pill ${excedePerido ? 'bg-danger' : pctPeriodo > 75 ? 'bg-warning' : 'bg-success'}`} 
                style={{ width: `${Math.min(pctPeriodo, 100)}%`, transition: 'width 0.5s ease' }} 
              />
            </div>
            
            {/* Gráfica Estilo Trading - Candlestick */}
            {(() => {
              const chartData = [];
              const limiteDiarioCalc = presupuesto / 365;
              const limiteMensualCalc = presupuesto / 12;

              if (esMensual) {
                // AGREGACIÓN MENSUAL (Para periodos largos)
                const gastosPorMes = {};
                historialFiltrado.forEach(g => {
                  const fecha = new Date(g.fecha);
                  // Clave YYYY-MM
                  const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
                  if (!gastosPorMes[key]) gastosPorMes[key] = 0;
                  gastosPorMes[key] += parseFloat(g.monto || 0);
                });

                // Generar meses del rango
                const mesesNombres = ['Ebe', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                const numMeses = Math.ceil(diasEnPeriodo / 30);
                const current = new Date(fechaInicio);
                
                // Iterar mes a mes desde inicio hasta fin
                while (current <= fechaFin) {
                   const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
                   const gasto = gastosPorMes[key] || 0;
                   const label = mesesNombres[current.getMonth()];
                   
                   chartData.push({
                     label: label,
                     gasto: gasto,
                     limite: limiteMensualCalc,
                     excede: gasto > limiteMensualCalc
                   });
                   
                   // Avanzar al mes siguiente
                   current.setMonth(current.getMonth() + 1);
                }
              } else {
                // AGREGACIÓN DIARIA (Para periodos cortos)
                const gastosPorDia = {};
                historialFiltrado.forEach(g => {
                  const fechaStr = g.fecha; // YYYY-MM-DD
                  if (!gastosPorDia[fechaStr]) gastosPorDia[fechaStr] = 0;
                  gastosPorDia[fechaStr] += parseFloat(g.monto || 0);
                });

                // Rellenar días, máximo 60 para visualización
                const diasMostrar = Math.min(diasEnPeriodo, 60);
                
                for (let i = 0; i < diasMostrar; i++) {
                   const fecha = new Date(fechaInicio);
                   fecha.setDate(fecha.getDate() + i);
                   if (fecha > fechaFin) break;
                   
                   const fechaStr = fecha.toISOString().split('T')[0];
                   const gasto = gastosPorDia[fechaStr] || 0;
                   
                   chartData.push({
                     label: fecha.getDate(), // Día del mes
                     gasto: gasto,
                     limite: limiteDiarioCalc,
                     excede: gasto > limiteDiarioCalc
                   });
                }
              }
              
              // Calcular media móvil
              let acumulado = 0;
              chartData.forEach((d, i) => {
                acumulado += d.gasto;
                d.mediaMovil = acumulado / (i + 1);
              });
              
              return (
                <div style={{ 
                  width: '100%', 
                  height: 'auto', 
                  minHeight: 240,
                  background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                  borderRadius: 8,
                  padding: '10px 5px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Grid lines overlay */}
                  <div style={{
                    position: 'absolute',
                    top: 10,
                    left: 40,
                    right: 10,
                    bottom: 30,
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 25%, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.03) 26%)',
                    pointerEvents: 'none'
                  }} />
                  
                  <ResponsiveContainer width="100%" height={240}>
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                      barCategoryGap="15%"
                    >
                      <XAxis 
                        dataKey="label" 
                        axisLine={{ stroke: '#334155' }}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        hide 
                        domain={[0, 'auto']}
                      />
                      <Tooltip 
                        formatter={(value, name) => [f(value), name === 'gasto' ? 'Monto Ingresado' : name === 'limite' ? (esMensual ? 'Lím. Mensual' : 'Lím. Diario') : 'Media']}
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #475569', 
                          borderRadius: 6,
                          fontSize: 11,
                          color: '#f8fafc'
                        }}
                        itemStyle={{ color: '#f8fafc' }}
                        labelFormatter={(label) => esMensual ? `Mes ${label}` : `Día ${label}`}
                        labelStyle={{ color: '#cbd5e1', marginBottom: '0.25rem' }}
                      />
                      <ReferenceLine 
                        y={esMensual ? (presupuesto / 12) : (presupuesto / 365)} 
                        stroke="#3b82f6" 
                        strokeDasharray="3 3" 
                        strokeWidth={2}
                        label={{ 
                          value: esMensual 
                            ? `Lím. Mensual: ${f(presupuesto / 12)}`
                            : `Lím. Diario: ${f(presupuesto / 365)} | Men: ${f(presupuesto / 12)}`,
                          position: 'insideTopRight', 
                          fill: '#3b82f6', 
                          fontSize: 10,
                          fontWeight: 'bold',
                          offset: 10
                        }}
                      />
                      <Bar 
                        dataKey="gasto" 
                        radius={[2, 2, 0, 0]}
                        minPointSize={2}
                      >
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.gasto === 0 ? '#334155' : entry.excede ? '#ef4444' : '#22c55e'} 
                          />
                        ))}
                      </Bar>
                      <Line 
                        type="monotone" 
                        dataKey="mediaMovil" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                  
                  {/* Leyenda */}
                  <div className="d-flex justify-content-center gap-3 mt-1" style={{ fontSize: '0.6rem' }}>
                    <span><span style={{ color: '#22c55e' }}>■</span> Bajo límite</span>
                    <span><span style={{ color: '#ef4444' }}>■</span> Sobre límite</span>
                    <span><span style={{ color: '#3b82f6' }}>┅</span> {esMensual ? 'Lím. Mensual' : 'Lím. Diario'}</span>
                    <span><span style={{ color: '#f59e0b' }}>━</span> Media</span>
                  </div>
                </div>
              );
            })()}
            
            {/* Stats del período */}
            <div className="d-flex justify-content-between mt-3 text-center">
              <div>
                <div className="small text-secondary" style={{ fontSize: '0.6rem' }}>LÍMITE EST.</div>
                <div className="fw-bold text-info" style={{ fontSize: '0.85rem' }}>{f(limitePeriodo)}</div>
              </div>
              <div>
                <div className="small text-secondary" style={{ fontSize: '0.6rem' }}>GASTADO</div>
                <div className={`fw-bold ${excedePerido ? 'text-danger' : 'text-success'}`} style={{ fontSize: '0.85rem' }}>{f(gastosPeriodo)}</div>
              </div>
              <div>
                <div className="small text-secondary" style={{ fontSize: '0.6rem' }}>{excedePerido ? 'EXCESO' : 'AHORRO'}</div>
                <div className={`fw-bold ${excedePerido ? 'text-danger' : 'text-success'}`} style={{ fontSize: '0.85rem' }}>
                  {excedePerido ? '+' : ''}{f(Math.abs(limitePeriodo - gastosPeriodo))}
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas anuales */}
          <div className="row g-3 mb-3">
            <div className="col-6">
              <div className="bg-white bg-opacity-5 rounded-3 p-3 text-center">
                <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
                  <TrendingDown size={14} className="text-danger" />
                  <span style={{ fontSize: '0.65rem' }} className="text-secondary">GASTADO ANUAL</span>
                </div>
                <span className="fw-bold fs-5 text-danger">{f(gastado)}</span>
              </div>
            </div>
            <div className="col-6">
              <div className="bg-white bg-opacity-5 rounded-3 p-3 text-center">
                <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
                  <DollarSign size={14} className={restanteAnual >= 0 ? 'text-success' : 'text-danger'} />
                  <span style={{ fontSize: '0.65rem' }} className="text-secondary">{restanteAnual >= 0 ? 'DISPONIBLE' : 'EXCEDIDO'}</span>
                </div>
                <span className={`fw-bold fs-5 ${restanteAnual >= 0 ? 'text-success' : 'text-danger'}`}>{f(Math.abs(restanteAnual))}</span>
              </div>
            </div>
          </div>

          {/* Botón historial */}
          <button 
            onClick={() => setMostrarHistorial(!mostrarHistorial)}
            className="btn btn-outline-light btn-sm w-100 rounded-pill mb-2"
          >
            {mostrarHistorial ? '▲ Ocultar' : `▼ Historial del Período (${historialFiltrado.length})`}
          </button>

          {/* Historial filtrado por período */}
          {mostrarHistorial && historialFiltrado.length > 0 && (
            <div className="bg-white bg-opacity-5 rounded-3 p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {historialFiltrado.slice(0, 10).map((g, i) => (
                <div key={i} className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary border-opacity-10">
                  <div>
                    <span className="small text-light">{new Date(g.fecha).toLocaleDateString('es-MX')}</span>
                    {g.empleado_nombre && <span className="ms-2 small text-secondary">({g.empleado_nombre})</span>}
                  </div>
                  <span className="fw-bold text-warning">{f(g.monto)}</span>
                </div>
              ))}
            </div>
          )}

          {mostrarHistorial && historialFiltrado.length === 0 && (
            <div className="text-center text-secondary small py-3">
              Sin registros en este período
            </div>
          )}

        </div>

        <div className="bg-black bg-opacity-40 py-2 px-4 d-flex justify-content-between align-items-center border-top border-secondary border-opacity-10">
          <span className="text-secondary fw-bold" style={{ fontSize: '0.55rem' }}>GASTOS {new Date().getFullYear()}</span>
          <div className="d-flex align-items-center gap-1">
            <div className={`rounded-circle ${excedidoAnual ? 'bg-danger' : 'bg-success'}`} style={{ width: '6px', height: '6px' }}></div>
            <span className="text-secondary" style={{ fontSize: '0.55rem' }}>{excedidoAnual ? 'ALERTA EXCESO' : 'EN PRESUPUESTO'}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

const VehiculosInfo = memo(({ seleccionado, gastosCombustible = { total: 0, gastos: [] } }) => {
  const [filtro, setFiltro] = useState('todos');
  
  // Estado para fechas (Default: Mes actual)
  const [fechas, setFechas] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    // Inicio de mes
    const inicio = `${year}-${month}-01`;
    // Fin de mes (o día actual)
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    const fin = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
    return { inicio, fin };
  });

  // Calcular periodoData basado en fechas seleccionadas
  const periodoData = useMemo(() => {
    const inicioDate = new Date(fechas.inicio + 'T00:00:00');
    const finDate = new Date(fechas.fin + 'T23:59:59');
    
    // Calcular diferencia en días
    const diffTime = Math.abs(finDate - inicioDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    // Mínimo 1 día
    const dias = Math.max(1, diffDays);

    return {
      fechaInicio: inicioDate,
      fechaFin: finDate,
      diasEnPeriodo: dias,
      limitePeriodo: 0, // Placeholder
      labelPeriodo: `${dias} Días`
    };
  }, [fechas]);

  if (!seleccionado) return null;

  const categorias = [
    { id: 'todos', label: 'Todos', icon: '📊' },
    { id: 'seguro', label: 'Seguros', icon: '🛡️' },
    { id: 'combustible', label: 'Combustible', icon: '⛽' },
    { id: 'mantenimiento', label: 'Mantenimiento', icon: '🔧' },
    { id: 'tramites', label: 'Trámites', icon: '📋' },
  ];

  const graficas = [
    { id: 'combustible', title: 'Combustible', accent: '#f59e0b', field: 'costo_gasolina_anual', categoria: 'combustible', esCombustible: true },
    { id: 'seguro', title: 'Seguro de Unidad', accent: '#e11d48', field: 'costo_seguro_anual', categoria: 'seguro' },
    { id: 'deducible', title: 'Deducible de Seguro', accent: '#f59e0b', field: 'costo_deducible_seguro_anual', categoria: 'seguro' },
    { id: 'aceite', title: 'Mantenimiento Aceite', accent: '#3b82f6', field: 'costo_aceite_anual', categoria: 'mantenimiento' },
    { id: 'ecologico', title: 'Engomado Ecológico', accent: '#2dd4bf', field: 'costo_ecologico_anual', categoria: 'tramites' },
    { id: 'placas', title: 'Trámite de Placas', accent: '#6366f1', field: 'costo_placas_anual', categoria: 'tramites' },
    { id: 'servicio', title: 'Servicio General', accent: '#f43f5e', field: 'costo_servicio_general_anual', categoria: 'mantenimiento' },
    { id: 'llantas', title: 'Neumáticos / Llantas', accent: '#10b981', field: 'costo_llantas_anual', categoria: 'mantenimiento' },
    { id: 'frenos', title: 'Servicio de Frenos', accent: '#8b5cf6', field: 'costo_frenos_anual', categoria: 'mantenimiento' },
    { id: 'lavado', title: 'Limpieza y Lavado', accent: '#06b6d4', field: 'costo_lavado_anual', categoria: 'mantenimiento' },
  ];

  const graficasFiltradas = filtro === 'todos' 
    ? graficas 
    : graficas.filter(g => g.categoria === filtro);

  return (
    <div className="container-fluid px-0">
      {/* Filtros de categoría y Selector de Fecha */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 p-2 bg-white rounded-pill shadow-sm">
        {/* Filtros (Izquierda) */}
        <div className="d-flex flex-wrap gap-2">
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFiltro(cat.id)}
              className={`btn rounded-pill d-flex align-items-center gap-2 px-3 py-2 fw-bold transition-all ${
                filtro === cat.id 
                  ? 'btn-dark shadow-sm' 
                  : 'btn-light text-muted border-0'
              }`}
              style={{ fontSize: '0.85rem' }}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>

        {/* Selector de Rango de Fechas (Derecha) - Estilo Personalizado */}
        <div className="d-flex align-items-center gap-2 pe-3 border-start ps-3">
          <span className="text-secondary fw-bold small text-uppercase me-1" style={{ fontSize: '10px' }}>Desde:</span>
           <input
            type="date"
            className="border-0 bg-transparent fw-bold small text-dark"
            style={{ outline: 'none', width: 'auto', cursor: 'pointer' }}
            value={fechas.inicio}
            onChange={(e) => setFechas(prev => ({ ...prev, inicio: e.target.value }))}
          />
          <div className="vr mx-2 opacity-25"></div>
          <span className="text-secondary fw-bold small text-uppercase me-1" style={{ fontSize: '10px' }}>Hasta:</span>
           <input
            type="date"
            className="border-0 bg-transparent fw-bold small text-dark"
            style={{ outline: 'none', width: 'auto', cursor: 'pointer' }}
            value={fechas.fin}
            onChange={(e) => setFechas(prev => ({ ...prev, fin: e.target.value }))}
          />
        </div>
      </div>

      {/* Tarjetas de costos filtradas */}
      <div className="row g-4 mb-5 animate__animated animate__fadeIn">
        {graficasFiltradas.map(g => {
          // Calcular límite específico para este componente
          const presupuesto = parseFloat(seleccionado[g.field]) || 0;
          const limiteDiario = presupuesto / 365;
          const currentPeriodoData = {
            ...periodoData,
            limitePeriodo: limiteDiario * periodoData.diasEnPeriodo
          };

          return g.esCombustible ? (
            <FuelBudgetCard 
              key={g.id} 
              presupuesto={presupuesto} 
              gastado={gastosCombustible.total || 0}
              historial={gastosCombustible.gastos || []}
              accent={g.accent}
              periodoData={currentPeriodoData}
              containerClass="col-12 mb-4"
            />
          ) : (
            <InfoColumn 
              key={g.id} 
              title={g.title} 
              accent={g.accent} 
              amount={seleccionado[g.field]} 
              diasEnPeriodo={periodoData.diasEnPeriodo}
              fechaInicio={periodoData.fechaInicio}
              fechaFin={periodoData.fechaFin}
            />
          );
        })}
      </div>
    </div>
  );
});

export default VehiculosInfo;