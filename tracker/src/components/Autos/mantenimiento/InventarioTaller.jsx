import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { TALLER_INVENTARIO_URL, BASE_API } from '../../../config';
import ModalBorrar from '../estatus/ModalBorrar';

export default function InventarioTaller() {
  const [herramientas, setHerramientas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [item, setItem] = useState({});
  const [herramientaParaBorrar, setHerramientaParaBorrar] = useState(null);

  const fetchInventario = async () => {
    setLoading(true);
    try {
      const res = await fetch(TALLER_INVENTARIO_URL);
      if (res.ok) setHerramientas(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventario(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('accion', item.id ? 'editar' : 'crear');
    if (item.id) formData.append('id', item.id);
    formData.append('nombre', item.nombre);
    formData.append('descripcion', item.descripcion);
    formData.append('cantidad', item.cantidad);
    formData.append('estado', item.estado);
    if (item.fotoFile) formData.append('foto', item.fotoFile);

    try {
      const res = await fetch(TALLER_INVENTARIO_URL, { method: 'POST', body: formData });
      if (res.ok) {
        setShowForm(false);
        setItem({});
        fetchInventario();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const confirmarBorrado = async () => {
    if (!herramientaParaBorrar) return;
    await fetch(`${TALLER_INVENTARIO_URL}?id=${herramientaParaBorrar}`, { method: 'DELETE' });
    setHerramientaParaBorrar(null);
    fetchInventario();
  };

  const handleEdit = (h) => {
    setItem(h);
    setShowForm(true);
  };

  return (
    <div className="card border-0 shadow-sm bg-white w-100 animate__animated animate__fadeIn" style={{ borderRadius: '24px' }}>
      <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="fw-extrabold m-0 d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
            <div className="p-2 rounded-3 bg-light"><Wrench size={20} className="text-primary" /></div>
            Inventario de Taller
          </h5>
          <p className="text-muted small mb-0 mt-1" style={{ fontSize: '11px' }}>Gestión de herramientas y equipos</p>
        </div>
        
        <button className="btn btn-primary rounded-pill btn-sm d-flex align-items-center gap-2 px-3 py-2 fw-bold shadow-sm hover-scale"
          onClick={() => { setItem({ nombre: '', descripcion: '', cantidad: 1, estado: 'Bueno' }); setShowForm(true); }}>
          <Plus size={16} /> Agregar Herramienta
        </button>
      </div>

      <div className="card-body p-4">
        {showForm && (
          <div className="mb-4 bg-light p-4 rounded-4 border animate__animated animate__fadeInDown">
            <h6 className="fw-bold mb-3 text-dark">{item.id ? 'Editar' : 'Nueva'} Herramienta</h6>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <input type="text" className="form-control rounded-3 border-0 shadow-sm py-2" placeholder="Nombre" required
                    value={item.nombre} onChange={e => setItem({ ...item, nombre: e.target.value })} />
                </div>
                <div className="col-md-4">
                  <input type="text" className="form-control rounded-3 border-0 shadow-sm py-2" placeholder="Descripción"
                    value={item.descripcion} onChange={e => setItem({ ...item, descripcion: e.target.value })} />
                </div>
                <div className="col-md-2">
                  <input type="number" className="form-control rounded-3 border-0 shadow-sm py-2" placeholder="Cant." required
                    value={item.cantidad} onChange={e => setItem({ ...item, cantidad: e.target.value })} />
                </div>
                <div className="col-md-2">
                  <select className="form-select rounded-3 border-0 shadow-sm py-2" value={item.estado} onChange={e => setItem({ ...item, estado: e.target.value })}>
                    <option value="Bueno">Bueno</option>
                    <option value="Regular">Regular</option>
                    <option value="Malo">Malo</option>
                    <option value="Reparación">Reparación</option>
                  </select>
                </div>
                <div className="col-md-12">
                  <input type="file" className="form-control rounded-3 border-0 shadow-sm" accept="image/*"
                    onChange={e => setItem({ ...item, fotoFile: e.target.files[0] })} />
                </div>
                <div className="col-12 d-flex gap-2 justify-content-end">
                  <button type="button" className="btn btn-light text-muted fw-bold rounded-pill px-4" onClick={() => setShowForm(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary fw-bold rounded-pill px-4 shadow-sm">Guardar</button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="row g-4">
          {herramientas.map(h => (
            <div key={h.id} className="col-md-6 col-xl-4">
              <div className="card h-100 border-0 shadow-sm overflow-hidden hover-lift transition-all" style={{ borderRadius: '24px' }}>
                <div className="bg-light d-flex align-items-center justify-content-center p-4 position-relative" style={{ height: '220px' }}>
                  {h.foto_url ?
                    <img src={`${BASE_API}taller/uploads/${h.foto_url}`} alt={h.nombre} className="img-fluid rounded-3 h-100 object-fit-contain shadow-sm" /> :
                    <Wrench size={64} className="text-secondary opacity-10" />
                  }
                  <div className="position-absolute top-0 end-0 p-3">
                     <span className={`badge rounded-pill ${h.estado === 'Bueno' ? 'bg-success' : h.estado === 'Malo' ? 'bg-danger' : 'bg-warning'} text-white shadow-sm px-3 py-2 fw-bold`}>
                      {h.estado}
                    </span>
                  </div>
                </div>
                <div className="card-body p-4">
                  <div className="mb-3">
                    <h5 className="fw-bold mb-1 text-dark" style={{ lineHeight: '1.4' }}>{h.nombre}</h5>
                    <p className="text-muted small mb-0" style={{ minHeight: '2.5em', lineHeight: '1.5' }}>{h.descripcion || "Sin descripción disponible."}</p>
                  </div>
                  
                  <div className="d-flex align-items-center justify-content-between mb-4 bg-light p-3 rounded-4">
                     <span className="text-muted small fw-bold text-uppercase">Existencia</span>
                     <span className="fs-5 fw-extrabold text-primary">
                       {h.cantidad} <span className="fs-6 text-muted fw-normal">pzas</span>
                     </span>
                  </div>

                  <div className="d-grid gap-2 d-md-flex">
                    <button onClick={() => handleEdit(h)} className="btn btn-outline-primary fw-bold py-2 rounded-3 flex-grow-1 d-flex align-items-center justify-content-center gap-2" style={{ fontSize: '0.9rem' }}>
                      <Edit size={16} /> Editar
                    </button>
                    <button onClick={() => setHerramientaParaBorrar(h.id)} className="btn btn-outline-danger fw-bold py-2 rounded-3 flex-grow-1 d-flex align-items-center justify-content-center gap-2" style={{ fontSize: '0.9rem' }}>
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {herramientas.length === 0 && !loading && (
            <div className="col-12 text-center py-5">
               <div className="bg-light rounded-circle p-4 d-inline-block mb-3">
                  <Wrench size={48} className="text-muted opacity-50"/>
               </div>
               <h4 className="text-dark fw-bold">Inventario Vacío</h4>
               <p className="text-muted">No hay herramientas registradas en el sistema.</p>
               <button className="btn btn-primary rounded-pill fw-bold shadow-sm px-4 mt-2"
                onClick={() => { setItem({ nombre: '', descripcion: '', cantidad: 1, estado: 'Bueno' }); setShowForm(true); }}>
                Comenzar Registro
               </button>
            </div>
          )}
        </div>
      </div>
      
      {herramientaParaBorrar && (
        <ModalBorrar
          titulo="¿Eliminar herramienta?"
          mensaje="Esta acción eliminará el ítem del inventario permanentemente."
          onConfirmar={confirmarBorrado}
          onCancelar={() => setHerramientaParaBorrar(null)}
        />
      )}
    </div>
  );
}
