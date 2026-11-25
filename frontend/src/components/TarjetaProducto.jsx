import { Link } from 'react-router-dom';
import BotonFavorito from './BotonFavorito';
import EstadoCasa from './EstadoCasa';
import NivelEmbrujo from './NivelEmbrujo';
import { formatearPrecio } from '../utils/formato';

export const IMAGEN_RESPALDO = '/img/hero-mansion.jpg';

export default function TarjetaProducto({ casa, onAgregar, enCarrito = false, esFavorito = false, onFavorito, seleccionada = false, onComparar }) {
  const rutaDetalle = `/producto/${casa.idProducto}`;

  return (
    <article className={`tarjeta-propiedad h-100 ${seleccionada ? 'seleccionada' : ''}`}>
      <div className="tarjeta-propiedad__marco">
        <Link to={rutaDetalle} className="tarjeta-propiedad__imagen">
          <img src={casa.imagenPrincipal ?? IMAGEN_RESPALDO} alt={casa.titulo} loading="lazy" />
          <span className="tarjeta-propiedad__ubicacion">📍 {casa.comuna}, {casa.region}</span>
        </Link>
        <div className="tarjeta-propiedad__etiquetas">
          <EstadoCasa estado={casa.estado} />
          {onFavorito && <BotonFavorito activo={esFavorito} nombre={casa.titulo} onClick={() => onFavorito(casa.idProducto)} />}
        </div>
      </div>

      <div className="p-3 d-flex flex-column flex-grow-1">
        <h3 className="h4 mb-1">{casa.titulo}</h3>
        <NivelEmbrujo nivel={casa.nivelEmbrujo} />
        <p className="precio-tarjeta mt-2 mb-3">{formatearPrecio(casa.precio)} <small>+ IVA</small></p>

        {onComparar && (
          <div className="form-check mb-3">
            <input className="form-check-input" type="checkbox" id={`comparar-${casa.idProducto}`}
              checked={seleccionada} onChange={() => onComparar(casa.idProducto)} />
            <label className="form-check-label small" htmlFor={`comparar-${casa.idProducto}`}>Comparar</label>
          </div>
        )}

        <div className="mt-auto d-flex align-items-center justify-content-between gap-2">
          <Link to={rutaDetalle} className="btn-enlace chico secundario">Ver detalle</Link>
          {onAgregar && casa.estado === 'DISPONIBLE' && (
            <button type="button" className="btn btn-warning btn-sm" disabled={enCarrito} onClick={() => onAgregar(casa.idProducto)}>
              {enCarrito ? 'En el carrito ✔' : 'Añadir al carrito'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
