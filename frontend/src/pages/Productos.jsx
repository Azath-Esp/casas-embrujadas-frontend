import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TarjetaProducto from '../components/TarjetaProducto';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { useFavoritos } from '../hooks/useFavoritos';
import { mensajeDeError } from '../services/api';
import { categoriaService } from '../services/categoriaService';
import { productoService } from '../services/productoService';
import { ubicacionService } from '../services/ubicacionService';

const TAMANO_PAGINA = 9;
const MAXIMO_COMPARAR = 3;
const CAMPOS = ['q', 'categoria', 'region', 'precioMax', 'nivelEmbrujo', 'estado'];

export default function Productos() {
  const [parametros, setParametros] = useSearchParams();
  const navigate = useNavigate();
  const { estaAutenticado, tieneRol } = useAuth();
  const { agregar, contiene } = useCarrito();
  const favoritos = useFavoritos();
  const [categorias, setCategorias] = useState([]);
  const [regiones, setRegiones] = useState([]);
  const [resultado, setResultado] = useState({ clave: null, datos: null, error: '' });
  const [seleccion, setSeleccion] = useState([]);

  const clave = parametros.toString();
  const puedeComprar = !estaAutenticado || tieneRol('CLIENTE');
  const cargando = resultado.clave !== clave;

  useEffect(() => {
    categoriaService.listar().then(setCategorias).catch(() => setCategorias([]));
    ubicacionService.listarRegiones().then(setRegiones).catch(() => setRegiones([]));
  }, []);

  useEffect(() => {
    let vigente = true;
    const filtros = Object.fromEntries(new URLSearchParams(clave));
    productoService.listar({ ...filtros, tamano: TAMANO_PAGINA })
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

  function filtrar(e) {
    e.preventDefault();
    const formulario = new FormData(e.currentTarget);
    const nuevos = {};
    CAMPOS.forEach((campo) => {
      const valor = String(formulario.get(campo) ?? '').trim();
      if (valor) nuevos[campo] = valor;
    });
    setParametros(nuevos);
  }

  function irAPagina(pagina) {
    const nuevos = new URLSearchParams(parametros);
    nuevos.set('pagina', pagina);
    setParametros(nuevos);
    window.scrollTo(0, 0);
  }

  function alternarComparar(id) {
    setSeleccion((actual) => {
      if (actual.includes(id)) return actual.filter((otro) => otro !== id);
      return actual.length < MAXIMO_COMPARAR ? [...actual, id] : actual;
    });
  }

  const datos = cargando ? null : resultado.datos;

  return (
    <>
      <section className="cabecera-catalogo py-5">
        <div className="container">
          <h1 className="mb-2">Propiedades</h1>
          <p className="mb-0 text-secondary">
            Casas, palacios y pueblos con historia. Todas con al menos un residente que no figura en la escritura.
          </p>
        </div>
      </section>

      <div className="container py-4">
        <form key={clave} className="filtros row g-2 align-items-end mb-4" onSubmit={filtrar} role="search">
          <div className="col-12 col-md-4 col-lg-3">
            <label htmlFor="q" className="form-label small">Buscar</label>
            <input id="q" name="q" className="form-control" defaultValue={parametros.get('q') ?? ''} placeholder="Nombre o descripción" />
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <label htmlFor="categoria" className="form-label small">Categoría</label>
            <select id="categoria" name="categoria" className="form-select" defaultValue={parametros.get('categoria') ?? ''}>
              <option value="">Todas</option>
              {categorias.map((c) => <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <label htmlFor="region" className="form-label small">Región</label>
            <select id="region" name="region" className="form-select" defaultValue={parametros.get('region') ?? ''}>
              <option value="">Todas</option>
              {regiones.map((r) => <option key={r.idRegion} value={r.idRegion}>{r.nombre}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <label htmlFor="precioMax" className="form-label small">Precio máximo</label>
            <input id="precioMax" name="precioMax" type="number" min="1" step="1000000" className="form-control"
              defaultValue={parametros.get('precioMax') ?? ''} placeholder="Sin límite" />
          </div>
          <div className="col-6 col-md-4 col-lg-1">
            <label htmlFor="nivelEmbrujo" className="form-label small">Embrujo</label>
            <select id="nivelEmbrujo" name="nivelEmbrujo" className="form-select" defaultValue={parametros.get('nivelEmbrujo') ?? ''}>
              <option value="">Todos</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <label htmlFor="estado" className="form-label small">Estado</label>
            <select id="estado" name="estado" className="form-select" defaultValue={parametros.get('estado') ?? ''}>
              <option value="">Todos</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="RESERVADA">Reservada</option>
              <option value="VENDIDA">Vendida</option>
            </select>
          </div>
          <div className="col-12 d-flex gap-2">
            <button type="submit" className="btn btn-warning">Filtrar</button>
            <button type="button" className="btn btn-outline-light" onClick={() => setParametros({})}>Limpiar</button>
          </div>
        </form>

        {favoritos.error && <div className="alert alert-warning" role="alert">{favoritos.error}</div>}
        {resultado.error && !cargando && <div className="alert alert-danger" role="alert">{resultado.error}</div>}

        {cargando && (
          <div className="row g-4" aria-busy="true">
            {Array.from({ length: 6 }, (_, i) => (
              <div className="col-12 col-sm-6 col-lg-4" key={i}>
                <div className="tarjeta-propiedad tarjeta-propiedad--cargando placeholder-glow">
                  <span className="placeholder w-100"></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {datos && datos.contenido.length === 0 && (
          <div className="text-center py-5">
            <h2 className="h4">No encontramos casas con esos filtros 🕸️</h2>
            <button type="button" className="btn btn-outline-light mt-2" onClick={() => setParametros({})}>Ver todas</button>
          </div>
        )}

        {datos && datos.contenido.length > 0 && (
          <>
            <p className="small text-secondary">{datos.totalElementos} casas encontradas</p>
            <div className="row g-4">
              {datos.contenido.map((casa) => (
                <div className="col-12 col-sm-6 col-lg-4" key={casa.idProducto}>
                  <TarjetaProducto
                    casa={casa}
                    onAgregar={puedeComprar ? agregar : undefined}
                    enCarrito={contiene(casa.idProducto)}
                    esFavorito={favoritos.esFavorito(casa.idProducto)}
                    onFavorito={favoritos.habilitado ? favoritos.alternar : undefined}
                    seleccionada={seleccion.includes(casa.idProducto)}
                    onComparar={alternarComparar}
                  />
                </div>
              ))}
            </div>

            {datos.totalPaginas > 1 && (
              <nav className="d-flex justify-content-center align-items-center gap-3 mt-5" aria-label="Páginas del catálogo">
                <button type="button" className="btn btn-outline-light btn-sm" disabled={datos.pagina === 0}
                  onClick={() => irAPagina(datos.pagina - 1)}>← Anterior</button>
                <span>Página {datos.pagina + 1} de {datos.totalPaginas}</span>
                <button type="button" className="btn btn-outline-light btn-sm" disabled={datos.pagina + 1 >= datos.totalPaginas}
                  onClick={() => irAPagina(datos.pagina + 1)}>Siguiente →</button>
              </nav>
            )}
          </>
        )}
      </div>

      {seleccion.length > 0 && (
        <div className="barra-comparar" role="region" aria-label="Casas para comparar">
          <span>{seleccion.length} de {MAXIMO_COMPARAR} casas para comparar</span>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-light btn-sm" onClick={() => setSeleccion([])}>Limpiar</button>
            <button type="button" className="btn btn-warning btn-sm" disabled={seleccion.length < 2}
              onClick={() => navigate(`/comparar?ids=${seleccion.join(',')}`)}>Comparar</button>
          </div>
        </div>
      )}
    </>
  );
}
