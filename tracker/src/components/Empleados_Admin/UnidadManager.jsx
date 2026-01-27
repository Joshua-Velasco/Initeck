import React, { useState, useEffect } from 'react';
import { Car, Edit2, CheckCircle, XCircle, ExternalLink, Hash, Gauge, AlertCircle } from 'lucide-react';
import { API_URLS, COLORS } from '../../constants/theme';

// Componente unificado para gestión de unidades (combina funcionalidad de AsignarUnidad y GestionSidebar)
export const UnidadManager = ({ 
  empleado, 
  onAsignar, 
  onClose, 
  isModal = false,
  colorGuinda = COLORS.guinda 
}) => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState("");
  const [editandoUnidad, setEditandoUnidad] = useState(false);

  useEffect(() => {
    const fetchVehiculos = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URLS.vehiculos}listar.php`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setVehiculos(data.filter(v => v.estado === 'Activo' || v.id == empleado?.vehiculo_id));
        }
      } catch (error) {
        console.error("Error cargando vehículos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVehiculos();
  }, [empleado?.vehiculo_id]);

  useEffect(() => {
    if (empleado?.vehiculo_id) {
      setSelectedVehiculo(empleado.vehiculo_id.toString());
    } else {
      setSelectedVehiculo("");
    }
  }, [empleado]);

  const handleAsignar = async () => {
    if (!selectedVehiculo || !empleado?.id) return alert("Faltan datos");

    setLoading(true);
    try {
      const res = await fetch(`${API_URLS.empleados}asignar_unidad.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empleado_id: empleado.id,
          vehiculo_id: selectedVehiculo
        })
      });
      
      const data = await res.json();
      if (data.status === 'success') {
        onAsignar?.();
        onClose?.();
        setEditandoUnidad(false);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const vehiculoActual = vehiculos.find(v => v.id == empleado?.vehiculo_id);
  const infoVehiculoSeleccionado = vehiculos.find(v => v.id == selectedVehiculo);

  if (isModal) {
    // Vista Modal (similar a AsignarUnidad.jsx)
    return (
      <div className="modal-content border-0 shadow-lg">
        <div className="modal-header border-0 bg-dark text-white rounded-top-4">
          <h5 className="modal-title fw-bold">Asignar Unidad a {empleado?.nombre_completo}</h5>
          <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
        </div>
        
        <div className="modal-body p-4">
          {vehiculoActual && (
            <div className="alert alert-success border-0 shadow-sm mb-4">
              <small className="d-block text-uppercase fw-bold opacity-75">Unidad Actual:</small>
              <div className="fw-bold fs-5">{vehiculoActual.unidad_nombre}</div>
              <div className="small">{vehiculoActual.placas}</div>
            </div>
          )}

          <label className="fw-bold small text-muted text-uppercase mb-2">Seleccionar Nueva Unidad</label>
          <select 
            className="form-select form-select-lg mb-4 shadow-sm" 
            value={selectedVehiculo} 
            onChange={(e) => setSelectedVehiculo(e.target.value)}
          >
            <option value="">-- Seleccione una unidad --</option>
            {vehiculos.map(v => (
              <option key={v.id} value={v.id}>
                {v.unidad_nombre} ({v.placas})
              </option>
            ))}
          </select>

          {infoVehiculoSeleccionado && (
            <div className="card bg-light border-0">
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <div className="text-muted small">Kilometraje</div>
                    <div className="fw-bold">{infoVehiculoSeleccionado.kilometraje_actual} km</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer border-0 bg-light">
          <button className="btn btn-outline-secondary" onClick={onClose}>Cancelar</button>
          <button 
            className="btn btn-primary px-4 fw-bold" 
            onClick={handleAsignar}
            disabled={loading || !selectedVehiculo}
          >
            {loading ? "Guardando..." : "Confirmar Asignación"}
          </button>
        </div>
      </div>
    );
  }

  // Vista Sidebar (similar a GestionSidebar.jsx)
  return (
    <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
      <h6 className="fw-bold small text-uppercase mb-3 text-muted">Gestión de Unidad</h6>
      <div className="p-4 rounded-4 border-2 text-center bg-light" style={{ border: '2px dashed #e2e8f0' }}>
        {editandoUnidad ? (
          <div>
            <select className="form-select mb-3 border-0 shadow-sm" value={selectedVehiculo} onChange={e => setSelectedVehiculo(e.target.value)}>
              <option value="">Seleccionar Unidad</option>
              {vehiculos.map(v => <option key={v.id} value={v.id}>{v.unidad_nombre || v.nombre_vehiculo}</option>)}
            </select>
            <div className="d-flex gap-2">
              <button className="btn btn-dark w-100 rounded-pill btn-sm" onClick={handleAsignar} disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </button>
              <button className="btn btn-outline-secondary w-100 rounded-pill btn-sm" onClick={() => setEditandoUnidad(false)}>Cancelar</button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white p-3 rounded-circle d-inline-block shadow-sm mb-3">
              <Car size={28} style={{ color: colorGuinda }} />
            </div>
            <h5 className="fw-bold mb-1 text-dark text-truncate px-2">
              {vehiculoActual?.unidad_nombre || vehiculoActual?.nombre_vehiculo || 'No Asignado'}
            </h5>
            {vehiculoActual && (
              <div className="small text-muted mb-2">{vehiculoActual.placas}</div>
            )}
            <button className="btn btn-link btn-sm text-decoration-none fw-bold" style={{ color: colorGuinda }} onClick={() => setEditandoUnidad(true)}>
              <Edit2 size={12} className="me-1" /> Editar Unidad
            </button>
          </>
        )}
      </div>
    </div>
  );
};
