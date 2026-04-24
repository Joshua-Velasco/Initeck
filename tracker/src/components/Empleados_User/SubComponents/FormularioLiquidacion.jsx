import React, { useState } from 'react';
import { X, DollarSign, CheckCircle, Loader2, PlusCircle, ChevronDown, ChevronUp, Car } from 'lucide-react';
import { EMPLEADO_GUARDAR_LIQUIDACION } from '../../../config';
import Swal from 'sweetalert2';

const GUINDA = '#6b0f1a';

export default function FormularioLiquidacion({
  user,
  vehiculoId,
  finanzas = { monto_total: 0, propinas: 0, otros_viajes: 0 },
  setFinanzas,
  onCancel,
  onConfirmar
}) {
  const [enviando, setEnviando] = useState(false);
  const [mostrarOtros, setMostrarOtros] = useState(false);

  const montoNum      = parseFloat(finanzas?.monto_total)  || 0;
  const propinasNum   = parseFloat(finanzas?.propinas)      || 0;
  const otrosNum      = parseFloat(finanzas?.otros_viajes)  || 0;
  const total         = (montoNum + propinasNum + otrosNum).toFixed(2);

  const handleConfirmar = async () => {
    if (montoNum <= 0 && otrosNum <= 0) {
      return Swal.fire("Atención", "Ingresa al menos un monto de ventas.", "warning");
    }
    if (!user?.id) {
      return Swal.fire("Error de sesión", "No se detectó el ID del empleado.", "error");
    }

    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append('empleado_id',  user.id);
      formData.append('vehiculo_id',  vehiculoId || '');
      formData.append('monto_efectivo', montoNum);
      formData.append('propinas',      propinasNum);
      formData.append('otros_viajes',  otrosNum);
      formData.append('neto_entregado', total);
      formData.append('viajes', 1);

      const response = await fetch(EMPLEADO_GUARDAR_LIQUIDACION, { method: 'POST', body: formData });
      const textoRespuesta = await response.text();
      let resultado;
      try { resultado = JSON.parse(textoRespuesta); }
      catch (e) { throw new Error("Respuesta inválida del servidor: " + textoRespuesta); }

      if (resultado.status === "success") {
        await Swal.fire("Correcto", "Liquidación guardada correctamente", "success");
        if (onConfirmar) onConfirmar();
      } else {
        Swal.fire("Error del servidor", resultado.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4 animate__animated animate__fadeIn">
      {/* Header */}
      <div className="p-3 d-flex justify-content-between align-items-center text-white"
        style={{ background: '#198754' }}>
        <div className="d-flex align-items-center gap-2">
          <DollarSign size={24} />
          <h5 className="mb-0 fw-bold text-uppercase">Reportar Ventas</h5>
        </div>
        <button onClick={onCancel} className="btn btn-sm btn-light rounded-circle shadow-sm" disabled={enviando}>
          <X size={20} />
        </button>
      </div>

      <div className="card-body p-4">
        <div className="row justify-content-center">
          <div className="col-md-8">

            {/* ── Ingresos principales ── */}
            <div className="rounded-4 p-4 mb-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <p className="fw-bold text-uppercase mb-3" style={{ fontSize: 11, color: '#64748b', letterSpacing: 1 }}>
                Ingresos Uber / Plataforma principal
              </p>

              <div className="form-floating mb-3">
                <input
                  type="number" step="0.01"
                  className="form-control border-0 bg-white fw-bold shadow-sm"
                  style={{ fontSize: '1.4rem', color: '#198754' }}
                  value={finanzas?.monto_total || ''}
                  onChange={(e) => setFinanzas({ ...finanzas, monto_total: e.target.value })}
                  placeholder="0.00"
                />
                <label className="fw-bold text-secondary">EFECTIVO VENTAS ($)</label>
              </div>

              <div className="form-floating">
                <input
                  type="number" step="0.01"
                  className="form-control border-0 bg-white fw-bold shadow-sm"
                  style={{ fontSize: '1.1rem', color: '#0d6efd' }}
                  value={finanzas?.propinas || ''}
                  onChange={(e) => setFinanzas({ ...finanzas, propinas: e.target.value })}
                  placeholder="0.00"
                />
                <label className="fw-bold text-secondary text-uppercase">Propinas ($)</label>
              </div>
            </div>

            {/* ── Otros viajes (colapsable) ── */}
            <div className="rounded-4 mb-4 overflow-hidden" style={{ border: `1.5px solid ${GUINDA}30` }}>
              <button
                type="button"
                className="w-100 d-flex align-items-center justify-content-between px-4 py-3 border-0 fw-bold"
                style={{ background: `${GUINDA}08`, color: GUINDA, fontSize: 13 }}
                onClick={() => setMostrarOtros(v => !v)}
              >
                <span className="d-flex align-items-center gap-2">
                  <Car size={16} />
                  Otros viajes (InDrive, Cabify, taxi, etc.)
                  {otrosNum > 0 && (
                    <span className="badge rounded-pill ms-1" style={{ background: GUINDA, color: '#fff', fontSize: 11 }}>
                      +${otrosNum.toFixed(2)}
                    </span>
                  )}
                </span>
                {mostrarOtros ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {mostrarOtros && (
                <div className="px-4 pb-4 pt-3" style={{ background: '#fff' }}>
                  <p className="text-muted mb-3" style={{ fontSize: 12 }}>
                    Este monto se registra por separado y <strong>no se mezcla</strong> con los ingresos de la plataforma principal. Se incluye en el total a entregar.
                  </p>
                  <div className="form-floating">
                    <input
                      type="number" step="0.01"
                      className="form-control border-0 bg-light fw-bold shadow-sm"
                      style={{ fontSize: '1.1rem', color: GUINDA }}
                      value={finanzas?.otros_viajes || ''}
                      onChange={(e) => setFinanzas({ ...finanzas, otros_viajes: e.target.value })}
                      placeholder="0.00"
                    />
                    <label className="fw-bold" style={{ color: GUINDA }}>EFECTIVO OTROS VIAJES ($)</label>
                  </div>
                </div>
              )}
            </div>

            {/* ── Total ── */}
            <div className="rounded-4 p-3 text-center text-white mb-4 shadow-sm" style={{ background: '#0f172a' }}>
              <span className="small text-uppercase opacity-50 d-block mb-1">Total a Entregar</span>
              <h2 className="display-4 fw-bold text-success mb-0">${total}</h2>
              {otrosNum > 0 && (
                <p className="mb-0 mt-1 opacity-75" style={{ fontSize: 11 }}>
                  Incluye ${otrosNum.toFixed(2)} de otros viajes
                </p>
              )}
            </div>

            <button
              onClick={handleConfirmar}
              disabled={enviando}
              className="btn w-100 py-3 text-white fw-bold rounded-4 shadow-sm d-flex align-items-center justify-content-center gap-2"
              style={{ background: '#198754', border: 'none' }}
            >
              {enviando ? <Loader2 className="animate-spin" size={22} /> : <CheckCircle size={22} />}
              {enviando ? 'GUARDANDO...' : 'CONFIRMAR Y FINALIZAR'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}