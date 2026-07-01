import { useMemo, useState, type FormEvent } from 'react';
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
import CloseIcon from '@mui/icons-material/Close';
import { Link as RouterLink } from 'react-router-dom';
import { useCategorias } from '../../../api/hooks/useCategorias';
import { useActualizarMovimiento, useCrearMovimiento } from '../../../api/hooks/useMovimientos';
import { useUsuarios } from '../../../api/hooks/useUsuarios';
import { useAuth } from '../../../context/AuthContext';
import { TIPO_LABEL } from '../../../types/common';
import { colors } from '../../../theme/tokens';
import type { Movimiento, Periodo, Tipo } from '../../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  periodo: Periodo;
  tiposPermitidos: Tipo[];
  movimiento?: Movimiento | null;
}

export function MovimientoDialog({ open, onClose, periodo, tiposPermitidos, movimiento }: Props) {
  const editando = !!movimiento;
  const { data: categorias = [] } = useCategorias();
  const { data: usuarios = [] } = useUsuarios();
  const { usuario } = useAuth();
  const crear = useCrearMovimiento();
  const actualizar = useActualizarMovimiento();

  const [tipo, setTipo] = useState<Tipo>(movimiento?.tipo ?? tiposPermitidos[0]);
  const [categoriaId, setCategoriaId] = useState(movimiento?.categoriaId ?? '');
  const [concepto, setConcepto] = useState(movimiento?.concepto ?? '');
  const [monto, setMonto] = useState(movimiento ? String(movimiento.monto) : '');
  const [fecha, setFecha] = useState(movimiento?.fecha ?? periodo.fechaInicio);
  const [nota, setNota] = useState(movimiento?.nota ?? '');
  const [usuarioId, setUsuarioId] = useState(movimiento?.usuarioId ?? usuario?.id ?? '');
  const esExtra = editando && movimiento?.tipo === 'Ingreso' && !movimiento.categoriaId;
  // Para ingresos: al elegir la categoría se auto-jala su presupuesto y el monto queda bloqueado;
  // este switch lo libera para registrar un monto distinto (ej. recibí menos). Al editar, libre.
  const [montoDiferente, setMontoDiferente] = useState(editando);

  const esSituacional = tipo === 'Situacional';
  const esIngreso = tipo === 'Ingreso';
  const esIngresoExtra = esIngreso && esExtra;
  const montoBloqueado = esIngreso && !montoDiferente && !esIngresoExtra;

  const categoriasDelTipo = useMemo(
    () => categorias.filter((c) => c.tipo === tipo).sort((a, b) => a.orden - b.orden),
    [categorias, tipo],
  );

  const seleccionarCategoria = (id: string) => {
    setCategoriaId(id);
    const cat = categorias.find((c) => c.id === id);
    if (esIngreso && !montoDiferente && cat) setMonto(String(cat.presupuesto));
    // Al crear, prefija la persona desde la categoría (respaldo: usuario en sesión).
    if (!editando && cat) setUsuarioId(cat.usuarioId ?? usuario?.id ?? '');
  };

  const cambiarMontoDiferente = (on: boolean) => {
    setMontoDiferente(on);
    if (!on) {
      // Volver al monto planeado de la categoría.
      const cat = categorias.find((c) => c.id === categoriaId);
      if (cat) setMonto(String(cat.presupuesto));
    }
  };

  const guardando = crear.isPending || actualizar.isPending;
  const valido = esSituacional || esIngresoExtra
    ? concepto.trim().length > 0 && Number(monto) > 0 && !!fecha
    : !!categoriaId && Number(monto) > 0 && !!fecha;

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!valido) return;
    const datos = {
      periodoId: periodo.id,
      tipo,
      fecha,
      monto: Number(monto),
      nota,
      categoriaId: esSituacional || esIngresoExtra ? null : categoriaId,
      concepto: esSituacional || esIngresoExtra ? concepto.trim() : null,
      usuarioId: usuarioId || null,
    };
    if (editando && movimiento) {
      await actualizar.mutateAsync({ id: movimiento.id, body: datos });
    } else {
      await crear.mutateAsync(datos);
    }
    onClose();
  };

  const cambiarTipo = (nuevo: Tipo) => {
    setTipo(nuevo);
    if (nuevo !== 'Situacional') {
      const sigueValida = categorias.some((c) => c.id === categoriaId && c.tipo === nuevo);
      if (!sigueValida) setCategoriaId('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
        {editando ? 'Editar movimiento' : 'Nuevo movimiento'}
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={enviar}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            select
            label="Tipo"
            value={tipo}
            onChange={(e) => cambiarTipo(e.target.value as Tipo)}
            size="small"
            fullWidth
            disabled={tiposPermitidos.length === 1}
          >
            {tiposPermitidos.map((t) => (
              <MenuItem key={t} value={t}>
                {TIPO_LABEL[t]}
              </MenuItem>
            ))}
          </TextField>

          {esSituacional || esIngresoExtra ? (
            <TextField
              label="Concepto"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              size="small"
              fullWidth
              required
              placeholder={esIngresoExtra ? 'Ej. Bono, Venta' : 'Ej. Reparación de laptop'}
              helperText={
                esIngresoExtra
                  ? 'Ingreso puntual fuera del catálogo.'
                  : 'Gasto imprevisto, sin categoría del catálogo.'
              }
            />
          ) : (
            <Box>
              <TextField
                select
                label="Categoría"
                value={categoriaId}
                onChange={(e) => seleccionarCategoria(e.target.value)}
                size="small"
                fullWidth
                helperText={categoriasDelTipo.length === 0 ? 'No hay categorías de este tipo.' : ' '}
              >
                {categoriasDelTipo.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.emoji ? `${c.emoji}  ` : ''}
                    {c.nombre}
                  </MenuItem>
                ))}
              </TextField>
              <Box
                component={RouterLink}
                to="/configuracion"
                onClick={onClose}
                sx={{ fontSize: 12, color: colors.ahorro, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Gestionar en Catálogo →
              </Box>
            </Box>
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
              disabled={montoBloqueado}
              helperText={montoBloqueado ? 'Monto planeado de la categoría.' : ' '}
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

          {esIngreso && !esIngresoExtra && (
            <FormControlLabel
              control={
                <Switch
                  checked={montoDiferente}
                  onChange={(e) => cambiarMontoDiferente(e.target.checked)}
                  size="small"
                />
              }
              label="Recibí un monto diferente al planeado"
              sx={{ mt: -1, '& .MuiFormControlLabel-label': { fontSize: 13 } }}
            />
          )}

          <TextField
            select
            label="Persona"
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value)}
            size="small"
            fullWidth
            helperText="A quién se atribuye este movimiento. Opcional."
          >
            <MenuItem value="">— sin asignar —</MenuItem>
            {usuarios.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.nombre}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={esIngreso && montoDiferente ? 'Motivo / nota' : 'Nota (opcional)'}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            size="small"
            fullWidth
            placeholder={esIngreso && montoDiferente ? 'Ej. recibí menos por tardanza' : undefined}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={!valido || guardando}>
            {guardando ? 'Guardando…' : 'Guardar movimiento'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
