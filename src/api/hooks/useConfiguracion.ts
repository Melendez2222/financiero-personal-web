import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { configuracionApi } from '../configuracion.api';
import { qk } from '../queryKeys';
import type { Configuracion } from '../../types';

export function useConfiguracion() {
  return useQuery({ queryKey: qk.configuracion, queryFn: configuracionApi.get });
}

export function useActualizarConfiguracion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Configuracion) => configuracionApi.update(body),
    onSuccess: (data) => qc.setQueryData(qk.configuracion, data),
  });
}
