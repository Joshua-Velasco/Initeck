import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

export const ModalBorrar = ({ 
  id = "modalConfirmar", 
  titulo = "Confirmar eliminación", 
  mensaje = "¿Estás seguro de que deseas eliminar este registro?", 
  onConfirmar, 
  onCancelar, 
<<<<<<< HEAD
  color = "danger",
  confirmText = "Sí, eliminar",
  cancelText = "Cancelar"
=======
  color = "danger" 
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
<<<<<<< HEAD
    // ... same effect
=======
    console.log("ModalBorrar montado");
    // Mostrar modal directamente con estilos CSS
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
    if (modalRef.current) {
      modalRef.current.style.display = 'block';
      modalRef.current.classList.add('show');
      document.body.classList.add('modal-open');
    }

    return () => {
<<<<<<< HEAD
=======
      console.log("ModalBorrar desmontado");
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
      if (modalRef.current) {
        modalRef.current.style.display = 'none';
        modalRef.current.classList.remove('show');
      }
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleConfirmAction = () => {
<<<<<<< HEAD
    if (onConfirmar) onConfirmar();
  };

  const handleCloseAction = () => {
    if (onCancelar) onCancelar();
=======
    console.log("Confirmando eliminación");
    if (modalRef.current) {
      modalRef.current.style.display = 'none';
      modalRef.current.classList.remove('show');
    }
    document.body.classList.remove('modal-open');
    setTimeout(() => {
      if (onConfirmar) onConfirmar();
    }, 100);
  };

  const handleCloseAction = () => {
    console.log("Cancelando eliminación");
    if (modalRef.current) {
      modalRef.current.style.display = 'none';
      modalRef.current.classList.remove('show');
    }
    document.body.classList.remove('modal-open');
    if (onCancelar) {
      setTimeout(onCancelar, 100);
    }
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
  };

  return (
    <div 
      className="modal fade show" 
      id={id} 
      ref={modalRef} 
      tabIndex="-1" 
      aria-hidden="true"
<<<<<<< HEAD
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}
=======
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          
          <div className="modal-body p-4 text-center">
            <div 
              className={`mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-${color}-subtle`} 
              style={{ width: '60px', height: '60px' }}
            >
              <AlertTriangle size={32} className={`text-${color}`} />
            </div>

            <h5 className="fw-bold text-dark mb-2">{titulo}</h5>
            <p className="text-muted mb-0 px-2 small">{mensaje}</p>
          </div>

          <div className="modal-footer border-0 p-4 pt-0 d-flex gap-2">
            <button 
              type="button" 
              className="btn btn-light border flex-grow-1 py-2 fw-semibold text-secondary rounded-3" 
              onClick={handleCloseAction}
            >
<<<<<<< HEAD
              {cancelText}
=======
              Cancelar
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
            </button>
            <button 
              type="button" 
              className={`btn btn-${color} flex-grow-1 py-2 fw-bold shadow-sm rounded-3`} 
              onClick={handleConfirmAction}
            >
<<<<<<< HEAD
              {confirmText}
=======
              Sí, eliminar
>>>>>>> 06abb94 (Refactor: Reestructuración de componentes, limpieza de archivos obsoletos y nuevos módulos de métricas y gestión de autos)
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ModalBorrar;