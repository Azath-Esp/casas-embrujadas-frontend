import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MenuCuenta from '../components/MenuCuenta';
import TarjetaProducto from '../components/TarjetaProducto';
import { useCarrito } from '../context/CarritoContext';
import { mensajeDeError } from '../services/api';
import { favoritoService } from '../services/favoritoService';

export default function Favoritos() {
  const { agregar, contiene } = useCarrito();
  const [casas, setCasas] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    favoritoService.listar()
      .then(setCasas)
      .catch((e) => {
        setCasas([]);
        setError(mensajeDeError(e));
      });
  }, []);

  async function quitar(id) {
    try {
      await favoritoService.quitar(id);
      setCasas((actual) => actual.filter((casa) => casa.idProducto !== id));
    } catch (e) {
      setError(mensajeDeError(e));
    }
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">Favoritos</h1>
      <MenuCuenta />
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {!casas && <p className="placeholder-glow" aria-busy="true"><span className="placeholder col-8"></span></p>}
      {casas?.length === 0 && !error && (
        <p className="text-secondary">Aún no marcas casas con ♡. <Link to="/productos">Ver propiedades</Link></p>
      )}
      <div className="row g-4">
        {casas?.map((casa) => (
          <div className="col-12 col-sm-6 col-lg-4" key={casa.idProducto}>
            <TarjetaProducto casa={casa} onAgregar={agregar} enCarrito={contiene(casa.idProducto)} esFavorito onFavorito={quitar} />
          </div>
        ))}
      </div>
    </div>
  );
}
