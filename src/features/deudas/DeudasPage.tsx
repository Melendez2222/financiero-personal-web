import { useMemo, useState } from 'react';
import { Box, Button, Card, IconButton, LinearProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { useDeudas } from '../../api/hooks/useDeudas';
import { useCategorias, useEliminarCategoria } from '../../api/hooks/useCategorias';
import { useMovimientos } from '../../api/hooks/useMovimientos';
import { usePeriodoActivo } from '../../context/PeriodoContext';
import { useSettings } from '../../context/SettingsContext';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { MoneyText } from '../../components/ui/MoneyText';
import { CategoriaDialog } from '../configuracion/components/CategoriaDialog';
import { AbonoDialog } from './components/AbonoDialog';
import { colors, tipoColors } from '../../theme/tokens';
import type { Categoria, Deuda, Movimiento } from '../../types';

function fechaCorta(iso: string): string {
  const [, m, d] = iso.split('-');
  return d && m ? `${d}/${m}` : iso;
}

export function DeudasPage() {
  const { data: deudas = [], isLoading } = useDeudas();
  const { data: cats = [] } = useCategorias('Deuda');
  const { data: movs = [] } = useMovimientos({ tipo: 'Deuda' });
  const { periodoActivo } = usePeriodoActivo();
  const { money } = useSettings();
  const eliminar = useEliminarCategoria();

  const [dialogo, setDialogo] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [abono, setAbono] = useState<Deuda | null>(null);
  const [aEliminar, setAEliminar] = useState<Deuda | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const catById = useMemo(() => new Map(cats.map((c) => [c.id, c])), [cats]);
  const movsPorCat = useMemo(() => {
    const map = new Map<string, Movimiento[]>();
    for (const mv of movs) {
      if (!mv.categoriaId) continue;
      const arr = map.get(mv.categoriaId) ?? [];
      arr.push(mv);
      map.set(mv.categoriaId, arr);
    }
    return map;
  }, [movs]);

  if (isLoading) return <Loading />;

  const totalSaldo = deudas.reduce((s, d) => s + (d.saldoRestante ?? 0), 0);
  const c = tipoColors.Deuda;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Box>
          <Box sx={{ fontSize: 12.5, color: colors.textSecondary }}>Total adeudado (saldo restante)</Box>
          <Box sx={{ fontSize: 24, fontWeight: 700, color: c.main }}>{money(totalSaldo)}</Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditando(null);
            setDialogo(true);
          }}
        >
          Nueva deuda
        </Button>
      </Box>

      {deudas.length === 0 ? (
        <EmptyState>Aún no tienes deudas. Crea la primera con “Nueva deuda”.</EmptyState>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {deudas.map((d) => {
            const abonosDeuda = (movsPorCat.get(d.id) ?? []).slice().sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
            return (
              <Card key={d.id} sx={{ p: 2.5, opacity: d.activo ? 1 : 0.6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: c.soft, display: 'grid', placeItems: 'center', fontSize: 18 }}>
                    {d.emoji ?? '💳'}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ fontSize: 15.5, fontWeight: 700 }}>{d.nombre}</Box>
                    <Box sx={{ fontSize: 12, color: colors.textTertiary }}>
                      Cuota {money(d.cuotaMensual)} /mes
                      {d.cuotasRestantes != null && ` · ${d.cuotasRestantes} cuotas`}
                    </Box>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => {
                      const cat = catById.get(d.id);
                      if (cat) {
                        setEditando(cat);
                        setDialogo(true);
                      }
                    }}
                    sx={{ color: colors.textTertiary }}
                  >
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => setAEliminar(d)} sx={{ color: colors.negative }}>
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>

                {d.montoTotal != null ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                      <Box sx={{ fontSize: 22, fontWeight: 700, color: c.main }}>
                        <MoneyText value={d.saldoRestante ?? 0} color={c.main} />
                      </Box>
                      <Box sx={{ fontSize: 12, color: colors.textTertiary }}>por pagar</Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={d.pct ?? 0}
                      sx={{ height: 8, '& .MuiLinearProgress-bar': { bgcolor: c.main } }}
                    />
                    <Box sx={{ fontSize: 12, color: colors.textTertiary, mt: 0.6 }}>
                      {d.capitalPorCuota != null ? 'Capital abonado' : 'Pagado'} {money(d.totalPagado)} de{' '}
                      {money(d.montoTotal)} ({d.pct ?? 0}%)
                    </Box>
                    {d.capitalPorCuota != null && (
                      <Box sx={{ fontSize: 12, color: colors.textTertiary }}>
                        Interés pagado: {money(d.totalInteres)} · capital/cuota {money(d.capitalPorCuota)}
                      </Box>
                    )}
                  </>
                ) : (
                  <Box sx={{ fontSize: 12.5, color: colors.textTertiary }}>
                    Pagado {money(d.totalPagado)} · agrega un “monto total” para ver el saldo.
                  </Box>
                )}

                <Box sx={{ mt: 1.5 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setAbono(d)}
                    disabled={!periodoActivo}
                    sx={{ borderColor: c.main, color: c.main }}
                  >
                    Registrar abono
                  </Button>
                </Box>

                {abonosDeuda.length > 0 && (
                  <Box sx={{ mt: 1.5, pt: 1, borderTop: `1px solid ${colors.borderSoft}` }}>
                    <Box sx={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textTertiary, mb: 0.5 }}>
                      Pagos / abonos
                    </Box>
                    {abonosDeuda.slice(0, 5).map((mv) => (
                      <Box key={mv.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.4, fontSize: 13 }}>
                        <Box sx={{ color: colors.textTertiary, width: 44 }}>{fechaCorta(mv.fecha)}</Box>
                        <Box sx={{ flex: 1, minWidth: 0, color: colors.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {mv.nota || '—'}
                        </Box>
                        <MoneyText value={mv.monto} weight={600} />
                      </Box>
                    ))}
                  </Box>
                )}
              </Card>
            );
          })}
        </Box>
      )}

      {dialogo && (
        <CategoriaDialog open={dialogo} onClose={() => setDialogo(false)} tipo="Deuda" categoria={editando} />
      )}

      {abono && periodoActivo && (
        <AbonoDialog open={!!abono} onClose={() => setAbono(null)} deuda={abono} periodo={periodoActivo} />
      )}

      <ConfirmDialog
        open={!!aEliminar}
        title="Eliminar deuda"
        message={errorEliminar ?? `¿Eliminar "${aEliminar?.nombre}"? Si tiene pagos registrados no se podrá borrar.`}
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
    </Box>
  );
}
