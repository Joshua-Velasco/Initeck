import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Users, DollarSign, Activity, TrendingUp, CreditCard, 
  AlertTriangle, PieChart as PieIcon, BarChart3,
  Shield, Clock, AlertCircle, XCircle
} from 'lucide-react';

import { API_URL } from '../config';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    cobradoEsteMes: 0,
    clientesPendientes: 0,
    montoPendiente: 0,
    vipCount: 0,
    inactivosCount: 0,
    vencidosCount: 0,
    porVencerCount: 0,
    distribucionServicios: [],
    estadoPagos: []
  });
  
  const [chartData, setChartData] = useState([]);

  // Default growth data as mock, since we aren't tracking weekly signups in DB yet
  const growthData = [
    { name: 'Lun', users: 12 }, { name: 'Mar', users: 19 }, { name: 'Mie', users: 15 },
    { name: 'Jue', users: 22 }, { name: 'Vie', users: 30 }, { name: 'Sab', users: 25 }, { name: 'Dom', users: 28 },
  ];

  useEffect(() => {
    // Fetch stats
    fetch(`${API_URL}/api/dashboard/stats`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setStats(data);
      })
      .catch(err => console.error('Error fetching stats:', err));

    // Fetch chart data
    fetch(`${API_URL}/api/dashboard/chart-data`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setChartData(data);
        else console.error("API Error or Invalid Data:", data);
      })
      .catch(err => console.error('Error fetching chart data:', err));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="dashboard-grid">
        <div className="card stat-card">
          <div className="stat-icon" style={{ color: 'var(--accent)' }}>
            <Users size={24} />
          </div>
          <div className="stat-details">
            <h3>Clientes Totales</h3>
            <p className="stat-value">{stats.totalClients}</p>
            <span className="stat-label">Registrados</span>
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-icon" style={{ color: 'var(--primary)' }}>
            <Activity size={24} />
          </div>
          <div className="stat-details">
            <h3>Suscripciones Activas</h3>
            <p className="stat-value">{stats.activeSubscriptions}</p>
            <span className="stat-label">Servicios sin suspender</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ color: 'var(--primary)' }}>
            <CreditCard size={24} />
          </div>
          <div className="stat-details">
            <h3>Cobrado (Mes)</h3>
            <p className="stat-value">${Number(stats.cobradoEsteMes).toLocaleString()}</p>
            <span className="stat-label">Ingresos reales</span>
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-icon" style={{ color: 'var(--warning)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-details">
            <h3>Por Cobrar</h3>
            <p className="stat-value">${Number(stats.montoPendiente).toLocaleString()}</p>
            <span className="stat-label">{stats.clientesPendientes} Pendientes</span>
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-icon" style={{ color: '#10b981' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-details">
            <h3>Ingreso Estimado</h3>
            <p className="stat-value">${Number(stats.monthlyRevenue).toLocaleString()}</p>
            <span className="stat-label">Proyección mensual</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ color: 'var(--primary)', background: 'rgba(94, 234, 212, 0.1)' }}>
            <Shield size={24} />
          </div>
          <div className="stat-details">
            <h3>Clientes VIP</h3>
            <p className="stat-value">{stats.vipCount}</p>
            <span className="stat-label">Sin suspensión automática</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ color: 'var(--warning)', background: 'rgba(251, 191, 36, 0.1)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-details">
            <h3>Por Vencer (7d)</h3>
            <p className="stat-value">{stats.porVencerCount}</p>
            <span className="stat-label">Vencimiento cercano</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ color: 'var(--danger)', background: 'rgba(255, 77, 77, 0.1)' }}>
            <AlertCircle size={24} />
          </div>
          <div className="stat-details">
            <h3>Servicios Vencidos</h3>
            <p className="stat-value" style={{ color: stats.vencidosCount > 0 ? 'var(--danger)' : 'inherit' }}>{stats.vencidosCount}</p>
            <span className="stat-label">Activos, con fecha pasada</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1.8fr 1.2fr' }}>
        <div className="card chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0 }}>Desglose por Servicio (MXN)</h3>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '2px' }}></span> Elite
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', background: 'var(--accent)', borderRadius: '2px' }}></span> Future
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="var(--text-muted)" style={{ fontSize: '0.8rem' }} />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}
              />
              <Bar dataKey="Elite" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={40} />
              <Bar dataKey="Future" fill="var(--accent)" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3 style={{ marginBottom: '2rem' }}>Nuevas Activaciones</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--warning)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="var(--text-muted)" style={{ fontSize: '0.8rem' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
              />
              <Area type="monotone" dataKey="users" stroke="var(--warning)" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card chart-card" style={{ height: '380px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <PieIcon size={18} style={{ color: 'var(--accent)' }}/>
            <h3 style={{ margin: 0 }}>Distribución de Servicios</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={stats.distribucionServicios}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.distribucionServicios.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.name === 'ELITE' ? 'var(--primary)' : entry.name === 'FUTURE' ? 'var(--accent)' : '#a855f7'} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card" style={{ height: '380px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <BarChart3 size={18} style={{ color: '#10b981' }}/>
            <h3 style={{ margin: 0 }}>Estado de Pagos (Mensual)</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={stats.estadoPagos}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                stroke="none"
                dataKey="value"
              >
                <Cell key="cell-0" fill="#10b981" />
                <Cell key="cell-1" fill="var(--danger)" />
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
