import { Box } from '@mui/material';
import { SectionCard } from '../../../components/ui/SectionCard';
import { MoneyText } from '../../../components/ui/MoneyText';
import { EstadoLineaChip } from '../../../components/ui/EstadoLineaChip';
import { EmptyState } from '../../../components/ui/EmptyState';
import { colors, tipoColors } from '../../../theme/tokens';
import { TIPO_LABEL_PLURAL, COBERTURA_LABEL } from '../../../types/common';
import type { SeccionResumen } from '../../../types';

const COLS = '1.4fr 0.8fr 0.8fr 0.9fr 1.2fr';

interface Props {
  seccion: SeccionResumen;
  /** En modo "Pendiente", el encabezado muestra cuánto FALTA (Σ queda) en vez del actual. */
  modoPendiente?: boolean;
}

export function SeccionLineas({ seccion, modoPendiente = false }: Props) {
  const { main } = tipoColors[seccion.tipo];
  const totalFalta = seccion.lineas.reduce((a, l) => a + Math.max(0, l.queda), 0);

  return (
    <SectionCard
      title={TIPO_LABEL_PLURAL[seccion.tipo]}
      accent={main}
      rightLabel={modoPendiente ? 'Falta' : 'Actual'}
      rightValue={<MoneyText value={modoPendiente ? totalFalta : seccion.totalActual} color={main} />}
      flush
    >
      <Box sx={{ overflowX: 'auto' }}>
        <Box sx={{ minWidth: 460, px: 2.5, py: 1 }}>
          {/* Encabezado */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: COLS,
              gap: 1.25,
              py: 0.75,
              fontSize: 10.5,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: colors.textTertiary,
            }}
          >
            <Box>Concepto</Box>
            <Box sx={{ textAlign: 'right' }}>Presup.</Box>
            <Box sx={{ textAlign: 'right' }}>Actual</Box>
            <Box sx={{ textAlign: 'right' }}>Queda</Box>
            <Box sx={{ textAlign: 'right' }}>Estado</Box>
          </Box>

          {seccion.lineas.length === 0 && (
            <EmptyState>Aún sin movimientos registrados este mes.</EmptyState>
          )}

          {seccion.lineas.map((l) => (
            <Box
              key={`${l.categoriaId}-${l.cobertura ?? ''}`}
              sx={{
                display: 'grid',
                gridTemplateColumns: COLS,
                gap: 1.25,
                alignItems: 'center',
                py: 1.1,
                borderTop: `1px solid ${colors.borderSoft}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                {l.emoji && <Box component="span" sx={{ fontSize: 15 }}>{l.emoji}</Box>}
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {l.nombre}
                    {l.cobertura && (
                      <Box component="span" sx={{ fontWeight: 500, color: colors.textTertiary, ml: 0.5 }}>
                        · {COBERTURA_LABEL[l.cobertura]}
                      </Box>
                    )}
                  </Box>
                  {l.fechaVencimiento && (
                    <Box sx={{ fontSize: 11, color: colors.textDisabled }}>Vence {l.fechaVencimiento}</Box>
                  )}
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right', fontSize: 13.5, color: colors.textTertiary }}>
                <MoneyText value={l.montoPresupuestado} weight={400} />
              </Box>
              <Box sx={{ textAlign: 'right', fontSize: 13.5 }}>
                <MoneyText value={l.actual} />
              </Box>
              <Box sx={{ textAlign: 'right', fontSize: 13.5, color: colors.textSecondary }}>
                <MoneyText value={l.queda} weight={500} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <EstadoLineaChip
                  tipo={l.tipo}
                  montoPresupuestado={l.montoPresupuestado}
                  actual={l.actual}
                  queda={l.queda}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </SectionCard>
  );
}
