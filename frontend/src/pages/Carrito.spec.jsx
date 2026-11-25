import { act } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Carrito from './Carrito';
import { AuthProvider } from '../context/AuthContext';
import { CarritoProvider } from '../context/CarritoContext';
import { boletaService } from '../services/boletaService';
import { productoService } from '../services/productoService';
import { reservaService } from '../services/reservaService';
import { esperarHasta, renderizar, sesionDePrueba, simularAlmacenamiento } from '../test-utils/renderizar';

const PALACIO = { idProducto: 6, titulo: 'Palacio Cousiño', precio: 100000, estado: 'DISPONIBLE', comuna: 'Santiago', region: 'Metropolitana', imagenPrincipal: null };

describe('Página Carrito y compra', () => {
  let vista;
  afterEach(() => vista.desmontar());

  const $ = (selector) => vista.contenedor.querySelector(selector);
  const boton = (texto) => [...vista.contenedor.querySelectorAll('button, a')].find((b) => b.textContent.includes(texto));
  const montar = () => {
    vista = renderizar(
      <MemoryRouter initialEntries={['/carrito']}>
        <AuthProvider>
          <CarritoProvider>
            <Routes>
              <Route path="/carrito" element={<Carrito />} />
              <Route path="/login" element={<p id="login">login</p>} />
            </Routes>
          </CarritoProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('a un visitante le muestra neto, IVA y total, y le pide iniciar sesión para pagar', async () => {
    simularAlmacenamiento({ carrito: '[6]' });
    spyOn(productoService, 'obtener').and.resolveTo(PALACIO);
    montar();
    await esperarHasta(() => vista.contenedor.textContent.includes('Palacio Cousiño'));

    expect(vista.contenedor.textContent).toContain('$19.000');
    expect(vista.contenedor.textContent).toContain('$119.000');
    expect(boton('Inicia sesión para comprar')).toBeDefined();
    expect(boton('Confirmar compra')).toBeUndefined();
  });

  it('un cliente confirma, se crea la boleta y el carrito queda vacío', async () => {
    simularAlmacenamiento({ carrito: '[6]', sesion: JSON.stringify(sesionDePrueba('CLIENTE')) });
    spyOn(productoService, 'obtener').and.resolveTo(PALACIO);
    spyOn(reservaService, 'misReservas').and.resolveTo([]);
    spyOn(boletaService, 'comprar').and.resolveTo({
      idBoleta: 7, numero: 7, total: 119000, detalles: [{ idProducto: 6, productoTitulo: 'Palacio Cousiño' }],
    });
    montar();
    await esperarHasta(() => boton('Confirmar compra') && !boton('Confirmar compra').disabled);

    act(() => boton('Confirmar compra').click());
    await esperarHasta(() => vista.contenedor.textContent.includes('Boleta N° 7'));

    expect(boletaService.comprar).toHaveBeenCalledWith([6]);
    expect(Storage.prototype.setItem).toHaveBeenCalledWith('carrito', '[]');
    expect(boton('Descargar boleta')).toBeDefined();
  });

  it('si otro la compró antes, muestra el mensaje del backend y bloquea la compra', async () => {
    simularAlmacenamiento({ carrito: '[6]', sesion: JSON.stringify(sesionDePrueba('CLIENTE')) });
    spyOn(productoService, 'obtener').and.returnValues(Promise.resolve(PALACIO), Promise.resolve({ ...PALACIO, estado: 'VENDIDA' }));
    spyOn(reservaService, 'misReservas').and.resolveTo([]);
    spyOn(boletaService, 'comprar').and.rejectWith({
      response: { status: 409, data: { mensaje: 'La casa "Palacio Cousiño" ya fue vendida' } },
    });
    montar();
    await esperarHasta(() => boton('Confirmar compra') && !boton('Confirmar compra').disabled);

    act(() => boton('Confirmar compra').click());
    await esperarHasta(() => $('.alert-danger') && vista.contenedor.textContent.includes('Vendida'));

    expect($('.alert-danger').textContent).toContain('ya fue vendida');
    expect(boton('Confirmar compra').disabled).toBeTrue();
  });
});
