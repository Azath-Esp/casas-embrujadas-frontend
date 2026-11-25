import { act } from 'react';
import { createRoot } from 'react-dom/client';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

export function renderizar(elemento) {
  const contenedor = document.createElement('div');
  document.body.appendChild(contenedor);
  const root = createRoot(contenedor);

  act(() => root.render(elemento));

  return {
    contenedor,
    desmontar() {
      act(() => root.unmount());
      contenedor.remove();
    },
  };
}

export function cambiarValor(elemento, valor) {
  const prototipo = Object.getPrototypeOf(elemento);
  const setterNativo = Object.getOwnPropertyDescriptor(prototipo, 'value').set;

  act(() => {
    setterNativo.call(elemento, valor);
    const tipoEvento = elemento.tagName === 'SELECT' ? 'change' : 'input';
    elemento.dispatchEvent(new Event(tipoEvento, { bubbles: true }));
  });
}

export async function esperar() {
  for (let vuelta = 0; vuelta < 3; vuelta++) {
    await act(async () => {
      await new Promise((resolver) => setTimeout(resolver, 0));
    });
  }
}

export function crearToken(datos) {
  const json = JSON.stringify(datos);
  const bytes = new TextEncoder().encode(json);
  const base64 = btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `cabecera.${base64}.firma`;
}

export function sesionDePrueba(rol, nombre = 'Camila', minutos = 60) {
  return {
    token: crearToken({ sub: 'cliente@casasembrujadas.cl', id: 3, rol, exp: Math.floor(Date.now() / 1000) + minutos * 60 }),
    nombre,
    rol,
    idUsuario: 3,
    correo: 'cliente@casasembrujadas.cl',
    exp: Math.floor(Date.now() / 1000) + minutos * 60,
  };
}

export function simularAlmacenamiento(valores = {}) {
  spyOn(Storage.prototype, 'getItem').and.callFake((clave) => (clave in valores ? valores[clave] : null));
  spyOn(Storage.prototype, 'setItem');
  spyOn(Storage.prototype, 'removeItem');
}
