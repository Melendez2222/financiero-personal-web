import { Box, Card, InputAdornment, MenuItem, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { MoneyText } from '../../../components/ui/MoneyText';
import { MESES, TIPO_LABEL } from '../../../types/common';
import { colors } from '../../../theme/tokens';
import type { Categoria, Periodo, Tipo } from '../../../types';

export interface FiltrosValue {
  mes: string; // periodoId | ''
  tipo: Tipo | 'Todos';
  categoria: string; // categoriaId | ''
  q: string;
}

interface Props {
  periodos: Periodo[];
  categorias: Categoria[];
  tiposPermitidos: Tipo[];
  mostrarTipo: boolean;
  value: FiltrosValue;
  onChange: (patch: Partial<FiltrosValue>) => void;
  count: number;
  total: number;
}

const selectSx = { minWidth: 130 } as const;

export function FiltrosBar({
  periodos,
  categorias,
  tiposPermitidos,
  mostrarTipo,
  value,
  onChange,
  count,
  total,
}: Props) {
  return (
    <Card sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
      <Box sx={{ fontSize: 13, color: colors.textSecondary, fontWeight: 500 }}>Filtrar:</Box>

      <TextField
        select
        size="small"
        label="Mes"
        value={value.mes}
        onChange={(e) => onChange({ mes: e.target.value })}
        sx={selectSx}
      >
        <MenuItem value="">Todos los meses</MenuItem>
        {periodos.map((p) => (
          <MenuItem key={p.id} value={p.id}>
            {MESES[p.mes - 1]} {p.anio}
          </MenuItem>
        ))}
      </TextField>

      {mostrarTipo && (
        <TextField
          select
          size="small"
          label="Tipo"
          value={value.tipo}
          onChange={(e) => onChange({ tipo: e.target.value as Tipo | 'Todos' })}
          sx={selectSx}
        >
          <MenuItem value="Todos">Todos</MenuItem>
          {tiposPermitidos.map((t) => (
            <MenuItem key={t} value={t}>
              {TIPO_LABEL[t]}
            </MenuItem>
          ))}
        </TextField>
      )}

      <TextField
        select
        size="small"
        label="Categoría"
        value={value.categoria}
        onChange={(e) => onChange({ categoria: e.target.value })}
        sx={selectSx}
      >
        <MenuItem value="">Todas</MenuItem>
        {categorias.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.nombre}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        size="small"
        placeholder="Buscar en nota…"
        value={value.q}
        onChange={(e) => onChange({ q: e.target.value })}
        sx={{ minWidth: 160, flex: 1 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: colors.textTertiary }} />
              </InputAdornment>
            ),
          },
        }}
      />

      <Box sx={{ display: 'flex', gap: 2.5, ml: 'auto' }}>
        <Box sx={{ textAlign: 'right' }}>
          <Box sx={{ fontSize: 11, color: colors.textTertiary }}>Movimientos</Box>
          <Box sx={{ fontSize: 15, fontWeight: 700 }}>{count}</Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Box sx={{ fontSize: 11, color: colors.textTertiary }}>Total</Box>
          <Box sx={{ fontSize: 15, fontWeight: 700, color: colors.accent }}>
            <MoneyText value={total} />
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
