import { useState, useMemo, useEffect } from 'react';
import { Package, Plus, Search, Filter, Trash2, Edit2, CheckCircle, RotateCcw, Monitor, TrendingUp } from 'lucide-react';
import InventoryModal from '../components/InventoryModal';
import ConfirmModal from '../components/ConfirmModal';
import { API_URL } from '../config';

const Inventario = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, id: null });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/inventory`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const stats = useMemo(() => {
    return {
      total: items.length,
      '4K': items.filter(i => i.categoria === '4K').length,
      'HD': items.filter(i => i.categoria === 'HD').length,
      'Lite': items.filter(i => i.categoria === 'Lite').length,
      nuevo: items.filter(i => i.estado === 'nuevo').length,
      usado: items.filter(i => i.estado === 'usado').length,
    };
  }, [items]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.partNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'ALL' || item.categoria === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleAddItem = async (newItem) => {
    try {
      const url = editingItem 
        ? `${API_URL}/api/inventory/${editingItem.id}` 
        : `${API_URL}/api/inventory`;
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });

      if (res.ok) {
        fetchInventory(); // Recargar de la BD
        setIsModalOpen(false);
        setEditingItem(null);
      } else {
        const error = await res.json();
        alert('Error: ' + (error.details || error.error));
      }
    } catch (err) {
      console.error('Error saving item:', err);
      alert('Error de conexión al guardar el equipo');
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setConfirmConfig({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (confirmConfig.id) {
      try {
        const res = await fetch(`${API_URL}/api/inventory/${confirmConfig.id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          fetchInventory();
          setConfirmConfig({ isOpen: false, id: null });
        } else {
          const error = await res.json();
          alert('Error al eliminar: ' + (error.details || error.error));
        }
      } catch (err) {
        console.error('Error deleting item:', err);
        alert('Error de conexión al eliminar el equipo');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <div className="header glass-panel" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 2rem' }}>
        <div style={{ backgroundColor: 'rgba(94, 234, 212, 0.1)', color: 'var(--primary)', padding: '0.75rem', borderRadius: '12px' }}>
          <Package size={28} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Inventario de Equipos</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Control de stock Fire Sticks y Hardwares</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={20} />
          Nuevo Ingreso
        </button>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(94, 234, 212, 0.1)' }}>
            <Monitor size={24} />
          </div>
          <div className="stat-content">
            <p>Total Equipos</p>
            <h3>{stats.total}</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(192, 132, 252, 0.1)', color: 'var(--accent)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <p>Stock 4K</p>
            <h3>{stats['4K']}</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <p>Equipos Nuevos</p>
            <h3>{stats.nuevo}</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(251, 191, 36, 0.1)', color: 'var(--warning)' }}>
            <RotateCcw size={24} />
          </div>
          <div className="stat-content">
            <p>Para Reciclar</p>
            <h3>{stats.usado}</h3>
          </div>
        </div>
      </div>

      {/* Actions & Filters */}
      <div className="action-bar glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Buscar por número de parte..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="segmented-control">
          {['ALL', '4K', 'HD', 'Lite'].map(t => (
            <button 
              key={t}
              className={`segment-item ${filterType === t ? 'active' : ''}`}
              onClick={() => setFilterType(t)}
            >
              {t === 'ALL' ? 'Todos' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Número de Parte</th>
                <th>Calidad</th>
                <th>Estado</th>
                <th>Fecha Ingreso</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="loading-spinner"></div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Cargando inventario...</p>
                  </td>
                </tr>
              ) : filteredItems.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                    {item.partNumber}
                  </td>
                  <td>
                    <span className="device-chip" style={{ 
                      background: item.categoria === '4K' ? 'var(--accent)' : item.categoria === 'HD' ? '#3b82f6' : '#64748b' 
                    }}>
                      {item.categoria}
                    </span>
                  </td>
                  <td>
                    <div className="status-indicator">
                      <span className={`status-dot ${item.estado === 'nuevo' ? 'status-active' : 'status-warning'}`}></span>
                      <span className={`badge ${item.estado === 'nuevo' ? 'badge-active' : 'badge-demo'}`}>
                        {item.estado === 'nuevo' ? 'NUEVO' : 'USADO'}
                      </span>
                    </div>
                  </td>
                  <td>{item.fechaIngreso}</td>
                  <td>
                    <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn btn-sm btn-secondary btn-icon-only" onClick={() => openEditModal(item)}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-sm btn-danger btn-icon-only" onClick={() => handleDelete(item.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No se encontraron equipos en el inventario.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InventoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddItem}
        itemData={editingItem}
        existingCount={items.length}
      />

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Eliminar Equipo"
        message="¿Estás seguro de eliminar este equipo del inventario? Esta acción no se puede deshacer."
        type="warning"
      />
    </div>
  );
};

export default Inventario;
