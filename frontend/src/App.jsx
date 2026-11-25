import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import RutaProtegida from './components/RutaProtegida';
import ScrollAlInicio from './components/ScrollAlInicio';
import AccesoDenegado from './pages/AccesoDenegado';
import BlogDetalle from './pages/BlogDetalle';
import Blogs from './pages/Blogs';
import Carrito from './pages/Carrito';
import Contacto from './pages/Contacto';
import Detalle from './pages/Detalle';
import Home from './pages/Home';
import Login from './pages/Login';
import MiCuenta from './pages/MiCuenta';
import NoEncontrada from './pages/NoEncontrada';
import Nosotros from './pages/Nosotros';
import Productos from './pages/Productos';
import Registro from './pages/Registro';

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
          <Route path="/403" element={<AccesoDenegado />} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
