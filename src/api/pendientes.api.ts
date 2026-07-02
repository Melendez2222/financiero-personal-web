import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { PendienteGasto } from '../types';

export const pendientesApi = {
  list: () => apiClient.get<PendienteGasto[]>(endpoints.pendientes).then((r) => r.data),
};
