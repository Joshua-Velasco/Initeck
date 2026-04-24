import React, { useMemo, useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, AlertCircle, ShieldCheck, Wallet, PiggyBank,
  X, Receipt, Wrench, Fuel, Tag, ChevronRight,
  TrendingDown, CheckCircle
} from 'lucide-react';
import { GASTOS_COMBUSTIBLE_URL, TALLER_GASTOS_PIEZAS_URL } from '../../../config.js';

const fmtM    = v => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v || 0);
const fmtFull = v => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(v || 0);
const fmtDate = s => s ? new Date(s + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const FUENTE = {
  Taller:   { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: Wrench,    label: 'Taller' },
  Chofer:   { color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', icon: Fuel,      label: 'Chofer' },
  Piezas:   { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: Tag,       label: 'Piezas' },
  Finanzas: { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: DollarSign,label: 'Finanzas' },
};

/* ── Panel de historial (full-width) ─────────────────────── */
function PanelHistorial({ item, onClose }) {
  if (!item) return null;
  const { categoria, gastado, presupuesto, excedido, detalles } = item;
  const pct         = presupuesto > 0 ? Math.min(100, (gastado / presupuesto) * 100) : 0;
  const barColor    = excedido ? '#ef4444' : '#3b82f6';
  const sorted      = [...detalles].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  // Agrupación por fuente para mini resumen
  const porFuente = sorted.reduce((acc, t) => {
    acc[t.fuente] = (acc[t.fuente] || 0) + t.monto;
    return acc;
  }, {});

  return (
    <div className="animate__animated animate__fadeInDown" style={{ animationDuration: '.2s' }}>
      <div className="rounded-4 overflow-hidden" style={{
        border: `2px solid ${excedido ? '#fca5a5' : '#bfdbfe'}`,
        background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,.08)'
      }}>

        {/* Header */}
        <div className="px-4 py-3 d-flex align-items-center justify-content-between"
          style={{ background: excedido ? 'linear-gradient(135deg,#fef2f2,#fee2e2)' : 'linear-gradient(135deg,#eff6ff,#dbeafe)', borderBottom: `1px solid ${excedido ? '#fecaca' : '#bfdbfe'}` }}>
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-3 d-flex align-items-center justify-content-center"
              style={{ width: 40, height: 40, background: excedido ? '#fee2e2' : '#dbeafe', border: `1.5px solid ${excedido ? '#fca5a5' : '#93c5fd'}` }}>
              <Receipt size={18} style={{ color: excedido ? '#dc2626' : '#2563eb' }} />
            </div>
            <div>
              <h6 className="fw-black mb-0" style={{ fontSize: 15, color: '#0f172a' }}>
                Historial · {categoria}
              </h6>
              <p className="mb-0" style={{ fontSize: 11, color: '#64748b' }}>
                {sorted.length} transacción{sorted.length !== 1 ? 'es' : ''} en {new Date().getFullYear()}
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* Mini stats */}
            <div className="d-none d-md-flex align-items-center gap-3">
              <div className="text-center">
                <p className="mb-0 fw-black" style={{ fontSize: 15, color: '#2563eb' }}>{fmtM(presupuesto)}</p>
                <p className="mb-0" style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>Presupuesto</p>
              </div>
              <ChevronRight size={14} style={{ color: '#cbd5e1' }} />
              <div className="text-center">
                <p className="mb-0 fw-black" style={{ fontSize: 15, color: excedido ? '#dc2626' : '#0f172a' }}>{fmtM(gastado)}</p>
                <p className="mb-0" style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>Gastado</p>
              </div>
              <div className="rounded-pill px-3 py-1 d-flex align-items-center gap-1 fw-bold"
                style={{ background: excedido ? '#fef2f2' : '#f0fdf4', border: `1px solid ${excedido ? '#fca5a5' : '#86efac'}`, fontSize: 12, color: excedido ? '#dc2626' : '#15803d' }}>
                {excedido ? <TrendingDown size={12}/> : <CheckCircle size={12}/>}
                {excedido ? `+${fmtM(gastado - presupuesto)}` : fmtM(presupuesto - gastado)}
              </div>
            </div>
            <button className="btn btn-sm d-flex align-items-center justify-content-center rounded-circle border-0"
              style={{ width: 32, height: 32, background: '#f1f5f9', color: '#64748b' }}
              onClick={onClose}>
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Barra de progreso */}
          {presupuesto > 0 && (
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-1">
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Ejecución del presupuesto</span>
                <span className="fw-black" style={{ fontSize: 11, color: barColor }}>{Math.round(pct)}%</span>
              </div>
              <div className="rounded-pill overflow-hidden" style={{ height: 8, background: '#f1f5f9' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 99, transition: 'width 1s ease' }} />
              </div>
            </div>
          )}

          {/* Chips por fuente */}
          {Object.keys(porFuente).length > 0 && (
            <div className="d-flex flex-wrap gap-2 mb-4">
              {Object.entries(porFuente).map(([fuente, total]) => {
                const f = FUENTE[fuente] || FUENTE.Taller;
                const FIcon = f.icon;
                return (
                  <span key={fuente} className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-1 fw-bold"
                    style={{ background: f.bg, border: `1px solid ${f.border}`, fontSize: 12, color: f.color }}>
                    <FIcon size={12} /> {fuente}: {fmtM(total)}
                  </span>
                );
              })}
            </div>
          )}

          {/* Lista de transacciones */}
          {sorted.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <Receipt size={32} className="opacity-25 mb-2 d-block mx-auto" />
              <p className="mb-0 small">Sin registros de gasto para esta categoría.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {sorted.map((t, i) => {
                const f = FUENTE[t.fuente] || FUENTE.Taller;
                const FIcon = f.icon;
                const pctItem = gastado > 0 ? (t.monto / gastado) * 100 : 0;
                return (
                  <div key={i} className="d-flex align-items-center gap-3 rounded-3 p-3"
                    style={{ background: f.bg, border: `1px solid ${f.border}` }}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 36, height: 36, background: `${f.color}18`, border: `1.5px solid ${f.border}` }}>
                      <FIcon size={15} style={{ color: f.color }} />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                      <p className="mb-0 fw-semibold text-truncate" style={{ fontSize: 13, color: '#0f172a' }}>
                        {t.descripcion}
                      </p>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <span style={{ fontSize: 10, color: '#94a3b8' }}>{fmtDate(t.fecha)}</span>
                        <span className="rounded-pill px-2 fw-bold" style={{ fontSize: 9, background: f.bg, color: f.color, border: `1px solid ${f.border}` }}>
                          {f.label}
                        </span>
                      </div>
                    </div>
                    <div className="text-end flex-shrink-0">
                      <p className="mb-0 fw-black" style={{ fontSize: 14, color: f.color }}>{fmtFull(t.monto)}</p>
                      {gastado > 0 && (
                        <p className="mb-0" style={{ fontSize: 9, color: '#94a3b8' }}>{pctItem.toFixed(1)}% del total</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Tarjeta compacta de categoría ───────────────────────── */
function BudgetCard({ item, isSelected, onClick }) {
  const { categoria, gastado, presupuesto, excedido, porcentaje, restante, detalles } = item;
  const barColor   = excedido ? '#ef4444' : porcentaje >= 80 ? '#f59e0b' : '#3b82f6';
  const pctDisplay = excedido ? 'Excedido' : `${Math.round(porcentaje)}%`;
  const hasData    = detalles.length > 0;

  return (
    <button
      className="btn w-100 text-start border-0 rounded-4 p-0 overflow-hidden"
      onClick={onClick}
      style={{
        background: isSelected ? '#fff' : '#f8fafc',
        border: `2px solid ${isSelected ? (excedido ? '#fca5a5' : '#93c5fd') : (excedido ? '#fecaca' : '#e2e8f0')} !important`,
        outline: isSelected ? `2px solid ${excedido ? '#fca5a5' : '#93c5fd'}` : 'none',
        transition: 'all .18s',
        boxShadow: isSelected ? `0 4px 20px ${excedido ? 'rgba(239,68,68,.12)' : 'rgba(59,130,246,.12)'}` : 'none',
        cursor: 'pointer',
      }}>

      {/* Barra de color superior */}
      <div style={{ height: 3, background: excedido ? '#ef4444' : isSelected ? '#3b82f6' : '#e2e8f0', transition: 'background .18s' }} />

      <div className="p-3">
        {/* Título + badge % */}
        <div className="d-flex align-items-start justify-content-between mb-2 gap-2">
          <span className="fw-bold" style={{ fontSize: 13, color: '#0f172a', lineHeight: 1.3 }}>{categoria}</span>
          <span className="rounded-pill px-2 py-1 fw-black flex-shrink-0"
            style={{
              fontSize: 10,
              background: excedido ? '#fef2f2' : porcentaje >= 80 ? '#fffbeb' : porcentaje > 0 ? '#eff6ff' : '#f8fafc',
              color: excedido ? '#dc2626' : porcentaje >= 80 ? '#d97706' : porcentaje > 0 ? '#2563eb' : '#94a3b8',
              border: `1px solid ${excedido ? '#fca5a5' : porcentaje >= 80 ? '#fde68a' : porcentaje > 0 ? '#bfdbfe' : '#e2e8f0'}`,
            }}>
            {pctDisplay}
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="rounded-pill mb-3 overflow-hidden" style={{ height: 5, background: '#f1f5f9' }}>
          <div style={{ width: `${Math.min(100, porcentaje)}%`, height: '100%', background: barColor, borderRadius: 99, transition: 'width 1s ease' }} />
        </div>

        {/* Monto gastado grande + presupuesto */}
        <div className="d-flex justify-content-between align-items-end">
          <div>
            <p className="mb-0" style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>Gastado</p>
            <p className="mb-0 fw-black" style={{ fontSize: 16, color: excedido ? '#dc2626' : '#0f172a', lineHeight: 1.1 }}>{fmtM(gastado)}</p>
          </div>
          <div className="text-end">
            <p className="mb-0" style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>Presupuesto</p>
            <p className="mb-0 fw-bold" style={{ fontSize: 13, color: '#64748b' }}>{fmtM(presupuesto)}</p>
          </div>
        </div>

        {/* Disponible / Excedido */}
        <div className="mt-2 pt-2 border-top d-flex align-items-center justify-content-between">
          <span style={{ fontSize: 10, color: excedido ? '#dc2626' : '#15803d', fontWeight: 700 }}>
            {excedido ? `⚠ Excedido ${fmtM(gastado - presupuesto)}` : presupuesto > 0 ? `$ Disp. ${fmtM(restante)}` : '—'}
          </span>
          {hasData && (
            <span className="d-flex align-items-center gap-1" style={{ fontSize: 9, color: '#94a3b8' }}>
              <Receipt size={9} /> {detalles.length}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ── Componente principal ─────────────────────────────────── */
export default function GraficoPresupuesto({ vehiculo, mantenimientos }) {
  const currentYear = new Date().getFullYear();

  const [gastosChoferData,    setGastosChoferData]    = useState(0);
  const [gastosChoferRecords, setGastosChoferRecords] = useState([]);
  const [gastosPiezasTotal,   setGastosPiezasTotal]   = useState(0);
  const [gastosPiezasRecords, setGastosPiezasRecords] = useState([]);
  const [selectedCat,         setSelectedCat]         = useState(null);

  useEffect(() => {
    if (!vehiculo?.id) return;
    setSelectedCat(null);

    fetch(`${GASTOS_COMBUSTIBLE_URL}?vehiculo_id=${vehiculo.id}`)
      .then(r => r.ok ? r.json() : {})
      .then(data => {
        if (data.status === 'success') {
          setGastosChoferData(parseFloat(data.total_gastado || 0));
          setGastosChoferRecords(Array.isArray(data.gastos) ? data.gastos : []);
        }
      }).catch(() => {});

    fetch(`${TALLER_GASTOS_PIEZAS_URL}?unidad_id=${vehiculo.id}&vehiculo_id=${vehiculo.id}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          const del = data.filter(g => g.fecha && parseInt(String(g.fecha).split('-')[0], 10) === currentYear);
          setGastosPiezasTotal(del.reduce((s, g) => s + parseFloat(g.costo_total || 0), 0));
          setGastosPiezasRecords(del);
        }
      }).catch(() => {});
  }, [vehiculo?.id, currentYear]);

  const CATEGORIAS = {
    'Seguro':                    { field: 'costo_seguro_anual',           label: 'Seguro',         keywords: ['seguro', 'póliza'] },
    'Deducible Seguro':          { field: 'costo_deducible_seguro_anual', label: 'Deducible',      keywords: ['deducible'] },
    'Trámites (Placas/Tenencia)':{ field: 'costo_placas_anual',          label: 'Placas/Tenencia',keywords: ['placa', 'tenencia', 'derechos'] },
    'Verificación Ecológica':    { field: 'costo_ecologico_anual',        label: 'Ecológico',      keywords: ['ecológico', 'verificación', 'emisiones'] },
    'Aceite':                    { field: 'costo_aceite_anual',           label: 'Aceite',         keywords: ['aceite'] },
    'Tune Up':                   { field: 'costo_tuneup_anual',           label: 'Tune Up',        keywords: ['tune', 'afinación'] },
    'Frenos':                    { field: 'costo_frenos_anual',           label: 'Frenos',         keywords: ['freno', 'balata', 'disco', 'rectificado'] },
    'Llantas':                   { field: 'costo_llantas_anual',          label: 'Llantas',        keywords: ['llanta', 'neumático', 'rotación', 'alineación', 'balanceo'] },
    'Lavado':                    { field: 'costo_lavado_anual',           label: 'Lavado',         keywords: ['lavado', 'limpieza', 'detail'] },
    'Combustible':               { field: 'costo_gasolina_anual',         label: 'Gasolina',       keywords: ['gasolina', 'diesel', 'combustible'] },
    'Servicio General':          { field: 'costo_servicio_general_anual', label: 'Servicio Gral.', keywords: ['servicio', 'mantenimiento'] },
    'Otro':                      { field: null,                           label: 'Otros',          keywords: [] },
  };

  const datos = useMemo(() => {
    if (!vehiculo) return [];
    const gastosReales   = {};
    const detallesReales = {};
    Object.keys(CATEGORIAS).forEach(k => { gastosReales[k] = 0; detallesReales[k] = []; });

    mantenimientos.forEach(m => {
      if (new Date(m.fecha).getFullYear() !== currentYear) return;
      let cat = 'Otro';
      const txt = ((m.tipo || '') + ' ' + (m.descripcion || '')).toLowerCase();
      for (const [key, cfg] of Object.entries(CATEGORIAS)) {
        if (key === 'Otro') continue;
        if (cfg.keywords.some(kw => txt.includes(kw))) { cat = key; break; }
      }
      const monto = parseFloat(m.costo_total || 0);
      gastosReales[cat] += monto;
      detallesReales[cat].push({ fecha: m.fecha, descripcion: [m.tipo, m.descripcion].filter(Boolean).join(' – ') || 'Mantenimiento', monto, fuente: 'Taller' });
    });

    gastosReales['Combustible'] += gastosChoferData;
    gastosChoferRecords.forEach(g => detallesReales['Combustible'].push({ fecha: g.fecha, descripcion: g.tipo || 'Carga de combustible', monto: parseFloat(g.monto || 0), fuente: 'Chofer' }));

    gastosReales['Servicio General'] += gastosPiezasTotal;
    gastosPiezasRecords.forEach(g => detallesReales['Servicio General'].push({ fecha: g.fecha, descripcion: g.descripcion || g.nombre || 'Refacción / Pieza', monto: parseFloat(g.costo_total || 0), fuente: 'Piezas' }));

    // Pagos del Checklist Financiero (Finanzas tab) — solo costos fijos donde presupuesto = gasto real
    // Mantenimiento General se excluye: su gasto real viene de registros de taller/piezas
    const finanzaMap = [
      { dateField: 'fecha_pago_placas',   catKey: 'Trámites (Placas/Tenencia)', limitField: 'costo_placas_anual',   label: 'Pago Placas/Tenencia' },
      { dateField: 'fecha_pago_seguro',   catKey: 'Seguro',                     limitField: 'costo_seguro_anual',   label: 'Pago Seguro de Cobertura' },
      { dateField: 'fecha_pago_ecologico',catKey: 'Verificación Ecológica',     limitField: 'costo_ecologico_anual',label: 'Verificación Ecológica' },
    ];
    finanzaMap.forEach(({ dateField, catKey, limitField, label }) => {
      const fecha = vehiculo[dateField];
      if (!fecha) return;
      const year = parseInt(String(fecha).split('-')[0], 10);
      if (year !== currentYear) return;
      const monto = parseFloat(vehiculo[limitField] || 0);
      if (!monto) return;
      gastosReales[catKey] += monto;
      detallesReales[catKey].push({ fecha, descripcion: label, monto, fuente: 'Finanzas' });
    });

    return Object.entries(CATEGORIAS).map(([key, cfg]) => {
      const presupuesto = cfg.field ? parseFloat(vehiculo[cfg.field] || 0) : 0;
      const gastado     = gastosReales[key] || 0;
      return {
        categoria: cfg.label,
        presupuesto, gastado,
        restante:   presupuesto - gastado,
        porcentaje: presupuesto > 0 ? Math.min((gastado / presupuesto) * 100, 100) : 0,
        excedido:   gastado > presupuesto && presupuesto > 0,
        detalles:   detallesReales[key] || [],
      };
    }).filter(d => d.presupuesto > 0 || d.gastado > 0);
  }, [vehiculo, mantenimientos, currentYear, gastosChoferData, gastosChoferRecords, gastosPiezasTotal, gastosPiezasRecords]);

  const datosKpi         = datos.filter(d => d.categoria !== 'Gasolina');
  const totalPresupuesto = datosKpi.reduce((s, d) => s + d.presupuesto, 0);
  const totalGastado     = datos.reduce((s, d) => s + d.gastado, 0); // incluye Gasolina en ejecución
  const totalDisponible  = totalPresupuesto - totalGastado;
  const pctSalud = totalPresupuesto > 0 ? Math.max(0, Math.min(100, (totalDisponible / totalPresupuesto) * 100)) : 100;
  const saludColor = pctSalud >= 60 ? '#10b981' : pctSalud >= 30 ? '#f59e0b' : '#ef4444';
  const saludLabel = pctSalud >= 60 ? 'Saludable' : pctSalud >= 30 ? 'Moderado' : 'Crítico';

  const selectedItem = datos.find(d => d.categoria === selectedCat) || null;

  if (!vehiculo) return null;

  return (
    <div className="animate__animated animate__fadeIn">

      {/* ── KPIs — mismo estilo que MetricasTarjetas (General) ── */}
      <div className="row g-2 mb-4">
        {[
          { label: 'PRESUPUESTO ANUAL', val: fmtM(totalPresupuesto),              icon: Wallet,      color: '#000000', isMain: true,  sub: `${currentYear} · sin gasolina` },
          { label: 'GASTADO',           val: fmtM(totalGastado),                  icon: TrendingUp,  color: '#dc2626', sub: totalPresupuesto > 0 ? `${Math.round((totalGastado/totalPresupuesto)*100)}% del presupuesto` : `Calculado ${currentYear}` },
          { label: 'DISPONIBLE',        val: fmtM(Math.max(0, totalDisponible)),  icon: PiggyBank,   color: totalDisponible >= 0 ? '#15803d' : '#dc2626', sub: totalDisponible < 0 ? `Excedido ${fmtM(Math.abs(totalDisponible))}` : `Calculado ${currentYear}` },
          { label: 'SALUD FINANCIERA',  val: `${Math.round(pctSalud)}%`,          icon: ShieldCheck, color: saludColor, sub: saludLabel },
        ].map((k, i) => (
          <div key={i} className="col-6 col-xl-3">
            <div className={`card h-100 border-0 shadow-sm rounded-4 overflow-hidden ${k.isMain ? 'bg-dark text-white' : 'bg-white'}`}
              style={{ borderBottom: `4px solid ${k.color}`, transition: 'transform 0.2s' }}>
              <div className="card-body p-2 p-md-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className={`text-uppercase fw-bold ${k.isMain ? 'text-secondary' : 'text-muted'}`}
                    style={{ fontSize: '0.6rem', letterSpacing: '0.08em' }}>
                    {k.label}
                  </span>
                  <div className={`p-1 rounded-3 ${k.isMain ? 'bg-white bg-opacity-10' : 'bg-light'}`}>
                    <k.icon size={14} style={{ color: k.isMain ? '#fff' : k.color }} />
                  </div>
                </div>
                <div className="mt-1">
                  <h3 className={`fw-bolder mb-0 ${k.isMain ? 'text-warning' : 'text-dark'}`}
                    style={{ fontSize: k.isMain ? '1.5rem' : '1.2rem', letterSpacing: '-0.5px' }}>
                    {k.val}
                  </h3>
                  {!k.isMain && (
                    <span className="text-muted" style={{ fontSize: '0.65rem' }}>{k.sub}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Barra global ── */}
      {totalPresupuesto > 0 && (
        <div className="mb-4 rounded-4 p-3 bg-white shadow-sm" style={{ border: '1.5px solid #e2e8f0' }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold text-dark" style={{ fontSize: 13 }}>Ejecución presupuestal {currentYear}</span>
            <span className="fw-black" style={{ fontSize: 13, color: saludColor }}>{Math.round((totalGastado/totalPresupuesto)*100)}% ejecutado</span>
          </div>
          <div className="rounded-pill overflow-hidden" style={{ height: 10, background: '#f1f5f9' }}>
            <div style={{ width: `${Math.min(100,(totalGastado/totalPresupuesto)*100)}%`, height: '100%', background: saludColor, borderRadius: 99, transition: 'width 1s ease' }} />
          </div>
          <div className="d-flex justify-content-between mt-1">
            <span style={{ fontSize: 10, color: '#94a3b8' }}>{fmtM(totalGastado)} gastado</span>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>{fmtM(totalPresupuesto)} total</span>
          </div>
        </div>
      )}

      {/* ── Sección tarjetas ── */}
      <div className="card border-0 shadow-sm bg-white mb-0" style={{ borderRadius: '24px' }}>
        <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0">
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 rounded-3 bg-light"><TrendingUp size={18} className="text-success" /></div>
            <div>
              <h6 className="fw-extrabold mb-0" style={{ color: '#1e293b', fontSize: 14 }}>Control Presupuestal {currentYear}</h6>
              <p className="mb-0 text-muted" style={{ fontSize: 11 }}>
                {selectedCat ? `Viendo historial de: ${selectedCat}` : 'Selecciona una categoría para ver el detalle'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 pb-3">
          {datos.length === 0 ? (
            <div className="text-center text-muted py-4">
              <AlertCircle size={28} className="opacity-25 mb-2 d-block mx-auto" />
              <p className="mb-0 small">Sin presupuestos configurados para {currentYear}.</p>
            </div>
          ) : (
            <>
              {/* Grid de tarjetas — siempre compactas */}
              <div className="row g-3 mb-0">
                {datos.map((d, i) => (
                  <div key={i} className="col-6 col-md-4 col-xl-3">
                    <BudgetCard
                      item={d}
                      isSelected={selectedCat === d.categoria}
                      onClick={() => setSelectedCat(prev => prev === d.categoria ? null : d.categoria)}
                    />
                  </div>
                ))}
              </div>

              {/* Panel de historial — full width, fuera del grid */}
              {selectedItem && (
                <div className="mt-3">
                  <PanelHistorial
                    item={selectedItem}
                    onClose={() => setSelectedCat(null)}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
