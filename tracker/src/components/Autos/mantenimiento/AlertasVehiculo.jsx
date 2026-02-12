import React, { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, Plus, Trash2, CheckCircle, Clock } from 'lucide-react';
import { TALLER_ALERTAS_URL } from '../../../config';
import ModalBorrar from '../estatus/ModalBorrar';

export default function AlertasVehiculo({ unidadId, vehiculos = [] }) {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nuevaAlerta, setNuevaAlerta] = useState({ unidad_id: '', titulo: '', fecha: '', dias_anticipacion: 3 });
  const [showForm, setShowForm] = useState(false);
  const [alertaParaBorrar, setAlertaParaBorrar] = useState(null);

  const fetchAlertas = async () => {
    // If global (no unidadId), fetch all. If specific, fetch specific.
    const url = unidadId ? `${TALLER_ALERTAS_URL}?unidad_id=${unidadId}` : TALLER_ALERTAS_URL;
    setLoading(true);
    try {
      const res = await fetch(url);
      if (res.ok) {
        setAlertas(await res.json());
      }
    } catch (e) {
      console.error("Error fetching alertas:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchAlertas(); 
    if (unidadId) {
      setNuevaAlerta(prev => ({ ...prev, unidad_id: unidadId }));
    } else {
      setNuevaAlerta(prev => ({ ...prev, unidad_id: '' }));
    }
  }, [unidadId]);

  const handleCrear = async (e) => {
    e.preventDefault();
    // Validate unit selection if global
    const targetUnitId = unidadId || nuevaAlerta.unidad_id;
    if (!targetUnitId) { // Should be handled by required select, but double check
        alert("Selecciona un vehículo");
        return;
    }
    if (!nuevaAlerta.titulo || !nuevaAlerta.fecha) return;

    try {
      const formData = new FormData();
      formData.append('accion', 'crear');
      formData.append('unidad_id', targetUnitId);
      formData.append('titulo', nuevaAlerta.titulo);
      formData.append('fecha', nuevaAlerta.fecha);
      formData.append('dias_anticipacion', nuevaAlerta.dias_anticipacion);

      const res = await fetch(TALLER_ALERTAS_URL, { method: 'POST', body: formData });
      if (res.ok) {
        setShowForm(false);
        setNuevaAlerta({ ...nuevaAlerta, titulo: '', fecha: '', dias_anticipacion: 3 });
        fetchAlertas();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const confirmarBorrado = async () => {
    if (!alertaParaBorrar) return;
    await fetch(`${TALLER_ALERTAS_URL}?id=${alertaParaBorrar}`, { method: 'DELETE' });
    setAlertaParaBorrar(null);
    fetchAlertas();
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-3 mb-3 bg-white">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold m-0 d-flex align-items-center gap-2">
          <AlertTriangle size={18} className="text-warning" />
          {unidadId ? 'Alertas de Unidad' : 'Alertas Globales'}
        </h6>
        <button className="btn btn-sm btn-light text-primary rounded-pill fw-bold" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Nueva Alerta
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCrear} className="mb-3 bg-light p-3 rounded-3 border">
          <h6 className="fw-bold small mb-3 text-primary">Programar Nueva Alerta</h6>
          
          {/* Si no hay unidad pre-seleccionada, mostrar selector */}
          {!unidadId && (
              <div className="mb-2">
                  <label className="form-label small fw-bold text-muted">Vehículo</label>
                  <select 
                    className="form-select form-select-sm" 
                    value={nuevaAlerta.unidad_id} 
                    onChange={e => setNuevaAlerta({ ...nuevaAlerta, unidad_id: e.target.value })}
                    required
                  >
                      <option value="">-- Seleccionar Vehículo --</option>
                      {vehiculos.map(v => (
                          <option key={v.id} value={v.id}>{v.unidad_nombre} - {v.placas}</option>
                      ))}
                  </select>
              </div>
          )}

          <div className="mb-2">
            <label className="form-label small fw-bold text-muted">Concepto / Título</label>
            <input type="text" className="form-control form-control-sm" placeholder="Ej: Pagar Póliza de Seguro, Verificar Emisiones..."
              value={nuevaAlerta.titulo} onChange={e => setNuevaAlerta({ ...nuevaAlerta, titulo: e.target.value })} required />
          </div>
          <div className="row g-2 mb-2">
            <div className="col-8">
              <label className="form-label small fw-bold text-muted">Fecha Límite</label>
              <input type="date" className="form-control form-control-sm"
                value={nuevaAlerta.fecha} onChange={e => setNuevaAlerta({ ...nuevaAlerta, fecha: e.target.value })} required />
            </div>
            <div className="col-4">
              <label className="form-label small fw-bold text-muted">Aviso previo (días)</label>
              <input type="number" className="form-control form-control-sm" placeholder="Días"
                value={nuevaAlerta.dias_anticipacion} onChange={e => setNuevaAlerta({ ...nuevaAlerta, dias_anticipacion: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-sm btn-primary w-100 rounded-pill">Guardar Alerta</button>
        </form>
      )}

      <div className="d-flex flex-column gap-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {alertas.length === 0 && !loading && <span className="text-muted small text-center py-2">No hay alertas programadas.</span>}
        {alertas.map(a => {
          const hoy = new Date();
          const fechaAlerta = new Date(a.fecha);
          const diffTime = fechaAlerta - hoy;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const isNear = diffDays <= a.dias_anticipacion && diffDays >= 0;
          const isPast = diffDays < 0;

          return (
            <div key={a.id} className={`p-2 rounded-3 border d-flex justify-content-between align-items-center ${isPast ? 'bg-danger bg-opacity-10 border-danger' : isNear ? 'bg-warning bg-opacity-10 border-warning' : 'bg-light'}`}>
              <div>
                {!unidadId && <div className="fw-bold x-small text-muted mb-1">{a.unidad_nombre}</div>}
                <div className={`fw-bold small ${isPast ? 'text-danger' : isNear ? 'text-warning' : 'text-dark'}`}>{a.titulo}</div>
                <div className="d-flex align-items-center gap-1 small text-muted">
                  <Clock size={12} /> {new Date(a.fecha).toLocaleDateString('es-MX', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  {isNear && <span className="badge bg-warning text-dark ms-1">Pronto ({diffDays} días)</span>}
                  {isPast && <span className="badge bg-danger ms-1">Vencido</span>}
                </div>
              </div>
              <button onClick={() => setAlertaParaBorrar(a.id)} className="btn btn-sm text-danger opacity-50 hover-opacity-100"><Trash2 size={14} /></button>
            </div>
          );
        })}
      </div>


      {alertaParaBorrar && (
        <ModalBorrar
          titulo="¿Eliminar alerta?"
          mensaje="Esta acción no se puede deshacer."
          onConfirmar={confirmarBorrado}
          onCancelar={() => setAlertaParaBorrar(null)}
        />
      )}
    </div>
  );
}
