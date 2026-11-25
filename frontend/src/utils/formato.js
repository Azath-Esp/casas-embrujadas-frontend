
export function formatearPrecio(valor) {
  return `$${Math.round(Number(valor) || 0).toLocaleString('es-CL')}`;
}

export function formatearFecha(fecha) {
  if (!fecha) return '';
  const [anio, mes, dia] = String(fecha).slice(0, 10).split('-').map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatearFechaHora(fechaHora) {
  if (!fechaHora) return '';
  return new Date(fechaHora).toLocaleString('es-CL', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function formatearRestante(milisegundos) {
  const total = Math.max(0, Math.floor(milisegundos / 1000));
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  const segundos = total % 60;
  return [horas, minutos, segundos].map((n) => String(n).padStart(2, '0')).join(':');
}
