import { useState, useEffect } from 'react';
import { Plus, Trash2, Tv, MonitorPlay, Save, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';
import ConfirmModal from '../components/ConfirmModal';

const ModuleManagement = () => {
  const [services, setServices] = useState([]);
  const [newModule, setNewModule] = useState({ nombre: '', slug: '', costo_default: 250 });
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  const fetchServices = () => {
    fetch(`${API_URL}/api/services`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setServices(data);
      })
      .catch(err => console.error('Error fetching services:', err));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newModule.nombre || !newModule.slug) return;

    try {
      const response = await fetch(`${API_URL}/api/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newModule)
      });

      if (response.ok) {
        setNewModule({ nombre: '', slug: '', costo_default: 250 });
        fetchServices();
        // Refresh sidebar by reloading or using a shared state/context if needed
        // For now, simpler: window.location.reload() or just trust the next visit
        window.location.reload(); 
      } else {
        alert('Error al crear el módulo. Asegúrate de que el slug sea único.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = (id, nombre) => {
    setModalConfig({
      isOpen: true,
      title: '¿Eliminar Módulo?',
      message: `¿Estás seguro de que deseas eliminar el módulo "${nombre}"? Los usuarios asociados NO se borrarán de la base de datos, pero el módulo ya no aparecerá en el menú.`,
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_URL}/api/services/${id}`, { method: 'DELETE' });
          if (response.ok) {
            fetchServices();
            window.location.reload();
          }
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="header-section" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>Configuración de Módulos</h1>
        <p style={{ color: 'var(--text-muted)' }}>Gestiona los servicios de TV disponibles en la plataforma.</p>
      </div>

      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem' }}>
        {/* Module List */}
        <div className="glass-panel" style={{ padding: '0' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <MonitorPlay size={20} color="var(--primary)" />
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Módulos Instalados</h2>
            </div>
            <div className="module-list">
                {services.map(service => (
                    <div key={service.id} className="module-item" style={{ 
                        padding: '1.25rem 1.5rem', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderBottom: '1px solid var(--border)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--primary)' }}>
                                <Tv size={20} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>{service.nombre}</h3>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <span>Slug: <strong>{service.slug}</strong></span>
                                    <span>Costo base: <strong>${service.costo_default}</strong></span>
                                </div>
                            </div>
                        </div>
                        <div className="actions">
                            {['ELITE', 'FUTURE'].includes(service.slug) ? (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>Sistema</span>
                            ) : (
                                <button 
                                    className="btn btn-sm btn-danger btn-icon-only" 
                                    onClick={() => handleDelete(service.id, service.nombre)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Add New Module Form */}
        <div className="glass-panel" style={{ height: 'fit-content', padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Agregar Módulo</h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Define un nuevo servicio de TV.</p>
            </div>
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group-custom">
                    <label>Nombre del Módulo</label>
                    <input 
                        type="text" 
                        placeholder="Ej: Inibay Plus"
                        className="form-control"
                        value={newModule.nombre}
                        onChange={(e) => setNewModule({...newModule, nombre: e.target.value})}
                        required
                    />
                </div>
                
                <div className="form-group-custom">
                    <label>Slug (Identificador)</label>
                    <input 
                        type="text" 
                        placeholder="EJ: INIBAY_PLUS"
                        className="form-control"
                        style={{ textTransform: 'uppercase' }}
                        value={newModule.slug}
                        onChange={(e) => setNewModule({...newModule, slug: e.target.value.toUpperCase().replace(/\s+/g, '_')})}
                        required
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Se usará internamente para filtrar datos.</small>
                </div>

                <div className="form-group-custom">
                    <label>Costo Mensual Default</label>
                    <input 
                        type="number" 
                        className="form-control"
                        value={newModule.costo_default}
                        onChange={(e) => setNewModule({...newModule, costo_default: e.target.value})}
                        required
                    />
                </div>

                <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1rem', borderRadius: '12px', display: 'flex', gap: '0.75rem', marginBottom: '0.5rem', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                    <AlertCircle size={18} style={{ color: '#3b82f6', flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Al crear el módulo, aparecerá automáticamente en el menú lateral con todas las funciones de gestión.
                    </p>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    <Save size={18} />
                    <span>Crear Módulo</span>
                </button>
            </form>
        </div>
      </div>

      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type="warning"
      />
    </div>
  );
};

export default ModuleManagement;
