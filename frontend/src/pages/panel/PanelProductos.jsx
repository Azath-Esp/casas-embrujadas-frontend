import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import EstadoCasa from '../../components/EstadoCasa';
import { IMAGEN_RESPALDO } from '../../components/TarjetaProducto';
import { useAuth } from '../../context/AuthContext';
import { mensajeDeError } from '../../services/api';
import { productoService } from '../../services/productoService';
import { formatearPrecio } from '../../utils/formato';

export default function PanelProductos() {
  const { tieneRol } = useAuth();
  const esAdmin = tieneRol('ADMIN');
  const ubicacion = useLocation();
  const [parametros, setParametros] = useSearchParams();
  const [resultado, setResultado] = useState({ clave: null, datos: null, error: '' });
  const [aviso, setAviso] = useState(ubicacion.state?.mensaje ? { tipo: 'success', texto: ubicacion.state.mensaje } : null);
  const [version, setVersion] = useState(0);
  const clave = `${parametros.toString()}|${version}`;

  useEffect(() => {
    let vigente = true;
    const filtros = Object.fromEntries(new URLSearchParams(clave.split('|')[0]));
    productoService.listar({ ...filtros, incluirInactivas: true, tamano: 15 })
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

  function buscar(e) {
    e.preventDefault();
    const formulario = new FormData(e.currentTarget);
    const nuevos = {};
    ['q', 'estado'].forEach((campo) => {
      const valor = String(formulario.get(campo) ?? '').trim();
      if (valor) nuevos[campo] = valor;
    });
    setParametros(nuevos);
  }

  async function eliminar(casa) {
    if (!window.confirm(`¿Eliminar «${casa.titulo}»? Si tiene ventas quedará INACTIVA en vez de borrarse.`)) return;
    try {
      await productoService.eliminar(casa.idProducto);
      setAviso({ tipo: 'success', texto: `«${casa.titulo}» se eliminó o quedó inactiva.` });
      setVersion((v) => v + 1);
    } catch (e) {
      setAviso({ tipo: 'danger', texto: mensajeDeError(e) });
    }
  }

  function irAPagina(pagina) {
    const nuevos = new URLSearchParams(parametros);
    nuevos.set('pagina', pagina);
    setParametros(nuevos);
  }

  const cargando = resultado.clave !== clave;
  const datos = resultado.datos;

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h2 mb-0">Casas</h1>
        {esAdmin && <Link to="/panel/productos/nuevo" className="btn btn-warning">+ Nueva casa</Link>}
      </div>
      {!esAdmin && <p className="text-secondary">Vista de consulta: los cambios los hace un administrador.</p>}
      {aviso && <div className={`alert alert-${aviso.tipo}`} role="status">{aviso.texto}</div>}

      <form key={parametros.toString()} className="row g-2 align-items-end mb-3" onSubmit={buscar} role="search">
        <div className="col-12 col-md-5">
          <label htmlFor="q" className="form-label small">Buscar</label>
          <input id="q" name="q" className="form-control" defaultValue={parametros.get('q') ?? ''} />
        </div>
        <div className="col-8 col-md-3">
          <label htmlFor="estado" className="form-label small">Estado</label>
          <select id="estado" name="estado" className="form-select" defaultValue={parametros.get('estado') ?? ''}>
            <option value="">Todos</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="RESERVADA">Reservada</option>
            <option value="VENDIDA">Vendida</option>
            <option value="INACTIVA">Inactiva</option>
          </select>
        </div>
        <div className="col-4 col-md-2">
          <button type="submit" className="btn btn-outline-light w-100">Filtrar</button>
        </div>
      </form>

      {resultado.error && !cargando && <div className="alert alert-danger" role="alert">{resultado.error}</div>}
      {cargando && <p className="placeholder-glow" aria-busy="true"><span className="placeholder col-12"></span></p>}

      {!cargando && datos && (
        <>
          <p className="small text-secondary">{datos.totalElementos} casas</p>
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle tabla-panel">
              <thead>
                <tr>
                  <th scope="col"><span className="visually-hidden">Foto</span></th>
                  <th scope="col">Casa</th>
                  <th scope="col">Ubicación</th>
                  <th scope="col" className="text-end">Precio</th>
                  <th scope="col">Estado</th>
                  <th scope="col"><span className="visually-hidden">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {datos.contenido.map((casa) => (
                  <tr key={casa.idProducto}>
                    <td><img src={casa.imagenPrincipal ?? IMAGEN_RESPALDO} alt="" className="miniatura-panel" /></td>
                    <td>{casa.titulo}<br /><small className="text-secondary">#{casa.idProducto} · embrujo {casa.nivelEmbrujo}/5</small></td>
                    <td>{casa.comuna}<br /><small className="text-secondary">{casa.region}</small></td>
                    <td className="text-end">{formatearPrecio(casa.precio)}</td>
                    <td><EstadoCasa estado={casa.estado} /></td>
                    <td className="text-end text-nowrap">
                      <Link to={`/producto/${casa.idProducto}`} className="btn btn-outline-light btn-sm me-1">Ver</Link>
                      {esAdmin && (
                        <>
                          <Link to={`/panel/productos/${casa.idProducto}`} className="btn btn-warning btn-sm me-1">Editar</Link>
                          <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => eliminar(casa)}>Eliminar</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {datos.totalPaginas > 1 && (
            <nav className="d-flex justify-content-center align-items-center gap-3" aria-label="Páginas">
              <button type="button" className="btn btn-outline-light btn-sm" disabled={datos.pagina === 0} onClick={() => irAPagina(datos.pagina - 1)}>← Anterior</button>
              <span>Página {datos.pagina + 1} de {datos.totalPaginas}</span>
              <button type="button" className="btn btn-outline-light btn-sm" disabled={datos.pagina + 1 >= datos.totalPaginas} onClick={() => irAPagina(datos.pagina + 1)}>Siguiente →</button>
            </nav>
          )}
        </>
      )}
    </>
  );
}
