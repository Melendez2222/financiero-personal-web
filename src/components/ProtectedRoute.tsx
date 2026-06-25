import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SettingsProvider } from '../context/SettingsContext';
import { PeriodoProvider } from '../context/PeriodoContext';
import { AppLayout } from './layout/AppLayout';

/** Protege las rutas internas y monta los providers de configuración y periodo activo. */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <SettingsProvider>
      <PeriodoProvider>
        <AppLayout />
      </PeriodoProvider>
    </SettingsProvider>
  );
}
