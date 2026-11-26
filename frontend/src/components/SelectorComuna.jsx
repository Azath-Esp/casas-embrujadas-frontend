import { useEffect, useState } from 'react';
import { ubicacionService } from '../services/ubicacionService';

export default function SelectorComuna({ idRegion, idComuna, onChange, errores = {} }) {
  const [regiones, setRegiones] = useState([]);
  const [cargadas, setCargadas] = useState({ idRegion: '', comunas: [] });
  const [errorCarga, setErrorCarga] = useState('');
  const comunas = idRegion && String(cargadas.idRegion) === String(idRegion) ? cargadas.comunas : [];

  useEffect(() => {
    ubicacionService.listarRegiones()
      .then(setRegiones)
      .catch(() => setErrorCarga('No se pudieron cargar las regiones.'));
  }, []);

  useEffect(() => {
    if (!idRegion) return;
    ubicacionService.listarComunas(idRegion)
      .then((lista) => setCargadas({ idRegion, comunas: lista }))
      .catch(() => setErrorCarga('No se pudieron cargar las comunas.'));
  }, [idRegion]);

  return (
    <div className="row">
      <div className="col-12 col-sm-6 mb-3">
        <label htmlFor="idRegion" className="form-label">Región</label>
        <select id="idRegion" name="idRegion" value={idRegion} onChange={onChange}
          className={`form-select ${errores.idRegion ? 'is-invalid' : ''}`}>
          <option value="">Seleccionar</option>
          {regiones.map((region) => (
            <option key={region.idRegion} value={region.idRegion}>{region.nombre}</option>
          ))}
        </select>
        {errores.idRegion && <div className="invalid-feedback">{errores.idRegion}</div>}
      </div>

      <div className="col-12 col-sm-6 mb-3">
        <label htmlFor="idComuna" className="form-label">Comuna</label>
        <select id="idComuna" name="idComuna" value={idComuna} onChange={onChange} disabled={!idRegion}
          className={`form-select ${errores.idComuna ? 'is-invalid' : ''}`}>
          <option value="">{idRegion ? 'Seleccionar' : 'Elija una región'}</option>
          {comunas.map((comuna) => (
            <option key={comuna.idComuna} value={comuna.idComuna}>{comuna.nombre}</option>
          ))}
        </select>
        {errores.idComuna && <div className="invalid-feedback">{errores.idComuna}</div>}
      </div>

      {errorCarga && <p className="small text-danger mt-n2">{errorCarga}</p>}
    </div>
  );
}
