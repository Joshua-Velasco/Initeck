import React from "react";
import { AlertCircle, LogOut } from "lucide-react";

const LogoutModal = ({ show, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-sm">
        <div className="modal-content border-0 rounded-4 shadow-lg">
          <div className="modal-body p-4 text-center">
            <div className="bg-warning bg-opacity-10 text-warning rounded-circle p-3 d-inline-block mx-auto mb-3">
              <AlertCircle size={48} />
            </div>
            <h4 className="fw-bold mb-3">¿Cerrar Sesión?</h4>
            <p className="text-muted mb-4">
              Estás por salir del sistema. <br />
              ¿Deseas continuar?
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <button
                className="btn btn-light rounded-3 px-4 fw-bold"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger rounded-3 px-4 fw-bold d-flex align-items-center gap-2"
                onClick={onConfirm}
              >
                <LogOut size={16} />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
