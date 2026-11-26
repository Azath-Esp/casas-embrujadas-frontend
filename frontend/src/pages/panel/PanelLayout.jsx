import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { opcionesMenu } from '../../utils/panel';

export default function PanelLayout() {
  const { usuario, rol } = useAuth();

  return (
    <div className="container-fluid px-3 px-lg-5 py-4">
      <div className="row g-4">
        <aside className="col-12 col-lg-2">
          <div className="panel-menu">
            <p className="panel-menu__rol">{rol === 'ADMIN' ? 'Administración' : 'Ventas'}</p>
            <p className="small text-secondary mb-3">{usuario.nombre}</p>
            <nav aria-label="Secciones del panel">
              {opcionesMenu(rol).map((opcion) => (
                <NavLink key={opcion.ruta} to={opcion.ruta} end={opcion.exacta} className="panel-menu__enlace">{opcion.texto}</NavLink>
              ))}
            </nav>
          </div>
        </aside>
        <section className="col-12 col-lg-10">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
