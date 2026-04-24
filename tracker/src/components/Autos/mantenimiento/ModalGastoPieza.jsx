import React, { useState, useEffect } from 'react';
import { X, Camera, Save, ShoppingBag, ShoppingCart, Info, User, DollarSign } from 'lucide-react';
import { TALLER_GASTOS_PIEZAS_URL, API_URL } from '../../../config';
import Swal from 'sweetalert2';

export default function ModalGastoPieza({ isOpen, onClose, onSave, unidadId }) {
  const [loading, setLoading] = useState(false);
  const [fotoEvidencia, setFotoEvidencia] = useState(null);

  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'Pieza Mecánica',
    descripcion: '',
    costo_total: '',
    cantidad: 1,
    proveedor: '',
    vehiculo_id: unidadId || '',
  });

  const [vehiculos, setVehiculos] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetch(API_URL)
        .then(res => res.ok ? res.json() : [])
        .then(setVehiculos)
        .catch(err => console.error("Error fetching vehicles:", err));
    }
  }, [isOpen]);

  const tipos = [
    'Pieza Mecánica', 
    'Parte Visual exterior', 
    'Parte Visual interior', 
    'Molduras / Embellecedores', 
    'Herramienta Insumo', 
    'Accesorios', 
    'Otro'
  ];

  useEffect(() => {
    if (isOpen) {
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        tipo: 'Pieza Mecánica',
        descripcion: '',
        costo_total: '',
        cantidad: 1,
        proveedor: '',
        vehiculo_id: unidadId || '',
      });
      setFotoEvidencia(null);
    }
  }, [isOpen, unidadId]);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoEvidencia({
        file,
        preview: URL.createObjectURL(file)
      });
    }
  };

  const removeFoto = () => {
    if (fotoEvidencia?.preview) {
      URL.revokeObjectURL(fotoEvidencia.preview);
    }
    setFotoEvidencia(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('fecha', formData.fecha);
    data.append('tipo', formData.tipo);
    data.append('descripcion', formData.descripcion);
    data.append('costo_total', formData.costo_total);
    data.append('cantidad', formData.cantidad);
    data.append('proveedor', formData.proveedor);
    data.append('vehiculo_id', formData.vehiculo_id);
    data.append('unidad_id', formData.vehiculo_id);

    if (fotoEvidencia?.file) {
      data.append('foto', fotoEvidencia.file);
    }

    try {
      const resp = await fetch(TALLER_GASTOS_PIEZAS_URL, {
        method: 'POST',
        body: data
      });
      
      const resData = await resp.json();
      if (resData.status === 'success') {
        Swal.fire({
            title: '¡Guardado!',
            text: 'Gasto registrado correctamente.',
            icon: 'success',
            confirmButtonColor: '#0f172a'
        });
        onSave();
        onClose();
      } else {
        Swal.fire('Error', resData.message || 'No se pudo guardar', 'error');
      }
    } catch (error) {
       console.error("Error guardando gasto de pieza:", error);
       Swal.fire('Error', 'Problema de conexión al servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-white">
          
          <div className="modal-header text-white border-0 py-3" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
            <h5 className="modal-title fw-bold m-0 d-flex align-items-center gap-2">
              <ShoppingBag size={20} />
              Registrar Compra de Pieza / Insumo
            </h5>
            <button onClick={onClose} className="btn-close btn-close-white" disabled={loading}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 bg-light">
              <div className="row g-4">
                
                {/* Columna Izquierda: Datos */}
                <div className="col-lg-7">
                  <div className="bg-white p-3 rounded-4 shadow-sm border border-light">
                    
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">Fecha de Compra</label>
                      <input 
                        type="date" 
                        className="form-control rounded-3" 
                        value={formData.fecha}
                        onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                        required 
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">Vehículo <span className="text-danger">*</span></label>
                      <select 
                        className="form-select rounded-3 shadow-sm border-0 bg-light" 
                        value={formData.vehiculo_id}
                        onChange={e => setFormData({ ...formData, vehiculo_id: e.target.value })}
                        required
                      >
                        <option value="">Seleccionar Unidad...</option>
                        {vehiculos.map(v => (
                          <option key={v.id} value={v.id}>{v.unidad_nombre} • {v.placas}</option>
                        ))}
                      </select>
                    </div>

                    <div className="row g-3 mb-3">
                        <div className="col-md-8">
                            <label className="form-label small fw-bold text-muted">Tipo de Gasto</label>
                            <select 
                                className="form-select rounded-3" 
                                value={formData.tipo}
                                onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                                required
                            >
                                {tipos.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small fw-bold text-muted">Cantidad</label>
                            <input 
                                type="number" 
                                min="1"
                                className="form-control rounded-3" 
                                value={formData.cantidad}
                                onChange={e => setFormData({ ...formData, cantidad: e.target.value })}
                                required 
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted">Descripción detallada</label>
                      <textarea 
                        className="form-control rounded-3" 
                        rows="3" 
                        placeholder="Ej. Fascia delantera modelo 2021"
                        value={formData.descripcion}
                        onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                        required
                      />
                    </div>

                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Proveedor (Opcional)</label>
                            <input 
                                type="text" 
                                className="form-control rounded-3" 
                                placeholder="AutoZone, MercadoLibre..."
                                value={formData.proveedor}
                                onChange={e => setFormData({ ...formData, proveedor: e.target.value })}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label small fw-bold text-muted">Costo Total</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light"><DollarSign size={16}/></span>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    className="form-control rounded-end-3" 
                                    placeholder="0.00"
                                    value={formData.costo_total}
                                    onChange={e => setFormData({ ...formData, costo_total: e.target.value })}
                                    required 
                                />
                            </div>
                        </div>
                    </div>

                  </div>
                </div>

                {/* Columna Derecha: Foto */}
                <div className="col-lg-5">
                   <div className="bg-white p-3 rounded-4 shadow-sm border border-light h-100 d-flex flex-column">
                      <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                         <Camera size={16} /> Comprobante o Pieza
                      </h6>
                      
                      <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                         {fotoEvidencia ? (
                           <div className="position-relative w-100 h-100 min-h-200">
                             <img src={fotoEvidencia.preview} className="w-100 h-100 object-fit-cover rounded-3 shadow-sm border" style={{minHeight: '200px', maxHeight: '250px'}} alt="Comprobante" />
                             <button
                               type="button"
                               onClick={removeFoto}
                               className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle shadow"
                             >
                               <X size={14} />
                             </button>
                           </div>
                         ) : (
                           <label className="d-flex flex-column align-items-center justify-content-center w-100 rounded-3 border-2 border-dashed bg-light cursor-pointer hover-bg-white transition-all py-5">
                             <div className="bg-primary bg-opacity-10 p-3 rounded-circle mb-3">
                                <Camera size={32} className="text-primary" />
                             </div>
                             <span className="fw-bold text-secondary">Subir Foto</span>
                             <small className="text-muted mt-1">Ticket o pieza física</small>
                             <input 
                               type="file" 
                               accept="image/*" 
                               capture="environment"
                               className="d-none"
                               onChange={handleFotoChange}
                             />
                           </label>
                         )}
                      </div>
                   </div>
                </div>

              </div>
            </div>

            <div className="modal-footer bg-white border-top-light py-3">
              <button type="button" className="btn btn-light rounded-pill px-4 fw-bold" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold d-flex align-items-center gap-2" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <Save size={18} />}
                {loading ? 'Guardando...' : 'Guardar Gasto'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
