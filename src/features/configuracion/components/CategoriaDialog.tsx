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
  Switch,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useActualizarCategoria, useCrearCategoria } from '../../../api/hooks/useCategorias';
import { TIPO_LABEL_PLURAL } from '../../../types/common';
import type { Categoria, Tipo } from '../../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  tipo: Tipo;
  categoria?: Categoria | null;
}

function etiquetaPresupuesto(tipo: Tipo): string {
  if (tipo === 'Ingreso') return 'Monto presupuestado (S/)';
  if (tipo === 'Ahorro') return 'Aporte mensual (S/)';
  return 'Presupuesto mensual (S/)';
}

export function CategoriaDialog({ open, onClose, tipo, categoria }: Props) {
  const editando = !!categoria;
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();

  const [nombre, setNombre] = useState(categoria?.nombre ?? '');
  const [presupuesto, setPresupuesto] = useState(categoria ? String(categoria.presupuesto) : '');
  const [emoji, setEmoji] = useState(categoria?.emoji ?? '');
  const [fechaVencimiento, setFechaVencimiento] = useState(categoria?.fechaVencimiento ?? '');
  const [cuotasRestantes, setCuotasRestantes] = useState(
    categoria?.cuotasRestantes != null ? String(categoria.cuotasRestantes) : '',
  );
  const [montoTotal, setMontoTotal] = useState(
    categoria?.montoTotal != null ? String(categoria.montoTotal) : '',
  );
  const [tieneInteres, setTieneInteres] = useState(categoria?.capitalPorCuota != null);
  const [capitalPorCuota, setCapitalPorCuota] = useState(
    categoria?.capitalPorCuota != null ? String(categoria.capitalPorCuota) : '',
  );
  const [activo, setActivo] = useState(categoria?.activo ?? true);

  const guardando = crear.isPending || actualizar.isPending;
  const valido = nombre.trim().length > 0 && Number(presupuesto) >= 0;

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!valido) return;
    const base = {
      nombre: nombre.trim(),
      presupuesto: Number(presupuesto),
      emoji: emoji || undefined,
      fechaVencimiento: fechaVencimiento || undefined,
      cuotasRestantes: tipo === 'Deuda' && cuotasRestantes !== '' ? Number(cuotasRestantes) : null,
      montoTotal: tipo === 'Deuda' && montoTotal !== '' ? Number(montoTotal) : null,
      capitalPorCuota:
        tipo === 'Deuda' && tieneInteres && capitalPorCuota !== '' ? Number(capitalPorCuota) : null,
      activo,
    };
    if (editando && categoria) {
      await actualizar.mutateAsync({ id: categoria.id, body: base });
    } else {
      await crear.mutateAsync({ ...base, tipo });
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
        {editando ? 'Editar categoría' : `Agregar a ${TIPO_LABEL_PLURAL[tipo]}`}
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={enviar}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 2 }}>
            <TextField
              label="Ícono"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              size="small"
              placeholder="🏠"
              slotProps={{ htmlInput: { maxLength: 2, style: { textAlign: 'center', fontSize: 18 } } }}
            />
            <TextField
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              size="small"
              fullWidth
              required
              autoFocus
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label={etiquetaPresupuesto(tipo)}
              type="number"
              value={presupuesto}
              onChange={(e) => setPresupuesto(e.target.value)}
              size="small"
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              required
            />
            <TextField
              label="Día de vencimiento"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
              size="small"
              placeholder="15"
              slotProps={{ htmlInput: { maxLength: 2 } }}
            />
          </Box>

          {tipo === 'Deuda' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Monto total (S/)"
                type="number"
                value={montoTotal}
                onChange={(e) => setMontoTotal(e.target.value)}
                size="small"
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                helperText="Total de la deuda."
              />
              <TextField
                label="Cuotas restantes"
                type="number"
                value={cuotasRestantes}
                onChange={(e) => setCuotasRestantes(e.target.value)}
                size="small"
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
                helperText="Opcional."
              />
            </Box>
          )}

          {tipo === 'Deuda' && (
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tieneInteres}
                    onChange={(e) => setTieneInteres(e.target.checked)}
                    size="small"
                  />
                }
                label="Esta deuda tiene interés (cuota con parte fija a capital)"
                sx={{ '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
              />
              {tieneInteres && (
                <TextField
                  label="Capital por cuota (S/)"
                  type="number"
                  value={capitalPorCuota}
                  onChange={(e) => setCapitalPorCuota(e.target.value)}
                  size="small"
                  fullWidth
                  slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                  helperText="Valor referencial; lo podrás ajustar en cada abono."
                />
              )}
            </Box>
          )}

          <FormControlLabel
            control={<Switch checked={activo} onChange={(e) => setActivo(e.target.checked)} />}
            label="Activa (se aplica a los meses nuevos)"
            sx={{ '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={!valido || guardando}>
            {guardando ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
