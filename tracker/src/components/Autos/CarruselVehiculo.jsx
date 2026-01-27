import React, { useMemo } from 'react';
import { ImageIcon, FileText, CreditCard, Leaf } from 'lucide-react';

import { VEHICULOS_UPLOADS_URL } from '../../config.js';

const CarruselVehiculo = React.memo(({ vehiculo }) => {
  const BASE_URL = VEHICULOS_UPLOADS_URL;

  const fotosFinales = useMemo(() => {
    if (!vehiculo) return [];

    let fotos = [];
    // Usamos una marca de tiempo estática para esta versión del renderizado 
    // o simplemente el ID si no necesitas invalidar caché agresivamente.
    const vKey = vehiculo.updated_at || vehiculo.id || '1';

    try {
      // --- A. Fotos del Inventario (JSON) ---
      let inventario = [];
      if (vehiculo.fotos_json) {
        if (typeof vehiculo.fotos_json === 'string') {
          const trimmed = vehiculo.fotos_json.trim();
          if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            try {
              inventario = JSON.parse(trimmed);
            } catch (e) {
              console.warn("JSON malformado, tratando como string simple:", trimmed);
              inventario = [trimmed];
            }
          } else if (trimmed.length > 0) {
            inventario = [trimmed];
          }
        } else {
          inventario = vehiculo.fotos_json;
        }
      }

      if (Array.isArray(inventario)) {
        inventario.forEach((img, idx) => {
          fotos.push({
            url: `${BASE_URL}${img}?v=${vKey}`,
            tipo: 'inventario',
            nombre: `Vista ${idx + 1}`
          });
        });
      }

      // --- B. Fotos de Documentos ---
      const documentos = [
        { campo: 'foto_placas', nombre: 'Placas', icono: FileText },
        { campo: 'foto_circulacion', nombre: 'Tarjeta de Circulación', icono: CreditCard },
        { campo: 'foto_ecologico', nombre: 'Verificación Ecológica', icono: Leaf }
      ];

      documentos.forEach(doc => {
        const valor = vehiculo[doc.campo];
        if (valor && valor !== "" && valor !== "null") {
          fotos.push({
            url: `${BASE_URL}${valor}?v=${vKey}`,
            tipo: 'documento',
            nombre: doc.nombre,
            icono: doc.icono
          });
        }
      });
    } catch (error) {
      console.error("Error al procesar las imágenes:", error);
    }
    return fotos;
  }, [vehiculo, BASE_URL]); // Solo se recalcula si cambia el objeto vehiculo

  if (fotosFinales.length === 0) {
    return (
      <div className="card border-0 shadow-sm rounded-4 bg-white mt-3 d-flex align-items-center justify-content-center p-4 p-md-5" style={{ minHeight: '250px' }}>
        <div className="text-center text-muted opacity-50">
          <ImageIcon size={40} className="mb-2" />
          <p className="fw-bold mb-0 small">Sin imágenes disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="carruselVehiculoCompleto"
      className="carousel slide mt-3 shadow-lg rounded-4 overflow-hidden bg-dark animate__animated animate__fadeIn"
      data-bs-ride="false"
      data-bs-touch="true"
    >
      <div className="carousel-indicators d-none d-sm-flex">
        {fotosFinales.map((_, idx) => (
          <button
            key={idx}
            type="button"
            data-bs-target="#carruselVehiculoCompleto"
            data-bs-slide-to={idx}
            className={idx === 0 ? 'active' : ''}
          ></button>
        ))}
      </div>

      <div className="carousel-inner" style={{ height: 'clamp(250px, 45vh, 450px)' }}>
        {fotosFinales.map((item, idx) => (
          <div key={idx} className={`carousel-item h-100 ${idx === 0 ? 'active' : ''}`}>
            <div className="position-relative h-100 d-flex align-items-center justify-content-center bg-black">
              <img
                src={item.url}
                className="d-block w-100 h-100 object-fit-contain"
                alt={item.nombre}
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  //e.target.src = 'https://via.placeholder.com/800x400?text=Archivo+no+encontrado'; 
                }}
              />

              <div className="position-absolute top-0 start-0 m-2">
                <div className="bg-dark bg-opacity-75 text-white px-3 py-2 rounded-3 d-flex align-items-center gap-2 shadow-sm border border-secondary border-opacity-25">
                  {item.icono && <item.icono size={14} className="text-warning" />}
                  <span className="fw-bold" style={{ fontSize: '0.75rem' }}>{item.nombre}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {fotosFinales.length > 1 && (
        <>
          <button className="carousel-control-prev" type="button" data-bs-target="#carruselVehiculoCompleto" data-bs-slide="prev">
            <span className="bg-dark bg-opacity-50 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
              <span className="carousel-control-prev-icon" aria-hidden="true" style={{ width: '20px' }}></span>
            </span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#carruselVehiculoCompleto" data-bs-slide="next">
            <span className="bg-dark bg-opacity-50 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
              <span className="carousel-control-next-icon" aria-hidden="true" style={{ width: '20px' }}></span>
            </span>
          </button>
        </>
      )}

      <div className="position-absolute bottom-0 end-0 m-2">
        <div className="bg-black bg-opacity-60 text-white px-3 py-1 rounded-pill border border-white border-opacity-25" style={{ fontSize: '0.7rem' }}>
          {fotosFinales.length} elementos
        </div>
      </div>
    </div>
  );
});

export default CarruselVehiculo;