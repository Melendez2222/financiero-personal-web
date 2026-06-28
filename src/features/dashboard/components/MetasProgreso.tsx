import { Box, Card, LinearProgress } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useSettings } from '../../../context/SettingsContext';
import { EmptyState } from '../../../components/ui/EmptyState';
import { colors } from '../../../theme/tokens';
import type { DashboardData } from '../../../api/dashboard.api';

export function MetasProgreso({ metas }: { metas: DashboardData['metas'] }) {
  const { money } = useSettings();
  const visibles = metas.slice(0, 4);

  return (
    <Card sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ fontSize: 16, fontWeight: 700 }}>Progreso de metas</Box>
        <Box
          component={RouterLink}
          to="/ahorros"
          sx={{ fontSize: 12.5, color: colors.ahorro, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Ver todas →
        </Box>
      </Box>

      {visibles.length === 0 ? (
        <EmptyState>Aún no tienes metas.</EmptyState>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {visibles.map((m) => (
            <Box key={m.id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6, fontSize: 13.5 }}>
                <Box sx={{ fontWeight: 600 }}>{m.nombre}</Box>
                <Box sx={{ color: colors.textTertiary }}>{m.objetivo != null ? `${m.pct}%` : money(m.actual)}</Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={m.objetivo != null ? m.pct : 100}
                sx={{
                  height: 8,
                  ...(m.objetivo == null && { bgcolor: colors.ahorroSoft }),
                  '& .MuiLinearProgress-bar': { bgcolor: colors.ahorro },
                }}
              />
              <Box sx={{ fontSize: 12, color: colors.textTertiary, mt: 0.6 }}>
                {m.objetivo != null ? `${money(m.actual)} de ${money(m.objetivo)}` : 'Ahorro abierto'}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Card>
  );
}
