import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import EstadoCasa from './EstadoCasa';
import { calcularLimites, CENTRO_CHILE, clasePin, ZOOM_CHILE } from '../utils/mapa';
import { formatearPrecio } from '../utils/formato';

const iconos = {};

function iconoPara(estado) {
  if (!iconos[estado]) {
    iconos[estado] = L.divIcon({
      className: clasePin(estado),
      html: '<span class="pin__punta"></span>',
      iconSize: [26, 26],
      iconAnchor: [13, 26],
      popupAnchor: [0, -24],
    });
  }
  return iconos[estado];
}

function Encuadre({ casas }) {
  const mapa = useMap();

  useEffect(() => {
    const limites = calcularLimites(casas);
    if (!limites) {
      mapa.setView(CENTRO_CHILE, ZOOM_CHILE);
    } else if (casas.length === 1) {
      mapa.setView(limites[0], 15);
    } else {
      mapa.fitBounds(limites, { padding: [40, 40], maxZoom: 14 });
    }
  }, [casas, mapa]);

  return null;
}

export default function MapaCasas({ casas, alto = '520px', conEnlace = true }) {
  return (
    <MapContainer center={CENTRO_CHILE} zoom={ZOOM_CHILE} scrollWheelZoom={false} className="mapa-casas" style={{ height: alto }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      {casas.map((casa) => (
        <Marker key={casa.idProducto} position={[casa.latitud, casa.longitud]} icon={iconoPara(casa.estado)}
          title={casa.titulo} alt={`${casa.titulo}, ${casa.estado.toLowerCase()}`}>
          <Popup>
            <div className="mapa-popup">
              {casa.imagenPrincipal && <img src={casa.imagenPrincipal} alt="" />}
              <strong>{casa.titulo}</strong>
              <div><EstadoCasa estado={casa.estado} /></div>
              <span>{formatearPrecio(casa.precio)} + IVA</span>
              {conEnlace && <Link to={`/producto/${casa.idProducto}`}>Ver ficha</Link>}
            </div>
          </Popup>
        </Marker>
      ))}
      <Encuadre casas={casas} />
    </MapContainer>
  );
}
