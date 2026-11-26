import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BotonPdf from '../components/BotonPdf';
import MenuCuenta from '../components/MenuCuenta';
import { mensajeDeError } from '../services/api';
import { boletaService } from '../services/boletaService';
import { formatearFechaHora, formatearPrecio } from '../utils/formato';

export default function MisCompras() {
  const [estado, setEstado] = useState({ boletas: null, error: '' });

  useEffect(() => {
    boletaService.misBoletas()
      .then((boletas) => setEstado({ boletas, error: '' }))
      .catch((e) => setEstado({ boletas: [], error: mensajeDeError(e) }));
  }, []);

  return (
    <div className="container py-5">
      <h1 className="mb-4">Mis compras</h1>
      <MenuCuenta />
      {estado.error && <div className="alert alert-danger" role="alert">{estado.error}</div>}
      {!estado.boletas && <p className="placeholder-glow" aria-busy="true"><span className="placeholder col-8"></span></p>}
      {estado.boletas?.length === 0 && !estado.error && (
        <p className="text-secondary">Todavía no compras ninguna casa. <Link to="/productos">Ver propiedades</Link></p>
      )}
      {estado.boletas?.map((boleta) => (
        <article className="boleta card p-3 mb-3" key={boleta.idBoleta}>
          <div className="d-flex flex-wrap justify-content-between gap-2">
            <h2 className="h5 mb-0">Boleta N° {boleta.numero}</h2>
            <span className={`estado-boleta estado-boleta--${boleta.estado.toLowerCase()}`}>{boleta.estado === 'PAGADA' ? 'Pagada' : 'Anulada'}</span>
          </div>
          <p className="small text-secondary mb-2">{formatearFechaHora(boleta.fecha)}</p>
          <ul className="mb-2">
            {boleta.detalles.map((detalle) => (
              <li key={detalle.idProducto}>{detalle.productoTitulo}: {formatearPrecio(detalle.subtotal)}</li>
            ))}
          </ul>
          <p className="mb-2">
            Neto {formatearPrecio(boleta.neto)} · IVA {formatearPrecio(boleta.iva)} · <strong>Total {formatearPrecio(boleta.total)}</strong>
          </p>
          <div><BotonPdf idBoleta={boleta.idBoleta} /></div>
        </article>
      ))}
    </div>
  );
}
