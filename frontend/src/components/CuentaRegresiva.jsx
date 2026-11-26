import { useEffect, useState } from 'react';
import { formatearRestante } from '../utils/formato';

function restante(hasta) {
  return Math.max(0, new Date(hasta).getTime() - Date.now());
}

export default function CuentaRegresiva({ hasta, onTerminar }) {
  const [milisegundos, setMilisegundos] = useState(() => restante(hasta));

  useEffect(() => {
    const intervalo = setInterval(() => {
      const nuevo = restante(hasta);
      setMilisegundos(nuevo);
      if (nuevo === 0) {
        clearInterval(intervalo);
        onTerminar?.();
      }
    }, 1000);
    return () => clearInterval(intervalo);
  }, [hasta, onTerminar]);

  return (
    <span className="cuenta-regresiva" role="timer" aria-live="off">
      {milisegundos === 0 ? 'Expirada' : formatearRestante(milisegundos)}
    </span>
  );
}
