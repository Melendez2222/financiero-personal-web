import { Box, Card } from '@mui/material';
import { useSettings } from '../../../context/SettingsContext';
import { gradients } from '../../../theme/tokens';
import type { FlujoResumen } from '../../../types';

function Linea({ label, valor }: { label: string; valor: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
      <Box sx={{ opacity: 0.92 }}>{label}</Box>
      <Box sx={{ fontWeight: 600 }}>{valor}</Box>
    </Box>
  );
}

export function DisponibleHero({
  flujo,
  disponible,
  metasPorAportar = 0,
}: {
  flujo: FlujoResumen;
  /** Saldo actual = balance inicial + ingresos recibidos − gastos pagados. */
  disponible: number;
  metasPorAportar?: number;
}) {
  const { money } = useSettings();
  const gastosPagados =
    flujo.fijosActual + flujo.necesariosActual + flujo.deudasActual + flujo.ahorrosActual + flujo.situacionalesActual;

  // Proyección de fin de mes (dato secundario): saldo actual + lo que falta recibir − lo que falta pagar.
  const pend = (p: number, a: number) => Math.max(0, p - a);
  const porRecibir = pend(flujo.ingresosPresupuesto, flujo.ingresosActual);
  const porPagar =
    pend(flujo.fijosPresupuesto, flujo.fijosActual) +
    pend(flujo.necesariosPresupuesto, flujo.necesariosActual) +
    pend(flujo.deudasPresupuesto, flujo.deudasActual) +
    pend(flujo.ahorrosPresupuesto, flujo.ahorrosActual);
  const proyeccion = disponible + porRecibir - porPagar - metasPorAportar;

  return (
    <Card sx={{ background: gradients.accent, color: '#fff', p: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>
        Saldo actual
      </Box>
      <Box sx={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em', mt: 0.5 }}>
        {money(disponible)}
      </Box>
      <Box sx={{ fontSize: 12.5, opacity: 0.9, mb: 2 }}>
        lo que tienes ahora: ingresos recibidos − gastos pagados
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
        <Linea label="Balance inicial" valor={money(flujo.balanceInicial)} />
        <Linea label="+ Ingresos recibidos" valor={money(flujo.ingresosActual)} />
        <Linea label="− Gastos pagados" valor={money(gastosPagados)} />
      </Box>

      <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid rgba(255,255,255,.25)', display: 'flex', justifyContent: 'space-between', fontSize: 12.5, opacity: 0.95 }}>
        <Box>Proyección fin de mes</Box>
        <Box sx={{ fontWeight: 700 }}>{money(proyeccion)}</Box>
      </Box>
      <Box sx={{ fontSize: 11, opacity: 0.8, mt: 0.4 }}>
        si cobras lo que falta y pagas tus compromisos pendientes
      </Box>
    </Card>
  );
}
