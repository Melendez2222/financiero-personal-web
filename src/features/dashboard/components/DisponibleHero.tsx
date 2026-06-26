import { Box, Card, LinearProgress } from '@mui/material';
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

export function DisponibleHero({ flujo, disponible }: { flujo: FlujoResumen; disponible: number }) {
  const { money } = useSettings();
  const usado = flujo.necesariosActual;
  const pct = disponible > 0 ? Math.min(100, (usado / disponible) * 100) : 0;
  // Mismo cálculo realista que el backend, para que el desglose cuadre con el número grande.
  const pend = (p: number, a: number) => Math.max(0, p - a);
  const tengoAhora =
    flujo.balanceInicial +
    flujo.ingresosActual -
    (flujo.fijosActual + flujo.necesariosActual + flujo.deudasActual + flujo.ahorrosActual + flujo.situacionalesActual);
  const fijosPorPagar = pend(flujo.fijosPresupuesto, flujo.fijosActual);
  const deudasPorPagar = pend(flujo.deudasPresupuesto, flujo.deudasActual);
  const ahorrosPorAportar = pend(flujo.ahorrosPresupuesto, flujo.ahorrosActual);

  return (
    <Card sx={{ background: gradients.accent, color: '#fff', p: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>
        ¿Cuánto puedes gastar?
      </Box>
      <Box sx={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em', mt: 0.5 }}>
        {money(disponible)}
      </Box>
      <Box sx={{ fontSize: 12.5, opacity: 0.9, mb: 2 }}>
        lo que te queda tras cubrir lo que aún debes pagar
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
        <Linea label="Tienes ahora" valor={money(tengoAhora)} />
        <Linea label="− Fijos por pagar" valor={money(fijosPorPagar)} />
        <Linea label="− Deudas por pagar" valor={money(deudasPorPagar)} />
        <Linea label="− Ahorros por aportar" valor={money(ahorrosPorAportar)} />
      </Box>

      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          mt: 2,
          height: 7,
          bgcolor: 'rgba(255,255,255,.28)',
          '& .MuiLinearProgress-bar': { bgcolor: '#fff' },
        }}
      />
      <Box sx={{ fontSize: 12, opacity: 0.9, mt: 1 }}>
        Has usado {money(usado)} en gastos variables
      </Box>
    </Card>
  );
}
