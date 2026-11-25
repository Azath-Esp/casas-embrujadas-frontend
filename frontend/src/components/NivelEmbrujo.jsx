
export default function NivelEmbrujo({ nivel }) {
  return (
    <span className="nivel-embrujo" role="img" aria-label={`Nivel de embrujo ${nivel} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= nivel ? 'activo' : ''} aria-hidden="true">👻</span>
      ))}
    </span>
  );
}
