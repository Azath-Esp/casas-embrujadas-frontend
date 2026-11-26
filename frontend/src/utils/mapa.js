
export const CENTRO_CHILE = [-35.6, -71.5];
export const ZOOM_CHILE = 4;

export const ESTADOS_MAPA = [
  { estado: 'DISPONIBLE', texto: 'Disponible' },
  { estado: 'RESERVADA', texto: 'Reservada' },
  { estado: 'VENDIDA', texto: 'Vendida' },
];

export function conCoordenadas(casas) {
  return casas
    .map((casa) => ({ ...casa, latitud: Number(casa.latitud), longitud: Number(casa.longitud) }))
    .filter((casa) => casa.latitud !== 0 && casa.longitud !== 0)
    .filter((casa) => Number.isFinite(casa.latitud) && Number.isFinite(casa.longitud));
}

export function calcularLimites(casas) {
  if (casas.length === 0) return null;
  const latitudes = casas.map((casa) => casa.latitud);
  const longitudes = casas.map((casa) => casa.longitud);
  return [
    [Math.min(...latitudes), Math.min(...longitudes)],
    [Math.max(...latitudes), Math.max(...longitudes)],
  ];
}

export function contarPorEstado(casas) {
  return casas.reduce((conteo, casa) => ({ ...conteo, [casa.estado]: (conteo[casa.estado] ?? 0) + 1 }), {});
}

export function clasePin(estado) {
  return `pin pin--${String(estado).toLowerCase()}`;
}
