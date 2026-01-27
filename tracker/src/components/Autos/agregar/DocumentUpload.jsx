import React from 'react';
import { X, Plus, Camera, MapPin, Pipette, CreditCard, Smartphone } from 'lucide-react';

export const DocumentUpload = ({
  previews = { unit_photos: [] }, // Valor por defecto para evitar errores de undefined
  onFileChange,
  onMultipleChange,
  onCameraCapture,
  onMultipleCameraCapture,
  onRemoveDoc,
  onRemovePhoto
}) => {

  // Mapeo de iconos para que coincidan con tu diseño original
  const docTypes = [
    { key: 'placas', label: 'Placas', icon: MapPin },
    { key: 'ecologico', label: 'Ecológico', icon: Pipette },
    { key: 'circulacion', label: 'Circulación', icon: CreditCard },
  ];

  // Extraemos unit_photos de forma segura
  const unitPhotos = previews?.unit_photos || [];

  return (
    <div className="section-card">
      <h6 className="section-title"><Camera size={18} className="me-2" /> 2. Documentación Visual</h6>

      <div className="img-upload-grid mb-3">
        {docTypes.map(item => (
          <div className="img-upload-item" key={item.key}>
            <label className="small fw-bold text-muted mb-1 d-block">{item.label}</label>
            <div
              className="img-upload-box position-relative"
              onClick={() => document.getElementById(`f-${item.key}`).click()}
            >
              {previews && previews[item.key] ? (
                <>
                  <img src={previews[item.key]} alt="preview" className="w-100 h-100 object-fit-cover rounded-2" />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '20px', height: '20px', transform: 'translate(30%, -30%)', zIndex: 10 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveDoc(item.key);
                    }}
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <item.icon size={24} className="text-muted opacity-50" />
              )}
            </div>
            <input
              type="file"
              id={`f-${item.key}`}
              hidden
              accept="image/*"
              capture="environment"
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
                <Smartphone size={12} />
                <span style={{ fontSize: '0.65rem' }}>Tomar Foto</span>
              </button>
            )}
          </div>
        ))}
      </div>

      <label className="small fw-bold text-muted mb-2 d-block">Fotos de la Unidad (Múltiples)</label>
      <div className="d-flex flex-wrap gap-2">
        {unitPhotos.map((url, index) => (
          <div className="img-upload-box position-relative" key={index} style={{ width: '85px', height: '85px' }}>
            <img src={url} alt="unidad" className="w-100 h-100 object-fit-cover rounded-2" />
            <button
              type="button"
              className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '20px', height: '20px', transform: 'translate(30%, -30%)' }}
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
            className="img-upload-box border-dashed d-flex flex-column align-items-center justify-content-center bg-light"
            style={{ width: '85px', height: '70px', cursor: 'pointer' }}
            onClick={() => document.getElementById('f-unit-multiple').click()}
          >
            <Plus size={20} className="text-muted" />
            <span style={{ fontSize: '0.55rem' }} className="fw-bold text-muted">ARCHIVO</span>
          </div>

          {/* Botón Tomar Foto con Cámara */}
          {onMultipleCameraCapture && (
            <div
              className="img-upload-box border-dashed d-flex flex-column align-items-center justify-content-center bg-primary text-white"
              style={{ width: '85px', height: '70px', cursor: 'pointer' }}
              onClick={onMultipleCameraCapture}
            >
              <Smartphone size={20} />
              <span style={{ fontSize: '0.55rem' }} className="fw-bold mt-1">CÁMARA</span>
            </div>
          )}
        </div>
        <input
          type="file"
          id="f-unit-multiple"
          hidden
          multiple
          accept="image/*"
          capture="environment"
          onChange={onMultipleChange}
        />
      </div>
    </div>
  );
};