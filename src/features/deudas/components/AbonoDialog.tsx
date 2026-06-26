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
import { useActualizarMovimiento, useCrearMovimiento } from '../../../api/hooks/useMovimientos';
import { useSettings } from '../../../context/SettingsContext';
import { colors } from '../../../theme/tokens';
import type { Deuda, Movimiento, Periodo } from '../../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  deuda: Deuda;
  periodo?: Periodo | null;
  /** Si se pasa, el diálogo edita/ve ese abono en vez de crear uno nuevo. */
  abono?: Movimiento | null;
  /** Solo lectura: muestra el detalle sin permitir cambios. */
  readOnly?: boolean;
}

export function AbonoDialog({ open, onClose, deuda, periodo, abono, readOnly = false }: Props) {
  const crear = useCrearMovimiento();
  const actualizar = useActualizarMovimiento();
  const { money } = useSettings();
  const tieneInteres = deuda.capitalPorCuota != null;
  const editando = !!abono && !readOnly;

  const capitalDefault = deuda.capitalPorCuota != null ? String(deuda.capitalPorCuota) : '';
  const [modo, setModo] = useState<'regular' | 'extra'>(
    abono ? (abono.esCuota === false ? 'extra' : 'regular') : 'regular',
  );
  const [monto, setMonto] = useState(
    abono ? String(abono.monto) : tieneInteres ? String(deuda.cuotaMensual) : '',
  );
  const [capital, setCapital] = useState(
    abono ? (abono.montoCapital != null ? String(abono.montoCapital) : '') : capitalDefault,
  );
  const [descripcion, setDescripcion] = useState(abono?.nota ?? '');
  const [fecha, setFecha] = useState(abono?.fecha ?? periodo?.fechaInicio ?? new Date().toISOString().slice(0, 10));

  const montoNum = Number(monto) || 0;
  // Capital que reduce la deuda: en cuota regular es el valor que el usuario ingresa para ESE mes
  // (la amortización lo cambia mes a mes); en abono extra (o deuda sin interés) es el monto completo.
  const capitalReduce =
    tieneInteres && modo === 'regular'
      ? Math.min(Math.max(0, Number(capital) || 0), montoNum)
      : montoNum;
  const interesMonto = Math.max(0, montoNum - capitalReduce);
  const valido = montoNum > 0 && !!fecha;
  const guardando = crear.isPending || actualizar.isPending;

  const cambiarModo = (m: 'regular' | 'extra') => {
    setModo(m);
    if (!abono) {
      setMonto(m === 'regular' ? String(deuda.cuotaMensual) : '');
      setCapital(m === 'regular' ? capitalDefault : '');
    }
  };

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!valido || readOnly) return;
    const datos = {
      categoriaId: deuda.id,
      tipo: 'Deuda' as const,
      fecha,
      monto: montoNum,
      // Solo deudas con interés guardan el desglose; el resto, null (todo baja el saldo).
      montoCapital: tieneInteres ? capitalReduce : null,
      // Cuota regular cuenta como cuota; abono extra a capital no.
      esCuota: modo === 'regular',
      nota: descripcion,
    };
    if (editando && abono) {
      await actualizar.mutateAsync({ id: abono.id, body: datos });
    } else if (periodo) {
      await crear.mutateAsync({ ...datos, periodoId: periodo.id });
    }
    onClose();
  };

  const titulo = readOnly ? 'Detalle del abono' : editando ? 'Editar abono' : 'Registrar abono';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
        {titulo}
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
              <FormControlLabel value="regular" control={<Radio size="small" />} label="Cuota regular" disabled={readOnly} />
              <FormControlLabel value="extra" control={<Radio size="small" />} label="Abono extra a capital" disabled={readOnly} />
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
              autoFocus={!readOnly}
              disabled={readOnly}
            />
            <TextField
              label="Fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              required
              disabled={readOnly}
            />
          </Box>

          {tieneInteres && modo === 'regular' && (
            <TextField
              label="Capital de esta cuota (S/)"
              type="number"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              size="small"
              fullWidth
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              helperText="Lo que de esta cuota baja la deuda (mira tu estado de cuenta); el resto es interés."
              disabled={readOnly}
            />
          )}

          <TextField
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            size="small"
            fullWidth
            placeholder="Ej. abono extra con gratificación"
            disabled={readOnly}
          />

          {tieneInteres && montoNum > 0 && (
            <Box sx={{ fontSize: 13, color: colors.textSecondary }}>
              Capital: <strong>{money(capitalReduce)}</strong> · Interés:{' '}
              <strong>{money(interesMonto)}</strong>
            </Box>
          )}
          {!readOnly && deuda.saldoRestante != null && montoNum > 0 && (
            <Box sx={{ fontSize: 13, color: colors.textSecondary }}>
              La deuda quedaría en:{' '}
              <strong>{money(Math.max(0, deuda.saldoRestante - capitalReduce))}</strong>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          {readOnly ? (
            <Button onClick={onClose} variant="contained">
              Cerrar
            </Button>
          ) : (
            <>
              <Button onClick={onClose} color="inherit">
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={!valido || guardando}>
                {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Registrar abono'}
              </Button>
            </>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
}
