
export function normalizarRun(run) {
  const limpio = String(run ?? '').replace(/[.\-\s]/g, '').toUpperCase();
  if (limpio.length < 2) return limpio;
  return `${limpio.slice(0, -1)}-${limpio.slice(-1)}`;
}

export function calcularDigitoVerificador(cuerpo) {
  let suma = 0;
  let multiplicador = 2;
  for (let resto = Number(cuerpo); resto > 0; resto = Math.floor(resto / 10)) {
    suma += (resto % 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resultado = 11 - (suma % 11);
  if (resultado === 11) return '0';
  if (resultado === 10) return 'K';
  return String(resultado);
}

export function runValido(run) {
  const normalizado = normalizarRun(run);
  if (!/^\d{7,8}-[\dK]$/.test(normalizado)) return false;
  const [cuerpo, digito] = normalizado.split('-');
  return calcularDigitoVerificador(cuerpo) === digito;
}

export function formatearRun(run) {
  const normalizado = normalizarRun(run);
  const [cuerpo, digito] = normalizado.split('-');
  if (!digito) return String(run ?? '');
  return `${Number(cuerpo).toLocaleString('es-CL')}-${digito}`;
}
