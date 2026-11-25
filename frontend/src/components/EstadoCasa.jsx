
const TEXTOS = {
  DISPONIBLE: 'Disponible',
  RESERVADA: 'Reservada',
  VENDIDA: 'Vendida',
  INACTIVA: 'Inactiva',
};

export default function EstadoCasa({ estado }) {
  return <span className={`estado-casa estado-casa--${String(estado).toLowerCase()}`}>{TEXTOS[estado] ?? estado}</span>;
}
