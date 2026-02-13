import React, { useState } from 'react';
import {
  Search, Activity, Image as ImageIcon,
  ChevronDown, ChevronUp, Calendar,
  User, FileText, Trash2, TrendingUp, TrendingDown, PenTool
} from 'lucide-react';

// 1. IMPORTANTE: Verifica que esta URL sea accesible desde tu navegador
import { VEHICULOS_UPLOADS_URL as BASE_UPLOADS } from '../../../config.js';

export default function TablaMantenimiento({
  registros,
  searchTerm,
  setSearchTerm,
  unidadSeleccionada,
  onDelete
}) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleRow = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDeleteClick = (e, registro) => {
    e.stopPropagation();
    if (onDelete) onDelete(registro);
  };

  // Función para construir la URL del archivo
  const getFileUrl = (fileName) => {
    if (!fileName || fileName.trim() === "") return null;
    return `${BASE_UPLOADS}${fileName}`;
  };

  const renderImagenes = (fotoString, size = '50px') => {
    const url = getFileUrl(fotoString);
    if (!url) return <ImageIcon size={20} className="text-muted opacity-50" />;

    return (
      <div
        className="position-relative rounded-3 overflow-hidden bg-light border item-galeria"
        style={{ width: size, height: size, cursor: 'pointer' }}
        onClick={(e) => {
          e.stopPropagation();
          window.open(url, '_blank');
        }}
      >
        <img
          src={url}
          className="w-100 h-100 object-fit-cover"
          alt="Evidencia"
          onError={(e) => {
            e.target.onerror = null;
            //e.target.src = 'https://via.placeholder.com/100x100?text=Error';
          }}
        />
      </div>
    );
  };

  return (
    <div className="card border-0 shadow-sm overflow-hidden bg-white animate__animated animate__fadeInUp" style={{ borderRadius: '24px' }}>
      <div className="card-header border-0 p-3 p-sm-4 d-flex flex-column gap-3" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <h5 className="fw-bold mb-0 text-white d-flex align-items-center gap-2 flex-wrap">
          <Activity size={28} className="opacity-75" />
          <span className="fs-4">Historial de Servicios</span>
        </h5>
        <div className="input-group w-100" style={{ maxWidth: '100%' }}>
          <span className="input-group-text bg-white bg-opacity-20 border-0 text-white">
            <Search size={18} />
          </span>
          <input
            type="text"
            className="form-control bg-white bg-opacity-90 border-0 shadow-none"
            placeholder="Buscar por responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontSize: '0.9rem' }}
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="d-none d-md-block table-responsive" style={{ borderRadius: '0 0 1rem 1rem' }}>
        <table className="table align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
          <thead className="bg-light text-dark text-uppercase" style={{ background: '#f8f9fa' }}>
            <tr>
              <th className="ps-4 fw-bold border-0" style={{ width: '50px', padding: '1.25rem 1rem', fontSize: '1rem' }}></th>
              <th className="fw-bold border-0" style={{ padding: '1.25rem 1rem', fontSize: '1rem' }}>Servicio / Tipo</th>
              {!unidadSeleccionada && <th className="text-center fw-bold border-0" style={{ padding: '1.25rem 1rem', fontSize: '1rem' }}>Unidad</th>}
              <th className="text-center fw-bold border-0" style={{ padding: '1.25rem 1rem', fontSize: '1rem' }}>Kilometraje</th>
              <th className="text-center fw-bold border-0" style={{ padding: '1.25rem 1rem', fontSize: '1rem' }}>Costo Real</th>
              <th className="pe-4 text-end fw-bold border-0" style={{ padding: '1.25rem 1rem', fontSize: '1rem' }}>Fecha</th>
              <th className="text-center border-0" style={{ width: '120px', padding: '1.25rem 1rem', fontSize: '1rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {registros.length > 0 ? (
              registros.map((reg) => {
                const costo = parseFloat(reg.costo_total || 0);

                return (
                  <React.Fragment key={reg.id}>
                    <tr
                      className={`cursor-pointer transition-all position-relative ${expandedId === reg.id ? 'bg-primary bg-opacity-10' : 'hover-bg-light'}`}
                      onClick={() => toggleRow(reg.id)}
                      style={{ borderBottom: '1px solid #e9ecef' }}
                    >
                      <td className="ps-4 text-center" style={{ padding: '1.5rem 1rem' }}>
                        <div className={`rounded-circle p-2 transition-all d-flex align-items-center justify-content-center ${expandedId === reg.id
                          ? 'bg-primary text-white'
                          : 'bg-secondary bg-opacity-10 text-secondary'
                          }`} style={{ width: 40, height: 40 }}>
                          {expandedId === reg.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                        </div>
                      </td>
                      <td style={{ padding: '1.5rem 1rem' }}>
                        <div className="fw-bold text-dark mb-1" style={{ fontSize: '1.2rem' }}>{reg.tipo}</div>
                        <div className="text-muted" style={{ fontSize: '1.1rem' }}>
                            {(() => {
                                const fullDesc = reg.descripcion || '';
                                // Tomar solo la parte antes del desglose
                                const mainDesc = fullDesc.split('Desglose de Costos:')[0].trim();
                                return mainDesc.substring(0, 50) + (mainDesc.length > 50 ? '...' : '');
                            })()}
                        </div>
                      </td>
                      {!unidadSeleccionada && (
                        <td className="text-center" style={{ padding: '1.5rem 1rem' }}>
                          <span className="badge bg-white text-dark border px-3 py-2 rounded-pill fw-bold" style={{ fontSize: '1rem' }}>{reg.unidad_nombre}</span>
                        </td>
                      )}
                      <td className="text-center font-monospace" style={{ padding: '1.5rem 1rem', fontSize: '1.1rem' }}>
                        {Number(reg.kilometraje_al_momento).toLocaleString()} {reg.unidad_medida || 'km'}
                      </td>
                      <td className="text-center fw-bold text-primary" style={{ padding: '1.5rem 1rem', fontSize: '1.2rem' }}>${costo.toLocaleString()}</td>
                      <td className="pe-4 text-end" style={{ padding: '1.5rem 1rem' }}>
                        <div className="fw-bold text-dark" style={{ fontSize: '1.1rem' }}>{new Date(reg.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                      </td>
                      <td className="text-center" style={{ padding: '1.5rem 1rem' }}>
                        <button
                          onClick={(e) => handleDeleteClick(e, reg)}
                          className="btn btn-outline-danger border-2 d-flex align-items-center justify-content-center gap-2 px-3 py-2 rounded-3 fw-bold mx-auto transition-all hover-scale"
                          title="Eliminar registro"
                        >
                          <Trash2 size={18} />
                          <span>Eliminar</span>
                        </button>
                      </td>
                    </tr>

                    {expandedId === reg.id && (
                      <tr>
                        <td colSpan={unidadSeleccionada ? 7 : 8} className="p-0 border-0">
                          <div className="bg-white p-5 border-bottom border-3 border-primary" style={{ backgroundColor: '#f8f9fa' }}>
                            <div className="row g-5">
                              <div className="col-lg-7">
                                <h5 className="fw-bold mb-4 text-dark d-flex align-items-center gap-2 border-bottom pb-3">
                                  <Activity size={24} className="text-primary"/> Detalle del Servicio
                                </h5>
                                
                                <div className="mb-4 bg-light p-4 rounded-4 border">
                                  <label className="text-secondary fw-bold text-uppercase mb-2" style={{ fontSize: '0.85rem' }}>Diagnóstico / Descripción</label>
                                  <div className="fs-5 text-dark" style={{ lineHeight: '1.6' }}>
                                    {(() => {
                                        const desc = reg.descripcion || "Sin descripción detallada.";
                                        if (!desc.includes("Desglose de Costos:")) {
                                            return <div style={{ whiteSpace: 'pre-wrap' }}>{desc}</div>;
                                        }
                                        const [mainText, breakdown] = desc.split("Desglose de Costos:");
                                        return (
                                            <>
                                                <div className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>{mainText.trim()}</div>
                                                <div className="bg-white p-3 rounded-3 border-start border-4 border-primary shadow-sm">
                                                    <h6 className="fw-bold text-primary mb-2 d-flex align-items-center gap-2">
                                                        <FileText size={16}/> Desglose de Costos
                                                    </h6>
                                                    <div className="d-flex flex-column gap-1">
                                                        {breakdown.split('\n').map((line, i) => {
                                                            const cleanLine = line.trim();
                                                            if (!cleanLine) return null;
                                                            return (
                                                                <div key={i} className="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                                                                    <span className="text-secondary">{cleanLine.split(':')[0]?.replace('- ', '')}</span>
                                                                    <span className="fw-bold text-dark">{cleanLine.split(':')[1] || ''}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                  </div>
                                </div>
                                <div className="row g-4">
                                  <DetailBox icon={<User />} label="Responsable" value={reg.responsable || 'No registrado'} />
                                  <DetailBox icon={<Calendar />} label="Fecha del Servicio" value={new Date(reg.fecha).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
                                  <DetailBox icon={<FileText />} label="Folio Interno" value={`#${reg.id}`} />
                                  <DetailBox icon={<Activity />} label="Estatus Actual" value={reg.estado} />
                                </div>
                              </div>

                              <div className="col-lg-5">
                                <div className="d-flex flex-column gap-4">
                                  <div className="card border h-100 shadow-sm rounded-4">
                                    <div className="card-header bg-white border-bottom pt-3 pb-2">
                                       <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                        <ImageIcon size={20} className="text-primary" /> Evidencia Fotográfica
                                      </h6>
                                    </div>
                                    <div className="card-body p-4 d-flex justify-content-center align-items-center bg-light">
                                      {renderImagenes(reg.evidencia_foto, '150px')}
                                    </div>
                                  </div>

                                  <div className="card border h-100 shadow-sm rounded-4">
                                    <div className="card-header bg-white border-bottom pt-3 pb-2">
                                       <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                                        <PenTool size={20} className="text-primary" /> Firma de Conformidad
                                      </h6>
                                    </div>
                                    <div className="card-body p-4 d-flex justify-content-center align-items-center bg-light">
                                      {reg.firma_empleado ? (
                                        <div className="bg-white border rounded-3 p-2" style={{maxWidth: '100%'}}>
                                            <img
                                              src={getFileUrl(reg.firma_empleado)}
                                              className="img-fluid"
                                              style={{ maxHeight:'100px', mixBlendMode: 'multiply' }}
                                              alt="Firma"
                                            />
                                        </div>
                                      ) : <span className="text-muted fst-italic">Sin firma registrada</span>}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={unidadSeleccionada ? 7 : 8} className="text-center py-5">
                  <div className="text-muted py-5">
                    <Activity size={64} className="mb-4 opacity-25" />
                    <h4 className="fw-bold mb-2">Sin registros de mantenimiento</h4>
                    <p className="fs-5">No se encontraron servicios registrados para esta unidad.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="d-md-none p-3 d-flex flex-column gap-3">
        {registros.length > 0 ? (
          registros.map((reg) => {
            const costo = parseFloat(reg.costo_total || 0);

            return (
              <div key={reg.id} className="card border shadow-sm rounded-4 overflow-hidden">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div className="flex-grow-1">
                      <h5 className="fw-bold text-dark mb-2">{reg.tipo}</h5>
                      <div className="text-secondary fs-6">{new Date(reg.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteClick(e, reg)}
                      className="btn btn-outline-danger border-2 rounded-3 p-2 d-flex align-items-center gap-2"
                    >
                      <Trash2 size={20} /> <span className="fw-bold small">Eliminar</span>
                    </button>
                  </div>

                  {!unidadSeleccionada && (
                    <div className="mb-3">
                      <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fs-6">
                        {reg.unidad_nombre}
                      </span>
                    </div>
                  )}

                  <div className="row g-3 mb-4">
                    <div className="col-6">
                      <div className="text-muted small fw-bold text-uppercase mb-1">Kilometraje</div>
                      <div className="fs-5 fw-bold text-dark">{Number(reg.kilometraje_al_momento).toLocaleString()} km</div>
                    </div>
                    <div className="col-6">
                      <div className="text-muted small fw-bold text-uppercase mb-1">Costo Real</div>
                      <div className="fs-5 fw-bold text-primary">${costo.toLocaleString()}</div>
                    </div>
                  </div>

                  <button
                    className={`btn w-100 py-3 rounded-3 fw-bold d-flex justify-content-center align-items-center gap-2 ${expandedId === reg.id ? 'btn-secondary text-white' : 'btn-outline-primary'}`}
                    onClick={() => toggleRow(reg.id)}
                    style={{ fontSize: '1.1rem' }}
                  >
                     {expandedId === reg.id ? 'Ocultar Detalles' : 'Ver Detalles Completos'}
                     {expandedId === reg.id ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                  </button>

                  {expandedId === reg.id && (
                    <div className="mt-4 pt-4 border-top">
                      <div className="mb-4">
                        <label className="text-muted fw-bold small text-uppercase mb-2">Descripción</label>
                        <div className="fs-6 bg-light p-3 rounded-3 border">
                            {(() => {
                                const desc = reg.descripcion || "Sin descripción";
                                if (!desc.includes("Desglose de Costos:")) {
                                    return <div style={{ whiteSpace: 'pre-wrap' }}>{desc}</div>;
                                }
                                const [mainText, breakdown] = desc.split("Desglose de Costos:");
                                return (
                                    <>
                                        <div className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>{mainText.trim()}</div>
                                        <div className="bg-white p-3 rounded-3 border-start border-4 border-primary shadow-sm">
                                            <h6 className="fw-bold text-primary mb-2 d-flex align-items-center gap-2">
                                                <FileText size={16}/> Desglose de Costos
                                            </h6>
                                            <div className="d-flex flex-column gap-1">
                                                {breakdown.split('\n').map((line, i) => {
                                                    const cleanLine = line.trim();
                                                    if (!cleanLine) return null;
                                                    return (
                                                        <div key={i} className="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                                                            <span className="text-secondary">{cleanLine.split(':')[0]?.replace('- ', '')}</span>
                                                            <span className="fw-bold text-dark">{cleanLine.split(':')[1] || ''}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                      </div>

                      <div className="row g-3 mb-4">
                        <div className="col-12">
                           <label className="text-muted fw-bold small text-uppercase">Responsable</label>
                           <div className="fs-5 fw-bold text-dark">{reg.responsable || 'No registrado'}</div>
                        </div>
                        <div className="col-6">
                           <label className="text-muted fw-bold small text-uppercase">Estatus</label>
                           <div className="fs-6">{reg.estado}</div>
                        </div>
                      </div>

                      <div className="row g-3"> 
                        {reg.evidencia_foto && (
                          <div className="col-6 text-center">
                            <label className="d-block text-muted fw-bold small text-uppercase mb-2">Evidencia</label>
                             {renderImagenes(reg.evidencia_foto, '100%')}
                          </div>
                        )}
                        {reg.firma_empleado && (
                           <div className="col-6 text-center">
                              <label className="d-block text-muted fw-bold small text-uppercase mb-2">Firma</label>
                              <img src={getFileUrl(reg.firma_empleado)} className="img-fluid border rounded" style={{maxHeight: 100}} alt="Firma"/>
                           </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-5 bg-white rounded-4 shadow-sm">
            <Activity size={56} className="mb-3 opacity-25" />
            <h5 className="fw-bold">Sin registros</h5>
            <p className="text-muted">No hay información para mostrar.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailBox({ icon, label, value }) {
  return (
    <div className="col-md-6 col-lg-6">
      <div className="d-flex align-items-center gap-2 text-secondary mb-1">
        {React.cloneElement(icon, { size: 18, className: 'text-primary' })}
        <span className="fw-bold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>{label}</span>
      </div>
      <div className="fw-bold text-dark fs-5">{value}</div>
    </div>
  );
}