import React, { useState } from 'react';
import {
  Phone, AlertOctagon, Loader2, ShieldAlert,
  Stethoscope, FileText, X, MessageSquare, AlertTriangle
} from 'lucide-react';
import { EMPLEADO_API_BASE } from '../../../config.js';

export default function Ayuda({ user, vehiculoId, onCancel }) {
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [modalActivo, setModalActivo] = useState(null);

  // Lógica de URL Dinámica - Corregida para apuntar a la carpeta v1
  const API_BASE_URL = `${EMPLEADO_API_BASE}/`;

  const TELEFONO_SEGURO = "800-123-4567";

  const ejecutarSOS = async () => {
    // Verificación de seguridad antes de intentar el envío
    if (!user?.id) {
      alert("Error: No se detectó sesión de usuario. Intenta reingresar.");
      return;
    }

    setEnviando(true);

    try {
      // 1. Obtener ubicación GPS con promesa
      const obtenerPosicion = () => {
        return new Promise((resolve) => {
          if (!navigator.geolocation) resolve({ lat: null, lng: null });
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve({ lat: null, lng: null }),
            { enableHighAccuracy: true, timeout: 5000 }
          );
        });
      };

      const coords = await obtenerPosicion();

      // 2. Construcción del objeto de datos
      const datosSOS = {
        empleado_id: String(user.id), // Aseguramos que sea string o número válido
        vehiculo_id: vehiculoId || null,
        lat: coords.lat,
        lng: coords.lng
      };

      // 3. Enviar a la API con la URL dinámica
      const response = await fetch(`${API_BASE_URL}enviar_sos.php`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosSOS)
      });

      const resultado = await response.json();

      if (resultado.status === "success") {
        setEnviado(true);
        setModalActivo(null);
      } else {
        console.error("Error del servidor:", resultado.message);
        alert("Error al enviar SOS: " + resultado.message);
      }
    } catch (error) {
      console.error("Error de red/API SOS:", error);
      alert("No se pudo conectar con el servidor de emergencia.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden animate__animated animate__headShake">
        <div className="bg-danger p-4 text-white text-center position-relative">
          <AlertOctagon size={64} className="mb-2 animate__animated animate__pulse animate__infinite" />
          <h2 className="fw-bold mb-0 text-white">CENTRO DE AYUDA</h2>
        </div>

        <div className="card-body p-4 text-center">
          {!enviado ? (
            <button
              onClick={() => setModalActivo('sos_confirm')}
              disabled={enviando}
              className="btn btn-danger w-100 py-4 rounded-4 shadow-lg d-flex flex-column align-items-center justify-content-center gap-2 mb-4"
            >
              {enviando ? (
                <><Loader2 className="animate-spin" size={40} /><span className="fw-bold">PROCESANDO...</span></>
              ) : (
                <><ShieldAlert size={48} /><span className="fs-3 fw-bold">ACTIVAR SOS</span></>
              )}
            </button>
          ) : (
            <div className="alert alert-success rounded-4 py-4 mb-4 border-0 shadow-sm animate__animated animate__bounceIn">
              <ShieldAlert size={32} className="mb-2 text-success" />
              <h5 className="mb-0 fw-bold">¡ALERTA RECIBIDA!</h5>
              <p className="small mb-0">Se ha notificado a administración.</p>
            </div>
          )}

          <div className="row g-3 mb-4">
            <div className="col-4">
              <button onClick={() => setModalActivo('medica')} className="btn btn-outline-primary w-100 py-3 rounded-4 border-2 shadow-sm">
                <Stethoscope size={24} className="mb-1" />
                <div style={{ fontSize: '9px' }} className="fw-bold text-uppercase">Médica</div>
              </button>
            </div>
            <div className="col-4">
              <button onClick={() => setModalActivo('seguro')} className="btn btn-outline-dark w-100 py-3 rounded-4 border-2 shadow-sm">
                <FileText size={24} className="mb-1" />
                <div style={{ fontSize: '9px' }} className="fw-bold text-uppercase">Seguro</div>
              </button>
            </div>
            <div className="col-4">
              <button
                onClick={() => window.open(`https://wa.me/?text=SOS! Soy ${user?.nombre}, necesito ayuda urgente.`, '_blank')}
                className="btn btn-outline-success w-100 py-3 rounded-4 border-2 shadow-sm"
              >
                <MessageSquare size={24} className="mb-1" />
                <div style={{ fontSize: '9px' }} className="fw-bold text-uppercase">WhatsApp</div>
              </button>
            </div>
          </div>

          <button onClick={onCancel} className="btn btn-link text-muted w-100 text-decoration-none fw-bold p-0">
            CANCELAR Y VOLVER
          </button>
        </div>
      </div>

      {/* MODAL SISTEMA */}
      {modalActivo && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3"
          style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div className="bg-white rounded-5 w-100 shadow-2xl animate__animated animate__zoomIn" style={{ maxWidth: '400px', overflow: 'hidden' }}>

            <div className={`p-4 text-white d-flex justify-content-between align-items-center ${modalActivo === 'medica' ? 'bg-primary' :
              modalActivo === 'sos_confirm' ? 'bg-danger' : 'bg-dark'
              }`}>
              <h5 className="mb-0 fw-bold text-white">
                {modalActivo === 'medica' && 'Información Médica'}
                {modalActivo === 'seguro' && 'Datos del Seguro'}
                {modalActivo === 'sos_confirm' && '¿Confirmar SOS?'}
              </h5>
              <button onClick={() => setModalActivo(null)} className="btn btn-close btn-close-white shadow-none"></button>
            </div>

            <div className="p-4">
              {modalActivo === 'medica' && (
                <div className="text-start">
                  <p className="mb-2"><strong>Sangre:</strong> {user?.tipo_sangre || 'No reg.'}</p>
                  <p className="mb-2"><strong>Alergias:</strong> {user?.alergias || 'Ninguna'}</p>
                  <button onClick={() => setModalActivo(null)} className="btn btn-primary w-100 py-3 rounded-4 mt-3 fw-bold">CERRAR</button>
                </div>
              )}

              {modalActivo === 'seguro' && (
                <div className="text-start">
                  <p className="mb-2"><strong>Compañía:</strong> AXA Seguros</p>
                  <p className="mb-2"><strong>Póliza:</strong> #POL-88273-X</p>
                  <a href={`tel:${TELEFONO_SEGURO}`} className="btn btn-dark w-100 mt-2 py-3 rounded-4 fw-bold d-flex align-items-center justify-content-center gap-2">
                    <Phone size={18} /> LLAMAR SEGURO
                  </a>
                  <button onClick={() => setModalActivo(null)} className="btn btn-light w-100 mt-2 fw-bold text-muted border">CERRAR</button>
                </div>
              )}

              {modalActivo === 'sos_confirm' && (
                <div className="text-center">
                  <AlertTriangle size={48} className="text-danger mb-3" />
                  <p className="fw-bold mb-4 text-dark fs-5">Se enviará tu ubicación actual al panel de monitoreo de Initeck.</p>
                  <div className="d-grid gap-2">
                    <button onClick={ejecutarSOS} className="btn btn-danger py-3 rounded-4 fw-bold fs-5 shadow">
                      SÍ, ENVIAR SOS
                    </button>
                    <button onClick={() => setModalActivo(null)} className="btn btn-light py-2 fw-bold text-muted">
                      CANCELAR
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}