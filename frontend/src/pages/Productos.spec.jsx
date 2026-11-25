import { act } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import Productos from './Productos';
import { AuthProvider } from '../context/AuthContext';
import { CarritoProvider } from '../context/CarritoContext';
import { categoriaService } from '../services/categoriaService';
import { productoService } from '../services/productoService';
import { ubicacionService } from '../services/ubicacionService';
import { cambiarValor, esperarHasta, renderizar, sesionDePrueba, simularAlmacenamiento } from '../test-utils/renderizar';

const CASA = { idProducto: 6, titulo: 'Palacio Cousiño', comuna: 'Santiago', region: 'Metropolitana', precio: 8400000000, nivelEmbrujo: 4, estado: 'DISPONIBLE', imagenPrincipal: null };
const pagina = (contenido) => ({ contenido, pagina: 0, tamano: 9, totalElementos: contenido.length, totalPaginas: 1 });

function Ubicacion() {
  const { search } = useLocation();
  return <p id="ubicacion">{search}</p>;
}

describe('Página Productos', () => {
  let vista;
  afterEach(() => vista.desmontar());

  const $ = (selector) => vista.contenedor.querySelector(selector);
  const montar = (url = '/productos') => {
    vista = renderizar(
      <MemoryRouter initialEntries={[url]}>
        <AuthProvider>
          <CarritoProvider>
            <Routes><Route path="/productos" element={<><Productos /><Ubicacion /></>} /></Routes>
          </CarritoProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    spyOn(categoriaService, 'listar').and.resolveTo([{ idCategoria: 2, nombre: 'Palacios y casonas' }]);
    spyOn(ubicacionService, 'listarRegiones').and.resolveTo([{ idRegion: 7, nombre: 'Metropolitana de Santiago' }]);
  });

  it('los filtros quedan en la URL y se envían al backend sin los campos vacíos', async () => {
    simularAlmacenamiento();
    spyOn(productoService, 'listar').and.resolveTo(pagina([CASA]));
    montar();
    await esperarHasta(() => $('#categoria').options.length === 2 && vista.contenedor.textContent.includes('Palacio Cousiño'));

    cambiarValor($('#q'), 'palacio');
    cambiarValor($('#categoria'), '2');
    act(() => [...vista.contenedor.querySelectorAll('button')].find((b) => b.textContent === 'Filtrar').click());
    await esperarHasta(() => productoService.listar.calls.count() === 2);

    expect($('#ubicacion').textContent).toBe('?q=palacio&categoria=2');
    expect(productoService.listar.calls.mostRecent().args[0]).toEqual({ q: 'palacio', categoria: '2', tamano: 9 });
  });

  it('sin resultados ofrece ver todas', async () => {
    simularAlmacenamiento();
    spyOn(productoService, 'listar').and.resolveTo(pagina([]));
    montar('/productos?estado=VENDIDA');
    await esperarHasta(() => vista.contenedor.textContent.includes('No encontramos casas'));
    expect(productoService.listar).toHaveBeenCalledWith({ estado: 'VENDIDA', tamano: 9 });
  });

  it('el visitante puede agregar al carrito y el vendedor no ve el botón', async () => {
    simularAlmacenamiento();
    spyOn(productoService, 'listar').and.resolveTo(pagina([CASA]));
    montar();
    await esperarHasta(() => vista.contenedor.textContent.includes('Palacio Cousiño'));
    act(() => [...vista.contenedor.querySelectorAll('.tarjeta-propiedad button')].find((b) => b.textContent.includes('Añadir')).click());
    expect(Storage.prototype.setItem).toHaveBeenCalledWith('carrito', '[6]');
    vista.desmontar();

    Storage.prototype.getItem.and.callFake((clave) => (clave === 'sesion' ? JSON.stringify(sesionDePrueba('VENDEDOR')) : null));
    montar();
    await esperarHasta(() => vista.contenedor.textContent.includes('Palacio Cousiño'));
    expect([...vista.contenedor.querySelectorAll('.tarjeta-propiedad button')].some((b) => b.textContent.includes('Añadir'))).toBeFalse();
  });
});
