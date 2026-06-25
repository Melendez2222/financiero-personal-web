import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriasApi } from '../categorias.api';
import { qk } from '../queryKeys';
import type { ActualizarCategoriaRequest, CrearCategoriaRequest, Tipo } from '../../types';

export function useCategorias(tipo?: Tipo) {
  return useQuery({
    queryKey: qk.categorias(tipo),
    queryFn: () => categoriasApi.list(tipo),
  });
}

export function useCrearCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CrearCategoriaRequest) => categoriasApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
  });
}

export function useActualizarCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ActualizarCategoriaRequest }) =>
      categoriasApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categorias'] });
      qc.invalidateQueries({ queryKey: ['periodos'] });
    },
  });
}

export function useToggleCategoriaActivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      categoriasApi.setActivo(id, activo),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
  });
}

export function useEliminarCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriasApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
  });
}
