import api from './api';

const BASE = '/api/v1/boletas';

export function nombreDesdeEncabezado(encabezado, porDefecto) {
  const coincidencia = /filename="?([^";]+)"?/i.exec(encabezado ?? '');
  return coincidencia ? coincidencia[1] : porDefecto;
}

export const boletaService = {
  async comprar(idsProductos) {
    const { data } = await api.post(BASE, { idsProductos });
    return data;
  },
  async misBoletas() {
    const { data } = await api.get(`${BASE}/mis-boletas`);
    return data;
  },
  async listar() {
    const { data } = await api.get(BASE);
    return data;
  },
  async obtener(id) {
    const { data } = await api.get(`${BASE}/${id}`);
    return data;
  },
  async cambiarEstado(id, estado) {
    const { data } = await api.put(`${BASE}/${id}/estado`, { estado });
    return data;
  },
  async descargarPdf(id) {
    const respuesta = await api.get(`${BASE}/${id}/pdf`, { responseType: 'blob' });
    return {
      archivo: respuesta.data,
      nombre: nombreDesdeEncabezado(respuesta.headers['content-disposition'], `boleta-${id}.pdf`),
    };
  },
};
