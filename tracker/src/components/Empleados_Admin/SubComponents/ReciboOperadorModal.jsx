import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X, Save, FileText, DollarSign, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { NOMINA_GUARDAR_RECIBO_CAJA_URL } from '../../../config';
import { f } from '../../../utils/formatUtils';

const ReciboOperadorModal = ({ isOpen, onClose, empleado, adminId, onSaveSuccess }) => {
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const sigCanvas = useRef(null);

  if (!isOpen || !empleado) return null;

  const handleClearSignature = () => {
    sigCanvas.current.clear();
  };

  const generatePDF = async (montoRecibido, firmaBase64) => {
    const doc = new jsPDF();
    const date = new Date().toLocaleString();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('RECIBO DE CAJA - OPERADOR', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Fecha y Hora: ${date}`, 105, 28, { align: 'center' });
    
    // Line separator
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(20, 35, 190, 35);
    
    // Body info
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85); // slate-700
    doc.text('Datos del Empleado:', 20, 45);
    doc.setFont(undefined, 'bold');
    doc.text(`${empleado.empleado_nombre}`, 20, 52);
    doc.setFont(undefined, 'normal');
    doc.text(`Rol: ${empleado.empleado_rol || 'Operador'}`, 20, 58);
    doc.text(`Unidad: ${empleado.vehiculo_asignado || 'N/A'}`, 20, 64);
    
    // Amount box
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(20, 75, 170, 30, 3, 3, 'F');
    doc.setFontSize(14);
    doc.text('CANTIDAD RECIBIDA:', 30, 88);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text(`${f(montoRecibido)} MXN`, 105, 95, { align: 'center' });
    
    // Signature text
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Firma del Operador:', 105, 120, { align: 'center' });
    
    // Add signature image
    if (firmaBase64) {
      doc.addImage(firmaBase64, 'PNG', 75, 125, 60, 30);
    }
    
    doc.line(75, 155, 135, 155);
    doc.setFontSize(10);
    doc.text('CONFIRMACIÓN DE RECEPCIÓN', 105, 162, { align: 'center' });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Este documento sirve como comprobante electrónico de la entrega de efectivo.', 105, 280, { align: 'center' });
    doc.text('Initeck Flota Management System', 105, 285, { align: 'center' });

    return doc;
  };

  const handleSave = async () => {
    if (!monto || parseFloat(monto) <= 0) {
      setError('Por favor ingresa un monto válido.');
      return;
    }

    if (sigCanvas.current.isEmpty()) {
      setError('La firma del operador es obligatoria.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const firmaBase64 = sigCanvas.current.getCanvas().toDataURL('image/png');
      const doc = await generatePDF(monto, firmaBase64);

      // Convertir firma base64 a Blob para evitar que ModSecurity bloquee el POST
      const firmaBlob = await fetch(firmaBase64).then(r => r.blob());
      const pdfBlob   = doc.output('blob');

      const formData = new FormData();
      formData.append('empleado_id', empleado.empleado_id || empleado.vehiculo_asignado);
      formData.append('monto', parseFloat(monto));
      formData.append('admin_id', adminId || '');
      formData.append('firma', firmaBlob, 'firma.png');
      formData.append('comprobante', pdfBlob, 'recibo.pdf');

      const response = await fetch(NOMINA_GUARDAR_RECIBO_CAJA_URL, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.status === 'success') {
        onSaveSuccess && onSaveSuccess(result);
        onClose();
      } else {
        throw new Error(result.message || 'Error al guardar el recibo');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)', zIndex: 9999 }}>
      <div className="bg-white rounded-5 shadow-2xl animate__animated animate__zoomIn p-0 overflow-hidden" style={{ width: '95%', maxWidth: '500px', position: 'relative', zIndex: 10000 }}>
        {/* Header */}
        <div className="p-4 bg-primary text-white d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-3">
                    <FileText size={24} />
                </div>
                <div>
                    <h5 className="mb-0 fw-bold">Recibo de Operador</h5>
                    <p className="mb-0 small opacity-75">{empleado.empleado_nombre}</p>
                </div>
            </div>
            <button onClick={onClose} className="btn btn-link text-white p-0 hover-scale">
                <X size={24} />
            </button>
        </div>

        {/* Content */}
        <div className="p-4">
            {error && (
                <div className="alert alert-danger rounded-4 d-flex align-items-center gap-2 mb-4 animate__animated animate__shakeX">
                    <AlertCircle size={20} />
                    <span className="small fw-medium">{error}</span>
                </div>
            )}

            <div className="mb-4">
                <label className="form-label text-secondary fw-bold small text-uppercase letter-spacing-1">CANTIDAD RECIBIDA (MXN)</label>
                <div className="position-relative">
                    <div className="position-absolute h-100 d-flex align-items-center ps-3 text-secondary">
                        <DollarSign size={20} />
                    </div>
                    <input 
                        type="number" 
                        className="form-control form-control-lg rounded-4 ps-5 border-0 bg-light fw-bold shadow-none" 
                        placeholder="0.00"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        style={{ fontSize: '1.5rem', height: '64px' }}
                    />
                </div>
            </div>

            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label text-secondary fw-bold small text-uppercase letter-spacing-1 mb-0">FIRMA DE CONFORMIDAD</label>
                    <button onClick={handleClearSignature} className="btn btn-link text-danger p-0 small fw-bold text-decoration-none shadow-none">Limpiar</button>
                </div>
                <div className="border rounded-4 bg-light overflow-hidden position-relative" style={{ height: '200px' }}>
                    <SignatureCanvas 
                        ref={sigCanvas}
                        penColor='#0f172a'
                        canvasProps={{ 
                            style: { width: '100%', height: '100%' },
                            className: 'sigCanvas' 
                        }}
                    />
                </div>
                <p className="text-muted small mt-2 text-center">El operador debe firmar arriba para validar la recepción de efectivo.</p>
            </div>

            <button 
                onClick={handleSave}
                disabled={loading}
                className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2 mb-2 border-0"
            >
                {loading ? (
                    <div className="spinner-border spinner-border-sm" role="status"></div>
                ) : (
                    <>
                        <Save size={20} />
                        GUARDAR Y GENERAR COMPROBANTE
                    </>
                )}
            </button>
            <button onClick={onClose} disabled={loading} className="btn btn-light w-100 rounded-pill py-2 fw-bold text-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ReciboOperadorModal;
