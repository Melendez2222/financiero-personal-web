import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { usePeriodoActivo } from '../../context/PeriodoContext';
import { useCategorias } from '../../api/hooks/useCategorias';
import { useEliminarMovimiento, useMovimientos } from '../../api/hooks/useMovimientos';
import { useMetas } from '../../api/hooks/useMetas';
import { useUsuarios } from '../../api/hooks/useUsuarios';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { FiltrosBar, type FiltrosValue } from './components/FiltrosBar';
import { MovimientoTable } from './components/MovimientoTable';
import { MovimientoDialog } from './components/MovimientoDialog';
import { DesglosePersona } from './components/DesglosePersona';
import type { Movimiento, Tipo } from '../../types';

interface Props {
  tiposPermitidos: Tipo[];
  mostrarTipo: boolean;
  textoNuevo: string;
  /** Si se provee, reemplaza el botón por defecto de "nuevo" (p.ej. el modal de registro rápido). */
  accionNueva?: ReactNode;
}

export function HistorialView({ tiposPermitidos, mostrarTipo, textoNuevo, accionNueva }: Props) {
  const { periodos, periodoActivo, periodoId } = usePeriodoActivo();
  const { data: categorias = [] } = useCategorias();
  const { data: metas = [] } = useMetas(periodoId ?? undefined);
  const { data: usuarios = [] } = useUsuarios();
  const eliminar = useEliminarMovimiento();

  // El filtro de mes arranca y sigue al selector global del header; el dropdown local permite
  // luego ver otro mes o "Todos los meses".
  const [filtros, setFiltros] = useState<FiltrosValue>({ mes: periodoId ?? '', tipo: 'Todos', categoria: '', q: '' });
  useEffect(() => {
    setFiltros((f) => ({ ...f, mes: periodoId ?? '' }));
  }, [periodoId]);
  const [dialogo, setDialogo] = useState(false);
  const [editando, setEditando] = useState<Movimiento | null>(null);
  const [aEliminar, setAEliminar] = useState<Movimiento | null>(null);

  const { data: movimientos = [], isLoading } = useMovimientos({
    periodoId: filtros.mes || undefined,
    categoriaId: filtros.categoria || undefined,
    q: filtros.q || undefined,
  });

  const categoriasDelModulo = useMemo(
    () => categorias.filter((c) => tiposPermitidos.includes(c.tipo)),
    [categorias, tiposPermitidos],
  );

  const lista = useMemo(
    () =>
      movimientos
        .filter((m) => tiposPermitidos.includes(m.tipo))
        .filter((m) => (filtros.tipo === 'Todos' ? true : m.tipo === filtros.tipo)),
    [movimientos, tiposPermitidos, filtros.tipo],
  );

  const total = useMemo(() => lista.reduce((s, m) => s + m.monto, 0), [lista]);

  const periodoDestino = periodos.find((p) => p.id === filtros.mes) ?? periodoActivo;

  const onChange = (patch: Partial<FiltrosValue>) => setFiltros((f) => ({ ...f, ...patch }));

  const abrirNuevo = () => {
    setEditando(null);
    setDialogo(true);
  };
  const abrirEditar = (m: Movimiento) => {
    setEditando(m);
    setDialogo(true);
  };

  if (!periodoActivo) {
    return <EmptyState>No hay meses todavía. Crea uno en Configuración.</EmptyState>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        {accionNueva ?? (
          <Button variant="contained" startIcon={<AddIcon />} onClick={abrirNuevo}>
            {textoNuevo}
          </Button>
        )}
      </Box>

      <FiltrosBar
        periodos={periodos}
        categorias={categoriasDelModulo}
        tiposPermitidos={tiposPermitidos}
        mostrarTipo={mostrarTipo}
        value={filtros}
        onChange={onChange}
        count={lista.length}
        total={total}
      />

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <DesglosePersona movimientos={lista} usuarios={usuarios} />
          <MovimientoTable
            movimientos={lista}
            categorias={categorias}
            usuarios={usuarios}
            metas={metas}
            onEdit={abrirEditar}
            onDelete={setAEliminar}
          />
        </>
      )}

      {dialogo && periodoDestino && (
        <MovimientoDialog
          open={dialogo}
          onClose={() => setDialogo(false)}
          periodo={periodoDestino}
          tiposPermitidos={tiposPermitidos}
          movimiento={editando}
        />
      )}

      <ConfirmDialog
        open={!!aEliminar}
        title="Eliminar movimiento"
        message="¿Seguro que quieres eliminar este movimiento? Esta acción no se puede deshacer."
        loading={eliminar.isPending}
        onClose={() => setAEliminar(null)}
        onConfirm={async () => {
          if (aEliminar) await eliminar.mutateAsync(aEliminar.id);
          setAEliminar(null);
        }}
      />
    </Box>
  );
}
