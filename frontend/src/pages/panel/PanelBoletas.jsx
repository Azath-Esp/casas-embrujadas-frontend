import { Fragment, useEffect, useState } from 'react';
import BotonPdf from '../../components/BotonPdf';
import { useAuth } from '../../context/AuthContext';
import { mensajeDeError } from '../../services/api';
import { boletaService } from '../../services/boletaService';
import { formatearFechaHora, formatearPrecio } from '../../utils/formato';
import { formatearRun } from '../../utils/run';

export default function PanelBoletas() {
  const { tieneRol } = useAuth();
  const esAdmin = tieneRol('ADMIN');
  const [boletas, setBoletas] = useState(null);
  const [filtro, setFiltro] = useState({ texto: '', estado: '' });
  const [abierta, setAbierta] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    boletaService.listar()
      .then(setBoletas)
      .catch((e) => setAviso({ tipo: 'danger', texto: mensajeDeError(e) }));
  }, [version]);

  async function anular(boleta) {
    if (!window.confirm(`¿Anular la boleta N° ${boleta.numero}? Las casas vuelven a quedar disponibles y no se puede deshacer.`)) return;
    try {
      await boletaService.cambiarEstado(boleta.idBoleta, 'ANULADA');
      setAviso({ tipo: 'success', texto: `Boleta N° ${boleta.numero} anulada.` });
      setVersion((v) => v + 1);
    } catch (e) {
      setAviso({ tipo: 'danger', texto: mensajeDeError(e) });
    }
  }

  const texto = filtro.texto.trim().toLowerCase();
  const visibles = (boletas ?? []).filter((b) => (!filtro.estado || b.estado === filtro.estado)
    && (!texto || `${b.numero} ${b.clienteNombre} ${b.clienteRun} ${b.clienteCorreo}`.toLowerCase().includes(texto)));
  const totalPagado = visibles.filter((b) => b.estado === 'PAGADA').reduce((suma, b) => suma + Number(b.total), 0);

  return (
    <>
      <h1 className="h2 mb-3">Órdenes</h1>
      {aviso && <div className={`alert alert-${aviso.tipo}`} role="status">{aviso.texto}</div>}
      <div className="row g-2 mb-3 align-items-center">
        <div className="col-12 col-md-6">
          <label htmlFor="buscarBoleta" className="visually-hidden">Buscar orden</label>
          <input id="buscarBoleta" className="form-control" placeholder="N°, cliente, RUN o correo"
            value={filtro.texto} onChange={(e) => setFiltro({ ...filtro, texto: e.target.value })} />
        </div>
        <div className="col-6 col-md-3">
          <label htmlFor="filtroEstadoBoleta" className="visually-hidden">Estado</label>
          <select id="filtroEstadoBoleta" className="form-select" value={filtro.estado} onChange={(e) => setFiltro({ ...filtro, estado: e.target.value })}>
            <option value="">Todas</option>
            <option value="PAGADA">Pagadas</option>
            <option value="ANULADA">Anuladas</option>
          </select>
        </div>
        <div className="col-6 col-md-3 text-end small">Pagado: <strong>{formatearPrecio(totalPagado)}</strong></div>
      </div>

      {!boletas && <p className="placeholder-glow"><span className="placeholder col-12"></span></p>}
      {boletas && (
        <div className="table-responsive">
          <table className="table table-dark align-middle tabla-panel">
            <thead>
              <tr><th scope="col">N°</th><th scope="col">Fecha</th><th scope="col">Cliente</th><th scope="col" className="text-end">Total</th><th scope="col">Estado</th><th scope="col"><span className="visually-hidden">Acciones</span></th></tr>
            </thead>
            <tbody>
              {visibles.map((b) => (
                <Fragment key={b.idBoleta}>
                  <tr>
                    <td>{b.numero}</td>
                    <td className="small text-nowrap">{formatearFechaHora(b.fecha)}</td>
                    <td>{b.clienteNombre}<br /><small className="text-secondary">{formatearRun(b.clienteRun)}</small></td>
                    <td className="text-end">{formatearPrecio(b.total)}</td>
                    <td><span className={`estado-boleta estado-boleta--${b.estado.toLowerCase()}`}>{b.estado === 'PAGADA' ? 'Pagada' : 'Anulada'}</span></td>
                    <td className="text-end text-nowrap">
                      <button type="button" className="btn btn-outline-light btn-sm me-1" aria-expanded={abierta === b.idBoleta}
                        onClick={() => setAbierta(abierta === b.idBoleta ? null : b.idBoleta)}>Detalle</button>
                      {esAdmin && b.estado === 'PAGADA' && (
                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => anular(b)}>Anular</button>
                      )}
                    </td>
                  </tr>
                  {abierta === b.idBoleta && (
                    <tr className="fila-detalle">
                      <td colSpan={6}>
                        <ul className="mb-2">
                          {b.detalles.map((d) => <li key={d.idProducto}>{d.productoTitulo}: {formatearPrecio(d.subtotal)}</li>)}
                        </ul>
                        <p className="small mb-2">{b.clienteCorreo} · Neto {formatearPrecio(b.neto)} · IVA {formatearPrecio(b.iva)}</p>
                        <BotonPdf idBoleta={b.idBoleta} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          {visibles.length === 0 && <p className="text-secondary">No hay órdenes con ese filtro.</p>}
        </div>
      )}
    </>
  );
}
