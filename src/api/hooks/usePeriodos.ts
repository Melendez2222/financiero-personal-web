import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { periodosApi } from '../periodos.api';
import { qk } from '../queryKeys';
import type { ActualizarPeriodoRequest, CrearPeriodoRequest } from '../../types';

export function usePeriodos() {
  return useQuery({ queryKey: qk.periodos, queryFn: periodosApi.list });
}

export function usePeriodo(id: string | undefined) {
  return useQuery({
    queryKey: qk.periodo(id ?? ''),
    queryFn: () => periodosApi.get(id as string),
    enabled: !!id,
  });
}

export function useResumenPeriodo(id: string | undefined, usuarioId?: string) {
  return useQuery({
    queryKey: qk.resumen(id ?? '', usuarioId),
    queryFn: () => periodosApi.resumen(id as string, usuarioId),
    enabled: !!id,
  });
}

export function useCrearPeriodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CrearPeriodoRequest) => periodosApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['periodos'] }),
  });
}

export function useIniciarPeriodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => periodosApi.iniciar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['periodos'] }),
  });
}

export function useActualizarPeriodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ActualizarPeriodoRequest }) =>
      periodosApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['periodos'] }),
  });
}

export function useEliminarPeriodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => periodosApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['periodos'] }),
  });
}
