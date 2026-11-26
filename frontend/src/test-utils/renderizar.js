import { act } from 'react';
import { createRoot } from 'react-dom/client';
import api from '../services/api';

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

export async function esperarHasta(condicion, limite = 4000) {
  const inicio = Date.now();
  while (!condicion()) {
    if (Date.now() - inicio > limite) throw new Error('La condición no se cumplió a tiempo');
    await act(async () => {
      await new Promise((resolver) => setTimeout(resolver, 20));
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

export function simularApi(respuestas) {
  const responder = (metodo) => (url) => {
    const patron = Object.keys(respuestas).find((clave) => new RegExp(clave).test(`${metodo} ${url}`));
    if (!patron) return Promise.reject(new Error(`Sin respuesta simulada para ${metodo} ${url}`));
    const valor = respuestas[patron];
    return Promise.resolve({ data: typeof valor === 'function' ? valor(url) : valor, headers: {} });
  };
  ['get', 'post', 'put', 'delete'].forEach((metodo) => spyOn(api, metodo).and.callFake(responder(metodo.toUpperCase())));
}
