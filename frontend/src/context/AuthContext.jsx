import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { EVENTO_ACCESO_DENEGADO, EVENTO_SESION_EXPIRADA } from '../services/api';
import { borrarSesion, crearSesion, guardarSesion, leerSesion } from '../utils/sesion';

const AuthContext = createContext(null);
const MENSAJE_EXPIRADA = 'Tu sesión expiró. Inicia sesión nuevamente.';

function sesionInicial() {
  const sesion = leerSesion();
  if (!sesion) borrarSesion();
  return sesion;
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [sesion, setSesion] = useState(sesionInicial);

  const cerrarSesion = useCallback((motivo) => {
    borrarSesion();
    setSesion(null);
    if (motivo) navigate('/login', { state: { mensaje: motivo } });
  }, [navigate]);

  useEffect(() => {
    const alExpirar = (evento) => cerrarSesion(evento.detail || MENSAJE_EXPIRADA);
    const alDenegar = () => navigate('/403');
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
    window.addEventListener(EVENTO_ACCESO_DENEGADO, alDenegar);
    return () => {
      window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
      window.removeEventListener(EVENTO_ACCESO_DENEGADO, alDenegar);
    };
  }, [cerrarSesion, navigate]);

  useEffect(() => {
    if (!sesion) return undefined;
    const temporizador = setTimeout(() => cerrarSesion(MENSAJE_EXPIRADA), sesion.exp * 1000 - Date.now());
    return () => clearTimeout(temporizador);
  }, [sesion, cerrarSesion]);

  async function login(correo, contrasena) {
    const respuesta = await authService.login(correo.trim().toLowerCase(), contrasena);
    const nueva = crearSesion(respuesta);
    guardarSesion(nueva);
    setSesion(nueva);
    return nueva;
  }

  async function registro(datos) {
    await authService.registro(datos);
    return login(datos.correo, datos.contrasena);
  }

  const valor = {
    usuario: sesion,
    rol: sesion?.rol ?? null,
    token: sesion?.token ?? null,
    estaAutenticado: Boolean(sesion),
    login,
    registro,
    logout: () => cerrarSesion(),
    tieneRol: (...roles) => Boolean(sesion) && roles.includes(sesion.rol),
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
