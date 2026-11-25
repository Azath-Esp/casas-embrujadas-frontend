import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { crearAmbiente } from '../utils/ambiente';
import { guardarPreferencias, leerPreferencias } from '../utils/preferencias';

const PreferenciasContext = createContext(null);

export function PreferenciasProvider({ children }) {
  const [linterna, setLinterna] = useState(() => leerPreferencias().linterna);
  const [sonido, setSonido] = useState(false);
  const ambiente = useRef(null);

  useEffect(() => {
    guardarPreferencias({ linterna });
  }, [linterna]);

  useEffect(() => {
    if (!sonido) return undefined;
    function alCambiarVisibilidad() {
      if (document.hidden) ambiente.current?.detener();
      else ambiente.current?.iniciar();
    }
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    return () => document.removeEventListener('visibilitychange', alCambiarVisibilidad);
  }, [sonido]);

  const alternarLinterna = useCallback(() => setLinterna((actual) => !actual), []);
  const apagarLinterna = useCallback(() => setLinterna(false), []);

  const alternarSonido = useCallback(async () => {
    ambiente.current ??= crearAmbiente();
    if (sonido) {
      setSonido(false);
      await ambiente.current.detener();
    } else if (await ambiente.current.iniciar()) {
      setSonido(true);
    }
  }, [sonido]);

  const valor = useMemo(() => ({
    linterna, sonido, alternarLinterna, apagarLinterna, alternarSonido,
  }), [linterna, sonido, alternarLinterna, apagarLinterna, alternarSonido]);

  return <PreferenciasContext.Provider value={valor}>{children}</PreferenciasContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePreferencias() {
  return useContext(PreferenciasContext);
}
