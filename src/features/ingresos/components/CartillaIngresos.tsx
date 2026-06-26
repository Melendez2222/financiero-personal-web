import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { Link as RouterLink } from 'react-router-dom';
import { useCategorias } from '../../../api/hooks/useCategorias';
import { useMovimientos, useCrearMovimiento } from '../../../api/hooks/useMovimientos';
import { useUsuarios } from '../../../api/hooks/useUsuarios';
import { usePeriodoActivo } from '../../../context/PeriodoContext';
import { MoneyText } from '../../../components/ui/MoneyText';
import { EmptyState } from '../../../components/ui/EmptyState';
import { colors, radii } from '../../../theme/tokens';

/** Fecha de hoy acotada al periodo (yyyy-mm-dd); si hoy cae fuera, usa el inicio del mes. */
function fechaDestino(fechaInicio: string, fechaFin: string): string {
  const hoy = new Date().toISOString().slice(0, 10);
  return hoy >= fechaInicio && hoy <= fechaFin ? hoy : fechaInicio;
}

/**
 * Registro rápido de ingresos fijos por MODAL. Un botón "Registrar ingreso" abre un diálogo con una
 * tarjeta por ingreso fijo ACTIVO que aún NO se ha registrado este mes; la tarjeta entera es la
 * superficie seleccionable (sin checkbox ni botón). Un único "Guardar" crea un movimiento por cada
 * tarjeta seleccionada, atribuido a la persona por defecto de la categoría.
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
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [guardando, setGuardando] = useState(false);

  // Categorías con al menos un movimiento de ingreso este mes (ya registradas → se ocultan).
  const yaRegistradas = useMemo(() => {
    const s = new Set<string>();
    for (const m of movimientos) if (m.categoriaId) s.add(m.categoriaId);
    return s;
  }, [movimientos]);

  // Opciones del modal: ingresos activos que aún no se registraron este mes.
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

  const alternar = (id: string) =>
    setSel((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const cerrar = () => {
    setOpen(false);
    setSel(new Set());
  };

  const seleccionadas = opciones.filter((c) => sel.has(c.id));
  const totalMonto = seleccionadas.reduce((sum, c) => sum + c.presupuesto, 0);

  const guardar = async () => {
    if (!periodoActivo || seleccionadas.length === 0) return;
    const fecha = fechaDestino(periodoActivo.fechaInicio, periodoActivo.fechaFin);
    setGuardando(true);
    try {
      await Promise.all(
        seleccionadas.map((c) =>
          crear.mutateAsync({
            periodoId: periodoActivo.id,
            tipo: 'Ingreso' as const,
            categoriaId: c.id,
            monto: c.presupuesto,
            fecha,
            usuarioId: c.usuarioId ?? null,
            nota: '',
          }),
        ),
      );
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

      <Dialog open={open} onClose={cerrar} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
          Registrar ingreso
          <IconButton onClick={cerrar} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
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
                Toca los ingresos que recibiste este mes y guarda.
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {opciones.map((c) => {
                  const seleccionada = sel.has(c.id);
                  const persona = nombrePersona(c.usuarioId);
                  return (
                    <Box
                      key={c.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => alternar(c.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          alternar(c.id);
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
                      <MoneyText value={c.presupuesto} color={seleccionada ? colors.ingreso : colors.textSecondary} size={15} />
                    </Box>
                  );
                })}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between' }}>
          <Box sx={{ fontSize: 13, color: colors.textSecondary }}>
            {seleccionadas.length > 0 && (
              <>
                {seleccionadas.length} {seleccionadas.length === 1 ? 'ingreso' : 'ingresos'} ·{' '}
                <MoneyText value={totalMonto} color={colors.ingreso} weight={700} />
              </>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={cerrar} color="inherit">
              Cancelar
            </Button>
            <Button variant="contained" onClick={guardar} disabled={seleccionadas.length === 0 || guardando}>
              {guardando ? 'Guardando…' : 'Guardar'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
}
