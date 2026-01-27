import React, { useRef, useEffect, useState } from 'react';
import { Gauge, Car, Loader2, Eraser, Camera, CheckCircle2, Fuel, X, AlertCircle } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { EMPLEADO_GET_VEHICULOS } from '../../../config';

export default function SeleccionVehiculo({
  datosInicio,
  setDatosInicio,
  onIniciar,
  loading
}) {
  const sigPad = useRef({});
  const [buscandoUnidad, setBuscandoUnidad] = useState(true);
  const [errorApi, setErrorApi] = useState(null);
  const [odoMinimo, setOdoMinimo] = useState(0);

  // Estado paralelo para guardar los objetos File reales
  const [files, setFiles] = useState({
    tablero: null,
    frente: null,
    atras: null,
    izquierdo: null,
    derecho: null
  });

  const [fotos, setFotos] = useState({
    tablero: null,
    frente: null,
    atras: null,
    izquierdo: null,
    derecho: null
  });

  useEffect(() => {
    let isMounted = true;
    const fetchUnidadAsignada = async () => {
      // Evitar llamadas innecesarias si no hay ID
      if (!datosInicio.empleado_id || datosInicio.empleado_id <= 0) {
        if (isMounted) setBuscandoUnidad(false);
        return;
      }

      try {
        setBuscandoUnidad(true);
        setErrorApi(null);

        // Usamos URLSearchParams para asegurar que el formato sea correcto
        // Usamos la constante dinámica en lugar de la URL harcodeada
        const url = `${EMPLEADO_GET_VEHICULOS}?empleado_id=${datosInicio.empleado_id}`;
        const response = await fetch(url);
        const data = await response.json();

        if (isMounted) {
          if (data.status === 'success' && data.vehiculo) {
            const v = data.vehiculo;
            // IMPORTANTE: Ajuste a nombres de columnas reales
            setOdoMinimo(v.kilometraje_actual || 0);
            setDatosInicio(prev => ({
              ...prev,
              id_vehiculo: v.id,
              unidad_nombre: `${v.unidad_nombre} [${v.placas}]`,
              odometro: v.kilometraje_actual || 0,
              gasolina: prev.gasolina || 50
            }));
          } else {
            setErrorApi(data.message || "No tienes una unidad asignada.");
          }
        }
      } catch (error) {
        if (isMounted) setErrorApi("Error de conexión con el servidor local.");
      } finally {
        if (isMounted) setBuscandoUnidad(false);
      }
    };

    fetchUnidadAsignada();
    return () => { isMounted = false; };
  }, [datosInicio.empleado_id]); // Dependencia solo del ID del empleado

  // ... (Funciones handleFileChange, removePhoto, clearSignature, saveSignature se mantienen igual)
  const handleFileChange = (e, campo) => {
    const file = e.target.files[0];
    if (file) {
      // Guardar el archivo real para el envío
      setFiles(prev => ({ ...prev, [campo]: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setFotos(prev => ({ ...prev, [campo]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (e, campo) => {
    e.preventDefault(); e.stopPropagation();
    setFotos(prev => ({ ...prev, [campo]: null }));
    setFiles(prev => ({ ...prev, [campo]: null }));
  };

  const clearSignature = () => {
    sigPad.current.clear();
    setDatosInicio(prev => ({ ...prev, firma: null }));
  };

  const saveSignature = () => {
    if (sigPad.current && !sigPad.current.isEmpty()) {
      setDatosInicio(prev => ({ ...prev, firma: sigPad.current.getCanvas().toDataURL('image/png') }));
    }
  };

  const isMonday = new Date().getDay() === 1;

  // Validación de formulario
  const isFormComplete =
    datosInicio.id_vehiculo &&
    Number(datosInicio.odometro) >= odoMinimo &&
    Number(datosInicio.gasolina) >= 0 &&
    files.tablero &&
    (!isMonday || (files.frente && files.atras && files.izquierdo && files.derecho)) &&
    datosInicio.firma;

  const handleConfirmar = () => {
    // Pasamos tanto los datos, como los ARCHIVOS reales
    onIniciar({ ...datosInicio, evidencia_fotos: fotos, evidencia_files: files });
  };

  const PhotoInput = ({ label, id, value, optional }) => (
    <div className="col-6 col-md-4">
      <label className="small fw-bold text-muted mb-1 d-block text-truncate text-uppercase" style={{ fontSize: '10px' }}>
        {label} {optional && <span className="text-lowercase opacity-50">(Opcional)</span>}
      </label>
      <div
        className={`w-100 rounded-4 border-2 position-relative overflow-hidden d-flex flex-column align-items-center justify-content-center transition-all ${value ? 'border-success' : 'border-dashed bg-light'}`}
        style={{ height: '110px', cursor: 'pointer', borderStyle: value ? 'solid' : 'dashed' }}
      >
        {!value ? (
          <label className="w-100 h-100 d-flex flex-column align-items-center justify-content-center" style={{ cursor: 'pointer' }}>
            <input type="file" accept="image/*" capture="environment" className="d-none" onChange={(e) => handleFileChange(e, id)} />
            <Camera className="text-muted mb-1" size={24} />
            <span className="text-muted fw-bold" style={{ fontSize: '10px' }}>CAPTURAR</span>
          </label>
        ) : (
          <>
            <img src={value} alt={label} className="position-absolute w-100 h-100" style={{ objectFit: 'cover', zIndex: 1 }} />
            <div className="position-absolute top-0 end-0 p-1" style={{ zIndex: 2 }}>
              <button onClick={(e) => removePhoto(e, id)} className="btn btn-danger btn-sm rounded-circle p-1 d-flex align-items-center justify-content-center shadow" style={{ width: '22px', height: '22px' }}><X size={14} /></button>
            </div>
            <div className="position-absolute bottom-0 start-0 w-100 py-1 bg-success text-white text-center" style={{ zIndex: 2, fontSize: '9px', opacity: 0.9 }}><CheckCircle2 size={10} className="me-1" /> LISTO</div>
          </>
        )}
      </div>
    </div>
  );

  if (buscandoUnidad) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center p-5 bg-white rounded-5 shadow-sm mx-auto my-5" style={{ maxWidth: '450px' }}>
        <Loader2 className="animate-spin text-danger mb-3" size={48} />
        <h5 className="fw-bold">Verificando Unidad...</h5>
      </div>
    );
  }

  if (errorApi) {
    return (
      <div className="text-center p-5 bg-white rounded-5 shadow-sm mx-auto my-5" style={{ maxWidth: '450px' }}>
        <AlertCircle className="text-warning mb-3" size={48} />
        <h5 className="fw-bold text-dark">{errorApi}</h5>
        <p className="small text-muted">Contacta al administrador o revisa tu conexión.</p>
      </div>
    );
  }

  return (
    <div className="row justify-content-center mt-2 mb-5 animate__animated animate__fadeIn">
      <div className="col-md-10 col-lg-8">
        <div className="card border-0 shadow-lg rounded-5 overflow-hidden bg-white">
          <div className="p-4 p-md-5 text-center bg-white border-bottom">
            <div className="bg-light text-dark d-inline-block p-3 rounded-circle mb-3 shadow-sm"><Car size={32} /></div>
            <h2 className="fw-bold mb-1">Checklist de Salida</h2>
            <div className="mt-2">
              <span className="badge bg-dark px-4 py-2 rounded-pill shadow-sm">
                {datosInicio.unidad_nombre || 'Sin Unidad'}
              </span>
            </div>
          </div>

          <div className="px-4 px-md-5 py-4">
            <div className="row g-4">
              <div className="col-md-6">
                <label className="small fw-bold mb-1 text-uppercase text-muted">Odómetro (Mín: {odoMinimo})</label>
                <div className={`input-group shadow-sm rounded-4 overflow-hidden border ${Number(datosInicio.odometro) < odoMinimo ? 'border-danger' : ''}`}>
                  <span className="input-group-text border-0 bg-white"><Gauge size={18} /></span>
                  <input
                    type="number"
                    className="form-control py-3 border-0 fw-bold"
                    value={datosInicio.odometro || ''}
                    onChange={(e) => setDatosInicio(prev => ({ ...prev, odometro: e.target.value }))}
                  />
                </div>
                {Number(datosInicio.odometro) < odoMinimo && <small className="text-danger" style={{ fontSize: '10px' }}>El valor no puede ser menor al actual.</small>}
              </div>

              <div className="col-md-6">
                <label className="small fw-bold mb-1 text-uppercase text-muted d-flex justify-content-between">
                  <span>Nivel de Gasolina</span>
                  <span className={`badge rounded-pill ${datosInicio.gasolina < 20 ? 'bg-danger' : 'bg-success'}`}>{datosInicio.gasolina}%</span>
                </label>
                <div className="p-3 bg-light rounded-4 border shadow-sm d-flex align-items-center gap-3">
                  <Fuel size={20} className="text-muted" />
                  <input type="range" className="form-range" min="0" max="100" step="1" style={{ accentColor: '#800020' }} value={datosInicio.gasolina || 0} onChange={(e) => setDatosInicio(prev => ({ ...prev, gasolina: e.target.value }))} />
                </div>
              </div>

              <div className="col-12 mt-4">
                <label className="small fw-bold mb-3 text-uppercase text-muted d-block border-bottom pb-2">
                  Evidencia Fotográfica {isMonday ? '(Obligatoria Lunes)' : '(Simplificada)'}
                </label>
                <div className="row g-3">
                  <PhotoInput label="TABLERO / ODÓMETRO" id="tablero" value={fotos.tablero} optional={false} />
                  <PhotoInput label="FRENTE" id="frente" value={fotos.frente} optional={!isMonday} />
                  <PhotoInput label="ATRAS" id="atras" value={fotos.atras} optional={!isMonday} />
                  <PhotoInput label="IZQUIERDO" id="izquierdo" value={fotos.izquierdo} optional={!isMonday} />
                  <PhotoInput label="DERECHO" id="derecho" value={fotos.derecho} optional={!isMonday} />
                </div>
              </div>

              <div className="col-12 mt-4">
<<<<<<< HEAD
                <label className="small fw-bold mb-2 text-uppercase text-muted">Comentarios / Reporte de Fallas (Opcional)</label>
                <textarea
                  className="form-control rounded-4 shadow-sm border-0 bg-light"
                  rows="3"
                  placeholder="Escribe aquí si detectas alguna falla, golpe nuevo o detalle importante..."
                  value={datosInicio.comentarios || ''}
                  onChange={(e) => setDatosInicio(prev => ({ ...prev, comentarios: e.target.value }))}
                ></textarea>
              </div>

              <div className="col-12 mt-4">
=======
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="small fw-bold text-uppercase text-muted">Firma de Salida</label>
                  <button onClick={clearSignature} className="btn btn-sm text-danger fw-bold d-flex align-items-center gap-1 text-decoration-none"><Eraser size={14} /> Limpiar</button>
                </div>
                <div className="bg-light rounded-4 border border-2 overflow-hidden" style={{ height: '160px', borderStyle: 'dashed' }}>
                  <SignatureCanvas ref={sigPad} onEnd={saveSignature} canvasProps={{ width: 600, height: 160, className: 'sigCanvas w-100' }} />
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirmar}
              className="btn w-100 py-3 rounded-pill fw-bold mt-5 shadow-lg border-0 text-white"
              style={{ background: isFormComplete ? 'linear-gradient(135deg, #800020 0%, #a50029 100%)' : '#ccc' }}
              disabled={loading || !isFormComplete}
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'CONFIRMAR E INICIAR JORNADA'}
            </button>

            {!isFormComplete && (
              <p className="text-muted text-center extra-small mt-3" style={{ fontSize: '11px' }}>
                * {isMonday
                  ? "Los lunes debe completar las 5 fotos y la firma para continuar."
                  : "Por ser día entre semana, solo la foto del Tablero y la firma son obligatorias."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}