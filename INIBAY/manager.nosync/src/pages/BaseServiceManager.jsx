import { useState, useEffect } from 'react';
import {
  Search, Plus, Trash2, Users, User, DollarSign, Calendar,
  Shield, CheckCircle, Clock, TrendingUp, XCircle, AlertCircle,
  History, CalendarPlus, Pencil
} from 'lucide-react';
import SubscriptionModal from '../components/SubscriptionModal';
import PagoModal from '../components/PagoModal';
import AdelantoModal from '../components/AdelantoModal';
import HistoryModal from '../components/HistoryModal';
import ConfirmModal from '../components/ConfirmModal';
import { API_URL } from '../config';

const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const BaseServiceManager = ({ serviceType, serviceName }) => {
  const [searchTerm, setSearchTerm]       = useState('');
  const [activeFilter, setActiveFilter]   = useState('Todos');
  const [clients, setClients]             = useState([]);
  const [stats, setStats]                 = useState({ summary: null, history: [] });
  const [sortKey, setSortKey]             = useState('nombre');
  const [sortOrder, setSortOrder]         = useState('asc'); // 'asc' or 'desc'

  const [isModalOpen, setIsModalOpen]           = useState(false);
  const [selectedClient, setSelectedClient]     = useState(null);

  const [isPagoModalOpen, setIsPagoModalOpen]             = useState(false);
  const [clientParaPago, setClientParaPago]               = useState(null);

  const [isAdelantoModalOpen, setIsAdelantoModalOpen]     = useState(false);
  const [clientParaAdelanto, setClientParaAdelanto]       = useState(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen]       = useState(false);
  const [clientParaHistorial, setClientParaHistorial]     = useState(null);

  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'confirm', title: '', message: '', onConfirm: null });

  const showConfirm = (title, message, onConfirm, type = 'confirm') =>
    setModalConfig({ isOpen: true, title, message, onConfirm, type });

  const showAlert = (title, message, type = 'info') =>
    setModalConfig({ isOpen: true, title, message, onConfirm: null, type });

  const fetchClients = () => {
    fetch(`${API_URL}/api/subscriptions?type=${serviceType}`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setClients(data); })
      .catch(err => console.error(`Error fetching ${serviceType} clients:`, err));
  };

  const fetchStats = () => {
    fetch(`${API_URL}/api/module-stats?type=${serviceType}`)
      .then(res => res.json())
      .then(data => { if (data?.summary) setStats(data); })
      .catch(err => console.error(`Error fetching ${serviceType} stats:`, err));
  };

  useEffect(() => {
    fetchClients();
    fetchStats();
  }, [serviceType]);

  const handleDelete = (id) => {
    showConfirm(
      '¿Eliminar Cliente?',
      '¿Seguro que deseas eliminar este servicio? Esta acción no se puede deshacer.',
      async () => {
        try {
          const res = await fetch(`${API_URL}/api/subscriptions/${id}`, { method: 'DELETE' });
          if (res.ok) {
            fetchClients();
            fetchStats();
            showAlert('Éxito', 'Cliente eliminado correctamente', 'success');
          } else {
            showAlert('Error', 'Error al eliminar. Revisa la conexión.', 'error');
          }
        } catch { showAlert('Error', 'Error de conexión al eliminar', 'error'); }
      },
      'warning'
    );
  };

  const openPagoModal = (client) => {
    setClientParaPago(client);
    setIsPagoModalOpen(true);
  };

  const openAdelantoModal = (client) => {
    setClientParaAdelanto(client);
    setIsAdelantoModalOpen(true);
  };

  const openHistoryModal = (client) => {
    setClientParaHistorial(client);
    setIsHistoryModalOpen(true);
  };

  const handleSavePago = async (pagoData) => {
    try {
      const res  = await fetch(`${API_URL}/api/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pagoData)
      });
      const data = await res.json();

      if (res.ok) {
        setIsPagoModalOpen(false);
        setClientParaPago(null);

        // Actualización inmediata del cliente en la tabla (sin esperar al fetch)
        const nuevaFechaReno = data.nueva_fecha_renovacion;
        const hoy = new Date();
        const mesActual  = hoy.getMonth() + 1;
        const anioActual = hoy.getFullYear();
        const mesesRegistrados = (data.meses_detalle || []).map(m => m.mes);

        setClients(prev => prev.map(c => {
          if (c.id !== pagoData.suscripcion_id) return c;
          const mesesPagadosAnio = Array.from(new Set([...(c.meses_pagados_anio || []), ...mesesRegistrados])).sort((a, b) => a - b);
          const diasParaVencer = nuevaFechaReno
            ? Math.round((new Date(nuevaFechaReno + 'T12:00:00') - hoy) / 86400000)
            : c.dias_para_vencer;
          return {
            ...c,
            fecha_renovacion:   nuevaFechaReno,
            pagado_este_mes:    mesesRegistrados.includes(mesActual) || c.pagado_este_mes,
            meses_pagados_anio: mesesPagadosAnio,
            dias_para_vencer:   diasParaVencer,
            estatus:            true,
          };
        }));

        fetchClients();  // refresco completo en segundo plano
        fetchStats();

        const nuevaFechaStr = nuevaFechaReno
          ? new Date(nuevaFechaReno + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
          : '—';
        showAlert(
          'Pago Registrado',
          `${data.message || `Pago de $${pagoData.monto.toFixed(2)} registrado`}\nVigente hasta: ${nuevaFechaStr}`,
          'success'
        );
      } else {
        showAlert('Error', data.error || 'No se pudo registrar el pago', 'error');
      }
    } catch { showAlert('Error', 'Error de conexión al registrar pago', 'error'); }
  };

  const handleSaveAdelanto = async (pagoData) => {
    try {
      const res  = await fetch(`${API_URL}/api/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pagoData),
      });
      const data = await res.json();

      if (res.ok) {
        setIsAdelantoModalOpen(false);
        setClientParaAdelanto(null);

        const nuevaFechaReno   = data.nueva_fecha_renovacion;
        const hoy              = new Date();
        const mesesRegistrados = (data.meses_detalle || []).map(m => m.mes);

        setClients(prev => prev.map(c => {
          if (c.id !== pagoData.suscripcion_id) return c;
          const mesesPagadosAnio = Array.from(
            new Set([...(c.meses_pagados_anio || []), ...mesesRegistrados])
          ).sort((a, b) => a - b);
          const diasParaVencer = nuevaFechaReno
            ? Math.round((new Date(nuevaFechaReno + 'T12:00:00') - hoy) / 86400000)
            : c.dias_para_vencer;
          return { ...c, fecha_renovacion: nuevaFechaReno, meses_pagados_anio: mesesPagadosAnio, dias_para_vencer: diasParaVencer, estatus: true };
        }));

        fetchClients();
        fetchStats();

        const nuevaFechaStr = nuevaFechaReno
          ? new Date(nuevaFechaReno + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
          : '—';
        showAlert('Adelanto Registrado', `${data.message}\nVigente hasta: ${nuevaFechaStr}`, 'success');
      } else {
        // Throw so AdelantoModal can catch and display the error
        const errorMsg = data.error || 'No se pudo registrar el adelanto';
        showAlert('Error', errorMsg, 'error');
        throw new Error(errorMsg);
      }
    } catch (err) {
      if (!err.message?.includes('No se pudo')) {
        showAlert('Error', 'Error de conexión al registrar adelanto', 'error');
      }
      throw err; // Re-throw so AdelantoModal's catch block can handle it
    }
  };

  const handleSave = async (formData) => {
    try {
      const isEditing = !!selectedClient;
      const url    = isEditing ? `${API_URL}/api/subscriptions/${selectedClient.id}` : `${API_URL}/api/subscriptions`;
      const data   = { ...formData, tipo_servicio: serviceType };

      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setSelectedClient(null);
        fetchClients();
        fetchStats();
        showAlert('Éxito', isEditing ? 'Cliente actualizado' : 'Cliente guardado', 'success');
      } else {
        showAlert('Error', 'Error al guardar cliente. Posible ID duplicado o datos inválidos.', 'error');
      }
    } catch { showAlert('Error', 'Error de conexión', 'error'); }
  };

  // Estado basado en datos reales de la BD
  // VIP: siempre activo (nunca se suspende), pero sí tiene fecha de cobro
  const getStatusInfo = (client) => {
    if (client.vip) return { label: 'VIP', class: 'badge-active', dot: 'status-active' };
    if (!client.estatus) return { label: 'VENCIDO', class: 'badge-inactive', dot: 'status-expired' };
    const dias = client.dias_para_vencer;
    if (dias !== null && dias < 0)  return { label: 'VENCIDO', class: 'badge-inactive', dot: 'status-expired' };
    if (dias !== null && dias <= 7) return { label: 'POR VENCER', class: 'badge-demo', dot: 'status-warning' };
    return { label: 'VIGENTE', class: 'badge-active', dot: 'status-active' };
  };

  // Estado de cobro — basado SOLO en pagos explícitos
  const getPaymentStatus = (client) => {
    // Solo consideramos pagado si hay registro explícito en BD
    if (client.pagado_este_mes) return { label: 'PAGADO', class: 'badge-paid' };
    if (!client.estatus)        return { label: 'SUSPENDIDO', class: 'badge-inactive' };
    const dias = client.dias_para_vencer;
    if (client.vip)                         return { label: 'PENDIENTE', class: 'badge-pending' };
    if (dias !== null && dias <= 5)         return { label: 'URGENTE', class: 'badge-pending' };
    return { label: 'PENDIENTE', class: 'badge-pending' };
  };

  const processedData = clients.map(client => {
    const status = getStatusInfo(client);
    const dias   = client.dias_para_vencer;

    // Deuda: solo si expiró (dias < 0). Si aún está vigente (dias >= 0) o no
    // tiene fecha_renovacion, no hay deuda aunque no haya registro explícito.
    // NOTA: pagado_este_mes ahora solo es true si hay registro explícito en BD.
    const mesesDeuda = !client.pagado_este_mes
      ? (dias !== null && dias < 0 ? Math.max(1, Math.ceil(Math.abs(dias) / 30)) : 0)
      : 0;
    const deudaTotal = mesesDeuda * parseFloat(client.costo || 0);

    return { ...client, status, mesesDeuda, deudaTotal };
  });

  const filteredData = processedData.filter(client => {
    const matchesSearch =
      (client.nombre     || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.no_cliente || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    switch (activeFilter) {
      case 'Vigentes':          return client.status.label === 'VIGENTE' || client.status.label === 'POR VENCER' || client.status.label === 'VIP';
      case 'Por vencer':        return client.status.label === 'POR VENCER' || (client.dias_para_vencer !== null && client.dias_para_vencer <= 7 && client.dias_para_vencer >= 0);
      case 'Vencidos':          return client.status.label === 'VENCIDO';
      case 'VIPs':              return client.vip;
      case 'Sin pagar':        return !client.pagado_este_mes && client.estatus;
      default: return true;
    }
  });

  const sortedData = [...filteredData].sort((a, b) => {
    let valA, valB;

    switch (sortKey) {
      case 'no_cliente':   valA = a.no_cliente; valB = b.no_cliente; break;
      case 'nombre':       valA = a.nombre; valB = b.nombre; break;
      case 'dispositivo':  valA = a.equipo_1 || ''; valB = b.equipo_1 || ''; break;
      case 'fecha_corte':  valA = a.fecha_renovacion || ''; valB = b.fecha_renovacion || ''; break;
      case 'adeudo':       valA = a.deudaTotal; valB = b.deudaTotal; break;
      case 'estado':       valA = a.pagado_este_mes ? 1 : 0; valB = b.pagado_este_mes ? 1 : 0; break;
      default:             valA = a.nombre; valB = b.nombre;
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const sinPagarCount = clients.filter(c => !c.pagado_este_mes && c.estatus).length;

  return (
    <div className="animate-fade-in">
      {/* Barra de acciones */}
      <div className="action-bar glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Gestión {serviceName}
            </h1>
            <button className="btn btn-primary" onClick={() => { setSelectedClient(null); setIsModalOpen(true); }}>
              <Plus size={18} />
              <span>Nuevo Cliente</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder={`Buscar en ${serviceName}...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="segmented-control">
              {['Todos', 'Vigentes', 'Por vencer', 'Vencidos', 'Sin pagar', 'VIPs'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`segment-item ${activeFilter === filter ? 'active' : ''}`}
                  style={filter === 'Sin pagar' && sinPagarCount > 0 ? { position: 'relative' } : {}}
                >
                  {filter}
                  {filter === 'Sin pagar' && sinPagarCount > 0 && (
                    <span style={{
                      marginLeft: '0.35rem',
                      background: 'var(--danger)',
                      color: '#fff',
                      borderRadius: '999px',
                      fontSize: '0.65rem',
                      padding: '0 0.4rem',
                      fontWeight: 700,
                      lineHeight: '1.4'
                    }}>{sinPagarCount}</span>
                  )}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>ORDENAR:</span>
              <select 
                className="form-control" 
                style={{ width: '180px', height: '40px', fontSize: '0.85rem' }}
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
              >
                <option value="nombre">Nombre</option>
                <option value="no_cliente">Nº Cliente</option>
                <option value="dispositivo">Dispositivo</option>
                <option value="fecha_corte">Fecha de Corte</option>
                <option value="adeudo">Adeudo</option>
                <option value="estado">Estado Pago</option>
              </select>
              <button 
                className="btn btn-secondary btn-icon-only" 
                style={{ height: '40px', width: '40px' }}
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                title={sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      {stats.summary && (
        <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
          <div className="card stat-card glass-panel">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--primary), #a855f7)', color: 'var(--primary-text)' }}>
              <Users size={24} />
            </div>
            <div className="stat-details">
              <h3>Suscriptores Activos</h3>
              <p className="stat-value">{stats.summary.totalUsers}</p>
              <span className="stat-label">{stats.summary.currentMonth}</span>
            </div>
          </div>

          <div className="card stat-card glass-panel">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)', color: '#fff' }}>
              <CheckCircle size={24} />
            </div>
            <div className="stat-details">
              <h3>Pagado este mes</h3>
              <p className="stat-value">${fmt(stats.summary.cobrado_mes)}</p>
              <span className="stat-label" style={{ color: '#10b981' }}>
                {stats.summary.cobrados_count} pagados
              </span>
            </div>
          </div>

          <div className="card stat-card glass-panel">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#fff' }}>
              <Clock size={24} />
            </div>
            <div className="stat-details">
              <h3>Pendiente de pago</h3>
              <p className="stat-value">${fmt(stats.summary.monto_pendiente)}</p>
              <span className="stat-label" style={{ color: '#f59e0b' }}>
                {stats.summary.pendientes_count} clientes
              </span>
            </div>
          </div>

          <div className="card stat-card glass-panel">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}>
              <TrendingUp size={24} />
            </div>
            <div className="stat-details">
              <h3>Proyección mensual</h3>
              <p className="stat-value">${fmt(stats.summary.totalIncome)}</p>
              <span className="stat-label">si todos pagan</span>
            </div>
          </div>

          <div
            className="card stat-card glass-panel"
            style={{ cursor: stats.summary.vencidos_count > 0 ? 'pointer' : 'default' }}
            onClick={() => stats.summary.vencidos_count > 0 && setActiveFilter('Vencidos')}
            title="Ver vencidos"
          >
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#fff' }}>
              <AlertCircle size={24} />
            </div>
            <div className="stat-details">
              <h3>Con fecha vencida</h3>
              <p className="stat-value" style={{ color: stats.summary.vencidos_count > 0 ? 'var(--danger)' : 'inherit' }}>
                {stats.summary.vencidos_count}
              </p>
              <span className="stat-label">activos, renovación pasada</span>
            </div>
          </div>

          <div
            className="card stat-card glass-panel"
            style={{ cursor: stats.summary.inactivos_count > 0 ? 'pointer' : 'default' }}
            onClick={() => stats.summary.inactivos_count > 0 && setActiveFilter('Vencidos')}
            title="Ver inactivos/suspendidos"
          >
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #64748b, #334155)', color: '#fff' }}>
              <XCircle size={24} />
            </div>
            <div className="stat-details">
              <h3>Inactivos / Suspendidos</h3>
              <p className="stat-value" style={{ color: stats.summary.inactivos_count > 0 ? '#94a3b8' : 'inherit' }}>
                {stats.summary.inactivos_count}
              </p>
              <span className="stat-label">servicio cortado</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <main className="glass-panel" style={{ overflow: 'hidden', borderRadius: '20px' }}>
        <div className="table-container" style={{ margin: 0, border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  Cliente
                  {sortedData.length > 0 && (
                    <span className="table-header-count">{sortedData.length}</span>
                  )}
                </th>
                <th>Servicio</th>
                <th>Vencimiento</th>
                <th>Pagos {new Date().getFullYear()}</th>
                <th>Adeudo</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map(client => {
                const payStatus  = getPaymentStatus(client);
                const expiryDate = client.fecha_renovacion ? new Date(client.fecha_renovacion + 'T12:00:00') : null;
                const dias       = client.dias_para_vencer;

                return (
                  <tr key={client.id} className={client.vip ? 'vip-row' : ''}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar" style={{ background: client.vip ? 'var(--primary)' : 'var(--bg-panel)' }}>
                          {client.vip ? <Shield size={16} color="var(--primary-text)" /> : <User size={16} />}
                        </div>
                        <div className="user-info">
                          <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {client.nombre}
                            {client.vip && <Shield size={14} style={{ color: 'var(--primary)' }} title="VIP" />}
                          </span>
                          <span className="user-id">{client.no_cliente}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {client.equipo_1 ? (
                          <span className="badge-device">{client.equipo_1}</span>
                        ) : (
                          <em style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No asignado</em>
                        )}
                        {client.equipo_2 && (
                          <span className="badge-device" style={{ opacity: 0.8, fontSize: '0.63rem' }}>
                            2: {client.equipo_2}
                          </span>
                        )}
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '1px' }}>
                          ${parseFloat(client.costo || 0).toFixed(0)}/mes
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="user-info">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                          <Calendar size={14} />
                          {expiryDate ? expiryDate.toLocaleDateString('es-MX') : 'Sin fecha'}
                        </span>
                        {dias !== null && (
                          <span style={{ fontSize: '0.75rem', color: dias < 0 ? 'var(--danger)' : dias <= 7 ? 'var(--warning)' : 'var(--text-muted)' }}>
                            {client.vip
                              ? (dias < 0 ? `Pago hace ${Math.abs(dias)} días` : dias === 0 ? 'Pago hoy' : `Pago en ${dias} días`)
                              : (dias < 0 ? `Venció hace ${Math.abs(dias)} días` : dias === 0 ? 'Vence hoy' : `Vence en ${dias} días`)
                            }
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {(() => {
                        const INICIALES   = ['E','F','M','A','M','J','J','A','S','O','N','D'];
                        const MESES_NOMBRE= ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
                        const hoy         = new Date();
                        const mesActual   = hoy.getMonth() + 1;
                        const anioActual  = hoy.getFullYear();
                        const pagados     = new Set(client.meses_pagados_anio || []);

                        // Mes desde el que aplica el historial (1 si el usuario es de años anteriores)
                        let mesInicio = 1;
                        if (client.fecha_activacion) {
                          const activ = new Date(client.fecha_activacion + 'T12:00:00');
                          if (activ.getFullYear() === anioActual) {
                            mesInicio = activ.getMonth() + 1;
                          }
                        }

                        return (
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {INICIALES.map((inicial, i) => {
                              const mes            = i + 1;
                              const pagado         = pagados.has(mes);
                              const esFuturo       = mes > mesActual;
                              const esActual       = mes === mesActual;
                              const antesDeExistir = mes < mesInicio;

                              const label = antesDeExistir ? 'Usuario no existía aún'
                                          : pagado         ? 'Pagado'
                                          : esFuturo       ? 'Mes futuro'
                                          :                  'Sin pago';

                              return (
                                <div
                                  key={mes}
                                  title={`${MESES_NOMBRE[i]}: ${label}`}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '3px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.5rem',
                                    fontWeight: 800,
                                    cursor: 'default',
                                    background: antesDeExistir ? 'rgba(100,116,139,0.08)'
                                              : pagado         ? 'rgba(16,185,129,0.85)'
                                              : esFuturo       ? 'transparent'
                                              :                  'rgba(239,68,68,0.15)',
                                    color: antesDeExistir ? 'rgba(100,116,139,0.35)'
                                         : pagado         ? '#fff'
                                         : esFuturo       ? 'var(--text-muted)'
                                         :                  '#ef4444',
                                    border: esActual && !antesDeExistir
                                      ? '1px solid var(--primary)'
                                      : antesDeExistir ? '1px solid rgba(100,116,139,0.15)'
                                      : pagado         ? 'none'
                                      : esFuturo       ? '1px dashed rgba(100,100,100,0.3)'
                                      :                  '1px solid rgba(239,68,68,0.35)',
                                  }}
                                >
                                  {antesDeExistir ? '' : inicial}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </td>
                    <td>
                      {client.deudaTotal > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.92rem' }}>
                            ${fmt(client.deudaTotal)}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'rgba(239,68,68,0.75)' }}>
                            {client.mesesDeuda} {client.mesesDeuda === 1 ? 'mes' : 'meses'} vencido{client.mesesDeuda !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span className={`status-dot ${client.status.dot}`} style={{ flexShrink: 0 }} />
                        <span className={`badge ${client.status.class}`} style={{ fontSize: '0.65rem' }}>
                          {client.status.label}
                        </span>
                        <span className={`badge ${payStatus.class}`} style={{ fontSize: '0.65rem' }}>
                          {payStatus.label}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                        {/* Icon group: History, Edit */}
                        <button
                          className="btn btn-sm btn-ghost btn-icon-only"
                          onClick={() => openHistoryModal(client)}
                          title="Ver historial de pagos"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <History size={15} />
                        </button>
                        <button
                          className="btn btn-sm btn-ghost btn-icon-only"
                          onClick={() => { setSelectedClient(client); setIsModalOpen(true); }}
                          title="Editar cliente"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <Pencil size={15} />
                        </button>

                        {/* Separator */}
                        <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 2px', flexShrink: 0 }} />

                        {/* Pago — desactivado visualmente si ya está pagado con registro explícito */}
                        {client.pagado_este_mes ? (
                          <span
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                              padding: '0.3rem 0.6rem', fontSize: '0.78rem', fontWeight: 600,
                              borderRadius: '8px',
                              background: 'rgba(16,185,129,0.1)',
                              color: '#10b981',
                              border: '1px solid rgba(16,185,129,0.3)',
                              cursor: 'default',
                              userSelect: 'none',
                            }}
                          >
                            <CheckCircle size={13} /> Pagado
                          </span>
                        ) : (
                          <button
                            className="btn btn-sm"
                            style={{
                              background: client.vip
                                ? 'linear-gradient(135deg, var(--primary), #a855f7)'
                                : 'linear-gradient(135deg, #10b981, #3b82f6)',
                              color: '#fff',
                              border: 'none',
                              gap: '0.3rem',
                              padding: '0.3rem 0.6rem',
                              fontSize: '0.78rem',
                            }}
                            onClick={() => openPagoModal({ ...client, mesesDeuda: client.mesesDeuda, deudaTotal: client.deudaTotal })}
                            title={client.vip ? 'Registrar pago VIP' : 'Registrar pago'}
                          >
                            <DollarSign size={13} /> Pagar
                          </button>
                        )}

                        {/* Adelanto — abre AdelantoModal para seleccionar meses futuros */}
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => openAdelantoModal(client)}
                          title="Registrar pago adelantado"
                          style={{ gap: '0.3rem', padding: '0.3rem 0.6rem', fontSize: '0.78rem', color: 'var(--primary)', borderColor: 'rgba(99,102,241,0.3)' }}
                        >
                          <CalendarPlus size={13} />
                          Adelanto
                        </button>

                        {/* Delete */}
                        <button
                          className="btn btn-sm btn-ghost btn-icon-only"
                          onClick={() => handleDelete(client.id)}
                          title="Eliminar cliente"
                          style={{ color: 'var(--danger)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sortedData.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    {activeFilter === 'Sin pagar'
                      ? '¡Todos los clientes están al corriente con sus pagos!'
                      : 'No se encontraron clientes.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>Mostrando {sortedData.length} de {clients.length} registros</span>
          </div>
        </div>
      </main>

      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        clientData={selectedClient}
        tipoServicio={serviceType}
      />

      <PagoModal
        isOpen={isPagoModalOpen}
        onClose={() => { setIsPagoModalOpen(false); setClientParaPago(null); }}
        onSave={handleSavePago}
        client={clientParaPago}
      />

      <AdelantoModal
        isOpen={isAdelantoModalOpen}
        onClose={() => { setIsAdelantoModalOpen(false); setClientParaAdelanto(null); }}
        onSave={handleSaveAdelanto}
        client={clientParaAdelanto}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => { setIsHistoryModalOpen(false); setClientParaHistorial(null); }}
        client={clientParaHistorial}
        onSuccess={() => { fetchClients(); fetchStats(); }}
      />

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

export default BaseServiceManager;
