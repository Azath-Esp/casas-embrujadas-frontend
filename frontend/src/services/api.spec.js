import api, { EVENTO_ACCESO_DENEGADO, EVENTO_SESION_EXPIRADA, erroresPorCampo, mensajeDeError } from './api';
import { sesionDePrueba, simularAlmacenamiento } from '../test-utils/renderizar';

describe('Instancia de axios', () => {
  const antesDeEnviar = (config) => api.interceptors.request.handlers[0].fulfilled(config);
  const alFallar = (error) => api.interceptors.response.handlers[0].rejected(error);

  it('agrega el token de la sesión guardada a cada solicitud', () => {
    const sesion = sesionDePrueba('CLIENTE');
    simularAlmacenamiento({ sesion: JSON.stringify(sesion) });
    expect(antesDeEnviar({ headers: {} }).headers.Authorization).toBe(`Bearer ${sesion.token}`);
  });

  it('sin sesión no agrega el encabezado', () => {
    simularAlmacenamiento();
    expect(antesDeEnviar({ headers: {} }).headers.Authorization).toBeUndefined();
  });

  it('un 401 avisa que la sesión expiró, con el mensaje del backend', async () => {
    const oyente = jasmine.createSpy('oyente');
    window.addEventListener(EVENTO_SESION_EXPIRADA, oyente);
    await expectAsync(alFallar({ config: { url: '/api/v1/favoritos' }, response: { status: 401, data: { mensaje: 'El token expiró' } } }))
      .toBeRejected();
    window.removeEventListener(EVENTO_SESION_EXPIRADA, oyente);
    expect(oyente).toHaveBeenCalledTimes(1);
    expect(oyente.calls.mostRecent().args[0].detail).toBe('El token expiró');
  });

  it('un 401 del propio login no cierra la sesión: es una contraseña incorrecta', async () => {
    const oyente = jasmine.createSpy('oyente');
    window.addEventListener(EVENTO_SESION_EXPIRADA, oyente);
    await expectAsync(alFallar({ config: { url: '/api/v1/auth/login' }, response: { status: 401, data: {} } })).toBeRejected();
    window.removeEventListener(EVENTO_SESION_EXPIRADA, oyente);
    expect(oyente).not.toHaveBeenCalled();
  });

  it('un 403 avisa acceso denegado', async () => {
    const oyente = jasmine.createSpy('oyente');
    window.addEventListener(EVENTO_ACCESO_DENEGADO, oyente);
    await expectAsync(alFallar({ config: { url: '/api/v1/usuarios' }, response: { status: 403, data: {} } })).toBeRejected();
    window.removeEventListener(EVENTO_ACCESO_DENEGADO, oyente);
    expect(oyente).toHaveBeenCalledTimes(1);
  });

  it('traduce los errores del backend a mensajes y a errores por campo', () => {
    expect(mensajeDeError({ response: { data: { mensaje: 'Ya existe una cuenta' } } })).toBe('Ya existe una cuenta');
    expect(mensajeDeError({ request: {} })).toContain('No se pudo conectar');
    expect(mensajeDeError({})).toBe('Ocurrió un error inesperado.');
    expect(erroresPorCampo({ response: { data: { errores: ['correo: El correo no tiene un formato válido', 'sin separador'] } } }))
      .toEqual({ correo: 'El correo no tiene un formato válido' });
    expect(erroresPorCampo(undefined)).toEqual({});
  });
});
