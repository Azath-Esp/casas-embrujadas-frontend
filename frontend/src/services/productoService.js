import api from './api';

const BASE = '/api/v1/productos';

export const productoService = {
  async listar(filtros = {}) {
    const { data } = await api.get(BASE, { params: filtros });
    return data;
  },
  async obtener(id) {
    const { data } = await api.get(`${BASE}/${id}`);
    return data;
  },
  async obtenerDetalle(id) {
    const { data } = await api.get(`/api/v2/productos/${id}`);
    return data;
  },
  async mapa(idRegion) {
    const { data } = await api.get(`${BASE}/mapa`, { params: idRegion ? { region: idRegion } : {} });
    return data;
  },
  async comparar(ids) {
    const { data } = await api.get(`${BASE}/comparar`, { params: { ids: ids.join(',') } });
    return data;
  },
  async crear(producto) {
    const { data } = await api.post(BASE, producto);
    return data;
  },
  async actualizar(id, producto) {
    const { data } = await api.put(`${BASE}/${id}`, producto);
    return data;
  },
  async eliminar(id) {
    await api.delete(`${BASE}/${id}`);
  },
  async agregarImagen(id, imagen) {
    const { data } = await api.post(`${BASE}/${id}/imagenes`, imagen);
    return data;
  },
  async eliminarImagen(id, idImagen) {
    await api.delete(`${BASE}/${id}/imagenes/${idImagen}`);
  },
  async agregarMito(id, mito) {
    const { data } = await api.post(`${BASE}/${id}/mitos`, mito);
    return data;
  },
  async eliminarMito(id, idMito) {
    await api.delete(`${BASE}/${id}/mitos/${idMito}`);
  },
  async guardarFicha(id, ficha) {
    const { data } = await api.put(`${BASE}/${id}/ficha-paranormal`, ficha);
    return data;
  },
};
