import { useEffect, useState } from 'react';
import CampoFormulario from '../../components/CampoFormulario';
import SelectorComuna from '../../components/SelectorComuna';
import { useAuth } from '../../context/AuthContext';
import { erroresPorCampo, mensajeDeError } from '../../services/api';
import { usuarioService } from '../../services/usuarioService';
import { formatearRun } from '../../utils/run';
import { esFormularioValido } from '../../utils/validaciones';
import { validarUsuario } from '../../utils/validacionesPanel';

const NUEVO = { run: '', nombre: '', apellidos: '', correo: '', contrasena: '', direccion: '', idRegion: '', idComuna: '', rol: 'VENDEDOR', activo: true };

export default function PanelUsuarios() {
  const { usuario: yo } = useAuth();
  const [usuarios, setUsuarios] = useState(null);
  const [filtro, setFiltro] = useState({ texto: '', rol: '' });
  const [edicion, setEdicion] = useState(null);
  const [datos, setDatos] = useState(NUEVO);
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    usuarioService.listar()
      .then(setUsuarios)
      .catch((e) => setAviso({ tipo: 'danger', texto: mensajeDeError(e) }));
  }, [version]);

  const esNuevo = edicion === 'nuevo';

  function abrir(usuario) {
    setErrores({});
    if (!usuario) {
      setEdicion('nuevo');
      setDatos(NUEVO);
      return;
    }
    setEdicion(usuario);
    setDatos({ ...NUEVO, nombre: usuario.nombre, apellidos: usuario.apellidos, direccion: usuario.direccion ?? '', rol: usuario.rol, activo: usuario.activo });
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setDatos((previos) => ({ ...previos, [name]: type === 'checkbox' ? checked : value, ...(name === 'idRegion' ? { idComuna: '' } : {}) }));
  }

  async function guardar(e) {
    e.preventDefault();
    const encontrados = validarUsuario(datos, esNuevo);
    setErrores(encontrados);
    if (!esFormularioValido(encontrados)) return;
    const comunes = { nombre: datos.nombre.trim(), apellidos: datos.apellidos.trim(), direccion: datos.direccion.trim() || null, rol: datos.rol };
    try {
      if (esNuevo) {
        await usuarioService.crear({
          ...comunes, run: datos.run, correo: datos.correo.trim(), contrasena: datos.contrasena,
          idComuna: datos.idComuna ? Number(datos.idComuna) : null,
        });
      } else {
        await usuarioService.actualizar(edicion.idUsuario, { ...comunes, idComuna: edicion.idComuna, activo: datos.activo });
      }
      setAviso({ tipo: 'success', texto: esNuevo ? 'Usuario creado.' : 'Usuario actualizado.' });
      setEdicion(null);
      setVersion((v) => v + 1);
    } catch (error) {
      setErrores(erroresPorCampo(error));
      setAviso({ tipo: 'danger', texto: mensajeDeError(error) });
    }
  }

  async function eliminar(usuario) {
    if (!window.confirm(`¿Eliminar a ${usuario.nombre} ${usuario.apellidos}? Si tiene compras quedará desactivado.`)) return;
    try {
      await usuarioService.eliminar(usuario.idUsuario);
      setAviso({ tipo: 'success', texto: `${usuario.nombre} se eliminó o quedó desactivado.` });
      setVersion((v) => v + 1);
    } catch (error) {
      setAviso({ tipo: 'danger', texto: mensajeDeError(error) });
    }
  }

  const texto = filtro.texto.trim().toLowerCase();
  const visibles = (usuarios ?? []).filter((u) => (!filtro.rol || u.rol === filtro.rol)
    && (!texto || `${u.nombre} ${u.apellidos} ${u.correo} ${u.run}`.toLowerCase().includes(texto)));

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h2 mb-0">Usuarios</h1>
        <button type="button" className="btn btn-warning" onClick={() => abrir(null)}>+ Nuevo usuario</button>
      </div>
      {aviso && <div className={`alert alert-${aviso.tipo}`} role="status">{aviso.texto}</div>}

      {edicion && (
        <form className="card p-4 mb-4" onSubmit={guardar} noValidate>
          <h2 className="h5">{esNuevo ? 'Nuevo usuario' : `Editar a ${edicion.correo}`}</h2>
          <div className="row">
            {esNuevo && <div className="col-12 col-md-4"><CampoFormulario etiqueta="RUN" nombre="run" valor={datos.run} onChange={handleChange} error={errores.run} /></div>}
            <div className="col-12 col-md-4"><CampoFormulario etiqueta="Nombre" nombre="nombre" valor={datos.nombre} onChange={handleChange} error={errores.nombre} /></div>
            <div className="col-12 col-md-4"><CampoFormulario etiqueta="Apellidos" nombre="apellidos" valor={datos.apellidos} onChange={handleChange} error={errores.apellidos} /></div>
            {esNuevo && (
              <>
                <div className="col-12 col-md-6"><CampoFormulario etiqueta="Correo" nombre="correo" tipo="email" valor={datos.correo} onChange={handleChange} error={errores.correo} /></div>
                <div className="col-12 col-md-6"><CampoFormulario etiqueta="Contraseña inicial" nombre="contrasena" tipo="password" valor={datos.contrasena} onChange={handleChange} error={errores.contrasena} /></div>
              </>
            )}
            <div className="col-12 col-md-8"><CampoFormulario etiqueta="Dirección (opcional)" nombre="direccion" valor={datos.direccion} onChange={handleChange} error={errores.direccion} /></div>
            <div className="col-12 col-md-4 mb-3">
              <label htmlFor="rol" className="form-label">Rol</label>
              <select id="rol" name="rol" className="form-select" value={datos.rol} onChange={handleChange}
                disabled={!esNuevo && edicion.idUsuario === yo.idUsuario}>
                <option value="ADMIN">Administrador</option>
                <option value="VENDEDOR">Vendedor</option>
                <option value="CLIENTE">Cliente</option>
              </select>
            </div>
          </div>
          {esNuevo && <SelectorComuna idRegion={datos.idRegion} idComuna={datos.idComuna} onChange={handleChange} errores={errores} />}
          {!esNuevo && (
            <div className="form-check mb-3">
              <input className="form-check-input" type="checkbox" id="activo" name="activo" checked={datos.activo} onChange={handleChange}
                disabled={edicion.idUsuario === yo.idUsuario} />
              <label className="form-check-label" htmlFor="activo">Cuenta activa (puede iniciar sesión)</label>
            </div>
          )}
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-warning">{esNuevo ? 'Crear' : 'Guardar'}</button>
            <button type="button" className="btn btn-outline-light" onClick={() => setEdicion(null)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="row g-2 mb-3">
        <div className="col-12 col-md-6">
          <label htmlFor="buscarUsuario" className="visually-hidden">Buscar usuario</label>
          <input id="buscarUsuario" className="form-control" placeholder="Buscar por nombre, correo o RUN"
            value={filtro.texto} onChange={(e) => setFiltro({ ...filtro, texto: e.target.value })} />
        </div>
        <div className="col-12 col-md-3">
          <label htmlFor="filtroRol" className="visually-hidden">Filtrar por rol</label>
          <select id="filtroRol" className="form-select" value={filtro.rol} onChange={(e) => setFiltro({ ...filtro, rol: e.target.value })}>
            <option value="">Todos los roles</option>
            <option value="ADMIN">Administradores</option>
            <option value="VENDEDOR">Vendedores</option>
            <option value="CLIENTE">Clientes</option>
          </select>
        </div>
      </div>

      {!usuarios && <p className="placeholder-glow"><span className="placeholder col-12"></span></p>}
      {usuarios && (
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle tabla-panel">
            <thead>
              <tr><th scope="col">Nombre</th><th scope="col">Correo</th><th scope="col">RUN</th><th scope="col">Rol</th><th scope="col">Estado</th><th scope="col"><span className="visually-hidden">Acciones</span></th></tr>
            </thead>
            <tbody>
              {visibles.map((u) => (
                <tr key={u.idUsuario}>
                  <td>{u.nombre} {u.apellidos}</td>
                  <td className="small">{u.correo}</td>
                  <td className="small text-nowrap">{formatearRun(u.run)}</td>
                  <td>{u.rol}</td>
                  <td>{u.activo ? <span className="estado-casa estado-casa--disponible">Activo</span> : <span className="estado-casa estado-casa--inactiva">Inactivo</span>}</td>
                  <td className="text-end text-nowrap">
                    <button type="button" className="btn btn-warning btn-sm me-1" onClick={() => abrir(u)}>Editar</button>
                    {u.idUsuario !== yo.idUsuario && (
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => eliminar(u)}>Eliminar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibles.length === 0 && <p className="text-secondary">Ningún usuario coincide con el filtro.</p>}
        </div>
      )}
    </>
  );
}
