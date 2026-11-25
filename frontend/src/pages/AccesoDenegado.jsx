import { Link, useNavigate } from 'react-router-dom';

export default function AccesoDenegado() {
  const navigate = useNavigate();

  return (
    <section className="pagina-error container py-5 text-center">
      <svg className="pagina-error__ilustracion" viewBox="0 0 220 200" aria-hidden="true">
        <rect x="55" y="30" width="110" height="160" rx="6" className="ilustracion__puerta" />
        <rect x="68" y="44" width="84" height="64" rx="4" className="ilustracion__panel" />
        <rect x="68" y="118" width="84" height="60" rx="4" className="ilustracion__panel" />
        <circle cx="145" cy="114" r="5" className="ilustracion__perilla" />
        <path d="M40 92 L180 132 M40 132 L180 92" className="ilustracion__cadena" />
        <rect x="96" y="100" width="28" height="26" rx="4" className="ilustracion__candado" />
        <path d="M102 100 v-8 a8 8 0 0 1 16 0 v8" className="ilustracion__arco" />
        <path d="M178 46 c-14 0 -24 10 -24 24 v36 l7 -6 l7 6 l7 -6 l7 6 v-36 c0 -14 -10 -24 -24 -24z" className="ilustracion__fantasma" />
        <circle cx="173" cy="68" r="2.5" className="ilustracion__ojo" />
        <circle cx="183" cy="68" r="2.5" className="ilustracion__ojo" />
      </svg>
      <p className="pagina-error__codigo">403</p>
      <h1>Los espíritus no te dejan pasar</h1>
      <p className="lead text-secondary mb-4">Tu cuenta no tiene permiso para entrar en esta habitación.</p>
      <div className="d-flex justify-content-center flex-wrap gap-2">
        <button type="button" className="btn btn-outline-light" onClick={() => navigate(-1)}>Volver</button>
        <Link to="/" className="btn btn-warning">Ir al inicio</Link>
      </div>
    </section>
  );
}
