import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CuentaRegresiva from '../../components/CuentaRegresiva';
import { mensajeDeError } from '../../services/api';
import { reservaService } from '../../services/reservaService';
import { formatearFechaHora } from '../../utils/formato';

const TEXTOS = { ACTIVA: 'Activa', EXPIRADA: 'Expirada', CANCELADA: 'Cancelada', CONVERTIDA: 'Comprada' };

export default function PanelReservas() {
  const [reservas, setReservas] = useState(null);
  const [estado, setEstado] = useState('ACTIVA');
  const [error, setError] = useState('');

  useEffect(() => {
    reservaService.listarTodas()
      .then(setReservas)
      .catch((e) => setError(mensajeDeError(e)));
  }, []);

  const visibles = (reservas ?? []).filter((r) => !estado || r.estado === estado);

  return (
    <>
      <h1 className="h2 mb-3">Reservas</h1>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <div className="mb-3" style={{ maxWidth: '16rem' }}>
        <label htmlFor="filtroReserva" className="form-label small">Estado</label>
        <select id="filtroReserva" className="form-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todas</option>
          {Object.entries(TEXTOS).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
        </select>
      </div>
      {!reservas && !error && <p className="placeholder-glow"><span className="placeholder col-12"></span></p>}
      {reservas && (
        <div className="table-responsive">
          <table className="table table-dark align-middle tabla-panel">
            <thead><tr><th scope="col">Casa</th><th scope="col">Cliente</th><th scope="col">Desde</th><th scope="col">Vence</th><th scope="col">Estado</th></tr></thead>
            <tbody>
              {visibles.map((r) => (
                <tr key={r.idReserva}>
                  <td><Link to={`/producto/${r.idProducto}`}>{r.productoTitulo}</Link></td>
                  <td>{r.usuarioNombre}</td>
                  <td className="small text-nowrap">{formatearFechaHora(r.fechaInicio)}</td>
                  <td className="small text-nowrap">
                    {formatearFechaHora(r.fechaExpiracion)}
                    {r.estado === 'ACTIVA' && <span className="cuenta-regresiva cuenta-regresiva--chica"><CuentaRegresiva hasta={r.fechaExpiracion} /></span>}
                  </td>
                  <td>{TEXTOS[r.estado]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibles.length === 0 && <p className="text-secondary">No hay reservas en ese estado.</p>}
        </div>
      )}
    </>
  );
}
