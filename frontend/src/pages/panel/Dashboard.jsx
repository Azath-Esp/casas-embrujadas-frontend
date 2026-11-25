import { useEffect, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { mensajeDeError } from '../../services/api';
import { dashboardService } from '../../services/dashboardService';
import { formatearPrecio } from '../../utils/formato';
import { COLOR_PRINCIPAL, COLORES_ESTADO, formatearMes, formatearMillones, TEMA } from '../../utils/panel';

const NOMBRES_ESTADO = { DISPONIBLE: 'Disponible', RESERVADA: 'Reservada', VENDIDA: 'Vendida', INACTIVA: 'Inactiva' };
const EJES = { stroke: TEMA.textoSuave, fontSize: 12 };
const TOOLTIP = { contentStyle: { background: TEMA.superficie, border: `1px solid ${TEMA.borde}`, color: TEMA.texto }, itemStyle: { color: TEMA.texto } };

function Indicador({ titulo, valor, detalle }) {
  return (
    <div className="col-6 col-xl-3">
      <div className="indicador">
        <p className="indicador__titulo">{titulo}</p>
        <p className="indicador__valor">{valor}</p>
        {detalle && <p className="indicador__detalle">{detalle}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [estado, setEstado] = useState({ datos: null, error: '' });

  useEffect(() => {
    dashboardService.resumen()
      .then((datos) => setEstado({ datos, error: '' }))
      .catch((e) => setEstado({ datos: null, error: mensajeDeError(e) }));
  }, []);

  if (estado.error) return <div className="alert alert-danger" role="alert">{estado.error}</div>;
  if (!estado.datos) return <p className="placeholder-glow" aria-busy="true"><span className="placeholder col-12"></span></p>;

  const { datos } = estado;
  const ventas = datos.ventasPorMes.map((v) => ({ ...v, mes: formatearMes(v.mes), ingresos: Number(v.ingresos) }));
  const estados = datos.casasPorEstado.filter((e) => e.cantidad > 0);
  const disponibles = datos.casasPorEstado.find((e) => e.etiqueta === 'DISPONIBLE')?.cantidad ?? 0;

  return (
    <>
      <h1 className="h2 mb-4">Dashboard</h1>
      <div className="row g-3 mb-4">
        <Indicador titulo="Ingresos" valor={formatearMillones(datos.ingresosTotales)} detalle={formatearPrecio(datos.ingresosTotales)} />
        <Indicador titulo="Ventas" valor={datos.ventasTotales} detalle="boletas pagadas" />
        <Indicador titulo="Reservas activas" valor={datos.reservasActivas} detalle="vencen en 24 horas" />
        <Indicador titulo="Casas disponibles" valor={disponibles} detalle="publicadas a la venta" />
      </div>

      <div className="row g-4">
        <figure className="col-12 col-xl-8 grafico">
          <figcaption>Ingresos por mes, últimos 12 meses</figcaption>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ventas} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid stroke={TEMA.borde} vertical={false} />
              <XAxis dataKey="mes" tick={EJES} stroke={TEMA.borde} />
              <YAxis tickFormatter={formatearMillones} tick={EJES} stroke={TEMA.borde} width={90} />
              <Tooltip {...TOOLTIP} cursor={{ fill: 'rgba(79, 240, 160, 0.08)' }}
                formatter={(valor, nombre, item) => [`${formatearPrecio(valor)} (${item.payload.ventas} ventas)`, 'Ingresos']} />
              <Bar dataKey="ingresos" name="Ingresos" fill={COLOR_PRINCIPAL} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </figure>

        <figure className="col-12 col-md-6 col-xl-4 grafico">
          <figcaption>Casas por estado</figcaption>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={estados} dataKey="cantidad" nameKey="etiqueta" innerRadius={55} outerRadius={95} paddingAngle={2}
                label={({ cantidad }) => cantidad} stroke="#0f0a16">
                {estados.map((e) => <Cell key={e.etiqueta} fill={COLORES_ESTADO[e.etiqueta]} />)}
              </Pie>
              <Tooltip {...TOOLTIP} formatter={(valor, nombre) => [valor, NOMBRES_ESTADO[nombre] ?? nombre]} />
              <Legend wrapperStyle={{ fontSize: 12 }} formatter={(valor) => <span className="leyenda-grafico">{NOMBRES_ESTADO[valor] ?? valor}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </figure>

        <figure className="col-12 col-md-6 grafico">
          <figcaption>Categorías más vendidas</figcaption>
          {datos.categoriasMasVendidas.length === 0 ? <p className="text-secondary">Sin ventas todavía.</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={datos.categoriasMasVendidas} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid stroke={TEMA.borde} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={EJES} stroke={TEMA.borde} />
                <YAxis type="category" dataKey="etiqueta" width={140} tick={EJES} stroke={TEMA.borde} />
                <Tooltip {...TOOLTIP} cursor={{ fill: 'rgba(79, 240, 160, 0.08)' }} formatter={(valor) => [valor, 'Casas vendidas']} />
                <Bar dataKey="cantidad" fill={TEMA.violeta} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </figure>

        <figure className="col-12 col-md-6 grafico">
          <figcaption>Casas más guardadas como favoritas</figcaption>
          {datos.topFavoritos.length === 0 ? <p className="text-secondary">Nadie ha marcado favoritos todavía.</p> : (
            <ol className="ranking">
              {datos.topFavoritos.map((casa) => (
                <li key={casa.etiqueta}><span>{casa.etiqueta}</span><strong>♥ {casa.cantidad}</strong></li>
              ))}
            </ol>
          )}
        </figure>
      </div>
    </>
  );
}
