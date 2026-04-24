import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Landmark, Plus, X, Wallet, Receipt, CreditCard, Info, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

import FormularioLiquidacion from '../components/Empleados_User/SubComponents/FormularioLiquidacion';
import FormularioGasto from '../components/Empleados_User/SubComponents/FormularioGasto';
import FormularioCorteCAja from '../components/Empleados_User/SubComponents/FormularioCorteCAja';
import TabCortesCAja from '../components/Empleados_Admin/TabCortesCAja';

import { EMPLEADO_GET_VEHICULOS } from '../config';
import { getOperationalDateRange, formatDateForApi } from '../utils/dateUtils';

const GUINDA = '#800020';

const PERIODOS = [
  { key: 'semana', label: 'Semana' },
  { key: 'mes',    label: 'Mes'    },
  { key: 'anio',   label: 'Año'    },
];

function formatPeriodoLabel(periodo, fechaRef) {
  const { start, end } = getOperationalDateRange(fechaRef, periodo);
  const opts = { day: '2-digit', month: 'short' };
  if (periodo === 'semana') {
    return `${start.toLocaleDateString('es-MX', opts)} – ${end.toLocaleDateString('es-MX', opts)}`;
  }
  if (periodo === 'mes') {
    return start.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).toUpperCase();
  }
  return String(start.getFullYear());
}

function navegarFecha(periodo, fechaRef, dir) {
  const d = new Date(fechaRef);
  if (periodo === 'semana') d.setDate(d.getDate() + dir * 7);
  if (periodo === 'mes')    d.setMonth(d.getMonth() + dir);
  if (periodo === 'anio')   d.setFullYear(d.getFullYear() + dir);
  return d;
}

export default function Entradas({ user }) {
  const isAdmin = ['admin', 'development'].includes(user?.rol);

  // ── Estado para empleados ──
  const [seccion, setSeccion]   = useState('ingreso');
  const [finanzas, setFinanzas] = useState({ monto_total: 0, propinas: 0, otros_viajes: 0 });
  const [liquidacionKey, setLiquidacionKey] = useState(0);
  const [gastoData, setGastoData] = useState({ tipo: '', monto: '', odometro: '', evidencia: null });
  const [gastoKey, setGastoKey]   = useState(0);
  const [vehiculoId, setVehiculoId] = useState('');

  // ── Estado para admin ──
  const [showCorteForm, setShowCorteForm] = useState(false);
  const [cortesKey, setCortesKey]         = useState(0);
  const [periodo, setPeriodo]             = useState('semana');
  const [fechaRef, setFechaRef]           = useState(new Date());

  const { fechaInicio, fechaFin } = useMemo(() => {
    const { start, end } = getOperationalDateRange(fechaRef, periodo);
    return { fechaInicio: formatDateForApi(start), fechaFin: formatDateForApi(end) };
  }, [periodo, fechaRef]);

  const fetchVehiculo = useCallback(async () => {
    if (!user?.id || isAdmin) return;
    try {
      const res  = await fetch(`${EMPLEADO_GET_VEHICULOS}?empleado_id=${user.id}&t=${Date.now()}`);
      const data = await res.json();
      if (data.status === 'success' && data.vehiculo) setVehiculoId(data.vehiculo.id);
    } catch (e) {}
  }, [user?.id, isAdmin]);

  useEffect(() => { fetchVehiculo(); }, [fetchVehiculo]);

  const handleLiquidacionConfirmada = () => {
    setFinanzas({ monto_total: 0, propinas: 0, otros_viajes: 0 });
    setLiquidacionKey(k => k + 1);
  };

  const handleGastoGuardado  = () => { setGastoData({ tipo: '', monto: '', odometro: '', evidencia: null }); setGastoKey(k => k + 1); };
  const handleGastoCancelado = () =>   setGastoData({ tipo: '', monto: '', odometro: '', evidencia: null });
  const handleCorteCancelado = () =>   setShowCorteForm(false);
  const handleCorteGuardado  = () => { setShowCorteForm(false); setCortesKey(k => k + 1); };

  return (
    <div
      className="container-fluid px-2 py-3 px-md-4 py-md-4 animate__animated animate__fadeIn"
      style={{ backgroundColor: '#f1f5f9', minHeight: '100vh' }}
    >
      <div className="mx-auto" style={{ maxWidth: '1200px' }}>

        {/* ── HEADER ── */}
        <div
          className="text-white rounded-4 p-4 mb-4 shadow-lg d-flex flex-column flex-lg-row justify-content-between align-items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
        >
          {/* Título */}
          <div className="d-flex align-items-center gap-3">
            <div className="d-none d-sm-flex align-items-center justify-content-center bg-white bg-opacity-10 rounded-4"
              style={{ width: 54, height: 54, flexShrink: 0 }}>
              <Landmark size={28} color="white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="fw-bold mb-0" style={{ fontSize: '1.6rem' }}>
                {isAdmin ? 'Entradas' : 'Entradas & Gastos'}
              </h1>
              <p className="text-white-50 mb-0 text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.08em' }}>
                {isAdmin ? 'Cortes de caja y entradas de operadores' : 'Registro de ingresos y gastos del día'}
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="d-flex align-items-center gap-3">
            {isAdmin && !showCorteForm && (
              <button
                className="btn fw-bold rounded-4 px-4 py-2 d-flex align-items-center gap-2 text-white"
                style={{ backgroundColor: '#800020', border: 'none', whiteSpace: 'nowrap' }}
                onClick={() => setShowCorteForm(true)}>
                <Plus size={17} /> Nuevo Corte
              </button>
            )}
            {isAdmin && showCorteForm && (
              <button
                className="btn btn-outline-light fw-bold rounded-4 px-4 py-2 d-flex align-items-center gap-2"
                onClick={() => setShowCorteForm(false)}>
                <X size={17} /> Cancelar
              </button>
            )}
          </div>

        </div>

        {/* ── VISTA ADMIN ── */}
        {isAdmin && (
          <>
            {showCorteForm && (
              <div className="mb-4">
                <FormularioCorteCAja
                  user={user}
                  onCancelar={handleCorteCancelado}
                  onGuardado={handleCorteGuardado}
                  hideCloseButton={true}
                />
              </div>
            )}
            {!showCorteForm && (
              <>
                {/* ── Selector de período ── */}
                <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
                  {/* Tabs semana/mes/año */}
                  <div className="d-flex rounded-3 overflow-hidden flex-shrink-0"
                    style={{ border: '1.5px solid #e2e8f0', background: '#fff', height: 36 }}>
                    {PERIODOS.map(p => (
                      <button key={p.key} onClick={() => { setPeriodo(p.key); setFechaRef(new Date()); }}
                        className="btn px-3 d-flex align-items-center gap-1"
                        style={{
                          fontSize: 12, fontWeight: 700, border: 'none', borderRadius: 0, height: '100%',
                          background: periodo === p.key ? GUINDA : 'transparent',
                          color:      periodo === p.key ? '#fff' : '#64748b',
                          transition: 'all .15s'
                        }}>
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Navegación prev/next */}
                  <div className="d-flex align-items-center gap-1 rounded-3 px-2 flex-shrink-0"
                    style={{ background: '#fff', border: '1.5px solid #e2e8f0', height: 36 }}>
                    <button className="btn btn-sm border-0 p-1 d-flex align-items-center"
                      style={{ color: '#64748b' }}
                      onClick={() => setFechaRef(prev => navegarFecha(periodo, prev, -1))}>
                      <ChevronLeft size={15}/>
                    </button>
                    <span className="fw-semibold" style={{ fontSize: 12, color: '#0f172a', minWidth: 140, textAlign: 'center' }}>
                      {formatPeriodoLabel(periodo, fechaRef)}
                    </span>
                    <button className="btn btn-sm border-0 p-1 d-flex align-items-center"
                      style={{ color: '#64748b' }}
                      onClick={() => setFechaRef(prev => navegarFecha(periodo, prev, 1))}>
                      <ChevronRight size={15}/>
                    </button>
                  </div>

                  {/* Hoy */}
                  <button className="btn btn-sm d-flex align-items-center gap-1 flex-shrink-0"
                    style={{ border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', height: 36, fontSize: 12, fontWeight: 600, borderRadius: 8 }}
                    onClick={() => setFechaRef(new Date())}>
                    <Calendar size={13}/> Hoy
                  </button>
                </div>

                <TabCortesCAja key={`${cortesKey}-${fechaInicio}-${fechaFin}`} fechaInicio={fechaInicio} fechaFin={fechaFin} />
              </>
            )}
          </>
        )}

        {/* ── VISTA EMPLEADO / LIMPIEZA ── */}
        {!isAdmin && (
          <>
            <div className="d-flex align-items-start gap-3 p-3 mb-4 rounded-4 border"
              style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
              <Info size={18} style={{ color: '#b45309', flexShrink: 0, marginTop: 2 }} />
              <p className="mb-0 small" style={{ color: '#92400e', lineHeight: 1.5 }}>
                <strong>Recuerda:</strong> la gasolina es cubierta por la empresa con tarjeta —
                <strong> no la descontes de tu efectivo</strong>. Registra aquí solo el efectivo
                que realmente tienes (ingresos de viajes y gastos pagados de tu bolsillo como casetas o lavado).
              </p>
            </div>

            {/* Toggle Ingresos / Gastos */}
            <div className="d-flex gap-0 mb-4 rounded-4 overflow-hidden shadow-sm border bg-white" style={{ maxWidth: 320 }}>
              <button
                onClick={() => setSeccion('ingreso')}
                style={{
                  flex: 1, padding: '0.6rem 1rem', border: 'none',
                  fontWeight: 700, fontSize: 13, letterSpacing: '0.03em', cursor: 'pointer',
                  background: seccion === 'ingreso' ? '#198754' : 'transparent',
                  color: seccion === 'ingreso' ? '#fff' : '#6b6b6b',
                  transition: 'all 0.2s',
                }}>
                <Wallet size={14} className="me-1" />Ingresos
              </button>
              <button
                onClick={() => setSeccion('gasto')}
                style={{
                  flex: 1, padding: '0.6rem 1rem', border: 'none',
                  fontWeight: 700, fontSize: 13, letterSpacing: '0.03em', cursor: 'pointer',
                  background: seccion === 'gasto' ? '#ffc107' : 'transparent',
                  color: seccion === 'gasto' ? '#212529' : '#6b6b6b',
                  transition: 'all 0.2s',
                }}>
                <Receipt size={14} className="me-1" />Gastos
              </button>
            </div>

            {seccion === 'ingreso' && (
              <FormularioLiquidacion
                key={liquidacionKey}
                user={user}
                vehiculoId={vehiculoId}
                finanzas={finanzas}
                setFinanzas={setFinanzas}
                onCancel={() => setFinanzas({ monto_total: 0, propinas: 0, otros_viajes: 0 })}
                onConfirmar={handleLiquidacionConfirmada}
              />
            )}

            {seccion === 'gasto' && (
              <>
                <div className="d-flex align-items-start gap-3 p-3 mb-3 rounded-4 border"
                  style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
                  <CreditCard size={18} style={{ color: '#1d4ed8', flexShrink: 0, marginTop: 2 }} />
                  <p className="mb-0 small" style={{ color: '#1e40af', lineHeight: 1.5 }}>
                    Si el tipo de gasto es <strong>Gasolina</strong>, la empresa lo cubre con tarjeta.
                    Regístralo para mantener el odómetro actualizado, pero
                    <strong> no afecta tu saldo en efectivo</strong>.
                  </p>
                </div>
                <FormularioGasto
                  key={gastoKey}
                  user={user}
                  vehiculoId={vehiculoId}
                  gastoData={gastoData}
                  setGastoData={setGastoData}
                  onCancel={handleGastoCancelado}
                  onGuardar={handleGastoGuardado}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
