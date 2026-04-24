import React, { useEffect, useState } from 'react';
import { Camera, CheckCircle2, X } from 'lucide-react';

const CapturaEvidencia = ({ label, foto, onCaptura, onEliminar }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (foto && typeof foto !== 'string') {
      const objectUrl = URL.createObjectURL(foto);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof foto === 'string') {
        setPreviewUrl(foto);
    } else {
        setPreviewUrl(null);
    }
  }, [foto]);

  return (
    <div className="col-md-4">
      <label className="form-label small fw-bold text-muted">{label}</label>
      <div className={`card border-2 ${foto ? 'border-success' : 'border-dashed'} rounded-4 overflow-hidden position-relative`} 
           style={{ minHeight: '120px', backgroundColor: '#f8f9fa' }}>
        {foto ? (
          <>
            <img src={previewUrl} alt={label} className="w-100" style={{ height: '120px', objectFit: 'cover' }} />
            <button 
              onClick={onEliminar}
            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle shadow"
          >
            <X size={14} />
          </button>
          <div className="position-absolute bottom-0 start-0 w-100 bg-success text-white text-center small py-1 opacity-75">
            <CheckCircle2 size={12} className="me-1"/> Capturada
          </div>
        </>
      ) : (
        <label className="d-flex flex-column align-items-center justify-content-center w-100 h-100 cursor-pointer p-3" style={{ height: '120px' }}>
          <Camera size={24} className="text-muted mb-2" />
          <span className="text-muted" style={{ fontSize: '10px' }}>TOMAR FOTO</span>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" // <--- ESTO FUERZA LA CÁMARA
            className="d-none"
            onChange={(e) => onCaptura(e.target.files[0])}
          />
        </label>
      )}
    </div>
  </div>
  );
};

export default CapturaEvidencia;