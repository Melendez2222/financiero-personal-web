import { useState, type FormEvent } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useCrearMeta } from '../../../api/hooks/useMetas';
import { colors } from '../../../theme/tokens';
import type { EstadoMeta } from '../../../types';

const EMOJIS = ['📦', '🛏️', '🌙', '🛟', '✈️', '💻', '🏠', '🚗', '🎓', '💍', '🏖️', '🎁'];
const ESTADOS_INICIALES: EstadoMeta[] = ['NoIniciado', 'Pendiente', 'Iniciado'];

export function MetaDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const crear = useCrearMeta();
  const [nombre, setNombre] = useState('');
  const [emoji, setEmoji] = useState('📦');
  const [montoObjetivo, setMontoObjetivo] = useState('');
  const [aporteMensual, setAporteMensual] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [estado, setEstado] = useState<EstadoMeta>('Iniciado');

  const valido = nombre.trim().length > 0 && Number(montoObjetivo) > 0;

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!valido) return;
    await crear.mutateAsync({
      nombre: nombre.trim(),
      emoji,
      montoObjetivo: Number(montoObjetivo),
      aporteMensual: Number(aporteMensual) || 0,
      fechaLimite: fechaLimite || null,
      estado,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
        Nueva meta de ahorro
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

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Monto meta (S/)"
              type="number"
              value={montoObjetivo}
              onChange={(e) => setMontoObjetivo(e.target.value)}
              size="small"
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              required
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
            label="Estado inicial"
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoMeta)}
            size="small"
            fullWidth
          >
            {ESTADOS_INICIALES.map((es) => (
              <MenuItem key={es} value={es}>
                {es === 'NoIniciado' ? 'No iniciado' : es}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="secondary" disabled={!valido || crear.isPending}>
            {crear.isPending ? 'Creando…' : 'Crear meta'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
