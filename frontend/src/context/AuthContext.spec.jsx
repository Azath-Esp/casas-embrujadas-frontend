import { act } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { authService } from '../services/authService';
import { EVENTO_SESION_EXPIRADA } from '../services/api';
import { crearToken, esperar, renderizar, sesionDePrueba, simularAlmacenamiento } from '../test-utils/renderizar';

function ConsumidorDePrueba() {
  const { rol, estaAutenticado, login, logout } = useAuth();
  return (
    <div>
      <span id="rol">{estaAutenticado ? rol : 'anonimo'}</span>
      <button id="entrar" onClick={() => login('Cliente@CasasEmbrujadas.cl', 'Cliente123!')}>entrar</button>
      <button id="salir" onClick={logout}>salir</button>
    </div>
  );
}

function PaginaLogin() {
  const { state } = useLocation();
  return <p id="login">{state?.mensaje}</p>;
}

describe('AuthContext', () => {
  let vista;
  const texto = (selector) => vista.contenedor.querySelector(selector)?.textContent;
  const montar = () => renderizar(
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<ConsumidorDePrueba />} />
          <Route path="/login" element={<PaginaLogin />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

  afterEach(() => vista.desmontar());

  it('restaura una sesión vigente guardada', () => {
    simularAlmacenamiento({ sesion: JSON.stringify(sesionDePrueba('VENDEDOR')) });
    vista = montar();
    expect(texto('#rol')).toBe('VENDEDOR');
  });

  it('descarta una sesión vencida y la borra', () => {
    simularAlmacenamiento({ sesion: JSON.stringify(sesionDePrueba('CLIENTE', 'Camila', -1)) });
    vista = montar();
    expect(texto('#rol')).toBe('anonimo');
    expect(Storage.prototype.removeItem).toHaveBeenCalledWith('sesion');
  });

  it('login guarda la sesión con el rol del token y logout la borra', async () => {
    simularAlmacenamiento();
    const token = crearToken({ sub: 'cliente@casasembrujadas.cl', id: 3, rol: 'CLIENTE', exp: Math.floor(Date.now() / 1000) + 3600 });
    spyOn(authService, 'login').and.resolveTo({ token, tipo: 'Bearer', nombre: 'Camila', rol: 'CLIENTE' });
    vista = montar();

    act(() => vista.contenedor.querySelector('#entrar').click());
    await esperar();

    expect(authService.login).toHaveBeenCalledWith('cliente@casasembrujadas.cl', 'Cliente123!');
    expect(texto('#rol')).toBe('CLIENTE');
    expect(Storage.prototype.setItem).toHaveBeenCalledWith('sesion', jasmine.stringMatching('"rol":"CLIENTE"'));

    act(() => vista.contenedor.querySelector('#salir').click());
    expect(texto('#rol')).toBe('anonimo');
  });

  it('cuando la API avisa un 401 cierra la sesión y lleva al login con el motivo', () => {
    simularAlmacenamiento({ sesion: JSON.stringify(sesionDePrueba('CLIENTE')) });
    vista = montar();

    act(() => window.dispatchEvent(new CustomEvent(EVENTO_SESION_EXPIRADA, { detail: 'El token expiró; inicia sesión nuevamente' })));

    expect(texto('#login')).toBe('El token expiró; inicia sesión nuevamente');
    expect(Storage.prototype.removeItem).toHaveBeenCalledWith('sesion');
  });
});
