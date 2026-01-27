import React, { useState, useEffect } from 'react';
import { Hash, Gauge, CheckCircle2, Loader2, X, Car, ArrowRight, AlertCircle } from 'lucide-react';
import { VEHICULO_LISTAR_URL, EMPLEADO_ASIGNAR_UNIDAD_URL } from '../../config';

const COLORS = {
  primary: '#0f172a',
  success: '#22c55e'
};

export default function AsignarUnidad({ empleado, onAsignar, onClose }) {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState("");

  // 1. Cargar vehículos al montar el modal
  useEffect(() => {
    const fetchVehiculos = async () => {
      setLoading(true);
      try {
        const res = await fetch(VEHICULO_LISTAR_URL);
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

  // 2. CORRECCIÓN CLAVE: Sincronizar con 'vehiculo_id'
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
      const res = await fetch(EMPLEADO_ASIGNAR_UNIDAD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empleado_id: empleado.id,
          vehiculo_id: selectedVehiculo
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        onAsignar(); // Esto debe refrescar la lista de empleados en el componente padre
        onClose();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // Buscamos el objeto usando el nombre correcto de la columna
  const vehiculoActual = vehiculos.find(v => v.id == empleado?.vehiculo_id);
  const infoVehiculoSeleccionado = vehiculos.find(v => v.id == selectedVehiculo);

  return (
    <div className="modal-content border-0 shadow-lg">
      <div className="modal-header border-0 bg-dark text-white rounded-top-4">
        <h5 className="modal-title fw-bold">Asignar Unidad a {empleado?.nombre}</h5>
        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
      </div>

      <div className="modal-body p-4">
        {/* Si ya tiene una unidad, la mostramos */}
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
                  <div className="text-muted small">Modelo</div>
                  <div className="fw-bold">{infoVehiculoSeleccionado.modelo}</div>
                </div>
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