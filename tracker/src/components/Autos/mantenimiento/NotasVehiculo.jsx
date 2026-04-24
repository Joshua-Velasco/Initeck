import React, { useState, useEffect } from 'react';
import { Plus, X, StickyNote, MessageSquare, Calendar, User, Truck, Check } from 'lucide-react';
import { TALLER_NOTAS_URL, TALLER_COMENTARIOS_URL, BASE_API } from '../../../config';
import ModalBorrar from '../../Autos/estatus/ModalBorrar';

export default function NotasVehiculo({ unidad }) {
  const [notas, setNotas] = useState([]);
  const [comentariosOperadores, setComentariosOperadores] = useState([]);
  const [nuevaNota, setNuevaNota] = useState("");
  const [loading, setLoading] = useState(false);
  const [colorSeleccionado, setColorSeleccionado] = useState('yellow');
  const [notaParaEliminar, setNotaParaEliminar] = useState(null);

  // Colores de post-it disponibles
  const colores = {
    yellow: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' }, // Ambar/Amarillo
    blue:   { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' }, // Azul
    green:  { bg: '#dcfce7', text: '#166534', border: '#86efac' }, // Verde
    pink:   { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' }, // Rosa
  };

  useEffect(() => {
    cargarNotas();
    if (!unidad) {
        cargarComentariosOperadores();
    }
  }, [unidad]);

  const cargarNotas = async () => {
    try {
      setLoading(true);
      const targetId = unidad?.id || 0;
      const res = await fetch(`${TALLER_NOTAS_URL}?vehiculo_id=${targetId}`);
      if (res.ok) {
        const data = await res.json();
        setNotas(data);
      }
    } catch (error) {
      console.error("Error cargando notas:", error);
    } finally {
      setLoading(false);
    }
  };

  const cargarComentariosOperadores = async () => {
    try {
        const res = await fetch(TALLER_COMENTARIOS_URL);
        if (res.ok) {
            const data = await res.json();
            setComentariosOperadores(data);
        }
    } catch (error) {
        console.error("Error cargando comentarios:", error);
    }
  };

  const agregarNota = async (e) => {
    e.preventDefault();
    if (!nuevaNota.trim()) return;

    try {
      const targetId = unidad?.id || 0;
      const res = await fetch(TALLER_NOTAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehiculo_id: targetId,
          nota: nuevaNota,
          color: colorSeleccionado
        })
      });

      if (res.ok) {
        setNuevaNota("");
        cargarNotas();
      }
    } catch (error) {
      console.error("Error guardando nota:", error);
    }
  };

  const solicitarEliminacion = (id) => {
    setNotaParaEliminar(id);
  };

  const confirmarEliminacion = async () => {
    if (!notaParaEliminar) return;
    try {
      await fetch(`${TALLER_NOTAS_URL}?id=${notaParaEliminar}`, { method: 'DELETE' });
      setNotas(prev => prev.filter(n => n.id !== notaParaEliminar));
      setNotaParaEliminar(null);
    } catch (error) {
      console.error("Error eliminando nota:", error);
    }
  };

  const toggleEstadoReporte = async (id, nuevoEstado, tipo) => {
      try {
          const res = await fetch(`${BASE_API}taller/update_reporte_status.php`, {
              method: 'POST',
              body: JSON.stringify({ id, estado: nuevoEstado, tipo })
          });
          
          if (res.ok) {
              setComentariosOperadores(prev => 
                  prev.map(c => c.id === id && c.tipo === tipo ? { ...c, estado_reporte: nuevoEstado } : c)
              );
          }
      } catch (error) {
          console.error("Error actualizando reporte:", error);
      }
  };
  
  const currentUnidadId = unidad?.id || 0;

  return (
    <div className="row g-4 animate__animated animate__fadeInUp">
        {/* COLUMNA IZQUIERDA: NOTAS DE TALLER (POST-ITS) */}
        <div className={unidad ? "col-12" : "col-12 col-lg-7"}>
            <div className="card border-0 shadow-sm bg-white h-100" style={{ borderRadius: '24px' }}>
                <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                    <h5 className="fw-extrabold text-dark mb-0 d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
                    <div className="p-2 rounded-3 bg-light"><StickyNote size={20} className="text-secondary"/></div>
                    {unidad ? 'Notas y Recordatorios' : 'Notas Generales (Taller)'}
                    </h5>
                    <span className="badge bg-light text-muted rounded-pill shadow-sm border px-3 py-2 fw-bold" style={{ fontSize: '0.75rem' }}>{notas.length} notas</span>
                </div>

                <div className="p-4">
                    {/* Formulario de Nueva Nota */}
                    <form onSubmit={agregarNota} className="mb-5 bg-light p-4 rounded-4 border animate__animated animate__fadeIn">
                    <label className="fw-bold text-dark mb-3 d-block text-uppercase small letter-spacing-1">Nueva Nota</label>
                    
                    <div className="d-flex gap-3 mb-4">
                        <label className="small text-muted align-self-center mb-0 fw-bold">COLOR:</label>
                        {Object.keys(colores).map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setColorSeleccionado(c)}
                                className={`btn btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center transition-all ${colorSeleccionado === c ? 'ring-2 ring-offset-2' : ''}`}
                                style={{
                                width: 36, 
                                height: 36, 
                                backgroundColor: colores[c].bg, 
                                border: `2px solid ${colores[c].border}`,
                                transform: colorSeleccionado === c ? 'scale(1.2) translateY(-2px)' : 'scale(1)',
                                boxShadow: colorSeleccionado === c ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                                }}
                                title={`Color ${c}`}
                            />
                        ))}
                    </div>
                    
                    <div className="input-group input-group-lg shadow-sm rounded-pill overflow-hidden">
                        <input
                        type="text"
                        className="form-control border-0 ps-4 fs-6"
                        placeholder="Escribe recordatorio aquí..."
                        value={nuevaNota}
                        onChange={(e) => setNuevaNota(e.target.value)}
                        style={{ padding: '1.2rem' }}
                        />
                        <button className="btn btn-primary px-5 fw-bold d-flex align-items-center gap-2" type="submit" disabled={!nuevaNota.trim()}>
                        <Plus size={24} /> <span>AGREGAR</span>
                        </button>
                    </div>
                    </form>

                    {/* Grid de Post-its */}
                    {loading ? (
                    <div className="text-center py-5 text-muted fs-5">Cargando notas...</div>
                    ) : notas.length === 0 ? (
                    <div className="text-center py-5 rounded-4 text-muted border border-dashed" style={{ backgroundColor: '#f8fafc' }}>
                        <div className="bg-white rounded-circle p-3 d-inline-block shadow-sm mb-3">
                            <StickyNote size={32} className="text-muted opacity-50" />
                        </div>
                        <h5 className="fw-bold text-dark">No hay notas registradas</h5>
                        <p className="fs-6 mb-0">Agrega recordatorios importantes usando el formulario de arriba.</p>
                    </div>
                    ) : (
                    <div className="row g-4">
                        {notas.map((nota) => {
                        const theme = colores[nota.color || 'yellow'];
                        return (
                            <div key={nota.id} className="col-12 col-md-6">
                            <div 
                                className="p-4 rounded-4 position-relative h-100 shadow-sm transition-all hover-lift d-flex flex-column"
                                style={{ 
                                    backgroundColor: theme.bg, 
                                    borderLeft: `8px solid ${theme.border}`,
                                    color: theme.text,
                                    minHeight: '180px',
                                    borderRadius: '24px'
                                }}
                            >
                                <div className="d-flex justify-content-between align-items-start mb-3 border-bottom pb-2" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                                    <small className="opacity-75 fw-bold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                                    {new Date(nota.fecha_creacion).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </small>
                                    <button
                                    onClick={() => solicitarEliminacion(nota.id)}
                                    className="btn btn-sm btn-link text-decoration-none p-0 d-flex align-items-center gap-1 opacity-50 hover-opacity-100 transition-all"
                                    style={{ color: 'inherit' }}
                                    title="Eliminar esta nota"
                                    >
                                    <span className="small fw-bold" style={{ fontSize: '0.7rem' }}>ELIMINAR</span> <X size={18} />
                                    </button>
                                </div>
                                
                                <p className="mb-0 fw-bold flex-grow-1" style={{ fontSize: '1.25rem', lineHeight: '1.4' }}>{nota.nota}</p>
                            </div>
                            </div>
                        );
                        })}
                    </div>
                    )}
                </div>
            </div>
        </div>

        {/* COLUMNA DERECHA: REPORTES OPERADORES (Solo si no hay unidad seleccionada) */}
        {!unidad && (
        <div className="col-12 col-lg-5">
            <div className="card border-0 shadow-sm bg-white h-100" style={{ borderRadius: '24px' }}>
                <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
                    <h5 className="fw-extrabold text-danger mb-0 d-flex align-items-center gap-2">
                        <div className="p-2 rounded-3 bg-danger bg-opacity-10"><MessageSquare size={20} className="text-danger"/></div>
                        Reportes de Operadores
                    </h5>
                    <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2 fw-bold" style={{ fontSize: '0.7rem' }}>
                        {comentariosOperadores.length} RECIBIDOS
                    </span>
                </div>
                <div className="card-body p-4 overflow-auto" style={{ maxHeight: '800px' }}>
                    {comentariosOperadores.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <Truck size={40} className="mb-3 opacity-25" />
                            <p>No hay reportes recientes.</p>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {comentariosOperadores.map((com, index) => {
                                const isCompleted = com.estado_reporte === 'Completado';
                                return (
                                <div key={`com-${index}`} className={`p-3 rounded-4 border shadow-sm transition-all ${isCompleted ? 'bg-light opacity-75 grayscale' : 'bg-white border-light'}`}>
                                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
                                        <div className="d-flex align-items-center gap-2 flex-wrap">
                                            <span className={`badge border shadow-sm rounded-pill fw-bold ${isCompleted ? 'bg-secondary text-white' : 'bg-white text-dark'}`} style={{fontSize: '0.7rem'}}>
                                                <User size={10} className="me-1"/> {com.operador} {com.operador_apellido}
                                            </span>
                                            <span className="badge bg-dark text-white rounded-pill fw-bold" style={{fontSize: '0.7rem'}}>
                                                {com.unidad_nombre}
                                            </span>
                                            {com.tipo === 'ruta' && (
                                                <span className="badge bg-primary text-white rounded-pill fw-bold animate__animated animate__pulse animate__infinite" style={{fontSize: '0.65rem'}}>
                                                    EN RUTA
                                                </span>
                                            )}
                                        </div>
                                        <div className="d-flex align-items-center gap-2 ms-auto ms-sm-0">
                                            <small className="text-muted fw-bold" style={{fontSize: '0.7rem'}}>
                                                {new Date(com.fecha).toLocaleDateString()} {com.tipo === 'ruta' && new Date(com.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </small>
                                            
                                            {/* Botón de Completar */}
                                            <button 
                                                onClick={() => toggleEstadoReporte(com.id, isCompleted ? 'Pendiente' : 'Completado', com.tipo)}
                                                className={`btn btn-sm rounded-pill px-2 py-0 fw-bold d-flex align-items-center gap-1 ${isCompleted ? 'btn-outline-secondary' : 'btn-outline-success'}`}
                                                style={{fontSize: '0.65rem'}}
                                                title={isCompleted ? "Marcar como pendiente" : "Marcar como completado"}
                                            >
                                                {isCompleted ? <span className='d-none d-md-inline'>Reabrir</span> : <span className='d-none d-md-inline'>Completar</span>}
                                                <div className={`rounded-circle border d-flex align-items-center justify-content-center ${isCompleted ? 'bg-secondary border-secondary' : 'bg-white border-success'}`} style={{width: 14, height: 14}}>
                                                    {isCompleted && <Check size={8} className="text-white" strokeWidth={4} />}
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div style={{ textDecoration: isCompleted ? 'line-through' : 'none', opacity: isCompleted ? 0.8 : 1 }}>
                                        {com.tipo === 'ruta' ? (
                                            <div className={`p-3 rounded-4 border-start border-4 border-primary ${isCompleted ? 'bg-transparent' : 'bg-primary bg-opacity-10'}`}>
                                                <div className="d-flex align-items-center gap-2 text-primary mb-2">
                                                    <MessageSquare size={14} />
                                                    <span className="fw-bold small text-uppercase" style={{letterSpacing: '0.5px'}}>Mensaje Directo</span>
                                                </div>
                                                <p className="mb-0 fw-medium text-dark" style={{fontSize: '0.95rem'}}>{com.comentarios_inicio}</p>
                                            </div>
                                        ) : (
                                            <>
                                                {com.comentarios_inicio && (
                                                    <div className={`mb-2 p-2 rounded-3 border-start border-4 border-warning ${isCompleted ? 'bg-transparent' : 'bg-light'}`}>
                                                        <div className="d-flex align-items-center gap-1 text-warning mb-1">
                                                            <span className="badge bg-warning text-dark" style={{fontSize: '0.6rem'}}>SALIDA</span>
                                                        </div>
                                                        <p className="mb-0 small text-dark">{com.comentarios_inicio}</p>
                                                    </div>
                                                )}

                                                {com.comentarios_final && (
                                                    <div className={`p-2 rounded-3 border-start border-4 border-success ${isCompleted ? 'bg-transparent' : 'bg-light'}`}>
                                                        <div className="d-flex align-items-center gap-1 text-success mb-1">
                                                            <span className="badge bg-success text-white" style={{fontSize: '0.6rem'}}>CIERRE</span>
                                                        </div>
                                                        <p className="mb-0 small text-dark">{com.comentarios_final}</p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )})}
                        </div>
                    )}
                </div>
            </div>
        </div>
        )}

      {/* Modal de Confirmación */}
      {notaParaEliminar && (
        <ModalBorrar
          titulo="¿Eliminar nota?"
          mensaje="Esta acción no se puede deshacer."
          onConfirmar={confirmarEliminacion}
          onCancelar={() => setNotaParaEliminar(null)}
        />
      )}
    </div>
  );
}
