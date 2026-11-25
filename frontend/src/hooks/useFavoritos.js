import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mensajeDeError } from '../services/api';
import { favoritoService } from '../services/favoritoService';

function alternarEn(conjunto, id) {
  const nuevo = new Set(conjunto);
  if (nuevo.has(id)) nuevo.delete(id);
  else nuevo.add(id);
  return nuevo;
}

export function useFavoritos() {
  const { tieneRol } = useAuth();
  const habilitado = tieneRol('CLIENTE');
  const [ids, setIds] = useState(() => new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    if (!habilitado) return undefined;
    let vigente = true;
    favoritoService.listar()
      .then((casas) => {
        if (vigente) setIds(new Set(casas.map((casa) => casa.idProducto)));
      })
      .catch((e) => {
        if (vigente) setError(mensajeDeError(e));
      });
    return () => {
      vigente = false;
    };
  }, [habilitado]);

  const alternar = useCallback(async (id) => {
    const eraFavorito = ids.has(id);
    setIds((actual) => alternarEn(actual, id));
    setError('');
    try {
      if (eraFavorito) await favoritoService.quitar(id);
      else await favoritoService.agregar(id);
    } catch (e) {
      setIds((actual) => alternarEn(actual, id));
      setError(mensajeDeError(e));
    }
  }, [ids]);

  return {
    habilitado,
    error,
    esFavorito: (id) => habilitado && ids.has(id),
    alternar,
  };
}
