import api from './api';

const BASE = '/api/v1/reservas';

export const reservaService = {
  async reservar(idProducto) {
    const { data } = await api.post(BASE, { idProducto });
    return data;
  },
  async misReservas() {
    const { data } = await api.get(`${BASE}/mis-reservas`);
    return data;
  },
  async cancelar(id) {
    await api.delete(`${BASE}/${id}`);
  },
  async listarTodas() {
    const { data } = await api.get(BASE);
    return data;
  },
};
