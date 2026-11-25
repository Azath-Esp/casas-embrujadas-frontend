import api from './api';

export const dashboardService = {
  async resumen() {
    const { data } = await api.get('/api/v1/dashboard/resumen');
    return data;
  },
};
