import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Car, Trash2 } from 'lucide-react';

export const ModalBorrarUnidad = ({ unidad, onConfirm, onCancel }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const modalElement = modalRef.current;
    
    // Mostrar modal directamente con estilos CSS
    if (modalElement && unidad) {
      modalElement.style.display = 'block';
      modalElement.classList.add('show');
      document.body.classList.add('modal-open');
    }

    return () => {
      if (modalElement) {
        modalElement.style.display = 'none';
        modalElement.classList.remove('show');
      }
      document.body.classList.remove('modal-open');
    };
  }, [unidad]);

  const handleConfirmar = () => {
    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.style.display = 'none';
      modalElement.classList.remove('show');
    }
    document.body.classList.remove('modal-open');
    setTimeout(() => {
      if (onConfirm) onConfirm();
    }, 100);
  };

  const handleCancelar = () => {
    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.style.display = 'none';
      modalElement.classList.remove('show');
    }
    document.body.classList.remove('modal-open');
    setTimeout(() => {
      if (onCancel) onCancel();
    }, 100);
  };

  if (!unidad) return null;

  return (
    <div 
      className="modal fade show" 
      id="modalBorrarUnidad" 
      ref={modalRef} 
      tabIndex="-1" 
      aria-hidden="true"
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '450px' }}>
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          
          <div className="modal-body p-4 text-center">
            <div 
              className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-danger-subtle" 
              style={{ width: '70px', height: '70px' }}
            >
              <AlertTriangle size={36} className="text-danger" />
            </div>

            <div className="d-flex align-items-center justify-content-center mb-3">
              <Car size={20} className="text-danger me-2" />
              <h5 className="fw-bold text-dark mb-0">Eliminar Unidad</h5>
            </div>

            <div className="bg-light rounded-3 p-3 mb-3">
              <div className="fw-bold text-primary mb-1">{unidad.unidad_nombre}</div>
              <div className="small text-muted">Placas: {unidad.placas}</div>
              <div className="small text-muted">Tipo: {unidad.tipo_unidad || 'Nacional'}</div>
            </div>

            <p className="text-muted mb-0 small">
              ¿Estás seguro de que deseas eliminar esta unidad? <br />
              <span className="text-danger fw-semibold">Esta acción no se puede deshacer</span>
            </p>
          </div>

          <div className="modal-footer border-0 p-4 pt-0 d-flex gap-2">
            <button 
              type="button" 
              className="btn btn-light border flex-grow-1 py-2 fw-semibold text-secondary rounded-3" 
              onClick={handleCancelar}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              className="btn btn-danger flex-grow-1 py-2 fw-bold shadow-sm rounded-3" 
              onClick={handleConfirmar}
            >
              <Trash2 size={16} className="me-1" />
              Eliminar Unidad
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ModalBorrarUnidad;
