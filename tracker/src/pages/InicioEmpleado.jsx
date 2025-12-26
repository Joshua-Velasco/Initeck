import React, { useState, useEffect } from 'react';
import { 
  Navigation, List, Wallet, ChevronRight, Trash2, Plus, DollarSign 
} from 'lucide-react';
import ViajeMapa from '../components/Viajes/ViajeMapa';

export default function ViajesEmpleado() {
  const colorGuinda = "#800020";
  const [viajeActivo, setViajeActivo] = useState(false);
  const [mostrarLiquidacion, setMostrarLiquidacion] = useState(false);
  
  // Estado para GPS
  const [path, setPath] = useState([]); 
  
  // Estado para Finanzas y Gastos Adicionales
  const [finanzas, setFinanzas] = useState({ monto: '', propinas: '' });
  const [gastosAdicionales, setGastosAdicionales] = useState([]);
  const [historialDia, setHistorialDia] = useState([
    { id: 1, hora: "08:30 AM", monto: "250.00", neto: "180.00", gastos: "70.00" }
  ]);

  // RASTREO GPS
  useEffect(() => {
    let watchId;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const nuevaPos = [latitude, longitude];
          setPath(prevPath => viajeActivo ? [...prevPath, nuevaPos] : [nuevaPos]);
        },
        (err) => console.error("Error GPS:", err),
        { enableHighAccuracy: true, distanceFilter: 2 }
      );
    }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [viajeActivo]);

  // FUNCIONES PARA GASTOS
  const agregarGasto = () => {
    setGastosAdicionales([...gastosAdicionales, { id: Date.now(), concepto: '', monto: '' }]);
  };

  const eliminarGasto = (id) => {
    setGastosAdicionales(gastosAdicionales.filter(g => g.id !== id));
  };

  const actualizarGasto = (id, campo, valor) => {
    setGastosAdicionales(gastosAdicionales.map(g => g.id === id ? { ...g, [campo]: valor } : g));
  };

  const finalizarLiquidacion = () => {
    const totalGastos = gastosAdicionales.reduce((acc, g) => acc + parseFloat(g.monto || 0), 0);
    const netoFinal = (parseFloat(finanzas.monto || 0) + parseFloat(finanzas.propinas || 0)) - totalGastos;

    const nuevoRegistro = {
      id: Date.now(),
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      monto: finanzas.monto,
      gastos: totalGastos.toFixed(2),
      neto: netoFinal.toFixed(2)
    };

    setHistorialDia([nuevoRegistro, ...historialDia]);
    setMostrarLiquidacion(false);
    setViajeActivo(false);
    setFinanzas({ monto: '', propinas: '' });
    setGastosAdicionales([]);
    setPath([path[path.length - 1]]); // Dejar solo la ubicación actual
  };

  return (
    <div className="container-fluid py-4 animate__animated animate__fadeIn" style={{ maxWidth: '550px', backgroundColor: '#f4f4f7', minHeight: '100vh' }}>
      
      {/* 1. HEADER */}
      <div className="card border-0 shadow-lg mb-4 overflow-hidden" style={{ borderRadius: '20px' }}>
        <div className="p-4 d-flex align-items-center justify-content-between" 
             style={{ background: viajeActivo ? `linear-gradient(135deg, ${colorGuinda}, #a30029)` : 'linear-gradient(135deg, #2c3e50, #000000)', color: 'white' }}>
          <div className="d-flex align-items-center gap-3">
            <div className="bg-white rounded-circle p-3 text-dark shadow-sm d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
              <Navigation size={24} className={viajeActivo ? 'animate-pulse text-danger' : ''} />
            </div>
            <div className="text-start">
              <h5 className="mb-0 fw-bold">{viajeActivo ? 'EN SERVICIO' : 'MODO ESPERA'}</h5>
              <small className="opacity-75">{path.length > 0 ? 'Localización Activa' : 'Buscando GPS...'}</small>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAPA / LIQUIDACIÓN */}
      {!mostrarLiquidacion ? (
        <div className="mb-4">
          <div className="overflow-hidden shadow-lg" style={{ borderRadius: '25px', height: '300px' }}>
            <ViajeMapa path={path} colorGuinda={colorGuinda} />
          </div>
          
          <div className="p-3 text-center">
            {!viajeActivo ? (
              <button onClick={() => setViajeActivo(true)} className="btn w-100 py-3 fw-bold text-white shadow" 
                style={{ backgroundColor: colorGuinda, borderRadius: '15px' }}>
                INICIAR NUEVO VIAJE
              </button>
            ) : (
              <button onClick={() => setMostrarLiquidacion(true)} className="btn btn-danger w-100 py-3 fw-bold shadow-lg" 
                style={{ borderRadius: '15px' }}>
                FINALIZAR Y COBRAR
              </button>
            )}
          </div>
        </div>
      ) : (
        /* 3. PANEL DE LIQUIDACIÓN CON GASTOS */
        <div className="card border-0 shadow-lg mb-4 p-4 text-start animate__animated animate__fadeInUp" style={{ borderRadius: '25px' }}>
          <h5 className="fw-bold mb-4 d-flex align-items-center gap-2"><Wallet style={{color: colorGuinda}}/> Liquidación de Viaje</h5>
          
          <div className="row g-3 mb-3">
            <div className="col-6">
              <label className="small fw-bold text-muted">Monto Cobrado ($)</label>
              <input type="number" className="form-control border-0 bg-light fw-bold" placeholder="0.00" value={finanzas.monto} onChange={(e)=>setFinanzas({...finanzas, monto: e.target.value})} />
            </div>
            <div className="col-6">
              <label className="small fw-bold text-muted">Propina ($)</label>
              <input type="number" className="form-control border-0 bg-light text-success fw-bold" placeholder="0.00" value={finanzas.propinas} onChange={(e)=>setFinanzas({...finanzas, propinas: e.target.value})} />
            </div>
          </div>

          {/* Sección Otros Gastos */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="small fw-bold text-muted">OTROS GASTOS (Casetas, Gas, etc)</label>
              <button onClick={agregarGasto} className="btn btn-sm btn-outline-secondary rounded-pill px-2 py-0"><Plus size={14}/></button>
            </div>
            {gastosAdicionales.map(g => (
              <div key={g.id} className="d-flex gap-2 mb-2">
                <input type="text" placeholder="Nota" className="form-control form-control-sm border-0 bg-light" value={g.concepto} onChange={(e)=>actualizarGasto(g.id, 'concepto', e.target.value)} />
                <input type="number" placeholder="$" className="form-control form-control-sm border-0 bg-light fw-bold text-danger" style={{width: '80px'}} value={g.monto} onChange={(e)=>actualizarGasto(g.id, 'monto', e.target.value)} />
                <button onClick={() => eliminarGasto(g.id)} className="btn btn-sm text-danger"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>

          <button onClick={finalizarLiquidacion} className="btn btn-success w-100 py-3 fw-bold shadow" style={{ borderRadius: '15px' }}>
            GUARDAR Y FINALIZAR
          </button>
          <button onClick={() => setMostrarLiquidacion(false)} className="btn btn-link btn-sm w-100 mt-2 text-muted">Cancelar</button>
        </div>
      )}

      {/* 4. HISTORIAL */}
      <div className="card border-0 shadow-lg text-start" style={{ borderRadius: '25px' }}>
        <div className="card-header bg-white border-0 pt-4 px-4">
          <h6 className="fw-bold mb-0">RESUMEN DEL DÍA</h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-borderless align-middle">
              <thead className="bg-light text-muted" style={{ fontSize: '10px' }}>
                <tr><th className="ps-4">HORA</th><th>COBRO</th><th className="text-end pe-4">NETO</th></tr>
              </thead>
              <tbody>
                {historialDia.map((v) => (
                  <tr key={v.id} className="border-bottom">
                    <td className="ps-4 py-3 small text-muted">{v.hora}</td>
                    <td>
                        <div className="fw-bold">${v.monto}</div>
                        {v.gastos > 0 && <div className="text-danger" style={{fontSize: '10px'}}>-${v.gastos} gastos</div>}
                    </td>
                    <td className="text-end pe-4 fw-bold text-primary">${v.neto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}