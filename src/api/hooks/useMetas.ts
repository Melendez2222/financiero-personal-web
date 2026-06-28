import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { metasApi } from '../metas.api';
import { qk } from '../queryKeys';
import type { ActualizarMetaRequest, AporteMetaRequest, CrearMetaRequest } from '../../types';

export function useMetas(periodoId?: string) {
  return useQuery({
    queryKey: qk.metas(periodoId),
    queryFn: () => metasApi.list(periodoId),
  });
}

export function useAportes(metaId: string | undefined) {
  return useQuery({
    queryKey: ['aportes', metaId ?? ''],
    queryFn: () => metasApi.listAportes(metaId as string),
    enabled: !!metaId,
  });
}

function invalidar(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['metas'] });
  qc.invalidateQueries({ queryKey: ['periodos'] });
  qc.invalidateQueries({ queryKey: ['dashboard'] });
  qc.invalidateQueries({ queryKey: ['aportes'] });
}

export function useCrearMeta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CrearMetaRequest) => metasApi.create(body),
    onSuccess: () => invalidar(qc),
  });
}

export function useActualizarMeta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ActualizarMetaRequest }) =>
      metasApi.update(id, body),
    onSuccess: () => invalidar(qc),
  });
}

export function useToggleMetaActivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) => metasApi.setActivo(id, activo),
    onSuccess: () => invalidar(qc),
  });
}

export function useAportarMeta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AporteMetaRequest }) =>
      metasApi.aportar(id, body),
    onSuccess: () => invalidar(qc),
  });
}

export function useEliminarMeta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => metasApi.remove(id),
    onSuccess: () => invalidar(qc),
  });
}
