import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { Link as RouterLink } from 'react-router-dom';
import { useCategorias } from '../../../api/hooks/useCategorias';
import { useMovimientos, useCrearMovimiento } from '../../../api/hooks/useMovimientos';
import { useUsuarios } from '../../../api/hooks/useUsuarios';
import { usePeriodoActivo } from '../../../context/PeriodoContext';
import { MoneyText } from '../../../components/ui/MoneyText';
import { EmptyState } from '../../../components/ui/EmptyState';
import { colors, radii } from '../../../theme/tokens';
import type { Categoria } from '../../../types';

/** Fecha de hoy acotada al periodo (yyyy-mm-dd); si hoy cae fuera, usa el inicio del mes. */
function fechaDestino(fechaInicio: string, fechaFin: string): string {
  const hoy = new Date().toISOString().slice(0, 10);
  return hoy >= fechaInicio && hoy <= fechaFin ? hoy : fechaInicio;
}

interface FijoSel {
  monto: string;
  nota: string;
}

interface ExtraFila {
  id: string;
  concepto: string;
  monto: string;
  usuarioId: string;
}

function nuevaFilaExtra(): ExtraFila {
  return { id: crypto.randomUUID(), concepto: '', monto: '', usuarioId: '' };
}

/**
 * Registro de ingresos por modal con pestañas:
 * - Fijos: tarjetas del catálogo con monto y nota ajustables (caso recibir menos).
 * - Extras: ingresos libres fuera del catálogo (concepto + monto + persona).
 */
export function CartillaIngresos() {
  const { periodoActivo } = usePeriodoActivo();
  const { data: categorias = [] } = useCategorias();
  const { data: usuarios = [] } = useUsuarios();
  const { data: movimientos = [] } = useMovimientos({
    periodoId: periodoActivo?.id,
    tipo: 'Ingreso',
  });
  const crear = useCrearMovimiento();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [fijosSel, setFijosSel] = useState<Record<string, FijoSel>>({});
  const [extras, setExtras] = useState<ExtraFila[]>([nuevaFilaExtra()]);
  const [guardando, setGuardando] = useState(false);

  const yaRegistradas = useMemo(() => {
    const s = new Set<string>();
    for (const m of movimientos) if (m.categoriaId) s.add(m.categoriaId);
    return s;
  }, [movimientos]);

  const opciones = useMemo(
    () =>
      categorias
        .filter((c) => c.tipo === 'Ingreso' && c.activo && !yaRegistradas.has(c.id))
        .sort((a, b) => a.orden - b.orden),
    [categorias, yaRegistradas],
  );

  const hayIngresosActivos = categorias.some((c) => c.tipo === 'Ingreso' && c.activo);

  const nombrePersona = (usuarioId?: string | null) =>
    usuarioId ? usuarios.find((u) => u.id === usuarioId)?.nombre : undefined;

  const alternarFijo = (c: Categoria) => {
    setFijosSel((prev) => {
      const next = { ...prev };
      if (next[c.id]) {
        delete next[c.id];
      } else {
        next[c.id] = { monto: String(c.presupuesto), nota: '' };
      }
      return next;
    });
  };

  const actualizarFijo = (id: string, campo: keyof FijoSel, valor: string) => {
    setFijosSel((prev) => ({
      ...prev,
      [id]: { ...prev[id], [campo]: valor },
    }));
  };

  const actualizarExtra = (id: string, campo: keyof Omit<ExtraFila, 'id'>, valor: string) => {
    setExtras((prev) => prev.map((f) => (f.id === id ? { ...f, [campo]: valor } : f)));
  };

  const agregarFilaExtra = () => setExtras((prev) => [...prev, nuevaFilaExtra()]);

  const quitarFilaExtra = (id: string) =>
    setExtras((prev) => (prev.length <= 1 ? prev : prev.filter((f) => f.id !== id)));

  const cerrar = () => {
    setOpen(false);
    setTab(0);
    setFijosSel({});
    setExtras([nuevaFilaExtra()]);
  };

  const fijosSeleccionados = opciones.filter((c) => fijosSel[c.id]);
  const extrasValidos = extras.filter((f) => f.concepto.trim() && Number(f.monto) > 0);

  const totalFijos = fijosSeleccionados.reduce(
    (sum, c) => sum + Number(fijosSel[c.id]?.monto || 0),
    0,
  );
  const totalExtras = extrasValidos.reduce((sum, f) => sum + Number(f.monto), 0);
  const totalMonto = totalFijos + totalExtras;
  const totalItems = fijosSeleccionados.length + extrasValidos.length;

  const fijosValidos = fijosSeleccionados.every((c) => Number(fijosSel[c.id]?.monto) > 0);
  const puedeGuardar = totalItems > 0 && fijosValidos;

  const guardar = async () => {
    if (!periodoActivo || !puedeGuardar) return;
    const fecha = fechaDestino(periodoActivo.fechaInicio, periodoActivo.fechaFin);
    setGuardando(true);
    try {
      const peticiones = [
        ...fijosSeleccionados.map((c) => {
          const sel = fijosSel[c.id];
          return crear.mutateAsync({
            periodoId: periodoActivo.id,
            tipo: 'Ingreso' as const,
            categoriaId: c.id,
            monto: Number(sel.monto),
            fecha,
            usuarioId: c.usuarioId ?? null,
            nota: sel.nota.trim(),
          });
        }),
        ...extrasValidos.map((f) =>
          crear.mutateAsync({
            periodoId: periodoActivo.id,
            tipo: 'Ingreso' as const,
            categoriaId: null,
            concepto: f.concepto.trim(),
            monto: Number(f.monto),
            fecha,
            usuarioId: f.usuarioId || null,
            nota: '',
          }),
        ),
      ];
      await Promise.all(peticiones);
      cerrar();
    } finally {
      setGuardando(false);
    }
  };

  if (!periodoActivo) return null;

  return (
    <>
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
        Registrar ingreso
      </Button>

      <Dialog open={open} onClose={cerrar} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
          Registrar ingreso
          <IconButton onClick={cerrar} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ px: 3, borderBottom: `1px solid ${colors.borderSoft}`, minHeight: 42 }}
        >
          <Tab label="Fijos" sx={{ minHeight: 42, textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Extras" sx={{ minHeight: 42, textTransform: 'none', fontWeight: 600 }} />
        </Tabs>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 2 }}>
          {tab === 0 && (
            <>
              {!hayIngresosActivos ? (
                <EmptyState>
                  No tienes ingresos fijos.{' '}
                  <Box
                    component={RouterLink}
                    to="/configuracion"
                    onClick={cerrar}
                    sx={{ color: colors.ingreso, fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Créalos en el catálogo →
                  </Box>
                </EmptyState>
              ) : opciones.length === 0 ? (
                <EmptyState>Ya registraste todos tus ingresos fijos de este mes. 🎉</EmptyState>
              ) : (
                <>
                  <Box sx={{ fontSize: 12.5, color: colors.textTertiary }}>
                    Selecciona los ingresos que recibiste. Puedes ajustar el monto si recibiste menos.
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {opciones.map((c) => {
                      const seleccionada = !!fijosSel[c.id];
                      const sel = fijosSel[c.id];
                      const persona = nombrePersona(c.usuarioId);
                      return (
                        <Box key={c.id}>
                          <Box
                            role="button"
                            tabIndex={0}
                            onClick={() => alternarFijo(c)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                alternarFijo(c);
                              }
                            }}
                            sx={{
                              cursor: 'pointer',
                              userSelect: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.25,
                              p: 1.5,
                              borderRadius: `${radii.input}px`,
                              border: `1.5px solid ${seleccionada ? colors.ingreso : colors.border}`,
                              bgcolor: seleccionada ? colors.ingresoSoft : colors.surface,
                              transition: 'border-color .12s, background-color .12s',
                              '&:hover': { borderColor: colors.ingreso },
                              '&:focus-visible': { outline: `2px solid ${colors.ingreso}`, outlineOffset: 2 },
                            }}
                          >
                            {c.emoji && <Box component="span" sx={{ fontSize: 20 }}>{c.emoji}</Box>}
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Box sx={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {c.nombre}
                              </Box>
                              <Box sx={{ fontSize: 11.5, color: colors.textTertiary }}>
                                {persona ?? 'Sin persona asignada'}
                                {c.fechaVencimiento ? ` · vence ${c.fechaVencimiento}` : ''}
                              </Box>
                            </Box>
                            <MoneyText
                              value={seleccionada ? Number(sel?.monto || 0) : c.presupuesto}
                              color={seleccionada ? colors.ingreso : colors.textSecondary}
                              size={15}
                            />
                          </Box>
                          {seleccionada && sel && (
                            <Box
                              sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1, pl: 0.5 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <TextField
                                label="Monto recibido (S/)"
                                type="number"
                                size="small"
                                value={sel.monto}
                                onChange={(e) => actualizarFijo(c.id, 'monto', e.target.value)}
                                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                                helperText={Number(sel.monto) < c.presupuesto ? 'Menos del planeado' : ' '}
                              />
                              <TextField
                                label="Nota (opcional)"
                                size="small"
                                value={sel.nota}
                                onChange={(e) => actualizarFijo(c.id, 'nota', e.target.value)}
                                placeholder="Ej. tardanza, falta"
                              />
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </>
              )}
            </>
          )}

          {tab === 1 && (
            <>
              <Box sx={{ fontSize: 12.5, color: colors.textTertiary }}>
                Ingresos puntuales fuera de tus ingresos fijos (bonos, ventas, etc.).
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {extras.map((f) => (
                  <Box
                    key={f.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 100px 120px 36px',
                      gap: 1,
                      alignItems: 'start',
                    }}
                  >
                    <TextField
                      label="Concepto"
                      size="small"
                      value={f.concepto}
                      onChange={(e) => actualizarExtra(f.id, 'concepto', e.target.value)}
                      placeholder="Ej. Bono, Venta"
                    />
                    <TextField
                      label="Monto"
                      type="number"
                      size="small"
                      value={f.monto}
                      onChange={(e) => actualizarExtra(f.id, 'monto', e.target.value)}
                      slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                    />
                    <TextField
                      select
                      label="Persona"
                      size="small"
                      value={f.usuarioId}
                      onChange={(e) => actualizarExtra(f.id, 'usuarioId', e.target.value)}
                    >
                      <MenuItem value="">—</MenuItem>
                      {usuarios.map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                          {u.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                    <IconButton
                      size="small"
                      onClick={() => quitarFilaExtra(f.id)}
                      disabled={extras.length <= 1}
                      sx={{ mt: 0.5, color: colors.textTertiary }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={agregarFilaExtra}
                sx={{ alignSelf: 'flex-start', color: colors.ingreso }}
              >
                Agregar otro
              </Button>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between' }}>
          <Box sx={{ fontSize: 13, color: colors.textSecondary }}>
            {totalItems > 0 && (
              <>
                {totalItems} {totalItems === 1 ? 'ingreso' : 'ingresos'} ·{' '}
                <MoneyText value={totalMonto} color={colors.ingreso} weight={700} />
              </>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={cerrar} color="inherit">
              Cancelar
            </Button>
            <Button variant="contained" onClick={guardar} disabled={!puedeGuardar || guardando}>
              {guardando ? 'Guardando…' : 'Guardar'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
}
