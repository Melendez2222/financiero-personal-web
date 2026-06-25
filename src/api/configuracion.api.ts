import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { Configuracion } from '../types';

export const configuracionApi = {
  get: () => apiClient.get<Configuracion>(endpoints.configuracion).then((r) => r.data),
  update: (body: Configuracion) =>
    apiClient.put<Configuracion>(endpoints.configuracion, body).then((r) => r.data),
};
