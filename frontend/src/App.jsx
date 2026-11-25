import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import RutaProtegida from './components/RutaProtegida';
import ScrollAlInicio from './components/ScrollAlInicio';
import AccesoDenegado from './pages/AccesoDenegado';
import BlogDetalle from './pages/BlogDetalle';
import Blogs from './pages/Blogs';
import Carrito from './pages/Carrito';
import Comparar from './pages/Comparar';
import Contacto from './pages/Contacto';
import Detalle from './pages/Detalle';
import Favoritos from './pages/Favoritos';
import Home from './pages/Home';
import Login from './pages/Login';
import Mapa from './pages/Mapa';
import MiCuenta from './pages/MiCuenta';
import MisCompras from './pages/MisCompras';
import MisReservas from './pages/MisReservas';
import NoEncontrada from './pages/NoEncontrada';
import Nosotros from './pages/Nosotros';
import Productos from './pages/Productos';
import Registro from './pages/Registro';

const SOLO_CLIENTE = ['CLIENTE'];

export default function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <ScrollAlInicio />
      <Navbar />

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/producto/:id" element={<Detalle />} />
          <Route path="/comparar" element={<Comparar />} />
          <Route path="/mapa" element={<Mapa />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:id" element={<BlogDetalle />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route
            path="/mi-cuenta"
            element={<RutaProtegida roles={['CLIENTE', 'ADMIN']}><MiCuenta /></RutaProtegida>}
          />
          <Route path="/mis-compras" element={<RutaProtegida roles={SOLO_CLIENTE}><MisCompras /></RutaProtegida>} />
          <Route path="/mis-reservas" element={<RutaProtegida roles={SOLO_CLIENTE}><MisReservas /></RutaProtegida>} />
          <Route path="/favoritos" element={<RutaProtegida roles={SOLO_CLIENTE}><Favoritos /></RutaProtegida>} />
          <Route path="/403" element={<AccesoDenegado />} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
