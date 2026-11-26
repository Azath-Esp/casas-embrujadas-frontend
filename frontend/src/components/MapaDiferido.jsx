import { lazy, Suspense } from 'react';

const MapaCasas = lazy(() => import('./MapaCasas'));

export default function MapaDiferido({ alto = '520px', ...props }) {
  return (
    <Suspense fallback={<div className="mapa-casas mapa-casas--cargando" style={{ height: alto }} aria-busy="true">Cargando mapa…</div>}>
      <MapaCasas alto={alto} {...props} />
    </Suspense>
  );
}
