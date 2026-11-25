import { act } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Detalle from './Detalle';
import { AuthProvider } from '../context/AuthContext';
import { CarritoProvider } from '../context/CarritoContext';
import { favoritoService } from '../services/favoritoService';
import { productoService } from '../services/productoService';
import { reservaService } from '../services/reservaService';
import { esperarHasta, renderizar, sesionDePrueba, simularAlmacenamiento } from '../test-utils/renderizar';

const CASA = {
  idProducto: 5, titulo: 'Cueva de Quicaví', descripcion: 'La casa grande de los brujos.', precio: 320000000,
  direccion: 'Quicaví', metrosCuadrados: 120, dormitorios: 0, banos: 0, nivelEmbrujo: 5, estado: 'DISPONIBLE',
  comuna: 'Quemchi', region: 'Los Lagos', latitud: null, longitud: null, imagenes: [], categorias: [],
  mitos: [{ idMito: 1, titulo: 'La Recta Provincia', relato: 'Sociedad de brujos.', anioOrigen: 1880, fuente: null }],
  fichaParanormal: null,
};

describe('Página Detalle', () => {
  let vista;
  afterEach(() => vista.desmontar());

  const boton = (texto) => [...vista.contenedor.querySelectorAll('button, a')].find((b) => b.textContent.includes(texto));
  const montar = () => {
    vista = renderizar(
      <MemoryRouter initialEntries={['/producto/5']}>
        <AuthProvider>
          <CarritoProvider>
            <Routes><Route path="/producto/:id" element={<Detalle />} /></Routes>
          </CarritoProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('si la casa no existe muestra el mensaje de no encontrada', async () => {
    simularAlmacenamiento();
    spyOn(productoService, 'obtenerDetalle').and.rejectWith({ response: { status: 404, data: { mensaje: 'No existe' } } });
    montar();
    await esperarHasta(() => vista.contenedor.textContent.includes('Propiedad no encontrada'));
    expect(productoService.obtenerDetalle).toHaveBeenCalledWith('5');
  });

  it('al visitante le ofrece el carrito y le pide iniciar sesión para reservar', async () => {
    simularAlmacenamiento();
    spyOn(productoService, 'obtenerDetalle').and.resolveTo(CASA);
    montar();
    await esperarHasta(() => vista.contenedor.textContent.includes('Cueva de Quicaví'));
    expect(vista.contenedor.textContent).toContain('La Recta Provincia');
    expect(boton('Añadir al carrito')).toBeDefined();
    expect(boton('Inicia sesión para reservar')).toBeDefined();
    expect(boton('Reservar 24 horas')).toBeUndefined();
  });

  it('el cliente reserva y aparece la cuenta regresiva con la opción de cancelar', async () => {
    simularAlmacenamiento({ sesion: JSON.stringify(sesionDePrueba('CLIENTE')) });
    const expira = new Date(Date.now() + 24 * 3600 * 1000);
    const local = new Date(expira.getTime() - expira.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
    spyOn(productoService, 'obtenerDetalle').and.returnValues(Promise.resolve(CASA), Promise.resolve({ ...CASA, estado: 'RESERVADA' }));
    spyOn(reservaService, 'misReservas').and.returnValues(Promise.resolve([]),
      Promise.resolve([{ idReserva: 9, idProducto: 5, estado: 'ACTIVA', fechaExpiracion: local }]));
    spyOn(reservaService, 'reservar').and.resolveTo({ idReserva: 9 });
    spyOn(favoritoService, 'listar').and.resolveTo([]);
    montar();
    await esperarHasta(() => boton('Reservar 24 horas'));

    act(() => boton('Reservar 24 horas').click());
    await esperarHasta(() => vista.contenedor.querySelector('[role="timer"]'));

    expect(reservaService.reservar).toHaveBeenCalledWith(5);
    expect(vista.contenedor.querySelector('[role="timer"]').textContent).toMatch(/^2[34]:\d\d:\d\d$/);
    expect(boton('Cancelar reserva')).toBeDefined();
    expect(vista.contenedor.textContent).toContain('Reservada');
  });
});
