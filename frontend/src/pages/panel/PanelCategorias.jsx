import { useEffect, useState } from 'react';
import CampoFormulario from '../../components/CampoFormulario';
import { erroresPorCampo, mensajeDeError } from '../../services/api';
import { categoriaService } from '../../services/categoriaService';
import { esFormularioValido } from '../../utils/validaciones';
import { validarCategoria } from '../../utils/validacionesPanel';

const VACIA = { nombre: '', descripcion: '' };

export default function PanelCategorias() {
  const [categorias, setCategorias] = useState(null);
  const [datos, setDatos] = useState(VACIA);
  const [editando, setEditando] = useState(null);
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    categoriaService.listar()
      .then(setCategorias)
      .catch((e) => setAviso({ tipo: 'danger', texto: mensajeDeError(e) }));
  }, [version]);

  function handleChange(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  }

  function editar(categoria) {
    setEditando(categoria.idCategoria);
    setDatos({ nombre: categoria.nombre, descripcion: categoria.descripcion ?? '' });
    setErrores({});
  }

  function cancelar() {
    setEditando(null);
    setDatos(VACIA);
    setErrores({});
  }

  async function guardar(e) {
    e.preventDefault();
    const encontrados = validarCategoria(datos);
    setErrores(encontrados);
    if (!esFormularioValido(encontrados)) return;
    const cuerpo = { nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim() || null };
    try {
      if (editando) await categoriaService.actualizar(editando, cuerpo);
      else await categoriaService.crear(cuerpo);
      setAviso({ tipo: 'success', texto: editando ? 'Categoría actualizada.' : 'Categoría creada.' });
      cancelar();
      setVersion((v) => v + 1);
    } catch (error) {
      setErrores(erroresPorCampo(error));
      setAviso({ tipo: 'danger', texto: mensajeDeError(error) });
    }
  }

  async function eliminar(categoria) {
    if (!window.confirm(`¿Eliminar la categoría «${categoria.nombre}»?`)) return;
    try {
      await categoriaService.eliminar(categoria.idCategoria);
      setAviso({ tipo: 'success', texto: 'Categoría eliminada.' });
      setVersion((v) => v + 1);
    } catch (error) {
      setAviso({ tipo: 'danger', texto: mensajeDeError(error) });
    }
  }

  return (
    <>
      <h1 className="h2 mb-3">Categorías</h1>
      {aviso && <div className={`alert alert-${aviso.tipo}`} role="status">{aviso.texto}</div>}
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          {!categorias && <p className="placeholder-glow"><span className="placeholder col-12"></span></p>}
          {categorias && (
            <div className="table-responsive">
              <table className="table table-dark align-middle tabla-panel">
                <thead><tr><th scope="col">Nombre</th><th scope="col">Descripción</th><th scope="col"><span className="visually-hidden">Acciones</span></th></tr></thead>
                <tbody>
                  {categorias.map((c) => (
                    <tr key={c.idCategoria} className={editando === c.idCategoria ? 'table-active' : ''}>
                      <td>{c.nombre}</td>
                      <td className="small text-secondary">{c.descripcion}</td>
                      <td className="text-end text-nowrap">
                        <button type="button" className="btn btn-warning btn-sm me-1" onClick={() => editar(c)}>Editar</button>
                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => eliminar(c)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="col-12 col-lg-5">
          <form className="card p-4" onSubmit={guardar} noValidate>
            <h2 className="h5">{editando ? 'Editar categoría' : 'Nueva categoría'}</h2>
            <CampoFormulario etiqueta="Nombre" nombre="nombre" valor={datos.nombre} onChange={handleChange} error={errores.nombre} />
            <CampoFormulario etiqueta="Descripción" nombre="descripcion" valor={datos.descripcion} onChange={handleChange} error={errores.descripcion} />
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-warning">{editando ? 'Guardar' : 'Crear'}</button>
              {editando && <button type="button" className="btn btn-outline-light" onClick={cancelar}>Cancelar</button>}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
