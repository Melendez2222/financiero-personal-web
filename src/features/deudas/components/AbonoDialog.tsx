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
import { useCrearMovimiento } from '../../../api/hooks/useMovimientos';
import { useSettings } from '../../../context/SettingsContext';
import { colors } from '../../../theme/tokens';
import type { Deuda, Periodo } from '../../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  deuda: Deuda;
  periodo: Periodo;
}

export function AbonoDialog({ open, onClose, deuda, periodo }: Props) {
  const crear = useCrearMovimiento();
  const { money } = useSettings();
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(periodo.fechaInicio);

  const valido = Number(monto) > 0 && !!fecha;

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!valido) return;
    await crear.mutateAsync({
      periodoId: periodo.id,
      categoriaId: deuda.id,
      tipo: 'Deuda',
      fecha,
      monto: Number(monto),
      nota: descripcion,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
        Registrar abono
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={enviar}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Box sx={{ fontSize: 13, color: colors.textSecondary }}>
            {deuda.emoji} <strong>{deuda.nombre}</strong>
            {deuda.saldoRestante != null && <> · queda {money(deuda.saldoRestante)}</>}
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
            placeholder="Ej. abono extra con gratificación"
          />
          {deuda.saldoRestante != null && Number(monto) > 0 && (
            <Box sx={{ fontSize: 13, color: colors.textSecondary }}>
              Quedaría: <strong>{money(Math.max(0, deuda.saldoRestante - Number(monto)))}</strong>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={!valido || crear.isPending}>
            {crear.isPending ? 'Guardando…' : 'Registrar abono'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
