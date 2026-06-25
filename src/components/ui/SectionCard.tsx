import { Box, Card } from '@mui/material';
import type { ReactNode } from 'react';
import { colors } from '../../theme/tokens';

interface Props {
  title: ReactNode;
  /** Color del filete/acento izquierdo del encabezado. */
  accent?: string;
  subtitle?: ReactNode;
  rightLabel?: ReactNode;
  rightValue?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  /** Sin padding en el cuerpo (para tablas a borde completo). */
  flush?: boolean;
}

/** Tarjeta con encabezado (filete de acento + título + valor a la derecha) y cuerpo. */
export function SectionCard({ title, accent, subtitle, rightLabel, rightValue, action, children, flush }: Props) {
  return (
    <Card>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.4,
          px: 2.5,
          py: 1.75,
          borderBottom: `1px solid ${colors.borderLight}`,
        }}
      >
        {accent && (
          <Box sx={{ width: 10, height: 26, borderRadius: 1.5, bgcolor: accent, flexShrink: 0 }} />
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary, lineHeight: 1.2 }}>
            {title}
          </Box>
          {subtitle && <Box sx={{ fontSize: 11.5, color: colors.textTertiary }}>{subtitle}</Box>}
        </Box>
        {(rightLabel || rightValue) && (
          <Box sx={{ textAlign: 'right' }}>
            {rightLabel && <Box sx={{ fontSize: 11, color: colors.textTertiary }}>{rightLabel}</Box>}
            {rightValue && <Box sx={{ fontSize: 16, fontWeight: 700, color: accent }}>{rightValue}</Box>}
          </Box>
        )}
        {action}
      </Box>
      <Box sx={{ p: flush ? 0 : 2.5 }}>{children}</Box>
    </Card>
  );
}
