import { act } from 'react';
import { CarritoProvider, useCarrito } from './CarritoContext';
import { renderizar } from '../test-utils/renderizar';

function ConsumidorDePrueba() {
  const { cantidad, contiene, agregar, quitar, vaciar } = useCarrito();
  return (
    <div>
      <span id="cantidad">{cantidad}</span>
      <span id="contiene">{String(contiene(6))}</span>
      <button id="agregar" onClick={() => agregar(6)}>+</button>
      <button id="quitar" onClick={() => quitar(6)}>-</button>
      <button id="vaciar" onClick={vaciar}>x</button>
    </div>
  );
}

describe('CarritoContext', () => {
  let vista;

  const montar = () => renderizar(<CarritoProvider><ConsumidorDePrueba /></CarritoProvider>);
  const texto = (id) => vista.contenedor.querySelector(`#${id}`).textContent;
  const clic = (id) => act(() => vista.contenedor.querySelector(`#${id}`).click());

  afterEach(() => vista.desmontar());

  it('carga el carrito guardado y descarta los ids antiguos de texto', () => {
    spyOn(Storage.prototype, 'getItem').and.returnValue('[1, 6, 6, "faro-ahogado"]');
    spyOn(Storage.prototype, 'setItem');

    vista = montar();

    expect(Storage.prototype.getItem).toHaveBeenCalledWith('carrito');
    expect(texto('cantidad')).toBe('2');
    expect(texto('contiene')).toBe('true');
  });

  it('parte vacío si lo guardado está corrupto', () => {
    spyOn(Storage.prototype, 'getItem').and.returnValue('{esto no es json');
    spyOn(Storage.prototype, 'setItem');

    vista = montar();

    expect(texto('cantidad')).toBe('0');
  });

  it('agregar no repite la casa, y quitar y vaciar la sacan y lo guardan', () => {
    spyOn(Storage.prototype, 'getItem').and.returnValue(null);
    const setItemFalso = spyOn(Storage.prototype, 'setItem');

    vista = montar();
    clic('agregar');
    clic('agregar');
    expect(texto('cantidad')).toBe('1');
    expect(setItemFalso).toHaveBeenCalledWith('carrito', '[6]');

    clic('quitar');
    expect(texto('cantidad')).toBe('0');

    clic('agregar');
    clic('vaciar');
    expect(texto('contiene')).toBe('false');
    expect(setItemFalso).toHaveBeenCalledWith('carrito', '[]');
  });
});
