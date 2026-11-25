import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import EstadoCasa from '../components/EstadoCasa';
import MapaDiferido from '../components/MapaDiferido';
import { mensajeDeError } from '../services/api';
import { productoService } from '../services/productoService';
import { ubicacionService } from '../services/ubicacionService';
import { formatearPrecio } from '../utils/formato';
import { clasePin, conCoordenadas, contarPorEstado, ESTADOS_MAPA } from '../utils/mapa';

export default function Mapa() {
  const [parametros, setParametros] = useSearchParams();
  const region = parametros.get('region') ?? '';
  const [regiones, setRegiones] = useState([]);
  const [resultado, setResultado] = useState({ region: null, casas: [], error: '' });

  useEffect(() => {
    ubicacionService.listarRegiones().then(setRegiones).catch(() => setRegiones([]));
  }, []);

  useEffect(() => {
    let vigente = true;
    productoService.mapa(region || undefined)
      .then((lista) => {
        if (vigente) setResultado({ region, casas: conCoordenadas(lista), error: '' });
      })
      .catch((e) => {
        if (vigente) setResultado({ region, casas: [], error: mensajeDeError(e) });
      });
    return () => {
      vigente = false;
    };
  }, [region]);

  const cargando = resultado.region !== region;
  const casas = resultado.casas;
  const conteo = useMemo(() => contarPorEstado(casas), [casas]);

  function cambiarRegion(e) {
    setParametros(e.target.value ? { region: e.target.value } : {});
  }

  return (
    <div className="container py-5">
      <h1 className="mb-2">Mapa de casas</h1>
      <p className="text-secondary">Cada pin es una casa. El color indica si todavía puedes tenerla.</p>

      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-3">
        <div>
          <label htmlFor="region" className="form-label small">Región</label>
          <select id="region" className="form-select" value={region} onChange={cambiarRegion}>
            <option value="">Todo Chile</option>
            {regiones.map((r) => <option key={r.idRegion} value={r.idRegion}>{r.nombre}</option>)}
          </select>
        </div>
        <ul className="leyenda-mapa" aria-label="Leyenda del mapa">
          {ESTADOS_MAPA.map(({ estado, texto }) => (
            <li key={estado}>
              <span className={clasePin(estado)} aria-hidden="true"><span className="pin__punta"></span></span>
              {texto} ({conteo[estado] ?? 0})
            </li>
          ))}
        </ul>
      </div>

      {resultado.error && !cargando && <div className="alert alert-danger" role="alert">{resultado.error}</div>}
      {!cargando && !resultado.error && casas.length === 0 && (
        <div className="alert alert-info" role="status">No hay casas publicadas en esta región.</div>
      )}

      <div className={`mapa-contenedor ${cargando ? 'cargando' : ''}`} aria-busy={cargando}>
        <MapaDiferido casas={casas} />
      </div>

      {casas.length > 0 && (
        <details className="lista-mapa mt-4">
          <summary>Ver las {casas.length} casas como lista</summary>
          <ul className="list-unstyled mt-3">
            {casas.map((casa) => (
              <li key={casa.idProducto} className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <Link to={`/producto/${casa.idProducto}`}>{casa.titulo}</Link>
                <EstadoCasa estado={casa.estado} />
                <span className="text-secondary small">{formatearPrecio(casa.precio)} + IVA</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
