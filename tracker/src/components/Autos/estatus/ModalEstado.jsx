import React, { useEffect, useRef } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export const ModalEstado = ({ 
  tipo, 
  titulo, 
  mensaje, 
  onClose, 
  autoCerrar = true, 
  duracion = 3000,
  mostrar = false 
}) => {
  const modalRef = useRef(null);

  const handleClose = () => {
    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.style.display = 'none';
      modalElement.classList.remove('show');
    }
    document.body.classList.remove('modal-open');
    setTimeout(() => {
      if (onClose) onClose();
    }, 100);
  };

  useEffect(() => {
    const modalElement = modalRef.current;
    
    // Mostrar modal si mostrar es true
    if (modalElement && mostrar) {
      modalElement.style.display = 'block';
      modalElement.classList.add('show');
      document.body.classList.add('modal-open');
    } else if (modalElement) {
      modalElement.style.display = 'none';
      modalElement.classList.remove('show');
      document.body.classList.remove('modal-open');
    }

    // Auto cerrar si está habilitado y está mostrándose
    let timer;
    if (autoCerrar && mostrar) {
      timer = setTimeout(() => {
        handleClose();
      }, duracion);
    }

    return () => {
      if (modalElement) {
        modalElement.style.display = 'none';
        modalElement.classList.remove('show');
      }
      document.body.classList.remove('modal-open');
      if (timer) clearTimeout(timer);
    };
  }, [mostrar, autoCerrar, duracion, handleClose]);

  if (!mostrar) return null;

  return (
    <div 
      className="modal fade show" 
      id="modalEstado" 
      ref={modalRef} 
      tabIndex="-1" 
      aria-hidden="true"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog modal-sm modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg text-center p-4 rounded-4">
          <div className="mb-3 d-flex justify-content-center">
            {tipo === "success" ? (
              <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                <CheckCircle size={50} className="text-success" />
              </div>
            ) : (
              <div className="bg-danger bg-opacity-10 p-3 rounded-circle">
                <XCircle size={50} className="text-danger" />
              </div>
            )}
          </div>
          <h5 className={`fw-bold ${tipo === 'success' ? 'text-success' : 'text-danger'}`}>{titulo}</h5>
          <p className="text-muted small mb-4">{mensaje}</p>
          <button 
            type="button" 
            className="btn btn-dark w-100 fw-bold rounded-pill py-2" 
            onClick={handleClose}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEstado;