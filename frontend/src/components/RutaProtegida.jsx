import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccesoDenegado from '../pages/AccesoDenegado';

export default function RutaProtegida({ roles, children }) {
  const { estaAutenticado, rol } = useAuth();
  const ubicacion = useLocation();

  if (!estaAutenticado) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname, mensaje: 'Inicia sesión para continuar.' }} />;
  }
  if (roles && !roles.includes(rol)) {
    return <AccesoDenegado />;
  }
  return children;
}
