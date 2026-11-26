import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { useFavoritos } from './useFavoritos';
import { AuthProvider } from '../context/AuthContext';
import { favoritoService } from '../services/favoritoService';
import { esperarHasta, renderizar, sesionDePrueba, simularAlmacenamiento } from '../test-utils/renderizar';

function Corazon() {
  const { habilitado, esFavorito, alternar, error } = useFavoritos();
  return (
    <div>
      <span id="habilitado">{String(habilitado)}</span>
      <button id="corazon" onClick={() => alternar(5)}>{esFavorito(5) ? 'lleno' : 'vacio'}</button>
      <span id="error">{error}</span>
    </div>
  );
}

describe('Hook useFavoritos', () => {
  let vista;
  afterEach(() => vista.desmontar());

  const montar = () => {
    vista = renderizar(<MemoryRouter><AuthProvider><Corazon /></AuthProvider></MemoryRouter>);
  };
  const texto = (id) => vista.contenedor.querySelector(`#${id}`).textContent;

  it('a un visitante no le pide nada a la API', () => {
    simularAlmacenamiento();
    spyOn(favoritoService, 'listar');
    montar();
    expect(texto('habilitado')).toBe('false');
    expect(favoritoService.listar).not.toHaveBeenCalled();
  });

  it('un cliente ve sus favoritos y al desmarcar cambia al instante', async () => {
    simularAlmacenamiento({ sesion: JSON.stringify(sesionDePrueba('CLIENTE')) });
    spyOn(favoritoService, 'listar').and.resolveTo([{ idProducto: 5 }]);
    spyOn(favoritoService, 'quitar').and.resolveTo();
    montar();
    await esperarHasta(() => texto('corazon') === 'lleno');

    act(() => vista.contenedor.querySelector('#corazon').click());
    expect(texto('corazon')).toBe('vacio');
    await esperarHasta(() => favoritoService.quitar.calls.count() === 1);
    expect(favoritoService.quitar).toHaveBeenCalledWith(5);
  });

  it('si la API falla, deshace el cambio y muestra el error', async () => {
    simularAlmacenamiento({ sesion: JSON.stringify(sesionDePrueba('CLIENTE')) });
    spyOn(favoritoService, 'listar').and.resolveTo([]);
    spyOn(favoritoService, 'agregar').and.rejectWith({ response: { data: { mensaje: 'No existe la casa con id 5' } } });
    montar();
    await esperarHasta(() => favoritoService.listar.calls.count() === 1);

    act(() => vista.contenedor.querySelector('#corazon').click());
    expect(texto('corazon')).toBe('lleno');
    await esperarHasta(() => texto('error') !== '');
    expect(texto('corazon')).toBe('vacio');
    expect(texto('error')).toBe('No existe la casa con id 5');
  });
});
