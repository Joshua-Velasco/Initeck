import { useState, useEffect } from 'react';
import {
  DollarSign, Activity, AlertTriangle, CheckCircle,
  Clock, Shield, TrendingUp, ChevronLeft, ChevronRight
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { API_URL } from '../config';

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const Finanzas = () => {
  const hoy        = new Date();
  const [mesVista, setMesVista]       = useState(hoy.getMonth() + 1);   // 1–12
  const [anioVista, setAnioVista]     = useState(hoy.getFullYear());

  const [eliteStats,   setEliteStats]   = useState({ summary: null, history: [] });
  const [futureStats,  setFutureStats]  = useState({ summary: null, history: [] });
  const [cobrosMes,    setCobrosMes]    = useState(null);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'confirm', title: '', message: '', onConfirm: null });

  const showConfirm = (title, message, onConfirm, type = 'warning') =>
    setModalConfig({ isOpen: true, title, message, onConfirm, type });

  const showAlert = (title, message, type = 'info') =>
    setModalConfig({ isOpen: true, title, message, onConfirm: null, type });

  const fetchData = (mes = mesVista, anio = anioVista) => {
    fetch(`${API_URL}/api/module-stats?type=ELITE`)
      .then(r => r.json()).then(d => { if (d?.summary) setEliteStats(d); })
      .catch(console.error);

    fetch(`${API_URL}/api/module-stats?type=FUTURE`)
      .then(r => r.json()).then(d => { if (d?.summary) setFutureStats(d); })
      .catch(console.error);

    fetch(`${API_URL}/api/cobros-mes?mes=${mes}&anio=${anio}`)
      .then(r => r.json()).then(d => { if (d?.mes) setCobrosMes(d); })
      .catch(console.error);
  };

  useEffect(() => { fetchData(mesVista, anioVista); }, [mesVista, anioVista]);

  const cambiarMes = (delta) => {
    let nuevo_mes  = mesVista + delta;
    let nuevo_anio = anioVista;
    if (nuevo_mes > 12) { nuevo_mes = 1;  nuevo_anio++; }
    if (nuevo_mes < 1)  { nuevo_mes = 12; nuevo_anio--; }
    setMesVista(nuevo_mes);
    setAnioVista(nuevo_anio);
  };

  const esMesActual = mesVista === hoy.getMonth() + 1 && anioVista === hoy.getFullYear();

  const handleCorteDeMes = async () => {
    // Primero obtener vista previa
    try {
      const preview = await fetch(`${API_URL}/api/corte?mes=${mesVista}&anio=${anioVista}`).then(r => r.json());
      const mensaje = preview.total_afectados > 0
        ? `Se suspenderán ${preview.total_afectados} clientes que no han pagado en ${MESES[mesVista - 1]} ${anioVista}:\n\n` +
          preview.afectados.slice(0, 8).map(a => `· ${a.nombre} (${a.tipo_servicio})`).join('\n') +
          (preview.total_afectados > 8 ? `\n· ...y ${preview.total_afectados - 8} más` : '') +
          '\n\n¿Confirmar corte?'
        : `No hay clientes sin pago en ${MESES[mesVista - 1]} ${anioVista}. No se suspenderá nadie.\n¿Ejecutar de todas formas?`;

      showConfirm(
        `Corte de ${MESES[mesVista - 1]} ${anioVista}`,
        mensaje,
        async () => {
          try {
            const res  = await fetch(`${API_URL}/api/corte`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mes: mesVista, anio: anioVista })
            });
            const data = await res.json();
            if (res.ok) {
              showAlert(
                'Corte Realizado',
                `${data.message}\n\nSuspendidos: ${data.datos.suspendidos}\nIngreso del mes: $${parseFloat(data.datos.ingreso_corte).toFixed(2)}`,
                'success'
              );
              fetchData(mesVista, anioVista);
            } else {
              showAlert('Error', data.error || 'No se pudo procesar el corte', 'error');
            }
          } catch { showAlert('Error', 'Error de conexión al procesar el corte', 'error'); }
        },
        'warning'
      );
    } catch { showAlert('Error', 'No se pudo obtener la vista previa del corte', 'error'); }
  };

  // Calcular totales del mes seleccionado
  const totalCobrado  = cobrosMes?.cobrado?.reduce((sum, r) => sum + parseFloat(r.total_cobrado || 0), 0) ?? 0;
  const totalPendiente= cobrosMes?.pendiente?.reduce((sum, r) => sum + parseFloat(r.total_pendiente || 0), 0) ?? 0;
  const cantCobrada   = cobrosMes?.cobrado?.reduce((sum, r) => sum + parseInt(r.cantidad_cobrada || 0), 0) ?? 0;
  const cantPendiente = cobrosMes?.pendiente?.reduce((sum, r) => sum + parseInt(r.cantidad_pendiente || 0), 0) ?? 0;
  const totalEsperado = totalCobrado + totalPendiente;
  const porcentajeCobrado = totalEsperado > 0 ? Math.round((totalCobrado / totalEsperado) * 100) : 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="header glass-panel" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 2rem', flexWrap: 'wrap' }}>
        <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '0.75rem', borderRadius: '12px' }}>
          <DollarSign size={28} />
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Salud Financiera</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Cobros y estado financiero por mes</p>
        </div>

        {/* Selector de mes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-panel)', borderRadius: '12px', padding: '0.5rem 0.75rem', border: '1px solid var(--border)' }}>
          <button className="btn btn-ghost btn-icon-only" onClick={() => cambiarMes(-1)} style={{ padding: '0.25rem' }}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontWeight: 700, minWidth: '140px', textAlign: 'center', fontSize: '0.9rem' }}>
            {MESES[mesVista - 1]} {anioVista}
            {esMesActual && <span style={{ marginLeft: '0.4rem', fontSize: '0.65rem', background: 'var(--primary)', color: '#fff', borderRadius: '999px', padding: '0.1rem 0.4rem' }}>HOY</span>}
          </span>
          <button className="btn btn-ghost btn-icon-only" onClick={() => cambiarMes(1)} style={{ padding: '0.25rem' }} disabled={esMesActual}>
            <ChevronRight size={18} />
          </button>
        </div>

        {esMesActual && (
          <button
            className="btn btn-danger"
            onClick={handleCorteDeMes}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}
          >
            <AlertTriangle size={20} />
            Ejecutar Corte
          </button>
        )}
      </div>

      {/* Tarjetas resumen del mes */}
      {cobrosMes && (
        <div className="dashboard-grid" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="card stat-card glass-panel">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)', color: '#fff' }}>
              <CheckCircle size={24} />
            </div>
            <div className="stat-details">
              <h3>Total Cobrado</h3>
              <p className="stat-value">${totalCobrado.toFixed(2)}</p>
              <span className="stat-label" style={{ color: '#10b981' }}>{cantCobrada} clientes</span>
            </div>
          </div>

          <div className="card stat-card glass-panel">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#fff' }}>
              <Clock size={24} />
            </div>
            <div className="stat-details">
              <h3>Por Cobrar</h3>
              <p className="stat-value">${totalPendiente.toFixed(2)}</p>
              <span className="stat-label" style={{ color: '#f59e0b' }}>{cantPendiente} pendientes</span>
            </div>
          </div>

          <div className="card stat-card glass-panel">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}>
              <TrendingUp size={24} />
            </div>
            <div className="stat-details">
              <h3>Esperado total</h3>
              <p className="stat-value">${totalEsperado.toFixed(2)}</p>
              <span className="stat-label">{porcentajeCobrado}% cobrado</span>
            </div>
          </div>

          <div className="card stat-card glass-panel">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--primary), #a855f7)', color: '#fff' }}>
              <Shield size={24} />
            </div>
            <div className="stat-details">
              <h3>VIPs pendientes</h3>
              <p className="stat-value">{cobrosMes.vip_pendientes}</p>
              <span className="stat-label">sin corte de servicio</span>
            </div>
          </div>
        </div>
      )}

      {/* Barra de progreso de cobros */}
      {cobrosMes && totalEsperado > 0 && (
        <div className="card glass-panel" style={{ marginBottom: '2rem', padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Avance de cobros — {MESES[mesVista - 1]} {anioVista}</span>
            <span style={{ fontWeight: 700, color: porcentajeCobrado >= 80 ? '#10b981' : porcentajeCobrado >= 50 ? '#f59e0b' : '#ef4444' }}>
              {porcentajeCobrado}%
            </span>
          </div>
          <div style={{ height: '10px', background: 'var(--bg-panel)', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{
              height: '100%',
              width: `${porcentajeCobrado}%`,
              background: porcentajeCobrado >= 80
                ? 'linear-gradient(90deg, #10b981, #3b82f6)'
                : porcentajeCobrado >= 50
                  ? 'linear-gradient(90deg, #f59e0b, #f97316)'
                  : 'linear-gradient(90deg, #ef4444, #f97316)',
              borderRadius: '999px',
              transition: 'width 0.6s ease'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ color: '#10b981' }}>Cobrado: ${totalCobrado.toFixed(2)}</span>
            <span style={{ color: '#f59e0b' }}>Pendiente: ${totalPendiente.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Clientes pendientes de cobro */}
      {cobrosMes?.lista_pendientes?.length > 0 && (
        <div className="card glass-panel" style={{ marginBottom: '2rem', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock size={18} style={{ color: '#f59e0b' }} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
              Pendientes de cobro — {MESES[mesVista - 1]} {anioVista}
            </h3>
            <span style={{ marginLeft: 'auto', background: '#f59e0b22', color: '#f59e0b', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem' }}>
              {cobrosMes.lista_pendientes.length} clientes
            </span>
          </div>
          <div className="table-container" style={{ margin: 0, border: 'none', background: 'transparent' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Vencimiento</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {cobrosMes.lista_pendientes.map((p, i) => {
                  const fechaRen = p.fecha_renovacion ? new Date(p.fecha_renovacion + 'T12:00:00') : null;
                  const hoyDate  = new Date(); hoyDate.setHours(0,0,0,0);
                  const dias     = fechaRen ? Math.ceil((fechaRen - hoyDate) / 86400000) : null;
                  return (
                    <tr key={i}>
                      <td>
                        <div className="user-info">
                          <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {p.nombre}
                            {p.vip && (
                              <span style={{ fontSize: '0.6rem', background: 'var(--primary)', color: '#fff', borderRadius: '999px', padding: '0.1rem 0.35rem', fontWeight: 700 }}>VIP</span>
                            )}
                          </span>
                          <span className="user-id">{p.no_cliente}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-active" style={{ fontSize: '0.75rem' }}>{p.tipo_servicio}</span>
                      </td>
                      <td>
                        <div className="user-info">
                          <span style={{ fontWeight: 500 }}>{fechaRen ? fechaRen.toLocaleDateString('es-MX') : 'N/A'}</span>
                          {dias !== null && (
                            <span style={{ fontSize: '0.72rem', color: dias < 0 ? '#ef4444' : dias <= 5 ? '#f59e0b' : 'var(--text-muted)' }}>
                              {dias < 0 ? `Venció hace ${Math.abs(dias)} días` : dias === 0 ? 'Vence hoy' : `${dias} días restantes`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        ${parseFloat(p.costo || 0).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {cobrosMes?.lista_pendientes?.length === 0 && cobrosMes && (
        <div className="card glass-panel" style={{ marginBottom: '2rem', padding: '2rem', textAlign: 'center' }}>
          <CheckCircle size={36} style={{ color: '#10b981', marginBottom: '0.75rem' }} />
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            ¡Todos los cobros al día!
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No hay clientes pendientes de pago en {MESES[mesVista - 1]} {anioVista}.
          </div>
        </div>
      )}

      {/* Historial por servicio */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>

        <div className="card" style={{ padding: '0' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ margin: 0, color: 'var(--primary)' }}>Historial Elite TV</h3>
            {eliteStats.summary && (
              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {eliteStats.summary.totalUsers} activos
              </span>
            )}
          </div>
          <div className="table-container" style={{ margin: 0, border: 'none', background: 'transparent' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Cobros</th>
                  <th>Ingreso real</th>
                </tr>
              </thead>
              <tbody>
                {eliteStats.history.map((hist, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{hist.mes_descriptivo || hist.mes}</td>
                    <td>{hist.cobrados}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: '600' }}>${parseFloat(hist.ingreso_mes).toFixed(2)}</td>
                  </tr>
                ))}
                {eliteStats.history.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No hay historial disponible.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ padding: '0' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={20} style={{ color: 'var(--accent)' }} />
            <h3 style={{ margin: 0, color: 'var(--accent)' }}>Historial Future TV</h3>
            {futureStats.summary && (
              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {futureStats.summary.totalUsers} activos
              </span>
            )}
          </div>
          <div className="table-container" style={{ margin: 0, border: 'none', background: 'transparent' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Cobros</th>
                  <th>Ingreso real</th>
                </tr>
              </thead>
              <tbody>
                {futureStats.history.map((hist, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{hist.mes_descriptivo || hist.mes}</td>
                    <td>{hist.cobrados}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: '600' }}>${parseFloat(hist.ingreso_mes).toFixed(2)}</td>
                  </tr>
                ))}
                {futureStats.history.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No hay historial disponible.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
};

export default Finanzas;
