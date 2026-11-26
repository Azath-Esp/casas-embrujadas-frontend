import { calcularDigitoVerificador, formatearRun, normalizarRun, runValido } from './run';

describe('RUN chileno', () => {
  it('calcula el dígito verificador como el backend', () => {
    expect(calcularDigitoVerificador('12345678')).toBe('5');
    expect(calcularDigitoVerificador('11111111')).toBe('1');
    expect(calcularDigitoVerificador('6')).toBe('K');
  });

  it('normaliza puntos, guion y la k minúscula', () => {
    expect(normalizarRun('12.345.678-5')).toBe('12345678-5');
    expect(normalizarRun('1.000.005-k')).toBe('1000005-K');
  });

  it('acepta RUN correctos y rechaza los incorrectos', () => {
    expect(runValido('12.345.678-5')).toBeTrue();
    expect(runValido('33333333-3')).toBeTrue();
    expect(runValido('12345678-9')).toBeFalse();
    expect(runValido('abc')).toBeFalse();
    expect(runValido('')).toBeFalse();
  });

  it('da formato con puntos', () => {
    expect(formatearRun('33333333-3')).toBe('33.333.333-3');
    expect(formatearRun('')).toBe('');
  });
});
