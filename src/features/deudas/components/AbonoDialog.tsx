import { useState, type FormEvent } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
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
  const tieneInteres = deuda.capitalPorCuota != null;

  const [modo, setModo] = useState<'regular' | 'extra'>('regular');
  const [monto, setMonto] = useState(tieneInteres ? String(deuda.cuotaMensual) : '');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(periodo.fechaInicio);

  const montoNum = Number(monto) || 0;
  // Capital que reduce la deuda: en cuota regular es el fijo configurado (tope = monto);
  // en abono extra (o deuda sin interés) es el monto completo.
  const capitalReduce =
    tieneInteres && modo === 'regular'
      ? Math.min(montoNum, deuda.capitalPorCuota ?? montoNum)
      : montoNum;
  const interesMonto = Math.max(0, montoNum - capitalReduce);
  const valido = montoNum > 0 && !!fecha;

  const cambiarModo = (m: 'regular' | 'extra') => {
    setModo(m);
    setMonto(m === 'regular' ? String(deuda.cuotaMensual) : '');
  };

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!valido) return;
    await crear.mutateAsync({
      periodoId: periodo.id,
      categoriaId: deuda.id,
      tipo: 'Deuda',
      fecha,
      monto: montoNum,
      // Solo deudas con interés guardan el desglose; el resto, null (todo baja el saldo).
      montoCapital: tieneInteres ? capitalReduce : null,
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

          {tieneInteres && (
            <RadioGroup
              row
              value={modo}
              onChange={(e) => cambiarModo(e.target.value as 'regular' | 'extra')}
              sx={{ gap: 1, '& .MuiFormControlLabel-label': { fontSize: 13 } }}
            >
              <FormControlLabel value="regular" control={<Radio size="small" />} label="Cuota regular" />
              <FormControlLabel value="extra" control={<Radio size="small" />} label="Abono extra a capital" />
            </RadioGroup>
          )}

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

          {tieneInteres && montoNum > 0 && (
            <Box sx={{ fontSize: 13, color: colors.textSecondary }}>
              Capital: <strong>{money(capitalReduce)}</strong> · Interés:{' '}
              <strong>{money(interesMonto)}</strong>
            </Box>
          )}
          {deuda.saldoRestante != null && montoNum > 0 && (
            <Box sx={{ fontSize: 13, color: colors.textSecondary }}>
              La deuda bajaría a:{' '}
              <strong>{money(Math.max(0, deuda.saldoRestante - capitalReduce))}</strong>
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
