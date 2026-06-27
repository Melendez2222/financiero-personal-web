import { Box, Card, Chip } from '@mui/material';
import { MoneyText } from '../../../components/ui/MoneyText';
import { colors } from '../../../theme/tokens';
import type { CoberturaIngreso } from '../../../types';

interface Props {
  fase: CoberturaIngreso;
  /** Ingreso que financia esta fase (lo que ya tienes para cubrirla). */
  ingreso: number;
  /** Etiqueta de ese ingreso, p.ej. "Sueldo de fin de mes (Julio)". */
  ingresoLabel: string;
  /** Total presupuestado de los gastos de esta fase. */
  gastos: number;
  /** Solo fase quincena: no existe mes anterior de donde sacar el sueldo. */
  sinMesAnterior?: boolean;
}

const FASE_LABEL: Record<CoberturaIngreso, string> = {
  Quincena: 'Fase quincena · días 1–15',
  FinDeMes: 'Fase fin de mes · días 16 a fin de mes',
};

export function FaseActualCard({ fase, ingreso, ingresoLabel, gastos, sinMesAnterior }: Props) {
  const saldo = ingreso - gastos;
  const alcanza = saldo >= -0.005;

  return (
    <Card sx={{ p: 2.5, borderLeft: `4px solid ${colors.accent}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Box sx={{ fontSize: 15.5, fontWeight: 700 }}>Toca cubrir ahora</Box>
        <Chip
          label={FASE_LABEL[fase]}
          size="small"
          sx={{ height: 22, fontSize: 11.5, fontWeight: 600, bgcolor: colors.negativeSoft, color: colors.accentDark }}
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mt: 1.5 }}>
        <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: colors.ingresoSoft }}>
          <Box sx={{ fontSize: 12, color: colors.textSecondary }}>{ingresoLabel}</Box>
          <Box sx={{ fontSize: 20, fontWeight: 700, color: colors.ingreso, mt: 0.25 }}>
            <MoneyText value={ingreso} color={colors.ingreso} />
          </Box>
        </Box>
        <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: colors.canvas }}>
          <Box sx={{ fontSize: 12, color: colors.textSecondary }}>Gastos de esta fase</Box>
          <Box sx={{ fontSize: 20, fontWeight: 700, mt: 0.25 }}>
            <MoneyText value={gastos} />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          mt: 1.25,
          fontSize: 13,
          fontWeight: 600,
          color: alcanza ? colors.positive : colors.negative,
        }}
      >
        {sinMesAnterior
          ? 'Sin datos del mes anterior para el sueldo de fin de mes.'
          : alcanza
            ? <>✓ Alcanza · sobra <MoneyText value={saldo} color={colors.positive} size={13} /></>
            : <>⚠ Faltan <MoneyText value={Math.abs(saldo)} color={colors.negative} size={13} /></>}
      </Box>
    </Card>
  );
}
