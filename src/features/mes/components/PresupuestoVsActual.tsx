import { Box, Card } from '@mui/material';
import { MoneyText } from '../../../components/ui/MoneyText';
import { colors, tipoColors } from '../../../theme/tokens';
import type { SeccionResumen } from '../../../types';
import { TIPO_LABEL_PLURAL } from '../../../types/common';

function Barra({ seccion }: { seccion: SeccionResumen }) {
  const { main, soft } = tipoColors[seccion.tipo];
  const pres = seccion.totalPresupuestado;
  const actual = seccion.totalActual;
  const escala = Math.max(pres, actual, 1);
  const actualPct = Math.min(100, (actual / escala) * 100);
  const presPct = Math.min(100, (pres / escala) * 100);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6, fontSize: 13 }}>
        <Box sx={{ fontWeight: 500 }}>{TIPO_LABEL_PLURAL[seccion.tipo]}</Box>
        <Box sx={{ color: colors.textSecondary }}>
          <MoneyText value={actual} weight={700} /> <Box component="span" sx={{ color: colors.textTertiary }}>/ <MoneyText value={pres} weight={400} /></Box>
        </Box>
      </Box>
      <Box sx={{ position: 'relative', height: 10, borderRadius: 20, bgcolor: soft }}>
        <Box sx={{ position: 'absolute', inset: 0, width: `${actualPct}%`, bgcolor: main, borderRadius: 20 }} />
        <Box
          sx={{
            position: 'absolute',
            top: -2,
            bottom: -2,
            left: `calc(${presPct}% - 1px)`,
            width: 2,
            bgcolor: colors.textPrimary,
            opacity: 0.55,
            borderRadius: 2,
          }}
        />
      </Box>
    </Box>
  );
}

export function PresupuestoVsActual({ secciones }: { secciones: SeccionResumen[] }) {
  return (
    <Card sx={{ p: 2.5 }}>
      <Box sx={{ fontSize: 16, fontWeight: 700, mb: 2 }}>Presupuesto vs. actual</Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {secciones.map((s) => (
          <Barra key={s.tipo} seccion={s} />
        ))}
      </Box>
    </Card>
  );
}
