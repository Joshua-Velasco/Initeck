import React, { useState, useEffect, useRef } from 'react';
import {
  X, Fuel, CreditCard, Wrench, Settings, Utensils,
  AlertTriangle, PlusCircle, Loader2
} from 'lucide-react';
import { EMPLEADO_OBTENER_ODOMETRO, EMPLEADO_GUARDAR_LIQUIDACION } from '../../../config';
import SignatureCanvas from 'react-signature-canvas';
import CapturaEvidencia from './CapturarEvidencia';
import Swal from 'sweetalert2';
import { dataURLtoBlob } from '../../../utils/api';

export default function FormularioGasto({
  user,
  vehiculoId,
  gastoData = { tipo: '', monto: '', evidencia: null, odometro: '' },
  setGastoData,
  onCancel,
  onGuardar
}) {
  const localSigCanvasRef = useRef(null);
  const [enviando, setEnviando] = useState(false);
  const [ultimoOdometro, setUltimoOdometro] = useState(0);
  const [cargandoOdo, setCargandoOdo] = useState(false);
  const [fotoTablero, setFotoTablero] = useState(null);
  const [nivelGasolina, setNivelGasolina] = useState(50); // Nuevo estado para nivel de gasolina

  useEffect(() => {
    if (vehiculoId) {
      setCargandoOdo(true);
      fetch(`${EMPLEADO_OBTENER_ODOMETRO}?vehiculo_id=${vehiculoId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setUltimoOdometro(data.odometro);
            // Pre-llenar el input de odómetro con el valor actual de la BD
            setGastoData(prev => ({ ...prev, odometro: data.odometro }));
          }
        })
        .catch(err => console.error("Error recuperando odómetro:", err))
        .finally(() => setCargandoOdo(false));
    }
  }, [vehiculoId]);

  const categorias = [
    { id: 'Combustible', nombre: 'Gasolina', icono: <Fuel size={22} /> },
    { id: 'Casetas', nombre: 'Casetas', icono: <CreditCard size={22} /> },
    { id: 'Mantenimiento', nombre: 'Taller', icono: <Wrench size={22} /> },
    { id: 'Lavado', nombre: 'Lavado', icono: <Settings size={22} /> },
    { id: 'Alimentos', nombre: 'Comida', icono: <Utensils size={22} /> },
    { id: 'Otros', nombre: 'Otros', icono: <AlertTriangle size={22} /> },
  ];

  const handleGuardarGasto = async () => {
    const tipoActual = gastoData?.tipo || '';
    const montoNum = parseFloat(gastoData?.monto || 0);
    const odoNum = parseFloat(gastoData?.odometro || 0);

    if (!tipoActual) return Swal.fire("Falta información", "Seleccione una categoría.", "warning");
    if (montoNum <= 0) return Swal.fire("Monto inválido", "Ingrese un monto válido.", "warning");

    if (tipoActual === 'Combustible') {
      if (!gastoData?.odometro) return Swal.fire("Falta odómetro", "Ingrese el kilometraje actual.", "warning");
      if (odoNum <= ultimoOdometro) return Swal.fire("Kilometraje inválido", `El kilometraje debe ser SUPERIOR al anterior (${ultimoOdometro}).`, "warning");
      if (!fotoTablero) return Swal.fire("Falta evidencia", "Tome la foto del tablero.", "warning");
    }

    if (tipoActual === 'Otros') {
      if (!gastoData?.motivo || gastoData.motivo.trim() === '') {
        return Swal.fire("Falta motivo", "Por favor ingrese qué fue lo que ingresó (motivo) en la categoría 'Otros'.", "warning");
      }
    }

    if (!gastoData?.evidencia) return Swal.fire("Falta evidencia", "Tome la foto del ticket.", "warning");

    // Verificación de la firma
    if (!localSigCanvasRef.current || localSigCanvasRef.current.isEmpty()) {
      return Swal.fire("Firma requerida", "Se requiere la firma del empleado.", "warning");
    }

    setEnviando(true);

    try {
      const firmaData = localSigCanvasRef.current.getCanvas().toDataURL('image/png');

      const formData = new FormData();
      formData.append('empleado_id', user?.id || '');
      formData.append('vehiculo_id', vehiculoId || '');
      formData.append('monto_efectivo', 0);
      formData.append('propinas', 0);
      formData.append('viajes', 0);
      formData.append('nuevo_nivel_gasolina', tipoActual === 'Combustible' ? nivelGasolina : '');

      // Firma
      const firmaBlob = dataURLtoBlob(firmaData);
      if (firmaBlob) formData.append('firma', firmaBlob, 'firma_gasto.png');

      // Fotos de gasto
      const ticketBlob = dataURLtoBlob(gastoData.evidencia);
      if (ticketBlob) formData.append('ticket', ticketBlob, 'ticket.png');

      const tableroBlob = dataURLtoBlob(fotoTablero);
      if (tableroBlob) formData.append('tablero', tableroBlob, 'tablero_gasto.png');

      // Gastos como JSON (pero sin las fotos gigantes, solo info básica)
      // El backend buscará 'ticket' y 'tablero' en $_FILES
      const infoGasto = [{
        tipo: tipoActual,
        monto: montoNum,
        odometro: odoNum,
        motivo: gastoData?.motivo || ''
      }];
      formData.append('gastos', JSON.stringify(infoGasto));

      const response = await fetch(EMPLEADO_GUARDAR_LIQUIDACION, {
        method: 'POST',
        body: formData
      });

      const textoRespuesta = await response.text();
      let resultado;
      try {
        resultado = JSON.parse(textoRespuesta);
      } catch (e) {
        throw new Error("El servidor no devolvió un JSON válido: " + textoRespuesta);
      }

      if (resultado.status === "success") {
        await Swal.fire("Guardado", "Gasto registrado correctamente.", "success");
        if (onGuardar) onGuardar();
      } else {
        Swal.fire("Error", resultado.message || "No se pudo guardar", "error");
      }
    } catch (error) {
      console.error("Error detallado:", error);
      Swal.fire("Error de envío", error.message, "error");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
      <div className="bg-warning p-3 d-flex justify-content-between align-items-center text-dark">
        <div className="d-flex align-items-center gap-2">
          <PlusCircle size={22} />
          <h5 className="mb-0 fw-bold text-uppercase">Registrar Gasto</h5>
        </div>
        <button onClick={onCancel} className="btn btn-sm btn-light rounded-circle shadow-sm" disabled={enviando}>
          <X size={20} />
        </button>
      </div>

      <div className="card-body p-3">
        {/* CATEGORÍAS */}
        <div className="d-flex gap-2 overflow-auto pb-3 mb-3" style={{ scrollbarWidth: 'none' }}>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setGastoData({ ...gastoData, tipo: cat.id })}
              className={`btn d-flex flex-column align-items-center justify-content-center rounded-4 p-3 transition-all ${gastoData?.tipo === cat.id ? 'btn-warning text-white shadow' : 'btn-light text-secondary'}`}
              style={{ minWidth: '95px', border: 'none' }}
            >
              {cat.icono}
              <span className="small fw-bold mt-1">{cat.nombre}</span>
            </button>
          ))}
        </div>

        <div className="row g-3">
          <div className="col-6">
            <div className="form-floating shadow-sm rounded-3 overflow-hidden">
              <input type="number" className="form-control border-0 bg-light fs-4 fw-bold"
                placeholder="0.00"
                value={gastoData?.monto || ''}
                onChange={(e) => setGastoData({ ...gastoData, monto: e.target.value })}
              />
              <label className="fw-bold text-secondary small">MONTO $</label>
            </div>
          </div>

          <div className="col-6">
            <div className="form-floating shadow-sm rounded-3 overflow-hidden">
              <input type="number"
                placeholder="KM"
                className={`form-control border-0 fs-4 fw-bold ${parseFloat(gastoData.odometro) < ultimoOdometro ? 'bg-danger-subtle' : 'bg-light'}`}
                value={gastoData?.odometro || ''}
                onChange={(e) => setGastoData({ ...gastoData, odometro: e.target.value })}
                disabled={gastoData?.tipo !== 'Combustible'}
              />
              <label className="fw-bold text-secondary small">
                {cargandoOdo ? '...' : `KM(ANT: ${ultimoOdometro})`}
              </label>
            </div>
          </div>

          {/* MOTIVO (Solo si es Otros) */}
          {gastoData?.tipo === 'Otros' && (
            <div className="col-12 animate__animated animate__fadeIn">
              <div className="form-floating shadow-sm rounded-3 overflow-hidden">
                <input type="text" className="form-control border-0 bg-light fs-5 fw-bold"
                  placeholder="Motivo del gato..."
                  value={gastoData?.motivo || ''}
                  onChange={(e) => setGastoData({ ...gastoData, motivo: e.target.value })}
                />
                <label className="fw-bold text-secondary small">¿QUÉ SE INGRESÓ? (MOTIVO)</label>
              </div>
            </div>
          )}

          {/* NIVEL DE GASOLINA (Solo si es combustible) */}
          {gastoData?.tipo === 'Combustible' && (
            <div className="col-12">
              <div className="p-3 bg-light rounded-4 shadow-sm border animate__animated animate__fadeIn">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="small fw-bold text-primary text-uppercase d-flex align-items-center mb-0">
                    <Fuel size={16} className="me-2" /> Nuevo Nivel de Gasolina
                  </label>
                  <span className="badge bg-primary fs-6">{nivelGasolina}%</span>
                </div>
                <input
                  type="range"
                  className="form-range"
                  min="0" max="100"
                  style={{ accentColor: '#800020' }}
                  value={nivelGasolina}
                  onChange={(e) => setNivelGasolina(parseInt(e.target.value))}
                />
                <div className="d-flex justify-content-between small text-muted mt-1">
                  <span>Vacío</span>
                  <span>Medio</span>
                  <span>Lleno</span>
                </div>
              </div>
            </div>
          )}

          <div className="col-6">
            <div className="row g-2">
              <div className="col-12">
                <label className="small fw-bold text-secondary text-uppercase mb-1 d-block">📸 Ticket</label>
                <CapturaEvidencia
                  foto={gastoData?.evidencia}
                  onCaptura={(img) => setGastoData({ ...gastoData, evidencia: img })}
                />
              </div>
              <div className="col-12">
                <label className={`small fw-bold text-uppercase mb-1 d-block ${gastoData?.tipo === 'Combustible' ? 'text-primary' : 'text-muted'}`}>
                  📸 Tablero
                </label>
                <div style={{ opacity: gastoData?.tipo === 'Combustible' ? 1 : 0.4 }}>
                  <CapturaEvidencia
                    foto={fotoTablero}
                    onCaptura={(img) => setFotoTablero(img)}
                    disabled={gastoData?.tipo !== 'Combustible'}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="small fw-bold text-secondary text-uppercase">Firma</label>
              <button
                type="button"
                className="btn btn-sm text-danger p-0 fw-bold"
                style={{ fontSize: '10px' }}
                onClick={() => localSigCanvasRef.current?.clear()}
              >
                LIMPIAR
              </button>
            </div>
            <div className="bg-white border rounded-4 flex-grow-1 overflow-hidden" style={{ borderStyle: 'dashed', minHeight: '210px' }}>
              <SignatureCanvas
                ref={localSigCanvasRef}
                canvasProps={{ className: 'w-100 h-100', style: { display: 'block' } }}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGuardarGasto}
          disabled={enviando || cargandoOdo}
          className="btn btn-warning w-100 py-3 mt-4 text-white fw-bold rounded-4 shadow-sm"
        >
          {enviando ? <Loader2 className="animate-spin me-2 d-inline" /> : <PlusCircle className="me-2 d-inline" />}
          {enviando ? 'GUARDANDO...' : 'CONFIRMAR GASTO'}
        </button>
      </div>
    </div>
  );
}