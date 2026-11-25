import { runValido } from './run';

export function correoValido(correo) {
  return typeof correo === 'string' && correo.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo);
}

export function contrasenaValida(contrasena) {
  return contrasena.length >= 8 && contrasena.length <= 72 && /[A-Za-z]/.test(contrasena) && /\d/.test(contrasena);
}

export function esFormularioValido(errores) {
  return Object.keys(errores).length === 0;
}

export function validarRegistro(datos) {
  const errores = {};
  if (!runValido(datos.run)) errores.run = 'El RUN no es válido.';
  if (datos.nombre.trim() === '' || datos.nombre.length > 60) errores.nombre = 'El nombre es obligatorio (máx. 60 caracteres).';
  if (datos.apellidos.trim() === '' || datos.apellidos.length > 80) {
    errores.apellidos = 'Los apellidos son obligatorios (máx. 80 caracteres).';
  }
  if (!correoValido(datos.correo)) errores.correo = 'El correo no tiene un formato válido.';
  if (datos.confirmarCorreo !== datos.correo) errores.confirmarCorreo = 'Los correos no coinciden.';
  if (!contrasenaValida(datos.contrasena)) {
    errores.contrasena = 'Entre 8 y 72 caracteres, con al menos una letra y un número.';
  }
  if (datos.confirmarContrasena !== datos.contrasena) errores.confirmarContrasena = 'Las contraseñas no coinciden.';
  if (datos.idRegion === '') errores.idRegion = 'Debe seleccionar una región.';
  if (datos.idComuna === '') errores.idComuna = 'Debe seleccionar una comuna.';
  return errores;
}

export function validarLogin(datos) {
  const errores = {};
  if (!correoValido(datos.correo)) errores.correo = 'Ingresa un correo válido.';
  if (datos.contrasena === '') errores.contrasena = 'La contraseña es obligatoria.';
  return errores;
}

export function validarPerfil(datos) {
  const errores = {};
  if (datos.nombre.trim() === '' || datos.nombre.length > 60) errores.nombre = 'El nombre es obligatorio (máx. 60 caracteres).';
  if (datos.apellidos.trim() === '' || datos.apellidos.length > 80) {
    errores.apellidos = 'Los apellidos son obligatorios (máx. 80 caracteres).';
  }
  if (datos.direccion.length > 150) errores.direccion = 'La dirección admite hasta 150 caracteres.';
  return errores;
}

export function validarContacto(datos) {
  const errores = {};
  if (datos.nombre.trim() === '' || datos.nombre.length > 100) {
    errores.nombre = 'El nombre es obligatorio (máx. 100 caracteres).';
  }
  if (!correoValido(datos.correo)) {
    errores.correo = 'Ingresa un correo válido.';
  }
  if (datos.mensaje.trim() === '' || datos.mensaje.length > 500) {
    errores.mensaje = 'El mensaje es obligatorio (máx. 500 caracteres).';
  }
  return errores;
}
