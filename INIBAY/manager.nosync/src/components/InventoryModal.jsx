import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Package, Shield, Box, Calendar, Info } from 'lucide-react';

const PremiumSwitch = ({ label, description, active, onClick }) => (
  <div className={`premium-switch-container ${active ? 'active' : ''}`} onClick={onClick} style={{ flex: 1 }}>
    <div className="premium-switch-label">
      <span className="title">{label}</span>
      <span className="desc">{description}</span>
    </div>
    <div className="switch-control">
      <div className="switch-knob"></div>
    </div>
  </div>
);

const InventoryModal = ({ isOpen, onClose, onSave, itemData, existingCount }) => {
  const [formData, setFormData] = useState({
    categoria: '4K',
    estado: 'nuevo',
    partNumber: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    detalles: ''
  });

  useEffect(() => {
    if (itemData) {
      setFormData(itemData);
    } else {
      // Generate default Part Number for new items
      const cat = formData.categoria;
      const index = (existingCount + 1).toString().padStart(3, '0');
      const generatedPN = `FB-${cat}-${index}`;
      
      setFormData(prev => ({
        ...prev,
        partNumber: generatedPN,
        categoria: '4K',
        estado: 'nuevo',
        fechaIngreso: new Date().toISOString().split('T')[0],
        detalles: ''
      }));
    }
  }, [itemData, isOpen, existingCount]);

  // Update Part Number when category changes
  useEffect(() => {
    if (!itemData) {
      const index = (existingCount + 1).toString().padStart(3, '0');
      setFormData(prev => ({
        ...prev,
        partNumber: `FB-${prev.categoria}-${index}`
      }));
    }
  }, [formData.categoria, existingCount, itemData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
              <Package size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0 }}>{itemData ? 'Editar Equipo' : 'Nuevo Ingreso'}</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Registro de Inventario</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon-only" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="modal-group">
            <div className="modal-group-title"><Box size={14} /> Especificaciones</div>
            <div className="form-grid">
              <div className="form-group-full">
                <label>Categoría / Calidad</label>
                <div className="segmented-control" style={{ width: '100%' }}>
                  {['4K', 'HD', 'Lite'].map(cat => (
                    <button 
                      key={cat}
                      type="button"
                      className={`segment-item ${formData.categoria === cat ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, categoria: cat }))}
                      style={{ flex: 1 }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Número de Parte</label>
                <input 
                  type="text" 
                  name="partNumber" 
                  value={formData.partNumber} 
                  onChange={handleChange} 
                  className="form-control" 
                  placeholder="Ej: FB-4K-001"
                  required
                />
              </div>

              <div className="form-group">
                <label>Fecha de Registro</label>
                <input 
                  type="date" 
                  name="fechaIngreso" 
                  value={formData.fechaIngreso} 
                  onChange={handleChange} 
                  className="form-control"
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
             <PremiumSwitch 
                label="Estado: Nuevo" 
                description="Equipo sellado" 
                active={formData.estado === 'nuevo'} 
                onClick={() => setFormData(prev => ({ ...prev, estado: 'nuevo' }))} 
            />
            <PremiumSwitch 
                label="Estado: Usado" 
                description="Para reciclar" 
                active={formData.estado === 'usado'} 
                onClick={() => setFormData(prev => ({ ...prev, estado: 'usado' }))} 
            />
          </div>

          <div className="form-group-full">
            <label>Notas del Equipo</label>
            <textarea 
              name="detalles" 
              value={formData.detalles} 
              onChange={handleChange} 
              className="form-control" 
              rows="3" 
              placeholder="Ej: Proviene del cliente 1234, funciona ok..."
            ></textarea>
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" onClick={handleSubmit} className="btn btn-primary" style={{ minWidth: '150px' }}>
            {itemData ? 'Actualizar' : 'Registrar Equipo'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InventoryModal;
