import { Box, Card } from '@mui/material';
import { useSettings } from '../../../context/SettingsContext';
import { EmptyState } from '../../../components/ui/EmptyState';
import { colors } from '../../../theme/tokens';
import type { DashboardData } from '../../../api/dashboard.api';

const PALETA = ['#E26D8A', '#7C83C9', '#3FA678', '#D69A2E', '#E07E54', '#C9577A', '#5C63A8', '#62B68F'];

export function DesgloseDonut({ desglose }: { desglose: DashboardData['desglose'] }) {
  const { money } = useSettings();
  const total = desglose.reduce((s, d) => s + d.monto, 0);

  let acc = 0;
  const stops = desglose.map((d, i) => {
    const from = acc;
    acc += d.pct;
    return `${PALETA[i % PALETA.length]} ${from}% ${acc}%`;
  });
  const gradiente = stops.length ? `conic-gradient(${stops.join(', ')})` : colors.border;

  return (
    <Card sx={{ p: 2.5 }}>
      <Box sx={{ fontSize: 16, fontWeight: 700, mb: 2 }}>Desglose por categoría</Box>
      {desglose.length === 0 ? (
        <EmptyState>Aún no hay gastos este mes.</EmptyState>
      ) : (
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ position: 'relative', width: 148, height: 148, flexShrink: 0 }}>
            <Box sx={{ width: '100%', height: '100%', borderRadius: '50%', background: gradiente }} />
            <Box
              sx={{
                position: 'absolute',
                inset: 38,
                bgcolor: colors.surface,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                textAlign: 'center',
              }}
            >
              <Box>
                <Box sx={{ fontSize: 11, color: colors.textTertiary }}>Total</Box>
                <Box sx={{ fontSize: 15, fontWeight: 700 }}>{money(total)}</Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, minWidth: 180, flex: 1 }}>
            {desglose.map((d, i) => (
              <Box key={d.categoria} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 11, height: 11, borderRadius: '3px', bgcolor: PALETA[i % PALETA.length], flexShrink: 0 }} />
                <Box sx={{ fontSize: 13.5, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {d.categoria}
                </Box>
                <Box sx={{ fontSize: 13.5, fontWeight: 700 }}>{money(d.monto)}</Box>
                <Box sx={{ fontSize: 12, color: colors.textTertiary, width: 38, textAlign: 'right' }}>{d.pct}%</Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Card>
  );
}
