
const CLAVE = 'sesion';

export function leerPayload(token) {
  try {
    const parte = token.split('.')[1];
    const base64 = parte.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(parte.length / 4) * 4, '=');
    const bytes = Uint8Array.from(atob(base64), (caracter) => caracter.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

export function sesionVigente(sesion, ahora = Date.now()) {
  return Boolean(sesion && sesion.token) && typeof sesion.exp === 'number' && sesion.exp * 1000 > ahora;
}

export function crearSesion(respuestaLogin) {
  const datos = leerPayload(respuestaLogin.token);
  if (!datos) return null;
  return {
    token: respuestaLogin.token,
    nombre: respuestaLogin.nombre,
    rol: respuestaLogin.rol,
    idUsuario: datos.id,
    correo: datos.sub,
    exp: datos.exp,
  };
}

export function leerSesion() {
  try {
    const guardada = JSON.parse(localStorage.getItem(CLAVE));
    return guardada && typeof guardada === 'object' && sesionVigente(guardada) ? guardada : null;
  } catch {
    return null;
  }
}

export function guardarSesion(sesion) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(sesion));
  } catch {
    return;
  }
}

export function borrarSesion() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    return;
  }
}
