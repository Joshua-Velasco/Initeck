import React, { useState, useMemo } from 'react';
import {
  Users, Download, Car, DollarSign, TrendingUp,
  ArrowUpRight, ArrowDownRight, Wallet, PieChart, CreditCard,
  Landmark, CheckCircle, AlertCircle, Wrench, ChevronDown,
  ChevronUp, Fuel, Shield, Settings, FileText, BarChart2
} from 'lucide-react';
import { f } from '../../utils/formatUtils';
import { EMPLEADOS_UPLOADS_URL } from '../../config';

/* ─── paleta ─────────────────────────── */
const GUINDA = '#6b0f1a';
const SLATE  = '#0f172a';
const SLATE2 = '#1e293b';
const fuelKw = ['gasolina','combustible','diesel','magna','premium'];
const AV_COLORS = [GUINDA,'#3b82f6','#10b981','#f59e0b','#8b5cf6','#06b6d4'];
const avatarBg  = (n='') => AV_COLORS[(n.charCodeAt(0)||0) % AV_COLORS.length];

/*
  COLUMNAS (15 total) — grupos:
  [A] OPERADOR  (3): Nombre, Unidad, Vj
  [B] INGRESOS  (5): Efectivo, Depósitos, Propinas, Otros Viajes, Total Ing.
  [C] GASTOS OP (2): Combustible, G.Ruta
  [D] COSTOS VH (2): Costos Fijos, Taller
  [E] NÓMINA    (1): Nómina
  [F] RESULTADO (1): Utilidad
  [G] ACCIONES  (1): toggle
  Total: 3+5+2+2+1+1+1 = 15
*/
const NCOLS = 15;

/* ─── helpers de celda ─────────────────────── */
const numCell = (val, color, bg='transparent', bold=false, large=false) => (
  <td className="text-end" style={{
    fontSize: large ? 13 : 12, fontWeight: bold ? 800 : 500,
    color: val === 0 ? '#c0c9d6' : color,
    background: bg, whiteSpace:'nowrap', padding:'7px 9px',
    borderBottom:'1px solid #f1f5f9',
  }}>
    {val === 0 ? '—' : f(val)}
  </td>
);

const negCell = (val, color, bg='transparent') => (
  <td className="text-end" style={{
    fontSize:12, fontWeight:500, color: val===0?'#c0c9d6':color,
    background:bg, whiteSpace:'nowrap', padding:'7px 9px',
    borderBottom:'1px solid #f1f5f9',
  }}>
    {val===0 ? '—' : `-${f(val)}`}
  </td>
);

const ColH = ({ children, right=false, sortable=false, active=false, dir='asc', onClick, style={} }) => (
  <th
    onClick={sortable ? onClick : undefined}
    style={{
      fontSize:10, fontWeight:700, letterSpacing:.6, textTransform:'uppercase',
      whiteSpace:'nowrap', padding:'7px 9px',
      textAlign: right?'right':'left',
      cursor: sortable?'pointer':'default',
      color: active ? GUINDA : '#64748b',
      borderBottom:'2px solid #e2e8f0',
      userSelect:'none',
      ...style,
    }}
  >
    <span className="d-inline-flex align-items-center gap-1">
      {children}
      {sortable && (active
        ? (dir==='asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>)
        : <ChevronDown size={11} style={{opacity:.25}}/>
      )}
    </span>
  </th>
);

const GH = ({ label, span, color, bg }) => (
  <th colSpan={span} className="text-center" style={{
    fontSize:11, fontWeight:800, letterSpacing:1.2, textTransform:'uppercase',
    color, background:bg, padding:'7px 8px',
    borderBottom:`2px solid ${color}30`,
  }}>
    {label}
  </th>
);

/* ═══════════════════════════════════════════════════════════ */
const TabTabla = ({ data, onExport, onOpenRecibo, onOpenHistory, hideFinancials=false }) => {
  const [search,     setSearch]     = useState('');
  const [sortCol,    setSortCol]    = useState('utilidad');
  const [sortDir,    setSortDir]    = useState('asc');
  const [expandedId, setExpandedId] = useState(null);
  const [editingId,  setEditingId]  = useState(null);
  const [editValue,  setEditValue]  = useState('');
  const [pctSopGlobal, setPctSopGlobal] = useState(
    () => { const sv = localStorage.getItem('comision_soporte_global'); return sv !== null ? +sv : 5; }
  );
  const [pctChVer, setPctChVer] = useState(0); // fuerza re-cálculo al guardar % chofer

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  const savePctCh = (id, val) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0 && n <= 100) {
      localStorage.setItem(`comision_nomina_${id}`, n);
      setEditingId(null);
      setPctChVer(v => v + 1); // dispara re-render para que rows recalcule
    }
  };

  const savePctSop = (val) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0 && n <= 100) { localStorage.setItem('comision_soporte_global', n); setPctSopGlobal(n); setEditingId(null); }
  };

  const soporteRoles = ['monitorista','taller','limpieza','desarrollador','admin'];

  /* ── datos únicos ── */
  const uniq = useMemo(() => {
    const list=[], seen=new Set();
    (data?.empleados||[]).forEach(e => {
      if(e.empleado_id && !seen.has(e.empleado_id)){ seen.add(e.empleado_id); list.push(e); }
    });
    return list;
  }, [data]);

  const esChofer = e => {
    const r=(e.empleado_rol||'').toLowerCase(), a=Number(e.total_ingresos)>0||Number(e.total_viajes)>0;
    if(r==='admin'&&a) return true;
    return !soporteRoles.includes(r)&&a;
  };

  /* ── enriquecer ── */
  const rows = useMemo(() => uniq.filter(esChofer).map(emp => {
    const ie   = +emp.total_ingresos||0;
    const dep  = +emp.total_depositos||0;
    const prop = +emp.total_propinas||0;
    const otv  = +emp.total_otros_viajes||0;
    const ib   = ie+dep+otv;

    let gCom=0, gRuta=0;
    (emp.detalles_ingresos||[]).forEach(liq=>{
      let items=[];
      try{ items=JSON.parse(liq.detalles_gastos||'[]'); }catch(e){}
      (Array.isArray(items)?items:[]).forEach(g=>{
        const t=(g.tipo||'').toLowerCase(), m=+g.monto||0;
        if(fuelKw.some(k=>t.includes(k))) gCom+=m; else gRuta+=m;
      });
    });

    let gFij=0;
    (emp.detalles_costos_operativos||[]).forEach(c=>{ gFij+=+c.costo_total||0; });
    const gTall=(emp.detalles_mantenimiento||[]).reduce((s,m)=>s+(+m.costo_total||0),0);

    const sv=localStorage.getItem(`comision_nomina_${emp.empleado_id||emp.vehiculo_asignado}`);
    const pctCh=sv!==null?+sv:20;
    // Nómina se calcula sobre ingresos brutos (efectivo + depósitos + otros viajes)
    const nomCh=(ib*pctCh)/100;
    const nomSop=(ib*pctSopGlobal)/100;
    const nom=nomCh+nomSop;
    const util=ib-gCom-gRuta-gFij-gTall-nom;
    const espCaja=ie-gRuta-gTall;
    const difCaja=(+emp.total_recibido_caja||0)-espCaja;

    return { ...emp, _:{ ie,dep,prop,otv,ib,gCom,gRuta,gFij,gTall,pctCh,nomCh,nomSop,nom,util,espCaja,difCaja } };
  }), [uniq, pctSopGlobal, pctChVer]);

  /* ── totales ── */
  const T = useMemo(()=>({
    ie:   rows.reduce((s,e)=>s+e._.ie,0),
    dep:  rows.reduce((s,e)=>s+e._.dep,0),
    prop: rows.reduce((s,e)=>s+e._.prop,0),
    otv:  rows.reduce((s,e)=>s+e._.otv,0),
    ib:   rows.reduce((s,e)=>s+e._.ib,0),
    gCom: rows.reduce((s,e)=>s+e._.gCom,0),
    gRut: rows.reduce((s,e)=>s+e._.gRuta,0),
    gFij: rows.reduce((s,e)=>s+e._.gFij,0),
    gTal: rows.reduce((s,e)=>s+e._.gTall,0),
    nom:  rows.reduce((s,e)=>s+e._.nom,0),
    util: rows.reduce((s,e)=>s+e._.util,0),
    vj:   rows.reduce((s,e)=>s+(+e.total_viajes||0),0),
    rec:  rows.reduce((s,e)=>s+(+e.total_recibido_caja||0),0),
  }),[rows]);

  /* ── filtrar + ordenar ── */
  const term = search.toLowerCase();
  const filtered = useMemo(()=>{
    const colMap = { utilidad:'util', ingresos:'ib', combustible:'gCom', taller:'gTall', nomina:'nom' };
    return [...rows]
      .filter(e=>(e.empleado_nombre||'').toLowerCase().includes(term)||(e.vehiculo_asignado||'').toLowerCase().includes(term))
      .sort((a,b)=>{
        if(sortCol==='nombre'){
          const va=a.empleado_nombre||'', vb=b.empleado_nombre||'';
          return sortDir==='asc'?va.localeCompare(vb):vb.localeCompare(va);
        }
        const k=colMap[sortCol]||'util';
        return sortDir==='asc'?a._[k]-b._[k]:b._[k]-a._[k];
      });
  },[rows,term,sortCol,sortDir]);

  const toggleSort = col => {
    if(sortCol===col) setSortDir(d=>d==='asc'?'desc':'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  /* ── Banner ── */
  const Banner = () => (
    <div className="rounded-4 mb-3 overflow-hidden position-relative"
      style={{background:`linear-gradient(135deg,${SLATE} 0%,${SLATE2} 60%,#1e3a5f 100%)`,boxShadow:'0 8px 32px rgba(15,23,42,.2)'}}>
      <div style={{position:'absolute',top:0,left:0,width:5,height:'100%',background:`linear-gradient(180deg,${GUINDA} 0%,transparent 100%)`,borderRadius:'16px 0 0 16px'}}/>
      <div className="p-4 ps-5">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-lg-3 border-end border-white border-opacity-25 pe-4">
            <p className="text-white-50 fw-bold text-uppercase mb-1" style={{fontSize:10,letterSpacing:2}}>Utilidad Real General</p>
            <h2 className="fw-bold mb-2" style={{fontSize:'2.2rem',color:T.util>=0?'#4ade80':'#f87171',letterSpacing:'-1px'}}>{f(T.util)}</h2>
            <div className="d-flex gap-2 flex-wrap">
              <span className="badge rounded-pill px-3 py-1 d-flex align-items-center gap-1" style={{background:'rgba(255,255,255,.12)',color:'#e2e8f0',fontSize:11}}>
                <Users size={12}/> {filtered.length} Operadores · {T.vj} viajes
              </span>
              <span className="badge rounded-pill px-3 py-1 d-flex align-items-center gap-1" style={{background:T.rec-T.ie>=0?'rgba(74,222,128,.18)':'rgba(248,113,113,.18)',color:T.rec-T.ie>=0?'#4ade80':'#f87171',fontSize:11}}>
                {T.rec-T.ie>=0?<CheckCircle size={12}/>:<AlertCircle size={12}/>} Caja: {f(T.rec-T.ie)}
              </span>
            </div>
          </div>
          <div className="col-12 col-lg-9">
            <div className="row g-2">
              {[
                {l:'Ingresos',    v:f(T.ib),        I:TrendingUp,     c:'#4ade80'},
                {l:'Otros Vj.',   v:f(T.otv),       I:Car,            c:'#c4b5fd'},
                {l:'Combustible', v:`-${f(T.gCom)}`, I:Fuel,           c:'#f87171'},
                {l:'G. Ruta',     v:`-${f(T.gRut)}`, I:ArrowDownRight, c:'#f87171'},
                {l:'Costos Fijos',v:`-${f(T.gFij)}`, I:Shield,         c:'#fbbf24'},
                {l:'Taller',      v:`-${f(T.gTal)}`, I:Wrench,         c:'#fb923c'},
                {l:'Nómina',      v:f(T.nom),        I:Wallet,         c:'#a5b4fc'},
              ].map(({l,v,I,c})=>(
                <div key={l} className="col-4 col-xl-2">
                  <div className="rounded-3 text-center py-3 px-2" style={{background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.1)'}}>
                    <I size={16} style={{color:c}} className="mb-2"/>
                    <p className="text-white-50 fw-bold mb-1" style={{fontSize:11,letterSpacing:.8}}>{l}</p>
                    <p className="fw-bold mb-0" style={{fontSize:16,color:c,letterSpacing:'-0.5px'}}>{v}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── Fila expandida ── */
  const DetailRow = ({ emp }) => {
    const d = emp._;
    const id = emp.empleado_id||emp.vehiculo_asignado;
    const tallerItems = emp.detalles_mantenimiento||[];
    const fijosItems  = emp.detalles_costos_operativos||[];
    const liqItems    = emp.detalles_ingresos||[];

    return (
      <tr>
        <td colSpan={NCOLS} style={{padding:0,background:'#fafafa'}}>
          <div className="p-4" style={{borderTop:`1px solid ${GUINDA}25`,borderBottom:'1px solid #e2e8f0'}}>
            <div className="row g-4 mb-3">

              {/* Combustible */}
              <div className="col-12 col-lg-4">
                <p className="fw-bold text-uppercase mb-3 d-flex align-items-center gap-2" style={{fontSize:11,color:GUINDA}}>
                  <span className="p-1 rounded-2 d-flex" style={{background:`${GUINDA}15`}}><Fuel size={13}/></span>
                  Combustible por jornada
                </p>
                {liqItems.every(l=>{ let it=[]; try{it=JSON.parse(l.detalles_gastos||'[]');}catch(e){} return it.filter(g=>fuelKw.some(k=>(g.tipo||'').toLowerCase().includes(k))).length===0; }) && (
                  <p className="text-muted" style={{fontSize:13}}>Sin registros de combustible</p>
                )}
                {liqItems.map((liq,i)=>{
                  let items=[];
                  try{items=JSON.parse(liq.detalles_gastos||'[]');}catch(e){}
                  return items.filter(g=>fuelKw.some(k=>(g.tipo||'').toLowerCase().includes(k))).map((g,j)=>(
                    <div key={`${i}-${j}`} className="d-flex justify-content-between align-items-center px-3 py-2 rounded-3 mb-2" style={{background:'#fff4f4',border:`1px solid ${GUINDA}20`}}>
                      <span style={{fontSize:13,color:'#64748b'}}>{liq.fecha} · <strong style={{color:SLATE}}>{g.tipo||'Combustible'}</strong></span>
                      <span className="fw-bold" style={{fontSize:13,color:GUINDA}}>-{f(g.monto)}</span>
                    </div>
                  ));
                })}
              </div>

              {/* Costos fijos */}
              <div className="col-12 col-lg-4">
                <p className="fw-bold text-uppercase mb-3 d-flex align-items-center gap-2" style={{fontSize:11,color:'#d97706'}}>
                  <span className="p-1 rounded-2 d-flex" style={{background:'#fef3c715'}}><Shield size={13}/></span>
                  Costos fijos vehículo
                </p>
                {fijosItems.length===0 && <p className="text-muted" style={{fontSize:13}}>Sin costos configurados</p>}
                {fijosItems.map((c,i)=>(
                  <div key={i} className="d-flex justify-content-between align-items-center px-3 py-2 rounded-3 mb-2" style={{background:'#fffbeb',border:'1px solid #fde68a'}}>
                    <span style={{fontSize:13,color:'#78350f'}}>{c.tipo}</span>
                    <span className="fw-bold" style={{fontSize:13,color:'#d97706'}}>-{f(c.costo_total)}</span>
                  </div>
                ))}
              </div>

              {/* Taller */}
              <div className="col-12 col-lg-4">
                <p className="fw-bold text-uppercase mb-3 d-flex align-items-center gap-2" style={{fontSize:11,color:'#ea580c'}}>
                  <span className="p-1 rounded-2 d-flex" style={{background:'#fff7ed'}}><Wrench size={13}/></span>
                  Reparaciones taller
                </p>
                {tallerItems.length===0 && <p className="text-muted" style={{fontSize:13}}>Sin reparaciones registradas</p>}
                {tallerItems.map((m,i)=>(
                  <div key={i} className="d-flex justify-content-between align-items-center px-3 py-2 rounded-3 mb-2" style={{background:'#fff7ed',border:'1px solid #fed7aa'}}>
                    <span style={{fontSize:13,color:'#9a3412'}}>{m.fecha} · {m.descripcion||m.tipo||'Reparación'}</span>
                    <span className="fw-bold" style={{fontSize:13,color:'#ea580c'}}>-{f(m.costo_total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div className="d-flex gap-2 justify-content-between align-items-center pt-2 flex-wrap" style={{borderTop:'1px solid #f1f5f9'}}>

              {/* Configuración de nómina */}
              <div className="d-flex gap-2 align-items-center flex-wrap">

                {/* % Chofer */}
                {editingId===`${id}-ch` ? (
                  <div className="d-flex align-items-center gap-2 rounded-pill px-3 py-1" style={{background:'#f8fafc',border:'1px solid #e2e8f0'}}>
                    <span style={{fontSize:12,color:'#64748b',fontWeight:600}}>% Chofer:</span>
                    <input type="number" className="form-control form-control-sm border-0 bg-transparent p-0"
                      style={{width:55,fontSize:13}} value={editValue} onChange={e=>setEditValue(e.target.value)} autoFocus/>
                    <button className="btn btn-sm rounded-pill px-3 fw-bold" style={{background:GUINDA,color:'#fff',border:'none',fontSize:12}}
                      onClick={()=>savePctCh(id,editValue)}>OK</button>
                    <button className="btn btn-sm btn-link text-muted p-0" style={{fontSize:12}} onClick={()=>setEditingId(null)}>✕</button>
                  </div>
                ) : (
                  <button className="btn btn-sm rounded-pill px-3 d-flex align-items-center gap-2 fw-semibold"
                    style={{background:'#fff',border:'1.5px solid #6366f1',color:'#6366f1',fontSize:13}}
                    onClick={()=>{ setEditingId(`${id}-ch`); setEditValue(d.pctCh); }}>
                    <Settings size={13}/> Chofer: {d.pctCh}%
                  </button>
                )}

                {/* % Soporte (global) */}
                {editingId==='sop-global' ? (
                  <div className="d-flex align-items-center gap-2 rounded-pill px-3 py-1" style={{background:'#f8fafc',border:'1px solid #e2e8f0'}}>
                    <span style={{fontSize:12,color:'#64748b',fontWeight:600}}>% Soporte:</span>
                    <input type="number" className="form-control form-control-sm border-0 bg-transparent p-0"
                      style={{width:55,fontSize:13}} value={editValue} onChange={e=>setEditValue(e.target.value)} autoFocus/>
                    <button className="btn btn-sm rounded-pill px-3 fw-bold" style={{background:'#475569',color:'#fff',border:'none',fontSize:12}}
                      onClick={()=>savePctSop(editValue)}>OK</button>
                    <button className="btn btn-sm btn-link text-muted p-0" style={{fontSize:12}} onClick={()=>setEditingId(null)}>✕</button>
                  </div>
                ) : (
                  <button className="btn btn-sm rounded-pill px-3 d-flex align-items-center gap-2 fw-semibold"
                    style={{background:'#fff',border:'1.5px solid #94a3b8',color:'#475569',fontSize:13}}
                    onClick={()=>{ setEditingId('sop-global'); setEditValue(pctSopGlobal); }}>
                    <Users size={13}/> Soporte: {pctSopGlobal}%
                  </button>
                )}

                {/* Resumen nómina */}
                <div className="rounded-3 px-3 py-2" style={{background:'#eef2ff',border:'1px solid #c7d2fe',fontSize:12}}>
                  <p className="fw-bold mb-1" style={{color:'#4338ca',fontSize:11,letterSpacing:.5}}>DESGLOSE NÓMINA</p>
                  <div className="d-flex gap-3 flex-wrap">
                    <span style={{color:'#374151'}}>
                      Base: <strong style={{color:'#1e293b'}}>{f(Math.max(0, d.ib - d.gCom - d.gRuta - d.gFij - d.gTall))}</strong>
                    </span>
                    <span style={{color:'#6366f1'}}>
                      Chofer {d.pctCh}%: <strong>{f(d.nomCh)}</strong>
                    </span>
                    <span style={{color:'#475569'}}>
                      Soporte {pctSopGlobal}%: <strong>{f(d.nomSop)}</strong>
                    </span>
                    <span style={{color:'#4338ca',fontWeight:700}}>
                      Total: {f(d.nom)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de pago */}
              <div className="d-flex gap-2">
                <button className="btn btn-sm rounded-pill px-4 d-flex align-items-center gap-2 fw-bold"
                  style={{background:GUINDA,color:'#fff',border:'none',boxShadow:`0 4px 14px ${GUINDA}50`,fontSize:13}}
                  onClick={()=>onOpenRecibo&&onOpenRecibo(emp)}>
                  <DollarSign size={14}/> Registrar Pago
                </button>
                <button className="btn btn-sm rounded-pill px-4 d-flex align-items-center gap-2 fw-bold"
                  style={{background:'#fff',border:'1.5px solid #e2e8f0',color:'#475569',fontSize:13}}
                  onClick={()=>onOpenHistory&&onOpenHistory(emp)}>
                  <FileText size={14}/> Ver Historial
                </button>
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  /* ── fila de totales ── */
  const TotalsRow = () => {
    const ok = T.util >= 0;
    const base = { fontWeight:800, padding:'8px 9px', whiteSpace:'nowrap', borderTop:`2px solid ${ok?'#86efac':GUINDA+'60'}`, background:ok?'#f0fdf4':`${GUINDA}06` };
    return (
      <tr>
        {/* [A] Operador — 3 cols */}
        <td colSpan={3} style={{...base, fontSize:12, color:SLATE}}>
          TOTALES · {filtered.length} operadores · {T.vj} viajes
        </td>
        {/* [B] Ingresos — 5 cols */}
        <td className="text-end" style={{...base,fontSize:14,color:'#16a34a'}}>{T.ie>0?f(T.ie):'—'}</td>
        <td className="text-end" style={{...base,fontSize:14,color:'#3b82f6'}}>{T.dep>0?f(T.dep):'—'}</td>
        <td className="text-end" style={{...base,fontSize:14,color:'#d97706'}}>{T.prop>0?f(T.prop):'—'}</td>
        <td className="text-end" style={{...base,fontSize:14,color:'#8b5cf6'}}>{T.otv>0?f(T.otv):'—'}</td>
        <td className="text-end" style={{...base,fontSize:15,color:'#16a34a'}}>{f(T.ib)}</td>
        {/* [C] Gastos op — 2 cols */}
        <td className="text-end" style={{...base,fontSize:14,color:GUINDA}}>{T.gCom>0?`-${f(T.gCom)}`:'—'}</td>
        <td className="text-end" style={{...base,fontSize:14,color:GUINDA}}>{T.gRut>0?`-${f(T.gRut)}`:'—'}</td>
        {/* [D] Costos veh — 2 cols */}
        <td className="text-end" style={{...base,fontSize:14,color:'#d97706'}}>{T.gFij>0?`-${f(T.gFij)}`:'—'}</td>
        <td className="text-end" style={{...base,fontSize:14,color:'#ea580c'}}>{T.gTal>0?`-${f(T.gTal)}`:'—'}</td>
        {/* [E] Nómina — 1 col */}
        <td className="text-end" style={{...base,fontSize:14,color:'#6366f1'}}>{T.nom>0?f(T.nom):'—'}</td>
        {/* [F] Resultado — 1 col */}
        <td className="text-end" style={{...base,fontSize:16,color:ok?'#16a34a':GUINDA}}>{f(T.util)}</td>
        {/* [G] toggle — 1 col */}
        <td style={{...base}}/>
      </tr>
    );
  };

  /* ══════════════════ RENDER ══════════════════ */
  return (
    <div className="animate__animated animate__fadeIn">

      {/* toolbar */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{color:SLATE}}>
            <div className="p-2 rounded-3" style={{background:`${GUINDA}15`,color:GUINDA}}><BarChart2 size={22}/></div>
            Tabla Contable
          </h4>
          <p className="text-muted mb-0" style={{fontSize:13}}>Balance general de ingresos, gastos y rentabilidad por operador</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <input type="text" className="form-control form-control-sm rounded-pill border-0 shadow-sm px-3"
            placeholder="Buscar operador o unidad…"
            style={{width:230,background:'#fff',fontSize:13}}
            value={search} onChange={e=>setSearch(e.target.value)}/>
          {!hideFinancials&&(
            <button onClick={onExport} className="btn btn-sm rounded-pill px-3 d-flex align-items-center gap-2 fw-bold"
              style={{background:'#fff',border:'1px solid #e2e8f0',color:GUINDA,boxShadow:'0 1px 4px rgba(0,0,0,.06)',fontSize:13}}>
              <Download size={14}/> Exportar Excel
            </button>
          )}
        </div>
      </div>

      {!hideFinancials && rows.length>0 && <Banner/>}

      {rows.length===0 ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm d-flex flex-column align-items-center justify-content-center">
          <BarChart2 size={52} className="opacity-20 mb-3" style={{color:GUINDA}}/>
          <h5 className="text-muted">Sin datos en el período</h5>
          <p className="text-muted">Ajusta el rango de fechas para ver la tabla contable.</p>
        </div>
      ) : (
        <div className="rounded-4 shadow-sm overflow-auto custom-scrollbar" style={{background:'#fff',border:'1px solid #f1f5f9'}}>
          <table style={{width:'100%',borderCollapse:'collapse',minWidth:900}}>

            {/* ══ FILA 1: cabeceras de grupo ══ */}
            <thead>
              <tr>
                {/* [A] Operador 3 cols */}
                <th colSpan={3} style={{background:'#f1f5f9',padding:'6px 10px',fontSize:10,fontWeight:800,letterSpacing:1.2,textTransform:'uppercase',color:'#64748b',borderBottom:'1px solid #e2e8f0'}}>
                  Operador
                </th>
                {/* [B] Ingresos 5 cols */}
                <GH label="Ingresos"          span={5} color="#16a34a" bg="#f0fdf4"/>
                {/* [C] Gastos Operador 2 cols */}
                <GH label="Gastos Operador"   span={2} color={GUINDA}  bg={`${GUINDA}0a`}/>
                {/* [D] Costos Vehículo 2 cols */}
                <GH label="Costos Vehículo"   span={2} color="#d97706" bg="#fffbeb"/>
                {/* [E] Nómina 1 col */}
                <GH label="Nómina"            span={1} color="#6366f1" bg="#eef2ff"/>
                {/* [F] Resultado 1 col */}
                <GH label="Resultado"         span={1} color={SLATE}   bg="#f8fafc"/>
                {/* [G] 1 col */}
                <th style={{background:'#f8fafc',borderBottom:'1px solid #e2e8f0',width:48}}/>
              </tr>

              {/* ══ FILA 2: cabeceras de columna ══ */}
              <tr style={{background:'#fff'}}>
                {/* [A] */}
                <ColH sortable active={sortCol==='nombre'} dir={sortDir} onClick={()=>toggleSort('nombre')}
                  style={{minWidth:120,background:'#fff'}}>Nombre</ColH>
                <ColH style={{minWidth:75,background:'#fff'}}>Unidad</ColH>
                <ColH right style={{minWidth:32,background:'#fff'}}>Vj.</ColH>
                {/* [B] */}
                <ColH right sortable active={sortCol==='ingresos'} dir={sortDir} onClick={()=>toggleSort('ingresos')}
                  style={{minWidth:75,background:'#f9fef9'}}>Efectivo</ColH>
                <ColH right style={{minWidth:75,background:'#f9fef9',color:'#3b82f6'}}>Depósitos</ColH>
                <ColH right style={{minWidth:70,background:'#f9fef9',color:'#d97706'}}>Propinas</ColH>
                <ColH right style={{minWidth:70,background:'#f9fef9',color:'#8b5cf6'}}>Otros Vj.</ColH>
                <ColH right style={{minWidth:78,background:'#f0fdf4',color:'#16a34a',fontWeight:900}}>Total Ing.</ColH>
                {/* [C] */}
                <ColH right sortable active={sortCol==='combustible'} dir={sortDir} onClick={()=>toggleSort('combustible')}
                  style={{minWidth:82,background:`${GUINDA}06`}}>Combustible</ColH>
                <ColH right style={{minWidth:62,background:`${GUINDA}06`}}>G. Ruta</ColH>
                {/* [D] */}
                <ColH right style={{minWidth:78,background:'#fffdf5',color:'#d97706'}}>C. Fijos</ColH>
                <ColH right sortable active={sortCol==='taller'} dir={sortDir} onClick={()=>toggleSort('taller')}
                  style={{minWidth:62,background:'#fffdf5',color:'#ea580c'}}>Taller</ColH>
                {/* [E] */}
                <ColH right sortable active={sortCol==='nomina'} dir={sortDir} onClick={()=>toggleSort('nomina')}
                  style={{minWidth:78,background:'#f5f5ff',color:'#6366f1'}}>Nómina</ColH>
                {/* [F] */}
                <ColH right sortable active={sortCol==='utilidad'} dir={sortDir} onClick={()=>toggleSort('utilidad')}
                  style={{minWidth:80,background:'#f8fafc',fontWeight:900}}>Utilidad</ColH>
                {/* [G] */}
                <th style={{background:'#f8fafc',width:36,borderBottom:'2px solid #e2e8f0'}}/>
              </tr>
            </thead>

            <tbody>
              {filtered.map((emp,idx)=>{
                const d   = emp._;
                const id  = emp.empleado_id||emp.vehiculo_asignado;
                const exp = expandedId===id;
                const ok  = d.util>=0;
                const bg  = exp ? `${GUINDA}05` : (idx%2===0?'#fff':'#fafbfc');
                const av  = avatarBg(emp.empleado_nombre||'');
                const rowStyle = { cursor:'pointer', transition:'background .15s' };

                return (
                  <React.Fragment key={id}>
                    <tr style={{...rowStyle, background:bg}} onClick={()=>toggleExpand(id)}>

                      {/* [A-1] Nombre */}
                      <td style={{padding:'7px 10px',borderBottom:'1px solid #f1f5f9'}}>
                        <div className="d-flex align-items-center gap-2">
                          {emp.foto_perfil
                            ? <img src={`${EMPLEADOS_UPLOADS_URL}${emp.foto_perfil}`}
                                alt={(emp.empleado_nombre||'?').charAt(0).toUpperCase()}
                                className="rounded-circle flex-shrink-0"
                                style={{width:26,height:26,objectFit:'cover'}} />
                            : <div className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                                style={{width:26,height:26,fontSize:11,background:av}}>
                                {(emp.empleado_nombre||'?').charAt(0).toUpperCase()}
                              </div>
                          }
                          <div>
                            <p className="mb-0 fw-bold" style={{fontSize:12,color:SLATE,lineHeight:1.2}}>{emp.empleado_nombre}</p>
                            <p className="mb-0 text-muted" style={{fontSize:10}}>{emp.empleado_rol||'Operador'}</p>
                          </div>
                        </div>
                      </td>

                      {/* [A-2] Unidad */}
                      <td style={{padding:'7px 9px',borderBottom:'1px solid #f1f5f9'}}>
                        {emp.vehiculo_asignado ? (
                          <span className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-3 fw-semibold"
                            style={{background:'#f1f5f9',color:'#475569',border:'1px solid #e2e8f0',fontSize:11}}>
                            <Car size={10} style={{color:GUINDA}}/> {emp.vehiculo_asignado}
                          </span>
                        ) : <span className="text-muted">—</span>}
                      </td>

                      {/* [A-3] Viajes */}
                      <td className="text-center" style={{fontSize:12,fontWeight:600,color:'#64748b',padding:'7px 9px',borderBottom:'1px solid #f1f5f9'}}>
                        {emp.total_viajes||0}
                      </td>

                      {/* [B] Ingresos */}
                      {numCell(d.ie,   '#16a34a', '#f9fef9')}
                      {numCell(d.dep,  '#3b82f6', '#f9fef9')}
                      {numCell(d.prop, '#d97706', '#f9fef9')}
                      {numCell(d.otv,  '#8b5cf6', '#f9fef9')}
                      {numCell(d.ib,   '#16a34a', '#edfbf3', true, true)}

                      {/* [C] Gastos operador */}
                      {negCell(d.gCom,  GUINDA,  `${GUINDA}04`)}
                      {negCell(d.gRuta, GUINDA,  `${GUINDA}04`)}

                      {/* [D] Costos vehículo */}
                      {negCell(d.gFij,  '#d97706', '#fffef5')}
                      {negCell(d.gTall, '#ea580c', '#fffef5')}

                      {/* [E] Nómina */}
                      <td className="text-end" style={{padding:'7px 9px',borderBottom:'1px solid #f1f5f9',background:'#f8f8ff'}}>
                        {d.nom>0 ? (
                          <span className="d-block" style={{fontSize:12,fontWeight:600,color:'#6366f1'}}>{f(d.nom)}</span>
                        ) : <span style={{color:'#c0c9d6'}}>—</span>}
                        <span style={{fontSize:10,color:'#94a3b8'}}>{d.pctCh}%ch · {pctSopGlobal}%sop</span>
                      </td>

                      {/* [F] Utilidad */}
                      <td className="text-end" style={{padding:'7px 9px',borderBottom:'1px solid #f1f5f9'}}>
                        <span className="d-inline-block rounded-pill px-2 py-1 fw-bold" style={{
                          fontSize:12,
                          background: ok?'#dcfce7':`${GUINDA}18`,
                          color: ok?'#16a34a':GUINDA,
                        }}>
                          {f(d.util)}
                        </span>
                      </td>

                      {/* [G] Toggle */}
                      <td className="text-center" style={{padding:'7px 6px',borderBottom:'1px solid #f1f5f9'}}>
                        <button className="btn btn-sm p-0 d-flex align-items-center justify-content-center rounded-circle"
                          style={{width:24,height:24,background:exp?`${GUINDA}18`:'#f1f5f9',border:'none',color:exp?GUINDA:'#94a3b8',margin:'0 auto'}}
                          onClick={e=>{e.stopPropagation();toggleExpand(id);}}>
                          {exp?<ChevronUp size={12}/>:<ChevronDown size={12}/>}
                        </button>
                      </td>
                    </tr>

                    {exp && <DetailRow emp={emp}/>}
                  </React.Fragment>
                );
              })}

              <TotalsRow/>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TabTabla;
