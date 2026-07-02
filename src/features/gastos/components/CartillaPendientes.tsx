import { useMemo, useState } from 'react';
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
import PaymentsIcon from '@mui/icons-material/PaymentsOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { usePendientes } from '../../../api/hooks/usePendientes';
import { useCrearMovimiento } from '../../../api/hooks/useMovimientos';
import { MoneyText } from '../../../components/ui/MoneyText';
import { EmptyState } from '../../../components/ui/EmptyState';
import { colors, radii } from '../../../theme/tokens';
import { MESES_ABBR } from '../../../types/common';
import type { PendienteGasto } from '../../../types';

/** Fecha destino del pago: hoy si cae dentro del mes del pendiente; si no, el inicio de ese mes. */
function fechaDestino(fechaInicio: string, fechaFin: string): string {
  const hoy = new Date().toISOString().slice(0, 10);
  return hoy >= fechaInicio && hoy <= fechaFin ? hoy : fechaInicio;
}

/** Clave única del pendiente: mismo categoriaId puede repetirse por mes y por cobertura. */
const keyOf = (p: PendienteGasto) => `${p.periodoId}|${p.categoriaId}|${p.cobertura ?? ''}`;

/**
 * Cuentas por pagar cross-mes: lista todos los gastos pendientes (queda > 0) de todos los meses,
 * cada uno con un chip del mes al que corresponde. Al pagar, el movimiento se registra en el mes
 * de origen (lo salda → desaparece). Reutiliza el patrón de la cartilla de ingresos.
 */
export function CartillaPendientes() {
  const { data: pendientes = [] } = usePendientes();
  const crear = useCrearMovimiento();

  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<Record<string, string>>({}); // key -> monto (string)
  const [guardando, setGuardando] = useState(false);

  const hoy = new Date();
  const nowIndex = hoy.getFullYear() * 12 + hoy.getMonth();
  const esAtrasado = (p: PendienteGasto) => p.anio * 12 + (p.mes - 1) < nowIndex;

  const lista = useMemo(
    () =>
      [...pendientes].sort(
        (a, b) => a.anio - b.anio || a.mes - b.mes || a.nombre.localeCompare(b.nombre),
      ),
    [pendientes],
  );

  const toggle = (p: PendienteGasto) =>
    setSel((s) => {
      const k = keyOf(p);
      const next = { ...s };
      if (k in next) delete next[k];
      else next[k] = String(p.montoPendiente);
      return next;
    });

  const cambiarMonto = (p: PendienteGasto, v: string) =>
    setSel((s) => ({ ...s, [keyOf(p)]: v }));

  const seleccionados = lista.filter((p) => keyOf(p) in sel);
  const total = seleccionados.reduce((sum, p) => sum + (Number(sel[keyOf(p)]) || 0), 0);
  const valido = seleccionados.length > 0 && seleccionados.every((p) => Number(sel[keyOf(p)]) > 0);

  const cerrar = () => {
    setOpen(false);
    setSel({});
  };

  const guardar = async () => {
    if (!valido) return;
    setGuardando(true);
    try {
      await Promise.all(
        seleccionados.map((p) =>
          crear.mutateAsync({
            periodoId: p.periodoId,
            categoriaId: p.categoriaId,
            tipo: p.tipo,
            cobertura: p.cobertura ?? null,
            monto: Number(sel[keyOf(p)]),
            fecha: fechaDestino(p.fechaInicio, p.fechaFin),
            nota: '',
          }),
        ),
      );
      cerrar();
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <Button variant="outlined" startIcon={<PaymentsIcon />} onClick={() => setOpen(true)}>
        Pagar pendientes{pendientes.length > 0 ? ` (${pendientes.length})` : ''}
      </Button>

      <Dialog open={open} onClose={cerrar} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
          Pagar pendientes
          <IconButton onClick={cerrar} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
          {lista.length === 0 ? (
            <EmptyState>No tienes gastos pendientes por pagar. 🎉</EmptyState>
          ) : (
            <>
              <Box sx={{ fontSize: 12.5, color: colors.textTertiary }}>
                Selecciona lo que pagaste; cada uno se registra en su mes. Los atrasados van marcados.
              </Box>
              {lista.map((p) => {
                const k = keyOf(p);
                const seleccionada = k in sel;
                const atrasado = esAtrasado(p);
                return (
                  <Box
                    key={k}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggle(p)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggle(p);
                      }
                    }}
                    sx={{
                      cursor: 'pointer',
                      userSelect: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1.25,
                      borderRadius: `${radii.input}px`,
                      border: `1.5px solid ${seleccionada ? colors.deuda : colors.border}`,
                      bgcolor: seleccionada ? colors.deudaSoft : colors.surface,
                      transition: 'border-color .12s, background-color .12s',
                      '&:hover': { borderColor: colors.deuda },
                    }}
                  >
                    {p.emoji && <Box component="span" sx={{ fontSize: 18 }}>{p.emoji}</Box>}
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                        <Box sx={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.nombre}
                        </Box>
                        <Box
                          sx={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            px: 0.75,
                            py: '1px',
                            borderRadius: `${radii.pill}px`,
                            bgcolor: atrasado ? colors.deudaSoft : colors.canvas,
                            color: atrasado ? colors.deuda : colors.textSecondary,
                            border: atrasado ? `1px solid ${colors.deuda}` : 'none',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {MESES_ABBR[p.mes - 1]} {p.anio}
                          {atrasado ? ' · atrasado' : ''}
                        </Box>
                      </Box>
                    </Box>
                    {seleccionada ? (
                      <TextField
                        type="number"
                        size="small"
                        value={sel[k]}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => cambiarMonto(p, e.target.value)}
                        slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                        sx={{ width: 110 }}
                      />
                    ) : (
                      <MoneyText value={p.montoPendiente} weight={700} />
                    )}
                  </Box>
                );
              })}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: 'space-between' }}>
          <Box sx={{ fontSize: 13, color: colors.textSecondary }}>
            {seleccionados.length > 0 && (
              <>
                {seleccionados.length} {seleccionados.length === 1 ? 'pago' : 'pagos'} ·{' '}
                <MoneyText value={total} color={colors.deuda} weight={700} />
              </>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={cerrar} color="inherit">
              Cancelar
            </Button>
            <Button variant="contained" onClick={guardar} disabled={!valido || guardando}>
              {guardando ? 'Guardando…' : 'Registrar pagos'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
}
