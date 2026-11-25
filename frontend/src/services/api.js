import axios from 'axios';
import { leerSesion } from '../utils/sesion';

export const EVENTO_SESION_EXPIRADA = 'casas:sesion-expirada';
export const EVENTO_ACCESO_DENEGADO = 'casas:acceso-denegado';

const api = axios.create({
  baseURL: import.meta.env?.VITE_API_URL ?? 'http://localhost:8080',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const sesion = leerSesion();
  if (sesion) {
    config.headers.Authorization = `Bearer ${sesion.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const estado = error.response?.status;
    const esLogin = String(error.config?.url ?? '').includes('/auth/login');
    if (estado === 401 && !esLogin) {
      window.dispatchEvent(new CustomEvent(EVENTO_SESION_EXPIRADA, { detail: error.response.data?.mensaje }));
    }
    if (estado === 403) {
      window.dispatchEvent(new CustomEvent(EVENTO_ACCESO_DENEGADO));
    }
    return Promise.reject(error);
  },
);

export function mensajeDeError(error) {
  if (error?.response?.data?.mensaje) return error.response.data.mensaje;
  if (error?.request && !error.response) return 'No se pudo conectar con el servidor. Revisa que el backend esté encendido.';
  return 'Ocurrió un error inesperado.';
}

export function erroresPorCampo(error) {
  const errores = {};
  (error?.response?.data?.errores ?? []).forEach((texto) => {
    const separador = texto.indexOf(': ');
    if (separador > 0) errores[texto.slice(0, separador)] = texto.slice(separador + 2);
  });
  return errores;
}

export default api;
