import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { BookOpen, Search, Download, Eye, Upload, FileText, AlertCircle } from 'lucide-react';

export default function ManualVehiculo({ unidad }) {
  const [pdfFile, setPdfFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // URLs de ejemplo para manuales (en producción vendrían de la BD)
  const manualesPorDefecto = useMemo(() => ({
    'Toyota': 'https://www.toyota.com/content/dam/toyota/manual/2022/camry/2022_toyota_camry_owners_manual.pdf',
    'Honda': 'https://www.honda.com/content/dam/honda/manual/2022/civic/2022_honda_civic_owners_manual.pdf',
    'Nissan': 'https://www.nissan.com/content/dam/nissan/manual/2022/sentra/2022_nissan_sentra_owners_manual.pdf',
    'Ford': 'https://www.ford.com/content/dam/ford/manual/2022/focus/2022_ford_focus_owners_manual.pdf',
    'Chevrolet': 'https://www.chevrolet.com/content/dam/chevrolet/manual/2022/malibu/2022_chevrolet_malibu_owners_manual.pdf'
  }), []);

  const loadPdfFromUrl = useCallback(async (url) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('No se pudo cargar el manual');
      
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const file = new File([blob], `manual_${unidad.unidad_nombre}.pdf`, { type: 'application/pdf' });
      
      setPdfFile(file);
      // Simular carga de documento
      setTotalPages(Math.floor(Math.random() * 50) + 100);
      setCurrentPage(1);
    } catch (error) {
      setError('No se encontró un manual para este vehículo');
    } finally {
      setIsLoading(false);
    }
  }, [unidad]);

  useEffect(() => {
    // Cargar manual por defecto si existe
    if (unidad && !pdfFile) {
      const marca = unidad.modelo?.split(' ')[0] || 'Toyota';
      const manualUrl = manualesPorDefecto[marca];
      if (manualUrl) {
        loadPdfFromUrl(manualUrl);
      }
    }
  }, [unidad, pdfFile, loadPdfFromUrl, manualesPorDefecto]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      // Simular carga de documento
      setTotalPages(Math.floor(Math.random() * 50) + 100);
      setCurrentPage(1);
      setError('');
    } else {
      setError('Por favor, seleccione un archivo PDF válido');
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    // Implementar búsqueda en el PDF (requiere PDF.js)
  };

  const handleDownload = () => {
    if (pdfFile) {
      const url = URL.createObjectURL(pdfFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = `manual_${unidad.unidad_nombre}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const renderPdfPage = () => {
    // Simulación de renderizado de página
    return (
      <div className="d-flex flex-column align-items-center justify-content-center bg-light rounded-3" style={{ height: '400px' }}>
        <FileText size={48} className="text-muted mb-3" />
        <p className="text-muted">Página {currentPage} de {totalPages}</p>
        <p className="text-muted small">Vista previa del manual</p>
        <p className="text-muted small">Busca: "{searchTerm || '...'}"</p>
      </div>
    );
  };

  return (
    <div className="manual-vehiculo">
      {/* Header del Manual */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2">
          <BookOpen size={16} className="text-primary" />
          <span className="fw-bold small">{unidad.unidad_nombre}</span>
        </div>
        <div className="d-flex gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-sm btn-outline-primary rounded-pill px-2 py-1"
            title="Subir manual"
          >
            <Upload size={14} />
          </button>
          <button
            onClick={handleDownload}
            className="btn btn-sm btn-outline-success rounded-pill px-2 py-1"
            title="Descargar manual"
            disabled={!pdfFile}
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Input oculto para subir archivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileUpload}
        className="d-none"
      />

      {/* Barra de búsqueda */}
      <div className="input-group input-group-sm mb-3">
        <span className="input-group-text bg-light border-0">
          <Search size={14} />
        </span>
        <input
          type="text"
          className="form-control border-0 bg-light"
          placeholder="Buscar en el manual..."
          value={searchTerm}
          onChange={handleSearch}
          disabled={!pdfFile}
        />
      </div>

      {/* Contenido del PDF */}
      <div className="bg-white rounded-3 border overflow-hidden" style={{ height: '400px' }}>
        {isLoading ? (
          <div className="d-flex flex-column align-items-center justify-content-center h-100">
            <div className="spinner-border text-primary mb-2" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted small">Cargando manual...</p>
          </div>
        ) : error ? (
          <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center p-4">
            <AlertCircle size={32} className="text-warning mb-2" />
            <p className="text-muted small">{error}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-sm btn-primary rounded-pill mt-2"
            >
              <Upload size={14} className="me-1" />
              Subir Manual
            </button>
          </div>
        ) : pdfFile ? (
          <div className="h-100">
            {/* Visor del PDF */}
            <div className="h-100 d-flex flex-column">
              {/* Barra de navegación */}
              <div className="d-flex align-items-center justify-content-between bg-light p-2 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className="btn btn-sm btn-outline-secondary rounded"
                    disabled={currentPage <= 1}
                  >
                    ‹
                  </button>
                  <span className="small text-muted">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className="btn btn-sm btn-outline-secondary rounded"
                    disabled={currentPage >= totalPages}
                  >
                    ›
                  </button>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-sm btn-outline-secondary rounded">
                    <Eye size={14} />
                  </button>
                  <button className="btn btn-sm btn-outline-secondary rounded">
                    <Download size={14} />
                  </button>
                </div>
              </div>

              {/* Área del PDF */}
              <div className="flex-grow-1 p-3">
                {renderPdfPage()}
              </div>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center p-4">
            <FileText size={48} className="text-muted mb-3 opacity-50" />
            <p className="text-muted small mb-3">No hay manual disponible</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-sm btn-primary rounded-pill"
            >
              <Upload size={14} className="me-1" />
              Subir Manual PDF
            </button>
          </div>
        )}
      </div>

      {/* Información del archivo */}
      {pdfFile && (
        <div className="mt-2 p-2 bg-light rounded-2">
          <div className="d-flex align-items-center justify-content-between">
            <div className="small text-muted">
              <FileText size={12} className="me-1" />
              {pdfFile.name}
            </div>
            <div className="small text-muted">
              {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .manual-vehiculo .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
