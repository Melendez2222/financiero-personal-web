import { Box, Card } from '@mui/material';
import { colors, tipoColors } from '../../../theme/tokens';

interface Punto {
  mes: string;
  ingresos: number;
  gastos: number;
}

function puntos(valores: number[], max: number, w: number, h: number): string {
  if (valores.length <= 1) return '';
  const step = w / (valores.length - 1);
  return valores
    .map((v, i) => `${(i * step).toFixed(1)},${(h - (max ? (v / max) * h : 0)).toFixed(1)}`)
    .join(' ');
}

function Leyenda({ color, label }: { color: string; label: string }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, fontSize: 12, color: colors.textSecondary }}>
      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
      {label}
    </Box>
  );
}

export function FlujoChart({ datos }: { datos: Punto[] }) {
  const W = 320;
  const H = 130;
  const max = Math.max(1, ...datos.flatMap((d) => [d.ingresos, d.gastos]));
  const ingresos = puntos(datos.map((d) => d.ingresos), max, W, H);
  const gastos = puntos(datos.map((d) => d.gastos), max, W, H);

  return (
    <Card sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Box sx={{ fontSize: 16, fontWeight: 700 }}>Flujo de dinero</Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Leyenda color={tipoColors.Ingreso.main} label="Ingresos" />
          <Leyenda color={colors.accent} label="Gastos" />
        </Box>
      </Box>
      <Box sx={{ fontSize: 12.5, color: colors.textTertiary, mb: 1.5 }}>Últimos meses</Box>

      <Box sx={{ width: '100%' }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 180 }}>
          {[0.25, 0.5, 0.75].map((g) => (
            <line key={g} x1={0} x2={W} y1={H * g} y2={H * g} stroke={colors.border} strokeWidth={1} />
          ))}
          <polyline points={ingresos} fill="none" stroke={tipoColors.Ingreso.main} strokeWidth={2.5} strokeLinejoin="round" />
          <polyline points={gastos} fill="none" stroke={colors.accent} strokeWidth={2.5} strokeLinejoin="round" />
        </svg>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          {datos.map((d) => (
            <Box key={d.mes} sx={{ fontSize: 11, color: colors.textTertiary }}>
              {d.mes}
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
}
