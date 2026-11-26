import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CampoFormulario from '../components/CampoFormulario';
import { useAuth } from '../context/AuthContext';
import { mensajeDeError } from '../services/api';
import { esFormularioValido, validarLogin } from '../utils/validaciones';

const datosIniciales = { correo: '', contrasena: '' };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const ubicacion = useLocation();
  const [datos, setDatos] = useState(datosIniciales);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  function handleChange(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nuevosErrores = validarLogin(datos);
    setErrores(nuevosErrores);
    setErrorGeneral('');
    if (!esFormularioValido(nuevosErrores)) return;

    setEnviando(true);
    try {
      const sesion = await login(datos.correo, datos.contrasena);
      const inicio = ['ADMIN', 'VENDEDOR'].includes(sesion.rol) ? '/panel' : '/';
      navigate(ubicacion.state?.desde ?? inicio, { replace: true });
    } catch (error) {
      setErrorGeneral(mensajeDeError(error));
      setEnviando(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card shadow-sm p-4">
            <h1 className="h3 mb-4 text-center">Iniciar sesión 🕯️</h1>

            {ubicacion.state?.mensaje && !errorGeneral && (
              <div className="alert alert-warning" role="status">{ubicacion.state.mensaje}</div>
            )}
            {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <CampoFormulario etiqueta="Correo" nombre="correo" tipo="email"
                valor={datos.correo} onChange={handleChange} error={errores.correo} />
              <CampoFormulario etiqueta="Contraseña" nombre="contrasena" tipo="password"
                valor={datos.contrasena} onChange={handleChange} error={errores.contrasena} />
              <button type="submit" className="btn btn-warning w-100 mt-3" disabled={enviando}>
                {enviando ? 'Entrando…' : 'Entrar'}
              </button>
            </form>

            <p className="text-center mt-3 mb-0">
              ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
