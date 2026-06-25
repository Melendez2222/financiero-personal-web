import { Box, Card } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type { SvgIconComponent } from '@mui/icons-material';
import { colors } from '../../theme/tokens';

interface Props {
  label: string;
  value: string;
  accent: string;
  soft: string;
  icon: SvgIconComponent;
  deltaPct?: number;
  /** true cuando subir es "malo" (gastos/deudas). */
  invertDelta?: boolean;
}

export function KpiCard({ label, value, accent, soft, icon: Icon, deltaPct, invertDelta }: Props) {
  const tieneDelta = typeof deltaPct === 'number' && Number.isFinite(deltaPct);
  const sube = (deltaPct ?? 0) >= 0;
  const esBueno = invertDelta ? !sube : sube;
  const chipFg = esBueno ? colors.positive : colors.negative;
  const chipBg = esBueno ? colors.positiveSoft : colors.negativeSoft;
  const DeltaIcon = sube ? ArrowUpwardIcon : ArrowDownwardIcon;

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <Box sx={{ height: 4, bgcolor: accent }} />
      <Box sx={{ p: 2.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2.5,
              bgcolor: soft,
              color: accent,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon sx={{ fontSize: 19 }} />
          </Box>
          {tieneDelta && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.3,
                bgcolor: chipBg,
                color: chipFg,
                fontSize: 12,
                fontWeight: 600,
                px: 1,
                py: 0.3,
                borderRadius: 20,
              }}
            >
              <DeltaIcon sx={{ fontSize: 13 }} />
              {Math.abs(deltaPct as number)}%
            </Box>
          )}
        </Box>
        <Box sx={{ mt: 1.5, fontSize: 13, color: colors.textSecondary }}>{label}</Box>
        <Box sx={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', color: colors.textPrimary }}>
          {value}
        </Box>
      </Box>
    </Card>
  );
}
