import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CampoFormulario from '../components/CampoFormulario';
import MenuCuenta from '../components/MenuCuenta';
import { erroresPorCampo, mensajeDeError } from '../services/api';
import { usuarioService } from '../services/usuarioService';
import { formatearRun } from '../utils/run';
import { esFormularioValido, validarPerfil } from '../utils/validaciones';

export default function MiCuenta() {
  const ubicacion = useLocation();
  const [perfil, setPerfil] = useState(null);
  const [datos, setDatos] = useState({ nombre: '', apellidos: '', direccion: '' });
  const [errores, setErrores] = useState({});
  const [estado, setEstado] = useState('cargando');
  const [aviso, setAviso] = useState(ubicacion.state?.mensaje ?? '');

  useEffect(() => {
    usuarioService.miPerfil()
      .then((respuesta) => {
        setPerfil(respuesta);
        setDatos({ nombre: respuesta.nombre, apellidos: respuesta.apellidos, direccion: respuesta.direccion ?? '' });
        setEstado('listo');
      })
      .catch((error) => {
        setAviso(mensajeDeError(error));
        setEstado('error');
      });
  }, []);

  function handleChange(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nuevosErrores = validarPerfil(datos);
    setErrores(nuevosErrores);
    if (!esFormularioValido(nuevosErrores)) return;
    try {
      const actualizado = await usuarioService.actualizarMiPerfil({
        nombre: datos.nombre.trim(),
        apellidos: datos.apellidos.trim(),
        direccion: datos.direccion.trim() || null,
        idComuna: perfil.idComuna,
      });
      setPerfil(actualizado);
      setAviso('Tus datos se guardaron.');
    } catch (error) {
      setErrores(erroresPorCampo(error));
      setAviso(mensajeDeError(error));
    }
  }

  if (estado === 'cargando') {
    return (
      <div className="container py-5" aria-busy="true">
        <p className="placeholder-glow"><span className="placeholder col-6"></span></p>
        <p className="placeholder-glow"><span className="placeholder col-4"></span></p>
        <p className="placeholder-glow"><span className="placeholder col-8"></span></p>
      </div>
    );
  }

  if (estado === 'error') {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">{aviso}</div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">Mi cuenta</h1>
      <MenuCuenta />
      {aviso && <div className="alert alert-success" role="status">{aviso}</div>}

      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <dl className="ficha">
            <dt>RUN</dt>
            <dd>{formatearRun(perfil.run)}</dd>
            <dt>Correo</dt>
            <dd>{perfil.correo}</dd>
            <dt>Rol</dt>
            <dd>{perfil.rol}</dd>
            <dt>Comuna</dt>
            <dd>{perfil.comuna ? `${perfil.comuna}, ${perfil.region}` : 'Sin comuna'}</dd>
          </dl>
        </div>

        <div className="col-12 col-lg-7">
          <form className="card p-4" onSubmit={handleSubmit} noValidate>
            <h2 className="h4 mb-3">Modificar mis datos</h2>
            <CampoFormulario etiqueta="Nombre" nombre="nombre"
              valor={datos.nombre} onChange={handleChange} error={errores.nombre} />
            <CampoFormulario etiqueta="Apellidos" nombre="apellidos"
              valor={datos.apellidos} onChange={handleChange} error={errores.apellidos} />
            <CampoFormulario etiqueta="Dirección" nombre="direccion"
              valor={datos.direccion} onChange={handleChange} error={errores.direccion} />
            <button type="submit" className="btn btn-warning">Guardar cambios</button>
          </form>
        </div>
      </div>
    </div>
  );
}
