
export default function BotonFavorito({ activo, onClick, nombre }) {
  return (
    <button
      type="button"
      className={`boton-favorito ${activo ? 'activo' : ''}`}
      aria-pressed={activo}
      aria-label={activo ? `Quitar ${nombre} de favoritos` : `Agregar ${nombre} a favoritos`}
      title={activo ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      onClick={onClick}
    >
      {activo ? '♥' : '♡'}
    </button>
  );
}
