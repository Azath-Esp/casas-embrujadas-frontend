import { Link, useNavigate } from 'react-router-dom';

export default function NoEncontrada() {
  const navigate = useNavigate();

  return (
    <section className="pagina-error container py-5 text-center">
      <svg className="pagina-error__ilustracion" viewBox="0 0 220 200" aria-hidden="true">
        <path d="M30 180 L30 40 L110 15 L190 40 L190 180 Z" className="ilustracion__muro" />
        <rect x="80" y="80" width="60" height="100" rx="30" className="ilustracion__vano" />
        <path d="M110 180 L110 150" className="ilustracion__mecha" />
        <rect x="102" y="150" width="16" height="30" rx="2" className="ilustracion__vela" />
        <path d="M110 128 c-6 8 -6 14 0 20 c6 -6 6 -12 0 -20z" className="ilustracion__llama" />
        <text x="110" y="70" textAnchor="middle" className="ilustracion__signo">?</text>
      </svg>
      <p className="pagina-error__codigo">404</p>
      <h1>Esta habitación no existe… o no quiere que la encuentres</h1>
      <p className="lead text-secondary mb-4">Revisa la dirección o vuelve a un lugar conocido.</p>
      <div className="d-flex justify-content-center flex-wrap gap-2">
        <button type="button" className="btn btn-outline-light" onClick={() => navigate(-1)}>Volver</button>
        <Link to="/" className="btn btn-warning">Ir al inicio</Link>
      </div>
    </section>
  );
}
