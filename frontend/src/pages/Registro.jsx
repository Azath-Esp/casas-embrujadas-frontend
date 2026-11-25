import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CampoFormulario from '../components/CampoFormulario';
import SelectorComuna from '../components/SelectorComuna';
import { useAuth } from '../context/AuthContext';
import { erroresPorCampo, mensajeDeError } from '../services/api';
import { esFormularioValido, validarRegistro } from '../utils/validaciones';

const datosIniciales = {
  run: '', nombre: '', apellidos: '', correo: '', confirmarCorreo: '',
  contrasena: '', confirmarContrasena: '', direccion: '', idRegion: '', idComuna: '',
};

export default function Registro() {
  const { registro } = useAuth();
  const navigate = useNavigate();
  const [datos, setDatos] = useState(datosIniciales);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setDatos((previos) => ({
      ...previos,
      [name]: value,
      ...(name === 'idRegion' ? { idComuna: '' } : {}),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nuevosErrores = validarRegistro(datos);
    setErrores(nuevosErrores);
    setErrorGeneral('');
    if (!esFormularioValido(nuevosErrores)) return;

    setEnviando(true);
    try {
      await registro({
        run: datos.run,
        nombre: datos.nombre.trim(),
        apellidos: datos.apellidos.trim(),
        correo: datos.correo.trim(),
        contrasena: datos.contrasena,
        direccion: datos.direccion.trim() || null,
        idComuna: Number(datos.idComuna),
      });
      navigate('/mi-cuenta', { replace: true, state: { mensaje: '¡Cuenta creada! Bienvenido al más allá.' } });
    } catch (error) {
      setErrores(erroresPorCampo(error));
      setErrorGeneral(mensajeDeError(error));
      setEnviando(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm p-4">
            <h1 className="h3 mb-4 text-center">Crear cuenta 👻</h1>

            {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <CampoFormulario etiqueta="RUN" nombre="run"
                valor={datos.run} onChange={handleChange} error={errores.run} />

              <div className="row">
                <div className="col-12 col-sm-6">
                  <CampoFormulario etiqueta="Nombre" nombre="nombre"
                    valor={datos.nombre} onChange={handleChange} error={errores.nombre} />
                </div>
                <div className="col-12 col-sm-6">
                  <CampoFormulario etiqueta="Apellidos" nombre="apellidos"
                    valor={datos.apellidos} onChange={handleChange} error={errores.apellidos} />
                </div>
              </div>

              <CampoFormulario etiqueta="Correo" nombre="correo" tipo="email"
                valor={datos.correo} onChange={handleChange} error={errores.correo} />
              <CampoFormulario etiqueta="Confirmar correo" nombre="confirmarCorreo" tipo="email"
                valor={datos.confirmarCorreo} onChange={handleChange} error={errores.confirmarCorreo} />
              <CampoFormulario etiqueta="Contraseña" nombre="contrasena" tipo="password"
                valor={datos.contrasena} onChange={handleChange} error={errores.contrasena} />
              <CampoFormulario etiqueta="Confirmar contraseña" nombre="confirmarContrasena" tipo="password"
                valor={datos.confirmarContrasena} onChange={handleChange} error={errores.confirmarContrasena} />
              <CampoFormulario etiqueta="Dirección (opcional)" nombre="direccion"
                valor={datos.direccion} onChange={handleChange} error={errores.direccion} />

              <SelectorComuna idRegion={datos.idRegion} idComuna={datos.idComuna}
                onChange={handleChange} errores={errores} />

              <button type="submit" className="btn btn-warning w-100 mt-3" disabled={enviando}>
                {enviando ? 'Creando cuenta…' : 'Registrarse'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
