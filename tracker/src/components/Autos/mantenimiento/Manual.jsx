import React, { useState, useRef, useEffect, useMemo } from 'react';
import { BookOpen, Download, Upload, FileText, AlertCircle, ExternalLink } from 'lucide-react';

export default function Manual({ unidad }) {
  const [pdfUrl, setPdfUrl] = useState('');
  const [isLocalFile, setIsLocalFile] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // URLs de respaldo por marca
  const manualesPorDefecto = useMemo(() => ({
    'Toyota': 'https://www.toyota.com/content/dam/toyota/manual/2022/camry/2022_toyota_camry_owners_manual.pdf',
    'Honda': 'https://www.honda.com/content/dam/honda/manual/2022/civic/2022_honda_civic_owners_manual.pdf',
    'Nissan': 'https://www.nissan.com/content/dam/nissan/manual/2022/sentra/2022_nissan_sentra_owners_manual.pdf',
    'Ford': 'https://www.ford.com/content/dam/ford/manual/2022/focus/2022_ford_focus_owners_manual.pdf',
    'Chevrolet': 'https://www.chevrolet.com/content/dam/chevrolet/manual/2022/malibu/2022_chevrolet_malibu_owners_manual.pdf'
  }), []);

  useEffect(() => {
    if (unidad) {
      setError('');
      // 1. Prioridad: URL que registraste en tu base de datos (ajusta el nombre del campo si es distinto)
      if (unidad.manual_url || unidad.url_manual) {
        setPdfUrl(unidad.manual_url || unidad.url_manual);
        setIsLocalFile(false);
      } 
      // 2. Segunda opción: Manual por marca
      else {
        const marca = unidad.modelo?.split(' ')[0] || '';
        const defaultUrl = manualesPorDefecto[marca];
        if (defaultUrl) {
          setPdfUrl(defaultUrl);
          setIsLocalFile(false);
        } else {
          setPdfUrl('');
        }
      }
    }
  }, [unidad, manualesPorDefecto]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      // Liberar memoria de la URL anterior si existía
      if (isLocalFile) URL.revokeObjectURL(pdfUrl);
      
      const localUrl = URL.createObjectURL(file);
      setPdfUrl(localUrl);
      setIsLocalFile(true);
      setError('');
    } else {
      setError('Por favor, seleccione un archivo PDF válido');
    }
  };

  const abrirEnNuevaPestana = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="manual-vehiculo p-2">
      {/* Header del Manual */}
      <div className="d-flex align-items-center justify-content-between mb-1 bg-light p-1 rounded-3">
        <div className="d-flex align-items-center gap-1">
          <BookOpen size={14} className="text-primary" />
          <div>
            <div className="fw-bold small leading-tight">{unidad.unidad_nombre}</div>
            <div className="text-muted" style={{ fontSize: '0.6rem' }}>Manual de Usuario</div>
          </div>
        </div>
        <div className="d-flex gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-sm btn-outline-primary rounded-pill d-flex align-items-center gap-1"
            style={{ fontSize: '0.65rem' }}
          >
            <Upload size={10} /> Subir
          </button>
          {pdfUrl && (
            <button
              onClick={abrirEnNuevaPestana}
              className="btn btn-sm btn-primary rounded-pill d-flex align-items-center gap-1"
              style={{ fontSize: '0.65rem' }}
            >
              <ExternalLink size={10} /> Expandir
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        className="d-none"
      />

      {/* Contenedor del Visor */}
      <div className="bg-dark rounded-4 shadow-inner overflow-hidden border border-secondary border-opacity-25" 
           style={{ height: '225px', position: 'relative' }}>
        
        {error ? (
          <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center p-3">
            <AlertCircle size={32} className="text-warning mb-2" />
            <p className="text-white small">{error}</p>
          </div>
        ) : pdfUrl ? (
          /* Visor Nativo de PDF */
          <iframe
            src={`${pdfUrl}#view=FitH&toolbar=1`}
            width="100%"
            height="100%"
            title="Visor de Manual"
            className="bg-white"
            style={{ border: 'none' }}
          />
        ) : (
          <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center p-3">
            <FileText size={40} className="text-secondary mb-2 opacity-25" />
            <p className="text-secondary small mb-2">No hay un manual configurado para esta unidad</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-sm btn-outline-secondary rounded-pill"
            >
              Cargar Manual Manualmente
            </button>
          </div>
        )}
      </div>

      {/* Pie de información */}
      {pdfUrl && (
        <div className="mt-2 d-flex align-items-center justify-content-between px-2">
          <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
            <AlertCircle size={10} />
            Si el PDF no carga, verifica tu conexión o el enlace original.
          </div>
          {isLocalFile && (
            <span className="badge bg-info-subtle text-info border border-info-subtle rounded-pill" style={{ fontSize: '0.65rem' }}>
              Archivo Local
            </span>
          )}
        </div>
      )}

      <style jsx>{`
        .shadow-inner {
          box-shadow: inset 0 2px 15px rgba(0,0,0,0.2);
        }
        /* Estilo para que el iframe se vea integrado */
        iframe {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
}