import { act } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';
import { authService } from '../services/authService';
import { cambiarValor, crearToken, esperarHasta, renderizar, simularAlmacenamiento } from '../test-utils/renderizar';

const respuesta = (rol) => ({
  token: crearToken({ sub: 'x@casasembrujadas.cl', id: 1, rol, exp: Math.floor(Date.now() / 1000) + 3600 }), tipo: 'Bearer', nombre: 'Prueba', rol,
});

describe('Página Login', () => {
  let vista;
  afterEach(() => vista.desmontar());

  const $ = (selector) => vista.contenedor.querySelector(selector);
  const montar = (estado) => {
    vista = renderizar(
      <MemoryRouter initialEntries={[{ pathname: '/login', state: estado }]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<p id="destino">inicio</p>} />
            <Route path="/panel" element={<p id="destino">panel</p>} />
            <Route path="/carrito" element={<p id="destino">carrito</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
  };
  const entrar = () => {
    cambiarValor($('#correo'), 'x@casasembrujadas.cl');
    cambiarValor($('#contrasena'), 'Clave1234');
    act(() => $('button[type="submit"]').click());
  };

  beforeEach(() => simularAlmacenamiento());

  it('con credenciales incorrectas muestra el mensaje del backend', async () => {
    spyOn(authService, 'login').and.rejectWith({ response: { status: 401, data: { mensaje: 'Correo o contraseña incorrectos' } } });
    montar();
    entrar();
    await esperarHasta(() => $('.alert-danger'));
    expect($('.alert-danger').textContent).toBe('Correo o contraseña incorrectos');
  });

  it('el cliente vuelve al inicio y el personal entra al panel', async () => {
    spyOn(authService, 'login').and.resolveTo(respuesta('CLIENTE'));
    montar();
    entrar();
    await esperarHasta(() => $('#destino'));
    expect($('#destino').textContent).toBe('inicio');
    vista.desmontar();

    authService.login.and.resolveTo(respuesta('VENDEDOR'));
    montar();
    entrar();
    await esperarHasta(() => $('#destino'));
    expect($('#destino').textContent).toBe('panel');
  });

  it('si venía de una página protegida, vuelve a ella', async () => {
    spyOn(authService, 'login').and.resolveTo(respuesta('CLIENTE'));
    montar({ desde: '/carrito', mensaje: 'Inicia sesión para finalizar la compra.' });
    expect($('.alert-warning').textContent).toContain('finalizar la compra');
    entrar();
    await esperarHasta(() => $('#destino'));
    expect($('#destino').textContent).toBe('carrito');
  });
});
