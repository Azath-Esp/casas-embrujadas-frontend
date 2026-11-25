import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RutaProtegida from './RutaProtegida';
import { AuthProvider } from '../context/AuthContext';
import { renderizar, sesionDePrueba, simularAlmacenamiento } from '../test-utils/renderizar';

describe('RutaProtegida', () => {
  let vista;
  const montar = () => renderizar(
    <MemoryRouter initialEntries={['/privada']}>
      <AuthProvider>
        <Routes>
          <Route path="/privada" element={<RutaProtegida roles={['CLIENTE']}><p id="privada">contenido</p></RutaProtegida>} />
          <Route path="/login" element={<p id="login">login</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

  afterEach(() => vista.desmontar());

  it('sin sesión lleva al login', () => {
    simularAlmacenamiento();
    vista = montar();
    expect(vista.contenedor.querySelector('#login')).not.toBeNull();
  });

  it('con una sesión vencida también lleva al login', () => {
    simularAlmacenamiento({ sesion: JSON.stringify(sesionDePrueba('CLIENTE', 'Camila', -1)) });
    vista = montar();
    expect(vista.contenedor.querySelector('#login')).not.toBeNull();
  });

  it('con un rol no permitido muestra la página 403 y no el contenido', () => {
    simularAlmacenamiento({ sesion: JSON.stringify(sesionDePrueba('VENDEDOR')) });
    vista = montar();
    expect(vista.contenedor.textContent).toContain('Los espíritus no te dejan pasar');
    expect(vista.contenedor.querySelector('#privada')).toBeNull();
  });

  it('con el rol permitido muestra el contenido', () => {
    simularAlmacenamiento({ sesion: JSON.stringify(sesionDePrueba('CLIENTE')) });
    vista = montar();
    expect(vista.contenedor.querySelector('#privada')).not.toBeNull();
  });
});
