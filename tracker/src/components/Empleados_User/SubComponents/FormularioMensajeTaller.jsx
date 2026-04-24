import React, { useState } from 'react';
import { Send, MessageSquare, X, Loader2 } from 'lucide-react';
import { TALLER_GUARDAR_MENSAJE_URL } from '../../../config';
import Swal from 'sweetalert2';

export default function FormularioMensajeTaller({ user, vehiculoId, onCancel, onGuardar }) {
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;

    setEnviando(true);
    try {
      const response = await fetch(TALLER_GUARDAR_MENSAJE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empleado_id: user?.id,
          vehiculo_id: vehiculoId,
          mensaje: mensaje.trim()
        })
      });

      const result = await response.json();
      if (result.status === 'success') {
        Swal.fire({
          title: 'Mensaje Enviado',
          text: 'El personal del taller ha recibido tu reporte.',
          icon: 'success',
          confirmButtonColor: '#0f172a'
        });
        setMensaje("");
        onGuardar();
      } else {
        Swal.fire('Error', result.message || 'No se pudo enviar el mensaje', 'error');
      }
    } catch (error) {
      console.error("Error enviando mensaje al taller:", error);
      Swal.fire('Error', 'Problema de conexión con el servidor', 'error');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="card border-0 shadow-lg rounded-4 overflow-hidden animate__animated animate__fadeIn">
      <div className="card-header bg-dark text-white p-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-white bg-opacity-10 p-2 rounded-3">
            <MessageSquare size={24} />
          </div>
          <div>
            <h5 className="mb-0 fw-bold">Mensaje Directo al Taller</h5>
            <small className="text-white-50">Informa fallas o novedades en tiempo real</small>
          </div>
        </div>
        <button onClick={onCancel} className="btn btn-link text-white p-0">
          <X size={24} />
        </button>
      </div>

      <div className="card-body p-4 bg-light">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label fw-bold text-muted small text-uppercase mb-2">Escribe tu reporte o comentario</label>
            <textarea
              className="form-control border-0 shadow-sm rounded-4 p-3"
              rows="6"
              placeholder="Ej: Siento una vibración en el volante al frenar..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              required
              disabled={enviando}
              style={{ fontSize: '1.1rem' }}
            />
          </div>

          <div className="d-grid gap-2">
            <button 
              type="submit" 
              className="btn btn-primary rounded-pill py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
              disabled={enviando || !mensaje.trim()}
            >
              {enviando ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              {enviando ? 'ENVIANDO...' : 'ENVIAR AL TALLER'}
            </button>
            <button 
              type="button" 
              className="btn btn-light rounded-pill py-3 fw-bold text-muted"
              onClick={onCancel}
              disabled={enviando}
            >
              CANCELAR
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white p-3 border-top text-center">
        <p className="small text-muted mb-0">
          <span className="badge bg-warning text-dark me-2">Aviso</span>
          Este mensaje será visible inmediatamente para el equipo de mantenimiento.
        </p>
      </div>
    </div>
  );
}
