import { useState } from 'react';
import { Box, Button, IconButton, Switch } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { SectionCard } from '../../../components/ui/SectionCard';
import { MoneyText } from '../../../components/ui/MoneyText';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { CategoriaDialog } from './CategoriaDialog';
import { useEliminarCategoria, useToggleCategoriaActivo } from '../../../api/hooks/useCategorias';
import { colors, tipoColors } from '../../../theme/tokens';
import { TIPO_LABEL_PLURAL } from '../../../types/common';
import type { Categoria, Tipo } from '../../../types';

interface Props {
  tipo: Tipo;
  categorias: Categoria[];
}

export function CatalogoGrupo({ tipo, categorias }: Props) {
  const { main, soft } = tipoColors[tipo];
  const toggle = useToggleCategoriaActivo();
  const eliminar = useEliminarCategoria();

  const [dialogo, setDialogo] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [aEliminar, setAEliminar] = useState<Categoria | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const subtitulo = tipo === 'Ahorro' ? 'aporte mensual' : 'presupuesto mensual';

  return (
    <SectionCard
      title={TIPO_LABEL_PLURAL[tipo]}
      accent={main}
      subtitle={`${categorias.length} ${categorias.length === 1 ? 'ítem' : 'ítems'}`}
      action={
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditando(null);
            setDialogo(true);
          }}
          sx={{ bgcolor: soft, color: main, '&:hover': { bgcolor: soft }, fontSize: 12.5 }}
        >
          Agregar
        </Button>
      }
      flush
    >
      <Box sx={{ px: 1.5, py: 0.5 }}>
        {categorias.length === 0 && <EmptyState>Sin categorías. Agrega la primera.</EmptyState>}

        {categorias.map((c) => (
          <Box
            key={c.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              px: 1,
              py: 1.1,
              borderTop: `1px solid ${colors.borderSoft}`,
              '&:hover .acciones': { opacity: 1 },
            }}
          >
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2.5,
                bgcolor: soft,
                display: 'grid',
                placeItems: 'center',
                fontSize: 17,
                flexShrink: 0,
              }}
            >
              {c.emoji ?? '•'}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ fontSize: 14, fontWeight: 600, opacity: c.activo ? 1 : 0.5 }}>{c.nombre}</Box>
              <Box sx={{ fontSize: 11.5, color: colors.textTertiary }}>
                {c.fechaVencimiento ? `Vence día ${c.fechaVencimiento} · ${subtitulo}` : subtitulo}
              </Box>
            </Box>
            <Box sx={{ fontSize: 13.5, fontWeight: 700, color: main, mr: 0.5 }}>
              <MoneyText value={c.presupuesto} color={main} />
            </Box>
            <Switch
              size="small"
              checked={c.activo}
              onChange={(e) => toggle.mutate({ id: c.id, activo: e.target.checked })}
            />
            <Box className="acciones" sx={{ display: 'flex', gap: 0.25, opacity: { xs: 1, md: 0 }, transition: 'opacity .15s' }}>
              <IconButton
                size="small"
                onClick={() => {
                  setEditando(c);
                  setDialogo(true);
                }}
                sx={{ color: colors.textTertiary }}
              >
                <EditIcon sx={{ fontSize: 17 }} />
              </IconButton>
              <IconButton size="small" onClick={() => setAEliminar(c)} sx={{ color: colors.negative }}>
                <DeleteIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>

      {dialogo && (
        <CategoriaDialog open={dialogo} onClose={() => setDialogo(false)} tipo={tipo} categoria={editando} />
      )}

      <ConfirmDialog
        open={!!aEliminar}
        title="Eliminar categoría"
        message={
          errorEliminar ??
          `¿Eliminar "${aEliminar?.nombre}"? Si tiene movimientos no se podrá borrar; mejor desactívala.`
        }
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
    </SectionCard>
  );
}
