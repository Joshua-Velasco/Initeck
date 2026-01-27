import React, { useState } from 'react';
import { AUTH_PERFIL_URL } from '../config.js';

export default function Perfil({ user }) {
  const [formData, setFormData] = useState({
    telefono: '',
    correo: '',
    password: '',
    confirmPassword: ''
  });
  const [archivos, setArchivos] = useState({ ine: null, licencia: null });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFile = (e) => setArchivos({ ...archivos, [e.target.name]: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      return alert("Las contraseñas no coinciden");
    }

    const data = new FormData();
    data.append('empleado_id', user.id);
    data.append('telefono', formData.telefono);
    data.append('correo', formData.correo);
    data.append('password', formData.password);
    if (archivos.ine) data.append('foto_ine', archivos.ine);
    if (archivos.licencia) data.append('foto_licencia', archivos.licencia);

    try {
      const resp = await fetch(AUTH_PERFIL_URL, {
        method: 'POST',
        body: data // FormData se envía sin headers de Content-Type manual
      });
      const res = await resp.json();
      if (res.status === "success") alert("Datos actualizados correctamente");
    } catch (err) { alert("Error al conectar"); }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="card shadow-sm border-0 p-4">
        <h3 className="fw-bold mb-4" style={{ color: "#800020" }}>Mi Perfil</h3>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold">Teléfono de Contacto</label>
              <input type="tel" name="telefono" className="form-control" onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold">Correo Personal</label>
              <input type="email" name="correo" className="form-control" onChange={handleChange} />
            </div>
          </div>

          <hr />
          <h5 className="mb-3">Seguridad</h5>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold">Nueva Contraseña</label>
              <input type="password" name="password" className="form-control" onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold">Confirmar Contraseña</label>
              <input type="password" name="confirmPassword" className="form-control" onChange={handleChange} />
            </div>
          </div>

          <hr />
          <h5 className="mb-3">Documentación (Imágenes)</h5>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold">Foto INE / Identificación</label>
              <input type="file" name="ine" className="form-control" onChange={handleFile} accept="image/*" />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold">Foto Licencia de Conducir</label>
              <input type="file" name="licencia" className="form-control" onChange={handleFile} accept="image/*" />
            </div>
          </div>

          <button type="submit" className="btn btn-dark w-100 mt-4" style={{ backgroundColor: "#800020" }}>
            GUARDAR CAMBIOS
          </button>
        </form>
      </div>
    </div>
  );
}