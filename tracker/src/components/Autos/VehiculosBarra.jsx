import React, { useRef } from 'react';
import { Search, Plus, X, Filter, Car, AlertCircle } from 'lucide-react';

export default function VehiculosBarra({ searchTerm, setSearchTerm, filterStatus, setFilterStatus, totalResultados }) {
  const inputRef = useRef(null);

  const opcionesFiltro = [
    { nombre: 'Todos', color: '#64748b' },
    { nombre: 'Activo', color: '#10b981' },
    { nombre: 'En Taller', color: '#f59e0b' },
    { nombre: 'Baja', color: '#ef4444' }
  ];

  const handleClear = () => {
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const resetAll = () => {
    setSearchTerm('');
    setFilterStatus('Todos');
  };

  return (
    <div className="mb-4 animate__animated animate__fadeIn">
      <div 
        className="text-white rounded-4 p-4 mb-4 shadow-lg border-0 d-flex flex-column flex-md-row justify-content-between align-items-center animate__animated animate__fadeIn" 
        style={{ 
          background: "linear-gradient(135deg, #6b0f1a 0%, #b91c1c 100%)", 
          boxShadow: "rgba(107, 15, 26, 0.3) 0px 10px 30px" 
        }}
      >
        {/* LADO IZQUIERDO: TÍTULO E ICONO */}
        <div className="d-flex align-items-center gap-3 text-center text-md-start">
          <div className="d-none d-sm-flex align-items-center justify-content-center bg-opacity-20 rounded-4" style={{ width: '58px', height: '58px' }}>
            <Car size={32} color="white" strokeWidth={2.2} />
          </div>
          
          <div className="d-flex flex-column">
            <div className="d-flex align-items-center gap-2 flex-wrap justify-content-center justify-content-md-start">
              <h1 className="fw-bold mb-0" style={{ fontSize: '1.8rem' }}>Flota Initeck</h1>
              <span className="badge rounded-pill bg-white text-dark px-3 py-1 fw-bold" style={{ fontSize: '0.75rem' }}>
                {totalResultados.toLocaleString()} UNIDADES
              </span>
            </div>
            <p className="text-white-50 mb-0 small text-uppercase tracking-widest">
              Sistema de Control Operativo
            </p>
          </div>
        </div>

        {/* LADO DERECHO: BUSCADOR Y BOTÓN NUEVO */}
        <div className="d-flex flex-column flex-md-row gap-2 mt-3 mt-md-0 align-items-center">
          
          {/* Buscador Integrado */}
          <div className="position-relative shadow-sm rounded-pill overflow-hidden bg-white" style={{ width: '250px' }}>
            <span className="position-absolute top-50 start-0 translate-middle-y ps-3">
              <Search size={18} className="text-muted" />
            </span>
            <input 
              type="text" 
              className="form-control border-0 ps-5 py-2" 
              style={{ fontSize: '0.85rem', height: '42px', boxShadow: 'none' }}
              placeholder="Buscar unidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Botón Nueva Unidad */}
          <button 
            className="btn btn-light shadow-sm px-4 d-flex align-items-center gap-2 fw-bold text-dark rounded-pill" 
            style={{ height: '42px', border: 'none' }}
            data-bs-toggle="modal" 
            data-bs-target="#modalAgregar"
          >
            <Plus size={20} strokeWidth={3} />
            <span>Nueva Unidad</span>
          </button>
        </div>
      </div>
      {/* MENSAJE DE RESULTADOS */}
      {(searchTerm || filterStatus !== 'Todos') && (
        <div className="mt-2 animate__animated animate__fadeInUp">
          <div className={`d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill ${totalResultados === 0 ? 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25' : 'bg-light text-muted border'}`}>
            {totalResultados === 0 ? <AlertCircle size={14} /> : <Filter size={12} />}
            <small className="fw-bold">
              {totalResultados === 0 
                ? `No se encontró: "${searchTerm || filterStatus}"` 
                : `Mostrando ${totalResultados} resultados`}
            </small>
            <button 
              className={`btn btn-sm p-0 text-decoration-underline ms-2 fw-bold ${totalResultados === 0 ? 'text-danger' : 'text-primary'}`} 
              onClick={resetAll} 
              style={{ fontSize: '0.7rem' }}
            >
              Restablecer filtros
            </button>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .hover-scale:hover { transform: translateY(-1px); filter: brightness(1.1); }
        
        @media (max-width: 768px) {
          .scroll-x-mobile {
            overflow-x: auto; white-space: nowrap; padding: 4px;
            -webkit-overflow-scrolling: touch; width: 100%;
          }
          .scroll-x-mobile::-webkit-scrollbar { display: none; }
          .btn-fab-mobile {
            position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px;
            border-radius: 50% !important; z-index: 1050; display: flex;
            align-items: center; justify-content: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3) !important; padding: 0 !important;
            background-color: #6b0f1a !important;
          }
          .btn-fab-mobile span { display: none !important; }
          .search-container-mobile { order: 1; width: 100% !important; }
          .filter-group-container { order: 2; width: 100%; }
          .w-100-mobile { width: 100%; }
        }
      `}</style>
    </div>
  );
}