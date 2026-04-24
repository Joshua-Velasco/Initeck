import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Smartphone, DollarSign, Calendar, Shield, CreditCard, Clock } from 'lucide-react';

const PremiumSwitch = ({ label, description, active, onClick }) => (
  <div className={`premium-switch-container ${active ? 'active' : ''}`} onClick={onClick}>
    <div className="premium-switch-label">
      <span className="title">{label}</span>
      <span className="desc">{description}</span>
    </div>
    <div className="switch-control">
      <div className="switch-knob"></div>
    </div>
  </div>
);

const addMonthsClamped = (dateStr, months) => {
  const d = new Date(dateStr + 'T12:00:00');
  const targetMonth = d.getMonth() + months;
  const targetYear = d.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  const day = Math.min(d.getDate(), lastDay);
  return new Date(targetYear, normalizedMonth, day).toISOString().split('T')[0];
};

const SubscriptionModal = ({ isOpen, onClose, onSave, clientData, tipoServicio }) => {
  const [formData, setFormData] = useState({
    no_cliente: '',
    nombre: '',
    telefono: '',
    estatus: true,
    demo: false,
    equipo_1: '',
    tv_1: true,
    equipo_2: '',
    tv_2: false,
    detalles: '',
    fecha_activacion: new Date().toISOString().split('T')[0],
    meses_activos: 1,
    fecha_renovacion: '',
    costo: 250,
    vip: false
  });

  useEffect(() => {
    if (clientData) {
      const activacion = clientData.fecha_activacion
        ? new Date(clientData.fecha_activacion + 'T12:00:00').toISOString().split('T')[0]
        : '';
      const meses = parseInt(clientData.meses_activos) || 1;
      setFormData({
        ...clientData,
        fecha_activacion: activacion,
        fecha_renovacion: activacion ? addMonthsClamped(activacion, meses) : ''
      });
    } else {
      const today = new Date();
      const activacion = today.toISOString().split('T')[0];

      setFormData({
        no_cliente: '',
        nombre: '',
        telefono: '',
        estatus: true,
        demo: false,
        equipo_1: '',
        tv_1: true,
        equipo_2: '',
        tv_2: false,
        detalles: '',
        fecha_activacion: activacion,
        meses_activos: 1,
        fecha_renovacion: addMonthsClamped(activacion, 1),
        costo: tipoServicio === 'FUTURE' ? 220 : 250,
        vip: false
      });
    }
  }, [clientData, isOpen, tipoServicio]);

  const getStatusInfo = useMemo(() => {
    if (formData.vip) return { label: 'VIP', class: 'badge-active', color: 'var(--primary)' };
    if (!formData.estatus) return { label: 'VENCIDO', class: 'badge-inactive', color: 'var(--danger)' };

    if (formData.fecha_renovacion) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const renewDate = new Date(formData.fecha_renovacion + 'T12:00:00');
      if (!isNaN(renewDate.getTime())) {
        const diffTime = renewDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return { label: 'VENCIDO', class: 'badge-inactive', color: 'var(--danger)' };
        if (diffDays <= 7) return { label: 'POR VENCER', class: 'badge-demo', color: 'var(--warning)' };
      }
    }
    return { label: 'VIGENTE', class: 'badge-active', color: 'var(--primary)' };
  }, [formData.vip, formData.estatus, formData.fecha_renovacion]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
      const newValue = type === 'checkbox' ? checked : value;
      let updatedData = { ...prev, [name]: newValue };

      if (name === 'fecha_activacion' || name === 'meses_activos') {
        const activacionStr = name === 'fecha_activacion' ? newValue : updatedData.fecha_activacion;
        const meses = name === 'meses_activos' ? parseInt(newValue) || 0 : parseInt(updatedData.meses_activos) || 0;

        if (activacionStr && meses > 0) {
          updatedData.fecha_renovacion = addMonthsClamped(activacionStr, meses);
        }
      }

      return updatedData;
    });
  };

  const toggleField = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, tipo_servicio: tipoServicio });
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
              {clientData ? <Clock size={20} /> : <User size={20} />}
            </div>
            <div>
              <h2 style={{ margin: 0 }}>{clientData ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Servicio: {tipoServicio}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="status-preview">
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusInfo.color }}></span>
              {getStatusInfo.label}
            </div>
            <button className="btn btn-ghost btn-icon-only" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body" style={{ padding: '1.5rem' }}>
          <div className="modal-group">
            <div className="modal-group-title"><User size={14} /> Información Personal</div>
            <div className="form-grid">
              <div className="form-group">
                <label>No. Cliente</label>
                <input type="text" name="no_cliente" value={formData.no_cliente || ''} onChange={handleChange} className="form-control" required disabled={!!clientData} placeholder="ID Único" />
              </div>
              <div className="form-group">
                <label>Nombre Completo</label>
                <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleChange} className="form-control" required placeholder="Nombre del suscriptor" />
              </div>
              <div className="form-group-full">
                <label>Teléfono de Contacto</label>
                <input type="text" name="telefono" value={formData.telefono || ''} onChange={handleChange} className="form-control" placeholder="+52 ..." />
              </div>
            </div>
          </div>

          <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
            <PremiumSwitch 
                label="Cliente VIP" 
                description="Status privilegiado" 
                active={formData.vip} 
                onClick={() => toggleField('vip')} 
            />
            <PremiumSwitch 
                label="Estatus Activo" 
                description="Servicio habilitado" 
                active={formData.estatus} 
                onClick={() => toggleField('estatus')} 
            />
          </div>

          <div className="modal-group">
            <div className="modal-group-title"><Smartphone size={14} /> Dispositivos Ligados</div>
            <div className="form-grid">
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ margin: 0 }}>Equipo 1</label>
                    <label style={{ margin: 0, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input type="checkbox" name="tv_1" checked={formData.tv_1} onChange={handleChange} /> TV 1
                    </label>
                </div>
                <input type="text" name="equipo_1" value={formData.equipo_1 || ''} onChange={handleChange} className="form-control" placeholder="Ej. Fire Stick 4K" />
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ margin: 0 }}>Equipo 2</label>
                    <label style={{ margin: 0, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <input type="checkbox" name="tv_2" checked={formData.tv_2} onChange={handleChange} /> TV 2
                    </label>
                </div>
                <input type="text" name="equipo_2" value={formData.equipo_2 || ''} onChange={handleChange} className="form-control" placeholder="Opcional" />
              </div>
            </div>
          </div>

          <div className="modal-group">
            <div className="modal-group-title"><DollarSign size={14} /> Plan y Finanzas</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Activación</label>
                <input type="date" name="fecha_activacion" value={formData.fecha_activacion || ''} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group">
                <label>Meses</label>
                <input type="number" name="meses_activos" value={formData.meses_activos} onChange={handleChange} className="form-control" min="1" />
              </div>
              <div className="form-group">
                <label>Vencimiento / Renovación</label>
                <input type="date" name="fecha_renovacion" value={formData.fecha_renovacion || ''} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group">
                <label>Costo del Servicio</label>
                <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                    <input type="number" name="costo" value={formData.costo} onChange={handleChange} className="form-control" style={{ paddingLeft: '1.75rem' }} step="0.01" />
                </div>
              </div>
            </div>
          </div>

          <div className="form-group-full">
            <label>Detalles Adicionales</label>
            <textarea name="detalles" value={formData.detalles || ''} onChange={handleChange} className="form-control" rows="2" placeholder="Notas sobre el cliente..."></textarea>
          </div>
        </form>
        
        <div className="modal-footer" style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-panel)', borderTop: '1px solid var(--border)' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" onClick={handleSubmit} className="btn btn-primary" style={{ minWidth: '140px' }}>
            {clientData ? 'Actualizar' : 'Crear Suscripción'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SubscriptionModal;
