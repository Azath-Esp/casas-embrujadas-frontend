import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import CampoFormulario from '../../components/CampoFormulario';
import CampoTexto from '../../components/CampoTexto';
import SelectorComuna from '../../components/SelectorComuna';
import { erroresPorCampo, mensajeDeError } from '../../services/api';
import { categoriaService } from '../../services/categoriaService';
import { productoService } from '../../services/productoService';
import { esFormularioValido } from '../../utils/validaciones';
import { validarProducto } from '../../utils/validacionesPanel';
import ContenidoProducto from './ContenidoProducto';

const VACIO = {
  titulo: '', descripcion: '', precio: '', direccion: '', metrosCuadrados: '', dormitorios: '', banos: '',
  nivelEmbrujo: '3', latitud: '', longitud: '', idRegion: '', idComuna: '', idsCategorias: [], estado: 'DISPONIBLE',
};

function desdeCasa(casa) {
  return {
    titulo: casa.titulo, descripcion: casa.descripcion, precio: String(Number(casa.precio)), direccion: casa.direccion,
    metrosCuadrados: String(casa.metrosCuadrados), dormitorios: String(casa.dormitorios), banos: String(casa.banos),
    nivelEmbrujo: String(casa.nivelEmbrujo), latitud: String(casa.latitud), longitud: String(casa.longitud),
    idRegion: String(casa.idRegion), idComuna: String(casa.idComuna),
    idsCategorias: casa.categorias.map((c) => c.idCategoria), estado: casa.estado,
  };
}

function Formulario({ id }) {
  const esNueva = id === undefined;
  const navigate = useNavigate();
  const ubicacion = useLocation();
  const [datos, setDatos] = useState(esNueva ? VACIO : null);
  const [casa, setCasa] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState(ubicacion.state?.mensaje ? { tipo: 'success', texto: ubicacion.state.mensaje } : null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    categoriaService.listar().then(setCategorias).catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    if (esNueva) return;
    productoService.obtenerDetalle(id)
      .then((respuesta) => {
        setCasa(respuesta);
        setDatos(desdeCasa(respuesta));
      })
      .catch((e) => setAviso({ tipo: 'danger', texto: mensajeDeError(e) }));
  }, [id, esNueva]);

  function handleChange(e) {
    const { name, value } = e.target;
    setDatos((previos) => ({ ...previos, [name]: value, ...(name === 'idRegion' ? { idComuna: '' } : {}) }));
  }

  function alternarCategoria(idCategoria) {
    setDatos((previos) => ({
      ...previos,
      idsCategorias: previos.idsCategorias.includes(idCategoria)
        ? previos.idsCategorias.filter((otra) => otra !== idCategoria)
        : [...previos.idsCategorias, idCategoria],
    }));
  }

  async function guardar(e) {
    e.preventDefault();
    const nuevosErrores = validarProducto(datos);
    setErrores(nuevosErrores);
    setAviso(null);
    if (!esFormularioValido(nuevosErrores)) return;

    const cuerpo = {
      titulo: datos.titulo.trim(), descripcion: datos.descripcion.trim(), precio: Number(datos.precio),
      direccion: datos.direccion.trim(), metrosCuadrados: Number(datos.metrosCuadrados), dormitorios: Number(datos.dormitorios),
      banos: Number(datos.banos), nivelEmbrujo: Number(datos.nivelEmbrujo), latitud: Number(datos.latitud),
      longitud: Number(datos.longitud), idComuna: Number(datos.idComuna), idsCategorias: datos.idsCategorias,
      ...(esNueva ? {} : { estado: datos.estado }),
    };
    setEnviando(true);
    try {
      if (esNueva) {
        const creada = await productoService.crear(cuerpo);
        navigate(`/panel/productos/${creada.idProducto}`, { replace: true, state: { mensaje: 'Casa creada. Ahora agrégale fotos, mitos y su ficha paranormal.' } });
        return;
      }
      const actualizada = await productoService.actualizar(id, cuerpo);
      setCasa(actualizada);
      setDatos(desdeCasa(actualizada));
      setAviso({ tipo: 'success', texto: 'Cambios guardados.' });
    } catch (error) {
      setErrores(erroresPorCampo(error));
      setAviso({ tipo: 'danger', texto: mensajeDeError(error) });
    } finally {
      setEnviando(false);
    }
  }

  if (!datos) {
    return aviso ? <div className={`alert alert-${aviso.tipo}`}>{aviso.texto}</div> : <p className="placeholder-glow"><span className="placeholder col-12"></span></p>;
  }

  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/panel/productos">Casas</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{esNueva ? 'Nueva' : casa?.titulo}</li>
        </ol>
      </nav>
      <h1 className="h2 mb-3">{esNueva ? 'Nueva casa' : 'Editar casa'}</h1>
      {aviso && <div className={`alert alert-${aviso.tipo}`} role="status">{aviso.texto}</div>}

      <form className="card p-4 mb-4" onSubmit={guardar} noValidate>
        <div className="row">
          <div className="col-12 col-md-8"><CampoFormulario etiqueta="Título" nombre="titulo" valor={datos.titulo} onChange={handleChange} error={errores.titulo} /></div>
          <div className="col-12 col-md-4"><CampoFormulario etiqueta="Precio neto (CLP)" nombre="precio" tipo="number" valor={datos.precio} onChange={handleChange} error={errores.precio} /></div>
        </div>
        <CampoTexto etiqueta="Descripción" nombre="descripcion" valor={datos.descripcion} onChange={handleChange} error={errores.descripcion} />
        <CampoFormulario etiqueta="Dirección" nombre="direccion" valor={datos.direccion} onChange={handleChange} error={errores.direccion} />
        <SelectorComuna idRegion={datos.idRegion} idComuna={datos.idComuna} onChange={handleChange} errores={errores} />
        <div className="row">
          <div className="col-6 col-md-3"><CampoFormulario etiqueta="m²" nombre="metrosCuadrados" tipo="number" valor={datos.metrosCuadrados} onChange={handleChange} error={errores.metrosCuadrados} /></div>
          <div className="col-6 col-md-3"><CampoFormulario etiqueta="Dormitorios" nombre="dormitorios" tipo="number" valor={datos.dormitorios} onChange={handleChange} error={errores.dormitorios} /></div>
          <div className="col-6 col-md-3"><CampoFormulario etiqueta="Baños" nombre="banos" tipo="number" valor={datos.banos} onChange={handleChange} error={errores.banos} /></div>
          <div className="col-6 col-md-3 mb-3">
            <label htmlFor="nivelEmbrujo" className="form-label">Nivel de embrujo</label>
            <select id="nivelEmbrujo" name="nivelEmbrujo" className="form-select" value={datos.nivelEmbrujo} onChange={handleChange}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="col-6 col-md-3"><CampoFormulario etiqueta="Latitud" nombre="latitud" tipo="number" valor={datos.latitud} onChange={handleChange} error={errores.latitud} /></div>
          <div className="col-6 col-md-3"><CampoFormulario etiqueta="Longitud" nombre="longitud" tipo="number" valor={datos.longitud} onChange={handleChange} error={errores.longitud} /></div>
          {!esNueva && (
            <div className="col-12 col-md-3 mb-3">
              <label htmlFor="estado" className="form-label">Estado</label>
              <select id="estado" name="estado" className="form-select" value={datos.estado} onChange={handleChange}>
                {['RESERVADA', 'VENDIDA'].includes(casa?.estado) && (
                  <option value={casa.estado} disabled>{casa.estado === 'RESERVADA' ? 'Reservada' : 'Vendida'} (lo asigna el sistema)</option>
                )}
                <option value="DISPONIBLE">Disponible</option>
                <option value="INACTIVA">Inactiva (oculta del catálogo)</option>
              </select>
            </div>
          )}
        </div>
        <fieldset className="mb-3">
          <legend className="form-label fs-6">Categorías</legend>
          <div className="d-flex flex-wrap gap-3">
            {categorias.map((c) => (
              <div className="form-check" key={c.idCategoria}>
                <input className="form-check-input" type="checkbox" id={`categoria-${c.idCategoria}`}
                  checked={datos.idsCategorias.includes(c.idCategoria)} onChange={() => alternarCategoria(c.idCategoria)} />
                <label className="form-check-label" htmlFor={`categoria-${c.idCategoria}`}>{c.nombre}</label>
              </div>
            ))}
          </div>
          {errores.idsCategorias && <p className="small text-danger mt-1 mb-0">{errores.idsCategorias}</p>}
        </fieldset>
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-warning" disabled={enviando}>{enviando ? 'Guardando…' : esNueva ? 'Crear casa' : 'Guardar cambios'}</button>
          <Link to="/panel/productos" className="btn btn-outline-light">Volver</Link>
        </div>
      </form>

      {casa && <ContenidoProducto casa={casa} onCambio={setCasa} />}
    </>
  );
}

export default function FormularioProducto() {
  const { id } = useParams();
  return <Formulario key={id ?? 'nueva'} id={id} />;
}
