import React, { useState, useEffect, useCallback } from 'react';
import {
  ReceiptText, TrendingDown, TrendingUp, Minus, CheckCircle,
  Clock, AlertCircle, ChevronDown, ChevronUp, RefreshCw,
  Users, Search, Calendar, ArrowRight, Banknote, ShieldCheck,
  CircleDot
} from 'lucide-react';
import { CORTE_CAJA_LISTAR_ADMIN_URL, EMPLEADOS_UPLOADS_URL } from '../../config';
import { f } from '../../utils/formatUtils';

const GUINDA      = '#800020';
const GUINDA_SOFT = '#fdf2f4';
const GUINDA_MID  = '#f5c2cc';

/* ── Avatar ─────────────────────────────────────────────────── */
const AVATAR_COLORS = [GUINDA, '#2563eb', '#059669', '#d97706', '#7c3aed', '#0891b2'];
const Avatar = ({ nombre = '', foto = '', size = 36 }) => {
  const bg  = AVATAR_COLORS[(nombre.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  const ini = nombre.charAt(0).toUpperCase();
  if (foto) return (
    <img src={`${EMPLEADOS_UPLOADS_URL}${foto}`} alt={ini} className="rounded-circle flex-shrink-0"
      style={{ width: size, height: size, objectFit: 'cover' }}
      onError={e => { e.target.style.display = 'none'; }} />
  );
  return (
    <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38, background: bg, color: '#fff' }}>
      {ini}
    </div>
  );
};

/* ── Chips de estado ─────────────────────────────────────────── */
const DifChip = ({ dif }) => {
  dif = parseFloat(dif ?? 0);
  if (dif > 0.005)  return (
    <span className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1 fw-bold"
      style={{ background: '#fef2f2', color: '#dc2626', fontSize: 11, border: '1px solid #fca5a5', whiteSpace: 'nowrap' }}>
      <TrendingDown size={10}/> Debe {f(dif)}
    </span>
  );
  if (dif < -0.005) return (
    <span className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1 fw-bold"
      style={{ background: '#f0fdf4', color: '#15803d', fontSize: 11, border: '1px solid #86efac', whiteSpace: 'nowrap' }}>
      <TrendingUp size={10}/> A favor {f(Math.abs(dif))}
    </span>
  );
  return (
    <span className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1 fw-bold"
      style={{ background: '#f0f9ff', color: '#0369a1', fontSize: 11, border: '1px solid #bae6fd', whiteSpace: 'nowrap' }}>
      <Minus size={10}/> Balanceado
    </span>
  );
};

const FirmaChip = ({ firmado_at }) => firmado_at
  ? <span className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1 fw-bold"
      style={{ background: '#f0fdf4', color: '#15803d', fontSize: 11, border: '1px solid #86efac' }}>
      <CheckCircle size={10}/> Firmado
    </span>
  : <span className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1 fw-bold"
      style={{ background: '#fff7ed', color: '#c2410c', fontSize: 11, border: '1px solid #fed7aa' }}>
      <Clock size={10}/> Sin firma
    </span>;

/* ════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
════════════════════════════════════════════════════════════════ */
export default function TabCortesCAja({ fechaInicio, fechaFin }) {
  const [cortes,       setCortes]       = useState([]);
  const [resumen,      setResumen]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [busqueda,     setBusqueda]     = useState('');
  const [expandido,    setExpandido]    = useState(null);
  const [agrup,        setAgrup]        = useState('empleado');

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      let url = CORTE_CAJA_LISTAR_ADMIN_URL;
      const ps = [];
      if (fechaInicio) ps.push(`fecha_inicio=${fechaInicio}`);
      if (fechaFin)    ps.push(`fecha_fin=${fechaFin}`);
      if (ps.length)   url += '?' + ps.join('&');
      const r = await fetch(url);
      const d = await r.json();
      if (d.status === 'success') { setCortes(d.data || []); setResumen(d.resumen); }
    } catch {}
    finally { setLoading(false); }
  }, [fechaInicio, fechaFin]);

  useEffect(() => { cargar(); }, [cargar]);

  const filtrados = cortes.filter(c =>
    !busqueda || c.empleado_nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  /* ── Agrupaciones ── */
  const grupos = agrup === 'empleado'
    ? Object.values(filtrados.reduce((acc, c) => {
        if (!acc[c.empleado_id]) acc[c.empleado_id] = {
          key: `emp-${c.empleado_id}`, titulo: c.empleado_nombre,
          sub: c.vehiculo_nombre || 'Sin unidad', foto: c.empleado_foto,
          nombre: c.empleado_nombre, cortes: []
        };
        acc[c.empleado_id].cortes.push(c);
        return acc;
      }, {}))
    : Object.values(filtrados.reduce((acc, c) => {
        const k = c.periodo || '—';
        if (!acc[k]) acc[k] = { key: `per-${k}`, titulo: k, sub: null, foto: null, nombre: k, cortes: [] };
        acc[k].cortes.push(c);
        return acc;
      }, {}));

  if (loading) return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3">
      <div className="spinner-border" style={{ color: GUINDA, width: 32, height: 32 }} role="status"/>
      <p className="text-muted fw-semibold mb-0" style={{ fontSize: 13 }}>Cargando cortes…</p>
    </div>
  );

  return (
    <div className="animate__animated animate__fadeIn d-flex flex-column gap-3">

      {/* ══ BARRA SUPERIOR ══════════════════════════════════════ */}
      <div className="card border-0 shadow-sm rounded-4" style={{ background: '#fff' }}>
        <div className="card-body p-0 overflow-hidden">

          {/* Cabecera guinda */}
          <div className="px-4 py-3 d-flex align-items-center justify-content-between"
            style={{ background: `linear-gradient(135deg, ${GUINDA} 0%, #5a0014 100%)` }}>
            <div className="d-flex align-items-center gap-2">
              <ReceiptText size={18} color="#fff"/>
              <span className="fw-bold text-white" style={{ fontSize: 15 }}>Cortes de Caja</span>
              {resumen && (
                <span className="badge rounded-pill ms-1"
                  style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 11 }}>
                  {resumen.total_cortes} registros
                </span>
              )}
            </div>
            <button onClick={cargar}
              className="btn btn-sm d-flex align-items-center gap-1"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: 20, fontSize: 12 }}>
              <RefreshCw size={13}/> Actualizar
            </button>
          </div>

          {/* Stats compactas */}
          {resumen && (
            <div className="row g-0" style={{ borderBottom: '1px solid #f1f5f9' }}>
              {[
                {
                  icon: ReceiptText, label: 'Total cortes', val: resumen.total_cortes,
                  color: '#2563eb', bg: '#eff6ff'
                },
                {
                  icon: resumen.deuda_acumulada > 0 ? TrendingDown : CheckCircle,
                  label: 'Saldo neto',
                  val: f(Math.abs(resumen.deuda_acumulada)),
                  sub: resumen.deuda_acumulada > 0 ? 'En deuda' : resumen.deuda_acumulada < 0 ? 'A favor' : 'Balanceado',
                  color: resumen.deuda_acumulada > 0 ? '#dc2626' : '#15803d',
                  bg: resumen.deuda_acumulada > 0 ? '#fef2f2' : '#f0fdf4'
                },
                {
                  icon: resumen.pendientes_firma > 0 ? Clock : ShieldCheck,
                  label: 'Sin firma chofer',
                  val: resumen.pendientes_firma,
                  sub: resumen.pendientes_firma > 0 ? 'Pendientes' : 'Todo firmado',
                  color: resumen.pendientes_firma > 0 ? '#c2410c' : '#15803d',
                  bg: resumen.pendientes_firma > 0 ? '#fff7ed' : '#f0fdf4'
                },
              ].map((s, i) => (
                <div key={i} className="col-4 px-4 py-3 d-flex align-items-center gap-3"
                  style={{ borderRight: i < 2 ? '1px solid #f1f5f9' : 'none', background: s.bg + '60' }}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 38, height: 38, background: s.bg, border: `1px solid ${s.color}22` }}>
                    <s.icon size={16} style={{ color: s.color }}/>
                  </div>
                  <div>
                    <p className="fw-black mb-0" style={{ fontSize: 17, color: s.color, lineHeight: 1.1 }}>{s.val}</p>
                    <p className="mb-0" style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{s.label}</p>
                    {s.sub && <p className="mb-0" style={{ fontSize: 10, color: '#94a3b8' }}>{s.sub}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Buscador + toggle */}
          <div className="px-3 py-2 d-flex align-items-center gap-2" style={{ background: '#fafafa' }}>
            <div className="d-flex align-items-center gap-2 flex-grow-1 rounded-3 px-3"
              style={{ background: '#fff', border: '1.5px solid #e2e8f0', height: 36 }}>
              <Search size={13} className="text-muted flex-shrink-0"/>
              <input type="text" className="form-control border-0 bg-transparent shadow-none p-0"
                placeholder="Buscar chofer…" value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{ fontSize: 13 }}/>
            </div>
            <div className="d-flex rounded-3 overflow-hidden flex-shrink-0"
              style={{ border: '1.5px solid #e2e8f0', height: 36 }}>
              {[
                { k: 'empleado', icon: Users,    l: 'Por chofer'   },
                { k: 'periodo',  icon: Calendar,  l: 'Por período'  },
              ].map(v => (
                <button key={v.k} onClick={() => setAgrup(v.k)}
                  className="btn d-flex align-items-center gap-1 px-3"
                  style={{
                    fontSize: 12, fontWeight: 600, border: 'none', borderRadius: 0, height: '100%',
                    background: agrup === v.k ? GUINDA : 'transparent',
                    color:      agrup === v.k ? '#fff' : '#64748b',
                    transition: 'all .15s'
                  }}>
                  <v.icon size={13}/> <span className="d-none d-md-inline">{v.l}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ ESTADO VACÍO ══════════════════════════════════════ */}
      {filtrados.length === 0 && (
        <div className="card border-0 shadow-sm rounded-4" style={{ background: '#fff' }}>
          <div className="card-body text-center py-5">
            <div className="d-inline-flex rounded-circle align-items-center justify-content-center mb-3"
              style={{ width: 64, height: 64, background: GUINDA_SOFT }}>
              <ReceiptText size={28} style={{ color: GUINDA, opacity: .5 }}/>
            </div>
            <p className="fw-bold mb-1" style={{ color: '#0f172a' }}>Sin cortes de caja</p>
            <p className="text-muted mb-0" style={{ fontSize: 13 }}>
              {busqueda ? 'Sin resultados para tu búsqueda.' : 'Genera cortes desde la sección Viajes del empleado.'}
            </p>
          </div>
        </div>
      )}

      {/* ══ TABLA DE GRUPOS ══════════════════════════════════ */}
      {grupos.map(grp => {
        const abierto   = expandido === grp.key;
        const deuda     = grp.cortes.reduce((s, c) => s + parseFloat(c.diferencia ?? 0), 0);
        const sinFirma  = grp.cortes.filter(c => !c.firmado_at).length;

        return (
          <div key={grp.key} className="card border-0 shadow-sm rounded-4 overflow-hidden">

            {/* ── Cabecera del grupo ── */}
            <button
              className="btn w-100 text-start border-0 d-flex align-items-center gap-3 px-4 py-3"
              style={{ background: abierto ? '#fafafa' : '#fff', transition: 'background .15s' }}
              onClick={() => setExpandido(abierto ? null : grp.key)}>

              {agrup === 'empleado'
                ? <Avatar nombre={grp.nombre} foto={grp.foto} size={40}/>
                : (
                  <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 40, height: 40, background: GUINDA_SOFT }}>
                    <Calendar size={17} style={{ color: GUINDA }}/>
                  </div>
                )
              }

              <div className="flex-grow-1 min-w-0">
                <p className="fw-bold mb-0 text-truncate" style={{ fontSize: 14, color: '#0f172a' }}>{grp.titulo}</p>
                <p className="mb-0 text-truncate" style={{ fontSize: 11, color: '#94a3b8' }}>
                  {grp.sub && <>{grp.sub} · </>}
                  {grp.cortes.length} corte{grp.cortes.length !== 1 ? 's' : ''}
                  {sinFirma > 0 && (
                    <span className="ms-2" style={{ color: '#c2410c', fontWeight: 700 }}>
                      · {sinFirma} sin firmar
                    </span>
                  )}
                </p>
              </div>

              <div className="d-flex align-items-center gap-3 flex-shrink-0 me-2">
                <div className="text-end">
                  <p className="mb-0 fw-black" style={{
                    fontSize: 14, lineHeight: 1.1,
                    color: deuda > 0.005 ? '#dc2626' : deuda < -0.005 ? '#15803d' : '#0369a1'
                  }}>
                    {deuda > 0.005 ? f(deuda) : deuda < -0.005 ? f(Math.abs(deuda)) : '—'}
                  </p>
                  <p className="mb-0" style={{ fontSize: 10, color: '#94a3b8' }}>
                    {deuda > 0.005 ? 'deuda' : deuda < -0.005 ? 'a favor' : 'al corriente'}
                  </p>
                </div>
                <div style={{ color: '#cbd5e1' }}>
                  {abierto ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                </div>
              </div>
            </button>

            {/* ── Filas de cortes ── */}
            {abierto && (
              <div style={{ borderTop: '1px solid #f1f5f9' }}>

                {/* Header de columnas (desktop) */}
                <div className="d-none d-md-flex px-4 py-2 align-items-center gap-3"
                  style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  {agrup === 'empleado'
                    ? <span style={{ flex: '0 0 160px', fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>Período</span>
                    : <span style={{ flex: '0 0 160px', fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>Chofer</span>
                  }
                  <span style={{ flex: 1, fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, textAlign: 'right' }}>App (neto)</span>
                  <span style={{ flex: 1, fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, textAlign: 'right' }}>Recibido</span>
                  <span style={{ flex: '0 0 150px', fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, textAlign: 'center' }}>Diferencia</span>
                  <span style={{ flex: '0 0 110px', fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, textAlign: 'center' }}>Firma</span>
                  <span style={{ width: 28 }}/>
                </div>

                {grp.cortes.map(c => (
                  <CorteRow key={c.id} corte={c} modoAgrup={agrup}/>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   FILA DE CORTE
════════════════════════════════════════════════════════════════ */
function CorteRow({ corte, modoAgrup }) {
  const [open, setOpen] = useState(false);
  const dif      = parseFloat(corte.diferencia    ?? 0);
  const deudaAnt = parseFloat(corte.deuda_anterior ?? 0);
  const deudaTot = deudaAnt + dif;
  const firmado  = !!corte.firmado_at;
  const admFirm  = !!corte.firma_admin_at;

  const difBg    = dif > 0.005 ? '#fef2f2' : dif < -0.005 ? '#f0fdf4' : '#f0f9ff';
  const difBd    = dif > 0.005 ? '#fca5a5' : dif < -0.005 ? '#86efac' : '#bae6fd';
  const difColor = dif > 0.005 ? '#dc2626' : dif < -0.005 ? '#15803d' : '#0369a1';
  const DifIcon  = dif > 0.005 ? TrendingDown : dif < -0.005 ? TrendingUp : Minus;

  return (
    <>
      {/* ── Fila principal ── */}
      <button
        className="btn w-100 text-start border-0 px-4 py-3 d-flex align-items-center gap-3"
        style={{ background: open ? '#fafafa' : 'transparent', borderBottom: '1px solid #f1f5f9', transition: 'background .15s' }}
        onClick={() => setOpen(!open)}>

        <div style={{ flex: '0 0 180px', minWidth: 0 }}>
          {modoAgrup === 'empleado' ? (
            <span className="d-flex align-items-center gap-1" style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
              <Calendar size={11} style={{ color: '#94a3b8', flexShrink: 0 }}/> {corte.periodo}
            </span>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Avatar nombre={corte.empleado_nombre} foto={corte.empleado_foto} size={28}/>
              <span className="text-truncate" style={{ fontSize: 12, color: '#0f172a', fontWeight: 700 }}>
                {corte.empleado_nombre?.split(' ')[0]}
              </span>
            </div>
          )}
        </div>

        <p className="mb-0 text-end fw-bold d-none d-md-block" style={{ flex: 1, fontSize: 13, color: '#2563eb' }}>
          {f(corte.utilidad_total)}
        </p>
        <p className="mb-0 text-end fw-bold d-none d-md-block" style={{ flex: 1, fontSize: 13, color: '#15803d' }}>
          {f(corte.total_pago)}
        </p>

        <div style={{ flex: '0 0 150px' }} className="d-none d-md-flex justify-content-center">
          <DifChip dif={corte.diferencia}/>
        </div>
        <div className="d-flex d-md-none flex-grow-1 justify-content-end">
          <DifChip dif={corte.diferencia}/>
        </div>
        <div style={{ flex: '0 0 110px' }} className="d-none d-md-flex justify-content-center">
          <FirmaChip firmado_at={corte.firmado_at}/>
        </div>
        <div style={{ width: 28, color: '#cbd5e1', flexShrink: 0 }}>
          {open ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
        </div>
      </button>

      {/* ── Detalle expandido ── */}
      {open && (
        <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>

          {/* Encabezado del detalle */}
          <div className="px-4 pt-3 pb-2 d-flex align-items-center justify-content-between"
            style={{ borderBottom: '1px solid #f1f5f9' }}>
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 30, height: 30, background: GUINDA_SOFT, border: `1.5px solid ${GUINDA_MID}` }}>
                <ReceiptText size={14} style={{ color: GUINDA }}/>
              </div>
              <div>
                <p className="mb-0 fw-bold" style={{ fontSize: 13, color: '#0f172a' }}>Corte #{corte.id}</p>
                <p className="mb-0" style={{ fontSize: 11, color: '#94a3b8' }}>{corte.periodo}</p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <FirmaChip firmado_at={corte.firmado_at}/>
            </div>
          </div>

          <div className="p-4 d-flex flex-column gap-3">

            {/* ── Tarjetas de montos ── */}
            <div className="row g-2">
              {[
                { l: 'Efectivo',      v: corte.ingresos_brutos, c: '#15803d', bg: '#f0fdf4', bd: '#86efac', icon: '💵' },
                { l: 'Propinas',      v: corte.propinas,        c: '#b45309', bg: '#fffbeb', bd: '#fde68a', icon: '⭐' },
                { l: 'Gastos chofer', v: corte.gastos_chofer,   c: '#dc2626', bg: '#fef2f2', bd: '#fca5a5', icon: '📋' },
                { l: 'Neto (app)',    v: corte.utilidad_total,  c: '#1d4ed8', bg: '#eff6ff', bd: '#bfdbfe', icon: '📱' },
              ].map(it => (
                <div key={it.l} className="col-6 col-md-3">
                  <div className="rounded-4 p-3 h-100 d-flex flex-column"
                    style={{ background: it.bg, border: `1.5px solid ${it.bd}` }}>
                    <p className="mb-1" style={{ fontSize: 10, color: it.c, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5 }}>
                      {it.l}
                    </p>
                    <p className="mb-0 fw-black mt-auto" style={{ fontSize: 18, color: it.c, lineHeight: 1.1 }}>
                      {f(it.v)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Reconciliación ── */}
            <div className="rounded-4 overflow-hidden" style={{ border: `2px solid ${difBd}` }}>
              {/* Header reconciliación */}
              <div className="px-4 py-2 d-flex align-items-center justify-content-between"
                style={{ background: difBg, borderBottom: `1px solid ${difBd}` }}>
                <span className="fw-bold" style={{ fontSize: 11, color: difColor, textTransform: 'uppercase', letterSpacing: .5 }}>
                  Resultado del corte
                </span>
                <span className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1 fw-bold"
                  style={{ background: '#fff', color: difColor, fontSize: 11, border: `1px solid ${difBd}` }}>
                  <DifIcon size={11}/>
                  {dif > 0.005 ? `Debe ${f(dif)}` : dif < -0.005 ? `Entregó de más ${f(Math.abs(dif))}` : 'Balanceado'}
                </span>
              </div>

              {/* Cuerpo reconciliación */}
              <div className="px-4 py-3 bg-white">
                <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                  {/* Esperado */}
                  <div className="text-center flex-fill">
                    <p className="mb-1" style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .4 }}>
                      App esperaba
                    </p>
                    <p className="mb-0 fw-black" style={{ fontSize: 22, color: '#1d4ed8' }}>
                      {f(corte.utilidad_total)}
                    </p>
                  </div>

                  {/* Flecha */}
                  <div className="d-flex align-items-center gap-1 flex-shrink-0" style={{ color: '#cbd5e1' }}>
                    <div style={{ width: 24, height: 1, background: '#e2e8f0' }}/>
                    <ArrowRight size={16}/>
                    <div style={{ width: 24, height: 1, background: '#e2e8f0' }}/>
                  </div>

                  {/* Recibido */}
                  <div className="text-center flex-fill">
                    <p className="mb-1" style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .4 }}>
                      Chofer entregó
                    </p>
                    <p className="mb-0 fw-black" style={{ fontSize: 22, color: '#15803d' }}>
                      {f(corte.total_pago)}
                    </p>
                  </div>

                  {/* Diferencia */}
                  <div className="text-center flex-fill">
                    <p className="mb-1" style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: .4 }}>
                      Diferencia
                    </p>
                    <p className="mb-0 fw-black" style={{ fontSize: 22, color: difColor }}>
                      {dif === 0 ? '—' : f(Math.abs(dif))}
                    </p>
                  </div>
                </div>

                {/* Deuda anterior y total */}
                {(deudaAnt > 0.005 || dif > 0.005) && (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px dashed #e2e8f0' }}>
                    {deudaAnt > 0.005 && (
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span style={{ fontSize: 12, color: '#64748b' }}>Deuda períodos anteriores</span>
                        <span className="fw-bold" style={{ fontSize: 13, color: '#c2410c' }}>+{f(deudaAnt)}</span>
                      </div>
                    )}
                    <div className="d-flex align-items-center justify-content-between rounded-3 px-3 py-2 mt-1"
                      style={{ background: deudaTot > 0.005 ? '#fef2f2' : '#f0fdf4', border: `1px solid ${deudaTot > 0.005 ? '#fca5a5' : '#86efac'}` }}>
                      <span className="fw-bold" style={{ fontSize: 13, color: '#0f172a' }}>Saldo pendiente total</span>
                      <span className="fw-black" style={{ fontSize: 16, color: deudaTot > 0.005 ? '#dc2626' : '#15803d' }}>
                        {deudaTot > 0.005 ? f(deudaTot) : '✓ Al corriente'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Firmas ── */}
            <div className="row g-2">
              {[
                { l: 'Administrador', ok: admFirm, fecha: corte.firma_admin_at },
                { l: 'Chofer',        ok: firmado, fecha: corte.firmado_at },
              ].map(fi => (
                <div key={fi.l} className="col-6">
                  <div className="rounded-4 p-3 h-100"
                    style={{
                      background: fi.ok ? '#f0fdf4' : '#fff',
                      border: `1.5px solid ${fi.ok ? '#86efac' : '#e2e8f0'}`
                    }}>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      {fi.ok
                        ? <CheckCircle size={15} style={{ color: '#15803d', flexShrink: 0 }}/>
                        : <Clock       size={15} style={{ color: '#94a3b8', flexShrink: 0 }}/>}
                      <span className="fw-bold" style={{ fontSize: 12, color: fi.ok ? '#15803d' : '#64748b' }}>
                        Firma {fi.l}
                      </span>
                    </div>
                    <p className="mb-0" style={{ fontSize: 11, color: fi.ok ? '#166534' : '#94a3b8', paddingLeft: 23 }}>
                      {fi.ok && fi.fecha
                        ? new Date(fi.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Pendiente de firma'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Fecha emisión */}
            <p className="mb-0" style={{ fontSize: 10, color: '#cbd5e1', textAlign: 'right' }}>
              Emitido el {new Date(corte.fecha_emision).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
