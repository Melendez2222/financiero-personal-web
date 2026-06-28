import { useState, type FormEvent } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useActualizarMeta, useCrearMeta } from '../../../api/hooks/useMetas';
import { colors } from '../../../theme/tokens';
import { ESTADOS_META } from '../../../types/common';
import type { EstadoMeta, MetaAhorro } from '../../../types';

const EMOJIS = ['📦', '🛏️', '🌙', '🛟', '✈️', '💻', '🏠', '🚗', '🎓', '💍', '🏖️', '🎁'];
const ESTADOS_INICIALES: EstadoMeta[] = ['NoIniciado', 'Pendiente', 'Iniciado'];
const estadoLabel = (es: EstadoMeta) => (es === 'NoIniciado' ? 'No iniciado' : es);

interface Props {
  open: boolean;
  onClose: () => void;
  /** Si viene, el diálogo edita esa meta; si no, crea una nueva. */
  meta?: MetaAhorro | null;
}

export function MetaDialog({ open, onClose, meta }: Props) {
  const editando = !!meta;
  const crear = useCrearMeta();
  const actualizar = useActualizarMeta();

  const [nombre, setNombre] = useState(meta?.nombre ?? '');
  const [emoji, setEmoji] = useState(meta?.emoji ?? '📦');
  const [sinMeta, setSinMeta] = useState(editando ? meta?.montoObjetivo == null : false);
  const [montoObjetivo, setMontoObjetivo] = useState(
    meta?.montoObjetivo != null ? String(meta.montoObjetivo) : '',
  );
  const [aporteMensual, setAporteMensual] = useState(meta ? String(meta.aporteMensual) : '');
  const [fechaLimite, setFechaLimite] = useState(meta?.fechaLimite ?? '');
  const [estado, setEstado] = useState<EstadoMeta>(meta?.estado ?? 'Iniciado');

  const opcionesEstado = editando ? ESTADOS_META : ESTADOS_INICIALES;
  const guardando = crear.isPending || actualizar.isPending;
  const valido = nombre.trim().length > 0 && (sinMeta || Number(montoObjetivo) > 0);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!valido) return;
    const body = {
      nombre: nombre.trim(),
      emoji,
      montoObjetivo: sinMeta ? null : Number(montoObjetivo),
      aporteMensual: Number(aporteMensual) || 0,
      fechaLimite: fechaLimite || null,
      estado,
    };
    if (editando && meta) {
      await actualizar.mutateAsync({ id: meta.id, body });
    } else {
      await crear.mutateAsync(body);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
        {editando ? 'Editar meta' : 'Nueva meta de ahorro'}
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={enviar}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Nombre de la meta"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Viaje a Cusco"
            size="small"
            fullWidth
            required
            autoFocus
          />

          <Box>
            <Box sx={{ fontSize: 12.5, color: colors.textSecondary, mb: 0.75 }}>Ícono</Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {EMOJIS.map((em) => (
                <Box
                  key={em}
                  component="button"
                  type="button"
                  onClick={() => setEmoji(em)}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2.5,
                    fontSize: 18,
                    cursor: 'pointer',
                    bgcolor: emoji === em ? colors.ahorroSoft : colors.canvas,
                    border: `2px solid ${emoji === em ? colors.ahorro : 'transparent'}`,
                  }}
                >
                  {em}
                </Box>
              ))}
            </Box>
          </Box>

          <FormControlLabel
            control={<Checkbox checked={sinMeta} onChange={(e) => setSinMeta(e.target.checked)} size="small" />}
            label="Es un ahorro sin meta fija (monto libre)"
            sx={{ '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Monto meta (S/)"
              type="number"
              value={sinMeta ? '' : montoObjetivo}
              onChange={(e) => setMontoObjetivo(e.target.value)}
              size="small"
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              disabled={sinMeta}
              required={!sinMeta}
              helperText={sinMeta ? 'Ahorro abierto' : undefined}
            />
            <TextField
              label="Aporte mensual (S/)"
              type="number"
              value={aporteMensual}
              onChange={(e) => setAporteMensual(e.target.value)}
              size="small"
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            />
          </Box>

          <TextField
            label="Fecha límite (opcional)"
            type="date"
            value={fechaLimite}
            onChange={(e) => setFechaLimite(e.target.value)}
            size="small"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            select
            label={editando ? 'Estado' : 'Estado inicial'}
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoMeta)}
            size="small"
            fullWidth
          >
            {opcionesEstado.map((es) => (
              <MenuItem key={es} value={es}>
                {estadoLabel(es)}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="secondary" disabled={!valido || guardando}>
            {guardando ? 'Guardando…' : editando ? 'Guardar' : 'Crear meta'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
