import React, { useState } from 'react';
import { X, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import { EMPLEADO_GUARDAR_LIQUIDACION } from '../../../config';
import Swal from 'sweetalert2';

export default function FormularioLiquidacion({
  user,
  vehiculoId,
  finanzas = { monto_total: 0, propinas: 0 },
  setFinanzas,
  onCancel,
  onConfirmar
}) {
  const [enviando, setEnviando] = useState(false);

  // Forzamos conversión a número para el cálculo visual
  const montoNum = parseFloat(finanzas?.monto_total) || 0;
  const propinasNum = parseFloat(finanzas?.propinas) || 0;
  const total = (montoNum + propinasNum).toFixed(2);

  const handleConfirmar = async () => {
    // Validaciones
    if (montoNum <= 0) {
      return Swal.fire("Atención", "Ingrese el monto total de las ventas.", "warning");
    }

    if (!user?.id) {
      return Swal.fire("Error de sesión", "No se detectó el ID del empleado.", "error");
    }

    setEnviando(true);

    try {
      const formData = new FormData();
      formData.append('empleado_id', user.id);
      formData.append('vehiculo_id', vehiculoId || '');
      formData.append('monto_efectivo', montoNum);
      formData.append('propinas', propinasNum);
      formData.append('neto_entregado', total);
      formData.append('viajes', 1);

      console.log("Enviando via FormData...");

      const response = await fetch(EMPLEADO_GUARDAR_LIQUIDACION, {
        method: 'POST',
        body: formData
      });

      // Validar si la respuesta es JSON válido
      const textoRespuesta = await response.text();
      let resultado;
      try {
        resultado = JSON.parse(textoRespuesta);
      } catch (e) {
        throw new Error("El servidor no devolvió un JSON válido: " + textoRespuesta);
      }

      if (resultado.status === "success") {
        await Swal.fire("Correcto", "Liquidación guardada correctamente", "success");
        if (onConfirmar) onConfirmar();
      } else {
        Swal.fire("Error del servidor", resultado.message, "error");
      }
    } catch (error) {
      console.error("Error detallado:", error);
      Swal.fire("Error", error.message, "error");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4 animate__animated animate__fadeIn">
      <div className="bg-success p-3 d-flex justify-content-between align-items-center text-white">
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
            <div className="card border-0 bg-light rounded-4 p-4 mb-4">
              <div className="form-floating mb-3">
                <input
                  type="number"
                  step="0.01"
                  className="form-control border-0 bg-white fs-4 fw-bold text-success shadow-sm"
                  value={finanzas?.monto_total || ''}
                  onChange={(e) => setFinanzas({ ...finanzas, monto_total: e.target.value })}
                  placeholder="0.00"
                />
                <label className="fw-bold text-secondary">TOTAL VENTAS ($)</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="number"
                  step="0.01"
                  className="form-control border-0 bg-white fs-5 fw-bold text-primary shadow-sm"
                  value={finanzas?.propinas || ''}
                  onChange={(e) => setFinanzas({ ...finanzas, propinas: e.target.value })}
                  placeholder="0.00"
                />
                <label className="fw-bold text-secondary text-uppercase">Propinas / Otros ($)</label>
              </div>

              <div className="bg-dark rounded-4 p-3 text-center text-white shadow-sm mt-4">
                <span className="small text-uppercase opacity-50">Total a Entregar</span>
                <h2 className="display-4 fw-bold text-success mb-0">${total}</h2>
              </div>
            </div>

            <button
              onClick={handleConfirmar}
              disabled={enviando}
              className="btn btn-success w-100 py-3 text-white fw-bold rounded-4 shadow-sm d-flex align-items-center justify-content-center gap-2"
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