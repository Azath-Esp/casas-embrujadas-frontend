import { usePreferencias } from '../context/PreferenciasContext';

export default function BotonesAmbiente() {
  const { linterna, sonido, alternarLinterna, alternarSonido } = usePreferencias();

  return (
    <div className="botones-ambiente">
      <button type="button" className="boton-ambiente" aria-pressed={linterna} onClick={alternarLinterna}
        aria-label="Modo linterna" title={linterna ? 'Apagar la linterna (Esc)' : 'Encender la linterna'}>
        <span aria-hidden="true">🔦</span>
      </button>
      <button type="button" className="boton-ambiente" aria-pressed={sonido} onClick={alternarSonido}
        aria-label="Sonido ambiente" title={sonido ? 'Silenciar' : 'Escuchar el ambiente'}>
        <span aria-hidden="true">{sonido ? '🔊' : '🔈'}</span>
      </button>
    </div>
  );
}
