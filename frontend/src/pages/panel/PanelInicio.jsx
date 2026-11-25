import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Dashboard = lazy(() => import('./Dashboard'));

export default function PanelInicio() {
  const { rol } = useAuth();
  if (rol !== 'ADMIN') return <Navigate to="/panel/productos" replace />;

  return (
    <Suspense fallback={<p className="text-secondary" aria-busy="true">Cargando dashboard…</p>}>
      <Dashboard />
    </Suspense>
  );
}
