import { useState } from 'react';
import { mensajeDeError } from '../services/api';
import { boletaService } from '../services/boletaService';
import { guardarArchivo } from '../utils/descargas';

export default function BotonPdf({ idBoleta, className = 'btn btn-outline-light btn-sm' }) {
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState('');

  async function descargar() {
    setDescargando(true);
    setError('');
    try {
      const { archivo, nombre } = await boletaService.descargarPdf(idBoleta);
      guardarArchivo(archivo, nombre);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setDescargando(false);
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={descargar} disabled={descargando}>
        {descargando ? 'Preparando PDF…' : 'Descargar boleta (PDF)'}
      </button>
      {error && <p className="small text-danger mt-1 mb-0">{error}</p>}
    </>
  );
}
