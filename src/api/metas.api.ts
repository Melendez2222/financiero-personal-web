import { apiClient } from './client';
import { endpoints } from './endpoints';
import type {
  ActualizarMetaRequest,
  AporteMeta,
  AporteMetaRequest,
  CrearMetaRequest,
  MetaAhorro,
} from '../types';

export const metasApi = {
  list: (periodoId?: string) =>
    apiClient
      .get<MetaAhorro[]>(endpoints.metas, { params: periodoId ? { periodoId } : undefined })
      .then((r) => r.data),
  create: (body: CrearMetaRequest) =>
    apiClient.post<MetaAhorro>(endpoints.metas, body).then((r) => r.data),
  update: (id: string, body: ActualizarMetaRequest) =>
    apiClient.put<MetaAhorro>(endpoints.meta(id), body).then((r) => r.data),
  setActivo: (id: string, activo: boolean) =>
    apiClient.patch<MetaAhorro>(endpoints.metaActivo(id), { activo }).then((r) => r.data),
  aportar: (id: string, body: AporteMetaRequest) =>
    apiClient.post<MetaAhorro>(endpoints.metaAportes(id), body).then((r) => r.data),
  listAportes: (id: string) =>
    apiClient.get<AporteMeta[]>(endpoints.metaAportes(id)).then((r) => r.data),
};

