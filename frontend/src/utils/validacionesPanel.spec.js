import { validarCategoria, validarFicha, validarImagen, validarMito, validarProducto, validarUsuario } from './validacionesPanel';

describe('Validaciones del panel', () => {
  const casa = {
    titulo: 'Casa del Faro', descripcion: 'Un faro.', precio: '120000000', direccion: 'Costanera 1',
    metrosCuadrados: '200', dormitorios: '3', banos: '2', nivelEmbrujo: '4', latitud: '-36.6', longitud: '-72.1',
    idRegion: '10', idComuna: '22', idsCategorias: [1],
  };

  it('acepta una casa completa y marca todos los campos de una vacía', () => {
    expect(validarProducto(casa)).toEqual({});
    const vacia = { ...Object.fromEntries(Object.keys(casa).map((k) => [k, ''])), idsCategorias: [] };
    expect(Object.keys(validarProducto(vacia)).length).toBe(13);
  });

  it('rechaza coordenadas fuera de rango, embrujo fuera de 1 a 5 y precio 0', () => {
    const errores = validarProducto({ ...casa, latitud: '-91', longitud: '181', nivelEmbrujo: '6', precio: '0' });
    expect(Object.keys(errores).sort()).toEqual(['latitud', 'longitud', 'nivelEmbrujo', 'precio']);
  });

  it('categoría con nombre obligatorio', () => {
    expect(validarCategoria({ nombre: 'Faros', descripcion: '' })).toEqual({});
    expect(validarCategoria({ nombre: ' ', descripcion: 'x'.repeat(256) })).toEqual(jasmine.objectContaining({ nombre: jasmine.any(String), descripcion: jasmine.any(String) }));
  });

  it('usuario nuevo exige RUN, correo y contraseña; al editar no', () => {
    const editar = { nombre: 'Matías', apellidos: 'Rojas', direccion: '', rol: 'VENDEDOR' };
    expect(validarUsuario(editar, false)).toEqual({});
    expect(Object.keys(validarUsuario({ ...editar, run: '1-1', correo: 'x', contrasena: 'corta' }, true)).sort())
      .toEqual(['contrasena', 'correo', 'run']);
  });

  it('imagen con URL http, autor y licencia', () => {
    expect(validarImagen({ url: 'https://upload.wikimedia.org/a.jpg', autor: 'Ana', licencia: 'CC BY 4.0', urlFuente: '' })).toEqual({});
    expect(Object.keys(validarImagen({ url: 'archivo.jpg', autor: '', licencia: '', urlFuente: 'no-url' })).sort())
      .toEqual(['autor', 'licencia', 'url', 'urlFuente']);
  });

  it('mito con año opcional entre 1000 y 2100', () => {
    const mito = { titulo: 'La dama', relato: 'Se aparece.', anioOrigen: '', fuente: 'Tradición oral' };
    expect(validarMito(mito)).toEqual({});
    expect(validarMito({ ...mito, anioOrigen: '999' }).anioOrigen).toBeDefined();
  });

  it('ficha sin fechas futuras', () => {
    const hoy = new Date(2026, 10, 18);
    const ficha = { tipoEntidad: 'Espectro', horarioActividad: 'Noche', fenomenosReportados: 'Pasos.', ultimoAvistamiento: '2026-11-18' };
    expect(validarFicha(ficha, hoy)).toEqual({});
    expect(validarFicha({ ...ficha, ultimoAvistamiento: '2026-11-19' }, hoy).ultimoAvistamiento).toBeDefined();
  });
});
