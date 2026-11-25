import { act } from 'react';
import CuentaRegresiva from './CuentaRegresiva';
import { renderizar } from '../test-utils/renderizar';

describe('Cuenta regresiva de la reserva', () => {
  let vista;

  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 10, 19, 12, 0, 0));
  });

  afterEach(() => {
    vista.desmontar();
    jasmine.clock().uninstall();
  });

  const texto = () => vista.contenedor.querySelector('[role="timer"]').textContent;

  it('muestra horas, minutos y segundos que faltan', () => {
    vista = renderizar(<CuentaRegresiva hasta="2026-11-20T11:59:30" />);
    expect(texto()).toBe('23:59:30');
  });

  it('baja cada segundo y avisa una sola vez al llegar a cero', () => {
    const onTerminar = jasmine.createSpy('onTerminar');
    vista = renderizar(<CuentaRegresiva hasta="2026-11-19T12:00:03" onTerminar={onTerminar} />);
    expect(texto()).toBe('00:00:03');

    act(() => jasmine.clock().tick(1000));
    expect(texto()).toBe('00:00:02');

    act(() => jasmine.clock().tick(5000));
    expect(texto()).toBe('Expirada');
    expect(onTerminar).toHaveBeenCalledTimes(1);
  });

  it('si la reserva ya venció muestra «Expirada» desde el inicio', () => {
    vista = renderizar(<CuentaRegresiva hasta="2026-11-19T11:00:00" />);
    expect(texto()).toBe('Expirada');
  });
});
