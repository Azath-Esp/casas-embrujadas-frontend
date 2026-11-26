import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NivelEmbrujo from '../components/NivelEmbrujo';
import TarjetaProducto, { IMAGEN_RESPALDO } from '../components/TarjetaProducto';
import { blogs } from '../data/blogs';
import { productoService } from '../services/productoService';
import { formatearPrecio } from '../utils/formato';

export default function Home() {
  const [casas, setCasas] = useState(null);

  useEffect(() => {
    productoService.listar({ estado: 'DISPONIBLE', tamano: 4 })
      .then((pagina) => setCasas(pagina.contenido))
      .catch(() => setCasas([]));
  }, []);

  const [propiedadMes, ...destacadas] = casas ?? [];

  return (
    <>
      <section className="hero-home">
        <div className="container">
          <div className="contenido py-5">
            <h1 className="mb-3">Tu próximo hogar... del más allá</h1>
            <p className="mb-4">
              Propiedades con historia, actividad paranormal garantizada y vecinos
              que llevan más de 100 años viviendo ahí.
            </p>
            <div className="d-flex flex-wrap gap-4">
              <Link to="/productos" className="btn-enlace">Ver propiedades</Link>
              <Link to="/blogs" className="btn-enlace secundario">Leer casos</Link>
            </div>
          </div>
        </div>
      </section>

      {!casas && (
        <div className="container py-5 placeholder-glow" aria-busy="true">
          <span className="placeholder col-12 detalle-imagen"></span>
        </div>
      )}

      {propiedadMes && (
        <section className="propiedad-mes py-5">
          <div className="container py-lg-4">
            <div className="row g-4 g-lg-5 align-items-center">
              <div className="col-12 col-lg-7">
                <img src={propiedadMes.imagenPrincipal ?? IMAGEN_RESPALDO} alt={propiedadMes.titulo} />
              </div>
              <div className="col-12 col-lg-5">
                <p className="text-secondary mb-1">Propiedad del mes</p>
                <h2 className="display-6 mb-3">{propiedadMes.titulo}</h2>
                <p>{propiedadMes.descripcion}</p>
                <dl className="ficha">
                  <dt>Ubicación</dt>
                  <dd>{propiedadMes.comuna}, {propiedadMes.region}</dd>
                  <dt>Embrujo</dt>
                  <dd><NivelEmbrujo nivel={propiedadMes.nivelEmbrujo} /></dd>
                  <dt>Precio</dt>
                  <dd className="precio-destacado">{formatearPrecio(propiedadMes.precio)} <small>+ IVA</small></dd>
                </dl>
                <Link to={`/producto/${propiedadMes.idProducto}`} className="btn-enlace">Ver ficha completa</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {destacadas.length > 0 && (
        <section className="container py-5">
          <div className="d-flex justify-content-between align-items-baseline mb-4">
            <h2 className="mb-0">Propiedades destacadas</h2>
            <Link to="/productos">Ver todas</Link>
          </div>
          <div className="row g-4">
            {destacadas.map((casa) => (
              <div className="col-12 col-md-4" key={casa.idProducto}>
                <TarjetaProducto casa={casa} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container pb-5">
        <h2 className="mb-4">Casos recientes</h2>
        <div className="row g-4">
          {blogs.map((b) => (
            <div className="col-12 col-md-6" key={b.id}>
              <Link to={`/blogs/${b.id}`} className="caso-reciente d-flex gap-3 text-decoration-none h-100">
                <img src={b.imagen} alt="" />
                <div>
                  <h3 className="h5 mb-1">{b.titulo}</h3>
                  <p className="mb-0 small text-secondary">{b.resumen}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
