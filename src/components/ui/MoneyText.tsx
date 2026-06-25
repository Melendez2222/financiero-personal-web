import { Box } from '@mui/material';
import { useSettings } from '../../context/SettingsContext';

interface Props {
  value: number;
  /** Muestra signo explícito (+/−), p.ej. en el libro de movimientos. */
  signed?: boolean;
  /** Cuando signed: true=+, false=−. Por defecto se infiere del valor. */
  positivo?: boolean;
  color?: string;
  weight?: number;
  size?: number | string;
}

export function MoneyText({ value, signed, positivo, color, weight = 700, size }: Props) {
  const { money, signed: fmtSigned } = useSettings();
  const text = signed ? fmtSigned(value, positivo ?? value >= 0) : money(value);
  return (
    <Box
      component="span"
      sx={{ fontWeight: weight, color, fontSize: size, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
    >
      {text}
    </Box>
  );
}
