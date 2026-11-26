
const CLAVE = 'preferencias';
const PREDETERMINADAS = { linterna: false };

export function leerPreferencias() {
  try {
    const guardadas = JSON.parse(localStorage.getItem(CLAVE));
    return { ...PREDETERMINADAS, linterna: guardadas?.linterna === true };
  } catch {
    return { ...PREDETERMINADAS };
  }
}

export function guardarPreferencias(preferencias) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ linterna: Boolean(preferencias.linterna) }));
  } catch {
    return;
  }
}
