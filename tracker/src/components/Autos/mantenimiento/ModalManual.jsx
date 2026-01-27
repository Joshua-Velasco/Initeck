import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Info, Save, ExternalLink, X, Globe, Link2 } from 'lucide-react';
import ModalEstado from '../estatus/ModalEstado';
import { MANTENIMIENTO_URL } from '../../../config.js';

export default function ModalManual({ isOpen, onClose, unidad, onSave }) {
  const [loadedUrl, setLoadedUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [statusModal, setStatusModal] = useState({ type: 'success', title: '', message: '' });

  const formatPdfUrl = (url) => {
    if (!url) return '';
    let formatted = url.trim();
    if (formatted.includes('drive.google.com')) {
      formatted = formatted.replace(/\/view.*$/, '/preview').replace(/\/edit.*$/, '/preview');
    }
    return formatted;
  };

  useEffect(() => {
    if (isOpen && unidad) {
      const urlExistente = unidad.manual_url || unidad.url_manual || '';
      setInputUrl(urlExistente);
      setLoadedUrl(formatPdfUrl(urlExistente));
    }
  }, [unidad, isOpen]);

  const showStatusModal = () => {
    const el = document.getElementById('modalEstadoManual');
    if (el && window.bootstrap) {
      const modalInstance = window.bootstrap.Modal.getOrCreateInstance(el);
      modalInstance.show();
    }
  };

  const handlePreview = () => {
    if (inputUrl && /^https?:\/\//i.test(inputUrl)) {
      setLoadedUrl(formatPdfUrl(inputUrl));
    } else {
      alert("La URL debe iniciar con http:// o https://");
    }
  };

  const handleSave = async () => {
    const unidadId = unidad?.id || unidad?.unidad_id;
    if (!unidadId) return;

    setIsSaving(true);
    const formData = new FormData();
    formData.append('accion', 'guardar_url_manual');
    formData.append('unidad_id', unidadId);
    formData.append('manual_url', inputUrl);

    try {
      const response = await fetch(MANTENIMIENTO_URL, { method: 'POST', body: formData });
      const data = await response.json();

      if (data.status === 'success') {
        setLoadedUrl(formatPdfUrl(inputUrl));
        if (onSave) onSave();
        setStatusModal({ 
          type: 'success', 
          title: 'Vínculo Actualizado', 
          message: 'El manual técnico se ha vinculado correctamente a la unidad.' 
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setStatusModal({ type: 'error', title: 'Error', message: error.message });
    } finally {
      setIsSaving(false);
      showStatusModal();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ModalEstado id="modalEstadoManual" tipo={statusModal.type} titulo={statusModal.title} mensaje={statusModal.message} />

      <div className="modal d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', zIndex: 1060 }}>
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '1100px', width: '95%', margin: '1rem auto' }}>
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-white" style={{ height: '90vh', maxHeight: '95vh' }}>
            
            {/* Header con estilo Glassmorphism */}
            <div className="px-4 py-3 d-flex align-items-center justify-content-between text-white" 
                 style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
              <div className="d-flex align-items-center gap-3">
                <div className=" bg-opacity-20 p-2 rounded-3">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold text-uppercase tracking-wider">Manual Técnico de Usuario</h6>
                  <small className="opacity-75 d-flex align-items-center gap-1">
                    <Globe size={12} /> {unidad?.unidad_nombre || 'Unidad No Especificada'}
                  </small>
                </div>
              </div>
              <button onClick={onClose} className="btn btn-link text-white p-2 hover-rotate transition-all border-0 shadow-none">
                <X size={24} />
              </button>
            </div>

            <div className="modal-body p-0 d-flex flex-column flex-md-row overflow-hidden h-100">
              
              {/* Sidebar de Configuración */}
              <div className="p-4 bg-light border-end d-flex flex-column justify-content-between sidebar-manual" style={{ width: '320px', flexShrink: 0 }}>
                <div>
                  <div className="mb-4">
                    <label className="form-label small fw-bold text-secondary text-uppercase mb-2">Enlace del Documento</label>
                    <div className="input-group shadow-sm rounded-3 overflow-hidden border-0">
                      <span className="input-group-text bg-white border-0 text-muted">
                        <Link2 size={18} />
                      </span>
                      <input
                        type="url"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="Pegar URL de Drive..."
                        className="form-control border-0 ps-0 py-2"
                        style={{ fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>

                  <div className="d-grid gap-2 mb-4">
                    <button onClick={handlePreview} className="btn btn-white border shadow-sm fw-bold text-dark py-2">
                      Vista Previa
                    </button>
                    <button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className="btn btn-primary fw-bold py-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
                      style={{ backgroundColor: '#4f46e5', border: 'none' }}
                    >
                      {isSaving ? <span className="spinner-border spinner-border-sm" /> : <Save size={18} />}
                      {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>

                  <div className="p-3 rounded-3 bg-warning bg-opacity-10 border border-warning border-opacity-25">
                    <div className="d-flex gap-2">
                      <Info size={18} className="text-warning flex-shrink-0 mt-1" />
                      <p className="small mb-0 text-dark-emphasis" style={{ fontSize: '0.8rem' }}>
                        <strong>Nota:</strong> El archivo debe estar configurado como <strong>público</strong> para visualizarse correctamente en el sistema.
                      </p>
                    </div>
                  </div>
                </div>

                {loadedUrl && (
                  <button 
                    onClick={() => window.open(inputUrl, '_blank')}
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center gap-2 py-2 mt-4"
                  >
                    <ExternalLink size={14} /> Abrir en pantalla completa
                  </button>
                )}
              </div>

              {/* Visor de Contenido */}
              <div className="flex-grow-1 bg-secondary bg-opacity-10 p-3 p-md-4 overflow-hidden d-flex">
                {loadedUrl ? (
                  <div className="w-100 h-100 bg-white rounded-3 shadow-sm border overflow-hidden">
                    <iframe
                      src={`${loadedUrl}#view=FitH`}
                      className="w-100 h-100 border-0"
                      title="Visor PDF"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="m-auto text-center py-5">
                    <div className="bg-white rounded-circle shadow-sm p-4 d-inline-block mb-3">
                      <FileText size={48} className="text-muted" strokeWidth={1} />
                    </div>
                    <h5 className="text-dark fw-bold">Esperando documento</h5>
                    <p className="text-muted small px-4">Ingrese una URL válida para previsualizar el manual técnico de la unidad.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hover-rotate:hover { transform: rotate(90deg); opacity: 0.8; }
        .transition-all { transition: all 0.3s ease; }
        .form-control:focus { box-shadow: none; border-color: #4f46e5; }
        
        /* Mobile Optimizations */
        @media (max-width: 992px) {
          .modal-dialog { 
            margin: 0.5rem !important; 
            width: 98% !important;
          }
          .modal-content { 
            height: 96vh !important; 
            max-height: 96vh !important;
            border-radius: 1rem !important;
          }
        }
        
        @media (max-width: 768px) {
          .modal-dialog { 
            margin: 0.25rem !important; 
            width: 100% !important;
            max-width: 100% !important;
          }
          .modal-content { 
            height: 98vh !important; 
            max-height: 98vh !important;
            border-radius: 0.5rem !important;
          }
          .modal-body { 
            flex-direction: column !important; 
            padding: 0 !important;
          }
          .modal-header {
            padding: 1rem !important;
          }
          .modal-header h6 {
            font-size: 0.875rem !important;
            line-height: 1.2 !important;
          }
          .modal-header small {
            font-size: 0.75rem !important;
          }
          .modal-header button {
            padding: 0.5rem !important;
          }
          .modal-header button svg {
            width: 20px !important;
            height: 20px !important;
          }
          .p-4 {
            padding: 1rem !important;
          }
          .mb-4 {
            margin-bottom: 1rem !important;
          }
          .mb-3 {
            margin-bottom: 0.75rem !important;
          }
          .gap-2 {
            gap: 0.5rem !important;
          }
          .gap-3 {
            gap: 0.75rem !important;
          }
          .py-2 {
            padding-top: 0.75rem !important;
            padding-bottom: 0.75rem !important;
          }
          .py-5 {
            padding-top: 2rem !important;
            padding-bottom: 2rem !important;
          }
          .px-4 {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          .form-label {
            font-size: 0.8rem !important;
            margin-bottom: 0.5rem !important;
          }
          .form-control {
            font-size: 0.9rem !important;
            padding: 0.75rem !important;
            min-height: 44px !important; /* Touch target size */
          }
          .input-group-text {
            padding: 0.75rem !important;
            min-width: 44px !important; /* Touch target size */
          }
          .btn {
            min-height: 44px !important; /* Touch target size */
            font-size: 0.9rem !important;
            padding: 0.75rem 1rem !important;
            border-radius: 0.5rem !important;
          }
          .btn-sm {
            min-height: 40px !important;
            font-size: 0.85rem !important;
            padding: 0.5rem 0.75rem !important;
          }
          .sidebar-manual { 
            width: 100% !important; 
            border-right: none !important; 
            border-bottom: 1px solid #dee2e6 !important;
            max-height: 40vh !important;
            overflow-y: auto !important;
          }
          .flex-grow-1 {
            min-height: 50vh !important;
          }
          .bg-secondary.bg-opacity-10 {
            background: #f8f9fa !important;
          }
          .p-3.p-md-4 {
            padding: 1rem !important;
          }
          .rounded-circle {
            width: 60px !important;
            height: 60px !important;
          }
          .rounded-circle svg {
            width: 32px !important;
            height: 32px !important;
          }
          h5 {
            font-size: 1.1rem !important;
          }
          .text-muted.small {
            font-size: 0.85rem !important;
            line-height: 1.4 !important;
          }
          .alert {
            padding: 0.75rem !important;
            font-size: 0.8rem !important;
          }
          .alert svg {
            width: 16px !important;
            height: 16px !important;
          }
          .spinner-border-sm {
            width: 1rem !important;
            height: 1rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .modal-content { 
            height: 100vh !important; 
            max-height: 100vh !important;
            border-radius: 0 !important;
          }
          .modal-dialog {
            margin: 0 !important;
          }
          .modal-header {
            padding: 0.75rem !important;
          }
          .modal-header h6 {
            font-size: 0.8rem !important;
          }
          .modal-header small {
            font-size: 0.7rem !important;
          }
          .p-4 {
            padding: 0.75rem !important;
          }
          .btn {
            font-size: 0.85rem !important;
            padding: 0.625rem 0.875rem !important;
          }
          .form-control {
            font-size: 0.85rem !important;
            padding: 0.625rem !important;
          }
          .sidebar-manual {
            max-height: 35vh !important;
          }
          .flex-grow-1 {
            min-height: 55vh !important;
          }
        }
        
        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          .btn:active {
            transform: scale(0.95);
          }
          .hover-rotate:active {
            transform: rotate(90deg) scale(0.95);
          }
        }
      `}} />
    </>
  );
}