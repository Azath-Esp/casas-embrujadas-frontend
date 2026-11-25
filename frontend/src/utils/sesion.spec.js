import { crearSesion, leerPayload, leerSesion, sesionVigente } from './sesion';
import { crearToken, sesionDePrueba, simularAlmacenamiento } from '../test-utils/renderizar';

describe('Sesión y token', () => {
  it('lee el contenido del token, incluidas las tildes', () => {
    const token = crearToken({ sub: 'tomas@casasembrujadas.cl', nombre: 'Tomás', rol: 'CLIENTE' });
    expect(leerPayload(token).nombre).toBe('Tomás');
  });

  it('devuelve null si el token no tiene el formato esperado', () => {
    expect(leerPayload('esto-no-es-un-token')).toBeNull();
  });

  it('una sesión es vigente solo antes de su vencimiento', () => {
    const ahora = Date.now();
    expect(sesionVigente({ token: 't', exp: ahora / 1000 + 60 }, ahora)).toBeTrue();
    expect(sesionVigente({ token: 't', exp: ahora / 1000 - 1 }, ahora)).toBeFalse();
    expect(sesionVigente(null, ahora)).toBeFalse();
  });

  it('arma la sesión con la respuesta del login y el contenido del token', () => {
    const token = crearToken({ sub: 'cliente@casasembrujadas.cl', id: 3, rol: 'CLIENTE', exp: 2000000000 });
    const sesion = crearSesion({ token, nombre: 'Camila', rol: 'CLIENTE' });
    expect(sesion.idUsuario).toBe(3);
    expect(sesion.exp).toBe(2000000000);
    expect(sesion.correo).toBe('cliente@casasembrujadas.cl');
  });

  it('no restaura una sesión vencida ni una corrupta', () => {
    simularAlmacenamiento({ sesion: JSON.stringify(sesionDePrueba('CLIENTE', 'Camila', -5)) });
    expect(leerSesion()).toBeNull();
    Storage.prototype.getItem.and.returnValue('{corrupto');
    expect(leerSesion()).toBeNull();
    Storage.prototype.getItem.and.returnValue(JSON.stringify(sesionDePrueba('ADMIN')));
    expect(leerSesion().rol).toBe('ADMIN');
  });
});
