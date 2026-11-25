import api from './api';

const BASE = '/api/v1/usuarios';

export const usuarioService = {
  async listar() {
    const { data } = await api.get(BASE);
    return data;
  },
  async obtener(id) {
    const { data } = await api.get(`${BASE}/${id}`);
    return data;
  },
  async crear(usuario) {
    const { data } = await api.post(BASE, usuario);
    return data;
  },
  async actualizar(id, usuario) {
    const { data } = await api.put(`${BASE}/${id}`, usuario);
    return data;
  },
  async eliminar(id) {
    await api.delete(`${BASE}/${id}`);
  },
  async miPerfil() {
    const { data } = await api.get(`${BASE}/me`);
    return data;
  },
  async actualizarMiPerfil(perfil) {
    const { data } = await api.put(`${BASE}/me`, perfil);
    return data;
  },
};
