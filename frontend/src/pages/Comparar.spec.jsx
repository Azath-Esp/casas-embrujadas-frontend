import { act } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Comparar from './Comparar';
import { productoService } from '../services/productoService';
import { esperarHasta, renderizar } from '../test-utils/renderizar';

const casa = (id, titulo, precio, metros) => ({
  idProducto: id, titulo, precio, metrosCuadrados: metros, dormitorios: 3, banos: 2, nivelEmbrujo: 4,
  cantidadMitos: 1, tipoEntidad: 'Espectro', region: 'Metropolitana', estado: 'DISPONIBLE', imagenPrincipal: null,
});

describe('Página Comparar', () => {
  let vista;
  afterEach(() => vista.desmontar());

  const montar = (url) => {
    vista = renderizar(
      <MemoryRouter initialEntries={[url]}>
        <Routes><Route path="/comparar" element={<Comparar />} /></Routes>
      </MemoryRouter>
    );
  };

  it('con menos de dos casas válidas explica qué hacer y no llama a la API', () => {
    spyOn(productoService, 'comparar');
    montar('/comparar?ids=1,1,abc');
    expect(vista.contenedor.textContent).toContain('Elige entre 2 y 3 casas');
    expect(productoService.comparar).not.toHaveBeenCalled();
  });

  it('marca con estrella la mejor casa de cada fila según el backend', async () => {
    spyOn(productoService, 'comparar').and.resolveTo({
      casas: [casa(1, 'Casona Dubois', 900, 650), casa(6, 'Palacio Cousiño', 400, 2900)],
      mejores: { precio: [6], metrosCuadrados: [6], dormitorios: [1, 6] },
    });
    montar('/comparar?ids=1,6');
    await esperarHasta(() => vista.contenedor.querySelector('table'));

    expect(productoService.comparar).toHaveBeenCalledWith([1, 6]);
    const fila = (nombre) => [...vista.contenedor.querySelectorAll('tbody tr')].find((tr) => tr.querySelector('th').textContent === nombre);
    const estrellas = (nombre) => [...fila(nombre).querySelectorAll('td')].map((td) => td.classList.contains('mejor'));
    expect(estrellas('Precio (sin IVA)')).toEqual([false, true]);
    expect(estrellas('Dormitorios')).toEqual([true, true]);
    expect(estrellas('Baños')).toEqual([false, false]);
  });

  it('con tres casas permite quitar una y vuelve a pedir la comparación', async () => {
    spyOn(productoService, 'comparar').and.callFake(async (ids) => ({
      casas: ids.map((id) => casa(id, `Casa ${id}`, 100 * id, 100)),
      mejores: {},
    }));
    montar('/comparar?ids=1,6,9');
    await esperarHasta(() => vista.contenedor.querySelectorAll('thead th').length === 4);

    act(() => vista.contenedor.querySelector('thead button').click());
    await esperarHasta(() => vista.contenedor.querySelectorAll('thead th').length === 3);

    expect(productoService.comparar.calls.mostRecent().args[0]).toEqual([6, 9]);
  });
});
