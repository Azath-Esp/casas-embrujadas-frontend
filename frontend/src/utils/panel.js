
export const ROLES_PANEL = ['ADMIN', 'VENDEDOR'];

const MENU = [
  { ruta: '/panel', texto: 'Dashboard', roles: ['ADMIN'], exacta: true },
  { ruta: '/panel/productos', texto: 'Casas', roles: ['ADMIN', 'VENDEDOR'] },
  { ruta: '/panel/boletas', texto: 'Órdenes', roles: ['ADMIN', 'VENDEDOR'] },
  { ruta: '/panel/reservas', texto: 'Reservas', roles: ['ADMIN'] },
  { ruta: '/panel/categorias', texto: 'Categorías', roles: ['ADMIN'] },
  { ruta: '/panel/usuarios', texto: 'Usuarios', roles: ['ADMIN'] },
];

export function opcionesMenu(rol) {
  return MENU.filter((opcion) => opcion.roles.includes(rol));
}

export const COLORES_ESTADO = {
  DISPONIBLE: '#3fbf6a',
  RESERVADA: '#ffb02e',
  VENDIDA: '#8a7a9c',
  INACTIVA: '#4a3d57',
};

export const COLOR_PRINCIPAL = '#ff7a1a';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function formatearMes(mes) {
  const [anio, numero] = String(mes).split('-').map(Number);
  if (!anio || !numero) return String(mes);
  return `${MESES[numero - 1]} ${String(anio).slice(2)}`;
}

export function formatearMillones(valor) {
  const numero = Number(valor) || 0;
  if (numero >= 1000000000) return `$${(numero / 1000000000).toLocaleString('es-CL', { maximumFractionDigits: 1 })} mil M`;
  if (numero >= 1000000) return `$${(numero / 1000000).toLocaleString('es-CL', { maximumFractionDigits: 1 })} M`;
  return `$${numero.toLocaleString('es-CL')}`;
}
