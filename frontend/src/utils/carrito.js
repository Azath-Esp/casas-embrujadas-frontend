
export function normalizarCarrito(guardado) {
  if (!Array.isArray(guardado)) return [];
  return [...new Set(guardado.filter((id) => Number.isInteger(id) && id > 0))];
}

export function agregarAlCarrito(carrito, id) {
  if (!Number.isInteger(id) || carrito.includes(id)) return carrito;
  return [...carrito, id];
}

export function quitarDelCarrito(carrito, id) {
  return carrito.includes(id) ? carrito.filter((actual) => actual !== id) : carrito;
}

export function calcularResumen(casas) {
  const neto = casas.reduce((suma, casa) => suma + Number(casa.precio), 0);
  const iva = Math.round((neto * 19) / 100);
  return { neto, iva, total: neto + iva };
}

export function sePuedeComprar(casa, reservasActivas = []) {
  if (casa.estado === 'DISPONIBLE') return true;
  return casa.estado === 'RESERVADA' && reservasActivas.some((reserva) => reserva.idProducto === casa.idProducto);
}
