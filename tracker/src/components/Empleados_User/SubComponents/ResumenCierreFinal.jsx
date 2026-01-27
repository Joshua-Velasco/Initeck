import React from 'react';
import { X } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

export default function ResumenCierreFinal({ totalIngresos, totalGastos, sigCanvasRef, onCerrar, onFinalizar }) {
  return (
    <div className="card border-0 shadow-lg rounded-4 p-4 mb-4 bg-white border-top border-danger border-5 animate__animated animate__pulse">
      <div className="d-flex justify-content-between mb-4">
        <h3 className="fw-bold text-danger m-0">RESUMEN DE CIERRE</h3>
        <button onClick={onCerrar} className="btn btn-light rounded-circle"><X/></button>
      </div>
      <div className="row g-4">
        <div className="col-md-5">
          <div className="p-4 bg-light rounded-4 h-100 shadow-sm">
            <div className="d-flex justify-content-between mb-2">
              <span>Ingresos Totales:</span>
              <span className="fw-bold text-success">+ ${totalIngresos.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span>Gastos Totales:</span>
              <span className="fw-bold text-danger">- ${totalGastos.toFixed(2)}</span>
            </div>
            <hr/>
            <div className="d-flex justify-content-between mt-3">
              <h5>TOTAL NETO:</h5>
              <h4 className="text-primary fw-bold">${(totalIngresos - totalGastos).toFixed(2)}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-7 text-center">
          <label className="fw-bold mb-2">FIRMA PARA FINALIZAR JORNADA</label>
          <div className="bg-light border rounded-4 mb-3" style={{height: '180px'}}>
            <SignatureCanvas ref={sigCanvasRef} canvasProps={{className: 'w-100 h-100'}}/>
          </div>
          <button onClick={onFinalizar} className="btn btn-danger w-100 py-3 fw-bold rounded-pill shadow-lg">
            CONFIRMAR Y ENVIAR LIQUIDACIÓN
          </button>
        </div>
      </div>
    </div>
  );
}