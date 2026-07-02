import { useState } from 'react';
import { Box, Button, Chip, IconButton, Switch, ToggleButton, ToggleButtonGroup } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import TuneIcon from '@mui/icons-material/TuneOutlined';
import { SectionCard } from '../../../components/ui/SectionCard';
import { MoneyText } from '../../../components/ui/MoneyText';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { CategoriaDialog } from './CategoriaDialog';
import { CoberturaDialog } from './CoberturaDialog';
import { Tooltip } from '@mui/material';
import { useEliminarCategoria, useToggleCategoriaActivo } from '../../../api/hooks/useCategorias';
import { usePeriodoActivo } from '../../../context/PeriodoContext';
import { formatVigencia, vigenteEnMes } from '../../../lib/format';
import { colors, tipoColors } from '../../../theme/tokens';
import { COBERTURA_LABEL, TIPO_LABEL_PLURAL } from '../../../types/common';
import type { Categoria, Tipo } from '../../../types';

interface Props {
  tipo: Tipo;
  categorias: Categoria[];
}

export function CatalogoGrupo({ tipo, categorias }: Props) {
  const { main, soft } = tipoColors[tipo];
  const toggle = useToggleCategoriaActivo();
  const eliminar = useEliminarCategoria();
  const { periodoActivo } = usePeriodoActivo();

  const [dialogo, setDialogo] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [aEliminar, setAEliminar] = useState<Categoria | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);
  const [gestionar, setGestionar] = useState(false);
  // Filtro "Del mes / Todos" para los tipos con vigencia; gestión de cobertura solo fijos/necesarios.
  const usaVigencia =
    tipo === 'Fijo' || tipo === 'Necesario' || tipo === 'Ingreso' || tipo === 'Ahorro';
  const conCobertura = tipo === 'Fijo' || tipo === 'Necesario';
  const [verDelMes, setVerDelMes] = useState(true);

  const subtitulo = tipo === 'Ahorro' ? 'aporte mensual' : 'presupuesto mensual';
  // "Del mes" = activas y vigentes en el mes seleccionado del header (lo que aplica ese mes).
  const visibles =
    usaVigencia && verDelMes
      ? categorias.filter(
          (c) =>
            c.activo &&
            (!periodoActivo || vigenteEnMes(c.vigenciaDesde, c.vigenciaHasta, periodoActivo.anio, periodoActivo.mes)),
        )
      : categorias;

  return (
    <SectionCard
      title={TIPO_LABEL_PLURAL[tipo]}
      accent={main}
      subtitle={`${visibles.length} ${visibles.length === 1 ? 'ítem' : 'ítems'}`}
      action={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {usaVigencia && (
            <ToggleButtonGroup
              size="small"
              exclusive
              value={verDelMes ? 'delmes' : 'todos'}
              onChange={(_, v) => v !== null && setVerDelMes(v === 'delmes')}
              sx={{ '& .MuiToggleButton-root': { px: 1.25, py: 0.25, fontSize: 11.5, textTransform: 'none' } }}
            >
              <ToggleButton value="delmes">Del mes</ToggleButton>
              <ToggleButton value="todos">Todos</ToggleButton>
            </ToggleButtonGroup>
          )}
          {conCobertura && (
            <Tooltip title="Gestionar cobertura (quincena / fin de mes)">
              <IconButton size="small" onClick={() => setGestionar(true)} sx={{ color: main }}>
                <TuneIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
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
        </Box>
      }
      flush
    >
      <Box sx={{ px: 1.5, py: 0.5 }}>
        {visibles.length === 0 && (
          <EmptyState>
            {usaVigencia && verDelMes && categorias.length > 0
              ? 'Nada para este mes. Cambia a "Todos" para ver todo el catálogo.'
              : 'Sin categorías. Agrega la primera.'}
          </EmptyState>
        )}

        {visibles.map((c) => (
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
              {(c.cobertura || formatVigencia(c.vigenciaDesde, c.vigenciaHasta)) && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.4 }}>
                  {c.cobertura && (
                    <Chip
                      label={COBERTURA_LABEL[c.cobertura]}
                      size="small"
                      sx={{ height: 18, fontSize: 10.5, bgcolor: soft, color: main }}
                    />
                  )}
                  {formatVigencia(c.vigenciaDesde, c.vigenciaHasta) && (
                    <Chip
                      label={formatVigencia(c.vigenciaDesde, c.vigenciaHasta)}
                      size="small"
                      variant="outlined"
                      sx={{ height: 18, fontSize: 10.5, color: colors.textSecondary }}
                    />
                  )}
                </Box>
              )}
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

      {gestionar && <CoberturaDialog open={gestionar} onClose={() => setGestionar(false)} />}

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
