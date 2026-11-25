import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BotonPdf from '../components/BotonPdf';
import EstadoCasa from '../components/EstadoCasa';
import { IMAGEN_RESPALDO } from '../components/TarjetaProducto';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { mensajeDeError } from '../services/api';
import { boletaService } from '../services/boletaService';
import { productoService } from '../services/productoService';
import { reservaService } from '../services/reservaService';
import { calcularResumen, sePuedeComprar } from '../utils/carrito';
import { formatearPrecio } from '../utils/formato';

export default function Carrito() {
  const { carrito, quitar, vaciar } = useCarrito();
  const { estaAutenticado, tieneRol } = useAuth();
  const [casas, setCasas] = useState({ clave: null, lista: [] });
  const [reservas, setReservas] = useState([]);
  const [compra, setCompra] = useState(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [version, setVersion] = useState(0);

  const esCliente = tieneRol('CLIENTE');
  const clave = `${carrito.join(',')}|${version}`;

  useEffect(() => {
    if (carrito.length === 0) return undefined;
    let vigente = true;
    Promise.allSettled(carrito.map((id) => productoService.obtener(id))).then((resultados) => {
      if (!vigente) return;
      const lista = [];
      resultados.forEach((resultado, i) => {
        if (resultado.status === 'fulfilled') lista.push(resultado.value);
        else if (resultado.reason?.response?.status === 404) quitar(carrito[i]);
      });
      setCasas({ clave: `${carrito.join(',')}|${version}`, lista });
    });
    return () => {
      vigente = false;
    };
  }, [carrito, quitar, version]);

  useEffect(() => {
    if (!esCliente) return undefined;
    let vigente = true;
    reservaService.misReservas()
      .then((lista) => {
        if (vigente) setReservas(lista.filter((r) => r.estado === 'ACTIVA'));
      })
      .catch(() => {
        if (vigente) setReservas([]);
      });
    return () => {
      vigente = false;
    };
  }, [esCliente, version]);

  async function confirmarCompra(comprables) {
    setEnviando(true);
    setError('');
    try {
      const boleta = await boletaService.comprar(comprables.map((casa) => casa.idProducto));
      setCompra(boleta);
      vaciar();
    } catch (e) {
      setError(mensajeDeError(e));
      setVersion((v) => v + 1);
    } finally {
      setEnviando(false);
    }
  }

  if (compra) {
    return (
      <div className="container py-5 text-center">
        <h1>¡Compra confirmada! 🕯️</h1>
        <p className="lead">Boleta N° {compra.numero} por {formatearPrecio(compra.total)}</p>
        <ul className="list-unstyled text-secondary mb-4">
          {compra.detalles.map((detalle) => <li key={detalle.idProducto}>{detalle.productoTitulo}</li>)}
        </ul>
        <div className="d-flex justify-content-center flex-wrap gap-2">
          <BotonPdf idBoleta={compra.idBoleta} className="btn btn-warning" />
          <Link to="/mis-compras" className="btn btn-outline-light">Ver mis compras</Link>
        </div>
      </div>
    );
  }

  if (carrito.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h1>Tu carrito está vacío 🕸️</h1>
        <p className="text-secondary mb-4">Todavía no eliges tu próxima casa embrujada.</p>
        <Link to="/productos" className="btn-enlace">Ver propiedades</Link>
      </div>
    );
  }

  if (casas.clave !== clave) {
    return (
      <div className="container py-5 placeholder-glow" aria-busy="true">
        <h1 className="mb-4">Tu carrito</h1>
        <span className="placeholder col-12 mb-2"></span>
        <span className="placeholder col-8"></span>
      </div>
    );
  }

  const comprables = casas.lista.filter((casa) => sePuedeComprar(casa, reservas));
  const noDisponibles = casas.lista.filter((casa) => !sePuedeComprar(casa, reservas));
  const { neto, iva, total } = calcularResumen(comprables);

  return (
    <div className="container py-5">
      <h1 className="mb-4">Tu carrito</h1>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {noDisponibles.length > 0 && (
        <div className="alert alert-warning" role="status">
          Algunas casas ya no se pueden comprar. Quítalas del carrito para continuar.
        </div>
      )}

      <div className="row g-4 g-lg-5">
        <div className="col-12 col-lg-8">
          {casas.lista.map((casa) => (
            <div className={`item-carrito d-flex align-items-center gap-3 ${sePuedeComprar(casa, reservas) ? '' : 'no-disponible'}`} key={casa.idProducto}>
              <img src={casa.imagenPrincipal ?? IMAGEN_RESPALDO} alt="" />
              <div className="flex-grow-1">
                <Link to={`/producto/${casa.idProducto}`} className="item-carrito__nombre">{casa.titulo}</Link>
                <p className="mb-0 small text-secondary">{casa.comuna}, {casa.region}</p>
                <EstadoCasa estado={casa.estado} />
              </div>
              <p className="mb-0 text-end item-carrito__subtotal">{formatearPrecio(casa.precio)}</p>
              <button type="button" className="btn btn-outline-light btn-sm" onClick={() => quitar(casa.idProducto)}
                aria-label={`Quitar ${casa.titulo} del carrito`}>Quitar</button>
            </div>
          ))}
          <p className="small text-secondary mt-3">Cada casa es única: se compra una sola vez.</p>
          <button type="button" className="btn-enlace chico secundario" onClick={vaciar}>Vaciar carrito</button>
        </div>

        <div className="col-12 col-lg-4">
          <aside className="resumen-carrito">
            <h2 className="h4 mb-3">Resumen</h2>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-secondary">Neto ({comprables.length} {comprables.length === 1 ? 'casa' : 'casas'})</span>
              <span>{formatearPrecio(neto)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-secondary">IVA 19 %</span>
              <span>{formatearPrecio(iva)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-secondary">Exorcismo</span>
              <span>Incluido</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between align-items-baseline mb-4">
              <span>Total</span>
              <span className="precio-destacado">{formatearPrecio(total)}</span>
            </div>

            {!estaAutenticado && (
              <Link to="/login" state={{ desde: '/carrito', mensaje: 'Inicia sesión para finalizar la compra.' }}
                className="btn btn-warning w-100">Inicia sesión para comprar</Link>
            )}
            {esCliente && (
              <button type="button" className="btn btn-warning w-100" onClick={() => confirmarCompra(comprables)}
                disabled={enviando || comprables.length === 0 || noDisponibles.length > 0}>
                {enviando ? 'Procesando…' : 'Confirmar compra'}
              </button>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
