import api from './api';
import { authService } from './authService';
import { boletaService, nombreDesdeEncabezado } from './boletaService';
import { favoritoService } from './favoritoService';
import { productoService } from './productoService';
import { reservaService } from './reservaService';
import { usuarioService } from './usuarioService';

describe('Servicios de la API', () => {
  beforeEach(() => {
    spyOn(api, 'get').and.resolveTo({ data: 'respuesta', headers: {} });
    spyOn(api, 'post').and.resolveTo({ data: 'creado' });
    spyOn(api, 'put').and.resolveTo({ data: 'actualizado' });
    spyOn(api, 'delete').and.resolveTo({});
  });

  it('el catálogo envía los filtros como parámetros y devuelve solo los datos', async () => {
    expect(await productoService.listar({ categoria: 2, region: 7 })).toBe('respuesta');
    expect(api.get).toHaveBeenCalledWith('/api/v1/productos', { params: { categoria: 2, region: 7 } });
  });

  it('el detalle usa la versión 2 y el comparador une los ids con comas', async () => {
    await productoService.obtenerDetalle(6);
    await productoService.comparar([1, 6, 9]);
    expect(api.get).toHaveBeenCalledWith('/api/v2/productos/6');
    expect(api.get).toHaveBeenCalledWith('/api/v1/productos/comparar', { params: { ids: '1,6,9' } });
  });

  it('el mapa filtra por región solo si se indica', async () => {
    await productoService.mapa();
    await productoService.mapa(7);
    expect(api.get.calls.argsFor(0)).toEqual(['/api/v1/productos/mapa', { params: {} }]);
    expect(api.get.calls.argsFor(1)).toEqual(['/api/v1/productos/mapa', { params: { region: 7 } }]);
  });

  it('login, compra, reserva y favorito llaman a la ruta correcta', async () => {
    await authService.login('cliente@casasembrujadas.cl', 'Cliente123!');
    await boletaService.comprar([6, 11]);
    await reservaService.reservar(5);
    await favoritoService.agregar(5);
    expect(api.post).toHaveBeenCalledWith('/api/v1/auth/login', { correo: 'cliente@casasembrujadas.cl', contrasena: 'Cliente123!' });
    expect(api.post).toHaveBeenCalledWith('/api/v1/boletas', { idsProductos: [6, 11] });
    expect(api.post).toHaveBeenCalledWith('/api/v1/reservas', { idProducto: 5 });
    expect(api.post).toHaveBeenCalledWith('/api/v1/favoritos/5');
  });

  it('cancelar, quitar favorito, anular boleta y editar perfil usan DELETE y PUT', async () => {
    await reservaService.cancelar(4);
    await favoritoService.quitar(5);
    await boletaService.cambiarEstado(2, 'ANULADA');
    await usuarioService.actualizarMiPerfil({ nombre: 'Camila' });
    expect(api.delete).toHaveBeenCalledWith('/api/v1/reservas/4');
    expect(api.delete).toHaveBeenCalledWith('/api/v1/favoritos/5');
    expect(api.put).toHaveBeenCalledWith('/api/v1/boletas/2/estado', { estado: 'ANULADA' });
    expect(api.put).toHaveBeenCalledWith('/api/v1/usuarios/me', { nombre: 'Camila' });
  });

  it('el PDF se pide como archivo y toma el nombre del encabezado', async () => {
    const archivo = new Blob(['%PDF']);
    api.get.and.resolveTo({ data: archivo, headers: { 'content-disposition': 'attachment; filename="boleta-0007.pdf"' } });
    const resultado = await boletaService.descargarPdf(7);
    expect(api.get).toHaveBeenCalledWith('/api/v1/boletas/7/pdf', { responseType: 'blob' });
    expect(resultado).toEqual({ archivo, nombre: 'boleta-0007.pdf' });
    expect(nombreDesdeEncabezado(undefined, 'boleta-7.pdf')).toBe('boleta-7.pdf');
  });
});
