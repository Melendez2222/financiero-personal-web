import { useState, type FormEvent } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAportarMeta } from '../../../api/hooks/useMetas';
import { usePeriodoActivo } from '../../../context/PeriodoContext';
import { useSettings } from '../../../context/SettingsContext';
import { colors } from '../../../theme/tokens';
import type { MetaAhorro } from '../../../types';

function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface Props {
  open: boolean;
  onClose: () => void;
  meta: MetaAhorro;
}

export function AporteDialog({ open, onClose, meta }: Props) {
  const aportar = useAportarMeta();
  const { periodoId } = usePeriodoActivo();
  const { money } = useSettings();
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(hoyISO());

  const falta = meta.montoObjetivo != null ? Math.max(0, meta.montoObjetivo - meta.montoAcumulado) : null;
  const valido = Number(monto) > 0 && !!fecha;

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!valido) return;
    await aportar.mutateAsync({
      id: meta.id,
      body: { monto: Number(monto), fecha, descripcion, periodoId },
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
        Aportar a la meta
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={enviar}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Box sx={{ fontSize: 13, color: colors.textSecondary }}>
            {meta.emoji} <strong>{meta.nombre}</strong>
            {falta != null ? ` · falta ${money(falta)}` : ' · ahorro abierto'}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Monto (S/)"
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              size="small"
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              required
              autoFocus
            />
            <TextField
              label="Fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              required
            />
          </Box>
          <TextField
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            size="small"
            fullWidth
            placeholder="Ej. aporte del sueldo / gratificación"
          />
          {Number(monto) > 0 && (
            <Box sx={{ fontSize: 13, color: colors.textSecondary }}>
              Nuevo acumulado: <strong>{money(meta.montoAcumulado + Number(monto))}</strong>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="secondary" disabled={!valido || aportar.isPending}>
            {aportar.isPending ? 'Guardando…' : 'Registrar aporte'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
