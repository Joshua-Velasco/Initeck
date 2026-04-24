import React, { useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { UserCircle, LogOut, Menu } from "lucide-react";
import logo from "../../../assets/img/Uber_logo_initeck.png";
import { useAuth } from "../../auth/AuthProvider.jsx";

const Navbar = ({ onLogout }) => {
  const { user } = useAuth();
  const navbarCollapseRef = useRef(null);

  const getRolLabel = (rol) => {
    const roles = {
      admin: "🛡️ Administrador",
      operator: "⚙️ Operador",
      employee: "🚚 Empleado",
      cleaning: "🧼 Limpieza",
      development: "💻 Desarrollo",
      monitorista: "📡 Monitorista",
      taller: "🔧 Taller",
    };
    return roles[rol] || rol;
  };

  const closeMenu = () => {
    if (navbarCollapseRef.current) {
      if (window.bootstrap) {
        const bsCollapse = window.bootstrap.Collapse.getInstance(
          navbarCollapseRef.current,
        );
        if (bsCollapse) {
          bsCollapse.hide();
          return;
        }
      }
      if (navbarCollapseRef.current.classList.contains("show")) {
        navbarCollapseRef.current.classList.remove("show");
      }
    }
  };

  if (!user) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom fixed-top shadow">
      <div className="container">
        <Link
          className="navbar-brand d-flex align-items-center"
          to={
            user.rol === "operator"
              ? "/historial"
              : ["employee", "cleaning"].includes(user.rol)
                ? "/viajes-empleado"
                : user.rol === "monitorista"
                  ? "/viajes"
                  : user.rol === "taller"
                    ? "/mantenimiento"
                    : "/"
          }
          onClick={closeMenu}
        >
          <img src={logo} alt="Initeck" className="navbar-logo me-2" />
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <Menu size={28} color="white" />
        </button>

        <div
          className="collapse navbar-collapse"
          id="navbarNav"
          ref={navbarCollapseRef}
        >
          <ul className="navbar-nav mx-auto text-center">
            {["admin", "development"].includes(user.rol) && (
              <>
                <li className="nav-item">
                  <NavLink
                    className="nav-link px-3"
                    to="/"
                    end
                    onClick={closeMenu}
                  >
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link px-3"
                    to="/autos"
                    onClick={closeMenu}
                  >
                    Unidades
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link px-3"
                    to="/mantenimiento"
                    onClick={closeMenu}
                  >
                    Taller
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link px-3"
                    to="/empleados"
                    onClick={closeMenu}
                  >
                    Personal
                  </NavLink>
                </li>
              </>
            )}

            {user.rol === "taller" && (
              <li className="nav-item">
                <NavLink
                  className="nav-link px-3"
                  to="/mantenimiento"
                  onClick={closeMenu}
                >
                  Taller
                </NavLink>
              </li>
            )}

            {["admin", "development", "monitorista"].includes(user.rol) && (
              <li className="nav-item">
                <NavLink
                  className="nav-link px-3"
                  to="/viajes"
                  onClick={closeMenu}
                >
                  Monitor de Flota
                </NavLink>
              </li>
            )}
            {["employee", "cleaning"].includes(user.rol) && (
              <li className="nav-item">
                <NavLink
                  className="nav-link px-3"
                  to="/viajes-empleado"
                  onClick={closeMenu}
                >
                  Mi Unidad
                </NavLink>
              </li>
            )}
            {[
              "admin",
              "development",
              "employee",
              "operator",
              "cleaning",
            ].includes(user.rol) && (
              <li className="nav-item">
                <NavLink
                  className="nav-link px-3"
                  to="/historial"
                  onClick={closeMenu}
                >
                  Registros
                </NavLink>
              </li>
            )}
            {user.rol === "admin" && (
              <li className="nav-item">
                <NavLink
                  className="nav-link px-3"
                  to="/balance"
                  onClick={closeMenu}
                >
                  Finanzas
                </NavLink>
              </li>
            )}
            {["admin", "development", "employee", "cleaning"].includes(user.rol) && (
              <li className="nav-item">
                <NavLink
                  className="nav-link px-3"
                  to="/entradas"
                  onClick={closeMenu}
                >
                  Entradas
                </NavLink>
              </li>
            )}
            {["admin", "development"].includes(user.rol) && (
              <li className="nav-item">
                <NavLink
                  className="nav-link px-3"
                  to="/insumos"
                  onClick={closeMenu}
                >
                  Gasolina
                </NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center justify-content-center gap-3">
            {["employee", "operator", "cleaning"].includes(user.rol) && (
              <div
                className="badge bg-success rounded-pill px-3 py-2"
                style={{ fontSize: "10px" }}
              >
                GPS ACTIVO
              </div>
            )}
            <div className="dropdown">
              <button
                className="btn btn-link text-white dropdown-toggle p-0"
                type="button"
                data-bs-toggle="dropdown"
              >
                <UserCircle size={32} />
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                <li className="px-4 py-2">
                  <div className="fw-bold">{user.nombre}</div>
                  <div className="small text-muted">
                    {getRolLabel(user.rol)}
                  </div>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={() => {
                       closeMenu(); 
                       onLogout();
                    }}
                  >
                    <LogOut size={16} className="me-2" />
                    Salir
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
