import { Plus, Search, RefreshCw } from 'lucide-react';

export const EmpleadoHeader = ({ searchTerm, setSearchTerm, onNewClick, onRefresh, loading, total, colorGuinda }) => (
  <>
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 className="fw-bold mb-0">Gestión de Personal</h4>
        <p className="text-muted small">Administra roles de admin, operadores, limpieza y desarrollo</p>
      </div>
      <button className="btn text-white d-flex align-items-center gap-2 shadow-sm" style={{ backgroundColor: colorGuinda }} data-bs-toggle="modal" data-bs-target="#modalEmpleado" onClick={onNewClick}>
        <Plus size={20} /> Nuevo Empleado
      </button>
    </div>

    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <div className="row align-items-center">
          <div className="col-md-8">
            <div className="input-group border rounded-pill px-3 py-1">
              <Search className="text-muted mt-1" size={20} />
              <input type="text" className="form-control border-0 bg-transparent shadow-none" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="col-md-4 text-end">
            <button className="btn btn-outline-secondary btn-sm me-2" onClick={onRefresh} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refrescar
            </button>
            <span className="badge bg-secondary">{total} empleados</span>
          </div>
        </div>
      </div>
    </div>
  </>
);