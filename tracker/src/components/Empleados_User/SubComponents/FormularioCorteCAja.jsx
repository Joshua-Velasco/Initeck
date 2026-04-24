import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart
} from 'recharts';
import {
  DollarSign, Users, Calendar, TrendingUp, TrendingDown,
  Minus, CheckCircle, AlertCircle, PenLine, X,
  History, ChevronDown, ChevronUp, Clock, Banknote,
  ArrowRight, ReceiptText, Activity, Gauge, MapPin, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
  EMPLEADO_LISTAR_URL,
  CORTE_CAJA_BALANCE_URL,
  CORTE_CAJA_GUARDAR_URL,
  NOMINA_LISTAR_TICKETS_URL,
  EMPLEADOS_RENDIMIENTO_URL,
  EMPLEADOS_KILOMETRAJE_URL
} from '../../../config';
import { dataURLtoBlob } from '../../../utils/api';
import ModalEstado from '../../Autos/estatus/ModalEstado';
import { getOperationalDateRange, formatDateForApi } from '../../../utils/dateUtils';

const GUINDA       = '#800020';
const GUINDA_LIGHT = '#fdf2f4';
const GUINDA_BORDER= '#f5c2cc';
const f = (v) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v ?? 0);

const TIPOS_PERIODO = [
  { key: 'semana', label: 'Semana' },
  { key: 'mes',    label: 'Mes'    },
  { key: 'anio',   label: 'Año'    },
];

function buildPeriodo(tipoPeriodo, fechaRef) {
  const { start, end } = getOperationalDateRange(fechaRef, tipoPeriodo);
  const toISO = (d) => formatDateForApi(d);
  let label;
  if (tipoPeriodo === 'semana') {
    const fmt = (d) => d.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short' });
    label = `${fmt(start)} – ${fmt(end)}`;
  } else if (tipoPeriodo === 'mes') {
    label = start.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).toUpperCase();
  } else {
    label = String(start.getFullYear());
  }
  return { inicio: toISO(start), fin: toISO(end), label };
}

function navegarFechaCorte(tipoPeriodo, fechaRef, dir) {
  const d = new Date(fechaRef);
  if (tipoPeriodo === 'semana') d.setDate(d.getDate() + dir * 7);
  if (tipoPeriodo === 'mes')    d.setMonth(d.getMonth() + dir);
  if (tipoPeriodo === 'anio')   d.setFullYear(d.getFullYear() + dir);
  return d;
}

const StepBadge = ({ n, label, icon: Icon }) => (
  <div className="d-flex align-items-center gap-2 mb-3">
    <div className="d-flex align-items-center justify-content-center fw-bold rounded-circle flex-shrink-0"
      style={{ width: 26, height: 26, background: GUINDA, color: '#fff', fontSize: 12 }}>
      {n}
    </div>
    <span className="fw-bold text-uppercase" style={{ fontSize: 11, color: '#64748b', letterSpacing: '0.07em' }}>
      {Icon && <Icon size={12} className="me-1" />}{label}
    </span>
  </div>
);

const SectionCard = ({ children, className = '' }) => (
  <div className={`card border-0 rounded-4 shadow-sm mb-3 ${className}`} style={{ background: '#fff' }}>
    <div className="card-body p-3 p-sm-4">{children}</div>
  </div>
);

const StatChip = ({ label, value, color, icon: Icon }) => (
  <div className="rounded-3 p-2 text-center flex-fill"
    style={{ background: `${color}12`, border: `1.5px solid ${color}30`, minWidth: 80 }}>
    {Icon && <Icon size={14} style={{ color }} className="mb-1" />}
    <p className="mb-0 fw-black" style={{ fontSize: 15, color }}>{value}</p>
    <p className="mb-0" style={{ fontSize: 10, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
  </div>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-3 shadow-lg p-2 border" style={{ fontSize: 11 }}>
      <p className="fw-bold mb-1 text-secondary" style={{ fontSize: 10 }}>{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="d-flex justify-content-between gap-3">
          <span style={{ color: p.color }}>● {p.name}</span>
          <span className="fw-bold">{p.dataKey === 'km' ? `${p.value} km` : f(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function FormularioCorteCAja({ user, onCancelar, hideCloseButton = false }) {
  const [empleados, setEmpleados]           = useState([]);
  const [empleadoId, setEmpleadoId]         = useState('');
  const [empleadoNombre, setEmpleadoNombre] = useState('');

  // ── Período seleccionable ──
  const [tipoPeriodo, setTipoPeriodo] = useState('semana');
  const [fechaRefCorte, setFechaRefCorte] = useState(new Date());
  const periodo = useMemo(() => buildPeriodo(tipoPeriodo, fechaRefCorte), [tipoPeriodo, fechaRefCorte]);

  const [balance, setBalance]               = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [totalRecibido, setTotalRecibido]   = useState('');
  const [deudaAnterior, setDeudaAnterior]   = useState(0);
  const [historial, setHistorial]           = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [historialAbierto, setHistorialAbierto] = useState(false);
  const [saving, setSaving]                 = useState(false);
  const [exito, setExito]                   = useState(null);
  const [modalEstado, setModalEstado]       = useState({ mostrar: false, tipo: 'success', titulo: '', mensaje: '' });
  const [error, setError]                   = useState(null);
  const sigRef = useRef(null);

  // Gráfica de rendimiento
  const [chartData, setChartData]           = useState([]);
  const [kmData, setKmData]                 = useState([]);
  const [loadingChart, setLoadingChart]     = useState(false);
  const [totalKm, setTotalKm]               = useState(0);
  const [totalViajes, setTotalViajes]       = useState(0);

  useEffect(() => {
    fetch(EMPLEADO_LISTAR_URL)
      .then(r => r.json())
      .then(data => {
        const lista = (data.empleados || data.data || data || []).filter(
          e => !['monitorista', 'taller'].includes(e.rol?.toLowerCase())
        );
        setEmpleados(lista);
      })
      .catch(() => {});
  }, []);

  const cargarDatosEmpleado = useCallback(async (empId) => {
    if (!empId) return;
    setLoadingBalance(true);
    setLoadingHistorial(true);
    setLoadingChart(true);
    setBalance(null);
    setDeudaAnterior(0);
    setHistorial([]);
    setChartData([]);
    setKmData([]);
    setTotalKm(0);
    setTotalViajes(0);

    // Balance del período
    try {
      const r = await fetch(`${CORTE_CAJA_BALANCE_URL}?empleado_id=${empId}&fecha_inicio=${periodo.inicio}&fecha_fin=${periodo.fin}`);
      if (!r.ok) {
        const errData = await r.json().catch(() => ({}));
        throw new Error(errData.message || `Error del servidor (${r.status})`);
      }
      const d = await r.json();
      if (d.status === 'success') setBalance(d.data);
      else throw new Error(d.message || 'Error al obtener balance');
    } catch (err) {
      console.error("Error cargando balance:", err);
      setError(err.message);
    } finally { setLoadingBalance(false); }

    // Historial de cortes
    try {
      const r = await fetch(`${NOMINA_LISTAR_TICKETS_URL}?empleado_id=${empId}`);
      const d = await r.json();
      if (d.status === 'success') {
        const cortes = (d.data || []).filter(t => t.tipo === 'corte_caja');
        setHistorial(cortes);
        setDeudaAnterior(Math.max(0, cortes.reduce((s, t) => s + parseFloat(t.diferencia ?? 0), 0)));
      }
    } catch {} finally { setLoadingHistorial(false); }

    // Gráfica de rendimiento diario
    try {
      const r = await fetch(`${EMPLEADOS_RENDIMIENTO_URL}?id=${empId}&periodo=dia&fecha_inicio=${periodo.inicio}&fecha_fin=${periodo.fin}`);
      const raw = await r.json();
      const items = Array.isArray(raw) ? raw : [];
      let viajes = 0;
      const procesados = items.map(item => {
        const fDate = item.fecha || item.mes || '';
        let label = fDate;
        if (fDate.includes('-') && fDate.length === 10) {
          const [, mm, dd] = fDate.split('-');
          label = `${dd}/${mm}`;
        }
        const v = parseInt(item.total_viajes || item.viajes || 0);
        viajes += v;
        return {
          label,
          efectivo: parseFloat(item.total_efectivo || 0),
          neto:     parseFloat(item.neto || 0),
          gastos:   parseFloat(item.total_gastos || 0),
          viajes:   v,
        };
      });
      setChartData(procesados);
      setTotalViajes(viajes);
    } catch {}

    // Kilómetros del período
    try {
      const r = await fetch(`${EMPLEADOS_KILOMETRAJE_URL}?empleado_id=${empId}&limit=50`);
      const d = await r.json();
      if (d.status === 'success') {
        const filtered = (d.data || []).filter(row => {
          if (!row.fecha) return true;
          return row.fecha >= periodo.inicio && row.fecha <= periodo.fin;
        });
        const km = filtered.reduce((s, row) => s + (parseFloat(row.recorrido) || 0), 0);
        setTotalKm(km);

        // Agrupar por fecha para mini-gráfica km
        const grouped = {};
        filtered.forEach(row => {
          const k = row.fecha || 'S/F';
          if (!grouped[k]) grouped[k] = 0;
          grouped[k] += parseFloat(row.recorrido) || 0;
        });
        const kmArr = Object.entries(grouped)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([fecha, km]) => {
            const [, mm, dd] = fecha.split('-');
            return { label: `${dd}/${mm}`, km: parseFloat(km.toFixed(1)) };
          });
        setKmData(kmArr);
      }
    } catch {} finally { setLoadingChart(false); }

  }, [periodo.inicio, periodo.fin]);

  // Recargar al cambiar período si ya hay empleado seleccionado
  useEffect(() => {
    if (empleadoId) cargarDatosEmpleado(empleadoId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo.inicio, periodo.fin]);

  const handleSeleccionarEmpleado = (e) => {
    const id = e.target.value;
    setEmpleadoId(id);
    setEmpleadoNombre(empleados.find(em => String(em.id) === String(id))?.nombre_completo || '');
    setTotalRecibido('');
    setError(null);
    setExito(null);
    if (id) cargarDatosEmpleado(id);
  };

  // Neto a entregar = solo efectivo (sin descontar gastos, sin incluir propinas)
  const totalRegistradoApp = balance ? parseFloat(balance.total_ingresos ?? 0) : 0;
  const recibido           = parseFloat((totalRecibido || '').replace(/,/g, '')) || 0;
  const diferencia         = totalRegistradoApp - recibido;
  const deudaTotal         = deudaAnterior + diferencia;
  const esAbono            = diferencia < -0.005 && deudaAnterior > 0.005;
  const estado             = diferencia > 0.005 ? 'deuda' : diferencia < -0.005 ? (esAbono ? 'abono' : 'favor') : 'igual';

  const handleGuardar = async () => {
    if (!empleadoId)                                          { setError('Selecciona un empleado.'); return; }
    if (!totalRecibido || isNaN(recibido) || recibido < 0)   { setError('Ingresa un monto válido.'); return; }
    if (!sigRef.current || sigRef.current.isEmpty())         { setError('Firma requerida antes de generar el corte.'); return; }

    setSaving(true); setError(null);
    try {
      const firmaBase64 = sigRef.current.getCanvas().toDataURL('image/png');
      const firmaBlob   = dataURLtoBlob(firmaBase64);

      const formData = new FormData();
      formData.append('empleado_id',          parseInt(empleadoId));
      formData.append('admin_id',             user?.id ?? 0);
      formData.append('periodo_inicio',       periodo.inicio);
      formData.append('periodo_fin',          periodo.fin);
      formData.append('periodo_label',        periodo.label);
      formData.append('total_registrado_app', totalRegistradoApp);
      formData.append('total_recibido',       recibido);
      formData.append('total_ingresos',       balance?.total_ingresos ?? 0);
      formData.append('total_propinas',       balance?.total_propinas ?? 0);
      formData.append('total_gastos',         balance?.total_gastos   ?? 0);
      if (firmaBlob) formData.append('firma_admin', firmaBlob, 'firma_admin.png');

      const res = await fetch(CORTE_CAJA_GUARDAR_URL, {
        method: 'POST',
        body: formData   // sin Content-Type manual; el browser pone multipart/form-data
      });
      const data = await res.json();
      if (data.status === 'success') {
        setExito(`Corte #${data.id} generado.`);
        setTotalRecibido('');
        sigRef.current.clear();
        await cargarDatosEmpleado(empleadoId);
        setModalEstado({ mostrar: true, tipo: 'success', titulo: '¡Corte generado!', mensaje: `Corte #${data.id} registrado correctamente. El empleado debe firmarlo en "Mis Tickets".` });
      } else {
        setModalEstado({ mostrar: true, tipo: 'error', titulo: 'Error al guardar', mensaje: data.message || 'No se pudo guardar el corte de caja.' });
        setError(data.message || 'Error al guardar el corte.');
      }
    } catch {
      setModalEstado({ mostrar: true, tipo: 'error', titulo: 'Error de conexión', mensaje: 'No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.' });
      setError('Error de conexión.');
    }
    finally  { setSaving(false); }
  };

  const estadoColors = {
    deuda: { text: '#dc2626', bg: '#fef2f2', border: '#fca5a5', label: 'Falta entregar', icon: TrendingDown },
    favor: { text: '#16a34a', bg: '#f0fdf4', border: '#86efac', label: 'Entregó de más', icon: TrendingUp },
    igual: { text: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd', label: 'Balanceado',     icon: Minus },
    abono: { text: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Abono a deuda',  icon: Banknote },
  };

  const hasChartData = chartData.length > 0 || kmData.length > 0;

  return (
    <div className="animate__animated animate__fadeIn" style={{ paddingBottom: 8 }}>

      {/* ── HEADER ── */}
      <div className="rounded-4 mb-3 overflow-hidden shadow-sm"
        style={{ background: `linear-gradient(135deg, ${GUINDA} 0%, #5a0014 100%)` }}>
        <div className="p-3 d-flex align-items-start justify-content-between">
          <div className="flex-grow-1 me-3">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.15)' }}>
                <ReceiptText size={17} color="#fff" />
              </div>
              <span className="fw-bold text-white" style={{ fontSize: 15 }}>Corte de Caja</span>
            </div>

            {/* Selector de período */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              {/* Tabs */}
              <div className="d-flex rounded-3 overflow-hidden flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.12)', padding: 3, gap: 2 }}>
                {TIPOS_PERIODO.map(tp => (
                  <button key={tp.key}
                    onClick={() => { setTipoPeriodo(tp.key); setFechaRefCorte(new Date()); setError(null); setExito(null); }}
                    style={{
                      padding: '4px 12px', border: 'none', borderRadius: 6, cursor: 'pointer',
                      fontWeight: 700, fontSize: 11,
                      background: tipoPeriodo === tp.key ? '#fff' : 'transparent',
                      color:      tipoPeriodo === tp.key ? GUINDA : 'rgba(255,255,255,0.8)',
                      transition: 'all .15s'
                    }}>
                    {tp.label}
                  </button>
                ))}
              </div>

              {/* Prev / label / Next */}
              <div className="d-flex align-items-center gap-1 flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '2px 8px' }}>
                <button onClick={() => setFechaRefCorte(prev => navegarFechaCorte(tipoPeriodo, prev, -1))}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: '0 2px', display: 'flex' }}>
                  <ChevronLeft size={14}/>
                </button>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.95)', fontWeight: 600, minWidth: 130, textAlign: 'center' }}>
                  {periodo.label}
                </span>
                <button onClick={() => setFechaRefCorte(prev => navegarFechaCorte(tipoPeriodo, prev, 1))}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: '0 2px', display: 'flex' }}>
                  <ChevronRight size={14}/>
                </button>
              </div>
            </div>
          </div>

          {!hideCloseButton && onCancelar && (
            <button onClick={onCancelar}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 20,
                color: '#fff', fontSize: 12, fontWeight: 600, padding: '5px 12px', cursor: 'pointer', flexShrink: 0 }}>
              <X size={13} className="me-1" />Cerrar
            </button>
          )}
        </div>
      </div>

      {/* ── MODAL DE ESTADO ── */}
      <ModalEstado
        mostrar={modalEstado.mostrar}
        tipo={modalEstado.tipo}
        titulo={modalEstado.titulo}
        mensaje={modalEstado.mensaje}
        autoCerrar={modalEstado.tipo === 'success'}
        duracion={4000}
        onClose={() => setModalEstado(m => ({ ...m, mostrar: false }))}
      />

      {/* ── ALERTAS ── */}
      {exito && (
        <div className="rounded-4 p-3 mb-3 d-flex align-items-start gap-2"
          style={{ background: '#f0fdf4', border: '1.5px solid #86efac' }}>
          <CheckCircle size={17} style={{ color: '#16a34a', flexShrink: 0, marginTop: 1 }} />
          <span className="fw-semibold" style={{ fontSize: 13, color: '#15803d', lineHeight: 1.4 }}>{exito}</span>
        </div>
      )}
      {error && (
        <div className="rounded-4 p-3 mb-3 d-flex align-items-start gap-2"
          style={{ background: '#fef2f2', border: '1.5px solid #fca5a5' }}>
          <AlertCircle size={17} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
          <span className="fw-semibold" style={{ fontSize: 13, color: '#dc2626', lineHeight: 1.4 }}>{error}</span>
        </div>
      )}

      {/* ── PASO 1: EMPLEADO ── */}
      <SectionCard>
        <StepBadge n="1" label="Seleccionar chofer" icon={Users} />
        <select
          className="form-select rounded-3 fw-semibold"
          value={empleadoId}
          onChange={handleSeleccionarEmpleado}
          style={{ fontSize: 15, padding: '12px 14px', border: '1.5px solid #e2e8f0',
            color: empleadoId ? '#0f172a' : '#94a3b8', background: '#fff' }}>
          <option value="">Elige un chofer / operador…</option>
          {empleados.map(e => (
            <option key={e.id} value={e.id}>
              {e.nombre_completo}{e.unidad_nombre ? ` · ${e.unidad_nombre}` : ''}
            </option>
          ))}
        </select>
      </SectionCard>

      {/* ── CONTENIDO TRAS SELECCIÓN ── */}
      {empleadoId && (
        <>
          {/* ── GRÁFICA DE RENDIMIENTO ── */}
          <SectionCard>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 26, height: 26, background: '#eff6ff' }}>
                <Activity size={13} style={{ color: '#2563eb' }} />
              </div>
              <span className="fw-bold text-uppercase" style={{ fontSize: 11, color: '#64748b', letterSpacing: '0.07em' }}>
                Rendimiento del período — {empleadoNombre.split(' ')[0]}
              </span>
            </div>

            {loadingChart ? (
              <div className="d-flex align-items-center justify-content-center gap-2 py-3">
                <span className="spinner-border spinner-border-sm" style={{ color: GUINDA }} />
                <span className="text-muted" style={{ fontSize: 13 }}>Cargando rendimiento…</span>
              </div>
            ) : (
              <>
                {/* Stat chips */}
                <div className="d-flex gap-2 flex-wrap mb-3">
                  <StatChip label="Ingresos"   value={f(balance?.total_ingresos ?? 0)}     color="#2563eb" icon={DollarSign} />
                  <StatChip label="Viajes"     value={totalViajes}                         color={GUINDA}  icon={Activity}   />
                  <StatChip label="Km recorridos" value={`${totalKm.toFixed(0)} km`}       color="#16a34a" icon={MapPin}     />
                </div>

                {/* Gráfica ingresos diarios */}
                {chartData.length > 0 && (
                  <>
                    <p className="mb-1" style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Ingresos diarios
                    </p>
                    <div style={{ height: 140, minWidth: 0 }}>
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="efectivo" name="Efectivo" fill="#3b82f6" radius={[4,4,0,0]} maxBarSize={28} />
                          <Line dataKey="neto" name="Neto" stroke="#16a34a" strokeWidth={2} dot={{ r: 3, fill: '#16a34a' }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}

                {/* Gráfica km */}
                {kmData.length > 0 && (
                  <>
                    <p className="mt-3 mb-1" style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Kilómetros recorridos por día
                    </p>
                    <div style={{ height: 110, minWidth: 0 }}>
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={kmData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}km`} />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="km" name="Km" fill="#16a34a" radius={[4,4,0,0]} maxBarSize={28} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}

                {!hasChartData && (
                  <p className="text-center text-muted mb-0 py-2" style={{ fontSize: 12 }}>
                    Sin actividad registrada en este período.
                  </p>
                )}
              </>
            )}
          </SectionCard>

          {/* ── PASO 2: BALANCE ── */}
          <SectionCard>
            <StepBadge n="2" label="Resumen del período en la app" icon={TrendingUp} />
            {loadingBalance ? (
              <div className="d-flex align-items-center justify-content-center gap-2 py-3">
                <span className="spinner-border spinner-border-sm" style={{ color: GUINDA }} />
                <span className="text-muted" style={{ fontSize: 13 }}>Cargando datos…</span>
              </div>
            ) : balance ? (
              <>
                <div className="row g-2 mb-2">
                  {[
                    { label: 'Efectivo',       value: balance.total_ingresos, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
                    { label: 'Propinas',        value: balance.total_propinas, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
                    { label: 'Gastos',          value: balance.total_gastos,   color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
                    { label: 'Neto a entregar', value: balance.total_ingresos,  color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', main: true },
                  ].map(item => (
                    <div key={item.label} className="col-6">
                      <div className="rounded-3 p-2 text-center h-100 d-flex flex-column justify-content-center"
                        style={{ background: item.bg, border: `1.5px solid ${item.border}`, minHeight: item.main ? 72 : 62 }}>
                        <p className="mb-1" style={{ fontSize: 10, color: item.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                        <p className="mb-0 fw-bold" style={{ fontSize: item.main ? 17 : 14, color: item.color }}>{f(item.value)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-muted mb-0" style={{ fontSize: 11 }}>
                  {balance.total_jornadas} jornada{balance.total_jornadas !== 1 ? 's' : ''} en el período
                </p>
              </>
            ) : (
              <p className="text-center text-muted mb-0 py-2" style={{ fontSize: 13 }}>
                Sin actividad registrada en este período.
              </p>
            )}
          </SectionCard>

          {/* ── DEUDA ANTERIOR ── */}
          {deudaAnterior > 0.005 && (
            <div className="rounded-4 p-3 mb-3 d-flex align-items-center gap-3"
              style={{ background: '#fff7ed', border: '1.5px solid #fed7aa' }}>
              <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 38, height: 38, background: '#ffedd5' }}>
                <AlertCircle size={18} style={{ color: '#ea580c' }} />
              </div>
              <div>
                <p className="fw-bold mb-0" style={{ fontSize: 13, color: '#9a3412' }}>Deuda de períodos anteriores</p>
                <p className="fw-bold mb-0" style={{ fontSize: 18, color: '#ea580c' }}>{f(deudaAnterior)}</p>
              </div>
            </div>
          )}

          {/* ── PASO 3: MONTO RECIBIDO ── */}
          <SectionCard>
            <StepBadge n="3" label="Total recibido del chofer" icon={Banknote} />
            <div className="rounded-3 overflow-hidden" style={{ border: '2px solid #e2e8f0', background: '#f8fafc' }}>
              <div className="d-flex align-items-center">
                <span className="fw-black px-3" style={{ fontSize: 22, color: '#16a34a', userSelect: 'none' }}>$</span>
                <input
                  type="text" inputMode="decimal"
                  className="form-control border-0 shadow-none bg-transparent fw-bold"
                  placeholder="0.00"
                  value={totalRecibido}
                  onChange={e => {
                    const raw = e.target.value.replace(/,/g, '');
                    if (raw !== '' && !/^\d*\.?\d*$/.test(raw)) return;
                    const parts = raw.split('.');
                    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    setTotalRecibido(parts.join('.'));
                    setError(null);
                  }}
                  style={{ fontSize: 26, fontWeight: 800, padding: '14px 8px 14px 0', color: '#0f172a' }}
                />
              </div>
            </div>

            {/* Sugerencia cuando hay deuda anterior */}
            {deudaAnterior > 0.005 && (
              <div className="mt-2 rounded-3 p-2 d-flex align-items-center justify-content-between gap-2"
                style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                <div>
                  <p className="mb-0 fw-bold" style={{ fontSize: 11, color: '#9a3412' }}>
                    Para saldar todo (periodo + deuda):
                  </p>
                  <p className="mb-0 fw-black" style={{ fontSize: 14, color: '#ea580c' }}>
                    {f(totalRegistradoApp + deudaAnterior)}
                    <span className="fw-normal ms-1" style={{ fontSize: 10, color: '#c2410c' }}>
                      ({f(totalRegistradoApp)} periodo + {f(deudaAnterior)} deuda)
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm fw-bold rounded-pill flex-shrink-0"
                  style={{ background: '#ea580c', color: '#fff', fontSize: 11, whiteSpace: 'nowrap' }}
                  onClick={() => {
                    const total = totalRegistradoApp + deudaAnterior;
                    const parts = String(total.toFixed(2)).split('.');
                    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    setTotalRecibido(parts.join('.'));
                    setError(null);
                  }}>
                  Usar monto
                </button>
              </div>
            )}

            <p className="text-muted mt-2 mb-0" style={{ fontSize: 12 }}>
              {deudaAnterior > 0.005
                ? `Ingresa solo el periodo actual (${f(totalRegistradoApp)}) o el total con deuda (${f(totalRegistradoApp + deudaAnterior)}).`
                : 'Efectivo físico entregado por el chofer en este corte.'}
            </p>
          </SectionCard>

          {/* ── PASO 4: RESULTADO ── */}
          {totalRecibido !== '' && !isNaN(recibido) && (
            <SectionCard>
              <StepBadge n="4" label="Resultado del corte" />

              <div className="rounded-3 p-3 mb-2" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <div className="d-flex justify-content-between align-items-center mb-2"
                  style={{ borderBottom: '1px dashed #e2e8f0', paddingBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>App registró (neto)</span>
                  <span className="fw-bold" style={{ fontSize: 15, color: '#2563eb' }}>{f(totalRegistradoApp)}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: 12, color: '#64748b' }}>Chofer entregó</span>
                  <span className="fw-bold" style={{ fontSize: 15, color: '#16a34a' }}>{f(recibido)}</span>
                </div>
              </div>

              {(() => {
                const c = estadoColors[estado];
                const Icon = c.icon;
                return (
                  <div className="rounded-3 p-3 mb-2 d-flex align-items-center justify-content-between"
                    style={{ background: c.bg, border: `2px solid ${c.border}` }}>
                    <div className="d-flex align-items-center gap-2">
                      <Icon size={18} style={{ color: c.text }} />
                      <span className="fw-bold" style={{ fontSize: 13, color: c.text }}>{c.label}</span>
                    </div>
                    <span className="fw-black" style={{ fontSize: 20, color: c.text }}>
                      {(estado === 'favor' || estado === 'abono') ? '−' : ''}{f(Math.abs(diferencia))}
                    </span>
                  </div>
                );
              })()}

              {(deudaAnterior > 0.005 || estado === 'deuda') && (
                <div className="rounded-3 p-3 d-flex align-items-center justify-content-between"
                  style={{
                    background: deudaTotal > 0.005 ? '#fff7ed' : '#f0fdf4',
                    border: `2px solid ${deudaTotal > 0.005 ? '#fed7aa' : '#86efac'}`
                  }}>
                  <span className="fw-bold" style={{ fontSize: 13, color: deudaTotal > 0.005 ? '#9a3412' : '#166534' }}>
                    Saldo pendiente total
                  </span>
                  <span className="fw-black" style={{ fontSize: 20, color: deudaTotal > 0.005 ? '#ea580c' : '#16a34a' }}>
                    {deudaTotal > 0.005 ? f(deudaTotal) : '✓ Saldado'}
                  </span>
                </div>
              )}
            </SectionCard>
          )}

          {/* ── PASO 5: FIRMA ── */}
          <SectionCard>
            <StepBadge n="5" label="Firma del administrador" icon={PenLine} />
            <div className="rounded-3 overflow-hidden mb-2"
              style={{ border: `2px solid ${GUINDA}30`, background: '#fafafa', height: 170,
                boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.04)' }}>
              <SignatureCanvas
                ref={sigRef}
                penColor="#1e293b"
                canvasProps={{ style: { width: '100%', height: '100%' }, className: 'sigCanvas' }}
              />
            </div>
            <div className="d-flex align-items-center justify-content-between">
              <p className="text-muted mb-0" style={{ fontSize: 11 }}>Traza tu firma dentro del recuadro</p>
              <button
                onClick={() => sigRef.current?.clear()}
                style={{ background: 'none', border: 'none', fontSize: 12,
                  color: '#94a3b8', cursor: 'pointer', padding: '4px 8px', fontWeight: 600 }}>
                <X size={11} className="me-1" />Limpiar
              </button>
            </div>
          </SectionCard>

          {/* ── BOTÓN GENERAR ── */}
          <button
            className="btn w-100 fw-bold rounded-4 d-flex align-items-center justify-content-center gap-2 mb-4"
            style={{
              background: saving || !totalRecibido || !empleadoId ? '#94a3b8' : GUINDA,
              color: '#fff', border: 'none', fontSize: 15, padding: '15px',
              transition: 'background 0.2s',
              boxShadow: saving || !totalRecibido || !empleadoId ? 'none' : `0 4px 16px ${GUINDA}50`
            }}
            disabled={saving || !totalRecibido || !empleadoId}
            onClick={handleGuardar}>
            {saving
              ? <><span className="spinner-border spinner-border-sm" style={{ width: 18, height: 18 }} /> Generando corte…</>
              : <><ReceiptText size={18} /> Generar Corte de Caja <ArrowRight size={16} /></>}
          </button>

          {/* ── HISTORIAL ── */}
          <div className="card border-0 rounded-4 shadow-sm" style={{ background: '#fff' }}>
            <button
              className="btn w-100 text-start p-3 d-flex align-items-center justify-content-between border-0 rounded-4"
              style={{ background: 'transparent' }}
              onClick={() => setHistorialAbierto(!historialAbierto)}>
              <div className="d-flex align-items-center gap-2">
                <div className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 32, height: 32, background: GUINDA_LIGHT }}>
                  <History size={15} style={{ color: GUINDA }} />
                </div>
                <div>
                  <p className="fw-bold mb-0" style={{ fontSize: 13, color: '#0f172a' }}>
                    Historial de {empleadoNombre.split(' ')[0]}
                  </p>
                  {!loadingHistorial && (
                    <p className="text-muted mb-0" style={{ fontSize: 11 }}>
                      {historial.length} corte{historial.length !== 1 ? 's' : ''} previo{historial.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
              <div style={{ color: '#94a3b8' }}>
                {historialAbierto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {historialAbierto && (
              <div className="px-3 pb-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                {loadingHistorial ? (
                  <div className="text-center py-3">
                    <span className="spinner-border spinner-border-sm" style={{ color: GUINDA }} />
                  </div>
                ) : historial.length === 0 ? (
                  <div className="text-center py-4">
                    <History size={32} className="mb-2 opacity-25" style={{ color: GUINDA }} />
                    <p className="text-muted mb-0" style={{ fontSize: 12 }}>Sin cortes previos</p>
                  </div>
                ) : (
                  <div className="mt-2 d-flex flex-column gap-2">
                    {historial.map((corte) => {
                      const dif     = parseFloat(corte.diferencia ?? 0);
                      const firmado = !!corte.firmado_at;
                      const difColor = dif > 0.005 ? '#dc2626' : dif < -0.005 ? '#16a34a' : '#0ea5e9';
                      return (
                        <div key={corte.id} className="rounded-3 overflow-hidden"
                          style={{ border: '1.5px solid #f1f5f9' }}>
                          <div className="px-3 py-2 d-flex align-items-center justify-content-between"
                            style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                            <span className="fw-bold" style={{ fontSize: 12, color: '#0f172a' }}>{corte.periodo}</span>
                            <span className="badge rounded-pill px-2"
                              style={{ background: firmado ? '#dcfce7' : '#fff7ed',
                                color: firmado ? '#16a34a' : '#ea580c', fontSize: 10 }}>
                              {firmado
                                ? <><CheckCircle size={9} className="me-1" />Firmado</>
                                : <><Clock size={9} className="me-1" />Pendiente</>}
                            </span>
                          </div>
                          <div className="px-3 py-2 d-flex justify-content-between align-items-center">
                            <div>
                              <p className="text-muted mb-0" style={{ fontSize: 10 }}>App registró</p>
                              <p className="fw-bold mb-0" style={{ fontSize: 13, color: '#2563eb' }}>{f(corte.utilidad_total)}</p>
                            </div>
                            <ArrowRight size={14} className="text-muted" />
                            <div className="text-center">
                              <p className="text-muted mb-0" style={{ fontSize: 10 }}>Recibido</p>
                              <p className="fw-bold mb-0" style={{ fontSize: 13, color: '#16a34a' }}>{f(corte.total_pago)}</p>
                            </div>
                            <ArrowRight size={14} className="text-muted" />
                            <div className="text-end">
                              <p className="text-muted mb-0" style={{ fontSize: 10 }}>
                                {dif > 0.005 ? 'Deuda' : dif < -0.005 ? 'A favor' : 'Balance'}
                              </p>
                              <p className="fw-bold mb-0" style={{ fontSize: 13, color: difColor }}>
                                {dif === 0 ? '—' : f(Math.abs(dif))}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
