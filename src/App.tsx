import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { PanelMesPage } from './features/mes/PanelMesPage';
import { AhorrosPage } from './features/ahorros/AhorrosPage';
import { DeudasPage } from './features/deudas/DeudasPage';
import { ProyeccionPage } from './features/proyeccion/ProyeccionPage';
import { SimuladorPage } from './features/simulador/SimuladorPage';
import { HistorialGastosPage } from './features/gastos/HistorialGastosPage';
import { HistorialIngresosPage } from './features/ingresos/HistorialIngresosPage';
import { ConfiguracionPage } from './features/configuracion/ConfiguracionPage';
import { PerfilUsuarioPage } from './features/perfil/PerfilUsuarioPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/mes" element={<PanelMesPage />} />
            <Route path="/ahorros" element={<AhorrosPage />} />
            <Route path="/deudas" element={<DeudasPage />} />
            <Route path="/proyeccion" element={<ProyeccionPage />} />
            <Route path="/simulador" element={<SimuladorPage />} />
            <Route path="/gastos" element={<HistorialGastosPage />} />
            <Route path="/ingresos" element={<HistorialIngresosPage />} />
            <Route path="/configuracion" element={<ConfiguracionPage />} />
            <Route path="/perfil" element={<PerfilUsuarioPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
