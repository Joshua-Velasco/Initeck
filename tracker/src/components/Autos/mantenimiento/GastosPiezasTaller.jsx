import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Trash2, Calendar, DollarSign, Image as ImageIcon, Search } from 'lucide-react';
import { TALLER_GASTOS_PIEZAS_URL, BASE_API } from '../../../config';
import ModalGastoPieza from './ModalGastoPieza';
import ModalBorrar from '../estatus/ModalBorrar';

export default function GastosPiezasTaller({ unidadId, vehiculos }) {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModalForm, setShowModalForm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchGastos = async () => {
    setLoading(true);
    try {
      // Intentamos con ambos parámetros por si acaso el backend usa uno u otro
      const url = unidadId 
        ? `${TALLER_GASTOS_PIEZAS_URL}?unidad_id=${unidadId}&vehiculo_id=${unidadId}` 
        : TALLER_GASTOS_PIEZAS_URL;
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        setGastos(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGastos();
  }, [unidadId]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await fetch(`${TALLER_GASTOS_PIEZAS_URL}?id=${itemToDelete.id}`, { method: 'DELETE' });
      setItemToDelete(null);
      fetchGastos();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredGastos = (gastos || []).filter(g => {
    // Si no hay unidad seleccionada, mostramos todo
    if (!unidadId) return true;

    // Buscamos coincidencia en unidad_id o vehiculo_id
    const gUnidadId = g.unidad_id || g.vehiculo_id;
    
    // Si el registro no tiene ID de unidad, decidimos si mostrarlo (unassigned)
    // Para cumplir con "y no el de los otros autos", solo mostramos si coincide 
    // O si está totalmente vacío (legacy)
    const matchUnidad = gUnidadId ? String(gUnidadId) === String(unidadId) : true;
    
    const matchSearch = (g.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.tipo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.proveedor || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchUnidad && matchSearch;
  });

  const totalGastos = filteredGastos.reduce((sum, g) => sum + parseFloat(g.costo_total || 0), 0);

  return (
    <div className="animate__animated animate__fadeIn">
      
      {/* Resumen Superior */}
      <div className="row mb-4">
        <div className="col-12">
           <div className="card border-0 shadow-sm bg-primary text-white rounded-4 overflow-hidden position-relative" style={{background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)'}}>
              <div className="card-body p-4 d-flex justify-content-between align-items-center">
                 <div>
                    <h6 className="text-white-50 text-uppercase fw-bold mb-1" style={{letterSpacing: '1px'}}>Total Invertido en Refacciones</h6>
                    <h2 className="fw-extrabold mb-0">${totalGastos.toLocaleString('en-US', {minimumFractionDigits: 2})}</h2>
                 </div>
                 <div className="bg-white bg-opacity-10 p-3 rounded-circle">
                    <ShoppingBag size={32} className="text-white opacity-75" />
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm bg-white rounded-4">
        <div className="card-header bg-white border-light pt-4 px-4 pb-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 rounded-3 bg-light"><ShoppingBag size={20} className="text-primary"/></div>
            <h5 className="fw-extrabold m-0 text-dark">Historial de Compras de Insumos</h5>
          </div>

          <div className="d-flex gap-2">
             <div className="position-relative">
                <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input 
                  type="text" 
                  className="form-control rounded-pill ps-5 bg-light border-0 py-2" 
                  placeholder="Buscar pieza..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{width: '250px'}}
                />
             </div>
             <button 
                onClick={() => setShowModalForm(true)}
                className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2 py-2 w-100 hover-scale"
             >
                <Plus size={16} /> <span className="d-none d-sm-inline">Registrar Gasto</span>
             </button>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="py-3 px-4 text-secondary font-weight-bold opacity-7 text-uppercase text-xs" style={{letterSpacing: '0.5px'}}>Fecha</th>
                  <th className="py-3 px-4 text-secondary font-weight-bold opacity-7 text-uppercase text-xs" style={{letterSpacing: '0.5px'}}>Artículos / Descripción</th>
                  <th className="py-3 px-4 text-secondary font-weight-bold opacity-7 text-uppercase text-xs" style={{letterSpacing: '0.5px'}}>Clasificación</th>
                  <th className="py-3 px-4 text-secondary font-weight-bold opacity-7 text-uppercase text-xs" style={{letterSpacing: '0.5px'}}>Unidad / Placas</th>
                  <th className="py-3 px-4 text-secondary font-weight-bold opacity-7 text-uppercase text-xs text-end" style={{letterSpacing: '0.5px'}}>Monto</th>
                  <th className="py-3 px-4 text-secondary font-weight-bold opacity-7 text-uppercase text-xs text-center" style={{letterSpacing: '0.5px'}}>Comprobante</th>
                  <th className="py-3 px-4 text-secondary font-weight-bold opacity-7 text-uppercase text-xs text-center" style={{letterSpacing: '0.5px'}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                    </td>
                  </tr>
                ) : filteredGastos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <ShoppingBag size={48} className="text-muted opacity-25 mb-3" />
                      <h6 className="text-muted fw-bold">No se encontraron gastos de piezas</h6>
                    </td>
                  </tr>
                ) : (
                  filteredGastos.map(g => (
                    <tr key={g.id}>
                      <td className="px-4">
                        <div className="d-flex align-items-center gap-2">
                           <Calendar size={14} className="text-muted"/>
                           <span className="fw-medium text-dark">
                             {(() => {
                               if (!g.fecha) return '';
                               const [year, month, day] = g.fecha.split('-').map(Number);
                               return new Date(year, month - 1, day).toLocaleDateString();
                             })()}
                           </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                         <div className="d-flex flex-column">
                            <span className="fw-bold text-dark">{g.descripcion}</span>
                            {g.proveedor && <small className="text-muted">Prov: {g.proveedor}</small>}
                         </div>
                      </td>
                      <td className="px-4">
                         <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill fw-medium">
                            {g.cantidad}x {g.tipo}
                         </span>
                      </td>
                      <td className="px-4">
                         {(() => {
                           const vId = g.unidad_id || g.vehiculo_id;
                           const vObj = (vehiculos || []).find(v => String(v.id) === String(vId));
                           return vObj ? (
                             <div className="d-flex flex-column">
                               <span className="fw-bold text-dark" style={{fontSize: '0.85rem'}}>{vObj.unidad_nombre}</span>
                               <small className="text-muted" style={{fontSize: '0.75rem'}}>{vObj.placas}</small>
                             </div>
                           ) : <span className="text-muted small">Sin asignar</span>;
                         })()}
                      </td>
                      <td className="px-4 text-end">
                         <span className="fw-extrabold text-danger">
                           ${parseFloat(g.costo_total).toLocaleString('en-US', {minimumFractionDigits: 2})}
                         </span>
                      </td>
                      <td className="px-4 text-center">
                         {g.evidencia_foto ? (
                           <a href={`${BASE_API}taller/uploads/${g.evidencia_foto}`} target="_blank" rel="noopener noreferrer" 
                              className="btn btn-sm btn-outline-primary rounded-pill d-inline-flex align-items-center gap-1">
                             <ImageIcon size={14}/> Ver
                           </a>
                         ) : (
                           <span className="text-muted small">-</span>
                         )}
                      </td>
                      <td className="px-4 text-center">
                         <button onClick={() => setItemToDelete(g)} className="btn btn-link text-danger p-0 hover-scale">
                           <Trash2 size={18} />
                         </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ModalGastoPieza 
         isOpen={showModalForm} 
         onClose={() => setShowModalForm(false)} 
         onSave={fetchGastos} 
         unidadId={unidadId}
      />

      {itemToDelete && (
        <ModalBorrar
          titulo="Eliminar Gasto Permanente"
          mensaje={`¿Eliminarás permanentemente este gasto de ${itemToDelete.descripcion}? Esta acción no se puede deshacer.`}
          onConfirmar={handleDelete}
          onCancelar={() => setItemToDelete(null)}
        />
      )}

    </div>
  );
}
