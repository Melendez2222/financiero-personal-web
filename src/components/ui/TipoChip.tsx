import { Box } from '@mui/material';
import type { Tipo } from '../../types';
import { TIPO_LABEL } from '../../types/common';
import { tipoColors } from '../../theme/tokens';

/** Chip de color por tipo de movimiento (Ingreso/Fijo/Necesario/Deuda/Ahorro). */
export function TipoChip({ tipo }: { tipo: Tipo }) {
  const { main, soft } = tipoColors[tipo];
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        bgcolor: soft,
        color: main,
        fontSize: 11.5,
        fontWeight: 600,
        px: 1.1,
        py: 0.35,
        borderRadius: 20,
        whiteSpace: 'nowrap',
      }}
    >
      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: main }} />
      {TIPO_LABEL[tipo]}
    </Box>
  );
}
