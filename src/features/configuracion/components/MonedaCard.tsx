import { useState } from 'react';
import { Box, Button, MenuItem, TextField } from '@mui/material';
import { SectionCard } from '../../../components/ui/SectionCard';
import { useSettings } from '../../../context/SettingsContext';
import { useActualizarConfiguracion } from '../../../api/hooks/useConfiguracion';
import { formatMoney } from '../../../lib/format';
import { colors } from '../../../theme/tokens';

export function MonedaCard() {
  const { config } = useSettings();
  const guardar = useActualizarConfiguracion();

  const [simbolo, setSimbolo] = useState(config.simbolo);
  const [locale, setLocale] = useState(config.locale);
  const [decimales, setDecimales] = useState(config.decimales);

  const previo = { ...config, simbolo, locale, decimales };

  const onGuardar = () => {
    guardar.mutate({ moneda: config.moneda, simbolo, locale, decimales });
  };

  return (
    <SectionCard title="Moneda y formato" accent={colors.ingreso}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5 }}>
          <TextField label="Símbolo" value={simbolo} onChange={(e) => setSimbolo(e.target.value)} size="small" />
          <TextField label="Locale" value={locale} onChange={(e) => setLocale(e.target.value)} size="small" />
          <TextField
            select
            label="Decimales"
            value={decimales}
            onChange={(e) => setDecimales(Number(e.target.value))}
            size="small"
          >
            <MenuItem value={0}>0</MenuItem>
            <MenuItem value={2}>2</MenuItem>
          </TextField>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: colors.canvas,
            borderRadius: 2,
            px: 2,
            py: 1.25,
          }}
        >
          <Box sx={{ fontSize: 12.5, color: colors.textSecondary }}>Vista previa</Box>
          <Box sx={{ fontSize: 16, fontWeight: 700 }}>{formatMoney(1234.5, previo)}</Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={onGuardar} disabled={guardar.isPending}>
            {guardar.isPending ? 'Guardando…' : 'Guardar formato'}
          </Button>
        </Box>
      </Box>
    </SectionCard>
  );
}
