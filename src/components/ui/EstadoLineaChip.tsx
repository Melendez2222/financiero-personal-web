import { Box } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckIcon from '@mui/icons-material/Check';
import { useSettings } from '../../context/SettingsContext';
import { colors } from '../../theme/tokens';
import type { Tipo } from '../../types';
import { TIPOS_GASTO } from '../../types/common';

interface Props {
  tipo: Tipo;
  montoPresupuestado: number;
  actual: number;
  queda: number;
}

/**
 * Chip de estado de una línea del panel del mes.
 * - Gastos: queda>=0 = "Queda" (verde), queda<0 = "Excedido" (rojo).
 * - Ingresos/Ahorros: alcanzar/superar el plan = "Cumplido" (verde), si no "Falta".
 */
export function EstadoLineaChip({ tipo, montoPresupuestado, actual, queda }: Props) {
  const { money } = useSettings();
  const esGasto = (TIPOS_GASTO as readonly Tipo[]).includes(tipo);

  let label: string;
  let fg: string;
  let bg: string;
  let Icon = ArrowDownwardIcon;

  if (esGasto) {
    if (queda >= 0) {
      label = `Queda ${money(queda)}`;
      fg = colors.positive;
      bg = colors.positiveSoft;
      Icon = ArrowDownwardIcon;
    } else {
      label = `Excedido ${money(-queda)}`;
      fg = colors.negative;
      bg = colors.negativeSoft;
      Icon = ArrowUpwardIcon;
    }
  } else {
    if (actual >= montoPresupuestado && montoPresupuestado > 0) {
      label = 'Cumplido';
      fg = colors.positive;
      bg = colors.positiveSoft;
      Icon = CheckIcon;
    } else {
      label = `Falta ${money(Math.max(0, montoPresupuestado - actual))}`;
      fg = colors.deuda;
      bg = colors.deudaSoft;
      Icon = ArrowDownwardIcon;
    }
  }

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.4,
        bgcolor: bg,
        color: fg,
        fontSize: 11.5,
        fontWeight: 600,
        px: 1,
        py: 0.35,
        borderRadius: 20,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon sx={{ fontSize: 13 }} />
      {label}
    </Box>
  );
}
