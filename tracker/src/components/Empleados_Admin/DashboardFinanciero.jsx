import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import SignatureCanvas from 'react-signature-canvas';
import TabTabla from './TabTabla';
import DashboardTransferencias from './DashboardTransferencias';
import {
  Calendar, CheckCircle, TrendingUp, TrendingDown,
  DollarSign, Users, Car, Filter, Download, ChevronLeft, Search, X, Star, Save,
  LayoutDashboard, Table, User, Wrench, ChevronRight, History, Clock,
  ChevronDown, ChevronUp, Image as ImageIcon, Activity, CreditCard, FileText, Zap
} from 'lucide-react';
import ReciboOperadorModal from './SubComponents/ReciboOperadorModal';
import HistorialRecibosModal from './SubComponents/HistorialRecibosModal';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ComposedChart, Line, Scatter
} from 'recharts';
import {
  BALANCE_AVANZADO_URL, COLORS, UPLOADS_URL, EMPLEADOS_UPLOADS_URL,
  NOMINA_GUARDAR_TICKET_URL, NOMINA_LISTAR_TICKETS_URL,
  NOMINA_GUARDAR_TRANSFERENCIA_URL, NOMINA_LISTAR_TRANSFERENCIAS_URL
} from '../../config';

const EmpAvatar = ({ emp, size = 32, textSize = 12, className = '' }) => {
  const src = emp?.foto_perfil ? `${EMPLEADOS_UPLOADS_URL}${emp.foto_perfil}` : null;
  const initials = (emp?.empleado_nombre || emp?.nombre_completo || '?').charAt(0).toUpperCase();
  if (src) {
    return (
      <img src={src} alt={initials}
        className={`rounded-circle flex-shrink-0 object-fit-cover ${className}`}
        style={{ width: size, height: size, objectFit: 'cover' }}
        onError={e => {
          e.target.style.display = 'none';
          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
        }}
      />
    );
  }
  return (
    <div className={`rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: textSize, background: '#1e293b', color: '#fff' }}>
      {initials}
    </div>
  );
};
import { useDate } from '../../modules/shell/DateProvider';
import { getOperationalDateRange, formatDateForApi } from '../../utils/dateUtils';

const DashboardFinanciero = ({ user }) => {
  const { date: fechaReferencia, setDate: setFechaReferencia, view: modo, setView: setModo } = useDate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [activeTab, setActiveTab] = useState('ingresos');
  const [activeMainTab, setActiveMainTab] = useState('general'); // general, tabla, detalle, autos
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos', 'efectivo', 'propinas'
  const [selectedExpense, setSelectedExpense] = useState(null); // For expense detail modal
  const [expandedGastoId, setExpandedGastoId] = useState(null);
  const [expandedMantId, setExpandedMantId] = useState(null);
  const [comisionNomina, setComisionNomina] = useState(20); // Valor por defecto 20%
  const [bonosNomina, setBonosNomina] = useState(0);
  const [showConfigSuccess, setShowConfigSuccess] = useState(false);
  const [nominaTickets, setNominaTickets] = useState([]);
  const [transferHistory, setTransferHistory] = useState([]);
  const [selectedTransferEmp, setSelectedTransferEmp] = useState(null);
  const [montoTransferencia, setMontoTransferencia] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [statusTransfer, setStatusTransfer] = useState({ show: false, type: 'loading', message: '' });
  const [globalTransferTotal, setGlobalTransferTotal] = useState(0);
  const [showReciboModal, setShowReciboModal] = useState(false);
  const [selectedEmpleadoRecibo, setSelectedEmpleadoRecibo] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedEmpleadoHistory, setSelectedEmpleadoHistory] = useState(null);
  const [showAdminSig, setShowAdminSig] = useState(false);
  const sigAdminRef = useRef(null);

  // Resetear firma de admin al cambiar de empleado
  useEffect(() => { setShowAdminSig(false); }, [selectedEmpleado?.empleado_id]);

  // Hook para resetear pestaña al seleccionar soporte o admin inactivo
  useEffect(() => {
    if (selectedEmpleado) {
      const role = (selectedEmpleado.empleado_rol || '').toLowerCase();
      const hasIncome = Number(selectedEmpleado.total_ingresos || 0) > 0;
      const isSupport = ['monitorista', 'taller', 'limpieza', 'desarrollador'].includes(role);
      const isInactiveAdmin = (role === 'admin' && !hasIncome);
      
      if (isSupport || isInactiveAdmin) {
        setActiveTab('nomina');
      }
    }
  }, [selectedEmpleado]);

  const StatusModal = ({ status, onClose }) => {
    if (!status.show) return null;
    return (
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-3" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
        <div className="bg-white rounded-5 p-5 shadow-lg text-center animate__animated animate__zoomIn" style={{ maxWidth: '400px' }}>
          {status.type === 'loading' && (
            <>
              <div className="spinner-border text-primary mb-4" style={{ width: '3rem', height: '3rem' }}></div>
              <h4 className="fw-bold">Procesando...</h4>
              <p className="text-muted mb-0">Estamos guardando y autorizando la transferencia.</p>
            </>
          )}
          {status.type === 'success' && (
            <>
              <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
                <CheckCircle size={48} />
              </div>
              <h4 className="fw-bold text-success">¡Éxito!</h4>
              <p className="text-muted mb-4">{status.message}</p>
              <button onClick={onClose} className="btn btn-success w-100 rounded-pill py-2 fw-bold shadow-sm">Continuar</button>
            </>
          )}
          {status.type === 'error' && (
            <>
              <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
                <X size={48} />
              </div>
              <h4 className="fw-bold text-danger">Algo salió mal</h4>
              <p className="text-muted mb-4">{status.message}</p>
              <button onClick={onClose} className="btn btn-danger w-100 rounded-pill py-2 fw-bold shadow-sm">Cerrar</button>
            </>
          )}
        </div>
      </div>
    );
  };

  const fetchNominaTickets = async (empleadoId) => {
    try {
      const res = await fetch(`${NOMINA_LISTAR_TICKETS_URL}?empleado_id=${empleadoId}`);
      const result = await res.json();
      if (result.status === 'success') {
        setNominaTickets(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const fetchTransferHistory = async (empleadoId = null, fechaInicio = null, fechaFin = null) => {
    try {
      let url = NOMINA_LISTAR_TRANSFERENCIAS_URL;
      const params = new URLSearchParams();

      if (empleadoId) params.append('empleado_id', empleadoId);
      if (fechaInicio) params.append('fecha_inicio', fechaInicio);
      if (fechaFin) params.append('fecha_fin', fechaFin);

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const res = await fetch(url);
      const result = await res.json();
      if (result.status === 'success') {
        setTransferHistory(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching transfer history:", error);
    }
  };

  const handleSaveTicket = async (ticketData) => {
    try {
      const res = await fetch(NOMINA_GUARDAR_TICKET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empleado_id: ticketData.empleadoId,
          periodo: ticketData.periodo,
          ingresos_brutos: ticketData.ingresosBrutos,
          gastos_chofer: ticketData.gastosChofer,
          gastos_mantenimiento: ticketData.gastosMantenimiento,
          gastos_taller: ticketData.gastosTaller,
          depositos: ticketData.depositos,
          utilidad_total: ticketData.utilidadTotal,
          bonos_extras: ticketData.bonosExtras,
          propinas: ticketData.propinas,
          total_pago: ticketData.totalPago,
          recibo_id: ticketData.reciboId,
          firma_admin: ticketData.firma_admin || null
        })
      });
      const result = await res.json();
      if (result.status === 'success') {
        await fetchNominaTickets(ticketData.empleadoId);
        return true;
      } else {
          alert("Error al guardar ticket: " + (result.message || "Desconocido"));
          return false;
      }
    } catch (error) {
      console.error("Error saving ticket:", error);
    }
  };

  // Helper para formatear monedas
  const f = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);

// Eliminadas funciones locales de fecha ya que se usan desde utils/dateUtils.js

  const getRangoFechas = () => {
    const range = getOperationalDateRange(fechaReferencia, modo);
    return {
      inicio: formatDateForApi(range.start),
      fin: formatDateForApi(range.end),
      rawStart: range.start,
      rawEnd: range.end
    };
  };

  useEffect(() => {
    fetchData();
  }, [modo, fechaReferencia]);

  useEffect(() => {
    if (activeMainTab === 'transferencias') {
      const { inicio, fin } = getRangoFechas();
      const empId = selectedTransferEmp ? (selectedTransferEmp.empleado_id || selectedTransferEmp.vehiculo_asignado) : null;
      fetchTransferHistory(empId, inicio, fin);
    }
  }, [activeMainTab, selectedTransferEmp, modo, fechaReferencia]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { inicio, fin } = getRangoFechas();
      const mapModoApi = { 'day': 'dia', 'week': 'semana', 'month': 'mes', 'year': 'anio', 'dia': 'dia', 'semana': 'semana', 'mes': 'mes', 'anio': 'anio' };
      const urlModo = mapModoApi[modo] || 'semana';
      const url = `${BALANCE_AVANZADO_URL}?periodo=${urlModo}&fecha_inicio=${inicio}&fecha_fin=${fin}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const result = await res.json();
      if (result.status === 'success') {
        setData(result);

        // Fetch global transfers for the same period to show in General
        const transRes = await fetch(`${NOMINA_LISTAR_TRANSFERENCIAS_URL}?fecha_inicio=${inicio}&fecha_fin=${fin}`);
        const transData = await transRes.json();
        if (transData.status === 'success') {
          const total = (transData.data || []).reduce((acc, t) => acc + (parseFloat(t.monto) || 0), 0);
          setGlobalTransferTotal(total);
          // Si estamos en la pestaña de transferencias y no hay empleado seleccionado, actualizamos el historial global filtrado
          if (activeMainTab === 'transferencias' && !selectedTransferEmp) {
            setTransferHistory(transData.data || []);
          }
        }
      } else {
        setData(null);
      }
    } catch (error) {
      console.error("Error fetching financials:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data && selectedEmpleado) {
      const updatedEmp = data.empleados.find(e =>
        (e.empleado_id && e.empleado_id === selectedEmpleado.empleado_id) ||
        (!e.empleado_id && e.vehiculo_asignado === selectedEmpleado.vehiculo_asignado)
      );
      if (updatedEmp) setSelectedEmpleado(updatedEmp);
      else setSelectedEmpleado(null);
    }
  }, [data]);

  // PERSISTENCIA DE COMISIÓN DE NÓMINA
  useEffect(() => {
    if (selectedEmpleado) {
      const id = selectedEmpleado.empleado_id || selectedEmpleado.vehiculo_asignado;
      const savedComision = localStorage.getItem(`comision_nomina_${id}`);
      if (savedComision !== null) {
        setComisionNomina(Number(savedComision));
      } else {
        setComisionNomina(20); // Default
      }
      fetchNominaTickets(id);
    }
  }, [selectedEmpleado]);

  const handleSaveComision = () => {
    if (selectedEmpleado) {
      localStorage.setItem(`comision_nomina_${selectedEmpleado.empleado_id || selectedEmpleado.vehiculo_asignado}`, comisionNomina);
      setShowConfigSuccess(true);
      setTimeout(() => setShowConfigSuccess(false), 3000);
    }
  };

  const handlePrev = () => {
    const d = new Date(fechaReferencia);
    if (modo === 'day' || modo === 'dia') d.setDate(d.getDate() - 1);
    if (modo === 'week' || modo === 'semana') d.setDate(d.getDate() - 7);
    if (modo === 'month' || modo === 'mes') d.setMonth(d.getMonth() - 1);
    if (modo === 'year' || modo === 'anio') d.setFullYear(d.getFullYear() - 1);
    setFechaReferencia(d);
  };

  const handleNext = () => {
    const d = new Date(fechaReferencia);
    if (modo === 'day' || modo === 'dia') d.setDate(d.getDate() + 1);
    if (modo === 'week' || modo === 'semana') d.setDate(d.getDate() + 7);
    if (modo === 'month' || modo === 'mes') d.setMonth(d.getMonth() + 1);
    if (modo === 'year' || modo === 'anio') d.setFullYear(d.getFullYear() + 1);
    setFechaReferencia(d);
  };

  const handleExportExcel = () => {
    if (!data) return;

    const reportData = (data.empleados || [])
      .filter(e => !['monitorista', 'taller'].includes((e.empleado_rol || '').toLowerCase()))
      .map(emp => {
      const savedCom = localStorage.getItem(`comision_nomina_${emp.empleado_id || emp.vehiculo_asignado}`);
      const comision = savedCom !== null ? Number(savedCom) : 20;
      const baseComision = Math.max(0, Number(emp.utilidad_real));
      const nominaAmount = (baseComision * comision) / 100;

      // Sumar gastos fijos detallados para el reporte
      const gastosFijos = (emp.detalles_costos_operativos || []).reduce((acc, c) => {
        acc[c.tipo] = (acc[c.tipo] || 0) + (Number(c.costo_total) || 0);
        return acc;
      }, {});

      const utilidadNeta = Number(emp.utilidad_real) - nominaAmount;

      return {
        'Empleado/Unidad': emp.empleado_nombre || emp.vehiculo_asignado || 'N/A',
        'Rol': emp.empleado_rol || 'N/A',
        'Unidad': emp.vehiculo_asignado || 'N/A',
        'Viajes': emp.total_viajes || 0,
        'Ingresos (Caja)': Number(emp.total_ingresos) || 0,
        'Propinas (Extras)': Number(emp.total_propinas) || 0,
        'Gastos Operativos (Chofer)': Number(emp.gastos_operativos_chofer) || 0,
        'Gastos Mantenimiento': Number(emp.costo_mantenimiento_vehiculo) || 0,
        ...gastosFijos, // Desglose de gastos fijos (Seguro, GPS, etc)
        'Nómina (Comisión)': nominaAmount,
        'Utilidad Neta Real': utilidadNeta,
        'Balance': utilidadNeta >= 0 ? '➕ POSITIVO' : '➖ NEGATIVO'
      };
    });

    // Totales Globales
    const totalNominaGlobal = (data.empleados || [])
      .filter(e => !['monitorista', 'taller'].includes((e.empleado_rol || '').toLowerCase()))
      .reduce((sum, emp) => {
        const savedCom = localStorage.getItem(`comision_nomina_${emp.empleado_id || emp.vehiculo_asignado}`);
        const comision = savedCom !== null ? Number(savedCom) : 20;
        const baseComision = Math.max(0, Number(emp.utilidad_real));
        return sum + ((baseComision * comision) / 100);
      }, 0);

    const netProfitGlobal = data.global.utilidad_neta_total - totalNominaGlobal;

    const summaryData = [
      {}, // Línea en blanco
      {
        'Empleado/Unidad': 'TOTALES GENERALES',
        'Ingresos (Caja)': data.global.ingresos_brutos,
        'Propinas (Extras)': data.global.total_propinas || 0,
        'Transferencias (Depósitos)': globalTransferTotal,
        'Gastos Operativos (Chofer)': data.global.gastos_operativos_chofer,
        'Gastos Mantenimiento': data.global.gastos_mantenimiento_flota,
        'Gastos Fijos Flota': data.global.gastos_fijos_flota || 0,
        'Nómina (Comisión)': totalNominaGlobal,
        'Utilidad Neta Real': netProfitGlobal + globalTransferTotal,
        'Balance': (netProfitGlobal + globalTransferTotal) >= 0 ? '✅ RENTABLE' : '⚠️ PÉRDIDA'
      }
    ];

    const finalData = [...reportData, ...summaryData];
    const ws = XLSX.utils.json_to_sheet(finalData);

    // Ajustar anchos de columna (opcional pero ayuda)
    const wscols = [
      { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 15 },
      { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
      { wch: 20 }, { wch: 20 }
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Balance Financiero");

    // Formatear nombre del archivo
    const fileName = `Balance_${modo.toUpperCase()}_${fechaReferencia}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const TextoRango = () => {
    const { rawStart, rawEnd } = getRangoFechas();
    const options = { day: 'numeric', month: 'short' };
    if (modo === 'dia') return <span className="fw-bold text-white small">{rawStart.toLocaleDateString('es-MX', options)}</span>;
    if (modo === 'anio') return <span className="fw-bold text-white small">{rawStart.getFullYear()}</span>;
    
    const labelStart = new Date(rawStart);
    const labelEnd = new Date(rawEnd);
    
    return <span className="fw-bold text-white small">{labelStart.toLocaleDateString('es-MX', options)} - {labelEnd.toLocaleDateString('es-MX', options)}</span>;
  };

  // --- SUB-COMPONENTES INTERNOS ---

  const StatCard = ({ title, value, subvalue, icon: Icon, color }) => (
    <div className="col-12 col-md-6 col-lg-4 col-xl">
      <div className="card border-0 shadow-sm h-100 overflow-hidden position-relative hover-lift glass-card"
        style={{ borderRadius: '24px', transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)' }}>
        <div className="card-body p-4 position-relative d-flex flex-column justify-content-center" style={{ zIndex: 1, minHeight: '140px' }}>
            <div className="d-flex align-items-center gap-4">
              <div className="p-3 rounded-4 shadow-sm icon-container d-flex align-items-center justify-content-center"
                   style={{ backgroundColor: `${color}15`, color: color, minWidth: '64px', height: '64px' }}>
                <Icon size={32} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-muted text-uppercase fw-bold letter-spacing-1 d-block" style={{ fontSize: '13px', opacity: 0.8, marginBottom: '4px' }}>{title}</span>
                <h3 className="fw-extrabold mb-0" style={{ fontSize: '2rem', color: '#1e293b', letterSpacing: '-0.5px', lineHeight: '1.1' }}>{value}</h3>
              </div>
            </div>
            {subvalue && <div className="mt-3 pt-3 border-top border-light opacity-75">
                <p className="text-muted fw-medium mb-0" style={{ fontSize: '13px' }}>{subvalue}</p>
            </div>}
        </div>
        <div className="position-absolute" style={{ right: '-15px', bottom: '-15px', opacity: 0.06, color: color, transform: 'rotate(-15deg)' }}>
          <Icon size={120} />
        </div>
      </div>
    </div>
  );

  const TabGeneral = ({ data }) => {
    const filteredEmployees = (data.empleados || [])
      .filter(e => !['monitorista', 'taller'].includes((e.empleado_rol || '').toLowerCase()));

    const dataRendimiento = filteredEmployees
      .filter(e => e.empleado_id && Number(e.total_ingresos) > 0) // Solo usuarios asignados y con ingresos
      .slice(0, 10)
      .map(e => {
        return {
          name: e.empleado_nombre || e.vehiculo_asignado,
          utilidad: e.utilidad_real,
          ingresos: e.total_ingresos,
          gastos: Number(e.gastos_operativos_chofer) || 0, // Incluye TODO lo capturado por el chofer (Gasolina, Peajes, etc)
          costos: e.costo_mantenimiento_vehiculo || 0, // Mantenimiento + Fijos (Backend ya excluye gas anual)
          propinas: e.total_propinas || 0
        };
      });

    // 1. Filtrar solo vehículos/empleados que han tenido actividad (viajes > 0 O gastos > 0)
    const activeItems = (data.empleados || []).filter(e => 
      ((Number(e.total_viajes) > 0) || (Number(e.gastos_operativos_chofer) > 0)) && 
      !['monitorista', 'taller'].includes((e.empleado_rol || '').toLowerCase())
    );

    // 2. Calcular costos operativos (Chofer) de estos vehículos activos, excluyendo combustible
    const keywords = ['gasolina', 'combustible', 'diesel', 'magna', 'premium'];
    
    let totalGastosOpActivos = 0;
    let totalCombustibleActivos = 0;
    let totalMttoYFijosActivos = 0;

    activeItems.forEach(emp => {
      // Sumar Mantenimiento + Fijos del backend (ya vienen sin gasolina fija)
      totalMttoYFijosActivos += (Number(emp.costo_mantenimiento_vehiculo) || 0);

      // Sumar Gastos Operativos del Chofer
      const gastosOp = Number(emp.gastos_operativos_chofer) || 0;
      totalGastosOpActivos += gastosOp;

      // Calcular cuánto de esos gastos operativos fue combustible
      const combustibleEmp = (emp.detalles_ingresos || []).reduce((sum, liq) => {
        try {
          let detalles = [];
          try {
            detalles = JSON.parse(liq.detalles_gastos || '[]');
            if (typeof detalles === 'string') detalles = JSON.parse(detalles);
          } catch(e) { detalles = []; }

          const gastoCombustible = Array.isArray(detalles) 
            ? detalles.reduce((s, g) => {
                const tipo = (g.tipo || '').toLowerCase();
                return keywords.some(k => tipo.includes(k)) ? s + (Number(g.monto) || 0) : s;
              }, 0)
            : 0;
          return sum + gastoCombustible;
        } catch (e) { return sum; }
      }, 0);
      
      totalCombustibleActivos += combustibleEmp;
    });

    // Costo Operativo Neto (sin gasolina) para activos
    const gastosOpNetosActivos = Math.max(0, totalGastosOpActivos - totalCombustibleActivos);

    // 3. Total Flota Ajustado (Mantenimiento + Fijos de autos activos)
    const costoTotalFlotaAjustado = totalMttoYFijosActivos;

    // 4. Utilidad Neta Calculada (Ingresos + Depositos - Gastos Operativos - Costos Flota)
    const utilidadNetaCalculada = data.global.ingresos_brutos + globalTransferTotal - data.global.gastos_operativos_chofer - costoTotalFlotaAjustado;

    // 4b. Data de Combustible Detallado (Para la nueva gráfica)
    const dataCombustible = filteredEmployees
      .filter(e => e.empleado_id && Number(e.total_ingresos) > 0) // Solo usuarios con actividad
      .map(emp => {
          const fuel = (emp.detalles_ingresos || []).reduce((sum, liq) => {
            try {
              let detalles = [];
              try {
                detalles = JSON.parse(liq.detalles_gastos || '[]');
                if (typeof detalles === 'string') detalles = JSON.parse(detalles);
              } catch(e) { detalles = []; }
              return sum + (Array.isArray(detalles) 
                ? detalles.reduce((s, g) => {
                    const tipo = (g.tipo || '').toLowerCase();
                    return keywords.some(k => tipo.includes(k)) ? s + (Number(g.monto) || 0) : s;
                  }, 0)
                : 0);
            } catch (e) { return sum; }
          }, 0);
          return {
            name: emp.empleado_nombre || emp.vehiculo_asignado,
            combustible: fuel,
            ingresos: Number(emp.total_ingresos) || 0
          };
      })
      .sort((a, b) => b.combustible - a.combustible)
      .slice(0, 10);

    // 5. Data para la Gráfica de Distribución (Sincronizada con las tarjetas)
    const dataGlobalBalance = [
      { name: 'Ingresos (Caja)', value: Number(data.global.ingresos_brutos) || 0, color: '#10b981' },
      { name: 'Depósitos', value: Number(globalTransferTotal) || 0, color: '#0f172a' },
      { name: 'Propinas', value: Number(data.global.total_propinas) || 0, color: '#f59e0b' },
      { name: 'Gastos Op.', value: Number(data.global.gastos_operativos_chofer) || 0, color: '#ef4444' },
      { name: 'Costos Flota', value: Number(costoTotalFlotaAjustado) || 0, color: '#8b5cf6' },
      { name: 'Utilidad Neta', value: Number(utilidadNetaCalculada) || 0, color: '#3b82f6' }
    ];

    // 4b. Data para Matriz de Eficiencia (Gasolina vs Ingreso) - RANKING
    const dataMatriz = filteredEmployees
      .filter(e => (Number(e.total_ingresos) > 0 || Number(e.gastos_operativos_chofer) > 0)) // Filtro más inclusivo
      .map(emp => {
        const ingresosCaja = Number(emp.total_ingresos) || 0;
        const propinas = Number(emp.total_propinas) || 0;
        const depositos = Number(emp.total_depositos) || 0;
        const ingresosTotales = ingresosCaja + propinas + depositos;
        
        // Calcular combustible específico
        const fuel = (emp.detalles_ingresos || []).reduce((sum, liq) => {
          try {
            let detalles = [];
            try {
              detalles = JSON.parse(liq.detalles_gastos || '[]');
              if (typeof detalles === 'string') detalles = JSON.parse(detalles);
            } catch(e) { detalles = []; }
            return sum + (Array.isArray(detalles) 
              ? detalles.reduce((s, g) => {
                  const tipo = (g.tipo || '').toLowerCase();
                  return keywords.some(k => tipo.includes(k)) ? s + (Number(g.monto) || 0) : s;
                }, 0)
              : 0);
          } catch (e) { return sum; }
        }, 0);

        const ratio = fuel > 0 ? (ingresosTotales / fuel) : 0;
        
        return {
          name: (emp.empleado_nombre || emp.vehiculo_asignado || 'S/N').split(' ')[0], // Nombre corto para eje X
          fullName: emp.empleado_nombre || emp.vehiculo_asignado || 'Unidad Desconocida',
          gasolina: fuel,
          ingresos: ingresosTotales,
          ratio: parseFloat(ratio.toFixed(2)),
          // Color basado en el factor de retorno
          color: ratio >= 7 ? '#10b981' : (ratio <= 3 ? '#ef4444' : '#f59e0b')
        };
      })
      .filter(d => d.ingresos > 0 || d.gasolina > 0) // Asegurar que hay actividad
      .sort((a, b) => b.ratio - a.ratio); // ORDENAR POR EFICIENCIA



    const dataYield = filteredEmployees
      .filter(e => e.empleado_id && Number(e.total_ingresos) > 0) // Solo usuarios asignados y con ingresos
      .slice()
      .sort((a, b) => (b.rendimiento_km || 0) - (a.rendimiento_km || 0))
      .slice(0, 10)
      .map(e => ({
        name: e.empleado_nombre || e.vehiculo_asignado,
        rendimiento: Number(e.rendimiento_km) || 0,
        distancia: Number(e.distancia_recorrida_km) || 0
      }));

    const CustomTooltipMatriz = ({ active, payload }) => {
      if (active && payload && payload.length) {
        const d = payload[0].payload;
        return (
          <div className="bg-white p-3 border-0 shadow-lg rounded-4" style={{ minWidth: '240px' }}>
            <p className="fw-bold mb-2 border-bottom pb-2" style={{ color: '#0f172a', fontSize: '0.95rem' }}>{d.fullName}</p>
            
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted small">Ingresos Totales:</span>
              <span className="fw-bold small text-success">{f(d.ingresos)}</span>
            </div>

            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted small">Gasto Combustible:</span>
              <span className="fw-bold small text-danger">{f(d.gasolina)}</span>
            </div>
            
            <div className="bg-light p-2 rounded-3 d-flex justify-content-between align-items-center mt-2 border-start border-3 border-primary">
              <div className="d-flex align-items-center gap-1">
                <Zap size={14} className="text-primary" />
                <span className="text-muted small fw-bold">Factor de Retorno:</span>
              </div>
              <span className="fw-bold text-primary" style={{ fontSize: '0.9rem' }}>
                ${d.ratio.toFixed(2)} por cada $1 de gas
              </span>
            </div>
            <p className="small text-muted mt-2 mb-0" style={{fontSize: '10px'}}>
               *A mayor factor, más rentable es la unidad.
            </p>
          </div>
        );
      }
      return null;
    };


    return (
      <div className="animate__animated animate__fadeIn">
        <div className="row g-4 mb-5">
            <StatCard title="Ingresos (Caja)" value={f(data.global.ingresos_brutos)} icon={TrendingUp} color="#10b981" />
            <StatCard title="Propinas Totales" value={f(data.global.total_propinas || 0)} subvalue="Extras del personal" icon={Star} color="#f59e0b" />
            <StatCard title="Total Depósitos" value={f(globalTransferTotal)} subvalue="Transferencias recibidas" icon={CreditCard} color="#0f172a" />
            
            {/* Gastos Operativos (Chofer) */}
            <StatCard 
              title="Gastos Operativos" 
              value={f(data.global.gastos_operativos_chofer)} 
              subvalue="Combustible y peajes" 
              icon={TrendingDown} 
              color="#ef4444" 
            />
            
            {/* Costos Totales Flota (Solo Mtto + Fijos de Activos) */}
            <StatCard 
              title="Costos Totales Flota" 
              value={f(costoTotalFlotaAjustado)} 
              subvalue="Solo autos con viajes (Sin Gas)" 
              icon={Car} 
              color="#8b5cf6" 
            />
            
            {/* Utilidad Neta Real Ajustada visualmente */}
            <StatCard title="Utilidad Neta" value={f(utilidadNetaCalculada)} subvalue="Balance General" icon={DollarSign} color={utilidadNetaCalculada >= 0 ? "#3b82f6" : "#ef4444"} />
        </div>

        <div className="row g-4">
          <div className="col-12 col-xl-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h6 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
                <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary"><TrendingUp size={22}/></div>
                Top 10 Rendimiento Financiero
              </h6>
              <div style={{ width: '100%', height: 450, minHeight: 450, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataRendimiento}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" height={60} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <ReTooltip
                       cursor={{ fill: '#f8fafc' }}
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                       formatter={(value) => f(value)}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }}/>
                    <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
                    <Bar dataKey="utilidad" name="Utilidad" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} />
                    <Bar dataKey="gastos" name="Gastos Op." fill="#ef4444" radius={[4, 4, 0, 0]} barSize={16} />
                    <Bar dataKey="costos" name="Costos Flota" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={16} />
                    <Bar dataKey="propinas" name="Propinas" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-12 col-xl-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h6 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
                <div className="p-2 rounded-3 bg-indigo-100 text-indigo-600" style={{backgroundColor: '#e0e7ff', color: '#4f46e5'}}><DollarSign size={22}/></div>
                Balance General (Métricas Globales)
              </h6>
              <div style={{ width: '100%', height: 450, minHeight: 450, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart title="Balance General">
                    <Pie 
                      data={dataGlobalBalance} 
                      innerRadius={100} 
                      outerRadius={150} 
                      paddingAngle={5} 
                      dataKey="value"
                      nameKey="name"
                    >
                      {dataGlobalBalance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ReTooltip formatter={(value) => f(value)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mt-1">
           <div className="col-12">
             <div className="card border-0 shadow-sm rounded-4 p-4">                <h6 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
                   <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary"><Zap size={22}/></div>
                   Ranking de Eficiencia: Retorno por cada $1 de Gasolina
                </h6>
                <div style={{ width: '100%', height: 450, minHeight: 450, minWidth: 0 }}>
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dataMatriz} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                         <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 11, fill: '#64748b' }} 
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                         />
                         <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            label={{ value: 'Pesos generados por $1 gas', angle: -90, position: 'insideLeft', fontSize: 12, offset: 0 }}
                         />
                         <ReTooltip content={<CustomTooltipMatriz />} cursor={{ fill: '#f8fafc' }} />
                         
                         <Bar dataKey="ratio" name="Factor de Retorno" radius={[4, 4, 0, 0]} barSize={35}>
                            {dataMatriz.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                         </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                </div>

                <div className="mt-4 p-3 bg-light rounded-4 d-flex flex-wrap gap-4 justify-content-center border">
                   <div className="small fw-bold text-muted text-uppercase mb-2 w-100 text-center" style={{letterSpacing: '1px'}}>Guía de Lectura Rápida</div>
                   <div className="d-flex align-items-center gap-2 small text-muted">
                      <div className="p-1 px-2 rounded bg-success text-white fw-bold" style={{fontSize: '10px'}}>ALTA EFICIENCIA</div>
                      <span>Puntos verdes (Ingreso alto con poco gasto)</span>
                   </div>
                   <div className="d-flex align-items-center gap-2 small text-muted">
                      <div className="p-1 px-2 rounded bg-warning text-white fw-bold" style={{fontSize: '10px'}}>PROMEDIO</div>
                      <span>Puntos amarillos (Balance equilibrado)</span>
                   </div>
                   <div className="d-flex align-items-center gap-2 small text-muted">
                      <div className="p-1 px-2 rounded bg-danger text-white fw-bold" style={{fontSize: '10px'}}>REVISAR</div>
                      <span>Puntos rojos (Bajo retorno por gasolina)</span>
                   </div>
                </div>
             </div>
           </div>
         </div>
       </div>
    );
  };


  const TabAutos = ({ data }) => {
    const unidades = (data.empleados || [])
      .filter(e => !['monitorista', 'taller'].includes((e.empleado_rol || '').toLowerCase()))
      .reduce((acc, current) => {
      const existing = acc.find(v => v.unidad === current.vehiculo_asignado);
      if (existing) {
        existing.mantenimiento += current.costo_mantenimiento_vehiculo;
        existing.costos_operativos += (current.detalles_costos_operativos || []).reduce((sum, c) => sum + (parseFloat(c.costo_total) || 0), 0);
        existing.reparaciones_taller += (current.detalles_mantenimiento || []).reduce((sum, m) => sum + (parseFloat(m.costo_total) || 0), 0);
      } else if (current.vehiculo_asignado) {
        acc.push({
          unidad: current.vehiculo_asignado,
          mantenimiento: current.costo_mantenimiento_vehiculo,
          costos_operativos: (current.detalles_costos_operativos || []).reduce((sum, c) => sum + (parseFloat(c.costo_total) || 0), 0),
          reparaciones_taller: (current.detalles_mantenimiento || []).reduce((sum, m) => sum + (parseFloat(m.costo_total) || 0), 0)
        });
      }
      return acc;
    }, []);

    const [selectedUnidad, setSelectedUnidad] = useState(null);
    const [activeUnidadTab, setActiveUnidadTab] = useState('costos_fijos');
    const [expandedUnidadMantId, setExpandedUnidadMantId] = useState(null);

    const unidadData = selectedUnidad ? data.empleados
      .filter(e => !['monitorista', 'taller'].includes((e.empleado_rol || '').toLowerCase()))
      .filter(e => e.vehiculo_asignado?.trim() === selectedUnidad.unidad?.trim()) : [];
    
    // Aggregated data for the unit across all employees that drove it
    const totalIngresosUnidad = unidadData.reduce((sum, e) => sum + (Number(e.total_ingresos) || 0), 0);
    const totalGastosChoferUnidad = unidadData.reduce((sum, e) => sum + (e.detalles_ingresos || []).reduce((s, liq) => s + (Number(liq.gastos_total) || 0), 0), 0);
    const totalMttoUnidad = unidadData.reduce((sum, e) => sum + (e.detalles_mantenimiento || []).reduce((s, m) => s + (Number(m.costo_total) || 0), 0), 0);
    const totalFijosUnidad = unidadData.reduce((sum, e) => {
      const fuelKeywords = ['gasolina', 'combustible', 'diesel', 'magna', 'premium'];
      const validos = (e.detalles_costos_operativos || []).filter(c => {
          const tipo = (c.tipo || '').toLowerCase();
          return !fuelKeywords.some(k => tipo.includes(k));
      });
      return sum + validos.reduce((s, c) => s + (Number(c.costo_total) || 0), 0);
    }, 0);
    const utilidadUnidad = totalIngresosUnidad - totalGastosChoferUnidad - totalMttoUnidad - totalFijosUnidad;

    return (
      <div className="row g-4 animate__animated animate__fadeIn h-100">
        <div className="col-12 col-lg-3 h-100">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <div className="p-2 rounded-3 bg-light text-primary"><Car size={20}/></div>
              Control de Unidades
            </h5>
            <div className="table-responsive flex-grow-1 overflow-auto custom-scrollbar pe-1">
              <table className="table table-hover align-middle">
                <tbody>
                  {unidades.map((u, i) => (
                    <tr key={i} className={`cursor-pointer transition-all ${selectedUnidad?.unidad === u.unidad ? 'bg-primary bg-opacity-10' : ''}`} onClick={() => setSelectedUnidad(u)}>
                      <td className="fw-extrabold py-4" style={{fontSize: '15px'}}>
                        <div className="d-flex align-items-center gap-3">
                          <div className={`p-3 rounded-2 ${selectedUnidad?.unidad === u.unidad ? 'bg-primary text-white' : 'bg-light text-secondary'}`}>
                            <Car size={18}/>
                          </div>
                          {u.unidad}
                        </div>
                      </td>
                      <td className="text-end">
                        <ChevronRight size={18} className="text-muted opacity-50"/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-9 animate__animated animate__fadeInRight h-100">
          {selectedUnidad ? (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 d-flex flex-column bg-white">
                <div className="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center flex-shrink-0">
                    <div className="d-flex align-items-center gap-3">
                        <div className="p-3 rounded-4 bg-dark text-white shadow-sm">
                            <Car size={24} strokeWidth={2}/>
                        </div>
                        <div>
                            <h4 className="text-dark fw-extrabold mb-1">{selectedUnidad.unidad}</h4>
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-1" style={{fontSize: '10px'}}>UNIDAD ACTIVA</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setSelectedUnidad(null)} className="btn btn-light rounded-circle p-2 shadow-sm border">
                        <X size={20} />
                    </button>
                </div>

                <div className="card-body p-4 pt-4 overflow-auto custom-scrollbar flex-grow-1">
                    <div className="row g-3 mb-4">
                        <div className="col-4">
                            <div className="p-3 rounded-4 bg-success bg-opacity-10 border border-success border-opacity-10 text-center h-100 d-flex flex-column justify-content-center">
                                <span className="d-block text-success small fw-bold text-uppercase mb-1" style={{fontSize:'11px', letterSpacing: '0.5px'}}>Ingresos Generados</span>
                                <h6 className="fw-extrabold text-success mb-0" style={{fontSize: '18px'}}>{f(totalIngresosUnidad)}</h6>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="p-3 rounded-4 bg-warning bg-opacity-10 border border-warning border-opacity-10 text-center h-100 d-flex flex-column justify-content-center">
                                <span className="d-block text-warning small fw-bold text-uppercase mb-1" style={{fontSize:'11px', letterSpacing: '0.5px'}}>Costos Fijos</span>
                                <h6 className="fw-extrabold text-warning mb-0" style={{fontSize: '18px'}}>{f(totalFijosUnidad)}</h6>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="p-3 rounded-4 bg-info bg-opacity-10 border border-info border-opacity-10 text-center h-100 d-flex flex-column justify-content-center">
                                <span className="d-block text-info small fw-bold text-uppercase mb-1" style={{fontSize:'11px', letterSpacing: '0.5px'}}>Costos Taller</span>
                                <h6 className="fw-extrabold text-info mb-0" style={{fontSize: '18px'}}>{f(totalMttoUnidad)}</h6>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex border-bottom mb-3 flex-wrap gap-2">
                        <button 
                            className={`btn btn-sm pb-2 px-3 fw-bold ${activeUnidadTab === 'costos_fijos' ? 'text-primary border-bottom border-primary border-2' : 'text-secondary opacity-50'}`}
                            onClick={() => setActiveUnidadTab('costos_fijos')}
                        >Costos Fijos</button>
                        <button 
                            className={`btn btn-sm pb-2 px-3 fw-bold ${activeUnidadTab === 'taller' ? 'text-primary border-bottom border-primary border-2' : 'text-secondary opacity-50'}`}
                            onClick={() => setActiveUnidadTab('taller')}
                        >Taller</button>
                        <button 
                            className={`btn btn-sm pb-2 px-3 fw-bold ${activeUnidadTab === 'choferes' ? 'text-primary border-bottom border-primary border-2' : 'text-secondary opacity-50'}`}
                            onClick={() => setActiveUnidadTab('choferes')}
                        >Choferes en Periodo</button>
                    </div>

                    {activeUnidadTab === 'costos_fijos' && (
                        <div className="animate__animated animate__fadeIn">
                             <h6 className="fw-bold text-muted small text-uppercase mb-3 d-flex align-items-center gap-2" style={{fontSize: '11px', letterSpacing: '0.5px'}}>
                                <TrendingDown size={16} className="text-warning"/> Costos Operativos Fijos (Prorrateados)
                             </h6>
                             <div className="row g-3">
                                {(() => {
                                    const fuelKeywords = ['gasolina', 'combustible', 'diesel', 'magna', 'premium'];
                                    const filteredItems = unidadData.flatMap(e => e.detalles_costos_operativos || [])
                                        .filter(c => !fuelKeywords.some(k => (c.tipo || '').toLowerCase().includes(k)));

                                    return filteredItems.length > 0 ? (
                                        filteredItems.map((c, i) => (
                                            <div key={`c-${i}`} className="col-12 col-md-6 col-xxl-4">
                                                <div className="p-4 bg-white border rounded-4 d-flex justify-content-between align-items-center transition-all hover-lift shadow-sm">
                                                    <div>
                                                        <span className="d-block fw-extrabold text-dark mb-1" style={{fontSize: '14px'}}>{c.tipo}</span>
                                                        <small className="text-muted text-uppercase fw-bold" style={{fontSize: '10px', letterSpacing: '0.5px'}}>{modo.toUpperCase()}</small>
                                                    </div>
                                                    <span className="text-warning fw-extrabold" style={{fontSize: '18px'}}>-{f(c.costo_total)}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-12">
                                            <div className="text-center py-5 text-muted small border rounded-4 border-dashed bg-light">
                                                Sin costos fijos registrados para este periodo.
                                            </div>
                                        </div>
                                    );
                                })()}
                             </div>
                        </div>
                    )}

                    {activeUnidadTab === 'taller' && (
                        <div className="animate__animated animate__fadeIn">
                            <h6 className="fw-bold text-muted small text-uppercase mb-3 d-flex align-items-center gap-2" style={{fontSize: '11px', letterSpacing: '0.5px'}}>
                                <Wrench size={16} className="text-primary"/> Taller y Reparaciones
                            </h6>
                            <div className="row g-3">
                                {unidadData.flatMap(e => e.detalles_mantenimiento || []).length > 0 ? (
                                    unidadData.flatMap(e => e.detalles_mantenimiento || []).map((m, i) => {
                                        const isExpanded = expandedUnidadMantId === m.id;
                                        return (
                                            <div key={`m-${i}`} className="col-12">
                                                <div className={`border rounded-4 overflow-hidden transition-all ${isExpanded ? 'shadow-md border-primary' : 'hover-bg-light shadow-sm'}`}>
                                                    <div 
                                                        className={`p-4 cursor-pointer d-flex justify-content-between align-items-center ${isExpanded ? 'bg-primary bg-opacity-10' : 'bg-white'}`}
                                                        onClick={() => setExpandedUnidadMantId(isExpanded ? null : m.id)}
                                                    >
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div className={`rounded-circle d-flex align-items-center justify-content-center ${isExpanded ? 'bg-primary text-white shadow' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{width: 40, height: 40}}>
                                                                {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                                            </div>
                                                            <div>
                                                                <span className="d-block fw-bold text-dark" style={{fontSize: '15px'}}>{m.tipo}</span>
                                                                <small className="text-muted" style={{fontSize: '11px'}}>{m.fecha}</small>
                                                            </div>
                                                        </div>
                                                        <span className="text-danger fw-extrabold h5 mb-0">-{f(m.costo_total)}</span>
                                                    </div>
                                                    
                                                    {isExpanded && (
                                                        <div className="p-4 bg-light border-top animate__animated animate__fadeIn">
                                                            <div className="bg-white p-4 rounded-3 shadow-sm mb-3">
                                                                <h6 className="fw-bold text-dark mb-2 small text-uppercase">Descripción del Servicio</h6>
                                                                <p className="text-muted mb-0" style={{fontSize: '14px', lineHeight: '1.6'}}>{m.descripcion || 'Sin descripción detallada.'}</p>
                                                            </div>
                                                            <div className="row g-3">
                                                                <div className="col-12 col-md-6">
                                                                    <div className="p-3 bg-white rounded-3 border text-center h-100">
                                                                        <span className="d-block text-muted mb-2 small fw-bold text-uppercase">Evidencia Fotográfica</span>
                                                                        {m.evidencia_foto ? (
                                                                            <img 
                                                                                src={`${UPLOADS_URL}${m.evidencia_foto}`} 
                                                                                className="img-fluid rounded shadow-sm hover-opacity-75 cursor-pointer transition-all" 
                                                                                style={{maxHeight: '120px', objectFit: 'cover'}} 
                                                                                onClick={(e) => { e.stopPropagation(); window.open(`${UPLOADS_URL}${m.evidencia_foto}`, '_blank'); }} 
                                                                                alt="Evidencia"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-muted small fst-italic">No adjunta</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="col-12 col-md-6">
                                                                    <div className="p-3 bg-white rounded-3 border text-center h-100">
                                                                        <span className="d-block text-muted mb-2 small fw-bold text-uppercase">Firma de Conformidad</span>
                                                                        {m.firma_empleado ? (
                                                                            <img 
                                                                                src={`${UPLOADS_URL}${m.firma_empleado}`} 
                                                                                className="img-fluid" 
                                                                                style={{maxHeight: '80px', mixBlendMode: 'multiply'}} 
                                                                                onClick={(e) => { e.stopPropagation(); window.open(`${UPLOADS_URL}${m.firma_empleado}`, '_blank'); }} 
                                                                                alt="Firma"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-muted small fst-italic">Sin firma</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-12">
                                        <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                                            <Wrench size={48} className="text-muted opacity-25 mb-3"/>
                                            <h6 className="text-muted fw-bold">Sin servicios de taller registrados</h6>
                                            <p className="text-muted small mb-0">No hay mantenimientos correctivos en este periodo.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeUnidadTab === 'choferes' && (
                        <div className="list-group list-group-flush">
                            <h6 className="fw-bold text-muted small text-uppercase mb-3" style={{fontSize: '10px'}}>Choferes que operaron la unidad</h6>
                            {unidadData.map((emp, i) => (
                                <div key={i} className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 mb-2 p-3 bg-light rounded-4">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{width: 32, height: 32, fontSize: '11px'}}>
                                            {emp.empleado_nombre?.substring(0,2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h6 className="mb-0 fw-bold small">{emp.empleado_nombre}</h6>
                                            <small className="text-muted" style={{fontSize: '9px'}}>{emp.total_viajes} viajes reportados</small>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <span className="d-block fw-extrabold text-success small">{f(emp.total_ingresos)}</span>
                                        <small className="text-muted" style={{fontSize: '8px'}}>Generados</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 p-5 bg-white h-100 d-flex flex-column align-items-center justify-content-center text-center">
                <div className="p-4 rounded-circle bg-light text-muted mb-4 opacity-50">
                    <Car size={64} strokeWidth={1} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Análisis de Unidad</h5>
                <p className="text-muted small mb-0" style={{maxWidth: '250px'}}>
                    Seleccione una unidad de la lista de la izquierda para visualizar el análisis financiero detallado.
                </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column py-3 px-lg-5" style={{ backgroundColor: '#f1f5f9', overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* HEADER PREMIUM */}
      <div
        className="text-white rounded-4 p-4 mb-5 shadow-lg border-0 d-flex flex-column flex-md-row justify-content-between align-items-center animate__animated animate__fadeIn"
        style={{
          background: "linear-gradient(135deg, #022c22 0%, #115e59 100%)",
          boxShadow: "rgba(17, 94, 89, 0.3) 0px 10px 30px"
        }}
      >
        <div className="d-flex align-items-center gap-3 text-center text-md-start">
          <div className="d-none d-sm-flex align-items-center justify-content-center bg-white bg-opacity-10 rounded-4" style={{ width: '58px', height: '58px' }}>
            <DollarSign size={32} color="white" strokeWidth={2.2} />
          </div>

          <div className="d-flex flex-column">
            <h1 className="fw-bold mb-0" style={{ fontSize: '1.8rem' }}>Finanzas Avanzadas</h1>
            <p className="text-white-50 mb-0 small text-uppercase tracking-widest" style={{ fontSize: '10px' }}>
              Reporte de Rentabilidad Operativa
            </p>
          </div>
        </div>

            <div className="btn-group p-1 bg-white bg-opacity-10 rounded-4" style={{ backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {['day', 'week', 'month', 'year'].map((p) => (
                <button
                  key={p}
                  onClick={() => setModo(p)}
                  className={`btn btn-sm px-3 py-2 rounded-3 border-0 transition-all ${(modo === p || (p === 'day' && modo === 'dia') || (p === 'week' && modo === 'semana') || (p === 'month' && modo === 'mes') || (p === 'year' && modo === 'anio')) ? 'bg-white text-dark fw-bold shadow-sm' : 'text-white opacity-60'}`}
                  style={{ fontSize: '10px', minWidth: '60px' }}
                >
                  {p === 'day' ? 'DÍA' : p === 'week' ? 'SEMANA' : p === 'month' ? 'MES' : 'AÑO'}
                </button>
              ))}
            </div>

            <div className="d-flex align-items-center gap-2 bg-white bg-opacity-10 p-1 rounded-pill border border-white border-opacity-10 px-2">
              <button onClick={handlePrev} className="btn btn-outline-light rounded-circle p-0 d-flex align-items-center justify-content-center border-0" style={{ width: 32, height: 32 }}>
                  <ChevronLeft size={18} />
              </button>
              
              <div className="position-relative d-flex align-items-center justify-content-center text-white fw-bold small" style={{ minWidth: '140px' }}>
                 {(modo === 'dia' || modo === 'day') && (
                   <div className="d-flex align-items-center gap-2">
                     <input 
                       type="date" 
                       className="position-absolute opacity-0 w-100 h-100 start-0 top-0"
                       style={{ cursor: 'pointer' }}
                       value={formatDateForApi(fechaReferencia)} 
                       onChange={(e) => setFechaReferencia(new Date(e.target.value + 'T12:00:00'))} 
                     />
                     <span>{new Date(fechaReferencia).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                   </div>
                 )}
                 {(modo === 'semana' || modo === 'week') && (
                     <div className="text-center" style={{ lineHeight: '1.2' }}>
                        <input 
                            type="date" 
                            className="position-absolute opacity-0 w-100 h-100 start-0 top-0" 
                            style={{ cursor: 'pointer' }}
                            value={formatDateForApi(fechaReferencia)}
                            onChange={(e) => setFechaReferencia(new Date(e.target.value + 'T12:00:00'))} 
                        />
                        <span className="d-block" style={{ fontSize: '11px' }}>SEMANA DEL</span>
                        <TextoRango />
                     </div>
                 )}
                 {(modo === 'mes' || modo === 'month') && (
                   <div className="d-flex align-items-center gap-2">
                     <input 
                       type="month" 
                       className="position-absolute opacity-0 w-100 h-100 start-0 top-0" 
                       style={{ cursor: 'pointer' }}
                       value={formatDateForApi(fechaReferencia).substring(0, 7)} 
                       onChange={(e) => setFechaReferencia(new Date(e.target.value + '-01T12:00:00'))} 
                     />
                     <span>{new Date(fechaReferencia).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).toUpperCase()}</span>
                   </div>
                 )}
                 {(modo === 'anio' || modo === 'year') && (
                    <div className="text-center position-relative">
                       <span>{formatDateForApi(fechaReferencia).substring(0, 4)}</span>
                       <select 
                          className="position-absolute opacity-0 w-100 h-100 start-0 top-0 cursor-pointer"
                          value={formatDateForApi(fechaReferencia).substring(0, 4)}
                          onChange={(e) => setFechaReferencia(new Date(`${e.target.value}-01-01T12:00:00`))}
                       >
                          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                       </select>
                    </div>
                 )}
              </div>
              
              <button onClick={handleNext} className="btn btn-outline-light rounded-circle p-0 d-flex align-items-center justify-content-center border-0" style={{ width: 32, height: 32 }}>
                  <ChevronRight size={18} />
              </button>
            </div>
        </div>

      {/* RIBBON DE NAVEGACIÓN - Diseño Refinado e Indeformable */}
      <div className="d-flex justify-content-start mb-4">
        <div className="d-flex flex-nowrap gap-1 p-1 bg-white rounded-pill shadow-sm animate__animated animate__fadeInUp custom-scrollbar border align-items-center" style={{maxWidth: '100%', overflowX: 'auto', backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)'}}>
        {[
          { id: 'general', label: 'General', icon: <LayoutDashboard size={14}/> },
          { id: 'tabla', label: 'Tabla', icon: <Table size={14}/> },
          { id: 'detalle', label: 'Detalle', icon: <User size={14}/> },
          { id: 'autos', label: 'Unidades', icon: <Car size={14}/> },
          { id: 'transferencias', label: 'Transferencias', icon: <CreditCard size={14}/> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveMainTab(tab.id);
              setSelectedEmpleado(null);
              setSelectedTransferEmp(null);
            }}
            className={`btn rounded-pill d-flex align-items-center gap-2 px-3 py-2 fw-bold transition-all border-0 flex-shrink-0 ${activeMainTab === tab.id ? 'btn-primary shadow-sm' : 'btn-light text-muted bg-transparent'}`}
            style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', letterSpacing: '0.3px' }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
        </div>
      </div>

      <div className={`flex-grow-1 pe-1 custom-scrollbar ${['detalle', 'autos', 'transferencias'].includes(activeMainTab) ? 'overflow-hidden' : 'overflow-auto'}`} style={{ minHeight: 0 }}>
        {loading ? (
        <div className="text-center py-5">
           <div className="spinner-border text-primary" role="status"></div>
           <p className="mt-2 text-muted fw-bold small">Calculando balances...</p>
        </div>
      ) : data ? (
        <div className={`animate__animated animate__fadeIn ${['detalle', 'autos', 'transferencias'].includes(activeMainTab) ? 'h-100' : ''}`}>
          {activeMainTab === 'general' && <TabGeneral data={data} />}
          {activeMainTab === 'tabla' && (
            <TabTabla 
                data={data} 
                onExport={handleExportExcel} 
                onOpenRecibo={(emp) => {
                    setSelectedEmpleadoRecibo(emp);
                    setShowReciboModal(true);
                }}
                onOpenHistory={(emp) => {
                    setSelectedEmpleadoHistory(emp);
                    setShowHistoryModal(true);
                }}
                hideFinancials={user && (user.rol === 'admin' || user.rol === 'staff') ? false : true}
            />
          )}
          {activeMainTab === 'transferencias' && (
              <DashboardTransferencias
                data={data}
                loadingLocal={loading}
                setLoadingLocal={setLoading}
                transferHistory={transferHistory}
                setTransferHistory={setTransferHistory}
                selectedTransferEmp={selectedTransferEmp}
                setSelectedTransferEmp={setSelectedTransferEmp}
                filtroFecha={filtroFecha}
                setFiltroFecha={setFiltroFecha}
                statusTransfer={statusTransfer}
                setStatusTransfer={setStatusTransfer}
                StatusModal={StatusModal}
                montoTransferencia={montoTransferencia}
                setMontoTransferencia={setMontoTransferencia}
                getRangoFechas={getRangoFechas}
              />
          )}
          {activeMainTab === 'detalle' && (
             <div className="row g-4 h-100 overflow-hidden flex-nowrap m-0">
                {/* LISTA ESTILO MODULO PERSONAL - Sidebar Fijo */}
                <div className="col-12 col-lg-4 col-xl-3 h-100 d-flex flex-column">
                    <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden h-100 d-flex flex-column">
                      <div className="card-header bg-white border-0 p-3 flex-shrink-0">
                        <div className="input-group bg-light rounded-pill border-0 px-3 py-1">
                          <Search size={16} className="text-muted" />
                          <input 
                            type="text" 
                            className="form-control bg-transparent border-0 shadow-none ps-2 small"
                            placeholder="Buscar empleado..." 
                            style={{ fontSize: '0.8rem' }}
                            value={filtroFecha}
                            onChange={(e) => setFiltroFecha(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="card-body p-2 flex-grow-1 overflow-auto custom-scrollbar">
                        <div className="d-flex flex-column gap-2">
                           {(() => {
                             const uniqueEmps = [];
                             const seenIds = new Set();
                             (data.empleados || []).forEach(e => {
                                if (e.empleado_id && !seenIds.has(e.empleado_id)) {
                                   seenIds.add(e.empleado_id);
                                   uniqueEmps.push(e);
                                }
                             });
                             return uniqueEmps
                               .filter(e => {
                                  if (!filtroFecha) return true;
                                  return (e.empleado_nombre || "").toLowerCase().includes(filtroFecha.toLowerCase());
                               })
                               .map((emp, index) => (
                                 <div 
                                   key={`${emp.empleado_id}-${index}`} 
                                   onClick={() => setSelectedEmpleado(emp)}
                                   className={`p-3 rounded-4 d-flex align-items-center gap-3 transition-all ${selectedEmpleado?.empleado_id === emp.empleado_id ? 'bg-primary text-white shadow-lg scale-98' : 'bg-light hover-bg-white border border-transparent'}`}
                                   style={{ transform: selectedEmpleado?.empleado_id === emp.empleado_id ? 'scale(0.98)' : 'scale(1)', flexShrink: 0 }}
                                 >
                                   <EmpAvatar emp={emp} size={32} textSize={12} />
                                   <div className="flex-grow-1 overflow-hidden">
                                      <h6 className={`mb-0 fw-bold text-truncate ${selectedEmpleado?.empleado_id === emp.empleado_id ? 'text-white' : 'text-dark'}`} style={{ fontSize: '0.85rem' }}>
                                         {emp.empleado_nombre}
                                      </h6>
                                      <div className="d-flex align-items-center gap-2 mt-0">
                                         <span className={`small ${selectedEmpleado?.empleado_id === emp.empleado_id ? 'text-white text-opacity-75' : 'text-muted'}`} style={{ fontSize: '9px' }}>
                                            {emp.vehiculo_asignado ? `Unidad ${emp.vehiculo_asignado}` : emp.empleado_rol}
                                         </span>
                                      </div>
                                   </div>
                                   <ChevronRight size={12} className={selectedEmpleado?.empleado_id === emp.empleado_id ? 'text-white' : 'text-muted'} />
                                 </div>
                               ))})()}
                        </div>
                      </div>
                    </div>
                </div>

                {/* PANEL DE DETALLE */}
                <div className="col-12 col-lg-8 col-xl-9 h-100 overflow-hidden">
                   {selectedEmpleado ? (
                      <div className="h-100 animate__animated animate__fadeInRight">
                         <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white h-100 d-flex flex-column">
                            <div className="card-header bg-white border-0 p-4 d-flex justify-content-between align-items-center border-bottom flex-shrink-0">
                                <div className="d-flex align-items-center gap-3">
                                   {selectedEmpleado.empleado_id
                                     ? <EmpAvatar emp={selectedEmpleado} size={52} textSize={18} />
                                     : <div className="bg-dark text-white p-3 rounded-4 shadow-sm"><Car size={24}/></div>
                                   }
                                   <div>
                                       <h4 className="fw-extrabold mb-1 text-dark">{selectedEmpleado.empleado_nombre || selectedEmpleado.vehiculo_asignado}</h4>
                                       <div className="d-flex align-items-center gap-2">
                                          <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3">{selectedEmpleado.empleado_rol || 'Personal'}</span>
                                          {selectedEmpleado.vehiculo_asignado && <span className="text-muted small fw-bold"><Car size={14} className="me-1 text-primary opacity-50"/> {selectedEmpleado.vehiculo_asignado}</span>}
                                          <span className="text-muted small opacity-50">• ID: #{selectedEmpleado.empleado_id || 'N/A'}</span>
                                       </div>
                                   </div>
                                </div>
                                 <button onClick={() => setSelectedEmpleado(null)} className="btn btn-light rounded-circle p-2 shadow-sm border">
                                    <X size={20} />
                                 </button>
                            </div>
                            <div className="card-body p-4 pt-4 overflow-auto custom-scrollbar flex-grow-1">
                                {(() => {
                                    const role = (selectedEmpleado.empleado_rol || '').toLowerCase();
                                    const hasIncome = Number(selectedEmpleado.total_ingresos || 0) > 0;
                                    const soporteRoles = ['monitorista', 'taller', 'limpieza', 'desarrollador', 'admin'];
                                    
                                    // Vista simplificada solo para roles de soporte (sin liquidaciones)
                                    const isSupport = ['monitorista', 'taller', 'limpieza', 'desarrollador'].includes(role);
                                    const isSimplified = isSupport;

                                    const totalGastosChofer = (selectedEmpleado.detalles_ingresos || []).reduce((sum, liq) => sum + (Number(liq.gastos_total) || 0), 0);
                                    const totalMtto = (selectedEmpleado.detalles_mantenimiento || []).reduce((sum, m) => sum + (Number(m.costo_total) || 0), 0);
                                    
                                    const fuelKeywords = ['gasolina', 'combustible', 'diesel', 'magna', 'premium'];
                                    const costosFijosFiltrados = (selectedEmpleado.detalles_costos_operativos || []).filter(c => !fuelKeywords.some(k => (c.tipo || '').toLowerCase().includes(k)));
                                    const totalFijos = costosFijosFiltrados.reduce((sum, c) => sum + (Number(c.costo_total) || 0), 0);
                                    const utilidad = Number(selectedEmpleado.total_ingresos || 0) + Number(selectedEmpleado.total_depositos || 0) - totalGastosChofer - totalMtto - totalFijos;

                                    return (
                                        <>
                                        {!isSimplified && (
                                            <div className="row g-4 mb-4">
                                                <div className="col-12 col-sm-6 col-lg">
                                                    <div className="p-4 rounded-4 bg-success bg-opacity-10 border border-success border-opacity-10 text-center h-100 d-flex flex-column justify-content-center shadow-sm">
                                                        <span className="d-block text-success small fw-bold text-uppercase mb-2" style={{fontSize:'12px', letterSpacing: '1px'}}>Ingresos</span>
                                                        <h4 className="fw-extrabold text-success mb-0">{f(selectedEmpleado.total_ingresos)}</h4>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-6 col-lg">
                                                    <div className="p-4 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-10 text-center h-100 d-flex flex-column justify-content-center shadow-sm">
                                                        <span className="d-block text-primary small fw-bold text-uppercase mb-2" style={{fontSize:'12px', letterSpacing: '1px'}}>Depósitos</span>
                                                        <h4 className="fw-extrabold text-primary mb-0">{f(selectedEmpleado.total_depositos || 0)}</h4>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-6 col-lg">
                                                    <div className="p-4 rounded-4 bg-danger bg-opacity-10 border border-danger border-opacity-10 text-center h-100 d-flex flex-column justify-content-center shadow-sm">
                                                        <span className="d-block text-danger small fw-bold text-uppercase mb-2" style={{fontSize:'12px', letterSpacing: '1px'}}>Gastos Chofer</span>
                                                        <h4 className="fw-extrabold text-danger mb-0">{f(totalGastosChofer)}</h4>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-6 col-lg">
                                                    <div className="p-4 rounded-4 bg-warning bg-opacity-10 border border-warning border-opacity-10 text-center h-100 d-flex flex-column justify-content-center shadow-sm">
                                                        <span className="d-block text-warning small fw-bold text-uppercase mb-2" style={{fontSize:'12px', letterSpacing: '1px'}}>Mantenimiento</span>
                                                        <h4 className="fw-extrabold text-warning mb-0">{f(totalFijos)}</h4>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-6 col-lg">
                                                    <div className="p-4 rounded-4 bg-info bg-opacity-10 border border-info border-opacity-10 text-center h-100 d-flex flex-column justify-content-center shadow-sm">
                                                        <span className="d-block text-info small fw-bold text-uppercase mb-2" style={{fontSize:'12px', letterSpacing: '1px'}}>Taller</span>
                                                        <h4 className="fw-extrabold text-info mb-0">{f(totalMtto)}</h4>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-sm-6 col-lg">
                                                    <div className="p-4 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-10 text-center h-100 d-flex flex-column justify-content-center shadow-sm">
                                                        <span className="d-block text-primary small fw-bold text-uppercase mb-2" style={{fontSize:'12px', letterSpacing: '1px'}}>Utilidad</span>
                                                        <h4 className="fw-extrabold text-primary mb-0">{f(utilidad)}</h4>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="d-flex border-bottom mb-3">
                                           {!isSimplified && (
                                               <>
                                                <button 
                                                   className={`btn btn-sm pb-2 px-3 fw-bold ${activeTab === 'ingresos' ? 'text-primary border-bottom border-primary border-2' : 'text-secondary opacity-50'}`}
                                                   onClick={() => setActiveTab('ingresos')}
                                                >Ingresos</button>
                                                <button 
                                                   className={`btn btn-sm pb-2 px-3 fw-bold ${activeTab === 'gastos' ? 'text-primary border-bottom border-primary border-2' : 'text-secondary opacity-50'}`}
                                                   onClick={() => setActiveTab('gastos')}
                                                >Gastos</button>
                                                <button 
                                                   className={`btn btn-sm pb-2 px-3 fw-bold ${activeTab === 'mantenimiento' ? 'text-primary border-bottom border-primary border-2' : 'text-secondary opacity-50'}`}
                                                   onClick={() => setActiveTab('mantenimiento')}
                                                >Costos Fijos</button>
                                                  <button 
                                                     className={`btn btn-sm pb-2 px-3 fw-bold ${activeTab === 'taller' ? 'text-primary border-bottom border-primary border-2' : 'text-secondary opacity-50'}`}
                                                     onClick={() => setActiveTab('taller')}
                                                  >Taller</button>
                                               </>
                                           )}
                                            <button 
                                               className={`btn btn-sm pb-2 px-3 fw-bold ${activeTab === 'nomina' ? 'text-primary border-bottom border-primary border-2' : 'text-secondary opacity-50'}`}
                                               onClick={() => setActiveTab('nomina')}
                                            >{isSimplified ? 'Historial de Nómina / Pagos' : 'Nómina'}</button>
                                        </div>
                                        </>
                                    );
                                })()}

                                {activeTab === 'ingresos' && (
                                   <div className="table-responsive">
                                      <table className="table table-sm table-hover align-middle border-0">
                                         <thead className="bg-light">
                                            <tr>
                                               <th className="px-0 py-2 border-0 text-muted small fw-bold text-uppercase" style={{fontSize: '10px'}}>Fecha</th>
                                               <th className="px-0 py-2 border-0 text-muted small fw-bold text-uppercase" style={{fontSize: '10px'}}>Hora</th>
                                               <th className="px-0 py-2 border-0 text-muted small fw-bold text-uppercase text-end" style={{fontSize: '10px'}}>Ingreso (Caja)</th>
                                            </tr>
                                         </thead>
                                         <tbody>
                                            {(selectedEmpleado.detalles_ingresos || []).filter(liq => Number(liq.monto_efectivo) > 0).length > 0 ? (
                                               (selectedEmpleado.detalles_ingresos || []).filter(liq => Number(liq.monto_efectivo) > 0).map((liq, i) => (
                                                  <tr key={i}>
                                                      <td className="px-0 py-2 border-light small fw-bold text-dark">
                                                         {(() => {
                                                            const d = new Date(liq.fecha + 'T' + (liq.hora || '12:00:00'));
                                                            if (d.getHours() < 4) {
                                                               d.setDate(d.getDate() - 1);
                                                            }
                                                            return d.toLocaleDateString('es-MX', {day: '2-digit', month: '2-digit', year: 'numeric'});
                                                         })()}
                                                      </td>
                                                     <td className="px-0 py-2 border-light small text-muted">
                                                        {liq.hora ? liq.hora.substring(0, 5) : '--:--'}
                                                     </td>
                                                     <td className="px-0 py-2 border-light small text-end fw-bold text-success">
                                                        {f(liq.monto_efectivo)}
                                                     </td>
                                                  </tr>
                                               ))
                                            ) : (
                                               <tr>
                                                  <td colSpan="3" className="text-center py-4 text-muted small">No hay ingresos registrados</td>
                                               </tr>
                                            )}
                                         </tbody>
                                      </table>
                                   </div>
                                )}
                                
                                {activeTab === 'gastos' && (
                                   <div className="list-group list-group-flush gap-2">
                                      {(selectedEmpleado.detalles_ingresos || []).filter(l => Number(l.gastos_total) > 0).map((liq, i) => {
                                         const isExpanded = expandedGastoId === liq.id;
                                         return (
                                            <div key={liq.id || i} className={`border rounded-4 overflow-hidden transition-all ${isExpanded ? 'shadow-md border-primary' : 'hover-bg-light'}`}>
                                               <div 
                                                  className={`p-3 cursor-pointer d-flex justify-content-between align-items-center ${isExpanded ? 'bg-primary bg-opacity-10' : 'bg-white'}`}
                                                  onClick={() => setExpandedGastoId(isExpanded ? null : liq.id)}
                                               >
                                                  <div className="d-flex align-items-center gap-3">
                                                     <div className={`rounded-circle d-flex align-items-center justify-content-center ${isExpanded ? 'bg-primary text-white' : 'bg-danger bg-opacity-10 text-danger'}`} style={{width: 32, height: 32}}>
                                                        {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                                     </div>
                                                      <div>
                                                         <span className="d-block fw-bold text-dark">
                                                            {(() => {
                                                               const d = new Date(liq.fecha + 'T' + (liq.hora || '12:00:00'));
                                                               if (d.getHours() < 4) {
                                                                  d.setDate(d.getDate() - 1);
                                                               }
                                                               return d.toLocaleDateString();
                                                            })()}
                                                         </span>
                                                         <small className="text-muted d-block" style={{fontSize: '10px'}}>Hora: {liq.hora ? liq.hora.substring(0,5) : '--:--'}</small>
                                                        <small className="text-muted">{liq.comentarios || 'Gasto operativo de jornada'}</small>
                                                     </div>
                                                  </div>
                                                  <div className="text-end">
                                                     <span className="text-danger fw-extrabold h6 mb-0">-{f(liq.gastos_total)}</span>
                                                  </div>
                                               </div>
                                               
                                               {isExpanded && (
                                                  <div className="p-3 bg-light border-top animate__animated animate__fadeIn">
                                                     <div className="bg-white p-3 rounded-3 shadow-sm border-start border-4 border-danger">
                                                        <h6 className="fw-bold text-danger mb-2 small text-uppercase">Desglose de Gastos</h6>
                                                        <div className="small text-muted mb-0">
                                                           {(() => {
                                                              try {
                                                                 const gastostBreakdown = JSON.parse(liq.detalles_gastos || '[]');
                                                                 if (Array.isArray(gastostBreakdown) && gastostBreakdown.length > 0) {
                                                                    return (
                                                                       <div className="d-flex flex-column gap-1">
                                                                          {gastostBreakdown.map((g, gi) => (
                                                                             <div key={gi} className="border-bottom border-light py-2">
                                                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                                                   <span className="text-muted fw-medium">{g.tipo || 'Gasto'}</span>
                                                                                   <span className="fw-bold text-danger">{f(g.monto)}</span>
                                                                                </div>
                                                                                {g.tipo === 'Otros' && g.motivo && (
                                                                                   <div className="text-dark small fst-italic mb-1">
                                                                                      Motivo: {g.motivo}
                                                                                   </div>
                                                                                )}
                                                                                {(g.foto_ticket || g.foto_tablero) && (
                                                                                   <div className="d-flex gap-2 mt-1">
                                                                                      {g.foto_ticket && (
                                                                                         <div className="position-relative group" onClick={(e) => { e.stopPropagation(); window.open(`${UPLOADS_URL}${g.foto_ticket}`, '_blank'); }}>
                                                                                            <img src={`${UPLOADS_URL}${g.foto_ticket}`} className="rounded border cursor-pointer hover-opacity-75 transition-all" style={{width: '60px', height: '40px', objectFit: 'cover'}} alt="Ticket" />
                                                                                            <div className="position-absolute bottom-0 end-0 bg-dark bg-opacity-50 text-white p-1 rounded-start" style={{fontSize: '7px'}}>Ticket</div>
                                                                                         </div>
                                                                                      )}
                                                                                      {g.foto_tablero && (
                                                                                         <div className="position-relative" onClick={(e) => { e.stopPropagation(); window.open(`${UPLOADS_URL}${g.foto_tablero}`, '_blank'); }}>
                                                                                            <img src={`${UPLOADS_URL}${g.foto_tablero}`} className="rounded border cursor-pointer hover-opacity-75 transition-all" style={{width: '60px', height: '40px', objectFit: 'cover'}} alt="Tablero" />
                                                                                            <div className="position-absolute bottom-0 end-0 bg-dark bg-opacity-50 text-white p-1 rounded-start" style={{fontSize: '7px'}}>Tablero</div>
                                                                                         </div>
                                                                                      )}
                                                                                   </div>
                                                                                )}
                                                                             </div>
                                                                          ))}
                                                                       </div>
                                                                    );
                                                                 }
                                                              } catch (e) {
                                                                 console.log("Not a JSON breakdown");
                                                              }
                                                              return <div style={{ whiteSpace: 'pre-wrap' }}>{liq.detalles_gastos || 'No se especificó un desglose detallado.'}</div>;
                                                           })()}
                                                        </div>
                                                     </div>
                                                     <div className="row g-2 mt-2">
                                                        <div className="col-6">
                                                           <div className="p-2 bg-white rounded-3 border text-center h-100">
                                                              <span className="d-block text-muted" style={{fontSize: '9px'}}>NETO ENTREGADO</span>
                                                              <span className="fw-bold text-dark small">{f(liq.neto_entregado)}</span>
                                                           </div>
                                                        </div>
                                                        <div className="col-6">
                                                           <div className="p-2 bg-white rounded-3 border text-center h-100 d-flex flex-column align-items-center justify-content-center">
                                                              <span className="d-block text-muted mb-1" style={{fontSize: '9px'}}>FIRMA CHOFER</span>
                                                              {liq.firma_path ? (
                                                                 <img 
                                                                    src={`${UPLOADS_URL}${liq.firma_path}`} 
                                                                    className="img-fluid" 
                                                                    style={{maxHeight: '30px', mixBlendMode: 'multiply'}} 
                                                                    alt="Firma"
                                                                    onClick={(e) => { e.stopPropagation(); window.open(`${UPLOADS_URL}${liq.firma_path}`, '_blank'); }}
                                                                 />
                                                              ) : (
                                                                 <span className="text-muted" style={{fontSize: '8px'}}>Sin firma</span>
                                                              )}
                                                           </div>
                                                        </div>
                                                     </div>
                                                  </div>
                                               )}
                                            </div>
                                         );
                                      })}
                                   </div>
                                )}

                                 {activeTab === 'mantenimiento' && (
                                   <div className="animate__animated animate__fadeIn">
                                       <h6 className="fw-bold text-muted small text-uppercase mb-3 d-flex align-items-center gap-2" style={{fontSize: '11px', letterSpacing: '0.5px'}}>
                                           <TrendingDown size={16} className="text-warning"/> Costos Operativos Fijos (Prorrateados)
                                       </h6>
                                       <div className="row g-3">
                                          {(() => {
                                            const fuelKeywords = ['gasolina', 'combustible', 'diesel', 'magna', 'premium'];
                                            const filteredOps = (selectedEmpleado.detalles_costos_operativos || [])
                                                .filter(c => !fuelKeywords.some(k => (c.tipo || '').toLowerCase().includes(k)));
                                            
                                            return filteredOps.length > 0 ? (
                                             filteredOps.map((c, i) => (
                                                <div key={`c-${i}`} className="col-12 col-md-6 col-xl-4">
                                                   <div className="p-4 bg-white border rounded-4 d-flex justify-content-between align-items-center transition-all hover-lift shadow-sm">
                                                      <div>
                                                         <span className="d-block fw-extrabold text-dark mb-1" style={{fontSize: '14px'}}>{c.tipo}</span>
                                                         <small className="text-muted text-uppercase fw-bold" style={{fontSize: '10px', letterSpacing: '0.5px'}}>{modo === 'dia' ? 'Día Actual' : modo === 'semana' ? 'Semana Actual' : 'Periodo Selección'}</small>
                                                      </div>
                                                      <span className="text-warning fw-extrabold" style={{fontSize: '18px'}}>-{f(c.costo_total)}</span>
                                                   </div>
                                                </div>
                                             ))
                                          ) : (
                                             <div className="col-12">
                                                <div className="text-center py-5 text-muted small border rounded-4 border-dashed bg-light">
                                                   No hay costos de mantenimiento preventivo registrados para este periodo.
                                                </div>
                                             </div>
                                          );
                                          })()}
                                       </div>
                                   </div>
                                 )}

                                 {activeTab === 'taller' && (
                                   <div className="animate__animated animate__fadeIn">
                                       <h6 className="fw-bold text-muted small text-uppercase mb-3 d-flex align-items-center gap-2" style={{fontSize: '11px', letterSpacing: '0.5px'}}>
                                           <Wrench size={16} className="text-info"/> Costos Operativos (Taller y Reparaciones)
                                       </h6>
                                       <div className="row g-3">
                                          {(selectedEmpleado.detalles_mantenimiento || []).length > 0 ? (
                                             (selectedEmpleado.detalles_mantenimiento || []).map((m, i) => {
                                                const isExpanded = expandedMantId === m.id;
                                                return (
                                                   <div key={m.id || i} className="col-12">
                                                      <div className={`border rounded-4 overflow-hidden transition-all ${isExpanded ? 'shadow-md border-primary' : 'hover-bg-light shadow-sm'}`}>
                                                         <div 
                                                            className={`p-4 cursor-pointer d-flex justify-content-between align-items-center ${isExpanded ? 'bg-primary bg-opacity-10' : 'bg-white'}`}
                                                            onClick={() => setExpandedMantId(isExpanded ? null : m.id)}
                                                         >
                                                            <div className="d-flex align-items-center gap-3">
                                                               <div className={`rounded-circle d-flex align-items-center justify-content-center ${isExpanded ? 'bg-primary text-white shadow' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{width: 40, height: 40}}>
                                                                  {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                                               </div>
                                                                <div>
                                                                   <span className="d-block fw-extrabold text-dark" style={{fontSize: '16px'}}>{m.tipo}</span>
                                                                   <small className="text-muted fw-bold" style={{fontSize: '11px'}}>
                                                                      {(() => {
                                                                         const d = new Date(m.fecha + 'T' + (m.hora || '12:00:00'));
                                                                         if (d.getHours() < 4) d.setDate(d.getDate() - 1);
                                                                         return d.toLocaleDateString('es-MX', {day: '2-digit', month: 'long', year: 'numeric'});
                                                                      })()}
                                                                   </small>
                                                                </div>
                                                            </div>
                                                            <div className="text-end">
                                                               <span className="text-danger fw-extrabold" style={{fontSize: '20px'}}>-{f(m.costo_total)}</span>
                                                            </div>
                                                         </div>

                                                         {isExpanded && (
                                                            <div className="p-4 bg-light border-top animate__animated animate__fadeIn">
                                                               <div className="row g-4 text-dark">
                                                                  <div className="col-12 col-md-7">
                                                                     <div className="bg-white p-4 rounded-4 shadow-sm border-start border-4 border-primary h-100">
                                                                        <h6 className="fw-bold text-primary mb-3 small text-uppercase tracking-wider">Descripción del Servicio</h6>
                                                                        <div className="text-dark fw-medium mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                                                           {m.descripcion || 'Sin descripción detallada.'}
                                                                        </div>
                                                                     </div>
                                                                  </div>
                                                                  <div className="col-12 col-md-5">
                                                                     <div className="row g-3">
                                                                        <div className="col-12">
                                                                           <div className="p-3 bg-white rounded-4 border shadow-sm text-center h-100 d-flex flex-column align-items-center justify-content-center">
                                                                              <span className="d-block text-muted mb-2 fw-bold small text-uppercase tracking-wider" style={{fontSize: '10px'}}>Evidencia Fotográfica</span>
                                                                              {m.evidencia_foto ? (
                                                                                 <img 
                                                                                    src={`${UPLOADS_URL}${m.evidencia_foto}`} 
                                                                                    className="img-fluid rounded-3 border shadow-sm cursor-pointer hover-lift" 
                                                                                    style={{maxHeight: '120px', objectFit: 'cover'}} 
                                                                                    alt="Evidencia"
                                                                                    onClick={(e) => { e.stopPropagation(); window.open(`${UPLOADS_URL}${m.evidencia_foto}`, '_blank'); }}
                                                                                 />
                                                                              ) : (
                                                                                 <div className="py-4 opacity-25 d-flex flex-column align-items-center">
                                                                                    <ImageIcon size={32} />
                                                                                    <small className="mt-2 fw-bold">SIN FOTO</small>
                                                                                 </div>
                                                                              )}
                                                                           </div>
                                                                        </div>
                                                                        <div className="col-12">
                                                                           <div className="p-3 bg-white rounded-4 border shadow-sm text-center h-100 d-flex flex-column align-items-center justify-content-center">
                                                                              <span className="d-block text-muted mb-2 fw-bold small text-uppercase tracking-wider" style={{fontSize: '10px'}}>Respaldo (Firma)</span>
                                                                              {m.firma_empleado ? (
                                                                                 <img 
                                                                                    src={`${UPLOADS_URL}${m.firma_empleado}`} 
                                                                                    className="img-fluid" 
                                                                                    style={{maxHeight: '60px', mixBlendMode: 'multiply'}} 
                                                                                    alt="Firma"
                                                                                    onClick={(e) => { e.stopPropagation(); window.open(`${UPLOADS_URL}${m.firma_empleado}`, '_blank'); }}
                                                                                 />
                                                                              ) : (
                                                                                 <div className="py-2 opacity-25 d-flex flex-column align-items-center">
                                                                                    <small className="fw-bold">N/A</small>
                                                                                 </div>
                                                                              )}
                                                                           </div>
                                                                        </div>
                                                                     </div>
                                                                  </div>
                                                               </div>
                                                            </div>
                                                         )}
                                                      </div>
                                                   </div>
                                                );
                                             })
                                          ) : (
                                             <div className="col-12">
                                                <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                                                   <div className="mb-3 opacity-25"><Wrench size={40}/></div>
                                                   <h6 className="text-muted fw-bold">Este empleado no tiene servicios de taller en este periodo.</h6>
                                                </div>
                                             </div>
                                          )}
                                       </div>
                                   </div>
                                 )}

                                 {activeTab === 'nomina' && (
                                    <div className="animate__animated animate__fadeIn">
                                       <div className="d-flex justify-content-between align-items-center mb-4">
                                          <h6 className="fw-bold text-muted small text-uppercase mb-0 d-flex align-items-center gap-2" style={{fontSize: '11px', letterSpacing: '0.5px'}}>
                                             <DollarSign size={16} className="text-primary"/> Nómina y Liquidación
                                          </h6>
                                          <button 
                                             className={`btn btn-sm ${showHistory ? 'btn-primary' : 'btn-outline-primary'} rounded-pill px-3 d-flex align-items-center gap-2`}
                                             onClick={() => setShowHistory(!showHistory)}
                                          >
                                             <History size={14}/>
                                             {showHistory ? 'Ocultar Historial' : 'Ver Historial'}
                                          </button>
                                       </div>

                                       {showHistory ? (
                                          <div className="animate__animated animate__fadeInUp">
                                             <div className="row g-3">
                                                {nominaTickets.filter(t => t.empleado_id === String(selectedEmpleado.empleado_id || selectedEmpleado.vehiculo_asignado)).length > 0 ? (
                                                   nominaTickets.filter(t => t.empleado_id === String(selectedEmpleado.empleado_id || selectedEmpleado.vehiculo_asignado)).map((t, idx) => (
                                                      <div key={idx} className="col-12 col-md-6 col-lg-4">
                                                         <div className="bg-white border shadow-sm rounded-2 p-3 position-relative overflow-hidden hover-lift" style={{ borderStyle: 'dashed', borderWidth: '1px', minHeight: '400px' }}>
                                                            {/* Fecha de Emisión arriba como pidió el usuario */}
                                                            <div className="text-center mb-3 pb-2 border-bottom border-dashed opacity-75">
                                                               <span className="d-block small text-muted text-uppercase fw-bold" style={{fontSize: '8px', letterSpacing: '1px'}}>Fecha de Emisión</span>
                                                               <span className="fw-bold text-dark font-monospace" style={{fontSize: '11px'}}>{new Date(t.fecha_emision).toLocaleDateString('es-MX', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</span>
                                                            </div>

                                                            <div className="text-center mb-3 opacity-50">
                                                               <h6 className="fw-900 mb-0 text-dark small" style={{letterSpacing: '1px', fontWeight: '900'}}>PAGO DE NÓMINA</h6>
                                                               <div className="font-monospace text-uppercase" style={{fontSize: '9px'}}>{t.periodo}</div>
                                                            </div>

                                                            <div className="font-monospace small d-flex flex-column gap-2 text-dark px-1" style={{fontSize: '11px'}}>
                                                               <div className="d-flex justify-content-between">
                                                                  <span className="opacity-75">INGRESOS BRUTOS:</span>
                                                                  <span className="fw-bold">{f(t.ingresos_brutos)}</span>
                                                               </div>
                                                               <div className="d-flex flex-column gap-1 opacity-75">
                                                                  <div className="d-flex justify-content-between text-danger">
                                                                     <span>(-) GASTOS CHOFER:</span>
                                                                     <span>{f(t.gastos_chofer)}</span>
                                                                  </div>
                                                                  <div className="d-flex justify-content-between text-danger">
                                                                     <span>(-) GASTOS MANTENIMIENTO:</span>
                                                                     <span>{f(t.gastos_mantenimiento)}</span>
                                                                  </div>
                                                                  <div className="d-flex justify-content-between text-danger">
                                                                     <span>(-) GASTOS TALLER:</span>
                                                                     <span>{f(t.gastos_taller)}</span>
                                                                  </div>
                                                                  {Number(t.depositos) > 0 && (
                                                                     <div className="d-flex justify-content-between text-primary">
                                                                        <span>(+) DEPOSITOS:</span>
                                                                        <span>{f(t.depositos)}</span>
                                                                     </div>
                                                                  )}
                                                               </div>
                                                               
                                                               <div className="border-top border-dashed my-1 pt-1 d-flex justify-content-between text-primary fw-bold">
                                                                  <span>UTILIDAD TOTAL:</span>
                                                                  <span className={Number(t.utilidad_total) < 0 ? 'text-danger' : ''}>{f(t.utilidad_total)}</span>
                                                               </div>

                                                               <div className="bg-light p-2 rounded-2 d-flex flex-column gap-1 border border-opacity-10">
                                                                  {Number(t.bonos_extras) > 0 && (
                                                                     <div className="d-flex justify-content-between text-success">
                                                                        <span>BONOS Y EXTRAS:</span>
                                                                        <span className="fw-bold">{f(t.bonos_extras)}</span>
                                                                     </div>
                                                                  )}
                                                                  <div className="d-flex justify-content-between text-warning">
                                                                     <span>(+) PROPINAS:</span>
                                                                     <span className="fw-bold">{f(t.propinas)}</span>
                                                                  </div>
                                                               </div>

                                                               <div className="border-top border-dark my-1 pt-2 d-flex justify-content-between align-items-center">
                                                                  <span className="fw-900 text-uppercase" style={{fontSize: '10px', fontWeight: '900'}}>TOTAL PAGO:</span>
                                                                  <span className={`fw-900 ${Number(t.total_pago) < 0 ? 'text-danger' : 'text-dark'}`} style={{fontSize: '16px', fontWeight: '900'}}>{f(t.total_pago)}</span>
                                                               </div>

                                                               <div className="mt-3 text-center opacity-30" style={{fontSize: '8px'}}>
                                                                  <div className="mb-1" style={{borderTop: '1px dashed #000'}}></div>
                                                                  <span>ID: {t.recibo_id}</span>
                                                               </div>
                                                            </div>
                                                         </div>
                                                      </div>
                                                   ))
                                                ) : (
                                                   <div className="col-12 text-center py-5 text-muted opacity-50 bg-light rounded-4 border border-dashed">
                                                      <Clock size={48} className="mb-3"/>
                                                      <p className="fw-bold">No hay tickets guardados para este colaborador.</p>
                                                   </div>
                                                )}
                                             </div>
                                          </div>
                                       ) : (() => {
                                          const rolDetalle = (selectedEmpleado.empleado_rol || '').toLowerCase();
                                          const tieneActividadDetalle = Number(selectedEmpleado.total_ingresos) > 0 || Number(selectedEmpleado.total_viajes) > 0;
                                          const isSoporteDetalle = ['monitorista', 'taller', 'limpieza', 'desarrollador', 'admin'].includes(rolDetalle) && !tieneActividadDetalle;
                                          return (
                                          <div className="row g-4">
                                             <div className={`col-12 ${isSoporteDetalle ? 'col-md-12' : 'col-md-5'}`}>
                                                <div className="card border-0 shadow-sm rounded-4 p-4 bg-light bg-opacity-50 h-100">
                                                   <h6 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                                                      <div className="p-2 rounded-3 bg-white text-primary shadow-sm"><Table size={16}/></div>
                                                      Configuración
                                                   </h6>
                                                   
                                                   <div className="mb-3">
                                                      <label className="form-label small fw-bold text-muted text-uppercase" style={{fontSize: '10px'}}>Comisión (%)</label>
                                                      <div className="input-group bg-white rounded-3 shadow-sm border-0 px-2">
                                                         <span className="input-group-text bg-transparent border-0 text-primary fw-bold small">%</span>
                                                         <input 
                                                            type="number" 
                                                            className="form-control bg-transparent border-0 shadow-none fw-bold" 
                                                            value={comisionNomina} 
                                                            onChange={(e) => setComisionNomina(e.target.value === '' ? '' : Number(e.target.value))} 
                                                         />
                                                      </div>
                                                   </div>

                                                   <div className="mb-4">
                                                      <label className="form-label small fw-bold text-muted text-uppercase" style={{fontSize: '10px'}}>Bonos y Extras ($)</label>
                                                      <div className="input-group bg-white rounded-3 shadow-sm border-0 px-2">
                                                         <span className="input-group-text bg-transparent border-0 text-success fw-bold small">$</span>
                                                         <input 
                                                            type="number" 
                                                            className="form-control bg-transparent border-0 shadow-none fw-bold" 
                                                            value={bonosNomina} 
                                                            onChange={(e) => setBonosNomina(e.target.value === '' ? '' : Number(e.target.value))} 
                                                         />
                                                      </div>
                                                   </div>

                                                   <button 
                                                      className={`btn w-100 rounded-3 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 transition-all ${showConfigSuccess ? 'btn-success shadow' : 'btn-primary shadow-sm'}`} 
                                                      onClick={handleSaveComision}
                                                   >
                                                      {showConfigSuccess ? <><CheckCircle size={20}/> ¡Configuración Guardada!</> : <><Save size={20}/> Guardar Configuración</>}
                                                   </button>
                                                </div>
                                             </div>

                                             {!isSoporteDetalle && (
                                                <div className="col-12 col-md-7">
                                                   <div className="ticket-view animate__animated animate__fadeInRight">
                                                      <div className="bg-white border shadow-lg rounded-2 p-4 position-relative overflow-hidden" style={{ minHeight: '450px', borderStyle: 'dashed', borderWidth: '1px' }}>
                                                         {/* Estética de Ticket */}
                                                         <div className="text-center mb-4 pb-3 border-bottom border-dashed border-secondary border-opacity-25">
                                                            <h5 className="fw-900 mb-1 text-dark" style={{letterSpacing: '2px', fontWeight: '900'}}>PAGO DE NÓMINA</h5>
                                                            <div className="small text-muted font-monospace text-uppercase fw-bold" style={{fontSize: '10px'}}>
                                                               {(() => {
                                                                  const { inicio, fin } = getRangoFechas();
                                                                  return `${inicio} — ${fin}`;
                                                               })()}
                                                            </div>
                                                         </div>

                                                         {/* Cuerpo del Ticket */}
                                                         <div className="font-monospace small d-flex flex-column gap-3 text-dark px-2">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                               <span className="opacity-75">INGRESOS BRUTOS:</span>
                                                               <span className="fw-bold">{f(selectedEmpleado.total_ingresos)}</span>
                                                            </div>
                                                            
                                                            <div className="d-flex flex-column gap-1 opacity-75">
                                                               <div className="d-flex justify-content-between text-danger">
                                                                  <span>(-) GASTOS CHOFER:</span>
                                                                  <span>{f((selectedEmpleado.detalles_ingresos || []).reduce((sum, liq) => sum + (Number(liq.gastos_total) || 0), 0))}</span>
                                                               </div>
                                                               <div className="d-flex justify-content-between text-danger">
                                                                  <span>(-) GASTOS MANTENIMIENTO (FIJOS):</span>
                                                                  <span>{f((selectedEmpleado.detalles_costos_operativos || []).reduce((sum, c) => sum + (Number(c.costo_total) || 0), 0))}</span>
                                                               </div>
                                                               <div className="d-flex justify-content-between text-danger">
                                                                  <span>(-) GASTOS TALLER:</span>
                                                                  <span>{f((selectedEmpleado.detalles_mantenimiento || []).reduce((sum, m) => sum + (Number(m.costo_total) || 0), 0))}</span>
                                                               </div>
                                                               <div className="d-flex justify-content-between text-primary">
                                                                  <span>(+) DEPOSITOS:</span>
                                                                  <span>{f(selectedEmpleado.total_depositos || 0)}</span>
                                                               </div>
                                                            </div>
                                                            
                                                            <div className="border-top border-dashed my-2 pt-2 d-flex justify-content-between align-items-center text-primary">
                                                               <span className="fw-bold text-uppercase">UTILIDAD TOTAL:</span>
                                                               <span className={`fw-bold ${Number(selectedEmpleado.utilidad_real || 0) + Number(selectedEmpleado.total_depositos || 0) < 0 ? 'text-danger' : ''}`} style={{fontSize: '16px'}}>
                                                                  {f(Number(selectedEmpleado.utilidad_real || 0) + Number(selectedEmpleado.total_depositos || 0))}
                                                               </span>
                                                            </div>

                                                            <div className="bg-light p-3 rounded-3 d-flex flex-column gap-2 border">
                                                               {Number(bonosNomina) > 0 && (
                                                                  <div className="d-flex justify-content-between align-items-center text-success">
                                                                     <span className="fw-bold">BONOS Y EXTRAS:</span>
                                                                     <span className="fw-bold">{f(bonosNomina)}</span>
                                                                  </div>
                                                               )}
                                                               <div className="d-flex justify-content-between align-items-center text-warning fw-bold">
                                                                  <span>(+) PROPINAS:</span>
                                                                  <span>{f(selectedEmpleado.total_propinas || 0)}</span>
                                                               </div>
                                                            </div>

                                                            <div className="border-top border-2 border-dark my-2 pt-3 d-flex justify-content-between align-items-center">
                                                               <span className="fw-900 text-uppercase" style={{fontSize: '14px', fontWeight: '900'}}>TOTAL DE PAGO:</span>
                                                               <h3 className={`fw-900 mb-0 ${(((Number(selectedEmpleado.utilidad_real || 0) + Number(selectedEmpleado.total_depositos || 0)) * comisionNomina) / 100) + (Number(bonosNomina) || 0) < 0 ? 'text-danger' : 'text-dark'}`} style={{fontWeight: '900'}}>
                                                                  {f((((Number(selectedEmpleado.utilidad_real || 0) + Number(selectedEmpleado.total_depositos || 0)) * comisionNomina) / 100) + (Number(bonosNomina) || 0))}
                                                               </h3>
                                                            </div>
                                                         </div>

                                                         {/* Botón de Emitir / Firma Admin */}
                                                         {(() => {
                                                            const { inicio, fin } = getRangoFechas();
                                                            const periodoActual = `${inicio} — ${fin}`;
                                                            const empId = String(selectedEmpleado.empleado_id || selectedEmpleado.vehiculo_asignado);

                                                            const ingresosBrutos = Number(selectedEmpleado.total_ingresos) || 0;
                                                            const gastosChofer   = (selectedEmpleado.detalles_ingresos || []).reduce((s, l) => s + (Number(l.gastos_total) || 0), 0);
                                                            const gastosMant     = (selectedEmpleado.detalles_costos_operativos || []).reduce((s, c) => s + (Number(c.costo_total) || 0), 0);
                                                            const gastosTaller   = (selectedEmpleado.detalles_mantenimiento || []).reduce((s, m) => s + (Number(m.costo_total) || 0), 0);
                                                            const utilidadTotal  = (Number(selectedEmpleado.utilidad_real) || 0) + (Number(selectedEmpleado.total_depositos) || 0);
                                                            const propinas       = Number(selectedEmpleado.total_propinas) || 0;
                                                            const totalPago      = ((utilidadTotal * comisionNomina) / 100) + (Number(bonosNomina) || 0);

                                                            const ticketBase = {
                                                               empleadoId: empId, periodo: periodoActual,
                                                               ingresosBrutos, gastosChofer,
                                                               gastosMantenimiento: gastosMant, gastosTaller,
                                                               depositos: Number(selectedEmpleado.total_depositos) || 0,
                                                               utilidadTotal, bonosExtras: Number(bonosNomina) || 0,
                                                               propinas, totalPago,
                                                               reciboId: 'CC-' + Date.now().toString(36).toUpperCase()
                                                            };

                                                            if (showAdminSig) return (
                                                               <div className="mt-4 rounded-3 p-3" style={{background:'#f8fafc', border:'1.5px solid #e2e8f0'}}>
                                                                  <p className="fw-bold mb-2 d-flex align-items-center gap-2" style={{fontSize:13, color:'#0f172a'}}>
                                                                     <span style={{fontSize:16}}>✍️</span> Firma del Administrador
                                                                  </p>
                                                                  <p className="text-muted mb-2" style={{fontSize:11}}>Firma para autorizar este corte de caja</p>
                                                                  <div className="rounded-3 overflow-hidden mb-3 bg-white" style={{border:'1.5px solid #cbd5e1', height:130}}>
                                                                     <SignatureCanvas ref={sigAdminRef} penColor="#0f172a"
                                                                        canvasProps={{style:{width:'100%',height:'100%'}}} />
                                                                  </div>
                                                                  <div className="d-flex gap-2">
                                                                     <button className="btn btn-sm rounded-pill px-3 flex-grow-1"
                                                                        style={{background:'#f1f5f9',color:'#475569',border:'none',fontSize:12}}
                                                                        onClick={() => sigAdminRef.current?.clear()}>
                                                                        Limpiar
                                                                     </button>
                                                                     <button className="btn btn-sm rounded-pill px-3 flex-grow-1"
                                                                        style={{background:'#f1f5f9',color:'#475569',border:'none',fontSize:12}}
                                                                        onClick={() => setShowAdminSig(false)}>
                                                                        Cancelar
                                                                     </button>
                                                                     <button className="btn btn-sm rounded-pill px-3 fw-bold flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                                                                        style={{background:'#0f172a',color:'#fff',border:'none',fontSize:12}}
                                                                        onClick={async () => {
                                                                           if (!sigAdminRef.current || sigAdminRef.current.isEmpty()) {
                                                                              alert('Debes firmar antes de emitir el corte.');
                                                                              return;
                                                                           }
                                                                           const firma_admin = sigAdminRef.current.getCanvas().toDataURL('image/png');
                                                                           const ok = await handleSaveTicket({ ...ticketBase, firma_admin });
                                                                           if (ok) { setShowAdminSig(false); setShowHistory(true); }
                                                                        }}>
                                                                        <CheckCircle size={13}/> Confirmar y Emitir
                                                                     </button>
                                                                  </div>
                                                               </div>
                                                            );

                                                            return (
                                                               <button className="btn btn-dark w-100 mt-4 py-3 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-lg"
                                                                  onClick={() => setShowAdminSig(true)}>
                                                                  <FileText size={18}/> Generar Corte de Caja
                                                               </button>
                                                            );
                                                         })()}

                                                         {/* Pie de Ticket */}
                                                         <div className="mt-4 text-center opacity-40">
                                                            <div className="mb-2" style={{borderTop: '1px dashed #000'}}></div>
                                                            <small className="font-monospace d-block" style={{fontSize: '9px'}}>SISTEMA DE GESTIÓN INITEK — {new Date().toLocaleString()}</small>
                                                            <small className="font-monospace" style={{fontSize: '8px'}}>ID RECIBO: {Math.random().toString(36).substr(2, 9).toUpperCase()}</small>
                                                         </div>
                                                      </div>
                                                   </div>
                                                </div>
                                             )}
                                          </div>
                                          );
                                       })()
                                       }
                                    </div>
                                 )}
                            </div>
                         </div>
                    </div>
                   ) : (
                    <div className="card border-0 shadow-sm rounded-4 h-100 d-flex flex-column justify-content-center align-items-center bg-white p-5 animate__animated animate__fadeIn">
                      <div className="bg-light rounded-circle p-4 mb-4">
                        <Users size={48} className="text-muted opacity-50" />
                      </div>
                      <h5 className="fw-bold text-center">Selecciona un Colaborador</h5>
                      <p className="text-muted text-center small" style={{ maxWidth: '300px' }}>
                        Haz clic en un empleado de la lista para ver su rendimiento financiero detallado.
                      </p>
                    </div>
                   )}
                </div>
             </div>
          )}
          {activeMainTab === 'autos' && <TabAutos data={data} />}

        </div>
      ) : (
        <div className="text-center py-5 text-muted">No se pudo cargar la información.</div>
      )}
      </div>

      <StatusModal 
        status={statusTransfer} 
        onClose={() => setStatusTransfer({ ...statusTransfer, show: false })} 
      />

      <ReciboOperadorModal 
          isOpen={showReciboModal}
          onClose={() => setShowReciboModal(false)}
          empleado={selectedEmpleadoRecibo}
          adminId={data?.admin_id || 1}
          onSaveSuccess={() => fetchData()}
      />
      <HistorialRecibosModal 
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          empleado={selectedEmpleadoHistory}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .glass-card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); }
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.08) !important; }
        .fw-extrabold { font-weight: 800; }
        .tracking-widest { letter-spacing: 2px; }

        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          height: 0px;
          background: transparent;
        }
        .custom-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </div>
  );
};

export default DashboardFinanciero;
