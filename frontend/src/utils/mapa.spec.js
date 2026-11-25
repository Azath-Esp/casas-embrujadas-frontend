import { calcularLimites, clasePin, conCoordenadas, contarPorEstado } from './mapa';

describe('Utilidades del mapa', () => {
  const casas = [
    { idProducto: 1, estado: 'DISPONIBLE', latitud: '-33.428288', longitud: '-70.703004' },
    { idProducto: 4, estado: 'DISPONIBLE', latitud: -20.208581, longitud: -69.795474 },
    { idProducto: 9, estado: 'VENDIDA', latitud: -42.161470, longitud: -73.479318 },
  ];

  it('convierte las coordenadas a número y descarta las vacías', () => {
    const resultado = conCoordenadas([...casas, { idProducto: 7, estado: 'DISPONIBLE', latitud: null, longitud: null }]);
    expect(resultado.length).toBe(3);
    expect(resultado[0].latitud).toBe(-33.428288);
  });

  it('calcula el rectángulo que encierra todas las casas', () => {
    expect(calcularLimites(conCoordenadas(casas))).toEqual([[-42.16147, -73.479318], [-20.208581, -69.795474]]);
    expect(calcularLimites([])).toBeNull();
  });

  it('cuenta las casas de cada estado', () => {
    expect(contarPorEstado(casas)).toEqual({ DISPONIBLE: 2, VENDIDA: 1 });
    expect(contarPorEstado([])).toEqual({});
  });

  it('arma la clase CSS del pin según el estado', () => {
    expect(clasePin('RESERVADA')).toBe('pin pin--reservada');
  });
});
