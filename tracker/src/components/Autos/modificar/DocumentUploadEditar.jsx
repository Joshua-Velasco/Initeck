import React from 'react';
import { X, Plus, Camera, MapPin, Pipette, CreditCard, Image as ImageIcon, Smartphone } from 'lucide-react';

export const DocumentUploadEditar = ({ 
  previews = { unit_photos: [] }, 
  onFileChange, 
  onMultipleChange, 
  onCameraCapture,
  onMultipleCameraCapture,
  onRemoveDoc, 
  onRemovePhoto 
}) => {
  
  const docTypes = [
    { key: 'placas', label: 'Foto Placas', icon: MapPin, color: 'text-primary' },
    { key: 'ecologico', label: 'Engomado Ecológico', icon: Pipette, color: 'text-success' },
    { key: 'circulacion', label: 'Tarjeta Circulación', icon: CreditCard, color: 'text-warning' },
  ];

  // Aseguramos que unitPhotos siempre sea un array para evitar errores de .map()
  const unitPhotos = Array.isArray(previews?.unit_photos) ? previews.unit_photos : [];

  return (
    <div className="p-2">
      <div className="d-flex align-items-center mb-4">
        <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
          <Camera size={20} className="text-primary" />
        </div>
        <h6 className="fw-bold mb-0 text-uppercase small tracking-wide">
          Documentación Visual y Galería
        </h6>
      </div>
      
      {/* Sección de Documentos Oficiales */}
      <div className="row g-3 mb-4">
        {docTypes.map(item => (
          <div className="col-md-4" key={item.key}>
            <div className="bg-white p-3 rounded-4 border shadow-sm h-100">
              <label className="small fw-bold text-secondary mb-2 d-block text-center">{item.label}</label>
              
              <div 
                className={`img-upload-box position-relative rounded-3 d-flex align-items-center justify-content-center border-2 border-dashed ${previews[item.key] ? 'border-primary' : 'border-light bg-light'}`}
                style={{ height: '140px', cursor: 'pointer', overflow: 'hidden' }}
                onClick={() => document.getElementById(`edit-f-${item.key}`).click()}
              >
                {previews[item.key] ? (
                  <>
                    <img 
                      src={previews[item.key]} 
                      alt={item.key} 
                      className="w-100 h-100 object-fit-cover"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/400x300?text=Error+al+cargar'; // Imagen de respaldo si falla la ruta
                      }}
                    />
                    <div className="position-absolute top-0 end-0 p-2">
                      <button 
                        type="button" 
                        className="btn btn-danger btn-sm rounded-circle shadow-sm d-flex align-items-center justify-content-center" 
                        style={{ width: '24px', height: '24px' }} 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onRemoveDoc(item.key); 
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <item.icon size={32} className={`${item.color} opacity-50 mb-2`} />
                    <p className="mb-0 x-small fw-bold text-muted">SUBIR FOTO</p>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                id={`edit-f-${item.key}`} 
                hidden 
                accept="image/*"
                onChange={e => onFileChange(e, item.key)} 
              />
              
              {/* Botón de cámara para documentos */}
              {onCameraCapture && (
                <button
                  type="button"
                  className="btn btn-sm btn-primary mt-2 w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCameraCapture(item.key);
                  }}
                >
                  <Smartphone size={14} />
                  <span style={{ fontSize: '0.7rem' }}>Tomar Foto</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Sección de Fotos de la Unidad */}
      <div className="bg-white p-4 rounded-4 border shadow-sm">
        <label className="small fw-bold text-secondary mb-3 d-flex align-items-center gap-2 text-uppercase">
          <ImageIcon size={16} className="text-primary" /> Fotos Generales de la Unidad
        </label>
        
        <div className="d-flex flex-wrap gap-3">
          {unitPhotos.map((url, index) => (
            <div 
              className="position-relative shadow-sm rounded-3 border overflow-hidden" 
              key={index} 
              style={{ width: '100px', height: '100px' }}
            >
              <img 
                src={url} 
                alt={`unidad-${index}`} 
                className="w-100 h-100 object-fit-cover"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/100x100?text=No+Foto';
                }}
              />
              <button 
                type="button" 
                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 p-0 rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '20px', height: '20px', zIndex: 5 }}
                onClick={() => onRemovePhoto(index)}
              >
                <X size={12} />
              </button>
            </div>
          ))}
          
          {/* Botones para añadir fotos */}
          <div className="d-flex flex-column gap-2">
            {/* Botón Añadir desde Archivos */}
            <div 
              className="border-2 border-dashed rounded-3 d-flex flex-column align-items-center justify-content-center bg-light text-muted hover-bg-light-blue transition-all" 
              style={{ width: '100px', height: '80px', cursor: 'pointer' }} 
              onClick={() => document.getElementById('edit-f-unit-multiple').click()}
            >
              <Plus size={20} />
              <span style={{ fontSize: '0.6rem' }} className="fw-bold mt-1">ARCHIVO</span>
            </div>
            
            {/* Botón Tomar Foto con Cámara */}
            {onMultipleCameraCapture && (
              <div 
                className="border-2 border-dashed rounded-3 d-flex flex-column align-items-center justify-content-center bg-primary text-white hover-bg-primary-dark transition-all" 
                style={{ width: '100px', height: '80px', cursor: 'pointer' }} 
                onClick={onMultipleCameraCapture}
              >
                <Smartphone size={20} />
                <span style={{ fontSize: '0.6rem' }} className="fw-bold mt-1">CÁMARA</span>
              </div>
            )}
          </div>
          <input 
            type="file" 
            id="edit-f-unit-multiple" 
            hidden 
            multiple 
            accept="image/*" 
            onChange={onMultipleChange} 
          />
        </div>
      </div>
    </div>
  );
};