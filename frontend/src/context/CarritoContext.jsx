import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { agregarAlCarrito, normalizarCarrito, quitarDelCarrito } from '../utils/carrito';

const CarritoContext = createContext(null);
const CLAVE = 'carrito';

function leerCarritoGuardado() {
  try {
    return normalizarCarrito(JSON.parse(localStorage.getItem(CLAVE)));
  } catch {
    return [];
  }
}

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState(leerCarritoGuardado);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(carrito));
    } catch {
      return;
    }
  }, [carrito]);

  const agregar = useCallback((id) => setCarrito((actual) => agregarAlCarrito(actual, id)), []);
  const quitar = useCallback((id) => setCarrito((actual) => quitarDelCarrito(actual, id)), []);
  const vaciar = useCallback(() => setCarrito([]), []);

  const valor = useMemo(() => ({
    carrito,
    cantidad: carrito.length,
    contiene: (id) => carrito.includes(id),
    agregar,
    quitar,
    vaciar,
  }), [carrito, agregar, quitar, vaciar]);

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCarrito() {
  return useContext(CarritoContext);
}
