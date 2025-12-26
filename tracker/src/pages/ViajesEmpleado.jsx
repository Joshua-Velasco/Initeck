import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, Wallet, Trash2, Plus, Camera, CheckCircle2, TrendingUp, AlertTriangle, Clock
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import ViajeMapa from '../components/Viajes/ViajeMapa';

export default function ViajesEmpleado() {
  const colorGuinda = "#800020";
  const sigCanvas = useRef(null); 

  // --- ESTADOS DE UI ---
  const [viajeActivo, setViajeActivo] = useState(false);
  const [mostrarLiquidacion, setMostrarLiquidacion] = useState(false);
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [showAvisoPrevio, setShowAvisoPrevio] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // --- ESTADOS DE DATOS ---
  const [ultimaEntrega, setUltimaEntrega] = useState(null);
  const [path, setPath] = useState([]); 
  const [finanzas, setFinanzas] = useState({ monto_total: '', propinas: '', viajes_realizados: '' });
  const [gastosAdicionales, setGastosAdicionales] = useState([]);
  const [historialDia, setHistorialDia] = useState([]);

  useEffect(() => {
    const hoy = new Date().toLocaleDateString();
    const historialGuardado = JSON.parse(localStorage.getItem('historial_liquidaciones') || '[]');
    setHistorialDia(historialGuardado.filter(item => item.fecha_local === hoy));
  }, []);

  // --- LÓGICA DE COMPRESIÓN DE IMÁGENES ---
  const compressImage = (file, quality = 0.6) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; 
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Exportamos como JPEG comprimido para ahorrar espacio
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
      };
    });
  };

  // --- MANEJO DE GASTOS ---
  const agregarGasto = () => setGastosAdicionales([...gastosAdicionales, { id: Date.now(), concepto: '', monto: '', preview: null }]);
  
  const eliminarGasto = (id) => setGastosAdicionales(gastosAdicionales.filter(g => g.id !== id));
  
  const actualizarGasto = (id, campo, valor) => setGastosAdicionales(gastosAdicionales.map(g => g.id === id ? { ...g, [campo]: valor } : g));

  const manejarArchivoGasto = async (id, file) => {
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      actualizarGasto(id, 'preview', compressed);
    } catch (error) {
      console.error("Error al comprimir imagen:", error);
    }
  };

  // --- CÁLCULOS ---
  const totalGastosActuales = gastosAdicionales.reduce((acc, curr) => acc + parseFloat(curr.monto || 0), 0);
  const totalNetoActual = (parseFloat(finanzas.monto_total || 0) + parseFloat(finanzas.propinas || 0)) - totalGastosActuales;
  const totalAcumuladoDia = historialDia.reduce((acc, curr) => acc + parseFloat(curr.neto), 0);

  // --- ENVÍO DE DATOS ---
  const validarAntesDeEnviar = () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) return alert("Por favor, ingresa la firma de validación.");
    if (!finanzas.monto_total || parseFloat(finanzas.monto_total) <= 0) return alert("El monto debe ser mayor a 0.");
    setShowAvisoPrevio(true);
  };

  const registrarLiquidacion = async () => {
    setShowAvisoPrevio(false);
    setLoading(true);

    try {
      // Captura de firma con fallback por si falla getTrimmedCanvas
      let firmaData = "";
      try {
        firmaData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      } catch (e) {
        firmaData = sigCanvas.current.getCanvas().toDataURL('image/png');
      }

      const payload = {
        operador_id: 1, 
        fecha: new Date().toISOString().split('T')[0],
        viajes: parseInt(finanzas.viajes_realizados) || 0,
        monto: parseFloat(finanzas.monto_total),
        propinas: parseFloat(finanzas.propinas) || 0,
        firma: firmaData,
        gastos: gastosAdicionales.map(g => ({
          concepto: g.concepto,
          monto: parseFloat(g.monto) || 0,
          foto: g.preview 
        }))
      };

      const response = await fetch('http://inimovil.free.nf/Initeck-api/v1/guardar_liquidacion.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.status === "success") {
        const nuevaLiq = {
          id: result.id_viaje,
          fecha_local: new Date().toLocaleDateString(),
          hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          neto: totalNetoActual.toFixed(2),
        };

        const nuevoH = [nuevaLiq, ...historialDia];
        setHistorialDia(nuevoH);
        localStorage.setItem('historial_liquidaciones', JSON.stringify(nuevoH));
        
        setUltimaEntrega(nuevaLiq);
        setShowConfirmacion(true);
        setMostrarLiquidacion(false);
        setFinanzas({ monto_total: '', propinas: '', viajes_realizados: '' });
        setGastosAdicionales([]);
        sigCanvas.current.clear();
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      alert("Error de conexión: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f4f4f7', minHeight: '100vh' }}>
      <div className="row g-4" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* PANEL IZQUIERDO */}
        <div className="col-lg-5">
          <div className="sticky-top" style={{ top: '20px' }}>
            <div className="card border-0 shadow-sm mb-3 text-white" style={{ borderRadius: '25px', background: `linear-gradient(135deg, ${colorGuinda}, #4a0012)` }}>
              <div className="card-body p-4 text-center">
                <span className="small opacity-75 fw-bold text-uppercase d-block mb-1">Acumulado Hoy</span>
                <h1 className="fw-bold mb-0">${totalAcumuladoDia.toLocaleString(undefined, {minimumFractionDigits: 2})}</h1>
              </div>
            </div>

            <div className="card border-0 shadow-sm overflow-hidden mb-3" style={{ borderRadius: '25px', height: '280px' }}>
               <ViajeMapa empleados={[{id: "me", path}]} idSeleccionado="me" colorGuinda={colorGuinda} />
            </div>

            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '25px', maxHeight: '300px', overflowY: 'auto' }}>
                <h6 className="fw-bold mb-3 d-flex align-items-center"><Clock size={18} className="me-2"/> Historial Reciente</h6>
                <div className="vstack gap-2">
                    {historialDia.length === 0 ? <p className="small text-muted text-center py-3">Sin registros hoy</p> : 
                      historialDia.map((item, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4 border-start border-success border-4">
                            <div>
                                <div className="fw-bold small">ID #{item.id}</div>
                                <div className="text-muted small" style={{fontSize: '10px'}}>{item.hora}</div>
                            </div>
                            <div className="fw-bold text-dark">${item.neto}</div>
                        </div>
                      ))
                    }
                </div>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: FORMULARIO */}
        <div className="col-lg-7">
          {!mostrarLiquidacion ? (
            <div className="card border-0 shadow-sm p-5 text-center bg-white" style={{ borderRadius: '25px' }}>
              <Navigation size={48} className="mx-auto mb-3" style={{ color: colorGuinda }} />
              <h3 className="fw-bold">Gestión de Ruta</h3>
              <p className="text-muted">Inicia tu jornada o registra una nueva liquidación de efectivo.</p>
              <button onClick={() => { setViajeActivo(true); setMostrarLiquidacion(true); }} className="btn btn-lg text-white mt-3 py-3 shadow w-100 fw-bold" style={{ backgroundColor: colorGuinda, borderRadius: '15px' }}>
                {viajeActivo ? 'NUEVA LIQUIDACIÓN' : 'INICIAR JORNADA'}
              </button>
            </div>
          ) : (
            <div className="card border-0 shadow-lg text-start" style={{ borderRadius: '25px' }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-2 mb-4">
                    <div className="p-2 rounded-3 text-white" style={{backgroundColor: colorGuinda}}><Wallet size={20}/></div>
                    <h5 className="fw-bold m-0">REGISTRO DE EFECTIVO</h5>
                </div>
                
                <div className="row g-3 mb-4">
                  <div className="col-4">
                    <label className="small fw-bold text-muted">VIAJES</label>
                    <input type="number" className="form-control border-0 bg-light text-center" value={finanzas.viajes_realizados} onChange={(e)=>setFinanzas({...finanzas, viajes_realizados: e.target.value})} />
                  </div>
                  <div className="col-4">
                    <label className="small fw-bold text-muted">MONTO ($)</label>
                    <input type="number" className="form-control border-0 bg-light fw-bold text-center" value={finanzas.monto_total} onChange={(e)=>setFinanzas({...finanzas, monto_total: e.target.value})} />
                  </div>
                  <div className="col-4">
                    <label className="small fw-bold text-muted">PROPINA ($)</label>
                    <input type="number" className="form-control border-0 bg-light text-success fw-bold text-center" value={finanzas.propinas} onChange={(e)=>setFinanzas({...finanzas, propinas: e.target.value})} />
                  </div>
                </div>

                {/* SECCIÓN GASTOS */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="small fw-bold text-muted text-uppercase">Gastos con Ticket</label>
                    <button onClick={agregarGasto} className="btn btn-sm btn-dark rounded-pill px-3"><Plus size={14}/> Añadir Gasto</button>
                  </div>
                  {gastosAdicionales.map((gasto) => (
                    <div key={gasto.id} className="p-3 bg-light rounded-4 mb-2 border border-white shadow-sm">
                      <div className="d-flex gap-2 mb-2">
                        <input type="text" placeholder="Concepto (Ej. Gasolina)" className="form-control form-control-sm border-0" value={gasto.concepto} onChange={(e) => actualizarGasto(gasto.id, 'concepto', e.target.value)} />
                        <input type="number" placeholder="$" className="form-control form-control-sm border-0 fw-bold text-danger w-25" value={gasto.monto} onChange={(e) => actualizarGasto(gasto.id, 'monto', e.target.value)} />
                        <button onClick={() => eliminarGasto(gasto.id)} className="btn btn-sm text-danger p-0 px-2"><Trash2 size={16}/></button>
                      </div>
                      <label className="btn btn-sm btn-white border bg-white shadow-sm d-flex align-items-center gap-2 m-0" style={{fontSize: '11px', width: 'fit-content', borderRadius: '8px'}}>
                        <Camera size={14}/> {gasto.preview ? 'Foto capturada ✓' : 'Tomar foto del ticket'}
                        <input type="file" hidden accept="image/*" capture="environment" onChange={(e) => manejarArchivoGasto(gasto.id, e.target.files[0])} />
                      </label>
                    </div>
                  ))}
                </div>

                {/* FIRMA */}
                <div className="mb-4">
                  <label className="small fw-bold text-muted mb-2">FIRMA DE CONFORMIDAD</label>
                  <div className="border rounded-4 bg-white shadow-inner overflow-hidden" style={{ height: '160px', borderStyle: 'dashed !important' }}>
                    <SignatureCanvas 
                      ref={sigCanvas} 
                      penColor='black' 
                      canvasProps={{ className: 'w-100 h-100' }} 
                    />
                  </div>
                  <button onClick={() => sigCanvas.current.clear()} className="btn btn-sm text-muted mt-1 border-0">Borrar firma</button>
                </div>

                <div className="p-4 rounded-4 mb-4 text-white shadow-sm" style={{ backgroundColor: '#111' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">ENTREGA TOTAL:</span>
                    <span className="h3 fw-bold m-0 text-success">${totalNetoActual.toFixed(2)}</span>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button onClick={() => setMostrarLiquidacion(false)} disabled={loading} className="btn btn-light flex-grow-1 py-3 fw-bold rounded-4">VOLVER</button>
                  <button onClick={validarAntesDeEnviar} disabled={loading} className="btn btn-success flex-grow-1 py-3 fw-bold shadow rounded-4">
                    {loading ? 'PROCESANDO...' : 'CONFIRMAR ENTREGA'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL ADVERTENCIA */}
      {showAvisoPrevio && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 3000 }}>
          <div className="modal-dialog modal-dialog-centered px-3">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '25px' }}>
              <div className="modal-body p-5 text-center">
                <AlertTriangle size={60} className="text-warning mb-3" />
                <h3 className="fw-bold">¿Datos correctos?</h3>
                <p className="text-muted">Revisa que el monto de <b>${totalNetoActual.toFixed(2)}</b> coincida con tu efectivo. No podrás editar este registro después.</p>
                <div className="vstack gap-2 mt-4">
                    <button onClick={registrarLiquidacion} className="btn btn-success py-3 fw-bold rounded-pill">SÍ, GUARDAR TODO</button>
                    <button onClick={() => setShowAvisoPrevio(false)} className="btn btn-light py-3 fw-bold rounded-pill">REVISAR OTRA VEZ</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ÉXITO */}
      {showConfirmacion && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 3001 }}>
          <div className="modal-dialog modal-dialog-centered px-3">
            <div className="modal-content border-0 shadow-lg text-center" style={{ borderRadius: '30px' }}>
              <div className="modal-body p-5">
                <div className="bg-success text-white rounded-circle d-inline-flex p-3 mb-4 shadow-lg animate__animated animate__bounceIn">
                    <CheckCircle2 size={50} />
                </div>
                <h2 className="fw-bold">¡Guardado!</h2>
                <p className="text-muted">Tu liquidación ha sido recibida correctamente.</p>
                <div className="bg-light p-4 rounded-4 mb-4">
                    <div className="d-flex justify-content-between mb-1"><span>Folio:</span> <span className="fw-bold">#{ultimaEntrega?.id}</span></div>
                    <div className="d-flex justify-content-between"><span>Monto:</span> <span className="fw-bold text-success">${ultimaEntrega?.neto}</span></div>
                </div>
                <button onClick={() => setShowConfirmacion(false)} className="btn btn-dark w-100 py-3 fw-bold rounded-4 shadow">LISTO</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}