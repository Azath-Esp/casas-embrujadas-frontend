# Casas Embrujadas

![Pruebas del frontend](https://github.com/Azath-Esp/casas-embrujadas-frontend/actions/workflows/frontend.yml/badge.svg)

Tienda web de lugares embrujados reales de Chile: casonas, palacios, faros, pueblos salitreros y cuevas con historia… y con residentes que no figuran en la escritura.

Proyecto de la asignatura DSY1104 Desarrollo Full Stack II, Duoc UC.

| Evaluación | Contenido | Ubicación |
|---|---|---|
| EP1 | Sitio estático en HTML, CSS y JavaScript | raíz del repositorio (`*.html`, `css/`, `scripts/`) |
| EP2 | Migración a React y Bootstrap, con pruebas en Jasmine y Karma | carpeta `frontend/` |
| EP3 | Conexión con la API Spring Boot, roles, panel de administración y extras | carpeta `frontend/` |

- Repositorio del backend: https://github.com/Azath-Esp/casas-embrujadas-api
- Sitio publicado: se agrega en el capítulo 20 (Vercel)

## Funcionalidades

- Catálogo conectado a la API con filtros combinables (texto, categoría, región, precio, nivel de embrujo y estado) y paginación.
- Detalle de cada casa con galería, créditos de las fotos, ficha paranormal, mitos y mapa.
- Carrito de casas únicas con neto, IVA y total; compra con boleta y descarga en PDF.
- Reservas de 24 horas con cuenta regresiva, favoritos y comparador de hasta tres casas.
- Mapa de todas las casas con Leaflet y filtro por región.
- Registro e inicio de sesión con JWT, rutas protegidas por rol y páginas 403 y 404 propias.
- Panel por rol: el vendedor consulta casas y órdenes; el administrador además gestiona casas con su contenido, categorías, usuarios, reservas y anula boletas, con un dashboard de gráficos.
- Diseño morado y verde con paleta en variables CSS de contraste verificado, modo linterna y sonido ambiente generado en el navegador.
- Accesibilidad: foco visible, etiquetas `aria-*`, navegación con teclado y respeto por `prefers-reduced-motion`.

## Tecnologías

| Herramienta | Para qué |
|---|---|
| React 19 y Vite | Componentes, estado y servidor de desarrollo |
| React Router 7 | Rutas, rutas anidadas del panel y carga diferida |
| Bootstrap 5.3 | Grilla, formularios y modo oscuro |
| axios | Cliente HTTP con el token y los interceptores de 401 y 403 |
| Leaflet y react-leaflet | Mapa de las casas sobre OpenStreetMap |
| Recharts | Gráficos del dashboard |
| Fontsource | Fuentes Cinzel y Crimson Pro servidas desde el sitio |
| Jasmine, Karma y karma-coverage | Pruebas en un navegador real con informe de cobertura |

## Cómo ejecutarlo

Requisitos: Node.js 24 y Google Chrome o Microsoft Edge para las pruebas. El backend debe estar encendido (ver su README).

```powershell
git clone https://github.com/Azath-Esp/casas-embrujadas-frontend.git
cd casas-embrujadas-frontend/frontend
npm install
Copy-Item .env.example .env
npm run dev
```

`.env` define `VITE_API_URL`, la dirección del backend (por defecto `http://localhost:8080`).

| Comando (dentro de `frontend/`) | Qué hace |
|---|---|
| `npm run dev` | Sitio de desarrollo en http://localhost:5173 |
| `npm test` | Pruebas con Karma y resumen de cobertura |
| `npm run lint` | Revisión del código con ESLint |
| `npm run build` | Versión de producción en `frontend/dist/` |

## Pruebas

168 pruebas con Jasmine y Karma. La cobertura se mide sobre todo el código de `src` (70 % de las sentencias) y Karma falla si baja de 65 %.

| Grupo | Qué verifica |
|---|---|
| Servicios y `api.js` | Rutas, métodos y datos de cada llamada; token y avisos de 401 y 403 |
| Acceso por rol | 13 rutas por 4 roles: página, login o 403 |
| Flujos | Compra, favoritos, catálogo con filtros, login, detalle con reserva, formulario de casas |
| Componentes y utilidades | Comparador, cuenta regresiva, linterna, sonido, carrito, validaciones, RUN, sesión, mapa |

GitHub Actions ejecuta lint, pruebas y build en cada push y Pull Request a `main` y `develop` (`.github/workflows/frontend.yml`).

## Estructura

```
frontend/
├── public/img/              Portada, casos del blog e ilustración de respaldo
├── src/
│   ├── components/          Barra, tarjetas, mapa, linterna, cuenta regresiva…
│   ├── context/             Sesión, carrito y preferencias
│   ├── hooks/               useFavoritos
│   ├── pages/               Tienda, cuenta del cliente y panel (pages/panel)
│   ├── services/            api.js y un servicio por recurso de la API
│   ├── utils/               Formatos, carrito, validaciones, RUN, mapa, panel
│   ├── test-utils/          Ayudantes de las pruebas
│   ├── index.css            Paleta y estilos sobre Bootstrap
│   ├── App.jsx              Rutas
│   └── main.jsx             Punto de entrada
├── karma.conf.cjs           Pruebas y cobertura
└── vercel.json              Rutas de React al publicar
```

## Créditos

Las licencias de fuentes, librerías, mapa e imágenes están en [FUENTES.md](FUENTES.md). Las fotos de las casas vienen de la API y sus créditos están en el FUENTES.md del backend.

## Equipo

- Dinko Ocampo

Proyecto académico sin fines comerciales.
