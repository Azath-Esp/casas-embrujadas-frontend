import { agregarAlCarrito, calcularResumen, normalizarCarrito, quitarDelCarrito, sePuedeComprar } from './carrito';

describe('Funciones del carrito', () => {
  it('normalizarCarrito deja solo ids enteros positivos y sin repetir', () => {
    expect(normalizarCarrito([3, 3, 'faro-ahogado', 1.5, -2, 7])).toEqual([3, 7]);
    expect(normalizarCarrito(null)).toEqual([]);
    expect(normalizarCarrito({ id: 1 })).toEqual([]);
  });

  it('agregarAlCarrito agrega una casa sin modificar el original', () => {
    const original = [1];
    const nuevo = agregarAlCarrito(original, 6);
    expect(nuevo).toEqual([1, 6]);
    expect(original).toEqual([1]);
  });

  it('agregarAlCarrito no repite una casa ni acepta ids inválidos', () => {
    const carrito = [1, 6];
    expect(agregarAlCarrito(carrito, 6)).toBe(carrito);
    expect(agregarAlCarrito(carrito, 'faro')).toBe(carrito);
  });

  it('quitarDelCarrito saca la casa y no cambia nada si no está', () => {
    expect(quitarDelCarrito([1, 6, 9], 6)).toEqual([1, 9]);
    const carrito = [1];
    expect(quitarDelCarrito(carrito, 99)).toBe(carrito);
  });

  it('calcularResumen calcula neto, IVA redondeado al peso y total como el backend', () => {
    expect(calcularResumen([{ precio: 999 }])).toEqual({ neto: 999, iva: 190, total: 1189 });
    expect(calcularResumen([{ precio: '100000000' }, { precio: 50 }])).toEqual({ neto: 100000050, iva: 19000010, total: 119000060 });
    expect(calcularResumen([])).toEqual({ neto: 0, iva: 0, total: 0 });
  });

  it('sePuedeComprar acepta disponibles y reservadas por el mismo cliente', () => {
    const reservas = [{ idProducto: 6, estado: 'ACTIVA' }];
    expect(sePuedeComprar({ idProducto: 1, estado: 'DISPONIBLE' })).toBeTrue();
    expect(sePuedeComprar({ idProducto: 6, estado: 'RESERVADA' }, reservas)).toBeTrue();
    expect(sePuedeComprar({ idProducto: 7, estado: 'RESERVADA' }, reservas)).toBeFalse();
    expect(sePuedeComprar({ idProducto: 8, estado: 'VENDIDA' }, reservas)).toBeFalse();
  });
});
