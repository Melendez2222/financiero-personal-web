import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { movimientosApi } from '../movimientos.api';
import { qk } from '../queryKeys';
import type {
  ActualizarMovimientoRequest,
  CrearMovimientoRequest,
  FiltroMovimientos,
} from '../../types';

export function useMovimientos(filtro: FiltroMovimientos = {}) {
  return useQuery({
    queryKey: qk.movimientos(filtro),
    queryFn: () => movimientosApi.list(filtro),
  });
}

/** Invalida todo lo que depende de los movimientos (listas, resumen del mes, dashboard, metas). */
function invalidarDerivados(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['movimientos'] });
  qc.invalidateQueries({ queryKey: ['periodos'] });
  qc.invalidateQueries({ queryKey: ['dashboard'] });
  qc.invalidateQueries({ queryKey: ['metas'] });
  qc.invalidateQueries({ queryKey: ['deudas'] });
  qc.invalidateQueries({ queryKey: ['pendientes'] });
}

export function useCrearMovimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CrearMovimientoRequest) => movimientosApi.create(body),
    onSuccess: () => invalidarDerivados(qc),
  });
}

export function useActualizarMovimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ActualizarMovimientoRequest }) =>
      movimientosApi.update(id, body),
    onSuccess: () => invalidarDerivados(qc),
  });
}

export function useEliminarMovimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => movimientosApi.remove(id),
    onSuccess: () => invalidarDerivados(qc),
  });
}
