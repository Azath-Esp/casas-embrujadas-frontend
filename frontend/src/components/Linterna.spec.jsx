import { act } from 'react';
import Linterna from './Linterna';
import { PreferenciasProvider, usePreferencias } from '../context/PreferenciasContext';
import { renderizar, simularAlmacenamiento } from '../test-utils/renderizar';

function Interruptor() {
  const { alternarLinterna } = usePreferencias();
  return <button id="alternar" onClick={alternarLinterna}>linterna</button>;
}

describe('Modo linterna', () => {
  let vista;
  const montar = () => renderizar(<PreferenciasProvider><Interruptor /><Linterna /></PreferenciasProvider>);
  const capa = () => vista.contenedor.querySelector('[data-testid="linterna"]');

  afterEach(() => vista.desmontar());

  it('no dibuja nada si está apagada', () => {
    simularAlmacenamiento();
    vista = montar();
    expect(capa()).toBeNull();
  });

  it('se enciende con el botón, sigue al puntero y se apaga con Escape', async () => {
    simularAlmacenamiento();
    vista = montar();
    act(() => vista.contenedor.querySelector('#alternar').click());
    expect(capa()).not.toBeNull();
    expect(Storage.prototype.setItem).toHaveBeenCalledWith('preferencias', '{"linterna":true}');

    act(() => window.dispatchEvent(new PointerEvent('pointermove', { clientX: 120, clientY: 80 })));
    await act(() => new Promise((resolver) => requestAnimationFrame(() => requestAnimationFrame(resolver))));
    expect(capa().style.getPropertyValue('--luz-x')).toBe('120px');
    expect(capa().style.getPropertyValue('--luz-y')).toBe('80px');

    act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
    expect(capa()).toBeNull();
  });

  it('recuerda la linterna encendida al volver a abrir la página', () => {
    simularAlmacenamiento({ preferencias: '{"linterna":true}' });
    vista = montar();
    expect(capa()).not.toBeNull();
  });
});
