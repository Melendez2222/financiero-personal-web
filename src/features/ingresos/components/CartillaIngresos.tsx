import { useMemo, useState } from 'react';
import { Box, Button, IconButton } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCategorias } from '../../../api/hooks/useCategorias';
import { useMovimientos, useCrearMovimiento } from '../../../api/hooks/useMovimientos';
import { useUsuarios } from '../../../api/hooks/useUsuarios';
import { usePeriodoActivo } from '../../../context/PeriodoContext';
import { SectionCard } from '../../../components/ui/SectionCard';
import { MoneyText } from '../../../components/ui/MoneyText';
import { colors, radii } from '../../../theme/tokens';

/** Fecha de hoy acotada al periodo (yyyy-mm-dd); si hoy cae fuera, usa el inicio del mes. */
function fechaDestino(fechaInicio: string, fechaFin: string): string {
  const hoy = new Date().toISOString().slice(0, 10);
  return hoy >= fechaInicio && hoy <= fechaFin ? hoy : fechaInicio;
}

/**
 * Cartilla de registro rápido de ingresos fijos. Cada tarjeta es la superficie seleccionable
 * (sin checkbox ni botón por tarjeta): cada toque suma una ocurrencia (×1, ×2…) — útil porque una
 * quincena se cobra varias veces al mes —, y un único "Guardar" registra todo de una vez en el mes
 * activo, atribuido a la persona por defecto de cada categoría.
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

  const [sel, setSel] = useState<Record<string, number>>({});
  const [guardando, setGuardando] = useState(false);

  const ingresos = useMemo(
    () => categorias.filter((c) => c.tipo === 'Ingreso' && c.activo).sort((a, b) => a.orden - b.orden),
    [categorias],
  );

  const yaRegistrado = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const m of movimientos) {
      if (m.categoriaId) acc[m.categoriaId] = (acc[m.categoriaId] ?? 0) + 1;
    }
    return acc;
  }, [movimientos]);

  const nombrePersona = (usuarioId?: string | null) =>
    usuarioId ? usuarios.find((u) => u.id === usuarioId)?.nombre : undefined;

  const sumar = (id: string) => setSel((s) => ({ ...s, [id]: (s[id] ?? 0) + 1 }));
  const restar = (id: string) =>
    setSel((s) => {
      const n = (s[id] ?? 0) - 1;
      const next = { ...s };
      if (n <= 0) delete next[id];
      else next[id] = n;
      return next;
    });

  const totalCount = Object.values(sel).reduce((a, b) => a + b, 0);
  const totalMonto = ingresos.reduce((sum, c) => sum + (sel[c.id] ?? 0) * c.presupuesto, 0);

  const guardar = async () => {
    if (!periodoActivo || totalCount === 0) return;
    const fecha = fechaDestino(periodoActivo.fechaInicio, periodoActivo.fechaFin);
    setGuardando(true);
    try {
      const peticiones = ingresos.flatMap((c) =>
        Array.from({ length: sel[c.id] ?? 0 }, () =>
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
      await Promise.all(peticiones);
      setSel({});
    } finally {
      setGuardando(false);
    }
  };

  if (!periodoActivo || ingresos.length === 0) return null;

  return (
    <SectionCard
      title="Registro rápido de ingresos"
      subtitle="Toca un ingreso para registrarlo; tócalo de nuevo si lo recibiste más de una vez este mes."
      accent={colors.ingreso}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: 1.5,
          }}
        >
          {ingresos.map((c) => {
            const count = sel[c.id] ?? 0;
            const seleccionada = count > 0;
            const persona = nombrePersona(c.usuarioId);
            const previos = yaRegistrado[c.id] ?? 0;
            return (
              <Box
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => sumar(c.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    sumar(c.id);
                  }
                }}
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  userSelect: 'none',
                  p: 1.75,
                  borderRadius: `${radii.input}px`,
                  border: `1.5px solid ${seleccionada ? colors.ingreso : colors.border}`,
                  bgcolor: seleccionada ? colors.ingresoSoft : colors.surface,
                  transition: 'border-color .12s, background-color .12s',
                  '&:hover': { borderColor: colors.ingreso },
                  '&:focus-visible': { outline: `2px solid ${colors.ingreso}`, outlineOffset: 2 },
                }}
              >
                {seleccionada && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.25,
                    }}
                  >
                    <IconButton
                      size="small"
                      aria-label="Quitar uno"
                      onClick={(e) => {
                        e.stopPropagation();
                        restar(c.id);
                      }}
                      sx={{ width: 22, height: 22, bgcolor: colors.surface, border: `1px solid ${colors.ingreso}`, color: colors.ingreso, '&:hover': { bgcolor: colors.ingresoSoft } }}
                    >
                      <RemoveIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                    <Box
                      sx={{
                        minWidth: 26,
                        textAlign: 'center',
                        px: 0.5,
                        py: '1px',
                        borderRadius: `${radii.pill}px`,
                        bgcolor: colors.ingreso,
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      ×{count}
                    </Box>
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pr: seleccionada ? 6 : 0 }}>
                  {c.emoji && <Box component="span" sx={{ fontSize: 18 }}>{c.emoji}</Box>}
                  <Box
                    sx={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: colors.textPrimary,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {c.nombre}
                  </Box>
                </Box>

                <Box sx={{ mt: 0.75 }}>
                  <MoneyText value={c.presupuesto} color={colors.ingreso} size={16} />
                </Box>

                <Box sx={{ mt: 0.5, fontSize: 11.5, color: colors.textTertiary, minHeight: 16 }}>
                  {persona ? persona : 'Sin persona asignada'}
                  {c.fechaVencimiento ? ` · vence ${c.fechaVencimiento}` : ''}
                </Box>

                {previos > 0 && (
                  <Box sx={{ mt: 0.25, fontSize: 11, color: colors.ingreso, fontWeight: 600 }}>
                    Ya registrado ×{previos} este mes
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ fontSize: 13, color: colors.textSecondary }}>
            {totalCount === 0 ? (
              'Selecciona los ingresos recibidos este mes.'
            ) : (
              <>
                Vas a registrar <b>{totalCount}</b> {totalCount === 1 ? 'ingreso' : 'ingresos'} ·{' '}
                <MoneyText value={totalMonto} color={colors.ingreso} weight={700} />
              </>
            )}
          </Box>
          <Button
            variant="contained"
            onClick={guardar}
            disabled={totalCount === 0 || guardando}
          >
            {guardando ? 'Guardando…' : 'Guardar'}
          </Button>
        </Box>
      </Box>
    </SectionCard>
  );
}
