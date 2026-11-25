import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import EstadoCasa from '../components/EstadoCasa';
import NivelEmbrujo from '../components/NivelEmbrujo';
import { IMAGEN_RESPALDO } from '../components/TarjetaProducto';
import { mensajeDeError } from '../services/api';
import { productoService } from '../services/productoService';
import { formatearPrecio } from '../utils/formato';

const FILAS = [
  { campo: 'precio', texto: 'Precio (sin IVA)', mostrar: (c) => formatearPrecio(c.precio) },
  { campo: 'metrosCuadrados', texto: 'Superficie', mostrar: (c) => `${c.metrosCuadrados} m²` },
  { campo: 'dormitorios', texto: 'Dormitorios', mostrar: (c) => c.dormitorios },
  { campo: 'banos', texto: 'Baños', mostrar: (c) => c.banos },
  { campo: 'nivelEmbrujo', texto: 'Embrujo', mostrar: (c) => <NivelEmbrujo nivel={c.nivelEmbrujo} /> },
  { campo: 'cantidadMitos', texto: 'Mitos', mostrar: (c) => c.cantidadMitos },
  { campo: 'tipoEntidad', texto: 'Entidad', mostrar: (c) => c.tipoEntidad ?? 'Sin registro' },
  { campo: 'region', texto: 'Región', mostrar: (c) => c.region },
];

function leerIds(texto) {
  return [...new Set(String(texto ?? '').split(',').map(Number).filter((id) => Number.isInteger(id) && id > 0))];
}

export default function Comparar() {
  const [parametros, setParametros] = useSearchParams();
  const ids = leerIds(parametros.get('ids'));
  const clave = ids.join(',');
  const [resultado, setResultado] = useState({ clave: null, datos: null, error: '' });

  useEffect(() => {
    const lista = leerIds(clave);
    if (lista.length < 2 || lista.length > 3) return undefined;
    let vigente = true;
    productoService.comparar(lista)
      .then((datos) => {
        if (vigente) setResultado({ clave, datos, error: '' });
      })
      .catch((e) => {
        if (vigente) setResultado({ clave, datos: null, error: mensajeDeError(e) });
      });
    return () => {
      vigente = false;
    };
  }, [clave]);

  function quitar(id) {
    setParametros({ ids: ids.filter((otro) => otro !== id).join(',') });
  }

  if (ids.length < 2 || ids.length > 3) {
    return (
      <div className="container py-5 text-center">
        <h1>Comparar casas</h1>
        <p className="text-secondary">Elige entre 2 y 3 casas en el catálogo con la casilla «Comparar».</p>
        <Link to="/productos" className="btn-enlace">Ir al catálogo</Link>
      </div>
    );
  }

  if (resultado.clave !== clave) {
    return <div className="container py-5 placeholder-glow" aria-busy="true"><span className="placeholder col-12"></span></div>;
  }

  if (resultado.error) {
    return <div className="container py-5"><div className="alert alert-danger" role="alert">{resultado.error}</div></div>;
  }

  const { casas, mejores } = resultado.datos;

  return (
    <div className="container py-5">
      <h1 className="mb-2">Comparar casas</h1>
      <p className="text-secondary">★ marca la mejor de cada fila: la más barata, la más grande, la más embrujada…</p>
      <div className="table-responsive">
        <table className="table table-dark tabla-comparar align-middle">
          <thead>
            <tr>
              <th scope="col"><span className="visually-hidden">Atributo</span></th>
              {casas.map((casa) => (
                <th scope="col" key={casa.idProducto}>
                  <img src={casa.imagenPrincipal ?? IMAGEN_RESPALDO} alt="" />
                  <Link to={`/producto/${casa.idProducto}`} className="d-block mt-2">{casa.titulo}</Link>
                  <EstadoCasa estado={casa.estado} />
                  {casas.length > 2 && (
                    <button type="button" className="btn btn-link btn-sm p-0 d-block" onClick={() => quitar(casa.idProducto)}>Quitar</button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FILAS.map((fila) => (
              <tr key={fila.campo}>
                <th scope="row">{fila.texto}</th>
                {casas.map((casa) => {
                  const esMejor = mejores[fila.campo]?.includes(casa.idProducto);
                  return (
                    <td key={casa.idProducto} className={esMejor ? 'mejor' : ''}>
                      {fila.mostrar(casa)} {esMejor && <span aria-label="mejor opción">★</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link to="/productos" className="btn-enlace chico secundario">Volver al catálogo</Link>
    </div>
  );
}
