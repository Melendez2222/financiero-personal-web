import { Box } from '@mui/material';
import { usePeriodoActivo } from '../../context/PeriodoContext';
import { useDashboard } from '../../api/hooks/useDashboard';
import { useResumenPeriodo } from '../../api/hooks/usePeriodos';
import { useSettings } from '../../context/SettingsContext';
import { KpiCard } from '../../components/ui/KpiCard';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { tipoColor, tipoIcon } from '../../components/ui/tipoVisual';
import { FlujoChart } from './components/FlujoChart';
import { DisponibleHero } from './components/DisponibleHero';
import { DesgloseDonut } from './components/DesgloseDonut';
import { MetasProgreso } from './components/MetasProgreso';
import type { DashboardData } from '../../api/dashboard.api';
import type { Tipo } from '../../types';

const KPIS: { key: keyof DashboardData['kpis']; label: string; tipo: Tipo; invert: boolean }[] = [
  { key: 'ingresos', label: 'Ingresos', tipo: 'Ingreso', invert: false },
  { key: 'fijos', label: 'Gastos fijos', tipo: 'Fijo', invert: true },
  { key: 'necesarios', label: 'Gastos necesarios', tipo: 'Necesario', invert: true },
  { key: 'deudas', label: 'Deudas', tipo: 'Deuda', invert: true },
  { key: 'ahorros', label: 'Ahorros', tipo: 'Ahorro', invert: false },
];

export function DashboardPage() {
  const { periodoId } = usePeriodoActivo();
  const { data: dash, isLoading } = useDashboard(periodoId);
  const { data: resumen } = useResumenPeriodo(periodoId);
  const { money } = useSettings();

  if (!periodoId) {
    return <EmptyState>No hay meses todavía. Crea uno en Configuración.</EmptyState>;
  }
  if (isLoading || !dash) return <Loading />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
      {/* KPIs */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
          gap: 2,
        }}
      >
        {KPIS.map((k) => {
          const { main, soft } = tipoColor[k.tipo];
          return (
            <KpiCard
              key={k.key}
              label={k.label}
              value={money(dash.kpis[k.key].actual)}
              accent={main}
              soft={soft}
              icon={tipoIcon[k.tipo]}
              deltaPct={dash.kpis[k.key].deltaPct}
              invertDelta={k.invert}
            />
          );
        })}
      </Box>

      {/* Flujo + Disponible */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' }, gap: 2 }}>
        <FlujoChart datos={dash.flujoMeses} />
        {resumen && <DisponibleHero flujo={resumen.flujo} disponible={dash.disponible} />}
      </Box>

      {/* Desglose + Metas */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' }, gap: 2 }}>
        <DesgloseDonut desglose={dash.desglose} />
        <MetasProgreso metas={dash.metas} />
      </Box>
    </Box>
  );
}
