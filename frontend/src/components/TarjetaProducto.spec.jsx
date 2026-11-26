import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import TarjetaProducto from './TarjetaProducto';
import { renderizar } from '../test-utils/renderizar';

describe('Componente TarjetaProducto', () => {
  const casa = {
    idProducto: 6,
    titulo: 'Palacio Cousiño',
    comuna: 'Santiago',
    region: 'Metropolitana de Santiago',
    precio: 450000000,
    nivelEmbrujo: 4,
    estado: 'DISPONIBLE',
    imagenPrincipal: 'https://ejemplo.cl/cousino.jpg',
  };
  let vista;
  const montar = (props = {}) => {
    vista = renderizar(<MemoryRouter><TarjetaProducto casa={casa} {...props} /></MemoryRouter>);
  };
  const $ = (selector) => vista.contenedor.querySelector(selector);

  afterEach(() => vista.desmontar());

  it('muestra título, ubicación, precio, estado y nivel de embrujo', () => {
    montar();
    const texto = vista.contenedor.textContent;
    expect(texto).toContain('Palacio Cousiño');
    expect(texto).toContain('Santiago, Metropolitana de Santiago');
    expect(texto).toContain('$450.000.000');
    expect(texto).toContain('Disponible');
    expect($('[aria-label="Nivel de embrujo 4 de 5"]')).not.toBeNull();
  });

  it('el enlace apunta al detalle con el id numérico', () => {
    montar();
    expect($('a').getAttribute('href')).toBe('/producto/6');
  });

  it('sin acciones no dibuja botones', () => {
    montar();
    expect($('button')).toBeNull();
    expect($('input[type="checkbox"]')).toBeNull();
  });

  it('llama a onAgregar con el id y se desactiva si ya está en el carrito', () => {
    const onAgregar = jasmine.createSpy('onAgregar');
    montar({ onAgregar });
    act(() => $('.btn-warning').click());
    expect(onAgregar).toHaveBeenCalledWith(6);

    vista.desmontar();
    montar({ onAgregar, enCarrito: true });
    expect($('.btn-warning').disabled).toBeTrue();
    expect($('.btn-warning').textContent).toContain('En el carrito');
  });

  it('no ofrece el carrito si la casa no está disponible', () => {
    vista = renderizar(
      <MemoryRouter><TarjetaProducto casa={{ ...casa, estado: 'VENDIDA' }} onAgregar={() => {}} /></MemoryRouter>
    );
    expect($('.btn-warning')).toBeNull();
    expect(vista.contenedor.textContent).toContain('Vendida');
  });

  it('el corazón y la casilla de comparar avisan con el id', () => {
    const onFavorito = jasmine.createSpy('onFavorito');
    const onComparar = jasmine.createSpy('onComparar');
    montar({ onFavorito, onComparar, esFavorito: true });
    expect($('.boton-favorito').getAttribute('aria-pressed')).toBe('true');
    act(() => $('.boton-favorito').click());
    act(() => $('input[type="checkbox"]').click());
    expect(onFavorito).toHaveBeenCalledWith(6);
    expect(onComparar).toHaveBeenCalledWith(6);
  });
});
