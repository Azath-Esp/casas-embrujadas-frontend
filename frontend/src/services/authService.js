import api from './api';

export const authService = {
  async login(correo, contrasena) {
    const { data } = await api.post('/api/v1/auth/login', { correo, contrasena });
    return data;
  },
  async registro(datos) {
    const { data } = await api.post('/api/v1/auth/registro', datos);
    return data;
  },
  async me() {
    const { data } = await api.get('/api/v1/auth/me');
    return data;
  },
};
