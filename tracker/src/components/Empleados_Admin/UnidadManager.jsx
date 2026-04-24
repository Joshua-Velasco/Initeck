import React, { useState, useEffect } from 'react';
import { Car, Edit2, CheckCircle2, Loader2, Gauge, AlertCircle, Lock } from 'lucide-react';
import { API_URLS, COLORS } from '../../constants/theme';

const SIN_UNIDAD = '__sin_unidad__';

export const UnidadManager = ({
  empleado,
  onAsignar,
  onClose,
  isModal = false,
  colorGuinda = COLORS.guinda
}) => {
  const [vehiculos, setVehiculos]               = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [saving, setSaving]                     = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState('');
  const [editandoUnidad, setEditandoUnidad]     = useState(false);

  useEffect(() => {
    const fetchVehiculos = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API_URLS.vehiculos}listar.php`);
        const data = await res.json();
        if (Array.isArray(data)) setVehiculos(data.filter(v => v.estado === 'Activo'));
      } catch (e) {
        console.error('Error cargando vehículos:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchVehiculos();
  }, [empleado?.vehiculo_id]);

  useEffect(() => {
    setSelectedVehiculo(empleado?.vehiculo_id ? String(empleado.vehiculo_id) : '');
  }, [empleado]);

  const empNombre = empleado?.nombre_completo ?? empleado?.nombre ?? '';

  // Occupied by a DIFFERENT employee
  const ocupadoPorOtro = (v) =>
    v.empleado_asignado_id &&
    String(v.empleado_asignado_id) !== String(empleado?.id);

  const vehiculoActual   = vehiculos.find(v => String(v.id) === String(empleado?.vehiculo_id));
  const infoSeleccionado = vehiculos.find(v => String(v.id) === selectedVehiculo);
  const seleccionOcupada = infoSeleccionado && ocupadoPorOtro(infoSeleccionado);
  const quitandoUnidad   = selectedVehiculo === SIN_UNIDAD;

  const handleConfirmar = async () => {
    if (!empleado?.id) return;
    setSaving(true);
    try {
      if (quitandoUnidad) {
        const res  = await fetch(`${API_URLS.empleados}quitar_unidad.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ empleado_id: empleado.id })
        });
        const data = await res.json();
        if (data.status === 'success') { onAsignar?.(); onClose?.(); setEditandoUnidad(false); }
        else alert(data.message);
      } else {
        if (!selectedVehiculo || seleccionOcupada) return;
        const res  = await fetch(`${API_URLS.empleados}asignar_unidad.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ empleado_id: empleado.id, vehiculo_id: selectedVehiculo })
        });
        const data = await res.json();
        if (data.status === 'success') { onAsignar?.(); onClose?.(); setEditandoUnidad(false); }
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
    !selectedVehiculo ||
    (!quitandoUnidad && seleccionOcupada) ||
    (!quitandoUnidad && selectedVehiculo === String(empleado?.vehiculo_id));

  // ── Selector JSX (shared between modal and sidebar) ──
  const selectorJSX = (
    <>
      <select
        className="form-select form-select-lg mb-3 shadow-sm"
        value={selectedVehiculo}
        onChange={(e) => setSelectedVehiculo(e.target.value)}
        style={{ borderRadius: 10 }}
      >
        <option value="">-- Seleccione una unidad --</option>

        {vehiculoActual && (
          <option value={SIN_UNIDAD}>✕ Sin unidad asignada</option>
        )}

        {vehiculos.map(v => {
          const ocupado = ocupadoPorOtro(v);
          const esMia   = String(v.id) === String(empleado?.vehiculo_id);
          return (
            <option key={v.id} value={v.id} disabled={ocupado}
              style={{ color: ocupado ? '#9ca3af' : undefined }}>
              {esMia ? '✓ ' : ''}{v.unidad_nombre} ({v.placas})
              {ocupado ? ` — 🔒 Asignado a: ${v.empleado_asignado_nombre}` : ''}
            </option>
          );
        })}
      </select>

      {seleccionOcupada && (
        <div className="rounded-3 p-3 mb-3 d-flex align-items-start gap-2"
          style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
          <Lock size={14} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
          <p className="mb-0" style={{ fontSize: 12, color: '#dc2626' }}>
            Esta unidad ya está asignada a <strong>{infoSeleccionado.empleado_asignado_nombre}</strong>.
            Primero ve al modal de ese empleado y selecciona <em>"Sin unidad asignada"</em>.
          </p>
        </div>
      )}

      {quitandoUnidad && (
        <div className="rounded-3 p-3 mb-2 d-flex align-items-start gap-2"
          style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
          <AlertCircle size={14} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
          <p className="mb-0" style={{ fontSize: 12, color: '#92400e' }}>
            Se quitará <strong>{vehiculoActual?.unidad_nombre}</strong> de {empNombre}.
            El vehículo quedará libre para otro empleado.
          </p>
        </div>
      )}

      {infoSeleccionado && !seleccionOcupada && !quitandoUnidad && (
        <div className="rounded-3 p-3 mb-2" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
          <p className="mb-0 text-muted" style={{ fontSize: 11 }}>Kilometraje</p>
          <p className="fw-bold mb-0 d-flex align-items-center gap-1" style={{ fontSize: 14 }}>
            <Gauge size={13} style={{ color: '#64748b' }} />
            {Number(infoSeleccionado.kilometraje_actual || 0).toLocaleString()} km
          </p>
        </div>
      )}
    </>
  );

  // ── MODAL VIEW ──
  if (isModal) {
    return (
      <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
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
              <Loader2 size={28} className="text-secondary mb-2" />
              <p className="text-muted mb-0" style={{ fontSize: 13 }}>Cargando unidades...</p>
            </div>
          ) : (
            <>
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

              <label className="fw-bold mb-2 d-block"
                style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Seleccionar unidad
              </label>
              {selectorJSX}
            </>
          )}
        </div>

        <div className="modal-footer border-0 px-4 pb-4 pt-0 gap-2">
          <button className="btn btn-outline-secondary rounded-3 px-4" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button
            className="btn fw-bold rounded-3 px-4 d-flex align-items-center gap-2"
            style={{
              background: confirmDisabled ? '#94a3b8' : quitandoUnidad ? '#dc2626' : '#0f172a',
              color: '#fff', border: 'none',
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

  // ── SIDEBAR VIEW ──
  return (
    <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
      <h6 className="fw-bold small text-uppercase mb-3 text-muted">Gestión de Unidad</h6>
      <div className="p-4 rounded-4 border-2 bg-light" style={{ border: '2px dashed #e2e8f0' }}>
        {editandoUnidad ? (
          <div>
            {selectorJSX}
            <div className="d-flex gap-2 mt-2">
              <button className="btn btn-dark w-100 rounded-pill btn-sm"
                onClick={handleConfirmar} disabled={confirmDisabled || saving}>
                {saving ? 'Guardando...' : quitandoUnidad ? 'Quitar unidad' : 'Guardar'}
              </button>
              <button className="btn btn-outline-secondary w-100 rounded-pill btn-sm"
                onClick={() => setEditandoUnidad(false)}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white p-3 rounded-circle d-inline-block shadow-sm mb-3">
              <Car size={28} style={{ color: colorGuinda }} />
            </div>
            <h5 className="fw-bold mb-1 text-dark text-truncate px-2">
              {vehiculoActual?.unidad_nombre || 'No Asignado'}
            </h5>
            {vehiculoActual && (
              <div className="small text-muted mb-2">{vehiculoActual.placas}</div>
            )}
            <button className="btn btn-link btn-sm text-decoration-none fw-bold"
              style={{ color: colorGuinda }} onClick={() => setEditandoUnidad(true)}>
              <Edit2 size={12} className="me-1" /> Editar Unidad
            </button>
          </>
        )}
      </div>
    </div>
  );
};
