import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BotonFavorito from '../components/BotonFavorito';
import CuentaRegresiva from '../components/CuentaRegresiva';
import EstadoCasa from '../components/EstadoCasa';
import NivelEmbrujo from '../components/NivelEmbrujo';
import { IMAGEN_RESPALDO } from '../components/TarjetaProducto';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { useFavoritos } from '../hooks/useFavoritos';
import { mensajeDeError } from '../services/api';
import { productoService } from '../services/productoService';
import { reservaService } from '../services/reservaService';
import { sePuedeComprar } from '../utils/carrito';
import { formatearFecha, formatearFechaHora, formatearPrecio } from '../utils/formato';

function FichaCasa({ id }) {
  const { estaAutenticado, tieneRol } = useAuth();
  const { agregar, contiene } = useCarrito();
  const favoritos = useFavoritos();
  const [datos, setDatos] = useState({ casa: null, error: '', noExiste: false });
  const [reservas, setReservas] = useState([]);
  const [imagenActiva, setImagenActiva] = useState(0);
  const [aviso, setAviso] = useState(null);
  const [version, setVersion] = useState(0);
  const [trabajando, setTrabajando] = useState(false);

  const esCliente = tieneRol('CLIENTE');
  const puedeComprar = !estaAutenticado || esCliente;
  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let vigente = true;
    productoService.obtenerDetalle(id)
      .then((casa) => {
        if (vigente) setDatos({ casa, error: '', noExiste: false });
      })
      .catch((e) => {
        if (vigente) setDatos({ casa: null, error: mensajeDeError(e), noExiste: e.response?.status === 404 });
      });
    return () => {
      vigente = false;
    };
  }, [id, version]);

  useEffect(() => {
    if (!esCliente) return undefined;
    let vigente = true;
    reservaService.misReservas()
      .then((lista) => {
        if (vigente) setReservas(lista);
      })
      .catch(() => {
        if (vigente) setReservas([]);
      });
    return () => {
      vigente = false;
    };
  }, [esCliente, version]);

  const { casa } = datos;
  const reservasActivas = esCliente ? reservas.filter((r) => r.estado === 'ACTIVA') : [];
  const miReserva = casa ? reservasActivas.find((r) => r.idProducto === casa.idProducto) : null;

  async function reservar() {
    setTrabajando(true);
    try {
      await reservaService.reservar(casa.idProducto);
      setAviso({ tipo: 'success', texto: 'Casa reservada por 24 horas. Nadie más puede comprarla mientras tanto.' });
      recargar();
    } catch (e) {
      setAviso({ tipo: 'danger', texto: mensajeDeError(e) });
    } finally {
      setTrabajando(false);
    }
  }

  async function cancelarReserva() {
    setTrabajando(true);
    try {
      await reservaService.cancelar(miReserva.idReserva);
      setAviso({ tipo: 'info', texto: 'Cancelaste la reserva. La casa vuelve a estar disponible.' });
      recargar();
    } catch (e) {
      setAviso({ tipo: 'danger', texto: mensajeDeError(e) });
    } finally {
      setTrabajando(false);
    }
  }

  if (datos.noExiste) {
    return (
      <div className="container py-5 text-center">
        <h1>Propiedad no encontrada 👻</h1>
        <p className="text-secondary">Puede que nunca haya existido... o que ya no quiera ser encontrada.</p>
        <Link to="/productos" className="btn-enlace">Volver a propiedades</Link>
      </div>
    );
  }

  if (datos.error) {
    return <div className="container py-5"><div className="alert alert-danger" role="alert">{datos.error}</div></div>;
  }

  if (!casa) {
    return (
      <div className="container py-5 placeholder-glow" aria-busy="true">
        <span className="placeholder col-12 detalle-imagen mb-3"></span>
        <span className="placeholder col-6"></span>
      </div>
    );
  }

  const imagenes = [...casa.imagenes].sort((a, b) => a.orden - b.orden);
  const imagen = imagenes[imagenActiva];

  return (
    <div className="container py-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/productos">Propiedades</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{casa.titulo}</li>
        </ol>
      </nav>

      <div className="row g-4 g-lg-5">
        <div className="col-12 col-lg-7">
          <img src={imagen?.url ?? IMAGEN_RESPALDO} alt={casa.titulo} className="detalle-imagen mb-2" />
          {imagen && (
            <p className="credito-foto">
              Foto: {imagen.autor} · {imagen.licencia}
              {imagen.urlFuente && <> · <a href={imagen.urlFuente} target="_blank" rel="noreferrer">ver fuente</a></>}
            </p>
          )}
          {imagenes.length > 1 && (
            <div className="d-flex flex-wrap gap-2 mb-4">
              {imagenes.map((img, i) => (
                <button key={img.idImagen} type="button" className={`detalle-miniatura ${i === imagenActiva ? 'activa' : ''}`}
                  onClick={() => setImagenActiva(i)} aria-label={`Ver imagen ${i + 1}`}>
                  <img src={img.url} alt="" />
                </button>
              ))}
            </div>
          )}

          {casa.fichaParanormal && (
            <section className="mb-4">
              <h2 className="h4">Ficha paranormal</h2>
              <dl className="ficha">
                <dt>Entidad</dt>
                <dd>{casa.fichaParanormal.tipoEntidad}</dd>
                <dt>Actividad</dt>
                <dd>{casa.fichaParanormal.horarioActividad}</dd>
                <dt>Fenómenos</dt>
                <dd>{casa.fichaParanormal.fenomenosReportados}</dd>
                {casa.fichaParanormal.ultimoAvistamiento && (
                  <>
                    <dt>Último avistamiento</dt>
                    <dd>{formatearFecha(casa.fichaParanormal.ultimoAvistamiento)}</dd>
                  </>
                )}
              </dl>
            </section>
          )}

          {casa.mitos.length > 0 && (
            <section>
              <h2 className="h4">Mitos y leyendas</h2>
              {casa.mitos.map((mito) => (
                <article className="mito" key={mito.idMito}>
                  <h3 className="h5">{mito.titulo} {mito.anioOrigen && <small className="text-secondary">({mito.anioOrigen})</small>}</h3>
                  <p className="mb-1">{mito.relato}</p>
                  {mito.fuente && <a className="small" href={mito.fuente} target="_blank" rel="noreferrer">Fuente</a>}
                </article>
              ))}
            </section>
          )}
        </div>

        <div className="col-12 col-lg-5">
          <div className="d-flex align-items-start justify-content-between gap-2">
            <h1 className="display-6 mb-2">{casa.titulo}</h1>
            {favoritos.habilitado && (
              <BotonFavorito activo={favoritos.esFavorito(casa.idProducto)} nombre={casa.titulo}
                onClick={() => favoritos.alternar(casa.idProducto)} />
            )}
          </div>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <EstadoCasa estado={casa.estado} />
            {casa.categorias.map((c) => <span key={c.idCategoria} className="badge text-bg-dark border">{c.nombre}</span>)}
          </div>
          <p>{casa.descripcion}</p>

          <dl className="ficha mb-3">
            <dt>Dirección</dt>
            <dd>{casa.direccion}, {casa.comuna}, {casa.region}</dd>
            <dt>Superficie</dt>
            <dd>{casa.metrosCuadrados} m²</dd>
            <dt>Dormitorios</dt>
            <dd>{casa.dormitorios}</dd>
            <dt>Baños</dt>
            <dd>{casa.banos}</dd>
            <dt>Embrujo</dt>
            <dd><NivelEmbrujo nivel={casa.nivelEmbrujo} /></dd>
            <dt>Precio</dt>
            <dd className="precio-destacado">{formatearPrecio(casa.precio)} <small>+ IVA</small></dd>
          </dl>

          {aviso && <div className={`alert alert-${aviso.tipo}`} role="status">{aviso.texto}</div>}
          {favoritos.error && <div className="alert alert-warning" role="alert">{favoritos.error}</div>}

          {miReserva && (
            <div className="reserva-activa mb-3">
              <p className="mb-1">Reservada para ti. Tiempo restante:</p>
              <CuentaRegresiva key={miReserva.fechaExpiracion} hasta={miReserva.fechaExpiracion} onTerminar={recargar} />
              <p className="small text-secondary mb-2">Vence el {formatearFechaHora(miReserva.fechaExpiracion)}.</p>
              <button type="button" className="btn btn-outline-light btn-sm" onClick={cancelarReserva} disabled={trabajando}>Cancelar reserva</button>
            </div>
          )}

          <div className="d-flex flex-wrap gap-2 mb-3">
            {puedeComprar && sePuedeComprar(casa, reservasActivas) && (
              contiene(casa.idProducto)
                ? <Link to="/carrito" className="btn btn-warning">En el carrito ✔ Ver carrito</Link>
                : <button type="button" className="btn btn-warning" onClick={() => agregar(casa.idProducto)}>Añadir al carrito</button>
            )}
            {esCliente && casa.estado === 'DISPONIBLE' && (
              <button type="button" className="btn btn-outline-warning" onClick={reservar} disabled={trabajando}>Reservar 24 horas</button>
            )}
            {!estaAutenticado && casa.estado === 'DISPONIBLE' && (
              <Link to="/login" state={{ desde: `/producto/${id}`, mensaje: 'Inicia sesión para reservar esta casa.' }}
                className="btn btn-outline-warning">Inicia sesión para reservar</Link>
            )}
          </div>
          {casa.estado === 'RESERVADA' && !miReserva && (
            <p className="text-secondary">Otro cliente la tiene reservada. Si no la compra en 24 horas, vuelve a estar disponible.</p>
          )}
          {casa.estado === 'VENDIDA' && <p className="text-secondary">Esta casa ya tiene nuevos dueños… vivos o no.</p>}

          <Link to="/productos" className="btn-enlace chico secundario">Volver a propiedades</Link>
        </div>
      </div>
    </div>
  );
}

export default function Detalle() {
  const { id } = useParams();
  return <FichaCasa key={id} id={id} />;
}
