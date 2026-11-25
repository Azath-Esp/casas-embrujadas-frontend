import api from './api';

export const ubicacionService = {
  async listarRegiones() {
    const { data } = await api.get('/api/v1/regiones');
    return data;
  },
  async listarComunas(idRegion) {
    const { data } = await api.get(`/api/v1/regiones/${idRegion}/comunas`);
    return data;
  },
};
