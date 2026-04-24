import React, { useState, useEffect } from 'react';
import { Gauge, CheckCircle2, Loader2, Car, AlertCircle, Lock } from 'lucide-react';
import { VEHICULO_LISTAR_URL, EMPLEADO_ASIGNAR_UNIDAD_URL, EMPLEADO_QUITAR_UNIDAD_URL } from '../../config';

const SIN_UNIDAD = '__sin_unidad__';

export default function AsignarUnidad({ empleado, onAsignar, onClose }) {
  const [vehiculos, setVehiculos]               = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [saving, setSaving]                     = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState('');

  useEffect(() => {
    const fetchVehiculos = async () => {
      setLoading(true);
      try {
        const res  = await fetch(VEHICULO_LISTAR_URL);
        const data = await res.json();
        if (Array.isArray(data)) setVehiculos(data.filter(v => v.estado === 'Activo'));
      } catch (e) {
        console.error('Error cargando vehículos:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchVehiculos();
  }, []);

  useEffect(() => {
    setSelectedVehiculo(empleado?.vehiculo_id ? String(empleado.vehiculo_id) : '');
  }, [empleado]);

  const empNombre = empleado?.nombre_completo ?? empleado?.nombre ?? '';

  // Vehicle assigned to a DIFFERENT employee
  const ocupadoPorOtro = (v) =>
    v.empleado_asignado_id &&
    String(v.empleado_asignado_id) !== String(empleado?.id);

  const vehiculoActual    = vehiculos.find(v => String(v.id) === String(empleado?.vehiculo_id));
  const infoSeleccionado  = vehiculos.find(v => String(v.id) === selectedVehiculo);
  const seleccionOcupada  = infoSeleccionado && ocupadoPorOtro(infoSeleccionado);
  const quitandoUnidad    = selectedVehiculo === SIN_UNIDAD;

  const handleConfirmar = async () => {
    if (!empleado?.id) return;

    setSaving(true);
    try {
      if (quitandoUnidad) {
        // Remove vehicle from this employee
        const res  = await fetch(EMPLEADO_QUITAR_UNIDAD_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ empleado_id: empleado.id })
        });
        const data = await res.json();
        if (data.status === 'success') { onAsignar(); onClose(); }
        else alert(data.message);
      } else {
        if (!selectedVehiculo || seleccionOcupada) return;
        const res  = await fetch(EMPLEADO_ASIGNAR_UNIDAD_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ empleado_id: empleado.id, vehiculo_id: selectedVehiculo })
        });
        const data = await res.json();
        if (data.status === 'success') { onAsignar(); onClose(); }
        else alert(data.message);
      }
    } catch (e) {
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const confirmDisabled =
    saving ||
    (!selectedVehiculo) ||
    (!quitandoUnidad && seleccionOcupada) ||
    (!quitandoUnidad && selectedVehiculo === String(empleado?.vehiculo_id));

  return (
    <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
      {/* Header */}
      <div className="modal-header border-0 text-white rounded-top-4 px-4 py-3"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="d-flex align-items-center gap-2">
          <Car size={20} />
          <h5 className="modal-title fw-bold mb-0">Asignar Unidad a {empNombre}</h5>
        </div>
        <button type="button" className="btn-close btn-close-white" onClick={onClose} />
      </div>

      <div className="modal-body p-4">
        {loading ? (
          <div className="text-center py-4">
            <Loader2 size={28} className="text-secondary mb-2" style={{ animation: 'spin 1s linear infinite' }} />
            <p className="text-muted mb-0" style={{ fontSize: 13 }}>Cargando unidades...</p>
          </div>
        ) : (
          <>
            {/* Unidad actual */}
            {vehiculoActual ? (
              <div className="rounded-3 p-3 mb-4 d-flex align-items-center justify-content-between gap-3"
                style={{ background: '#f0fdf4', border: '1.5px solid #86efac' }}>
                <div>
                  <p className="fw-bold text-uppercase mb-0"
                    style={{ fontSize: 10, color: '#15803d', letterSpacing: '0.08em' }}>Unidad actual</p>
                  <p className="fw-bold mb-0" style={{ fontSize: 17, color: '#0f172a' }}>{vehiculoActual.unidad_nombre}</p>
                  <p className="mb-0" style={{ fontSize: 12, color: '#64748b' }}>{vehiculoActual.placas}</p>
                </div>
                <CheckCircle2 size={28} style={{ color: '#22c55e', flexShrink: 0 }} />
              </div>
            ) : (
              <div className="rounded-3 p-3 mb-4 d-flex align-items-center gap-2"
                style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1' }}>
                <Car size={18} style={{ color: '#94a3b8' }} />
                <p className="mb-0" style={{ fontSize: 13, color: '#94a3b8' }}>Sin unidad asignada</p>
              </div>
            )}

            {/* Selector */}
            <label className="fw-bold mb-2 d-block"
              style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Seleccionar unidad
            </label>
            <select
              className="form-select form-select-lg mb-3 shadow-sm"
              value={selectedVehiculo}
              onChange={(e) => setSelectedVehiculo(e.target.value)}
              style={{ borderRadius: 10 }}
            >
              <option value="">-- Seleccione una unidad --</option>

              {/* Option to remove vehicle (only when employee has one) */}
              {vehiculoActual && (
                <option value={SIN_UNIDAD}>
                  ✕ Sin unidad asignada
                </option>
              )}

              {vehiculos.map(v => {
                const ocupado = ocupadoPorOtro(v);
                const esMia   = String(v.id) === String(empleado?.vehiculo_id);
                return (
                  <option
                    key={v.id}
                    value={v.id}
                    disabled={ocupado}
                    style={{ color: ocupado ? '#9ca3af' : undefined }}
                  >
                    {esMia ? '✓ ' : ''}{v.unidad_nombre} ({v.placas})
                    {ocupado ? ` — 🔒 Asignado a: ${v.empleado_asignado_nombre}` : ''}
                  </option>
                );
              })}
            </select>

            {/* Warning: vehicle occupied by someone else */}
            {seleccionOcupada && (
              <div className="rounded-3 p-3 mb-3 d-flex align-items-start gap-2"
                style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
                <Lock size={15} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
                <p className="mb-0" style={{ fontSize: 12, color: '#dc2626' }}>
                  Esta unidad ya está asignada a <strong>{infoSeleccionado.empleado_asignado_nombre}</strong>.
                  Primero ve al modal de ese empleado y selecciona <em>"Sin unidad asignada"</em>.
                </p>
              </div>
            )}

            {/* Confirm removing vehicle */}
            {quitandoUnidad && (
              <div className="rounded-3 p-3 mb-1 d-flex align-items-start gap-2"
                style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                <AlertCircle size={15} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
                <p className="mb-0" style={{ fontSize: 12, color: '#92400e' }}>
                  Se quitará la unidad <strong>{vehiculoActual?.unidad_nombre}</strong> de {empNombre}.
                  El vehículo quedará libre para ser asignado a otro empleado.
                </p>
              </div>
            )}

            {/* Info of selected vehicle */}
            {infoSeleccionado && !seleccionOcupada && !quitandoUnidad && (
              <div className="rounded-3 p-3 mb-1" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <div className="row g-2">
                  <div className="col-6">
                    <p className="mb-0 text-muted" style={{ fontSize: 11 }}>Modelo</p>
                    <p className="fw-bold mb-0" style={{ fontSize: 14 }}>{infoSeleccionado.modelo}</p>
                  </div>
                  <div className="col-6">
                    <p className="mb-0 text-muted" style={{ fontSize: 11 }}>Kilometraje</p>
                    <p className="fw-bold mb-0 d-flex align-items-center gap-1" style={{ fontSize: 14 }}>
                      <Gauge size={14} style={{ color: '#64748b' }} />
                      {Number(infoSeleccionado.kilometraje_actual || 0).toLocaleString()} km
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="modal-footer border-0 px-4 pb-4 pt-0 gap-2">
        <button className="btn btn-outline-secondary rounded-3 px-4" onClick={onClose} disabled={saving}>
          Cancelar
        </button>
        <button
          className="btn fw-bold rounded-3 px-4 d-flex align-items-center gap-2"
          style={{
            background: confirmDisabled
              ? '#94a3b8'
              : quitandoUnidad ? '#dc2626' : '#0f172a',
            color: '#fff',
            border: 'none',
            cursor: confirmDisabled ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
          onClick={handleConfirmar}
          disabled={confirmDisabled}
        >
          {saving
            ? <><span className="spinner-border spinner-border-sm" /> Guardando...</>
            : quitandoUnidad
              ? 'Quitar unidad'
              : <><CheckCircle2 size={16} /> Confirmar Asignación</>
          }
        </button>
      </div>
    </div>
  );
}
