import { Box, Card, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { useMemo } from 'react';
import { MoneyText } from '../../../components/ui/MoneyText';
import { TipoChip } from '../../../components/ui/TipoChip';
import { EmptyState } from '../../../components/ui/EmptyState';
import { colors } from '../../../theme/tokens';
import type { Categoria, Movimiento, Usuario } from '../../../types';

const COLS = '78px 1.3fr 116px 108px 1.3fr 110px 70px';

function fechaCorta(iso: string): string {
  const [, m, d] = iso.split('-');
  return d && m ? `${d}/${m}` : iso;
}

/** Primer nombre, para mantener la columna compacta. */
function primerNombre(nombre: string): string {
  return nombre.split(' ')[0] || nombre;
}

interface Props {
  movimientos: Movimiento[];
  categorias: Categoria[];
  usuarios: Usuario[];
  onEdit: (m: Movimiento) => void;
  onDelete: (m: Movimiento) => void;
}

export function MovimientoTable({ movimientos, categorias, usuarios, onEdit, onDelete }: Props) {
  const nombrePorId = useMemo(() => {
    const map = new Map<string, string>();
    categorias.forEach((c) => map.set(c.id, c.nombre));
    return map;
  }, [categorias]);

  const usuarioPorId = useMemo(() => {
    const map = new Map<string, string>();
    usuarios.forEach((u) => map.set(u.id, primerNombre(u.nombre)));
    return map;
  }, [usuarios]);

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Box sx={{ minWidth: 780 }}>
          {/* Encabezado */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: COLS,
              gap: 1.75,
              px: 2.75,
              py: 1.75,
              bgcolor: '#FAFAFC',
              borderBottom: `1px solid ${colors.borderLight}`,
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: colors.textTertiary,
            }}
          >
            <Box>Fecha</Box>
            <Box>Categoría</Box>
            <Box>Tipo</Box>
            <Box>Persona</Box>
            <Box>Nota</Box>
            <Box sx={{ textAlign: 'right' }}>Monto</Box>
            <Box />
          </Box>

          {movimientos.length === 0 && (
            <EmptyState>No hay movimientos con estos filtros.</EmptyState>
          )}

          {movimientos.map((m) => {
            const esIngreso = m.tipo === 'Ingreso';
            return (
              <Box
                key={m.id}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: COLS,
                  gap: 1.75,
                  px: 2.75,
                  py: 1.6,
                  alignItems: 'center',
                  borderTop: `1px solid ${colors.borderSoft}`,
                  fontSize: 13.5,
                  '&:hover': { bgcolor: colors.canvas },
                  '&:hover .acciones': { opacity: 1 },
                }}
              >
                <Box sx={{ color: colors.textSecondary }}>{fechaCorta(m.fecha)}</Box>
                <Box sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.categoriaId ? (nombrePorId.get(m.categoriaId) ?? '—') : m.concepto || '—'}
                </Box>
                <Box>
                  <TipoChip tipo={m.tipo} />
                </Box>
                <Box sx={{ color: m.usuarioId ? colors.textSecondary : colors.textTertiary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.usuarioId ? (usuarioPorId.get(m.usuarioId) ?? '—') : '—'}
                </Box>
                <Box sx={{ color: colors.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.nota || '—'}
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <MoneyText value={m.monto} signed positivo={esIngreso} color={esIngreso ? colors.ingreso : colors.textPrimary} />
                </Box>
                <Box className="acciones" sx={{ display: 'flex', gap: 0.25, justifyContent: 'flex-end', opacity: { xs: 1, md: 0 }, transition: 'opacity .15s' }}>
                  <IconButton size="small" onClick={() => onEdit(m)} sx={{ color: colors.textTertiary }}>
                    <EditIcon sx={{ fontSize: 17 }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => onDelete(m)} sx={{ color: colors.negative }}>
                    <DeleteIcon sx={{ fontSize: 17 }} />
                  </IconButton>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Card>
  );
}
