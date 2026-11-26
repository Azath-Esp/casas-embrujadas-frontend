import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CuentaRegresiva from '../components/CuentaRegresiva';
import MenuCuenta from '../components/MenuCuenta';
import { useCarrito } from '../context/CarritoContext';
import { mensajeDeError } from '../services/api';
import { reservaService } from '../services/reservaService';
import { formatearFechaHora } from '../utils/formato';

const TEXTOS = { ACTIVA: 'Activa', EXPIRADA: 'Expirada', CANCELADA: 'Cancelada', CONVERTIDA: 'Comprada' };

export default function MisReservas() {
  const { agregar, contiene } = useCarrito();
  const [reservas, setReservas] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [version, setVersion] = useState(0);
  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let vigente = true;
    reservaService.misReservas()
      .then((lista) => {
        if (vigente) setReservas(lista);
      })
      .catch((e) => {
        if (vigente) {
          setReservas([]);
          setAviso({ tipo: 'danger', texto: mensajeDeError(e) });
        }
      });
    return () => {
      vigente = false;
    };
  }, [version]);

  async function cancelar(reserva) {
    try {
      await reservaService.cancelar(reserva.idReserva);
      setAviso({ tipo: 'info', texto: `Cancelaste la reserva de ${reserva.productoTitulo}.` });
      recargar();
    } catch (e) {
      setAviso({ tipo: 'danger', texto: mensajeDeError(e) });
    }
  }

  const activas = reservas?.filter((r) => r.estado === 'ACTIVA') ?? [];
  const historial = reservas?.filter((r) => r.estado !== 'ACTIVA') ?? [];

  return (
    <div className="container py-5">
      <h1 className="mb-4">Mis reservas</h1>
      <MenuCuenta />
      {aviso && <div className={`alert alert-${aviso.tipo}`} role="status">{aviso.texto}</div>}
      {!reservas && <p className="placeholder-glow" aria-busy="true"><span className="placeholder col-8"></span></p>}

      {reservas && (
        <>
          <h2 className="h4">Activas ({activas.length} de 2)</h2>
          {activas.length === 0 && <p className="text-secondary">No tienes reservas activas.</p>}
          <div className="row g-3 mb-5">
            {activas.map((reserva) => (
              <div className="col-12 col-md-6" key={reserva.idReserva}>
                <article className="reserva-activa h-100">
                  <h3 className="h5"><Link to={`/producto/${reserva.idProducto}`}>{reserva.productoTitulo}</Link></h3>
                  <CuentaRegresiva key={reserva.fechaExpiracion} hasta={reserva.fechaExpiracion} onTerminar={recargar} />
                  <p className="small text-secondary">Vence el {formatearFechaHora(reserva.fechaExpiracion)}</p>
                  <div className="d-flex flex-wrap gap-2">
                    {contiene(reserva.idProducto)
                      ? <Link to="/carrito" className="btn btn-warning btn-sm">Ir al carrito</Link>
                      : <button type="button" className="btn btn-warning btn-sm" onClick={() => agregar(reserva.idProducto)}>Añadir al carrito</button>}
                    <button type="button" className="btn btn-outline-light btn-sm" onClick={() => cancelar(reserva)}>Cancelar</button>
                  </div>
                </article>
              </div>
            ))}
          </div>

          {historial.length > 0 && (
            <>
              <h2 className="h4">Historial</h2>
              <ul className="list-unstyled">
                {historial.map((reserva) => (
                  <li key={reserva.idReserva} className="mb-2">
                    <Link to={`/producto/${reserva.idProducto}`}>{reserva.productoTitulo}</Link>
                    {' · '}{TEXTOS[reserva.estado]}{' · '}
                    <span className="text-secondary small">{formatearFechaHora(reserva.fechaInicio)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
