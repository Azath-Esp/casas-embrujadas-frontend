import api from './api';

const BASE = '/api/v1/categorias';

export const categoriaService = {
  async listar() {
    const { data } = await api.get(BASE);
    return data;
  },
  async crear(categoria) {
    const { data } = await api.post(BASE, categoria);
    return data;
  },
  async actualizar(id, categoria) {
    const { data } = await api.put(`${BASE}/${id}`, categoria);
    return data;
  },
  async eliminar(id) {
    await api.delete(`${BASE}/${id}`);
  },
};
