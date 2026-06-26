import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { useEliminarMovimiento } from '../../../api/hooks/useMovimientos';
import { MoneyText } from '../../../components/ui/MoneyText';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { AbonoDialog } from './AbonoDialog';
import { colors, tipoColors } from '../../../theme/tokens';
import type { Deuda, Movimiento, Periodo } from '../../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  deuda: Deuda;
  abonos: Movimiento[];
  periodo?: Periodo | null;
}

function fechaCorta(iso: string): string {
  const [, m, d] = iso.split('-');
  return d && m ? `${d}/${m}` : iso;
}

export function AbonosHistorialDialog({ open, onClose, deuda, abonos, periodo }: Props) {
  const eliminar = useEliminarMovimiento();
  const tieneInteres = deuda.capitalPorCuota != null;
  const c = tipoColors.Deuda;

  const [viendo, setViendo] = useState<Movimiento | null>(null);
  const [editando, setEditando] = useState<Movimiento | null>(null);
  const [aEliminar, setAEliminar] = useState<Movimiento | null>(null);

  const lista = useMemo(
    () => abonos.slice().sort((a, b) => (a.fecha < b.fecha ? 1 : -1)),
    [abonos],
  );

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
          <Box sx={{ minWidth: 0 }}>
            Abonos · {deuda.emoji} {deuda.nombre}
            <Box sx={{ fontSize: 12, fontWeight: 400, color: colors.textTertiary }}>
              {lista.length} {lista.length === 1 ? 'registro' : 'registros'}
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {lista.length === 0 ? (
            <EmptyState>Aún no hay abonos registrados.</EmptyState>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {lista.map((mv) => {
                const capital = mv.montoCapital ?? mv.monto;
                const interes = Math.max(0, mv.monto - capital);
                return (
                  <Box
                    key={mv.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      py: 1,
                      borderTop: `1px solid ${colors.borderSoft}`,
                    }}
                  >
                    <Box sx={{ width: 46, color: colors.textTertiary, fontSize: 12.5 }}>{fechaCorta(mv.fecha)}</Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        {tieneInteres && (
                          <Chip
                            label={mv.esCuota === false ? 'Extra' : 'Cuota'}
                            size="small"
                            sx={{ height: 18, fontSize: 10, fontWeight: 600, bgcolor: c.soft, color: c.main }}
                          />
                        )}
                        <Box sx={{ fontSize: 13, color: colors.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {mv.nota || '—'}
                        </Box>
                      </Box>
                      {tieneInteres && (
                        <Box sx={{ fontSize: 11.5, color: colors.textTertiary }}>
                          capital <MoneyText value={capital} size={11.5} weight={600} /> · interés{' '}
                          <MoneyText value={interes} size={11.5} weight={600} />
                        </Box>
                      )}
                    </Box>
                    <MoneyText value={mv.monto} weight={700} />
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="Ver detalle">
                        <IconButton size="small" onClick={() => setViendo(mv)} sx={{ color: colors.textTertiary }}>
                          <VisibilityIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => setEditando(mv)} sx={{ color: c.main }}>
                          <EditIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" onClick={() => setAEliminar(mv)} sx={{ color: colors.negative }}>
                          <DeleteIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {viendo && (
        <AbonoDialog open onClose={() => setViendo(null)} deuda={deuda} abono={viendo} readOnly />
      )}
      {editando && (
        <AbonoDialog open onClose={() => setEditando(null)} deuda={deuda} periodo={periodo} abono={editando} />
      )}

      <ConfirmDialog
        open={!!aEliminar}
        title="Eliminar abono"
        message="¿Seguro que quieres eliminar este abono? El capital recuperado se recalculará."
        loading={eliminar.isPending}
        onClose={() => setAEliminar(null)}
        onConfirm={async () => {
          if (aEliminar) await eliminar.mutateAsync(aEliminar.id);
          setAEliminar(null);
        }}
      />
    </>
  );
}
