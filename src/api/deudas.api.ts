import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { Deuda } from '../types';

export const deudasApi = {
  list: () => apiClient.get<Deuda[]>(endpoints.deudas).then((r) => r.data),
};
