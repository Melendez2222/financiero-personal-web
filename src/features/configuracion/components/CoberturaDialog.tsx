import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useCategorias, useSetCobertura } from '../../../api/hooks/useCategorias';
import { MoneyText } from '../../../components/ui/MoneyText';
import { EmptyState } from '../../../components/ui/EmptyState';
import { colors, tipoColors } from '../../../theme/tokens';
import { COBERTURA_LABEL, COBERTURAS, TIPO_LABEL } from '../../../types/common';
import type { Categoria, CoberturaIngreso } from '../../../types';
import { categoriaDividida } from '../../../types/categoria';

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Una fila de gasto con un selector para asignarlo a una bolsa. */
function GastoRow({
  g,
  monto,
  onChange,
  bloqueado = false,
}: {
  g: Categoria;
  monto?: number;
  onChange: (id: string, value: string) => void;
  bloqueado?: boolean;
}) {
  const { main, soft } = tipoColors[g.tipo];
  const displayMonto = monto ?? g.presupuesto;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 0.85,
        borderTop: `1px solid ${colors.borderSoft}`,
      }}
    >
      <Box
        sx={{ width: 28, height: 28, borderRadius: 2, bgcolor: soft, display: 'grid', placeItems: 'center', fontSize: 15, flexShrink: 0 }}
      >
        {g.emoji ?? '•'}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ fontSize: 13.5, fontWeight: 600 }}>{g.nombre}</Box>
        <Box sx={{ fontSize: 11, color: colors.textTertiary }}>
          {TIPO_LABEL[g.tipo]}
          {bloqueado ? ' · dividido en catálogo' : ''}
        </Box>
      </Box>
      <Box sx={{ mr: 0.5 }}>
        <MoneyText value={displayMonto} color={main} size={13} />
      </Box>
      <TextField
        select
        size="small"
        value={bloqueado ? '' : (g.cobertura ?? '')}
        onChange={(e) => onChange(g.id, e.target.value)}
        disabled={bloqueado}
        sx={{ minWidth: 130, '& .MuiInputBase-input': { fontSize: 12.5, py: 0.6 } }}
      >
        <MenuItem value="">{bloqueado ? 'Dividido' : 'Sin asignar'}</MenuItem>
        {!bloqueado &&
          COBERTURAS.map((c) => (
            <MenuItem key={c} value={c}>
              {COBERTURA_LABEL[c]}
            </MenuItem>
          ))}
      </TextField>
    </Box>
  );
}

/** Sección de una bolsa con el resumen de cobertura (ingreso vs. gastos asignados). */
function BolsaSeccion({
  bolsa,
  ingreso,
  items,
  onChange,
}: {
  bolsa: CoberturaIngreso;
  ingreso: number;
  items: { g: Categoria; monto: number; bloqueado: boolean }[];
  onChange: (id: string, value: string) => void;
}) {
  const gastoTotal = items.reduce((a, i) => a + i.monto, 0);
  const balance = ingreso - gastoTotal;
  const alcanza = balance >= -0.005;

  return (
    <Box sx={{ border: `1px solid ${colors.border}`, borderRadius: 2.5, p: 1.5 }}>
      <Box sx={{ fontWeight: 700, fontSize: 14, mb: 0.5 }}>{COBERTURA_LABEL[bolsa]}</Box>
      <Box sx={{ fontSize: 12.5, color: colors.textSecondary }}>
        Cubre <MoneyText value={ingreso} color={colors.ingreso} size={12.5} /> de{' '}
        <MoneyText value={gastoTotal} color={colors.textPrimary} size={12.5} /> asignados
      </Box>
      <Box
        sx={{
          mt: 0.5,
          mb: 0.5,
          fontSize: 12,
          fontWeight: 600,
          color: alcanza ? colors.positive : colors.negative,
        }}
      >
        {alcanza ? '✓ Alcanza' : '⚠ Faltan'}{' '}
        <MoneyText
          value={Math.abs(balance)}
          color={alcanza ? colors.positive : colors.negative}
          size={12}
        />
        {alcanza ? ' de sobra' : ''}
      </Box>
      {items.length === 0 ? (
        <EmptyState>Sin gastos en esta bolsa.</EmptyState>
      ) : (
        items.map((i) => (
          <GastoRow
            key={`${i.g.id}-${bolsa}`}
            g={i.g}
            monto={i.monto}
            bloqueado={i.bloqueado}
            onChange={onChange}
          />
        ))
      )}
    </Box>
  );
}

function itemsBolsa(gastos: Categoria[], bolsa: CoberturaIngreso) {
  const items: { g: Categoria; monto: number; bloqueado: boolean }[] = [];
  for (const g of gastos) {
    if (categoriaDividida(g)) {
      const monto = bolsa === 'Quincena' ? g.montoQuincena! : g.montoFinDeMes!;
      items.push({ g, monto, bloqueado: true });
    } else if (g.cobertura === bolsa) {
      items.push({ g, monto: g.presupuesto, bloqueado: false });
    }
  }
  return items;
}

export function CoberturaDialog({ open, onClose }: Props) {
  const { data: categorias = [] } = useCategorias();
  const setCobertura = useSetCobertura();

  const activos = categorias.filter((c) => c.activo);
  const gastos = activos.filter((c) => c.tipo === 'Fijo' || c.tipo === 'Necesario');
  const ingresos = activos.filter((c) => c.tipo === 'Ingreso');

  const ingresoBolsa = (b: CoberturaIngreso) =>
    ingresos.filter((i) => i.cobertura === b).reduce((a, c) => a + c.presupuesto, 0);

  const sinAsignar = gastos.filter((g) => !categoriaDividida(g) && !g.cobertura);

  const cambiar = (id: string, value: string) =>
    setCobertura.mutate({ id, cobertura: (value || null) as CoberturaIngreso | null });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700 }}>
        Gestionar cobertura de gastos
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
        <Box sx={{ fontSize: 12.5, color: colors.textSecondary }}>
          Asigna cada gasto fijo o necesario a la quincena o al fin de mes, según con qué sueldo lo
          cubres. Los gastos divididos en el catálogo aparecen en ambas bolsas con su porción.
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          <BolsaSeccion
            bolsa="Quincena"
            ingreso={ingresoBolsa('Quincena')}
            items={itemsBolsa(gastos, 'Quincena')}
            onChange={cambiar}
          />
          <BolsaSeccion
            bolsa="FinDeMes"
            ingreso={ingresoBolsa('FinDeMes')}
            items={itemsBolsa(gastos, 'FinDeMes')}
            onChange={cambiar}
          />
        </Box>

        <Box sx={{ border: `1px dashed ${colors.borderStrong}`, borderRadius: 2.5, p: 1.5 }}>
          <Box sx={{ fontWeight: 700, fontSize: 14, mb: 0.5 }}>Sin asignar</Box>
          {sinAsignar.length === 0 ? (
            <EmptyState>Todos los gastos tienen bolsa. 🎉</EmptyState>
          ) : (
            sinAsignar.map((g) => <GastoRow key={g.id} g={g} onChange={cambiar} />)
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="contained">
          Listo
        </Button>
      </DialogActions>
    </Dialog>
  );
}
