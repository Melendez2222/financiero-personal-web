import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriasApi } from '../categorias.api';
import { qk } from '../queryKeys';
import type {
  ActualizarCategoriaRequest,
  CoberturaIngreso,
  CrearCategoriaRequest,
  EstadoDeuda,
  Tipo,
} from '../../types';

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

export function useSetEstadoDeuda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estadoDeuda }: { id: string; estadoDeuda: EstadoDeuda }) =>
      categoriasApi.setEstadoDeuda(id, estadoDeuda),
    onSuccess: () => {
      // El estado cambia lo que entra al panel del mes (resumen) y la lista de deudas.
      qc.invalidateQueries({ queryKey: ['categorias'] });
      qc.invalidateQueries({ queryKey: ['periodos'] });
      qc.invalidateQueries({ queryKey: ['deudas'] });
    },
  });
}

export function useSetCobertura() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cobertura }: { id: string; cobertura: CoberturaIngreso | null }) =>
      categoriasApi.setCobertura(id, cobertura),
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
