import { act } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Registro from './Registro';
import { AuthProvider } from '../context/AuthContext';
import { authService } from '../services/authService';
import { ubicacionService } from '../services/ubicacionService';
import { cambiarValor, crearToken, esperar, renderizar, simularAlmacenamiento } from '../test-utils/renderizar';

describe('Página Registro', () => {
  let vista;
  const $ = (selector) => vista.contenedor.querySelector(selector);
  const enviar = () => act(() => $('button[type="submit"]').click());

  beforeEach(async () => {
    simularAlmacenamiento();
    spyOn(ubicacionService, 'listarRegiones').and.resolveTo([
      { idRegion: 7, nombre: 'Metropolitana de Santiago' },
      { idRegion: 10, nombre: 'Ñuble' },
    ]);
    spyOn(ubicacionService, 'listarComunas').and.resolveTo([{ idComuna: 22, nombre: 'Chillán', idRegion: 10 }]);
    vista = renderizar(
      <MemoryRouter initialEntries={['/registro']}>
        <AuthProvider>
          <Routes>
            <Route path="/registro" element={<Registro />} />
            <Route path="/mi-cuenta" element={<p id="destino">Mi cuenta</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    await esperar();
  });

  afterEach(() => vista.desmontar());

  function completar() {
    cambiarValor($('#run'), '12.345.678-5');
    cambiarValor($('#nombre'), 'Camila');
    cambiarValor($('#apellidos'), 'Reyes Pinto');
    cambiarValor($('#correo'), 'camila@ejemplo.cl');
    cambiarValor($('#confirmarCorreo'), 'camila@ejemplo.cl');
    cambiarValor($('#contrasena'), 'Fantasma1');
    cambiarValor($('#confirmarContrasena'), 'Fantasma1');
    cambiarValor($('#idRegion'), '10');
  }

  it('al enviar vacío muestra los mensajes de error y no llama a la API', () => {
    spyOn(authService, 'registro');
    enviar();
    expect(vista.contenedor.querySelectorAll('.invalid-feedback').length).toBe(7);
    expect($('#run').classList).toContain('is-invalid');
    expect(authService.registro).not.toHaveBeenCalled();
  });

  it('carga las regiones desde la API y habilita la comuna al elegir una', async () => {
    expect($('#idRegion').options.length).toBe(3);
    expect($('#idComuna').disabled).toBeTrue();

    cambiarValor($('#idRegion'), '10');
    await esperar();

    expect(ubicacionService.listarComunas).toHaveBeenCalledWith('10');
    expect($('#idComuna').disabled).toBeFalse();
    expect($('#idComuna').options.length).toBe(2);
  });

  it('con datos válidos registra, inicia sesión y lleva a Mi cuenta', async () => {
    const token = crearToken({ sub: 'camila@ejemplo.cl', id: 7, rol: 'CLIENTE', exp: Math.floor(Date.now() / 1000) + 3600 });
    spyOn(authService, 'registro').and.resolveTo({ idUsuario: 7 });
    spyOn(authService, 'login').and.resolveTo({ token, tipo: 'Bearer', nombre: 'Camila', rol: 'CLIENTE' });

    completar();
    await esperar();
    cambiarValor($('#idComuna'), '22');
    enviar();
    await esperar();

    expect(authService.registro).toHaveBeenCalledWith(jasmine.objectContaining({ run: '12.345.678-5', idComuna: 22, direccion: null }));
    expect(authService.login).toHaveBeenCalledWith('camila@ejemplo.cl', 'Fantasma1');
    expect($('#destino')).not.toBeNull();
  });

  it('muestra el error que devuelve el backend', async () => {
    spyOn(authService, 'registro').and.rejectWith({
      response: { status: 409, data: { mensaje: 'Ya existe una cuenta con el correo camila@ejemplo.cl', errores: [] } },
    });

    completar();
    await esperar();
    cambiarValor($('#idComuna'), '22');
    enviar();
    await esperar();

    expect($('.alert-danger').textContent).toContain('Ya existe una cuenta');
    expect($('#destino')).toBeNull();
  });
});
