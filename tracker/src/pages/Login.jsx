import React, { useState } from 'react';
import logo from "../assets/img/Uber_logo_initeck.png";
import bgImage from "../assets/img/fondo_uber_initeck.png";
import { authFetch } from '../utils/api.js';

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState(''); // Cambiado de email a usuario
  const [pass, setPass] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpieza preventiva: eliminamos cualquier rastro de sesión previa antes de intentar una nueva
    localStorage.removeItem('user');
    localStorage.removeItem('user_session'); // O cualquier otra clave que estés usando

    try {
      const response = await authFetch('login', {
        method: "POST",
        body: JSON.stringify({
          usuario: usuario,
          pass: pass
        })
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        // LOG DE CONTROL: Abre la consola (F12) y verifica que el ID cambie al loguear con otro usuario
        console.log("Sesión iniciada con éxito:", data.user);

        // Sincronizamos con el objeto que espera tu App.js y los componentes operativos
        onLogin({
          id: data.user.id,               // Este es el empleado_id (ID operativo)
          nombre: data.user.nombre,
          rol: data.user.rol,             // admin, operator, empleado, cleaning, development
          usuario_id: data.user.usuario_id, // ID de la tabla usuarios (cuenta)
          requiere_cambio: data.requiere_cambio
        });
      } else {
        alert(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error crítico en login:", error);
      alert("Error de conexión con el servidor. Verifique que el API esté activa.");
    }
  };

  return (
    <div className="login-wrapper position-relative d-flex align-items-center justify-content-center min-vh-100 py-5" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
      {/* Background Layer with Blur */}
      <div
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(8px)',
          position: 'fixed',
          top: -20, // Negative margins to prevents white edges from blur
          left: -20,
          right: -20,
          bottom: -20,
          zIndex: -1
        }}
      />

      <div className="card p-4 shadow-lg border-0" style={{ width: "100%", maxWidth: "400px", borderRadius: "15px", backgroundColor: "rgba(0, 0, 0, 0.85)" }}>
        <div className="text-center mb-4">
          <img src={logo} alt="Initeck" style={{ width: "180px", marginBottom: "1rem" }} />
          <h4 className="fw-bold text-white">Control Logístico</h4>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-white">Usuario o Correo</label>
            <input
              type="text" // Cambiado a text para ser flexible
              className="form-control"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-bold text-white">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-dark w-100 fw-bold py-2 shadow" style={{ backgroundColor: "#800020", border: "none" }}>
            INGRESAR
          </button>
        </form>
        <div className="mt-3">
          <a 
            href="https://admin.initeck.com.mx" 
            className="btn btn-outline-light w-100 fw-bold py-2" 
            style={{ textDecoration: 'none' }}
          >
            VOLVER A INICIO
          </a>
        </div>
      </div>
    </div>
  );
}