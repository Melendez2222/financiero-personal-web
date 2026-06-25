import { Box, Card } from '@mui/material';
import { MoneyText } from '../../../components/ui/MoneyText';
import { colors, tipoColors } from '../../../theme/tokens';
import type { FlujoResumen as Flujo } from '../../../types';

const GRID = '1.6fr 1fr 1fr';

function Fila({ color, label, pres, actual }: { color: string; label: string; pres: number; actual: number }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: GRID, alignItems: 'center', gap: 1.5, py: 0.9 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 9, height: 9, borderRadius: '3px', bgcolor: color, flexShrink: 0 }} />
        <Box sx={{ fontSize: 13.5, fontWeight: 500 }}>{label}</Box>
      </Box>
      <Box sx={{ textAlign: 'right', fontSize: 13.5, color: colors.textSecondary }}>
        <MoneyText value={pres} weight={400} />
      </Box>
      <Box sx={{ textAlign: 'right', fontSize: 13.5 }}>
        <MoneyText value={actual} />
      </Box>
    </Box>
  );
}

export function FlujoResumen({ flujo, titulo }: { flujo: Flujo; titulo: string }) {
  return (
    <Card sx={{ p: 2.5 }}>
      <Box sx={{ fontSize: 16, fontWeight: 700, mb: 1.5 }}>Resumen de flujo · {titulo}</Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: GRID,
          gap: 1.5,
          pb: 0.75,
          borderBottom: `1px solid ${colors.borderLight}`,
        }}
      >
        <Box sx={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textTertiary }}>
          Concepto
        </Box>
        <Box sx={{ textAlign: 'right', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textTertiary }}>
          Presupuesto
        </Box>
        <Box sx={{ textAlign: 'right', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textTertiary }}>
          Actual
        </Box>
      </Box>

      <Fila color={tipoColors.Ingreso.main} label="Ingresos" pres={flujo.ingresosPresupuesto} actual={flujo.ingresosActual} />
      <Fila color={tipoColors.Fijo.main} label="Gastos fijos" pres={flujo.fijosPresupuesto} actual={flujo.fijosActual} />
      <Fila color={tipoColors.Necesario.main} label="Gastos necesarios" pres={flujo.necesariosPresupuesto} actual={flujo.necesariosActual} />
      <Fila color={tipoColors.Deuda.main} label="Deudas" pres={flujo.deudasPresupuesto} actual={flujo.deudasActual} />
      <Fila color={tipoColors.Ahorro.main} label="Ahorros" pres={flujo.ahorrosPresupuesto} actual={flujo.ahorrosActual} />

      {flujo.situacionalesActual > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: GRID, alignItems: 'center', gap: 1.5, py: 0.9 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 9, height: 9, borderRadius: '3px', bgcolor: tipoColors.Situacional.main, flexShrink: 0 }} />
            <Box sx={{ fontSize: 13.5, fontWeight: 500 }}>Situacionales</Box>
          </Box>
          <Box sx={{ textAlign: 'right', fontSize: 13.5, color: colors.textTertiary }}>—</Box>
          <Box sx={{ textAlign: 'right', fontSize: 13.5 }}>
            <MoneyText value={flujo.situacionalesActual} />
          </Box>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 1,
          pt: 1.25,
          borderTop: `2px solid ${colors.border}`,
        }}
      >
        <Box sx={{ fontSize: 14.5, fontWeight: 700 }}>Total restante</Box>
        <Box sx={{ fontSize: 15 }}>
          <MoneyText
            value={flujo.totalRestante}
            color={flujo.totalRestante >= 0 ? colors.positive : colors.negative}
          />
        </Box>
      </Box>
    </Card>
  );
}
