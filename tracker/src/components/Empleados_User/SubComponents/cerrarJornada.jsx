import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { CheckCircle, Loader2, Send, LogOut, Gauge, Fuel } from 'lucide-react';
import { EMPLEADO_FINALIZAR_JORNADA } from '../../../config';

const CerrarJornada = ({ user, datosInicio, onCancel }) => {
  const sigCanvas = useRef({});
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Estados para los datos de cierre
  const [cierre, setCierre] = useState({
    odometro: datosInicio?.odometro || 0,
<<<<<<< HEAD
    gasolina: datosInicio?.gasolina || 50, // Inicia con lo que reportó al entrar
    comentarios: ''
=======
    gasolina: datosInicio?.gasolina || 50 // Inicia con lo que reportó al entrar
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
  });

  // Helper para convertir base64 a Blob
  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleFinalizar = async () => {
    // Validación de Odómetro (no puede retroceder)
    if (Number(cierre.odometro) < Number(datosInicio?.odometro)) {
      return alert(`⚠️ Error: El odómetro final (${cierre.odometro}) no puede ser menor al inicial (${datosInicio?.odometro})`);
    }

    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      return alert("⚠️ Se requiere tu firma para finalizar.");
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('operador_id', user?.id);
      formData.append('vehiculo_id', datosInicio?.id_vehiculo);
      formData.append('odometro_final', cierre.odometro);
      formData.append('gasolina_final', cierre.gasolina);
<<<<<<< HEAD
      formData.append('comentarios', cierre.comentarios || '');
=======
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)

      // Firma (Base64 -> File)
      const firmaBase64 = sigCanvas.current.getCanvas().toDataURL('image/png');
      const firmaBlob = dataURLtoBlob(firmaBase64);
      formData.append('firma', firmaBlob, 'firma_cierre.png');

      const response = await fetch(EMPLEADO_FINALIZAR_JORNADA, {
        method: 'POST',
        body: formData
        // Content-Type se gestiona automático para FormData
      });

      // Manejo robusto de respuesta (Text -> JSON)
      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error("Error parseando JSON:", text);
        const errorMessage = text.includes("Too Large")
          ? "El envío es demasiado grande para el servidor (Error 413)."
          : `Error del servidor (No retornó JSON). Respuesta parcial: ${text.substring(0, 100)}...`;
        throw new Error(errorMessage);
      }

      if (result.status === "success") {
        setSuccessData(result.resumen);
      } else {
        alert("❌ Error: " + result.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error en finalizar:", error);
      alert(`❌ Error al finalizar: ${error.message}`);
      setLoading(false);
    }
  };

  const finalizarYRefrescar = () => { window.location.reload(); };

  if (successData) {
    return (
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden animate__animated animate__zoomIn">
        <div className="bg-success p-5 text-white text-center">
          <CheckCircle className="mb-3" size={60} />
          <h2 className="fw-bold mb-0">¡JORNADA CERRADA!</h2>
          <p className="opacity-75">Vehículo actualizado y totales liquidados</p>
        </div>
        <div className="card-body p-4 text-center">
          <div className="row g-3 mb-4 text-center">
            <div className="col-6 border-end">
              <small className="text-muted fw-bold d-block">ODO FINAL</small>
              <span className="h6 fw-bold">{cierre.odometro} km</span>
            </div>
            <div className="col-6">
              <small className="text-muted fw-bold d-block">GAS FINAL</small>
              <span className="h6 fw-bold">{cierre.gasolina}%</span>
            </div>
          </div>

          <div className="p-4 bg-dark text-white rounded-4 shadow mb-4">
            <small className="text-warning fw-bold d-block mb-1">EFECTIVO A ENTREGAR</small>
            <h2 className="fw-bold mb-0 text-warning">${successData.total.toFixed(2)}</h2>
          </div>

          <button onClick={finalizarYRefrescar} className="btn btn-success w-100 py-3 fw-bold rounded-4 shadow">
            <LogOut size={20} className="me-2" /> FINALIZAR Y SALIR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-lg rounded-4 overflow-hidden animate__animated animate__fadeIn">
      <div className="bg-dark p-4 text-white text-center">
        <h4 className="fw-bold mb-0">REGISTRO DE ENTREGA</h4>
        <p className="small opacity-75 mb-0">Confirma el estado final de la unidad</p>
      </div>

      <div className="card-body p-4">
        <div className="row g-3 mb-4">
          <div className="col-6">
            <label className="small fw-bold text-muted text-uppercase mb-1">Odómetro Final</label>
            <div className="input-group border rounded-3 shadow-sm">
              <span className="input-group-text bg-white border-0 text-muted"><Gauge size={16} /></span>
              <input
                type="number"
                className="form-control border-0 fw-bold"
                value={cierre.odometro}
                onChange={(e) => setCierre({ ...cierre, odometro: e.target.value })}
              />
            </div>
          </div>
          <div className="col-6">
            <label className="small fw-bold text-muted text-uppercase mb-1 d-flex justify-content-between">
              <span>Gasolina</span>
              <span className="text-danger">{cierre.gasolina}%</span>
            </label>
            <div className="d-flex align-items-center bg-light p-2 rounded-3 border shadow-sm">
              <Fuel size={16} className="me-2 text-muted" />
              <input
                type="range"
                className="form-range"
                min="0" max="100"
                style={{ accentColor: '#800020' }}
                value={cierre.gasolina}
                onChange={(e) => setCierre({ ...cierre, gasolina: parseInt(e.target.value) })}
              />
            </div>
<<<<<<< HEAD

        <div className="mb-4">
          <label className="small fw-bold text-muted text-uppercase mb-2">Comentarios / Fallas Finales</label>
          <textarea
            className="form-control rounded-4 bg-light border-0 shadow-sm"
            rows="3"
            placeholder="¿Alguna novedad al cerrar turno? (Opcional)"
            value={cierre.comentarios}
            onChange={(e) => setCierre({ ...cierre, comentarios: e.target.value })}
          ></textarea>
        </div>
=======
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
          </div>
        </div>

        <div className="mb-4">
          <div className="d-flex justify-content-between mb-2">
            <label className="fw-bold small text-secondary">FIRMA DE CONFORMIDAD</label>
            <button onClick={() => sigCanvas.current.clear()} className="btn btn-sm text-danger fw-bold">LIMPIAR</button>
          </div>
          <div className="border rounded-4 bg-white" style={{ height: '150px', borderStyle: 'dashed' }}>
            <SignatureCanvas ref={sigCanvas} penColor="black" canvasProps={{ className: 'w-100 h-100' }} />
          </div>
        </div>

        <div className="d-grid gap-2">
          <button className="btn btn-dark py-3 fw-bold rounded-4 shadow" onClick={handleFinalizar} disabled={loading}>
            {loading ? <Loader2 className="animate-spin me-2" /> : <Send size={18} className="me-2" />}
            {loading ? 'ACTUALIZANDO UNIDAD...' : 'CONFIRMAR Y FINALIZAR'}
          </button>
          <button className="btn btn-link text-muted" onClick={onCancel} disabled={loading}>Regresar</button>
        </div>
      </div>
    </div>
  );
};

export default CerrarJornada;