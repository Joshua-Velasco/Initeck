import React from 'react';
import { Search, Plus } from 'lucide-react';

export default function VehiculosBarra({ searchTerm, setSearchTerm, filterStatus, setFilterStatus, totalResultados }) {
  // Opciones de filtro alineadas con la lógica de negocio y colores de la flota
  const opcionesFiltro = [
    { nombre: 'Todos', color: '#64748b' },
    { nombre: 'Activo', color: '#10b981' },
    { nombre: 'Mantenimiento', color: '#f59e0b' },
    { nombre: 'Fuera de Servicio', color: '#ef4444' }
  ];

  return (
    <div className="mb-4">
      <div className="d-flex flex-column flex-xl-row justify-content-between align-items-xl-end gap-3 mb-3">
        {/* Lado Izquierdo: Títulos y Contador */}
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="fw-bold mb-0 text-uppercase tracking-wider" style={{ color: '#0f172a' }}>
              Flota Initeck
            </h2>
            <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-3">
              {totalResultados} {totalResultados === 1 ? 'Unidad' : 'Unidades'}
            </span>
          </div>
          <p className="text-muted small mb-0">Gestión centralizada de unidades y costos operativos</p>
        </div>

        {/* Lado Derecho: Buscador + Filtros + Botón */}
        <div className="d-flex flex-wrap gap-3 align-items-center">
          
          {/* Barra de Búsqueda con diseño limpio */}
          <div className="input-group input-group-sm shadow-sm" style={{ width: '280px' }}>
            <span className="input-group-text bg-white border-end-0 text-muted">
              <Search size={16} />
            </span>
            <input 
              type="text" 
              className="form-control border-start-0 ps-0 bg-white" 
              placeholder="Buscar por unidad, placas o motor..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          {/* Filtros de Estado Estilizados (Segmented Control) */}
          <div className="d-flex gap-1 bg-white p-1 rounded-pill border shadow-sm">
            {opcionesFiltro.map(s => (
              <button 
                key={s.nombre} 
                onClick={() => setFilterStatus(s.nombre)}
                className={`btn btn-sm rounded-pill px-3 border-0 d-flex align-items-center gap-2 transition-all ${
                  filterStatus === s.nombre 
                  ? 'btn-primary shadow-sm text-white' 
                  : 'text-muted bg-transparent hover-bg-light'
                }`}
                style={{ 
                  fontSize: '0.72rem', 
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                {s.nombre !== 'Todos' && (
                  <span 
                    className="rounded-circle" 
                    style={{ 
                      width: '8px', 
                      height: '8px', 
                      backgroundColor: filterStatus === s.nombre ? 'white' : s.color,
                      border: filterStatus === s.nombre ? 'none' : '1px solid rgba(0,0,0,0.1)'
                    }}
                  ></span>
                )}
                {s.nombre}
              </button>
            ))}
          </div>

          {/* Botón Nueva Unidad - Trigger de ModalAgregar */}
          <button 
            className="btn btn-dark btn-sm d-flex align-items-center gap-2 px-4 shadow-sm rounded-3 py-2" 
            data-bs-toggle="modal" 
            data-bs-target="#modalAgregar"
            style={{ fontWeight: '600', letterSpacing: '0.3px' }}
          >
            <Plus size={18}/> Nueva Unidad
          </button>
        </div>
      </div>
    </div>
  );
}