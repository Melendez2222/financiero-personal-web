import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { Guia } from '../types';

export const proyeccionApi = {
  get: (meses = 12) =>
    apiClient.get<Guia>(endpoints.proyeccion, { params: { meses } }).then((r) => r.data),
};
