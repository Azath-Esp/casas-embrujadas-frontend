import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'leaflet/dist/leaflet.css';
import '@fontsource-variable/cinzel/wght.css';
import '@fontsource-variable/crimson-pro/wght.css';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { CarritoProvider } from './context/CarritoContext';
import { PreferenciasProvider } from './context/PreferenciasContext';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PreferenciasProvider>
        <AuthProvider>
          <CarritoProvider>
            <App />
          </CarritoProvider>
        </AuthProvider>
      </PreferenciasProvider>
    </BrowserRouter>
  </StrictMode>,
);
