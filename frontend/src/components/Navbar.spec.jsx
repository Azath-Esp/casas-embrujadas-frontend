import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { AuthProvider } from '../context/AuthContext';
import { CarritoProvider } from '../context/CarritoContext';
import { PreferenciasProvider } from '../context/PreferenciasContext';
import { renderizar, sesionDePrueba, simularAlmacenamiento } from '../test-utils/renderizar';

describe('Componente Navbar', () => {
  let vista;
  afterEach(() => vista.desmontar());

  const montar = () => renderizar(
    <MemoryRouter>
      <PreferenciasProvider>
        <AuthProvider>
          <CarritoProvider><Navbar /></CarritoProvider>
        </AuthProvider>
      </PreferenciasProvider>
    </MemoryRouter>
  );

  it('a un visitante le muestra login, registro y el carrito con su cantidad', () => {
    simularAlmacenamiento({ carrito: '[1,6,9]' });
    vista = montar();
    const texto = vista.contenedor.textContent;
    expect(texto).toContain('Propiedades');
    expect(texto).toContain('Iniciar sesión');
    expect(texto).toContain('Carrito (3)');
  });

  it('a un cliente le muestra su nombre, Mi cuenta, el carrito y Cerrar sesión', () => {
    simularAlmacenamiento({ sesion: JSON.stringify(sesionDePrueba('CLIENTE')) });
    vista = montar();
    const texto = vista.contenedor.textContent;
    expect(texto).toContain('Hola, Camila');
    expect(texto).toContain('Mi cuenta');
    expect(texto).toContain('Carrito');
    expect(texto).toContain('Cerrar sesión');
    expect(texto).not.toContain('Iniciar sesión');
  });

  it('a un vendedor no le dibuja el carrito ni Mi cuenta', () => {
    simularAlmacenamiento({ sesion: JSON.stringify(sesionDePrueba('VENDEDOR', 'Matías')) });
    vista = montar();
    const texto = vista.contenedor.textContent;
    expect(texto).toContain('Hola, Matías');
    expect(texto).not.toContain('Carrito');
    expect(texto).not.toContain('Mi cuenta');
    expect(vista.contenedor.querySelector('a[href="/carrito"]')).toBeNull();
  });

  it('el botón ☰ abre el menú y al elegir un enlace se cierra', () => {
    simularAlmacenamiento();
    vista = montar();
    const menu = vista.contenedor.querySelector('#menu');
    const botonMenu = vista.contenedor.querySelector('.navbar-toggler');

    expect(menu.classList).not.toContain('show');
    act(() => botonMenu.click());
    expect(menu.classList).toContain('show');
    expect(botonMenu.getAttribute('aria-expanded')).toBe('true');
    act(() => vista.contenedor.querySelector('.nav-link').click());
    expect(menu.classList).not.toContain('show');
  });

  it('se cierra al hacer clic fuera del menú o al presionar Escape', () => {
    simularAlmacenamiento();
    vista = montar();
    const menu = vista.contenedor.querySelector('#menu');
    const botonMenu = vista.contenedor.querySelector('.navbar-toggler');
    const clic = (el) => act(() => el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })));
    const tecla = (key) => act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key })));

    act(() => botonMenu.click());
    clic(menu);
    expect(menu.classList).toContain('show');
    clic(document.body);
    expect(menu.classList).not.toContain('show');

    act(() => botonMenu.click());
    tecla('Enter');
    expect(menu.classList).toContain('show');
    tecla('Escape');
    expect(menu.classList).not.toContain('show');
  });
});
