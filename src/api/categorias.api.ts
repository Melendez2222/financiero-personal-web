import { apiClient } from './client';
import { endpoints } from './endpoints';
import type {
  ActualizarCategoriaRequest,
  Categoria,
  CoberturaIngreso,
  CrearCategoriaRequest,
  EstadoDeuda,
  Tipo,
} from '../types';

export const categoriasApi = {
  list: (tipo?: Tipo) =>
    apiClient
      .get<Categoria[]>(endpoints.categorias, { params: tipo ? { tipo } : undefined })
      .then((r) => r.data),
  get: (id: string) => apiClient.get<Categoria>(endpoints.categoria(id)).then((r) => r.data),
  create: (body: CrearCategoriaRequest) =>
    apiClient.post<Categoria>(endpoints.categorias, body).then((r) => r.data),
  update: (id: string, body: ActualizarCategoriaRequest) =>
    apiClient.put<Categoria>(endpoints.categoria(id), body).then((r) => r.data),
  setActivo: (id: string, activo: boolean) =>
    apiClient.patch<Categoria>(endpoints.categoriaActivo(id), { activo }).then((r) => r.data),
  setEstadoDeuda: (id: string, estadoDeuda: EstadoDeuda) =>
    apiClient
      .patch<Categoria>(endpoints.categoriaEstadoDeuda(id), { estadoDeuda })
      .then((r) => r.data),
  setCobertura: (id: string, cobertura: CoberturaIngreso | null) =>
    apiClient
      .patch<Categoria>(endpoints.categoriaCobertura(id), { cobertura })
      .then((r) => r.data),
  remove: (id: string) => apiClient.delete<void>(endpoints.categoria(id)).then((r) => r.data),
};
