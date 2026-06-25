import { apiClient } from './client';
import { endpoints } from './endpoints';
import type { Usuario } from '../types';

export const usuariosApi = {
  list: () => apiClient.get<Usuario[]>(endpoints.usuarios).then((r) => r.data),
};
