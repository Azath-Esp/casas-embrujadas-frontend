import { runValido } from './run';
import { contrasenaValida, correoValido } from './validaciones';

function vacio(texto) {
  return String(texto ?? '').trim() === '';
}

function enteroEntre(valor, minimo, maximo) {
  const numero = Number(valor);
  return valor !== '' && Number.isInteger(numero) && numero >= minimo && numero <= maximo;
}

export function validarProducto(datos) {
  const errores = {};
  if (vacio(datos.titulo) || datos.titulo.length > 120) errores.titulo = 'El título es obligatorio (máx. 120 caracteres).';
  if (vacio(datos.descripcion)) errores.descripcion = 'La descripción es obligatoria.';
  if (!(Number(datos.precio) > 0)) errores.precio = 'El precio debe ser mayor que 0.';
  if (vacio(datos.direccion) || datos.direccion.length > 150) errores.direccion = 'La dirección es obligatoria (máx. 150 caracteres).';
  if (!enteroEntre(datos.metrosCuadrados, 1, 1000000)) errores.metrosCuadrados = 'Ingresa los metros cuadrados.';
  if (!enteroEntre(datos.dormitorios, 0, 1000)) errores.dormitorios = 'Ingresa un número entero.';
  if (!enteroEntre(datos.banos, 0, 1000)) errores.banos = 'Ingresa un número entero.';
  if (!enteroEntre(datos.nivelEmbrujo, 1, 5)) errores.nivelEmbrujo = 'El nivel va de 1 a 5.';
  if (datos.latitud === '' || Math.abs(Number(datos.latitud)) > 90 || Number.isNaN(Number(datos.latitud))) {
    errores.latitud = 'La latitud va de -90 a 90.';
  }
  if (datos.longitud === '' || Math.abs(Number(datos.longitud)) > 180 || Number.isNaN(Number(datos.longitud))) {
    errores.longitud = 'La longitud va de -180 a 180.';
  }
  if (datos.idRegion === '') errores.idRegion = 'Debe seleccionar una región.';
  if (datos.idComuna === '') errores.idComuna = 'Debe seleccionar una comuna.';
  if (datos.idsCategorias.length === 0) errores.idsCategorias = 'Marca al menos una categoría.';
  return errores;
}

export function validarCategoria(datos) {
  const errores = {};
  if (vacio(datos.nombre) || datos.nombre.length > 60) errores.nombre = 'El nombre es obligatorio (máx. 60 caracteres).';
  if (datos.descripcion.length > 255) errores.descripcion = 'La descripción admite hasta 255 caracteres.';
  return errores;
}

export function validarUsuario(datos, esNuevo) {
  const errores = {};
  if (esNuevo && !runValido(datos.run)) errores.run = 'El RUN no es válido.';
  if (vacio(datos.nombre) || datos.nombre.length > 60) errores.nombre = 'El nombre es obligatorio (máx. 60 caracteres).';
  if (vacio(datos.apellidos) || datos.apellidos.length > 80) errores.apellidos = 'Los apellidos son obligatorios (máx. 80 caracteres).';
  if (esNuevo && !correoValido(datos.correo)) errores.correo = 'El correo no tiene un formato válido.';
  if (esNuevo && !contrasenaValida(datos.contrasena)) errores.contrasena = 'Entre 8 y 72 caracteres, con al menos una letra y un número.';
  if (datos.direccion.length > 150) errores.direccion = 'La dirección admite hasta 150 caracteres.';
  if (!['ADMIN', 'VENDEDOR', 'CLIENTE'].includes(datos.rol)) errores.rol = 'Elige un rol.';
  return errores;
}

export function validarImagen(datos) {
  const errores = {};
  if (!/^https?:\/\/\S+$/.test(datos.url) || datos.url.length > 500) errores.url = 'Ingresa una URL que empiece con http:// o https://.';
  if (vacio(datos.autor) || datos.autor.length > 150) errores.autor = 'El autor es obligatorio.';
  if (vacio(datos.licencia) || datos.licencia.length > 80) errores.licencia = 'La licencia es obligatoria.';
  if (datos.urlFuente && !/^https?:\/\/\S+$/.test(datos.urlFuente)) errores.urlFuente = 'La fuente debe ser una URL.';
  return errores;
}

export function validarMito(datos) {
  const errores = {};
  if (vacio(datos.titulo) || datos.titulo.length > 150) errores.titulo = 'El título es obligatorio (máx. 150 caracteres).';
  if (vacio(datos.relato)) errores.relato = 'El relato es obligatorio.';
  if (datos.anioOrigen !== '' && !enteroEntre(datos.anioOrigen, 1000, 2100)) errores.anioOrigen = 'El año va de 1000 a 2100.';
  if (vacio(datos.fuente) || datos.fuente.length > 500) errores.fuente = 'La fuente es obligatoria.';
  return errores;
}

export function validarFicha(datos, hoy = new Date()) {
  const errores = {};
  if (vacio(datos.tipoEntidad) || datos.tipoEntidad.length > 80) errores.tipoEntidad = 'El tipo de entidad es obligatorio (máx. 80).';
  if (vacio(datos.horarioActividad) || datos.horarioActividad.length > 80) errores.horarioActividad = 'El horario es obligatorio (máx. 80).';
  if (vacio(datos.fenomenosReportados)) errores.fenomenosReportados = 'Describe los fenómenos.';
  const limite = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  if (datos.ultimoAvistamiento && datos.ultimoAvistamiento > limite) errores.ultimoAvistamiento = 'No puede ser una fecha futura.';
  return errores;
}
