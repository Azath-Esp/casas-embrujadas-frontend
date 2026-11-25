import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';

const enlaces = [
  { ruta: '/', texto: 'Home' },
  { ruta: '/productos', texto: 'Propiedades' },
  { ruta: '/mapa', texto: 'Mapa' },
  { ruta: '/nosotros', texto: 'Nosotros' },
  { ruta: '/blogs', texto: 'Blogs' },
  { ruta: '/contacto', texto: 'Contacto' },
];

export default function Navbar() {
  const { cantidad, vaciar } = useCarrito();
  const { usuario, estaAutenticado, tieneRol, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cerrarMenu = () => setMenuAbierto(false);
  const navRef = useRef(null);

  const puedeComprar = !estaAutenticado || tieneRol('CLIENTE');
  const tieneCuenta = tieneRol('CLIENTE', 'ADMIN');
  const tienePanel = tieneRol('ADMIN', 'VENDEDOR');

  useEffect(() => {
    if (!menuAbierto) return undefined;

    function alClicFuera(e) {
      if (!navRef.current.contains(e.target)) setMenuAbierto(false);
    }
    function alPresionarTecla(e) {
      if (e.key === 'Escape') setMenuAbierto(false);
    }

    document.addEventListener('mousedown', alClicFuera);
    document.addEventListener('keydown', alPresionarTecla);
    return () => {
      document.removeEventListener('mousedown', alClicFuera);
      document.removeEventListener('keydown', alPresionarTecla);
    };
  }, [menuAbierto]);

  function cerrarSesion() {
    cerrarMenu();
    vaciar();
    logout();
    navigate('/');
  }

  return (
    <nav ref={navRef} className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid px-3 px-lg-5">
        <Link className="navbar-brand" to="/" onClick={cerrarMenu}>👻 Casas Embrujadas</Link>

        <button
          className="navbar-toggler" type="button"
          aria-controls="menu" aria-expanded={menuAbierto} aria-label="Abrir menú"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${menuAbierto ? 'show' : ''}`} id="menu">
          <ul className="navbar-nav me-auto">
            {enlaces.map((e) => (
              <li className="nav-item" key={e.ruta}>
                <NavLink className="nav-link" to={e.ruta} end onClick={cerrarMenu}>{e.texto}</NavLink>
              </li>
            ))}
          </ul>

          <div className="d-flex flex-wrap align-items-center gap-2 pb-2 pb-lg-0">
            {estaAutenticado ? (
              <>
                <span className="navbar-text small me-1">Hola, {usuario.nombre}</span>
                {tienePanel && (
                  <Link className="btn btn-outline-warning btn-sm" to="/panel" onClick={cerrarMenu}>Panel</Link>
                )}
                {tieneCuenta && (
                  <Link className="btn btn-outline-light btn-sm" to="/mi-cuenta" onClick={cerrarMenu}>Mi cuenta</Link>
                )}
                <button type="button" className="btn btn-outline-light btn-sm" onClick={cerrarSesion}>Cerrar sesión</button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline-light btn-sm" to="/login" onClick={cerrarMenu}>Iniciar sesión</Link>
                <Link className="btn btn-outline-light btn-sm" to="/registro" onClick={cerrarMenu}>Registrarse</Link>
              </>
            )}
            {puedeComprar && (
              <Link className="btn btn-warning btn-sm" to="/carrito" onClick={cerrarMenu}>🛒 Carrito ({cantidad})</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
