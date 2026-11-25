import { useEffect, useRef } from 'react';
import { usePreferencias } from '../context/PreferenciasContext';

export default function Linterna() {
  const { linterna, apagarLinterna } = usePreferencias();
  const capa = useRef(null);

  useEffect(() => {
    if (!linterna) return undefined;
    let cuadro = 0;

    function mover(x, y) {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(() => {
        capa.current?.style.setProperty('--luz-x', `${Math.round(x)}px`);
        capa.current?.style.setProperty('--luz-y', `${Math.round(y)}px`);
      });
    }
    function alMover(e) {
      mover(e.clientX, e.clientY);
    }
    function alEnfocar(e) {
      const caja = e.target.getBoundingClientRect?.();
      if (caja) mover(caja.left + caja.width / 2, caja.top + caja.height / 2);
    }
    function alPresionarTecla(e) {
      if (e.key === 'Escape') apagarLinterna();
    }

    mover(window.innerWidth / 2, window.innerHeight / 2);
    window.addEventListener('pointermove', alMover, { passive: true });
    document.addEventListener('focusin', alEnfocar);
    document.addEventListener('keydown', alPresionarTecla);
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener('pointermove', alMover);
      document.removeEventListener('focusin', alEnfocar);
      document.removeEventListener('keydown', alPresionarTecla);
    };
  }, [linterna, apagarLinterna]);

  if (!linterna) return null;

  return (
    <>
      <div ref={capa} className="linterna" aria-hidden="true" data-testid="linterna" />
      <p className="linterna__aviso" role="status">Modo linterna · Esc para salir</p>
    </>
  );
}
