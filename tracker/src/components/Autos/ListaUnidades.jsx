import React, { useState } from 'react';
import { Car, Trash2, EyeOff } from 'lucide-react';
import ModalBorrarUnidad from './estatus/ModalBorrarUnidad';
import { buildUploadUrl } from '../../../config.js';

const ListaUnidades = ({ vehiculos, seleccionado, alSeleccionar, alEliminar }) => {
  const [unidadParaEliminar, setUnidadParaEliminar] = useState(null);

  const getPrimeraImagen = (fotosJson) => {
    try {
      // Manejamos si ya es objeto o si viene como string JSON
      const fotos = typeof fotosJson === 'string' ? JSON.parse(fotosJson) : fotosJson;
      
      if (Array.isArray(fotos) && fotos.length > 0) {
        // Retornamos la URL completa apuntando a la primera imagen
        return `${buildUploadUrl()}${fotos[0]}`;
      }
    } catch {
      return null; 
    }
    return null;
  };

  const getStatusColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activo': return '#22c55e';
      case 'mantenimiento': return '#eab308';
      case 'en taller': case 'inactivo': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white h-100 overflow-hidden">
      {/* CABECERA */}
      <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
        <h6 className="fw-bold mb-0 small text-uppercase d-flex align-items-center">
          <Car size={16} className="me-2 text-primary" /> Unidades
        </h6>
        
        <div className="d-flex align-items-center gap-2">
          {seleccionado && (
            <button 
              onClick={() => alSeleccionar(null)}
              className="btn btn-xs btn-outline-secondary rounded-pill px-2 py-1 d-flex align-items-center gap-1"
              style={{ fontSize: '0.65rem', fontWeight: 'bold' }}
            >
              <EyeOff size={12} /> Privado
            </button>
          )}
          <span className="badge bg-primary rounded-pill small">{vehiculos.length}</span>
        </div>
      </div>

      {/* LISTADO */}
      <div className="p-2 overflow-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 250px)' }}>
        {vehiculos.length === 0 ? (
          <div className="text-center py-5">
            <Car size={40} className="text-muted opacity-25 mb-2" />
            <p className="text-muted small">No hay unidades</p>
          </div>
        ) : (
          vehiculos.map(v => {
            const imagenUrl = getPrimeraImagen(v.fotos_json);
            const esSeleccionado = seleccionado?.id === v.id;

            return (
              <div
                key={v.id}
                onClick={() => alSeleccionar(v)}
                className={`d-flex align-items-center p-2 mb-2 rounded-4 cursor-pointer border transition-all animate__animated animate__fadeIn ${
                  esSeleccionado ? 'border-primary bg-primary text-white shadow' : 'border-light bg-white hover-light'
                }`}
              >
                {/* CONTENEDOR DE IMAGEN / PREVIEW */}
                <div
                  className={`rounded-3 d-flex align-items-center justify-content-center me-3 overflow-hidden border ${
                    esSeleccionado ? 'bg-white bg-opacity-20 border-white border-opacity-25' : 'bg-light border-secondary border-opacity-10'
                  }`}
                  style={{ width: '50px', height: '50px', minWidth: '50px' }}
                >
                  {imagenUrl ? (
                    <img 
                      src={imagenUrl} 
                      alt="preview" 
                      className="img-fluid"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'vía.placeholder.com/50'; // Imagen de respaldo si falla el link
                      }}
                    />
                  ) : (
                    <Car size={20} className={esSeleccionado ? 'text-white' : 'text-muted'} />
                  )}
                </div>

                <div className="flex-grow-1 overflow-hidden">
                  <div className="d-flex align-items-center gap-2">
                    <div className="fw-bold text-truncate" style={{ fontSize: '0.85rem', letterSpacing: '-0.02em' }}>
                      {v.unidad_nombre}
                    </div>
                    <span
                      style={{
                        width: '8px', height: '8px',
                        backgroundColor: getStatusColor(v.estado),
                        borderRadius: '50%', flexShrink: 0
                      }}
                    />
                  </div>
                  <div className={`small ${esSeleccionado ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                    {v.placas}
                  </div>
                  <div className={`small ${esSeleccionado ? 'text-white-50' : 'text-muted'} d-flex align-items-center gap-1`} style={{ fontSize: '0.7rem' }}>
                    <span className="badge bg-secondary bg-opacity-10 text-secondary border-secondary border-opacity-25 rounded-pill px-2 py-0">
                      {v.tipo_unidad || 'Nacional'}
                    </span>
                    {v.numero_serie && (
                      <span className="text-truncate" style={{ maxWidth: '120px' }}>
                        VIN: {v.numero_serie}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className={`btn btn-link p-2 border-0 ${esSeleccionado ? 'text-white' : 'text-danger'} opacity-50 hover-opacity-100`}
                  data-bs-toggle="modal"
                  data-bs-target="#modalBorrarUnidad"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUnidadParaEliminar(v);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <ModalBorrarUnidad 
        unidad={unidadParaEliminar} 
        onConfirm={() => {
          alEliminar(unidadParaEliminar.id);
          setUnidadParaEliminar(null);
        }} 
      />
    </div>
  );
};

export default ListaUnidades;