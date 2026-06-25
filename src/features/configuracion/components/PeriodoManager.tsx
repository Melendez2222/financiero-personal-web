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
  MenuItem,
  Switch,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { SectionCard } from '../../../components/ui/SectionCard';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { usePeriodoActivo } from '../../../context/PeriodoContext';
import { useCrearPeriodo, useEliminarPeriodo, useIniciarPeriodo } from '../../../api/hooks/usePeriodos';
import { MESES } from '../../../types/common';
import { colors } from '../../../theme/tokens';
import type { EstadoPeriodo, Periodo } from '../../../types';

const ESTADO_COLOR: Record<EstadoPeriodo, { fg: string; bg: string }> = {
  Borrador: { fg: colors.deuda, bg: colors.deudaSoft },
  Iniciado: { fg: colors.positive, bg: colors.positiveSoft },
  Cerrado: { fg: colors.textSecondary, bg: colors.canvas },
};

export function PeriodoManager() {
  const { periodos, setPeriodoId } = usePeriodoActivo();
  const crear = useCrearPeriodo();
  const iniciar = useIniciarPeriodo();
  const eliminar = useEliminarPeriodo();

  const [dialogo, setDialogo] = useState(false);
  const [anio, setAnio] = useState(2026);
  const [mes, setMes] = useState(7);
  const [heredar, setHeredar] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aEliminar, setAEliminar] = useState<Periodo | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const crearMes = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const nuevo = await crear.mutateAsync({ anio, mes, heredarBalance: heredar });
      setPeriodoId(nuevo.id);
      setDialogo(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudo crear el mes.';
      setError(msg);
    }
  };

  return (
    <SectionCard
      title="Meses"
      accent={colors.ahorro}
      subtitle="Cada mes hereda las categorías activas"
      action={
        <Button size="small" startIcon={<AddIcon />} variant="contained" onClick={() => setDialogo(true)}>
          Nuevo mes
        </Button>
      }
      flush
    >
      <Box sx={{ px: 2, py: 0.5 }}>
        {periodos.map((p) => {
          const col = ESTADO_COLOR[p.estado];
          return (
            <Box
              key={p.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                py: 1.1,
                borderTop: `1px solid ${colors.borderSoft}`,
              }}
            >
              <Box sx={{ flex: 1, fontSize: 14, fontWeight: 600 }}>
                {MESES[p.mes - 1]} {p.anio}
              </Box>
              <Box
                sx={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: col.fg,
                  bgcolor: col.bg,
                  px: 1.1,
                  py: 0.35,
                  borderRadius: 20,
                }}
              >
                {p.estado}
              </Box>
              {p.estado === 'Borrador' && (
                <Button size="small" onClick={() => iniciar.mutate(p.id)} disabled={iniciar.isPending}>
                  Iniciar
                </Button>
              )}
              <IconButton size="small" onClick={() => setAEliminar(p)} sx={{ color: colors.negative }}>
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          );
        })}
      </Box>

      <Dialog open={dialogo} onClose={() => setDialogo(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Nuevo mes</DialogTitle>
        <Box component="form" onSubmit={crearMes}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField select label="Mes" value={mes} onChange={(e) => setMes(Number(e.target.value))} size="small">
                {MESES.map((m, i) => (
                  <MenuItem key={m} value={i + 1}>
                    {m}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Año"
                type="number"
                value={anio}
                onChange={(e) => setAnio(Number(e.target.value))}
                size="small"
              />
            </Box>
            <FormControlLabel
              control={<Switch checked={heredar} onChange={(e) => setHeredar(e.target.checked)} />}
              label="Heredar balance del mes anterior"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: 13.5 } }}
            />
            {error && <Box sx={{ color: colors.negative, fontSize: 13 }}>{error}</Box>}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setDialogo(false)} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={crear.isPending}>
              Crear mes
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={!!aEliminar}
        title="Eliminar mes"
        message={
          errorEliminar ??
          `¿Eliminar "${aEliminar ? `${MESES[aEliminar.mes - 1]} ${aEliminar.anio}` : ''}"? Si tiene movimientos no se podrá borrar.`
        }
        loading={eliminar.isPending}
        onClose={() => {
          setAEliminar(null);
          setErrorEliminar(null);
        }}
        onConfirm={async () => {
          if (!aEliminar) return;
          try {
            await eliminar.mutateAsync(aEliminar.id);
            setAEliminar(null);
          } catch (err: unknown) {
            const msg =
              (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
              'No se pudo eliminar.';
            setErrorEliminar(msg);
          }
        }}
      />
    </SectionCard>
  );
}
