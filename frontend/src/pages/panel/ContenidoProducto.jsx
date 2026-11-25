import { useState } from 'react';
import CampoFormulario from '../../components/CampoFormulario';
import CampoTexto from '../../components/CampoTexto';
import { erroresPorCampo, mensajeDeError } from '../../services/api';
import { productoService } from '../../services/productoService';
import { esFormularioValido } from '../../utils/validaciones';
import { validarFicha, validarImagen, validarMito } from '../../utils/validacionesPanel';

const IMAGEN_VACIA = { url: '', autor: '', licencia: '', urlFuente: '' };
const MITO_VACIO = { titulo: '', relato: '', anioOrigen: '', fuente: '' };

export default function ContenidoProducto({ casa, onCambio }) {
  const [imagen, setImagen] = useState(IMAGEN_VACIA);
  const [mito, setMito] = useState(MITO_VACIO);
  const [ficha, setFicha] = useState({
    tipoEntidad: casa.fichaParanormal?.tipoEntidad ?? '',
    horarioActividad: casa.fichaParanormal?.horarioActividad ?? '',
    fenomenosReportados: casa.fichaParanormal?.fenomenosReportados ?? '',
    ultimoAvistamiento: casa.fichaParanormal?.ultimoAvistamiento ?? '',
  });
  const [errores, setErrores] = useState({ imagen: {}, mito: {}, ficha: {} });
  const [aviso, setAviso] = useState(null);

  const cambiar = (setter) => (e) => setter((previo) => ({ ...previo, [e.target.name]: e.target.value }));

  async function recargar(texto) {
    onCambio(await productoService.obtenerDetalle(casa.idProducto));
    setAviso({ tipo: 'success', texto });
  }

  async function ejecutar(seccion, accion, texto) {
    try {
      await accion();
      setErrores((previos) => ({ ...previos, [seccion]: {} }));
      await recargar(texto);
      return true;
    } catch (e) {
      setErrores((previos) => ({ ...previos, [seccion]: erroresPorCampo(e) }));
      setAviso({ tipo: 'danger', texto: mensajeDeError(e) });
      return false;
    }
  }

  async function agregarImagen(e) {
    e.preventDefault();
    const encontrados = validarImagen(imagen);
    setErrores((previos) => ({ ...previos, imagen: encontrados }));
    if (!esFormularioValido(encontrados)) return;
    const siguiente = Math.max(0, ...casa.imagenes.map((i) => i.orden)) + 1;
    const ok = await ejecutar('imagen', () => productoService.agregarImagen(casa.idProducto, {
      ...imagen, orden: siguiente, urlFuente: imagen.urlFuente || null,
    }), 'Foto agregada.');
    if (ok) setImagen(IMAGEN_VACIA);
  }

  async function agregarMito(e) {
    e.preventDefault();
    const encontrados = validarMito(mito);
    setErrores((previos) => ({ ...previos, mito: encontrados }));
    if (!esFormularioValido(encontrados)) return;
    const ok = await ejecutar('mito', () => productoService.agregarMito(casa.idProducto, {
      ...mito, anioOrigen: mito.anioOrigen === '' ? null : Number(mito.anioOrigen),
    }), 'Mito agregado.');
    if (ok) setMito(MITO_VACIO);
  }

  async function guardarFicha(e) {
    e.preventDefault();
    const encontrados = validarFicha(ficha);
    setErrores((previos) => ({ ...previos, ficha: encontrados }));
    if (!esFormularioValido(encontrados)) return;
    await ejecutar('ficha', () => productoService.guardarFicha(casa.idProducto, {
      ...ficha, ultimoAvistamiento: ficha.ultimoAvistamiento || null,
    }), 'Ficha paranormal guardada.');
  }

  function quitar(tipo, elemento) {
    if (!window.confirm(`¿Eliminar ${tipo === 'imagen' ? 'esta foto' : `el mito «${elemento.titulo}»`}?`)) return;
    const accion = tipo === 'imagen'
      ? () => productoService.eliminarImagen(casa.idProducto, elemento.idImagen)
      : () => productoService.eliminarMito(casa.idProducto, elemento.idMito);
    ejecutar(tipo, accion, tipo === 'imagen' ? 'Foto eliminada.' : 'Mito eliminado.');
  }

  return (
    <section aria-labelledby="titulo-contenido">
      <h2 id="titulo-contenido" className="h3 mb-3">Contenido de la casa</h2>
      {aviso && <div className={`alert alert-${aviso.tipo}`} role="status">{aviso.texto}</div>}

      <div className="row g-4">
        <div className="col-12 col-xl-6">
          <div className="card p-4 h-100">
            <h3 className="h5">Fotos ({casa.imagenes.length})</h3>
            <ul className="list-unstyled lista-contenido">
              {[...casa.imagenes].sort((a, b) => a.orden - b.orden).map((img) => (
                <li key={img.idImagen}>
                  <img src={img.url} alt="" className="miniatura-panel" />
                  <span className="flex-grow-1 small">#{img.orden} · {img.autor} · {img.licencia}</span>
                  <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => quitar('imagen', img)}
                    disabled={casa.imagenes.length === 1} title={casa.imagenes.length === 1 ? 'Una casa debe conservar al menos una foto' : undefined}>Eliminar</button>
                </li>
              ))}
            </ul>
            <form onSubmit={agregarImagen} noValidate>
              <CampoFormulario etiqueta="URL de la imagen" nombre="url" id="imagen-url" tipo="url" valor={imagen.url} onChange={cambiar(setImagen)} error={errores.imagen.url} />
              <div className="row">
                <div className="col-6"><CampoFormulario etiqueta="Autor" nombre="autor" id="imagen-autor" valor={imagen.autor} onChange={cambiar(setImagen)} error={errores.imagen.autor} /></div>
                <div className="col-6"><CampoFormulario etiqueta="Licencia" nombre="licencia" id="imagen-licencia" valor={imagen.licencia} onChange={cambiar(setImagen)} error={errores.imagen.licencia} /></div>
              </div>
              <CampoFormulario etiqueta="URL de la fuente (opcional)" nombre="urlFuente" id="imagen-fuente" tipo="url" valor={imagen.urlFuente} onChange={cambiar(setImagen)} error={errores.imagen.urlFuente} />
              <button type="submit" className="btn btn-outline-warning btn-sm">Agregar foto</button>
            </form>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card p-4 h-100">
            <h3 className="h5">Mitos ({casa.mitos.length})</h3>
            <ul className="list-unstyled lista-contenido">
              {casa.mitos.map((m) => (
                <li key={m.idMito}>
                  <span className="flex-grow-1">{m.titulo}{m.anioOrigen && <small className="text-secondary"> ({m.anioOrigen})</small>}</span>
                  <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => quitar('mito', m)}>Eliminar</button>
                </li>
              ))}
            </ul>
            <form onSubmit={agregarMito} noValidate>
              <div className="row">
                <div className="col-8"><CampoFormulario etiqueta="Título" nombre="titulo" id="mito-titulo" valor={mito.titulo} onChange={cambiar(setMito)} error={errores.mito.titulo} /></div>
                <div className="col-4"><CampoFormulario etiqueta="Año" nombre="anioOrigen" id="mito-anio" tipo="number" valor={mito.anioOrigen} onChange={cambiar(setMito)} error={errores.mito.anioOrigen} /></div>
              </div>
              <CampoTexto etiqueta="Relato" nombre="relato" id="mito-relato" filas={3} valor={mito.relato} onChange={cambiar(setMito)} error={errores.mito.relato} />
              <CampoFormulario etiqueta="Fuente (URL o referencia)" nombre="fuente" id="mito-fuente" valor={mito.fuente} onChange={cambiar(setMito)} error={errores.mito.fuente} />
              <button type="submit" className="btn btn-outline-warning btn-sm">Agregar mito</button>
            </form>
          </div>
        </div>

        <div className="col-12">
          <form className="card p-4" onSubmit={guardarFicha} noValidate>
            <h3 className="h5">Ficha paranormal</h3>
            <div className="row">
              <div className="col-12 col-md-4"><CampoFormulario etiqueta="Tipo de entidad" nombre="tipoEntidad" valor={ficha.tipoEntidad} onChange={cambiar(setFicha)} error={errores.ficha.tipoEntidad} /></div>
              <div className="col-12 col-md-4"><CampoFormulario etiqueta="Horario de actividad" nombre="horarioActividad" valor={ficha.horarioActividad} onChange={cambiar(setFicha)} error={errores.ficha.horarioActividad} /></div>
              <div className="col-12 col-md-4"><CampoFormulario etiqueta="Último avistamiento" nombre="ultimoAvistamiento" tipo="date" valor={ficha.ultimoAvistamiento} onChange={cambiar(setFicha)} error={errores.ficha.ultimoAvistamiento} /></div>
            </div>
            <CampoTexto etiqueta="Fenómenos reportados" nombre="fenomenosReportados" filas={3} valor={ficha.fenomenosReportados} onChange={cambiar(setFicha)} error={errores.ficha.fenomenosReportados} />
            <div><button type="submit" className="btn btn-outline-warning btn-sm">Guardar ficha</button></div>
          </form>
        </div>
      </div>
    </section>
  );
}
