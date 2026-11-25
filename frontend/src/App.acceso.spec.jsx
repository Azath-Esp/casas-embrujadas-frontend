import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CarritoProvider } from './context/CarritoContext';
import { PreferenciasProvider } from './context/PreferenciasContext';
import { esperarHasta, renderizar, sesionDePrueba, simularAlmacenamiento, simularApi } from './test-utils/renderizar';

const PAGINA_VACIA = { contenido: [], pagina: 0, tamano: 15, totalElementos: 0, totalPaginas: 0 };
const RESPUESTAS = {
  'GET .*/usuarios/me$': { run: '33333333-3', nombre: 'Camila', apellidos: 'Reyes', correo: 'cliente@casasembrujadas.cl', rol: 'CLIENTE', direccion: null, idComuna: 11, comuna: 'Providencia', region: 'Metropolitana' },
  'GET .*/boletas/mis-boletas$': [],
  'GET .*/reservas/mis-reservas$': [],
  'GET .*/favoritos$': [],
  'GET .*/dashboard/resumen$': { ventasPorMes: [], ingresosTotales: 0, ventasTotales: 0, casasPorEstado: [], categoriasMasVendidas: [], reservasActivas: 0, topFavoritos: [] },
  'GET .*/api/v1/productos$': PAGINA_VACIA,
  'GET .*/boletas$': [],
  'GET .*/usuarios$': [],
  'GET .*/categorias$': [],
  'GET .*/reservas$': [],
  'GET .*/regiones$': [],
};

const LOGIN = 'Iniciar sesión';
const PROHIBIDO = 'Los espíritus no te dejan pasar';

const CASOS = [
  ['/mi-cuenta', { visitante: LOGIN, CLIENTE: 'Mi cuenta', VENDEDOR: PROHIBIDO, ADMIN: 'Mi cuenta' }],
  ['/mis-compras', { visitante: LOGIN, CLIENTE: 'Mis compras', VENDEDOR: PROHIBIDO, ADMIN: PROHIBIDO }],
  ['/mis-reservas', { visitante: LOGIN, CLIENTE: 'Mis reservas', VENDEDOR: PROHIBIDO, ADMIN: PROHIBIDO }],
  ['/favoritos', { visitante: LOGIN, CLIENTE: 'Favoritos', VENDEDOR: PROHIBIDO, ADMIN: PROHIBIDO }],
  ['/panel', { visitante: LOGIN, CLIENTE: PROHIBIDO, VENDEDOR: 'Casas', ADMIN: 'Dashboard' }],
  ['/panel/productos', { visitante: LOGIN, CLIENTE: PROHIBIDO, VENDEDOR: 'Casas', ADMIN: 'Casas' }],
  ['/panel/boletas', { visitante: LOGIN, CLIENTE: PROHIBIDO, VENDEDOR: 'Órdenes', ADMIN: 'Órdenes' }],
  ['/panel/productos/nuevo', { visitante: LOGIN, CLIENTE: PROHIBIDO, VENDEDOR: PROHIBIDO, ADMIN: 'Nueva casa' }],
  ['/panel/usuarios', { visitante: LOGIN, CLIENTE: PROHIBIDO, VENDEDOR: PROHIBIDO, ADMIN: 'Usuarios' }],
  ['/panel/categorias', { visitante: LOGIN, CLIENTE: PROHIBIDO, VENDEDOR: PROHIBIDO, ADMIN: 'Categorías' }],
  ['/panel/reservas', { visitante: LOGIN, CLIENTE: PROHIBIDO, VENDEDOR: PROHIBIDO, ADMIN: 'Reservas' }],
  ['/comparar', { visitante: 'Comparar casas', CLIENTE: 'Comparar casas', VENDEDOR: 'Comparar casas', ADMIN: 'Comparar casas' }],
  ['/una-ruta-que-no-existe', { visitante: 'Esta habitación no existe', CLIENTE: 'Esta habitación no existe', VENDEDOR: 'Esta habitación no existe', ADMIN: 'Esta habitación no existe' }],
];

describe('Acceso por rol a cada ruta', () => {
  let vista;
  afterEach(() => vista?.desmontar());

  const titulo = () => vista.contenedor.querySelector('main h1')?.textContent ?? '';

  CASOS.forEach(([ruta, esperado]) => {
    Object.entries(esperado).forEach(([rol, texto]) => {
      it(`${rol} en ${ruta} ve «${texto}»`, async () => {
        simularAlmacenamiento(rol === 'visitante' ? {} : { sesion: JSON.stringify(sesionDePrueba(rol)) });
        simularApi(RESPUESTAS);
        vista = renderizar(
          <MemoryRouter initialEntries={[ruta]}>
            <PreferenciasProvider>
              <AuthProvider>
                <CarritoProvider><App /></CarritoProvider>
              </AuthProvider>
            </PreferenciasProvider>
          </MemoryRouter>
        );
        await esperarHasta(() => titulo().includes(texto));
        expect(titulo()).toContain(texto);
      });
    });
  });
});
