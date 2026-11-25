import { act } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import FormularioProducto from './FormularioProducto';
import { categoriaService } from '../../services/categoriaService';
import { productoService } from '../../services/productoService';
import { ubicacionService } from '../../services/ubicacionService';
import { cambiarValor, esperarHasta, renderizar } from '../../test-utils/renderizar';

describe('Formulario de casas del panel', () => {
  let vista;
  afterEach(() => vista.desmontar());

  const $ = (selector) => vista.contenedor.querySelector(selector);
  const enviar = () => act(() => $('form button[type="submit"]').click());

  beforeEach(async () => {
    spyOn(categoriaService, 'listar').and.resolveTo([{ idCategoria: 1, nombre: 'Apariciones' }]);
    spyOn(ubicacionService, 'listarRegiones').and.resolveTo([{ idRegion: 6, nombre: 'Valparaíso' }]);
    spyOn(ubicacionService, 'listarComunas').and.resolveTo([{ idComuna: 7, nombre: 'Valparaíso', idRegion: 6 }]);
    vista = renderizar(
      <MemoryRouter initialEntries={['/panel/productos/nuevo']}>
        <Routes>
          <Route path="/panel/productos/nuevo" element={<FormularioProducto />} />
          <Route path="/panel/productos/:id" element={<p id="editar">editar</p>} />
        </Routes>
      </MemoryRouter>
    );
    await esperarHasta(() => $('#categoria-1') && $('#idRegion').options.length === 2);
  });

  it('enviado vacío marca los campos y no llama a la API', () => {
    spyOn(productoService, 'crear');
    enviar();
    expect(vista.contenedor.querySelectorAll('.is-invalid').length).toBeGreaterThan(8);
    expect(vista.contenedor.textContent).toContain('Marca al menos una categoría.');
    expect(productoService.crear).not.toHaveBeenCalled();
  });

  it('completo, crea la casa con números y lleva a editar su contenido', async () => {
    spyOn(productoService, 'crear').and.resolveTo({ idProducto: 14 });
    cambiarValor($('#titulo'), 'Faro de Punta Ángeles');
    cambiarValor($('#descripcion'), 'Faro con una guardiana que nunca se fue.');
    cambiarValor($('#precio'), '210000000');
    cambiarValor($('#direccion'), 'Playa Ancha s/n');
    cambiarValor($('#metrosCuadrados'), '180');
    cambiarValor($('#dormitorios'), '2');
    cambiarValor($('#banos'), '1');
    cambiarValor($('#latitud'), '-33.0215');
    cambiarValor($('#longitud'), '-71.6427');
    cambiarValor($('#idRegion'), '6');
    await esperarHasta(() => $('#idComuna').options.length === 2);
    cambiarValor($('#idComuna'), '7');
    act(() => $('#categoria-1').click());
    enviar();
    await esperarHasta(() => $('#editar'));

    expect(productoService.crear).toHaveBeenCalledWith(jasmine.objectContaining({
      titulo: 'Faro de Punta Ángeles', precio: 210000000, metrosCuadrados: 180, nivelEmbrujo: 3,
      latitud: -33.0215, longitud: -71.6427, idComuna: 7, idsCategorias: [1],
    }));
  });
});
