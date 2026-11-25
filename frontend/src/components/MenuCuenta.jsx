import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const secciones = [
  { ruta: '/mi-cuenta', texto: 'Mi perfil' },
  { ruta: '/mis-compras', texto: 'Mis compras' },
  { ruta: '/mis-reservas', texto: 'Mis reservas' },
  { ruta: '/favoritos', texto: 'Favoritos' },
];

export default function MenuCuenta() {
  const { tieneRol } = useAuth();
  if (!tieneRol('CLIENTE')) return null;

  return (
    <nav className="menu-cuenta mb-4" aria-label="Secciones de mi cuenta">
      {secciones.map((seccion) => (
        <NavLink key={seccion.ruta} to={seccion.ruta} end className="menu-cuenta__enlace">{seccion.texto}</NavLink>
      ))}
    </nav>
  );
}
