import { Box, LinearProgress } from '@mui/material';
import { usePeriodoActivo } from '../../context/PeriodoContext';
import { useResumenPeriodo } from '../../api/hooks/usePeriodos';
import { useSettings } from '../../context/SettingsContext';
import { colors } from '../../theme/tokens';

/** Tarjeta compacta "Disponible este mes" para el pie del sidebar. */
export function DisponibleCard() {
  const { periodoId } = usePeriodoActivo();
  const { data: resumen } = useResumenPeriodo(periodoId);
  const { money } = useSettings();

  const disponible = resumen?.disponible ?? 0;
  const usado = resumen?.flujo.necesariosActual ?? 0;
  const pct = disponible > 0 ? Math.min(100, (usado / disponible) * 100) : 0;

  return (
    <Box
      sx={{
        m: 2,
        p: 2,
        borderRadius: 3,
        bgcolor: colors.canvas,
        border: `1px solid ${colors.border}`,
      }}
    >
      <Box sx={{ fontSize: 12, color: colors.textSecondary }}>Disponible este mes</Box>
      <Box sx={{ fontSize: 20, fontWeight: 700, color: colors.accent, mt: 0.25 }}>
        {money(disponible)}
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          mt: 1,
          height: 6,
          '& .MuiLinearProgress-bar': { bgcolor: colors.accent },
        }}
      />
      <Box sx={{ fontSize: 11, color: colors.textTertiary, mt: 0.75 }}>
        Has usado {money(usado)} en gastos variables
      </Box>
    </Box>
  );
}
