import api from './api';

const BASE = '/api/v1/favoritos';

export const favoritoService = {
  async listar() {
    const { data } = await api.get(BASE);
    return data;
  },
  async agregar(idProducto) {
    await api.post(`${BASE}/${idProducto}`);
  },
  async quitar(idProducto) {
    await api.delete(`${BASE}/${idProducto}`);
  },
};
