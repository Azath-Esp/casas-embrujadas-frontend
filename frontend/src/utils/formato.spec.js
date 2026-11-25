import { formatearFecha, formatearPrecio, formatearRestante } from './formato';

describe('Formatos', () => {
  it('formatearPrecio usa pesos chilenos con puntos de miles', () => {
    expect(formatearPrecio(185000000)).toBe('$185.000.000');
    expect(formatearPrecio('99900000.00')).toBe('$99.900.000');
    expect(formatearPrecio(null)).toBe('$0');
  });

  it('formatearFecha no se corre un día por la zona horaria', () => {
    expect(formatearFecha('2026-05-29')).toContain('29');
    expect(formatearFecha('2026-05-29')).toContain('mayo');
    expect(formatearFecha(null)).toBe('');
  });

  it('formatearRestante muestra horas, minutos y segundos', () => {
    expect(formatearRestante(((23 * 60 + 59) * 60 + 5) * 1000)).toBe('23:59:05');
    expect(formatearRestante(61000)).toBe('00:01:01');
    expect(formatearRestante(-5)).toBe('00:00:00');
  });
});
