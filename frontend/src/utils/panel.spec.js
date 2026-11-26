import { formatearMes, formatearMillones, opcionesMenu } from './panel';

describe('Utilidades del panel', () => {
  const rutas = (rol) => opcionesMenu(rol).map((opcion) => opcion.ruta);

  it('el administrador ve las seis secciones', () => {
    expect(rutas('ADMIN')).toEqual(['/panel', '/panel/productos', '/panel/boletas', '/panel/reservas', '/panel/categorias', '/panel/usuarios']);
  });

  it('el vendedor ve solo casas y órdenes', () => {
    expect(rutas('VENDEDOR')).toEqual(['/panel/productos', '/panel/boletas']);
  });

  it('un cliente o un visitante no tienen secciones', () => {
    expect(rutas('CLIENTE')).toEqual([]);
    expect(rutas(null)).toEqual([]);
  });

  it('formatea el mes y las cifras grandes del dashboard', () => {
    expect(formatearMes('2026-11')).toBe('nov 26');
    expect(formatearMes('raro')).toBe('raro');
    expect(formatearMillones(11757200000)).toBe('$11,8 mil M');
    expect(formatearMillones(320000000)).toBe('$320 M');
    expect(formatearMillones(950)).toBe('$950');
  });
});
